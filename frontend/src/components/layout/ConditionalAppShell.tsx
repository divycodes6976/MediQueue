"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "./AuthGuard";
import { DashboardLayout } from "./DashboardLayout";

export function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/display" ||
    pathname.startsWith("/track");

  return (
    <AuthGuard>
      {isStandalone ? children : <DashboardLayout>{children}</DashboardLayout>}
    </AuthGuard>
  );
}
