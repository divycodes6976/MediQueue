"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Stethoscope,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { KpiCard } from "@/components/ui/KpiCard";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { KpiCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/api";
import { DEPARTMENTS, DEPT_LABELS } from "@/lib/constants";
import { normalizeQueuePayload, type QueueToken } from "@/lib/queue";

type ChartPoint = { label: string; value: number };

type AdminStats = {
  todayAppointments: number;
  patientsWaiting: number;
  servedToday: number;
  activeDoctors: number;
  totalAdminStaff: number;
  emergencyWaiting: number;
  avgWaitMinutes: number | null;
  departmentBreakdown: { name: string; percent: number; count: number }[];
  registrationsByHour: ChartPoint[];
  waitByHour: ChartPoint[];
};

type AdminUserRow = {
  id: number;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
  status: string;
};

const DEPT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444"];

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "reception",
  department: "DENT",
};

export default function AdminPage() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [liveQueue, setLiveQueue] = useState<QueueToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyUserForm);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadDashboard() {
    const [{ data: statsData }, { data: usersData }, { data: queueData }] = await Promise.all([
      api.get<{ stats: AdminStats }>("/admin/stats"),
      api.get<{ users: AdminUserRow[] }>("/admin/users"),
      api.get<{ queue: QueueToken[] }>("/search/waiting"),
    ]);
    setStats(statsData.stats ?? null);
    setUsers(Array.isArray(usersData.users) ? usersData.users : []);
    setLiveQueue(normalizeQueuePayload(queueData.queue));
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await loadDashboard();
      } catch {
        if (!cancelled) setError("Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const id = window.setInterval(() => {
      void loadDashboard().catch(() => undefined);
    }, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const avgWaitMinutes = stats?.avgWaitMinutes != null ? `${stats.avgWaitMinutes} min` : "—";

  const deptChartData = useMemo(() => {
    return (stats?.departmentBreakdown ?? []).map((d, i) => ({
      label: DEPT_LABELS[d.name] ?? d.name,
      value: d.count,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
    }));
  }, [stats]);

  const donutSegments = deptChartData;

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.department ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await api.post("/user/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.role === "doctor" ? form.department : null,
      });
      toast("Staff account created", "success");
      setAddOpen(false);
      setForm(emptyUserForm);
      await loadDashboard();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not create user.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (row: AdminUserRow) => {
    const next = row.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/user/${row.id}/status`, { status: next });
      toast(`${row.name} is now ${next}`, "success");
      await loadDashboard();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not update status.";
      toast(message, "error");
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{me?.name ? `, ${me.name.split(" ")[0]}` : ""} — here&apos;s what&apos;s happening at the hospital today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 pulse-ring" />
          Live data connected
        </div>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Patients Waiting"
              value={stats?.patientsWaiting ?? 0}
              icon={Users}
              gradient="gradient-primary"
              trend={{ value: "Live queue", positive: true }}
              delay={0}
            />
            <KpiCard
              title="Served Today"
              value={stats?.servedToday ?? 0}
              icon={UserCheck}
              gradient="gradient-success"
              trend={{ value: `${stats?.todayAppointments ?? 0} registered`, positive: true }}
              delay={0.05}
            />
            <KpiCard
              title="Avg. Waiting Time"
              value={avgWaitMinutes}
              icon={Timer}
              gradient="gradient-warning"
              trend={{ value: stats?.avgWaitMinutes != null ? "From call logs" : "No calls yet", positive: true }}
              delay={0.1}
            />
            <KpiCard
              title="Active Doctors"
              value={stats?.activeDoctors ?? 0}
              icon={Stethoscope}
              gradient="gradient-violet"
              trend={{ value: "On duty", positive: true }}
              delay={0.15}
            />
            <KpiCard
              title="Emergency Patients"
              value={stats?.emergencyWaiting ?? 0}
              icon={AlertTriangle}
              gradient="gradient-danger"
              trend={{ value: "In queue", positive: (stats?.emergencyWaiting ?? 0) === 0 }}
              delay={0.2}
            />
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" hover>
          <CardHeader>
            <div>
              <CardTitle>Live Queue</CardTitle>
              <CardDescription>Waiting patients across all departments</CardDescription>
            </div>
            <Badge variant="success">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </Badge>
          </CardHeader>
          {liveQueue.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No patients waiting"
              description="The queue is clear right now."
            />
          ) : (
            <div className="space-y-2">
              {liveQueue.slice(0, 8).map((token, i) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-blue-600">{token.tokenNumber}</p>
                      <p className="text-sm text-slate-600">
                        {(token.patientName ?? "Patient").trim() || "Patient"} · {token.department}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      token.priority?.toUpperCase() === "EMERGENCY"
                        ? "danger"
                        : token.priority?.toUpperCase() === "SENIOR"
                          ? "warning"
                          : "info"
                    }
                  >
                    {token.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <CardTitle>Today&apos;s Statistics</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {[
              { label: "Total Registrations", value: stats?.todayAppointments ?? 0, icon: TrendingUp },
              { label: "Admin Staff", value: stats?.totalAdminStaff ?? 0, icon: Users },
              { label: "Departments Active", value: stats?.departmentBreakdown?.length ?? 0, icon: Clock },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <item.icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="analytics" className="grid gap-6 lg:grid-cols-3">
        <Card hover id="departments">
          <CardHeader>
            <CardTitle>Patients per Department</CardTitle>
            <CardDescription>Current waiting distribution</CardDescription>
          </CardHeader>
          {deptChartData.length > 0 ? (
            <BarChart data={deptChartData} />
          ) : (
            <EmptyState icon={Users} title="No department data" className="min-h-[160px]" />
          )}
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>Registrations today</CardTitle>
            <CardDescription>Tokens issued by hour</CardDescription>
          </CardHeader>
          {(stats?.registrationsByHour.length ?? 0) > 1 ? (
            <LineChart data={stats?.registrationsByHour ?? []} />
          ) : (
            <EmptyState icon={TrendingUp} title="Not enough hourly data yet" className="min-h-[160px]" />
          )}
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle>Waiting time today</CardTitle>
            <CardDescription>Average minutes until called, by hour</CardDescription>
          </CardHeader>
          {(stats?.waitByHour.length ?? 0) > 1 ? (
            <LineChart data={stats?.waitByHour ?? []} />
          ) : (
            <EmptyState icon={Timer} title="Not enough call-log data yet" className="min-h-[160px]" />
          )}
        </Card>
      </section>

      <section id="doctors" className="grid gap-6 xl:grid-cols-3">
        <Card hover className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          {donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <EmptyState icon={Users} title="No data" className="min-h-[160px]" />
          )}
        </Card>

        <Card hover className="xl:col-span-2" padding="none">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Staff</CardTitle>
                <CardDescription>Hospital staff and doctors</CardDescription>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 sm:w-56"
                />
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  + Add User
                </Button>
              </div>
            </div>
          </div>
          <Table className="border-0">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                : filteredUsers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={row.name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800">{row.name}</p>
                            <p className="text-[11px] text-slate-400">{row.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{row.role}</TableCell>
                      <TableCell className="text-slate-500">{row.department ?? "—"}</TableCell>
                      <TableCell>
                        <button type="button" onClick={() => void toggleStatus(row)}>
                          <Badge variant={row.status === "active" ? "success" : "outline"}>
                            {row.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add staff user"
        description="Create a login for reception, doctor, or admin."
        footer={null}
      >
        <form onSubmit={handleAddUser} className="space-y-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="reception">Reception</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </Select>
          {form.role === "doctor" && (
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              required
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label} ({d.code})
                </option>
              ))}
            </Select>
          )}
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create user
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
