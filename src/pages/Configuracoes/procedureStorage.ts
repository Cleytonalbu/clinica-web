export interface ProcedureSetting {
  id: number;
  unitId: number;
  name: string;
  specialtyId: number;
  specialtyName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-procedures";

export const PROCEDURES_CHANGED_EVENT =
  "entre-afetos:procedures-changed";

function notifyChanged() {
  window.dispatchEvent(
    new CustomEvent(
      PROCEDURES_CHANGED_EVENT
    )
  );
}

export function getProcedures():
  ProcedureSetting[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveProcedures(
  items:
    ProcedureSetting[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items
    )
  );

  notifyChanged();
}

export function getActiveProceduresByUnit(
  unitId:
    number
) {
  return getProcedures()
    .filter(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.active
    )
    .sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name,
          "pt-BR"
        )
    );
}

export function getActiveProceduresBySpecialty(
  unitId:
    number,

  specialtyName:
    string
) {
  return getActiveProceduresByUnit(
    unitId
  )
    .filter(
      (
        item
      ) =>
        item.specialtyName ===
        specialtyName
    );
}

export function createProcedure({
  unitId,
  name,
  specialtyId,
  specialtyName,
}: {
  unitId: number;
  name: string;
  specialtyId: number;
  specialtyName: string;
}) {
  const normalizedName =
    name.trim();

  if (
    !normalizedName
  ) {
    throw new Error(
      "Informe o nome do procedimento."
    );
  }

  if (
    !specialtyId ||
    !specialtyName
  ) {
    throw new Error(
      "Selecione a especialidade do procedimento."
    );
  }

  const current =
    getProcedures();

  const duplicate =
    current.some(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.specialtyId ===
          specialtyId &&
        item.name
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          ) ===
          normalizedName
            .toLocaleLowerCase(
              "pt-BR"
            )
    );

  if (
    duplicate
  ) {
    throw new Error(
      "Já existe este procedimento para a especialidade."
    );
  }

  const now =
    new Date()
      .toISOString();

  const item:
    ProcedureSetting = {
    id:
      Date.now(),

    unitId,

    name:
      normalizedName,

    specialtyId,

    specialtyName,

    active:
      true,

    createdAt:
      now,

    updatedAt:
      now,
  };

  saveProcedures(
    [
      ...current,
      item,
    ]
  );

  return item;
}

export function updateProcedure(
  id:
    number,

  data:
    Partial<
      Pick<
        ProcedureSetting,
        | "name"
        | "specialtyId"
        | "specialtyName"
        | "active"
      >
    >
) {
  const current =
    getProcedures();

  const existing =
    current.find(
      (
        item
      ) =>
        item.id ===
        id
    );

  if (
    !existing
  ) {
    throw new Error(
      "Procedimento não encontrado."
    );
  }

  const next =
    current.map(
      (
        item
      ) =>
        item.id ===
          id
          ? {
              ...item,

              ...data,

              name:
                data.name !==
                  undefined
                  ? data.name.trim()
                  : item.name,

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : item
    );

  saveProcedures(
    next
  );
}

export function toggleProcedure(
  id:
    number
) {
  const current =
    getProcedures();

  const item =
    current.find(
      (
        currentItem
      ) =>
        currentItem.id ===
        id
    );

  if (!item) {
    return;
  }

  updateProcedure(
    id,
    {
      active:
        !item.active,
    }
  );
}

export function removeProcedure(
  id:
    number
) {
  saveProcedures(
    getProcedures()
      .filter(
        (
          item
        ) =>
          item.id !==
          id
      )
  );
}
