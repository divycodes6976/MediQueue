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
import { api } from "@/lib/api";
import {
  isAppRole,
  isSignedOut,
  mergeSessionUser,
  readStoredProfile,
  setSignedOut,
  userFromApi,
  writeStoredProfile,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
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

async function loadCookieUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<{ user?: unknown }>("/auth/me");
    return userFromApi(data.user);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const persistUser = useCallback((next: AuthUser) => {
    writeStoredProfile(next);
    setSignedOut(false);
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    setSignedOut(true);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isSignedOut()) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      const cookieUser = await loadCookieUser();
      const merged = mergeSessionUser(cookieUser, readStoredProfile());
      if (!cancelled) {
        if (merged) writeStoredProfile(merged);
        setUser(merged);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const url = String(error?.config?.url ?? "");
        if (
          status === 401 &&
          !url.includes("/auth/login") &&
          !url.includes("/auth/signup") &&
          !url.includes("/auth/me")
        ) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    await api.post("/auth/login", { email, password });
    const cookieUser = await loadCookieUser();
    const merged = mergeSessionUser(cookieUser, readStoredProfile());
    if (!merged) {
      throw new Error("Login succeeded but session could not be loaded");
    }
    persistUser({
      ...merged,
      email: merged.email ?? email.trim().toLowerCase(),
    });
    return {
      ...merged,
      email: merged.email ?? email.trim().toLowerCase(),
    };
  }, [persistUser]);

  const signup = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: AuthUser["role"];
      department?: string | null;
    }) => {
      if (!isAppRole(payload.role)) {
        throw new Error("Invalid role");
      }
      const { data } = await api.post<{ user?: unknown }>("/auth/signup", payload);
      const fromSignup = userFromApi(data.user);
      const cookieUser = await loadCookieUser();
      const sessionUser = mergeSessionUser(cookieUser, fromSignup) ?? fromSignup;
      if (!sessionUser) {
        throw new Error("Signup succeeded but session could not be loaded");
      }
      const nextUser: AuthUser = {
        ...sessionUser,
        name: fromSignup?.name ?? sessionUser.name ?? payload.name.trim(),
        email: fromSignup?.email ?? sessionUser.email ?? payload.email.trim().toLowerCase(),
        department:
          payload.role === "doctor"
            ? (payload.department ?? sessionUser.department ?? fromSignup?.department ?? null)
            : null,
      };
      persistUser(nextUser);
      return nextUser;
    },
    [persistUser]
  );

  const value = useMemo(
    () => ({ user, ready, login, signup, logout }),
    [user, ready, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
