export const DEPARTMENTS = [
  { label: "Orthopedic", value: "Orthopedic", code: "ORTH" },
  { label: "Dental", value: "Dental", code: "DENT" },
  { label: "Cardiology", value: "Cardiology", code: "CARD" },
  { label: "Neurology", value: "Neurology", code: "NEUR" },
  { label: "General Medicine", value: "General Medicine", code: "GEN" },
];

export const CODE_TO_DEPARTMENT_VALUE = {
  DENT: "Dental",
  ORTH: "Orthopedic",
  CARD: "Cardiology",
  NEUR: "Neurology",
  GEN: "General Medicine",
};

export const DEPT_LABELS = {
  DENT: "Dental",
  ORTH: "Orthopedic",
  CARD: "Cardiology",
  NEUR: "Neurology",
  GEN: "General Medicine",
};

export const PRIORITIES = ["Normal", "Senior", "Emergency"];

export function priorityToApi(p) {
  if (p === "Emergency") return "EMERGENCY";
  if (p === "Senior") return "SENIOR";
  return "NORMAL";
}

export function apiToUiPriority(raw) {
  const u = String(raw ?? "").toUpperCase();
  if (u === "EMERGENCY") return "Emergency";
  if (u === "SENIOR") return "Senior";
  return "Normal";
}
