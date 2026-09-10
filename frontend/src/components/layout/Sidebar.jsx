import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/lib/auth";

const NAV_BY_ROLE = {
  reception: [{ href: "/reception", label: "Register Patient", icon: UserPlus }],
  doctor: [{ href: "/doctor", label: "My Queue", icon: Users }],
};

export function Sidebar({ collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const items = user ? NAV_BY_ROLE[user.role] : [];

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200/90 bg-white",
        collapsed ? "w-[72px]" : "w-72"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-slate-100", collapsed ? "justify-center px-2" : "gap-3 px-5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/15">
          <Activity className="h-5 w-5" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[-0.02em] text-slate-900">MediQueue</p>
            <p className="truncate text-[11px] text-slate-500">
              {user ? ROLE_LABEL[user.role] : "Hospital OPD System"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-blue-50/80 ring-1 ring-inset ring-blue-100/80"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon className={cn("relative h-[18px] w-[18px] shrink-0", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {!collapsed && <span className="relative truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && user && (
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <p className="text-xs font-semibold text-slate-800">{user.name ?? ROLE_LABEL[user.role]}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              {ROLE_LABEL[user.role]}
              {user.department ? ` · ${user.department}` : ""}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
