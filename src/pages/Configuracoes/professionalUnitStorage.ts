import {
  getActiveClinicUnits,
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   PROFISSIONAL × UNIDADE
========================================= */

export interface ProfessionalUnitLink {
  id: string;
  professionalId: number;
  professionalName: string;
  unitId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-professional-units";

/* =========================================
   INICIALIZAÇÃO / MIGRAÇÃO
========================================= */

export function ensureProfessionalUnitLinksInitialized():
  ProfessionalUnitLink[] {
  const current =
    readLinks();

  const professionals =
    getActiveProfessionals();

  const defaultUnitId =
    getDefaultClinicUnitId();

  const now =
    new Date()
      .toISOString();

  let changed =
    false;

  const next = [
    ...current,
  ];

  /*
   * Profissionais já existentes no sistema
   * recebem automaticamente a Unidade Principal.
   * Assim nenhum cadastro atual deixa de aparecer.
   */
  professionals.forEach(
    (
      professional
    ) => {
      const alreadyLinked =
        next.some(
          (
            link
          ) =>
            link.professionalId ===
              professional.id &&
            link.unitId ===
              defaultUnitId
        );

      if (
        alreadyLinked
      ) {
        return;
      }

      next.push(
        {
          id:
            makeLinkId(
              professional.id,
              defaultUnitId
            ),

          professionalId:
            professional.id,

          professionalName:
            professional.name,

          unitId:
            defaultUnitId,

          active:
            true,

          createdAt:
            now,

          updatedAt:
            now,
        }
      );

      changed =
        true;
    }
  );

  if (
    changed ||
    current.length ===
      0
  ) {
    persistLinks(
      next
    );
  }

  return next;
}

/* =========================================
   LISTAGEM
========================================= */

export function getProfessionalUnitLinks():
  ProfessionalUnitLink[] {
  return ensureProfessionalUnitLinksInitialized();
}

export function getProfessionalUnitLinksByProfessionalId(
  professionalId:
    number
) {
  return getProfessionalUnitLinks()
    .filter(
      (
        link
      ) =>
        link.professionalId ===
          professionalId &&
        link.active
    );
}

export function getProfessionalUnitIds(
  professionalId:
    number
) {
  return getProfessionalUnitLinksByProfessionalId(
    professionalId
  ).map(
    (
      link
    ) =>
      link.unitId
  );
}

export function getProfessionalUnitLinksByName(
  professionalName:
    string
) {
  const normalized =
    normalizeName(
      professionalName
    );

  return getProfessionalUnitLinks()
    .filter(
      (
        link
      ) =>
        normalizeName(
          link.professionalName
        ) ===
          normalized &&
        link.active
    );
}

export function getProfessionalUnitIdsByName(
  professionalName:
    string
) {
  return getProfessionalUnitLinksByName(
    professionalName
  ).map(
    (
      link
    ) =>
      link.unitId
  );
}

/* =========================================
   PROFISSIONAIS DA UNIDADE
========================================= */

export function getProfessionalIdsByUnitId(
  unitId:
    number
) {
  return getProfessionalUnitLinks()
    .filter(
      (
        link
      ) =>
        link.unitId ===
          unitId &&
        link.active
    )
    .map(
      (
        link
      ) =>
        link.professionalId
    );
}

export function professionalWorksAtUnit(
  professionalId:
    number,

  unitId:
    number
) {
  return getProfessionalUnitLinks()
    .some(
      (
        link
      ) =>
        link.professionalId ===
          professionalId &&
        link.unitId ===
          unitId &&
        link.active
    );
}

export function professionalNameWorksAtUnit(
  professionalName:
    string,

  unitId:
    number
) {
  const normalized =
    normalizeName(
      professionalName
    );

  return getProfessionalUnitLinks()
    .some(
      (
        link
      ) =>
        normalizeName(
          link.professionalName
        ) ===
          normalized &&
        link.unitId ===
          unitId &&
        link.active
    );
}

/* =========================================
   DEFINIR UNIDADES DO PROFISSIONAL
========================================= */

export function setProfessionalUnits(
  professionalId:
    number,

  unitIds:
    number[]
) {
  const professionals =
    getActiveProfessionals();

  const professional =
    professionals.find(
      (
        item
      ) =>
        item.id ===
        professionalId
    );

  if (
    !professional
  ) {
    throw new Error(
      "Profissional não encontrado."
    );
  }

  const validUnitIds =
    normalizeUnitIds(
      unitIds
    );

  if (
    validUnitIds.length ===
    0
  ) {
    throw new Error(
      "O profissional precisa estar vinculado a pelo menos uma unidade."
    );
  }

  validateActiveUnits(
    validUnitIds
  );

  const current =
    getProfessionalUnitLinks();

  const now =
    new Date()
      .toISOString();

  const withoutProfessional =
    current.filter(
      (
        link
      ) =>
        link.professionalId !==
        professionalId
    );

  const newLinks =
    validUnitIds.map(
      (
        unitId
      ): ProfessionalUnitLink => ({
        id:
          makeLinkId(
            professionalId,
            unitId
          ),

        professionalId,

        professionalName:
          professional.name,

        unitId,

        active:
          true,

        createdAt:
          now,

        updatedAt:
          now,
      })
    );

  const result = [
    ...withoutProfessional,
    ...newLinks,
  ];

  persistLinks(
    result
  );

  return newLinks;
}

/* =========================================
   ADICIONAR VÍNCULO
========================================= */

export function addProfessionalToUnit(
  professionalId:
    number,

  unitId:
    number
) {
  const currentIds =
    getProfessionalUnitIds(
      professionalId
    );

  if (
    currentIds.includes(
      unitId
    )
  ) {
    return;
  }

  return setProfessionalUnits(
    professionalId,
    [
      ...currentIds,
      unitId,
    ]
  );
}

/* =========================================
   REMOVER VÍNCULO
========================================= */

export function removeProfessionalFromUnit(
  professionalId:
    number,

  unitId:
    number
) {
  const currentIds =
    getProfessionalUnitIds(
      professionalId
    );

  return setProfessionalUnits(
    professionalId,
    currentIds.filter(
      (
        id
      ) =>
        id !==
        unitId
    )
  );
}

/* =========================================
   SINCRONIZAR NOMES
========================================= */

export function syncProfessionalUnitNames() {
  const professionals =
    getActiveProfessionals();

  const current =
    getProfessionalUnitLinks();

  const nameMap =
    new Map(
      professionals.map(
        (
          professional
        ) => [
          professional.id,
          professional.name,
        ]
      )
    );

  let changed =
    false;

  const next =
    current.map(
      (
        link
      ) => {
        const currentName =
          nameMap.get(
            link.professionalId
          );

        if (
          !currentName ||
          currentName ===
            link.professionalName
        ) {
          return link;
        }

        changed =
          true;

        return {
          ...link,

          professionalName:
            currentName,

          updatedAt:
            new Date()
              .toISOString(),
        };
      }
    );

  if (
    changed
  ) {
    persistLinks(
      next
    );
  }

  return next;
}

/* =========================================
   STORAGE
========================================= */

function readLinks():
  ProfessionalUnitLink[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      !raw
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      isProfessionalUnitLink
    );
  } catch {
    return [];
  }
}

