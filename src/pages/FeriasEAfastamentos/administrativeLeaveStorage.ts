import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

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

  /* Unidade à qual o afastamento pertence. */
  unitId: number;

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

    if (!Array.isArray(parsed)) {
      return [];
    }

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed = false;

    const normalized =
      parsed.map((leave) => {
        const unitId =
          Number(leave?.unitId);

        if (
          Number.isFinite(unitId) &&
          unitId > 0
        ) {
          return {
            ...leave,
            unitId,
          } as AdministrativeLeave;
        }

        changed = true;

        return {
          ...leave,
          unitId:
            defaultUnitId,
        } as AdministrativeLeave;
      });

    if (changed) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized),
      );
    }

    return normalized;
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
    "id" | "createdAt" | "updatedAt" | "unitId"
  > & {
    unitId?: number;
  },
): AdministrativeLeave {
  const now = new Date().toISOString();

  const leave: AdministrativeLeave = {
    ...input,
    unitId:
      Number.isFinite(
        Number(input.unitId),
      ) &&
      Number(input.unitId) > 0
        ? Number(input.unitId)
        : getDefaultClinicUnitId(),
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