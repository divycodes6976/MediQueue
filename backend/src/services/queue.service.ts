import { db } from "../config/db";
import { tokens, logs, patients } from "../config/schema";
import { desc, eq, sql } from "drizzle-orm";
import { publisher } from "../config/redis";

/** Postgres tx client — same methods as `db` inside `db.transaction`. */
type DbExecutor = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

const QUEUE_UPDATED_CHANNEL = "QUEUE_UPDATED";

type QueueTokenWithPatient = typeof tokens.$inferSelect & {
  patientName: string | null;
  patientAge: number | null;
  patientPhone: string | null;
  chiefComplaint: string | null;
};

/** Redis publish → queueSubscriber SSE broadcast. */
export async function notifyQueueUpdate(department: string): Promise<void> {
  const normalizedDepartment = department.trim().toUpperCase();
  const updatedQueue = await getQueue(normalizedDepartment);
  try {
    await publisher.publish(
      QUEUE_UPDATED_CHANNEL,
      JSON.stringify({
        department: normalizedDepartment,
        queue: updatedQueue,
      })
    );
  } catch (e) {
    console.error("[notifyQueueUpdate] Redis publish failed:", e);
  }
}



// Department ke tokens uthata hai
// WAITING wale rakhta hai
// Priority ke basis pe sort karta hai
// Same priority me jo pehle aaya → pehle

export const getQueue = async (
  department: string,
  executor: DbExecutor | typeof db = db
): Promise<QueueTokenWithPatient[]> => {
  const normalizedDepartment = department.trim().toUpperCase();

  const waitingTokens = await executor
    .select({
      id: tokens.id,
      tokenNumber: tokens.tokenNumber,
      patientId: tokens.patientId,
      department: tokens.department,
      status: tokens.status,
      priority: tokens.priority,
      createdAt: tokens.createdAt,
      patientName: patients.name,
      patientAge: patients.age,
      patientPhone: patients.phone,
      chiefComplaint: patients.chiefComplaint,
    })
    .from(tokens)
    .leftJoin(patients, eq(tokens.patientId, patients.id))
    .where(
      sql`${tokens.department} = ${normalizedDepartment} AND ${tokens.status} = 'waiting'`
    );

  return sortWaitingQueue(waitingTokens);
};

const PRIORITY_ORDER: Record<string, number> = {
  EMERGENCY: 3,
  SENIOR: 2,
  NORMAL: 1,
};

function sortWaitingQueue<T extends { priority: string; createdAt: string | Date }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (PRIORITY_ORDER[b.priority] !== PRIORITY_ORDER[a.priority]) {
      return (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export const getAllWaiting = async (): Promise<QueueTokenWithPatient[]> => {
  const waitingTokens = await db
    .select({
      id: tokens.id,
      tokenNumber: tokens.tokenNumber,
      patientId: tokens.patientId,
      department: tokens.department,
      status: tokens.status,
      priority: tokens.priority,
      createdAt: tokens.createdAt,
      patientName: patients.name,
      patientAge: patients.age,
      patientPhone: patients.phone,
      chiefComplaint: patients.chiefComplaint,
    })
    .from(tokens)
    .leftJoin(patients, eq(tokens.patientId, patients.id))
    .where(sql`${tokens.status} = 'waiting'`);

  return sortWaitingQueue(waitingTokens);
};


export const callNext = async (department: string) => {
  const normalizedDepartment = department.trim().toUpperCase();

  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${normalizedDepartment}::text)::bigint)`
    );

    const queue = await getQueue(normalizedDepartment, tx);

    if (queue.length === 0) {
      return null;
    }

    const nextToken = queue[0];

    const updated = await tx
      .update(tokens)
      .set({ status: "IN_PROGRESS" })
      .where(eq(tokens.id, nextToken.id))
      .returning();

    const existingLog = await tx
      .select({ id: logs.id })
      .from(logs)
      .where(eq(logs.tokenId, nextToken.id))
      .orderBy(desc(logs.id))
      .limit(1);

    if (existingLog.length > 0) {
      await tx
        .update(logs)
        .set({ callTime: new Date() })
        .where(eq(logs.id, existingLog[0].id));
    } else {
      await tx.insert(logs).values({
        tokenId: nextToken.id,
        issueTime: nextToken.createdAt,
        callTime: new Date(),
        endTime: null,
      });
    }

    return updated[0] ?? { ...nextToken, status: "IN_PROGRESS" };
  });

  if (result !== null) {
    await notifyQueueUpdate(normalizedDepartment);

    const enriched = await db
      .select({
        id: tokens.id,
        tokenNumber: tokens.tokenNumber,
        patientId: tokens.patientId,
        department: tokens.department,
        status: tokens.status,
        priority: tokens.priority,
        createdAt: tokens.createdAt,
        patientName: patients.name,
        patientAge: patients.age,
        patientPhone: patients.phone,
        chiefComplaint: patients.chiefComplaint,
      })
      .from(tokens)
      .leftJoin(patients, eq(tokens.patientId, patients.id))
      .where(eq(tokens.id, result.id))
      .limit(1);

    return enriched[0] ?? result;
  }

  return result;
};



export const completeToken = async (
  tokenId: number,
  action: "DONE" | "SKIPPED"
) => {
  const row = await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT id FROM tokens WHERE id = ${tokenId} FOR UPDATE`
    );

    const updatedToken = await tx
      .update(tokens)
      .set({ status: action })
      .where(eq(tokens.id, tokenId))
      .returning();

    if (updatedToken.length === 0) {
      return null;
    }

    const existinglog = await tx
      .select()
      .from(logs)
      .where(eq(logs.tokenId, tokenId))
      .orderBy(desc(logs.id))
      .limit(1);

    if (existinglog.length > 0) {
      const lastLog = existinglog[0];
      await tx
        .update(logs)
        .set({ endTime: new Date() })
        .where(eq(logs.id, lastLog.id));
    } else {
      await tx.insert(logs).values({
        tokenId,
        issueTime: updatedToken[0].createdAt,
        callTime: new Date(),
        endTime: new Date(),
      });
    }

    return updatedToken[0];
  });

  if (!row) {
    return null;
  }

  await notifyQueueUpdate(row.department);

  return { tokenId, status: action };
};