function persistLinks(
  links:
    ProfessionalUnitLink[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      links
    )
  );
}

function isProfessionalUnitLink(
  value:
    unknown
):
  value is ProfessionalUnitLink {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const link =
    value as
      Partial<
        ProfessionalUnitLink
      >;

  return (
    Number.isFinite(
      Number(
        link.professionalId
      )
    ) &&
    Number.isFinite(
      Number(
        link.unitId
      )
    ) &&
    Boolean(
      link.professionalName
    )
  );
}

function validateActiveUnits(
  unitIds:
    number[]
) {
  const activeIds =
    new Set(
      getActiveClinicUnits()
        .map(
          (
            unit
          ) =>
            unit.id
        )
    );

  const invalid =
    unitIds.find(
      (
        unitId
      ) =>
        !activeIds.has(
          unitId
        )
    );

  if (
    invalid !==
    undefined
  ) {
    throw new Error(
      "Uma das unidades selecionadas está inativa ou não existe."
    );
  }
}

function normalizeUnitIds(
  unitIds:
    number[]
) {
  return Array.from(
    new Set(
      unitIds.filter(
        (
          unitId
        ) =>
          Number.isFinite(
            unitId
          ) &&
          unitId >
            0
      )
    )
  );
}

function makeLinkId(
  professionalId:
    number,

  unitId:
    number
) {
  return `${professionalId}:${unitId}`;
}

function normalizeName(
  value:
    string
) {
  return value
    .trim()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );
}