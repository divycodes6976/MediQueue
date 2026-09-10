export const ROLE_HOME = {
  doctor: "/doctor",
  reception: "/reception",
};

export const ROLE_LABEL = {
  doctor: "Doctor",
  reception: "Receptionist",
};

export function homeForRole(role) {
  return ROLE_HOME[role];
}

export function isAppRole(value) {
  return value === "doctor" || value === "reception";
}

export function canAccessPath(role, pathname) {
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) return role === "doctor";
  if (pathname === "/reception" || pathname.startsWith("/reception/")) return role === "reception";
  return true;
}

export function isPublicPath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/display" ||
    pathname.startsWith("/track")
  );
}

export function isStaffPath(pathname) {
  return (
    pathname === "/doctor" ||
    pathname.startsWith("/doctor/") ||
    pathname === "/reception" ||
    pathname.startsWith("/reception/")
  );
}

export function userFromApi(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = Number(raw.id ?? raw.userId);
  if (!Number.isInteger(id) || id <= 0 || !isAppRole(raw.role)) return null;
  return {
    id,
    role: raw.role,
    name: typeof raw.name === "string" ? raw.name : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
    department:
      typeof raw.department === "string" && raw.department.trim()
        ? raw.department.trim().toUpperCase()
        : null,
  };
}

const PROFILE_KEY = "mediqueue_staff_profile";
const SIGNED_OUT_KEY = "mediqueue_signed_out";

export function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return userFromApi(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredProfile(user) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
}

export function isSignedOut() {
  return localStorage.getItem(SIGNED_OUT_KEY) === "1";
}

export function setSignedOut(value) {
  if (value) localStorage.setItem(SIGNED_OUT_KEY, "1");
  else localStorage.removeItem(SIGNED_OUT_KEY);
}

export function mergeSessionUser(session, stored) {
  if (!session) return stored;
  if (!stored || stored.id !== session.id) return session;
  return {
    ...session,
    name: stored.name ?? session.name,
    email: stored.email ?? session.email,
    department: stored.department ?? session.department,
  };
}
