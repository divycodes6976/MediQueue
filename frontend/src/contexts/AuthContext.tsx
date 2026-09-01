"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: AuthUser["role"];
    department?: string | null;
  }) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed.role || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = readStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const url = String(error?.config?.url ?? "");
        if (status === 401 && !url.includes("/auth/login")) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const persistSession = useCallback((tokenValue: string, userValue: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, tokenValue);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    });
    persistSession(data.token, data.user);
    return data.user;
  }, [persistSession]);

  const signup = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: AuthUser["role"];
      department?: string | null;
    }) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/signup", payload);
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({ user, token, ready, login, signup, logout }),
    [user, token, ready, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
