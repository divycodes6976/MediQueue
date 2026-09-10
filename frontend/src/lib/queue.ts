export type QueueToken = {
  id: number;
  tokenNumber: string;
  department: string;
  priority: string;
  status: string;
  createdAt?: string | Date;
  patientId?: number | null;
  patientName?: string | null;
  patientAge?: number | null;
  patientPhone?: string | null;
};

export function normalizeQueueToken(raw: unknown): QueueToken | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  const tokenNumber = String(row.tokenNumber ?? row.token_number ?? "").trim();
  if (!Number.isInteger(id) || id <= 0 || !tokenNumber) return null;

  const patientIdRaw = row.patientId ?? row.patient_id;
  const patientAgeRaw = row.patientAge ?? row.patient_age;

  return {
    id,
    tokenNumber,
    department: String(row.department ?? ""),
    priority: String(row.priority ?? ""),
    status: String(row.status ?? ""),
    createdAt: (row.createdAt ?? row.created_at) as string | Date | undefined,
    patientId:
      patientIdRaw == null || patientIdRaw === "" ? null : Number(patientIdRaw),
    patientName: (row.patientName as string | null | undefined) ?? (row.patient_name as string | null | undefined) ?? null,
    patientAge:
      patientAgeRaw == null || patientAgeRaw === "" ? null : Number(patientAgeRaw),
    patientPhone: (row.patientPhone as string | null | undefined) ?? (row.patient_phone as string | null | undefined) ?? null,
  };
}

export function normalizeQueuePayload(payload: unknown): QueueToken[] {
  let rows: unknown[] = [];
  if (Array.isArray(payload)) rows = payload;
  else if (payload && typeof payload === "object") {
    const obj = payload as { queue?: unknown };
    if (Array.isArray(obj.queue)) rows = obj.queue;
  }
  return rows.map(normalizeQueueToken).filter((item): item is QueueToken => item != null);
}

/** 1-based position in sorted waiting queue; null if token not waiting. */
export function getWaitingPosition(queue: QueueToken[], tokenId: number): number | null {
  const index = queue.findIndex((t) => t.id === tokenId);
  if (index === -1) return null;
  return index + 1;
}
