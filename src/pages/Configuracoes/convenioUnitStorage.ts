import { getDefaultClinicUnitId } from "./clinicUnitStorage";

const STORAGE_KEY = "entre-afetos-convenio-units";

interface ConvenioUnitLink {
  convenioId: number;
  unitId: number;
}

function readLinks(): ConvenioUnitLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) =>
        item &&
        Number.isFinite(Number(item.convenioId)) &&
        Number.isFinite(Number(item.unitId))
      )
      .map((item) => ({
        convenioId: Number(item.convenioId),
        unitId: Number(item.unitId),
      }));
  } catch {
    return [];
  }
}

function saveLinks(links: ConvenioUnitLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function getConvenioUnitIds(convenioId: number) {
  const links = readLinks().filter(
    (item) => item.convenioId === convenioId
  );

  if (links.length === 0) {
    return [getDefaultClinicUnitId()];
  }

  return Array.from(new Set(links.map((item) => item.unitId)));
}

export function convenioWorksAtUnit(
  convenioId: number,
  unitId: number
) {
  return getConvenioUnitIds(convenioId).includes(unitId);
}

export function setConvenioUnit(
  convenioId: number,
  unitId: number
) {
  const other = readLinks().filter(
    (item) => item.convenioId !== convenioId
  );

  saveLinks([
    ...other,
    { convenioId, unitId },
  ]);
}

export function removeConvenioUnitLinks(
  convenioId: number
) {
  saveLinks(
    readLinks().filter(
      (item) => item.convenioId !== convenioId
    )
  );
}