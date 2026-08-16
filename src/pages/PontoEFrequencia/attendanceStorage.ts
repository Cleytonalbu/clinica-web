export type AttendanceStatus =
  | "Presente"
  | "Atraso"
  | "Falta"
  | "Justificado";

export interface AttendanceRecord {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  collaboratorRole: string;
  date: string;
  entryTime?: string;
  exitTime?: string;
  status: AttendanceStatus;
  justification?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_administrative_attendance";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("administrative-attendance-changed"));
  }
}

export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttendanceRecords(records: AttendanceRecord[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  emitChange();
}

export function createAttendanceRecord(
  input: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">,
): AttendanceRecord {
  const now = new Date().toISOString();

  const record: AttendanceRecord = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getAttendanceRecords();
  saveAttendanceRecords([record, ...current]);

  return record;
}

export function updateAttendanceRecord(
  id: string,
  changes: Partial<Omit<AttendanceRecord, "id" | "createdAt">>,
) {
  const current = getAttendanceRecords();

  const updated = current.map((record) =>
    record.id === id
      ? {
          ...record,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : record,
  );

  saveAttendanceRecords(updated);
}