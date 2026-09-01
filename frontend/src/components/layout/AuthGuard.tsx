"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessPath, homeForRole, isPublicPath, isStaffPath } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if ((pathname === "/login" || pathname === "/signup") && user) {
      router.replace(homeForRole(user.role));
      return;
    }

    if (isPublicPath(pathname)) return;

    if (isStaffPath(pathname) && !user) {
      router.replace("/login");
      return;
    }

    if (user && isStaffPath(pathname) && !canAccessPath(user.role, pathname)) {
      router.replace(homeForRole(user.role));
    }
  }, [ready, user, pathname, router]);

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

  return <>{children}</>;
}
