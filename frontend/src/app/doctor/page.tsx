"use client";

import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  SkipForward,
  Sparkles,
  Stethoscope,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge, priorityBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE, api } from "@/lib/api";
import { apiToUiPriority, type Priority } from "@/lib/constants";
import { cn } from "@/lib/cn";

type QueueToken = {
  id: number;
  tokenNumber: string;
  department: string;
  priority: string;
  status: string;
  createdAt: string | Date;
  patientId: number | null;
  patientName?: string | null;
  patientAge?: number | null;
  patientPhone?: string | null;
};

type QueueRow = {
  token: string;
  name: string;
  ageOrPhone: string;
  priority: Priority;
  status: string;
  tokenId: number;
};

const normalizeQueuePayload = (payload: unknown): QueueToken[] => {
  if (Array.isArray(payload)) return payload as QueueToken[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { queue?: unknown }).queue)) {
    return (payload as { queue: QueueToken[] }).queue;
  }
  return [];
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatPatientDetails(age?: number | null, phone?: string | null) {
  const cleanPhone = phone?.replace(/\D/g, "") ?? "";
  const maskedPhone = cleanPhone ? `••••${cleanPhone.slice(-4)}` : null;
  return [age != null ? `${age}y` : null, maskedPhone].filter(Boolean).join(" · ") || "—";
}

function MedicalChairIllustration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 right-28 hidden h-36 w-44 xl:block"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.32),rgba(196,181,253,0.14)_42%,transparent_72%)] blur-xl" />
      <svg viewBox="0 0 220 170" className="relative h-full w-full text-blue-500/35" fill="none">
        <circle cx="158" cy="40" r="24" fill="currentColor" opacity="0.1" />
        <path d="M122 40h28c10 0 18 8 18 18v11h-46V40Z" fill="currentColor" opacity="0.16" />
        <path d="M74 81c0-10 8-18 18-18h62c10 0 18 8 18 18v12H74V81Z" fill="currentColor" opacity="0.13" />
        <path d="M83 94h80l-8 29H92l-9-29Z" fill="currentColor" opacity="0.17" />
        <path d="M103 123h39l8 20h-55l8-20Z" fill="currentColor" opacity="0.14" />
        <path d="M110 143v12m23-12v12M92 155h59" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M65 74 50 59m10 0-10 10M172 53l19-18m-9 0h9v9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <circle cx="49" cy="58" r="6" fill="currentColor" opacity="0.3" />
        <circle cx="192" cy="33" r="5" fill="currentColor" opacity="0.25" />
      </svg>
    </div>
  );
}

