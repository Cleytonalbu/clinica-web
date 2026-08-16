export type CollaboratorType =
  | "Recepção"
  | "Administrativo"
  | "Serviços gerais"
  | "Contabilidade"
  | "Prestador"
  | "Outro";

export type CollaboratorStatus = "Ativo" | "Inativo";

export interface AdministrativeCollaborator {
  id: string;
  name: string;
  type: CollaboratorType;
  role: string;
  document?: string;
  phone?: string;
  email?: string;
  admissionDate?: string;
  company?: string;
  notes?: string;
  status: CollaboratorStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_administrative_collaborators";

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("administrative-collaborators-changed"));
  }
};

export function getAdministrativeCollaborators(): AdministrativeCollaborator[] {
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

export function saveAdministrativeCollaborators(
  collaborators: AdministrativeCollaborator[],
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collaborators));
  emitChange();
}

export function createAdministrativeCollaborator(
  input: Omit<
    AdministrativeCollaborator,
    "id" | "createdAt" | "updatedAt"
  >,
): AdministrativeCollaborator {
  const now = new Date().toISOString();

  const collaborator: AdministrativeCollaborator = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getAdministrativeCollaborators();
  saveAdministrativeCollaborators([collaborator, ...current]);

  return collaborator;
}

export function updateAdministrativeCollaborator(
  id: string,
  changes: Partial<
    Omit<AdministrativeCollaborator, "id" | "createdAt">
  >,
) {
  const current = getAdministrativeCollaborators();

  const updated = current.map((collaborator) =>
    collaborator.id === id
      ? {
          ...collaborator,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : collaborator,
  );

  saveAdministrativeCollaborators(updated);
}

export function setAdministrativeCollaboratorStatus(
  id: string,
  status: CollaboratorStatus,
) {
  updateAdministrativeCollaborator(id, { status });
}