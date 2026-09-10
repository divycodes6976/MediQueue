"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  LogIn,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  HeartHandshake,
  Hash,
  Info,
  Search,
  User,
  UserCheck,
  Users,
  Volume2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { normalizeQueuePayload, type QueueToken } from "@/lib/queue";
import { streamUrl } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/cn";

type QueuePriority = "EMERGENCY" | "SENIOR" | "NORMAL";

const apiPriorityToUi = (p: string): QueuePriority => {
  const u = p.toUpperCase();
  if (u === "EMERGENCY") return "EMERGENCY";
  if (u === "SENIOR") return "SENIOR";
  return "NORMAL";
};

const priorityConfig = {
  EMERGENCY: { icon: AlertTriangle, variant: "danger" as const },
  SENIOR: { icon: UserCheck, variant: "warning" as const },
  NORMAL: { icon: User, variant: "info" as const },
};

export default function DisplayPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [queue, setQueue] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [now, setNow] = useState(() => new Date());
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const codes = DEPARTMENTS.map((d) => d.code);
    setDepartments(codes);
    setSelectedDepartment((prev) => prev || codes[0] || "");
  }, []);

  useEffect(() => {
    if (!selectedDepartment) {
      setQueue([]);
      setSseStatus("connecting");
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setLoading(true);
    setError(null);
    setSseStatus("connecting");

    const es = new EventSource(streamUrl(selectedDepartment));
    eventSourceRef.current = es;

    es.onopen = () => setSseStatus("open");
    es.onerror = () => {
      setSseStatus("closed");
      setError("Live connection lost. Reconnecting…");
    };
    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data) as unknown;
        if (parsed && typeof parsed === "object" && "msg" in parsed) return;
        if (parsed && typeof parsed === "object" && "error" in parsed) {
          setError("Could not load waiting queue.");
          setLoading(false);
          return;
        }
        setQueue(normalizeQueuePayload(parsed));
        setLoading(false);
        setError(null);
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
      if (eventSourceRef.current === es) eventSourceRef.current = null;
    };
  }, [selectedDepartment]);

  const rows = useMemo(() => {
    return queue.map((t) => ({
      id: t.id,
      token: t.tokenNumber,
      patient: (t.patientName ?? "").trim() || "Patient",
      priority: apiPriorityToUi(t.priority),
      status: t.status,
    }));
  }, [queue]);

  const currentToken = rows[0];
  const nextTokens = rows.slice(1, 5);
  const waitingCount = rows.length;
  const priorityCount = rows.filter((item) => item.priority !== "NORMAL").length;

  const timeText = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateText = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#f7f9fd] text-slate-900">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_15%_110%,rgba(219,234,254,.8)_0%,transparent_52%),radial-gradient(ellipse_at_90%_115%,rgba(219,234,254,.75)_0%,transparent_55%)]" />
      <div className="relative mx-auto max-w-[1800px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Activity className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-700">Patient information system</p>
              <h1 className="mt-1 text-[27px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[34px]">
                MediQueue Live Board
              </h1>
              <p className="text-sm text-slate-500">Live outpatient department queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white px-5 py-3 shadow-[0_2px_8px_rgb(15_23_42_/_0.04)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-100 text-blue-600"><CalendarClock className="h-5 w-5" /></span>
              <div className="text-left">
                <p className="font-mono text-xl font-bold tracking-[-0.04em] text-blue-600 sm:text-2xl">{timeText}</p>
                <p className="text-xs font-medium text-slate-500">{dateText}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/login")}>
              <LogIn className="h-4 w-4" />
              Staff access
            </Button>
            <Button onClick={() => router.push("/track")}>
              <Search className="h-4 w-4" />
              Track your token
            </Button>
          </div>
        </header>

        <Card className="mb-6 border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_rgb(15_23_42_/_0.04)] sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Department queue</p>
                <p className="text-xs text-slate-500">Updates automatically in real time</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="h-11 w-full appearance-none rounded-[11px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {departments.length === 0 ? (
                    <option value="">Loading…</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setQueue([]);
                  setSelectedDepartment("");
                }}
                className="inline-flex items-center gap-2 rounded-[11px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] transition hover:bg-slate-50"
              >
                <XCircle className="h-4 w-4" />
                Clear
              </button>
              <Badge variant={sseStatus === "open" ? "success" : "outline"}>
                <span
                  className={cn(
                    "mr-1 inline-block h-1.5 w-1.5 rounded-full",
                    sseStatus === "open" ? "bg-emerald-500 pulse-ring" : "bg-slate-400"
                  )}
                />
                {sseStatus === "open" ? "Live" : loading ? "Connecting…" : sseStatus}
              </Badge>
            </div>
          </div>
        </Card>

        <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(390px,0.72fr)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentToken?.token ?? "none"}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative min-h-[360px] overflow-hidden rounded-2xl border border-blue-800/20 bg-[linear-gradient(135deg,#064fbd_0%,#0754c8_52%,#073c9b_100%)] p-8 text-center text-white shadow-[0_12px_30px_rgb(15_76_189_/_0.16)] sm:p-10 lg:p-12"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:13px_13px] [mask-image:linear-gradient(90deg,black,transparent_35%)]" />
              <svg aria-hidden viewBox="0 0 280 120" className="pointer-events-none absolute right-0 top-7 h-28 w-64 text-blue-200/50" fill="none">
                <path d="M0 70h55l16-47 22 78 24-48 20 17h143" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg aria-hidden viewBox="0 0 210 150" className="pointer-events-none absolute bottom-0 left-0 h-36 w-52 text-blue-200/25" fill="none">
                <path d="M22 124V52c0-10 8-18 18-18h28c9 0 16 7 16 16v74M11 124h116M129 124V82c0-8 7-15 15-15h25c8 0 15 7 15 15v42M38 55h46M132 88h49" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <div className="relative z-10 flex h-full flex-col items-center justify-center">
              <div className="absolute left-0 top-0 flex items-center gap-2 text-xs font-medium text-blue-100/90">
                <Building2 className="h-4 w-4" /> {selectedDepartment || "Department"} · Live queue
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-blue-50 ring-1 ring-inset ring-white/10"><Volume2 className="h-4 w-4" /> {currentToken ? "NOW CALLING" : "QUEUE STATUS"}</span>
              {currentToken ? (
                <>
                  <p className="mt-6 font-mono text-[clamp(4rem,9vw,7.4rem)] font-bold leading-none tracking-[-0.075em]">{currentToken.token}</p>
                  <div className="mt-5 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.13em] text-blue-200">Patient</p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">{currentToken.patient}</p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-medium text-blue-50 backdrop-blur-sm"><Building2 className="h-4 w-4 text-blue-200" /> Please proceed to the consultation room</div>
                </>
              ) : (
                <div className="mt-7 max-w-md text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-blue-100"><CheckCircle2 className="h-8 w-8" /></span>
                  <p className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">Queue is clear</p>
                  <p className="mt-3 text-base leading-7 text-blue-100">There are no patients currently waiting in the {selectedDepartment || "selected"} department.</p>
                  <p className="mt-2 text-sm text-blue-200">This display will update automatically when a new token is issued.</p>
                </div>
              )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid gap-5">
          <Card className="flex flex-col border-slate-200/90 p-6 shadow-[0_2px_8px_rgb(15_23_42_/_0.04)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Up Next</p>
                <p className="mt-1 text-sm text-slate-500">Please remain in the waiting area</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">{nextTokens.length}</span>
            </div>
            <div className="flex-1 space-y-3">
              {nextTokens.length === 0 ? (
                <div className="flex min-h-[106px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">No patients waiting</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">The next token will appear here automatically.</p>
                </div>
              ) : (
                nextTokens.map((item, i) => {
                  const cfg = priorityConfig[item.priority];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-5 py-4 transition hover:border-blue-200 hover:bg-blue-50/35"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                          {i + 2}
                        </span>
                        <div>
                          <p className="font-mono text-xl font-bold text-blue-600">{item.token}</p>
                          <p className="text-sm text-slate-600">{item.patient}</p>
                        </div>
                      </div>
                      <Badge variant={cfg.variant}>
                        <Icon className="h-3.5 w-3.5" />
                        {item.priority}
                      </Badge>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
          <Card padding="none" className="overflow-hidden border-slate-200/90 shadow-[0_2px_8px_rgb(15_23_42_/_0.04)]">
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-2">
              <div className="p-5 text-center"><Users className="mx-auto h-5 w-5 text-blue-600" /><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{waitingCount}</p><p className="mt-1 text-xs font-medium text-slate-500">Waiting</p></div>
              <div className="p-5 text-center"><AlertTriangle className="mx-auto h-5 w-5 text-amber-500" /><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{priorityCount}</p><p className="mt-1 text-xs font-medium text-slate-500">Priority</p></div>
            </div>
          </Card>
          </div>
        </section>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-5 py-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-900/80">
            Emergency and senior-citizen patients may be prioritized. Please wait for your token to be called.
          </p>
        </div>

        <Card padding="none" className="overflow-hidden border-slate-200/90 shadow-[0_2px_8px_rgb(15_23_42_/_0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-5">
            <p className="text-xl font-semibold tracking-[-0.025em] text-slate-800">
              {selectedDepartment || "Select a department"} · Waiting Queue
            </p>
            <Badge variant="info" className="px-3 py-1 text-xs">{waitingCount} patients waiting</Badge>
          </div>

          {error && (
            <p className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {rows.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users className="h-6 w-6" /></span>
              <p className="mt-4 text-lg font-semibold text-slate-800">No patients in this queue</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">New tokens for {selectedDepartment || "this department"} will appear here in real time.</p>
            </div>
          ) : (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Token
                    </span>
                  </th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {rows.map((item, index) => {
                    const cfg = priorityConfig[item.priority];
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "text-sm transition-colors",
                          index === 0 ? "bg-blue-50/60" : "hover:bg-slate-50/60"
                        )}
                      >
                        <td className="px-4 py-4 text-slate-500">{index + 1}</td>
                        <td className="px-4 py-4 font-mono text-lg font-bold text-blue-600">
                          {item.token}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-800">{item.patient}</td>
                        <td className="px-4 py-4">
                          <Badge variant={cfg.variant}>
                            <Icon className="h-3.5 w-3.5" />
                            {item.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {item.status.toLowerCase() === "waiting" ? "Waiting" : item.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          )}
        </Card>
        <footer className="flex items-center justify-center gap-2 py-7 text-sm text-slate-500"><HeartHandshake className="h-5 w-5 text-blue-600" /><span>Thank you for your patience. We appreciate <strong className="font-semibold text-blue-600">your cooperation.</strong></span></footer>
      </div>
    </main>
  );
}
