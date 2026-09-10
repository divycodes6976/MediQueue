import { useLocation } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { DashboardLayout } from "./DashboardLayout";

export function ConditionalAppShell({ children }) {
  const { pathname } = useLocation();
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
