import { sql } from "drizzle-orm";
import { db } from "../config/db";
import { logs, patients, tokens, users } from "../config/schema";

export type ChartPoint = { label: string; value: number };

export type AdminStats = {
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

export async function getAdminStats(): Promise<AdminStats> {
  const [
    todayAppointmentsRow,
    waitingRow,
    servedRow,
    doctorsRow,
    adminRow,
    emergencyRow,
    avgWaitRow,
    deptRows,
    hourlyRegRows,
    hourlyWaitRows,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(tokens)
      .where(sql`${tokens.createdAt} >= date_trunc('day', now())`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tokens)
      .where(sql`${tokens.status} = 'waiting'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tokens)
      .where(
        sql`${tokens.status} IN ('DONE', 'SKIPPED') AND ${tokens.createdAt} >= date_trunc('day', now())`
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.role} = 'doctor' AND coalesce(${users.status}, 'active') = 'active'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.role} = 'admin'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tokens)
      .where(sql`${tokens.status} = 'waiting' AND upper(${tokens.priority}) = 'EMERGENCY'`),
    db
      .select({
        minutes: sql<number | null>`avg(extract(epoch from (${logs.callTime} - ${logs.issueTime})) / 60.0)`,
      })
      .from(logs)
      .where(sql`${logs.callTime} is not null AND ${logs.callTime} >= date_trunc('day', now())`),
    db
      .select({
        department: tokens.department,
        count: sql<number>`count(*)`,
      })
      .from(tokens)
      .where(sql`${tokens.status} = 'waiting'`)
      .groupBy(tokens.department)
      .orderBy(sql`count(*) desc`),
    db
      .select({
        hour: sql<string>`to_char(date_trunc('hour', ${tokens.createdAt}), 'HH24:00')`,
        count: sql<number>`count(*)`,
      })
      .from(tokens)
      .where(sql`${tokens.createdAt} >= date_trunc('day', now())`)
      .groupBy(sql`date_trunc('hour', ${tokens.createdAt})`)
      .orderBy(sql`date_trunc('hour', ${tokens.createdAt})`),
    db
      .select({
        hour: sql<string>`to_char(date_trunc('hour', ${logs.callTime}), 'HH24:00')`,
        minutes: sql<number>`avg(extract(epoch from (${logs.callTime} - ${logs.issueTime})) / 60.0)`,
      })
      .from(logs)
      .where(sql`${logs.callTime} is not null AND ${logs.callTime} >= date_trunc('day', now())`)
      .groupBy(sql`date_trunc('hour', ${logs.callTime})`)
      .orderBy(sql`date_trunc('hour', ${logs.callTime})`),
  ]);

  const todayAppointments = Number(todayAppointmentsRow[0]?.count ?? 0);
  const patientsWaiting = Number(waitingRow[0]?.count ?? 0);
  const servedToday = Number(servedRow[0]?.count ?? 0);
  const activeDoctors = Number(doctorsRow[0]?.count ?? 0);
  const totalAdminStaff = Number(adminRow[0]?.count ?? 0);
  const emergencyWaiting = Number(emergencyRow[0]?.count ?? 0);
  const avgRaw = avgWaitRow[0]?.minutes;
  const avgWaitMinutes =
    avgRaw == null || Number.isNaN(Number(avgRaw)) ? null : Math.round(Number(avgRaw));

  const totalWaitingAcrossDepts = deptRows.reduce((sum, r) => sum + Number(r.count ?? 0), 0);
  const departmentBreakdown = deptRows.map((r) => {
    const count = Number(r.count ?? 0);
    const percent = totalWaitingAcrossDepts > 0 ? Math.round((count / totalWaitingAcrossDepts) * 100) : 0;
    return {
      name: String(r.department ?? "").trim().toUpperCase(),
      count,
      percent,
    };
  });

  const registrationsByHour: ChartPoint[] = hourlyRegRows.map((r) => ({
    label: r.hour,
    value: Number(r.count ?? 0),
  }));

  const waitByHour: ChartPoint[] = hourlyWaitRows.map((r) => ({
    label: r.hour,
    value: Math.round(Number(r.minutes ?? 0)),
  }));

  return {
    todayAppointments,
    patientsWaiting,
    servedToday,
    activeDoctors,
    totalAdminStaff,
    emergencyWaiting,
    avgWaitMinutes,
    departmentBreakdown,
    registrationsByHour,
    waitByHour,
  };
}

export type AdminUserRow = {
  id: number;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
  status: string;
};

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      status: users.status,
    })
    .from(users)
    .orderBy(users.id);
}

export async function getAdminCounts(): Promise<{ patients: number; tokens: number }> {
  const [patientsRow, tokensRow] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(patients),
    db.select({ count: sql<number>`count(*)` }).from(tokens),
  ]);

  return {
    patients: Number(patientsRow[0]?.count ?? 0),
    tokens: Number(tokensRow[0]?.count ?? 0),
  };
}
