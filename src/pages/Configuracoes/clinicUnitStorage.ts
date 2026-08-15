export type ClinicUnitStatus = "Ativa" | "Inativa";

export interface ClinicUnit {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  active: boolean;
  status: ClinicUnitStatus;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClinicUnitData {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  active?: boolean;
  isMain?: boolean;
}

export type UpdateClinicUnitData = Partial<
  Omit<ClinicUnit, "id" | "createdAt" | "updatedAt">
>;

const STORAGE_KEY = "entre-afetos-clinic-units";
export const ACTIVE_UNIT_STORAGE_KEY = "entre-afetos-active-unit-id";

const MAIN_UNIT_ID = 1;
const MAIN_UNIT_CODE = "UNIDADE-PRINCIPAL";

function createMainUnit(): ClinicUnit {
  const now = new Date().toISOString();

  return {
    id: MAIN_UNIT_ID,
    name: "Unidade Principal",
    code: MAIN_UNIT_CODE,
    address: "",
    city: "",
    state: "PB",
    phone: "",
    active: true,
    status: "Ativa",
    isMain: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function ensureClinicUnitsInitialized(): ClinicUnit[] {
  const current = readUnits();

  if (current.length > 0) {
    const normalized = normalizeUnits(current);
    persistUnits(normalized);
    ensureActiveUnit(normalized);
    return normalized;
  }

  const mainUnit = createMainUnit();

  persistUnits([mainUnit]);
  localStorage.setItem(ACTIVE_UNIT_STORAGE_KEY, String(mainUnit.id));

  return [mainUnit];
}

export function getClinicUnits(): ClinicUnit[] {
  return ensureClinicUnitsInitialized();
}

export function getActiveClinicUnits(): ClinicUnit[] {
  return getClinicUnits().filter((unit) => unit.active);
}

export function getMainClinicUnit(): ClinicUnit {
  const units = getClinicUnits();
  return units.find((unit) => unit.isMain) ?? units[0];
}

export function getClinicUnitById(unitId: number) {
  if (!Number.isFinite(unitId) || unitId <= 0) {
    return undefined;
  }

  return getClinicUnits().find((unit) => unit.id === unitId);
}

export function getClinicUnitByCode(code: string) {
  const normalizedCode = normalizeCode(code);

  return getClinicUnits().find(
    (unit) => normalizeCode(unit.code) === normalizedCode
  );
}

export function createClinicUnit(
  data: CreateClinicUnitData
): ClinicUnit {
  const units = getClinicUnits();
  const name = cleanText(data.name);

  if (!name) {
    throw new Error("Informe o nome da unidade.");
  }

  const code = normalizeCode(data.code || name);

  if (!code) {
    throw new Error("Informe um código válido para a unidade.");
  }

  if (
    units.some(
      (unit) => normalizeCode(unit.code) === code
    )
  ) {
    throw new Error("Já existe uma unidade com este código.");
  }

  const now = new Date().toISOString();
  const isMain = Boolean(data.isMain);

  const workingUnits = isMain
    ? units.map((unit) => ({
        ...unit,
        isMain: false,
        updatedAt: now,
      }))
    : units;

  const active = data.active ?? true;

  const unit: ClinicUnit = {
    id: generateUnitId(workingUnits),
    name,
    code,
    address: cleanText(data.address),
    city: cleanText(data.city),
    state: cleanText(data.state).toUpperCase(),
    phone: cleanText(data.phone),
    active,
    status: active ? "Ativa" : "Inativa",
    isMain,
    createdAt: now,
    updatedAt: now,
  };

  persistUnits([...workingUnits, unit]);

  return unit;
}

export function updateClinicUnit(
  unitId: number,
  data: UpdateClinicUnitData
): ClinicUnit {
  const units = getClinicUnits();
  const existing = units.find((unit) => unit.id === unitId);

  if (!existing) {
    throw new Error("Unidade não encontrada.");
  }

  const nextName =
    data.name !== undefined ? cleanText(data.name) : existing.name;

  if (!nextName) {
    throw new Error("Informe o nome da unidade.");
  }

  const nextCode =
    data.code !== undefined
      ? normalizeCode(data.code)
      : existing.code;

  if (!nextCode) {
    throw new Error("Informe um código válido para a unidade.");
  }

  if (
    units.some(
      (unit) =>
        unit.id !== unitId &&
        normalizeCode(unit.code) === normalizeCode(nextCode)
    )
  ) {
    throw new Error("Já existe outra unidade com este código.");
  }

  const now = new Date().toISOString();
  const wantsMain = data.isMain ?? existing.isMain;

  const workingUnits = wantsMain
    ? units.map((unit) => ({
        ...unit,
        isMain: unit.id === unitId,
      }))
    : units;

  const active = data.active ?? existing.active;

  const updated: ClinicUnit = {
    ...existing,
    ...data,
    name: nextName,
    code: nextCode,
    address:
      data.address !== undefined
        ? cleanText(data.address)
        : existing.address,
    city:
      data.city !== undefined
        ? cleanText(data.city)
        : existing.city,
    state:
      data.state !== undefined
        ? cleanText(data.state).toUpperCase()
        : existing.state,
    phone:
      data.phone !== undefined
        ? cleanText(data.phone)
        : existing.phone,
    active,
    status: active ? "Ativa" : "Inativa",
    isMain: wantsMain,
    updatedAt: now,
  };

  const result = workingUnits.map((unit) =>
    unit.id === unitId ? updated : unit
  );

  persistUnits(normalizeUnits(result));
  ensureActiveUnit(result);

  return updated;
}

export function setClinicUnitActive(
  unitId: number,
  active: boolean
) {
  const unit = getClinicUnitById(unitId);

  if (!unit) {
    throw new Error("Unidade não encontrada.");
  }

  if (!active) {
    const activeUnits = getActiveClinicUnits();

    if (
      activeUnits.length === 1 &&
      activeUnits[0].id === unitId
    ) {
      throw new Error(
        "O sistema precisa possuir pelo menos uma unidade ativa."
      );
    }
  }

  return updateClinicUnit(unitId, { active });
}

export function setMainClinicUnit(unitId: number) {
  const unit = getClinicUnitById(unitId);

  if (!unit) {
    throw new Error("Unidade não encontrada.");
  }

  if (!unit.active) {
    throw new Error(
      "Uma unidade inativa não pode ser definida como principal."
    );
  }

  return updateClinicUnit(unitId, { isMain: true });
}

export function removeClinicUnit(unitId: number) {
  const units = getClinicUnits();
  const unit = units.find((item) => item.id === unitId);

  if (!unit) {
    return;
  }

  if (unit.isMain) {
    throw new Error("A unidade principal não pode ser removida.");
  }

  const next = units.filter((item) => item.id !== unitId);

  persistUnits(next);
  ensureActiveUnit(next);
}

export function getStoredActiveUnitId(): number {
  const units = getClinicUnits();

  const storedId = Number(
    localStorage.getItem(ACTIVE_UNIT_STORAGE_KEY)
  );

  const validStored = units.find(
    (unit) => unit.id === storedId && unit.active
  );

  if (validStored) {
    return validStored.id;
  }

  const fallback = getFallbackActiveUnit(units);

  localStorage.setItem(
    ACTIVE_UNIT_STORAGE_KEY,
    String(fallback.id)
  );

  return fallback.id;
}

export function setStoredActiveUnitId(unitId: number) {
  const unit = getClinicUnitById(unitId);

  if (!unit) {
    throw new Error("Unidade não encontrada.");
  }

  if (!unit.active) {
    throw new Error(
      "Não é possível selecionar uma unidade inativa."
    );
  }

  localStorage.setItem(
    ACTIVE_UNIT_STORAGE_KEY,
    String(unit.id)
  );

  return unit.id;
}

export function getDefaultClinicUnitId(): number {
  return getMainClinicUnit().id;
}

function readUnits(): ClinicUnit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isClinicUnitLike)
      .map(normalizeUnit);
  } catch {
    return [];
  }
}

