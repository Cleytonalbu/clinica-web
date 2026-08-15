import {
  getActiveClinicUnits,
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

import type {
  AuthUser,
  StoredUser,
} from "@/auth/authStorage";

import {
  getProfessionalUnitIdsByName,
} from "@/pages/Configuracoes/professionalUnitStorage";

/* =========================================
   USUÁRIO × UNIDADE
========================================= */

export interface UserUnitAccess {
  userId: number;
  unitIds: number[];
  allUnits: boolean;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-user-unit-access";

/* =========================================
   OBTER ACESSO
========================================= */

export function getUserUnitAccess(
  user:
    AuthUser |
    StoredUser
):
  UserUnitAccess {
  const explicit =
    readAccessList()
      .find(
        (
          item
        ) =>
          item.userId ===
          user.id
      );

  if (
    explicit
  ) {
    return sanitizeAccess(
      explicit
    );
  }

  return createDefaultAccess(
    user
  );
}

/* =========================================
   UNIDADES PERMITIDAS
========================================= */

export function getAllowedUnitIdsForUser(
  user:
    AuthUser |
    StoredUser
) {
  const access =
    getUserUnitAccess(
      user
    );

  if (
    access.allUnits
  ) {
    return getActiveClinicUnits()
      .map(
        (
          unit
        ) =>
          unit.id
      );
  }

  return access.unitIds;
}

export function userCanAccessUnit(
  user:
    AuthUser |
    StoredUser,

  unitId:
    number
) {
  return getAllowedUnitIdsForUser(
    user
  ).includes(
    unitId
  );
}

/* =========================================
   DEFINIR ACESSO
========================================= */

export function setUserUnitAccess(
  userId:
    number,

  data: {
    unitIds?:
      number[];

    allUnits?:
      boolean;
  }
):
  UserUnitAccess {
  const allUnits =
    Boolean(
      data.allUnits
    );

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

  const unitIds =
    allUnits
      ? []
      : Array.from(
          new Set(
            (
              data.unitIds ??
              []
            ).filter(
              (
                unitId
              ) =>
                activeIds.has(
                  unitId
                )
            )
          )
        );

  if (
    !allUnits &&
    unitIds.length ===
      0
  ) {
    throw new Error(
      "O usuário precisa ter acesso a pelo menos uma unidade."
    );
  }

  const access:
    UserUnitAccess = {
    userId,
    unitIds,
    allUnits,
    updatedAt:
      new Date()
        .toISOString(),
  };

  const current =
    readAccessList();

  const exists =
    current.some(
      (
        item
      ) =>
        item.userId ===
        userId
    );

  const next =
    exists
      ? current.map(
          (
            item
          ) =>
            item.userId ===
            userId
              ? access
              : item
        )
      : [
          ...current,
          access,
        ];

  persistAccessList(
    next
  );

  return access;
}

/* =========================================
   REMOVER CONFIGURAÇÃO EXPLÍCITA
========================================= */

export function clearUserUnitAccess(
  userId:
    number
) {
  const next =
    readAccessList()
      .filter(
        (
          item
        ) =>
          item.userId !==
          userId
      );

  persistAccessList(
    next
  );
}

/* =========================================
   REGRA PADRÃO
========================================= */

/*
 * Gestor:
 *   acesso a todas as unidades.
 *
 * Profissional:
 *   acesso às unidades vinculadas ao cadastro
 *   profissional. Se ainda não houver vínculo,
 *   cai na Unidade Principal.
 *
 * Recepção:
 *   começa na Unidade Principal. Depois o gestor
 *   poderá liberar uma ou mais unidades.
 */
function createDefaultAccess(
  user:
    AuthUser |
    StoredUser
):
  UserUnitAccess {
  const now =
    new Date()
      .toISOString();

  if (
    user.profile ===
    "Gestor"
  ) {
    return {
      userId:
        user.id,

      unitIds:
        [],

      allUnits:
        true,

      updatedAt:
        now,
    };
  }

  if (
    user.profile ===
    "Profissional"
  ) {
    const name =
      user.professionalName ??
      user.name;

    const professionalUnitIds =
      getProfessionalUnitIdsByName(
        name
      );

    return {
      userId:
        user.id,

      unitIds:
        professionalUnitIds.length >
        0
          ? professionalUnitIds
          : [
              getDefaultClinicUnitId(),
            ],

      allUnits:
        false,

      updatedAt:
        now,
    };
  }

  return {
    userId:
      user.id,

    unitIds: [
      getDefaultClinicUnitId(),
    ],

    allUnits:
      false,

    updatedAt:
      now,
  };
}

/* =========================================
   STORAGE
========================================= */

function readAccessList():
  UserUnitAccess[] {
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
      isUserUnitAccess
    );
  } catch {
    return [];
  }
}

function persistAccessList(
  access:
    UserUnitAccess[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      access
    )
  );
}

function sanitizeAccess(
  access:
    UserUnitAccess
):
  UserUnitAccess {
  if (
    access.allUnits
  ) {
    return {
      ...access,
      unitIds:
        [],
    };
  }

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

  const unitIds =
    access.unitIds
      .filter(
        (
          unitId
        ) =>
          activeIds.has(
            unitId
          )
      );

  return {
    ...access,

    unitIds:
      unitIds.length >
      0
        ? unitIds
        : [
            getDefaultClinicUnitId(),
          ],
  };
}

function isUserUnitAccess(
  value:
    unknown
):
  value is UserUnitAccess {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const access =
    value as
      Partial<
        UserUnitAccess
      >;

  return (
    Number.isFinite(
      Number(
        access.userId
      )
    ) &&
    Array.isArray(
      access.unitIds
    ) &&
    typeof access.allUnits ===
      "boolean"
  );
}