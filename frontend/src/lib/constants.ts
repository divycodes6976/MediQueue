export type Priority = "Normal" | "Senior" | "Emergency";

export type DepartmentOption = {
  label: string;
  value: string;
  code: string;
};

export const DEPARTMENTS: DepartmentOption[] = [
  { label: "Orthopedic", value: "Orthopedic", code: "ORTH" },
  { label: "Dental", value: "Dental", code: "DENT" },
  { label: "Cardiology", value: "Cardiology", code: "CARD" },
  { label: "Neurology", value: "Neurology", code: "NEUR" },
  { label: "General Medicine", value: "General Medicine", code: "GEN" },
];

export const CODE_TO_DEPARTMENT_VALUE: Record<string, string> = {
  DENT: "Dental",
  ORTH: "Orthopedic",
  CARD: "Cardiology",
  NEUR: "Neurology",
  GEN: "General Medicine",
};

export const DEPT_LABELS: Record<string, string> = {
  DENT: "Dental",
  ORTH: "Orthopedic",
  CARD: "Cardiology",
  NEUR: "Neurology",
  GEN: "General Medicine",
};

export const PRIORITIES: Priority[] = ["Normal", "Senior", "Emergency"];

export const priorityToApi = (p: Priority): string => {
  if (p === "Emergency") return "EMERGENCY";
  if (p === "Senior") return "SENIOR";
  return "NORMAL";
};

export const apiToUiPriority = (raw: string): Priority => {
  const u = raw.toUpperCase();
  if (u === "EMERGENCY") return "Emergency";
  if (u === "SENIOR") return "Senior";
  return "Normal";
};
