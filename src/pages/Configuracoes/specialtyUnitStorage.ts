import { getDefaultClinicUnitId } from "./clinicUnitStorage";

const STORAGE_KEY = "entre-afetos-specialty-units";

interface SpecialtyUnitLink {
  specialtyId: number;
  unitId: number;
}

function readLinks(): SpecialtyUnitLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) =>
        item &&
        Number.isFinite(Number(item.specialtyId)) &&
        Number.isFinite(Number(item.unitId))
      )
      .map((item) => ({
        specialtyId: Number(item.specialtyId),
        unitId: Number(item.unitId),
      }));
  } catch {
    return [];
  }
}

function saveLinks(links: SpecialtyUnitLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function getSpecialtyUnitIds(specialtyId: number) {
  const links = readLinks().filter(
    (item) => item.specialtyId === specialtyId
  );

  if (links.length === 0) {
    return [getDefaultClinicUnitId()];
  }

  return Array.from(new Set(links.map((item) => item.unitId)));
}

export function specialtyWorksAtUnit(
  specialtyId: number,
  unitId: number
) {
  return getSpecialtyUnitIds(specialtyId).includes(unitId);
}

export function setSpecialtyUnit(
  specialtyId: number,
  unitId: number
) {
  const other = readLinks().filter(
    (item) => item.specialtyId !== specialtyId
  );

  saveLinks([
    ...other,
    { specialtyId, unitId },
  ]);
}

export function removeSpecialtyUnitLinks(
  specialtyId: number
) {
  saveLinks(
    readLinks().filter(
      (item) => item.specialtyId !== specialtyId
    )
  );
}