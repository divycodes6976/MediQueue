"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Monitor, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

type SearchHit = {
  type: "token" | "patient" | "staff";
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

type AlertItem = {
  id: string;
  title: string;
  subtitle: string;
  tone: "danger" | "warning" | "info";
  href: string;
};

type TopNavbarProps = {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
};

export function TopNavbar({ onMenuClick, showMenuButton }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [showHits, setShowHits] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  const profileName = user?.name ?? "Staff";
  const profileRole = user ? ROLE_LABEL[user.role] : "";
  const searchPlaceholder =
    user?.role === "admin"
      ? "Search patients, tokens, staff..."
      : user?.role === "doctor"
        ? "Search tokens in your department..."
        : "Search patient name or token...";

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setShowHits(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setHits([]);
      setSearching(false);
      return;
    }
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get<{ results: SearchHit[] }>("/search", { params: { q } });
        setHits(Array.isArray(data.results) ? data.results : []);
        setShowHits(true);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function loadAlerts() {
      try {
        const { data } = await api.get<{ alerts: AlertItem[] }>("/search/alerts");
        if (!cancelled) setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      } catch {
        if (!cancelled) setAlerts([]);
      }
    }
    void loadAlerts();
    const id = window.setInterval(loadAlerts, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const goToHit = (hit: SearchHit) => {
    setShowHits(false);
    setQuery("");
    setSearchOpen(false);
    router.push(hit.href);
  };

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const first = hits[0];
    if (first) goToHit(first);
  };

  const searchField = (
    <div ref={searchBoxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <form onSubmit={onSearchSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hits.length > 0 && setShowHits(true)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </form>
      {showHits && query.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {searching && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
          {!searching && hits.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">No matches</p>
          )}
          {hits.map((hit) => (
            <button
              key={`${hit.type}-${hit.id}`}
              type="button"
              onClick={() => goToHit(hit)}
              className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="text-sm font-medium text-slate-800">{hit.title}</span>
              <span className="text-[11px] text-slate-500">{hit.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

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

      <div className="hidden min-w-0 flex-1 md:block">{searchField}</div>

      <button
        type="button"
        onClick={() => setSearchOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
        aria-label="Search"
      >
        {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/display"
          className="hidden items-center gap-2 rounded-[11px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
        >
          <Monitor className="h-4 w-4" />
          Display Board
        </Link>

        <div ref={alertsRef} className="relative">
          <button
            type="button"
            onClick={() => setAlertsOpen((v) => !v)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          {alertsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                Queue alerts
              </p>
              {alerts.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-500">No alerts right now.</p>
              ) : (
                alerts.map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => {
                      setAlertsOpen(false);
                      router.push(alert.href);
                    }}
                    className="flex w-full flex-col items-start border-b border-slate-50 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        alert.tone === "danger" && "text-red-700",
                        alert.tone === "warning" && "text-amber-700",
                        alert.tone === "info" && "text-slate-800"
                      )}
                    >
                      {alert.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{alert.subtitle}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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

      {searchOpen && <div className="absolute left-0 right-0 top-16 border-b border-slate-200 bg-white p-4 md:hidden">{searchField}</div>}
    </header>
  );
}
