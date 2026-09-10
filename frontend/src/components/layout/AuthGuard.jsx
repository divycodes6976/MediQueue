import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessPath, homeForRole, isPublicPath, isStaffPath } from "@/lib/auth";

export function AuthGuard({ children }) {
  const { user, ready } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;

    if ((pathname === "/login" || pathname === "/signup") && user) {
      navigate(homeForRole(user.role), { replace: true });
      return;
    }

    if (isPublicPath(pathname)) return;

    if (isStaffPath(pathname) && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && isStaffPath(pathname) && !canAccessPath(user.role, pathname)) {
      navigate(homeForRole(user.role), { replace: true });
    }
  }, [ready, user, pathname, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader label="Loading…" />
      </div>
    );
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader label="Redirecting…" />
      </div>
    );
  }

  if (!isPublicPath(pathname) && isStaffPath(pathname) && !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader label="Redirecting…" />
      </div>
    );
  }

  if (user && isStaffPath(pathname) && !canAccessPath(user.role, pathname)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader label="Redirecting…" />
      </div>
    );
  }

  return children;
}
