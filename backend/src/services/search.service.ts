import { sql } from "drizzle-orm";
import { db } from "../config/db";
import { patients, tokens, users } from "../config/schema";
import { getAllWaiting, getQueue } from "./queue.service";
import type { AppRole } from "../types/express";

export type SearchHit = {
  type: "token" | "patient" | "staff";
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

export async function searchStaffDirectory(query: string, role: AppRole, department: string | null) {
  const q = query.trim();
  if (q.length < 1) {
    return { results: [] as SearchHit[] };
  }

  const pattern = `%${q.replace(/[%_]/g, "\\$&")}%`;
  const doctorDept = role === "doctor" ? (department ?? "").trim().toUpperCase() : null;

  const tokenRows = await db
    .select({
      id: tokens.id,
      tokenNumber: tokens.tokenNumber,
      department: tokens.department,
      status: tokens.status,
      patientName: patients.name,
    })
    .from(tokens)
    .leftJoin(patients, sql`${tokens.patientId} = ${patients.id}`)
    .where(
      doctorDept
        ? sql`(
            ${tokens.tokenNumber} ilike ${pattern}
            or coalesce(${patients.name}, '') ilike ${pattern}
          ) and ${tokens.department} = ${doctorDept}`
        : sql`${tokens.tokenNumber} ilike ${pattern} or coalesce(${patients.name}, '') ilike ${pattern}`
    )
    .limit(8);

  const results: SearchHit[] = tokenRows.map((row) => ({
    type: "token" as const,
    id: row.id,
    title: row.tokenNumber,
    subtitle: [row.patientName ?? "Patient", row.department, row.status].filter(Boolean).join(" · "),
    href: `/track/${encodeURIComponent(row.tokenNumber)}`,
  }));

  if (role === "admin") {
    const staffRows = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        department: users.department,
        email: users.email,
      })
      .from(users)
      .where(
        sql`${users.name} ilike ${pattern} or coalesce(${users.email}, '') ilike ${pattern}`
      )
      .limit(5);

    for (const row of staffRows) {
      results.push({
        type: "staff",
        id: row.id,
        title: row.name,
        subtitle: [row.role, row.department, row.email].filter(Boolean).join(" · "),
        href: "/admin#doctors",
      });
    }
  }

  return { results: results.slice(0, 10) };
}

export type AlertItem = {
  id: string;
  title: string;
  subtitle: string;
  tone: "danger" | "warning" | "info";
  href: string;
};

export async function getStaffAlerts(role: AppRole, department: string | null): Promise<AlertItem[]> {
  const doctorDept = role === "doctor" ? (department ?? "").trim().toUpperCase() : null;
  const waiting = doctorDept ? await getQueue(doctorDept) : await getAllWaiting();
  const alerts: AlertItem[] = [];

  const emergencies = waiting.filter((t) => t.priority.toUpperCase() === "EMERGENCY");
  for (const token of emergencies.slice(0, 5)) {
    alerts.push({
      id: `em-${token.id}`,
      title: `Emergency · ${token.tokenNumber}`,
      subtitle: `${token.patientName ?? "Patient"} · ${token.department}`,
      tone: "danger",
      href: role === "doctor" ? "/doctor" : role === "reception" ? "/reception" : "/admin",
    });
  }

  if (waiting.length > 0 && emergencies.length === 0) {
    alerts.push({
      id: "wait-count",
      title: `${waiting.length} patient${waiting.length === 1 ? "" : "s"} waiting`,
      subtitle: doctorDept ? `Department ${doctorDept}` : "Across OPD queues",
      tone: waiting.length > 8 ? "warning" : "info",
      href: role === "doctor" ? "/doctor" : role === "reception" ? "/reception" : "/admin",
    });
  }

  return alerts;
}
