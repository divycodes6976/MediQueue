export function normalizeQueueToken(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = Number(raw.id);
  const tokenNumber = String(raw.tokenNumber ?? raw.token_number ?? "").trim();
  if (!Number.isInteger(id) || id <= 0 || !tokenNumber) return null;

  const patientIdRaw = raw.patientId ?? raw.patient_id;
  const patientAgeRaw = raw.patientAge ?? raw.patient_age;

  return {
    id,
    tokenNumber,
    department: String(raw.department ?? ""),
    priority: String(raw.priority ?? ""),
    status: String(raw.status ?? ""),
    createdAt: raw.createdAt ?? raw.created_at,
    patientId: patientIdRaw == null || patientIdRaw === "" ? null : Number(patientIdRaw),
    patientName: raw.patientName ?? raw.patient_name ?? null,
    patientAge: patientAgeRaw == null || patientAgeRaw === "" ? null : Number(patientAgeRaw),
    patientPhone: raw.patientPhone ?? raw.patient_phone ?? null,
  };
}

export function normalizeQueuePayload(payload) {
  let rows = [];
  if (Array.isArray(payload)) rows = payload;
  else if (payload && typeof payload === "object" && Array.isArray(payload.queue)) {
    rows = payload.queue;
  }
  return rows.map(normalizeQueueToken).filter(Boolean);
}

export function getWaitingPosition(queue, tokenId) {
  const index = queue.findIndex((t) => t.id === tokenId);
  if (index === -1) return null;
  return index + 1;
}