function persistUnits(units: ClinicUnit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

function normalizeUnits(units: ClinicUnit[]): ClinicUnit[] {
  if (units.length === 0) {
    return [createMainUnit()];
  }

  const normalized = units.map(normalizeUnit);

  const mainIndex = normalized.findIndex(
    (unit) => unit.isMain
  );

  if (mainIndex === -1) {
    normalized[0] = {
      ...normalized[0],
      isMain: true,
    };
  } else {
    normalized.forEach((unit, index) => {
      if (index !== mainIndex && unit.isMain) {
        normalized[index] = {
          ...unit,
          isMain: false,
        };
      }
    });
  }

  return normalized;
}

function normalizeUnit(unit: ClinicUnit): ClinicUnit {
  const active = unit.active !== false;

  return {
    id: Number(unit.id),
    name: cleanText(unit.name) || "Unidade",
    code: normalizeCode(unit.code || unit.name),
    address: cleanText(unit.address),
    city: cleanText(unit.city),
    state: cleanText(unit.state).toUpperCase(),
    phone: cleanText(unit.phone),
    active,
    status: active ? "Ativa" : "Inativa",
    isMain: Boolean(unit.isMain),
    createdAt: unit.createdAt || new Date().toISOString(),
    updatedAt:
      unit.updatedAt ||
      unit.createdAt ||
      new Date().toISOString(),
  };
}

function isClinicUnitLike(
  value: unknown
): value is ClinicUnit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const unit = value as Partial<ClinicUnit>;

  return (
    Number.isFinite(Number(unit.id)) &&
    Boolean(unit.name)
  );
}

function ensureActiveUnit(units: ClinicUnit[]) {
  const current = Number(
    localStorage.getItem(ACTIVE_UNIT_STORAGE_KEY)
  );

  const valid = units.some(
    (unit) => unit.id === current && unit.active
  );

  if (valid) {
    return;
  }

  const fallback = getFallbackActiveUnit(units);

  localStorage.setItem(
    ACTIVE_UNIT_STORAGE_KEY,
    String(fallback.id)
  );
}

function getFallbackActiveUnit(
  units: ClinicUnit[]
): ClinicUnit {
  const activeMain = units.find(
    (unit) => unit.isMain && unit.active
  );

  if (activeMain) {
    return activeMain;
  }

  const firstActive = units.find(
    (unit) => unit.active
  );

  if (firstActive) {
    return firstActive;
  }

  const main =
    units.find((unit) => unit.isMain) ??
    units[0] ??
    createMainUnit();

  const recovered: ClinicUnit = {
    ...main,
    active: true,
    status: "Ativa",
    isMain: true,
    updatedAt: new Date().toISOString(),
  };

  const recoveredUnits =
    units.length > 0
      ? units.map((unit) =>
          unit.id === recovered.id
            ? recovered
            : unit
        )
      : [recovered];

  persistUnits(recoveredUnits);

  return recovered;
}

function generateUnitId(units: ClinicUnit[]) {
  const highestId = units.reduce(
    (highest, unit) =>
      Math.max(highest, unit.id),
    0
  );

  return highestId + 1;
}

function cleanText(
  value: string | undefined
) {
  return value?.trim() ?? "";
}

function normalizeCode(
  value: string | undefined
) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}