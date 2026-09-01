export type AppRole = "admin" | "doctor" | "reception";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  department: string | null;
};

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  doctor: "/doctor",
  reception: "/reception",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  reception: "Receptionist",
};

export function homeForRole(role: AppRole): string {
  return ROLE_HOME[role];
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return role === "admin";
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
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/doctor" ||
    pathname.startsWith("/doctor/") ||
    pathname === "/reception" ||
    pathname.startsWith("/reception/")
  );
}
