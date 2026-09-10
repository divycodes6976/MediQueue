"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Monitor } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/lib/auth";

type TopNavbarProps = {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
};

export function TopNavbar({ onMenuClick, showMenuButton }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const profileName = user?.name ?? (user?.role === "doctor" ? "Doctor" : "Reception");
  const profileRole = user ? ROLE_LABEL[user.role] : "";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {showMenuButton && (
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">MediQueue</p>
        <p className="truncate text-[11px] text-slate-500">OPD queue workspace</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/display"
          className="hidden items-center gap-2 rounded-[11px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
        >
          <Monitor className="h-4 w-4" />
          Display Board
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3">
          <Avatar name={profileName} size="sm" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-slate-800">{profileName}</p>
            <p className="truncate text-[11px] text-slate-500">{profileRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
