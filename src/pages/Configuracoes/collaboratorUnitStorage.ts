import {
  getActiveClinicUnits,
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

/* =========================================
   COLABORADOR × UNIDADE
========================================= */

export interface CollaboratorUnitLink {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  unitId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entre-afetos-collaborator-units";

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("collaborator-units-changed"));
  }
};

/* =========================================
   INICIALIZAÇÃO / MIGRAÇÃO
========================================= */

export function ensureCollaboratorUnitLinksInitialized():
  CollaboratorUnitLink[] {
  if (typeof window === "undefined") return [];

  const current = readLinks();
  const collaborators = getAdministrativeCollaborators();
  const defaultUnitId = getDefaultClinicUnitId();
  const now = new Date().toISOString();

  let changed = false;
  const next = [...current];

  /*
   * Cadastros antigos possuíam apenas collaborator.unitId.
   * Esse valor é preservado como o primeiro vínculo do colaborador.
   */
  collaborators.forEach((collaborator) => {
    const legacyUnitId =
      Number.isFinite(Number(collaborator.unitId)) &&
      Number(collaborator.unitId) > 0
        ? Number(collaborator.unitId)
        : defaultUnitId;

    const hasAnyLink = next.some(
      (link) =>
        link.collaboratorId === collaborator.id &&
        link.active,
    );

    if (hasAnyLink) return;

    next.push({
      id: makeLinkId(collaborator.id, legacyUnitId),
      collaboratorId: collaborator.id,
      collaboratorName: collaborator.name,
      unitId: legacyUnitId,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    changed = true;
  });

  if (changed || (current.length === 0 && collaborators.length > 0)) {
    persistLinks(next);
  }

  return next;
}

/* =========================================
   LISTAGEM
========================================= */

export function getCollaboratorUnitLinks(): CollaboratorUnitLink[] {
  return ensureCollaboratorUnitLinksInitialized();
}

export function getCollaboratorUnitLinksByCollaboratorId(
  collaboratorId: string,
) {
  return getCollaboratorUnitLinks().filter(
    (link) =>
      link.collaboratorId === collaboratorId &&
      link.active,
  );
}

export function getCollaboratorUnitIds(
  collaboratorId: string,
) {
  return getCollaboratorUnitLinksByCollaboratorId(
    collaboratorId,
  ).map((link) => link.unitId);
}

export function getCollaboratorIdsByUnitId(unitId: number) {
  return getCollaboratorUnitLinks()
    .filter(
      (link) =>
        link.unitId === unitId &&
        link.active,
    )
    .map((link) => link.collaboratorId);
}

export function collaboratorWorksAtUnit(
  collaboratorId: string,
  unitId: number,
) {
  return getCollaboratorUnitLinks().some(
    (link) =>
      link.collaboratorId === collaboratorId &&
      link.unitId === unitId &&
      link.active,
  );
}

/* =========================================
   DEFINIR UNIDADES DO COLABORADOR
========================================= */

export function setCollaboratorUnits(
  collaboratorId: string,
  unitIds: number[],
) {
  const collaborators = getAdministrativeCollaborators();
  const collaborator = collaborators.find(
    (item) => item.id === collaboratorId,
  );

  if (!collaborator) {
    throw new Error("Colaborador não encontrado.");
  }

  const validUnitIds = normalizeUnitIds(unitIds);

  if (validUnitIds.length === 0) {
    throw new Error(
      "O colaborador precisa estar vinculado a pelo menos uma unidade.",
    );
  }

  validateActiveUnits(validUnitIds);

  const current = getCollaboratorUnitLinks();
  const now = new Date().toISOString();

  const withoutCollaborator = current.filter(
    (link) => link.collaboratorId !== collaboratorId,
  );

  const newLinks = validUnitIds.map(
    (unitId): CollaboratorUnitLink => ({
      id: makeLinkId(collaboratorId, unitId),
      collaboratorId,
      collaboratorName: collaborator.name,
      unitId,
      active: true,
      createdAt: now,
      updatedAt: now,
    }),
  );

  const result = [
    ...withoutCollaborator,
    ...newLinks,
  ];

  persistLinks(result);
  emitChange();

  return newLinks;
}

export function addCollaboratorToUnit(
  collaboratorId: string,
  unitId: number,
) {
  const currentIds = getCollaboratorUnitIds(collaboratorId);

  if (currentIds.includes(unitId)) return;

  return setCollaboratorUnits(collaboratorId, [
    ...currentIds,
    unitId,
  ]);
}

export function removeCollaboratorFromUnit(
  collaboratorId: string,
  unitId: number,
) {
  const currentIds = getCollaboratorUnitIds(collaboratorId);
  const nextIds = currentIds.filter((id) => id !== unitId);

  return setCollaboratorUnits(collaboratorId, nextIds);
}

/* =========================================
   SINCRONIZAR NOMES
========================================= */

export function syncCollaboratorUnitNames() {
  const collaborators = getAdministrativeCollaborators();
  const current = getCollaboratorUnitLinks();

  const nameMap = new Map(
    collaborators.map((collaborator) => [
      collaborator.id,
      collaborator.name,
    ]),
  );

  let changed = false;

  const next = current.map((link) => {
    const currentName = nameMap.get(link.collaboratorId);

    if (!currentName || currentName === link.collaboratorName) {
      return link;
    }

    changed = true;

    return {
      ...link,
      collaboratorName: currentName,
      updatedAt: new Date().toISOString(),
    };
  });

  if (changed) {
    persistLinks(next);
    emitChange();
  }

  return next;
}

/* =========================================
   STORAGE
========================================= */

function readLinks(): CollaboratorUnitLink[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCollaboratorUnitLink);
  } catch {
    return [];
  }
}

function persistLinks(links: CollaboratorUnitLink[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(links),
  );
}

function isCollaboratorUnitLink(
  value: unknown,
): value is CollaboratorUnitLink {
  if (!value || typeof value !== "object") return false;

  const link = value as Partial<CollaboratorUnitLink>;

  return (
    typeof link.collaboratorId === "string" &&
    Boolean(link.collaboratorId) &&
    Boolean(link.collaboratorName) &&
    Number.isFinite(Number(link.unitId)) &&
    Number(link.unitId) > 0
  );
}

function validateActiveUnits(unitIds: number[]) {
  const activeIds = new Set(
    getActiveClinicUnits().map((unit) => unit.id),
  );

  const invalid = unitIds.find(
    (unitId) => !activeIds.has(unitId),
  );

  if (invalid !== undefined) {
    throw new Error(
      "Uma das unidades selecionadas está inativa ou não existe.",
    );
  }
}

function normalizeUnitIds(unitIds: number[]) {
  return Array.from(
    new Set(
      unitIds
        .map((unitId) => Number(unitId))
        .filter(
          (unitId) =>
            Number.isFinite(unitId) &&
            unitId > 0,
        ),
    ),
  );
}

function makeLinkId(
  collaboratorId: string,
  unitId: number,
) {
  return `${collaboratorId}::${unitId}`;
}
