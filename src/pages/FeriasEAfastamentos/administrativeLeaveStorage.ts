export type AdministrativeLeaveType =
  | "Férias"
  | "Atestado"
  | "Licença"
  | "Folga"
  | "Afastamento"
  | "Outro";

export type AdministrativeLeaveStatus =
  | "Programado"
  | "Em andamento"
  | "Concluído"
  | "Cancelado";

export interface AdministrativeLeave {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  collaboratorRole: string;
  type: AdministrativeLeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  notes?: string;
  status: AdministrativeLeaveStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_administrative_leaves";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("administrative-leaves-changed"),
    );
  }
}

export function getAdministrativeLeaves(): AdministrativeLeave[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAdministrativeLeaves(
  leaves: AdministrativeLeave[],
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(leaves),
  );

  emitChange();
}

export function createAdministrativeLeave(
  input: Omit<
    AdministrativeLeave,
    "id" | "createdAt" | "updatedAt"
  >,
): AdministrativeLeave {
  const now = new Date().toISOString();

  const leave: AdministrativeLeave = {
    ...input,
    id:
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getAdministrativeLeaves();

  saveAdministrativeLeaves([
    leave,
    ...current,
  ]);

  return leave;
}

export function updateAdministrativeLeave(
  id: string,
  changes: Partial<
    Omit<AdministrativeLeave, "id" | "createdAt">
  >,
) {
  const current = getAdministrativeLeaves();

  const updated = current.map((leave) =>
    leave.id === id
      ? {
          ...leave,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : leave,
  );

  saveAdministrativeLeaves(updated);
}

export function cancelAdministrativeLeave(id: string) {
  updateAdministrativeLeave(id, {
    status: "Cancelado",
  });
}