import { Link } from "react-router-dom";
import axios from "axios";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Crown,
  Hash,
  Phone,
  Plus,
  Sparkles,
  Ticket,
  User
} from "lucide-react";
import { Badge, priorityBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/api";
import {
  apiToUiPriority,
  CODE_TO_DEPARTMENT_VALUE,
  DEPARTMENTS,
  priorityToApi,
  PRIORITIES
} from "@/lib/constants";
import { cn } from "@/lib/cn";
const initialFormState = {
  name: "",
  age: "",
  phone: "",
  chiefComplaint: "",
  department: "",
  priority: "Normal"
};
const getPriorityIcon = (priority) => {
  if (priority === "Emergency") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (priority === "Senior") return <Crown className="h-3.5 w-3.5" />;
  return <User className="h-3.5 w-3.5" />;
};
function ReceptionPage() {
  const { toast } = useToast();
  const [tokens, setTokens] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [suggestError, setSuggestError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [suggestSource, setSuggestSource] = useState(null);
  const [emergencyWarning, setEmergencyWarning] = useState(false);
  const [seniorHint, setSeniorHint] = useState(false);
  const [lastToken, setLastToken] = useState(null);
  const departmentMap = useMemo(
    () => DEPARTMENTS.reduce((acc, item) => {
      acc[item.value] = item.code;
      return acc;
    }, {}),
    []
  );
  const applySuggestion = (suggestion) => {
    const deptValue = CODE_TO_DEPARTMENT_VALUE[suggestion.department.toUpperCase()] ?? "";
    setFormData((prev) => ({
      ...prev,
      department: deptValue || prev.department,
      priority: apiToUiPriority(suggestion.priority)
    }));
  };
  const handleAiSuggest = async () => {
    setSuggestError(null);
    const complaint = formData.chiefComplaint.trim();
    if (!complaint) {
      setSuggestError("Pehle patient ki problem likho.");
      setTouched((prev) => ({ ...prev, chiefComplaint: true }));
      return;
    }
    const parsedAge = formData.age.trim() ? Number(formData.age) : void 0;
    if (parsedAge !== void 0 && (Number.isNaN(parsedAge) || parsedAge <= 0)) {
      setSuggestError("Valid age daalo ya age khali chhod do.");
      return;
    }
    setIsSuggesting(true);
    try {
      const { data } = await api.post("/patient/triage-suggest", {
        chiefComplaint: complaint,
        age: parsedAge
      });
      setAiSuggestion(data.suggestion);
      setSuggestSource(data.source);
      setEmergencyWarning(data.emergencyWarning);
      setSeniorHint(data.seniorHint);
      applySuggestion(data.suggestion);
      toast("AI suggestion received", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data;
        setSuggestError(d?.error ?? d?.message ?? "AI suggest failed.");
      } else {
        setSuggestError("AI suggest failed.");
      }
      toast("AI suggestion failed", "error");
    } finally {
      setIsSuggesting(false);
    }
  };
  const handleGenerateToken = async (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    setSubmitError(null);
    if (!formData.name.trim() || !formData.age.trim() || !formData.phone.trim() || !formData.chiefComplaint.trim() || !formData.department) {
      return;
    }
    const parsedAge = Number(formData.age);
    if (Number.isNaN(parsedAge) || parsedAge <= 0) {
      setSubmitError("Please enter a valid age.");
      return;
    }
    const departmentCode = departmentMap[formData.department] ?? "GEN";
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/patient/register", {
        name: formData.name.trim(),
        age: parsedAge,
        phone: formData.phone.trim(),
        chiefComplaint: formData.chiefComplaint.trim(),
        department: departmentCode,
        priority: priorityToApi(formData.priority)
      });
      const rawToken = data.token;
      const tokenNumber = rawToken?.tokenNumber ?? rawToken?.token_number;
      const patientName = data.patient?.name?.trim() || formData.name.trim();
      if (!tokenNumber) {
        setSubmitError("Token was not returned by the server. Try again.");
        toast("Could not issue token", "error");
        return;
      }
      const newToken = {
        code: tokenNumber,
        name: patientName,
        department: formData.department,
        priority: apiToUiPriority(rawToken?.priority ?? "NORMAL")
      };
      setTokens((prev) => [...prev, newToken]);
      setLastToken(newToken);
      setFormData(initialFormState);
      setTouched({});
      setIsSubmitted(false);
      setAiSuggestion(null);
      setSuggestSource(null);
      setEmergencyWarning(false);
      setSeniorHint(false);
      toast(`Token ${newToken.code} generated`, "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg = data?.error ?? data?.message ?? err.message;
        setSubmitError(
          typeof msg === "string" && msg.length > 0 ? msg : "Failed to register patient."
        );
      } else {
        setSubmitError("Failed to register patient.");
      }
      toast("Registration failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const hasError = (field) => (isSubmitted || touched[field]) && !String(formData[field]).trim();
  return <div className="space-y-7 pb-4">
      <motion.section
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-[linear-gradient(110deg,#fff_0%,#f8fbff_68%,#fafaff_100%)] px-5 py-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] sm:px-7"
  >
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-blue-200/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <User className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-blue-700">Reception workspace</span>
            </div>
            <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-slate-900 sm:text-[34px]">Patient Registration</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create a queue token with patient details and an optional triage recommendation.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-[340px]">
            {[
    ["1", "Patient details"],
    ["2", "Triage review"],
    ["3", "Issue token"]
  ].map(([step, label]) => <div key={step} className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-[0_1px_2px_rgb(15_23_42_/_0.02)]">
                <span className="block font-semibold text-blue-600">{step}</span>
                <span className="mt-0.5 block text-slate-500">{label}</span>
              </div>)}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {lastToken && <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center text-white shadow-xl"
  >
            <button
    type="button"
    onClick={() => setLastToken(null)}
    className="absolute right-4 top-4 rounded-lg bg-white/10 px-2 py-1 text-xs transition hover:bg-white/20"
  >
              Dismiss
            </button>
            <p className="text-sm font-medium text-blue-100">Token Generated Successfully</p>
            <motion.p
    initial={{ scale: 0.5 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="mt-2 text-5xl font-bold tracking-tight sm:text-6xl"
  >
              {lastToken.code}
            </motion.p>
            <p className="mt-3 text-lg font-medium">{lastToken.name}</p>
            <p className="mt-1 text-sm text-blue-100">
              {lastToken.department}
            </p>
            <Badge variant={priorityBadgeVariant(lastToken.priority)} className="mt-4 bg-white/20 text-white ring-white/30">
              {lastToken.priority}
            </Badge>
            <div className="mt-6">
              <Link
    to={`/track/${encodeURIComponent(lastToken.code)}`}
    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
  >
                View Patient Queue Link →
              </Link>
            </div>
          </motion.div>}
      </AnimatePresence>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
        <div className="space-y-6">
          <Card id="ai-triage" className="overflow-hidden border-slate-200/90" padding="none">
            <div className="border-b border-slate-100 bg-slate-50/55 px-5 py-5 sm:px-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                  <Ticket className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Patient Information</CardTitle>
                  <CardDescription>Enter patient details at the reception desk</CardDescription>
                </div>
              </div>
            </CardHeader>
            </div>

            <form className="space-y-5 p-5 sm:p-6" onSubmit={handleGenerateToken}>
              <Input
    label="Patient Name"
    value={formData.name}
    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
    placeholder="e.g. Amit Singh"
    icon={<User className="h-4 w-4" />}
    error={hasError("name") ? "This field is required" : void 0}
    required
  />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
    label="Age"
    type="number"
    min={0}
    value={formData.age}
    onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
    placeholder="34"
    icon={<Hash className="h-4 w-4" />}
    error={hasError("age") ? "This field is required" : void 0}
    required
  />
                <Input
    label="Phone"
    value={formData.phone}
    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
    placeholder="+91..."
    icon={<Phone className="h-4 w-4" />}
    error={hasError("phone") ? "This field is required" : void 0}
    required
  />
              </div>

              <div>
                <Textarea
    label="Chief Complaint"
    rows={3}
    value={formData.chiefComplaint}
    onChange={(e) => {
      setFormData((prev) => ({ ...prev, chiefComplaint: e.target.value }));
      setAiSuggestion(null);
      setSuggestSource(null);
    }}
    onBlur={() => setTouched((prev) => ({ ...prev, chiefComplaint: true }))}
    placeholder="e.g. daant me 3 din se dard, khana khaate waqt badhta hai"
    error={hasError("chiefComplaint") ? "Patient problem is required" : void 0}
    required
  />
                <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => void handleAiSuggest()}
    disabled={isSuggesting || !formData.chiefComplaint.trim()}
    loading={isSuggesting}
    className="mt-3 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
  >
                  <Sparkles className="h-4 w-4" />
                  {isSuggesting ? "Analyzing\u2026" : "AI Suggestion"}
                </Button>
                {suggestError && <p className="mt-2 text-xs text-red-600">{suggestError}</p>}
              </div>

              {aiSuggestion && <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-violet-200/90 bg-[linear-gradient(120deg,#faf5ff_0%,#f7f7ff_100%)] p-4"
  >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-violet-900">
                        AI Suggestion ({suggestSource === "ai" ? "Gemini" : "Rules"})
                      </p>
                      <p className="mt-1 text-sm text-violet-800">
                        {CODE_TO_DEPARTMENT_VALUE[aiSuggestion.department] ?? aiSuggestion.department}{" "}
                        · {apiToUiPriority(aiSuggestion.priority)}
                      </p>
                      <p className="mt-2 text-sm text-violet-700/90">{aiSuggestion.reason}</p>
                      <p className="mt-3 text-xs leading-5 text-violet-700">
                        Review this recommendation before generating the token. Reception can update either field below.
                      </p>
                    </div>
                  </div>
                </motion.div>}

              {emergencyWarning && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  Emergency suggested — please confirm priority with reception.
                </div>}
              {seniorHint && !emergencyWarning && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Age 60+ — Senior priority suggested. Confirm below.
                </div>}

              <Select
    label="Department"
    value={formData.department}
    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
    onBlur={() => setTouched((prev) => ({ ...prev, department: true }))}
    error={hasError("department") ? "This field is required" : void 0}
    required
  >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => <option key={department.value} value={department.value}>
                    {department.label}
                  </option>)}
              </Select>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">Priority</p>
                  <span className="text-xs text-slate-400">Reception can override this choice</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((priority) => {
    const isSelected = formData.priority === priority;
    return <button
      key={priority}
      type="button"
      onClick={() => setFormData((prev) => ({ ...prev, priority }))}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200",
        isSelected ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
                        {getPriorityIcon(priority)}
                        {priority}
                      </button>;
  })}
                </div>
              </div>

              {formData.department && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-center"
  >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Token Preview</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {departmentMap[formData.department] ?? "GEN"}-###
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{formData.department}</p>
                  <Badge variant={priorityBadgeVariant(formData.priority)} className="mt-2">
                    {formData.priority}
                  </Badge>
                </motion.div>}

              {submitError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>}

              <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }} className="border-t border-slate-100 pt-5">
                <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Generating Token\u2026" : "Generate Token"}
                </Button>
              </motion.div>
            </form>
          </Card>
        </div>

        <Card className="sticky top-24 overflow-hidden border-slate-200/90" padding="none">
          <div className="border-b border-slate-100 bg-[linear-gradient(120deg,#fff_0%,#f8fffc_100%)] p-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Today&apos;s Tokens</CardTitle>
                <CardDescription>{tokens.length} tokens issued</CardDescription>
              </div>
            </div>
          </CardHeader>
          </div>

          <div className="max-h-[640px] space-y-3 overflow-y-auto p-5 pr-4">
            {tokens.length === 0 ? <EmptyState
    icon={Ticket}
    title="Ready for the next patient"
    description="Generated tokens will appear here as a clear, shareable queue record."
    className="min-h-[310px] border-blue-100 bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#fff_58%)]"
  /> : tokens.map((token, i) => <motion.div
    key={token.code}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.03 }}
    className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.02)] transition hover:border-blue-200 hover:bg-blue-50/[0.18] sm:flex-row sm:items-center sm:justify-between"
  >
                  <div>
                    <p className="text-base font-bold text-blue-600">{token.code}</p>
                    <p className="text-sm font-medium text-slate-800">{token.name}</p>
                    <p className="text-xs text-slate-500">
                      {token.department}
                    </p>
                    <Link
    to={`/track/${encodeURIComponent(token.code)}`}
    className="mt-2 inline-block text-xs font-medium text-violet-600 hover:underline"
  >
                      Patient queue link →
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Badge variant={priorityBadgeVariant(token.priority)}>
                      {getPriorityIcon(token.priority)}
                      {token.priority}
                    </Badge>
                  </div>
                </motion.div>)}
          </div>
        </Card>
      </section>
    </div>
}
export default ReceptionPage;