export default function DoctorPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [queueTokens, setQueueTokens] = useState<QueueToken[]>([]);
  const [nowServing, setNowServing] = useState<QueueToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [consultSeconds, setConsultSeconds] = useState(0);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const consultStartRef = useRef<number | null>(null);

  const department = (user?.department ?? "").trim().toUpperCase();

  useEffect(() => {
    if (!department) return;

    setNowServing(null);
    consultStartRef.current = null;
    setConsultSeconds(0);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setSseStatus("connecting");
    setError(null);

    const es = new EventSource(`${API_BASE}/queue/stream/${encodeURIComponent(department)}`);
    eventSourceRef.current = es;

    es.onopen = () => setSseStatus("open");
    es.onerror = () => setSseStatus("closed");
    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed && typeof parsed === "object" && "msg" in parsed) return;
        setQueueTokens(normalizeQueuePayload(parsed));
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
      if (eventSourceRef.current === es) eventSourceRef.current = null;
    };
  }, [department]);

  useEffect(() => {
    if (!nowServing) {
      consultStartRef.current = null;
      setConsultSeconds(0);
      return;
    }
    consultStartRef.current = Date.now();
    const id = setInterval(() => {
      if (consultStartRef.current) {
        setConsultSeconds(Math.floor((Date.now() - consultStartRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [nowServing?.id]);

  const queueRows: QueueRow[] = useMemo(() => {
    return queueTokens.map((t) => ({
      token: t.tokenNumber,
      name: t.patientName?.trim() || (t.patientId ? `Patient #${t.patientId}` : "Patient"),
      ageOrPhone: formatPatientDetails(t.patientAge, t.patientPhone),
      priority: apiToUiPriority(t.priority),
      status: t.status.toLowerCase() === "waiting" ? "In Queue" : t.status,
      tokenId: t.id,
    }));
  }, [queueTokens]);

  const nowServingDisplay = useMemo(() => {
    if (!nowServing) return null;
    const fromLive = queueTokens.find((t) => t.id === nowServing.id) ?? null;
    const patientName = (nowServing.patientName ?? fromLive?.patientName ?? "").trim();
    const patientAge = nowServing.patientAge ?? fromLive?.patientAge ?? null;
    const patientPhone = (nowServing.patientPhone ?? fromLive?.patientPhone ?? "").trim();
    const name = patientName || (nowServing.patientId ? `Patient #${nowServing.patientId}` : "Patient");
    const ageOrPhone = formatPatientDetails(patientAge, patientPhone);
    return { name, ageOrPhone };
  }, [nowServing, queueTokens]);

  const queueSummary = useMemo(() => {
    const priorityPatients = queueTokens.filter(
      (token) => apiToUiPriority(token.priority) !== "Normal"
    ).length;
    return {
      waiting: queueRows.length,
      priorityPatients,
      nextToken: queueRows[0]?.token ?? "—",
    };
  }, [queueRows, queueTokens]);

  const nextUp = queueRows[0] ?? null;

  const callNext = async () => {
    if (!department) return;
    setError(null);
    setActionLoading(true);
    try {
      const { data } = await api.post<{ token: QueueToken }>("/queue/call-next", {
        department,
      });
      setNowServing(data.token ?? null);
      toast(`Now serving ${data.token?.tokenNumber ?? "patient"}`, "success");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as { message?: string; error?: string } | undefined;
        setError(d?.message ?? d?.error ?? "Failed to call next patient.");
      } else {
        setError("Failed to call next patient.");
      }
      toast("Failed to call next patient", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const complete = async (action: "DONE" | "SKIPPED") => {
    if (!nowServing?.id) return;
    setError(null);
    setActionLoading(true);
    try {
      await api.post("/queue/complete", { tokenId: nowServing.id, action });
      setNowServing(null);
      toast(action === "DONE" ? "Consultation completed" : "Patient skipped", "success");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as { message?: string; error?: string } | undefined;
        setError(d?.message ?? d?.error ?? "Failed to update token.");
      } else {
        setError("Failed to update token.");
      }
      toast("Failed to update token", "error");
    } finally {
      setActionLoading(false);
      setSkipConfirm(false);
    }
  };

  return (
    <div className="space-y-7 pb-5">
      <section className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-[linear-gradient(110deg,#ffffff_0%,#f8fbff_65%,#fafaff_100%)] px-5 py-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-20 w-56 rounded-full bg-indigo-200/10 blur-3xl" />
        <Stethoscope className="pointer-events-none absolute right-7 top-5 hidden h-16 w-16 rotate-[-16deg] text-blue-200/30 lg:block" strokeWidth={1.25} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <Stethoscope className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-blue-700">Clinical workspace</span>
            </div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.035em] text-slate-900 sm:text-[34px]">
              Doctor Queue{user?.name ? ` — ${user.name}` : ""}
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Manage your patient queue in real time</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {department && (
              <Badge variant="outline" className="bg-white/90 px-3 py-1.5 font-medium text-slate-700 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]">
                Department: {department}
              </Badge>
            )}
            {sseStatus === "open" ? (
              <Badge variant="success" className="bg-emerald-50/80 px-3 py-1.5 font-medium shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-ring" />
                <Wifi className="h-3.5 w-3.5" /> SSE Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-white/80 px-3 py-1.5 shadow-sm">
                <WifiOff className="h-3.5 w-3.5" /> {sseStatus === "connecting" ? "Connecting…" : "Reconnecting…"}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Patients waiting" value={queueSummary.waiting} icon={UsersRound} gradient="bg-blue-600" delay={0.02} />
        <KpiCard title="Priority patients" value={queueSummary.priorityPatients} icon={CircleAlert} gradient="bg-amber-500" delay={0.06} />
        <KpiCard title="In consultation" value={nowServing ? 1 : 0} icon={Activity} gradient="bg-violet-600" delay={0.1} />
        <KpiCard title="Next token" value={queueSummary.nextToken} icon={ChevronRight} gradient="bg-cyan-600" delay={0.14} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={nowServing?.id ?? "empty"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="h-full"
          >
            <Card
              className={cn(
                "relative h-full overflow-hidden border-2 transition-colors",
                nowServing ? "border-blue-200/90 bg-[linear-gradient(120deg,#ffffff_0%,#fbfdff_66%,#f8faff_100%)] shadow-[0_8px_24px_rgb(37_99_235_/_0.06)]" : "border-slate-200/90 bg-[linear-gradient(120deg,#ffffff_0%,#fbfcfe_100%)]"
              )}
            >
              {nowServing && (
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />
              )}
              <MedicalChairIllustration />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-700">Now Serving</p>
                </div>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">
                  {nowServing?.tokenNumber ?? "—"}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.015em] text-slate-800">
                  {nowServingDisplay?.name ?? "No patient currently being served"}
                </p>
                {nowServing && nowServingDisplay?.ageOrPhone !== "—" && (
                  <p className="mt-1 text-sm text-slate-500">{nowServingDisplay.ageOrPhone}</p>
                )}
                {nowServing && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={priorityBadgeVariant(apiToUiPriority(nowServing.priority))}>
                      {apiToUiPriority(nowServing.priority)}
                    </Badge>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-mono font-semibold text-slate-700 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {formatDuration(consultSeconds)}
                    </div>
                  </div>
                )}
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                <Button onClick={callNext} disabled={!department} loading={actionLoading} size="lg" className="rounded-[11px] shadow-[0_5px_14px_rgb(37_99_235_/_0.2)] hover:shadow-[0_7px_18px_rgb(37_99_235_/_0.26)]">
                  <ChevronRight className="h-4 w-4" />
                  Call Next Patient
                </Button>
                <Button
                  variant="outline"
                  onClick={() => complete("DONE")}
                  disabled={!nowServing}
                  loading={actionLoading}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSkipConfirm(true)}
                  disabled={!nowServing}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
                </div>
              </div>
              {error && (
                <p className="relative mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <Card className="relative h-full overflow-hidden border-slate-200/90 bg-[linear-gradient(145deg,#ffffff_0%,#fbfdff_100%)]" hover>
          <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-teal-100/35 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-inset ring-teal-100">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-teal-700">Next Up</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>

            {nextUp ? (
              <div className="mt-8">
                <p className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-teal-700">{nextUp.token}</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-800">{nextUp.name}</p>
                {nextUp.ageOrPhone !== "—" && <p className="mt-1 text-sm text-slate-500">{nextUp.ageOrPhone}</p>}
                <div className="mt-5">
                  <Badge variant={priorityBadgeVariant(nextUp.priority)}>{nextUp.priority} Priority</Badge>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-lg font-semibold text-slate-800">No patient waiting</p>
                <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500">The next patient will appear here when the queue updates.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card padding="none">
        <div className="border-b border-slate-100 bg-slate-50/45 p-5 sm:p-6">
          <CardHeader className="mb-0">
            <div>
              <CardTitle>Patient Queue</CardTitle>
              <CardDescription>{queueRows.length} patients currently in this department queue</CardDescription>
            </div>
          </CardHeader>
        </div>

        {queueRows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Stethoscope} title="Queue is empty" description="No patients waiting right now" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table className="border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age / Phone</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueRows.map((row, i) => (
                    <TableRow
                      key={row.token}
                      className={cn(
                        i === 0 && !nowServing && "bg-blue-50/50",
                        nowServing?.tokenNumber === row.token && "bg-blue-50"
                      )}
                    >
                      <TableCell className="font-bold text-blue-600">{row.token}</TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-slate-500">{row.ageOrPhone}</TableCell>
                      <TableCell>
                        <Badge variant={priorityBadgeVariant(row.priority)}>{row.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {queueRows.map((row, i) => (
                <motion.div
                  key={row.token}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "rounded-xl border p-4",
                    i === 0 && !nowServing ? "border-blue-200 bg-blue-50/50" : "border-slate-100 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-blue-600">{row.token}</p>
                    <Badge variant={priorityBadgeVariant(row.priority)}>{row.priority}</Badge>
                  </div>
                  <p className="mt-1 font-medium text-slate-800">{row.name}</p>
                  <p className="text-sm text-slate-500">{row.ageOrPhone}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmModal
        open={skipConfirm}
        onClose={() => setSkipConfirm(false)}
        onConfirm={() => complete("SKIPPED")}
        title="Skip Patient?"
        description="This will mark the current patient as skipped and move to the next in queue."
        confirmLabel="Skip Patient"
        loading={actionLoading}
      />
    </div>
  );
}
