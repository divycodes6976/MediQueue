export type AppRole = "doctor" | "reception";

export type AuthUser = {
  id: number;
  role: AppRole;
  name?: string;
  email?: string;
  department?: string | null;
};

export const ROLE_HOME: Record<AppRole, string> = {
  doctor: "/doctor",
  reception: "/reception",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  doctor: "Doctor",
  reception: "Receptionist",
};

export function homeForRole(role: AppRole): string {
  return ROLE_HOME[role];
}

export function isAppRole(value: unknown): value is AppRole {
  return value === "doctor" || value === "reception";
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) return role === "doctor";
  if (pathname === "/reception" || pathname.startsWith("/reception/")) return role === "reception";
  return true;
}

export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/display" ||
    pathname.startsWith("/track")
  );
}

export function isStaffPath(pathname: string): boolean {
  return (
    pathname === "/doctor" ||
    pathname.startsWith("/doctor/") ||
    pathname === "/reception" ||
    pathname.startsWith("/reception/")
  );
}

export function userFromApi(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id ?? row.userId);
  if (!Number.isInteger(id) || id <= 0 || !isAppRole(row.role)) return null;
  return {
    id,
    role: row.role,
    name: typeof row.name === "string" ? row.name : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    department: typeof row.department === "string" && row.department.trim()
      ? row.department.trim().toUpperCase()
      : null,
  };
}

const PROFILE_KEY = "mediqueue_staff_profile";
const SIGNED_OUT_KEY = "mediqueue_signed_out";

export function readStoredProfile(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return userFromApi(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredProfile(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
}

export function isSignedOut(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIGNED_OUT_KEY) === "1";
}

export function setSignedOut(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) localStorage.setItem(SIGNED_OUT_KEY, "1");
  else localStorage.removeItem(SIGNED_OUT_KEY);
}

/** /auth/me only returns id + role from JWT. Overlay name/email/department from last signup/login. */
export function mergeSessionUser(session: AuthUser | null, stored: AuthUser | null): AuthUser | null {
  if (!session) return stored;
  if (!stored || stored.id !== session.id) return session;
  return {
    ...session,
    name: stored.name ?? session.name,
    email: stored.email ?? session.email,
    department: stored.department ?? session.department,
  };
}
