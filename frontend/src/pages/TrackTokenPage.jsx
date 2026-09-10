import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  MapPin,
  Search,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { api, streamUrl, trackUrl } from "@/lib/api";
import { DEPT_LABELS } from "@/lib/constants";
import { getWaitingPosition, normalizeQueuePayload } from "@/lib/queue";
import { cn } from "@/lib/cn";
const TIMELINE_STEPS = [
  { key: "registered", label: "Registered", icon: CheckCircle2 },
  { key: "waiting", label: "In Queue", icon: Users },
  { key: "in_progress", label: "Called", icon: Activity },
  { key: "done", label: "Completed", icon: CheckCircle2 }
];
function TrackTokenPage() {
  const params = useParams();
  const tokenParam = decodeURIComponent(String(params.token ?? "")).trim().toUpperCase();
  const [trackInfo, setTrackInfo] = useState(null);
  const [queueTokens, setQueueTokens] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [sseStatus, setSseStatus] = useState("connecting");
  const eventSourceRef = useRef(null);
  useEffect(() => {
    if (!tokenParam) return;
    let cancelled = false;
    setLoadError(null);
    async function load() {
      try {
        const { data } = await api.get(trackUrl(tokenParam));
        if (!cancelled) setTrackInfo(data);
      } catch (e) {
        if (cancelled) return;
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          setLoadError("Token not found. Check the number on your slip.");
        } else {
          setLoadError("Could not load your token. Try again.");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [tokenParam]);
  const department = trackInfo?.department ?? "";
  const tokenId = trackInfo?.token.id;
  useEffect(() => {
    if (!department || tokenId == null) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSseStatus("connecting");
    const es = new EventSource(streamUrl(department));
    eventSourceRef.current = es;
    es.onopen = () => setSseStatus("open");
    es.onerror = () => setSseStatus("closed");
    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed && typeof parsed === "object" && "msg" in parsed) return;
        setQueueTokens(normalizeQueuePayload(parsed));
      } catch {
      }
    };
    return () => {
      es.close();
      if (eventSourceRef.current === es) eventSourceRef.current = null;
    };
  }, [department, tokenId]);
  const position = useMemo(() => {
    if (tokenId == null) return trackInfo?.position ?? null;
    return getWaitingPosition(queueTokens, tokenId) ?? trackInfo?.position ?? null;
  }, [queueTokens, tokenId, trackInfo?.position]);
  const status = trackInfo?.token.status?.toLowerCase() ?? "";
  const deptLabel = DEPT_LABELS[department] ?? department;
  const statusMessage = (() => {
    if (!trackInfo) return null;
    if (status === "in_progress") {
      return "Doctor is ready for you \u2014 please go to the counter now.";
    }
    if (status === "done" || status === "skipped") {
      return "Your visit for this token is complete.";
    }
    if (position == null) {
      return "You are not in the waiting queue right now.";
    }
    if (position === 1) {
      return "You are next in line. Please stay near the department.";
    }
    if (position === 2) {
      return "One patient ahead of you. Please be ready.";
    }
    return `${position - 1} patients ahead of you.`;
  })();
  const activeStepIndex = (() => {
    if (status === "done" || status === "skipped") return 3;
    if (status === "in_progress") return 2;
    if (status === "waiting") return 1;
    return 0;
  })();
  return <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">MediQueue</span>
        </div>

        {loadError && <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center"
  >
            <p className="text-sm text-red-700">{loadError}</p>
            <Link
    to="/track"
    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
  >
              <Search className="h-4 w-4" />
              Search another token
            </Link>
          </motion.div>}

        {!loadError && !trackInfo && <Loader size="lg" label="Loading your token…" className="py-20" />}

        <AnimatePresence>
          {trackInfo && <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-5"
  >
              <Card className="overflow-hidden border-blue-100 p-0">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-8 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                    Your Token
                  </p>
                  <motion.p
    key={trackInfo.token.tokenNumber}
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    className="mt-2 font-mono text-4xl font-bold tracking-tight sm:text-5xl"
  >
                    {trackInfo.token.tokenNumber}
                  </motion.p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-100">
                    <MapPin className="h-4 w-4" />
                    {deptLabel}
                  </div>
                  {trackInfo.token.patientName && <p className="mt-1 text-sm text-blue-200">{trackInfo.token.patientName}</p>}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {position != null && status === "waiting" && <Card className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Queue Position
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">#{position}</p>
                  </Card>}
              </div>

              <Card>
                <p className="text-sm leading-relaxed text-slate-700">{statusMessage}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
    className={cn(
      "inline-block h-2 w-2 rounded-full",
      sseStatus === "open" ? "bg-emerald-500 pulse-ring" : "bg-slate-300"
    )}
  />
                  <span className="text-xs text-slate-400">
                    Live updates: {sseStatus === "open" ? "connected" : sseStatus}
                  </span>
                </div>
              </Card>

              <Card>
                <p className="mb-4 text-sm font-semibold text-slate-800">Progress Timeline</p>
                <div className="relative flex justify-between">
                  <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200" />
                  <motion.div
    className="absolute left-4 top-4 h-0.5 bg-blue-500"
    initial={{ width: 0 }}
    animate={{ width: `${activeStepIndex / (TIMELINE_STEPS.length - 1) * 100}%` }}
    style={{ maxWidth: "calc(100% - 2rem)" }}
  />
                  {TIMELINE_STEPS.map((step, i) => {
    const Icon = step.icon;
    const isActive = i <= activeStepIndex;
    const isCurrent = i === activeStepIndex;
    return <div key={step.key} className="relative flex flex-col items-center gap-2">
                        <div
      className={cn(
        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
        isActive ? "border-blue-500 bg-blue-500 text-white" : "border-slate-200 bg-white text-slate-400"
      )}
    >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span
      className={cn(
        "text-[10px] font-medium sm:text-xs",
        isCurrent ? "text-blue-600" : isActive ? "text-slate-600" : "text-slate-400"
      )}
    >
                          {step.label}
                        </span>
                      </div>;
  })}
                </div>
              </Card>

              <Badge variant="info" className="mx-auto w-fit">
                Keep this page open for live updates
              </Badge>
            </motion.div>}
        </AnimatePresence>
      </div>
    </main>
}
export default TrackTokenPage;
