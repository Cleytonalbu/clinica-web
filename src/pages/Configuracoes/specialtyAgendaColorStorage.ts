import {
  getDefaultClinicUnitId,
} from "./clinicUnitStorage";

import {
  getActiveProfessionals,
  getActiveSpecialties,
} from "./settingsStorage";

import {
  professionalWorksAtUnit,
} from "./professionalUnitStorage";

export interface SpecialtyAgendaColorSetting {
  unitId: number;
  specialtyId: number;
  specialtyName: string;
  baseColor: string;
  updatedAt: string;
}

export interface ProfessionalAgendaTone {
  professionalId: number;
  professionalName: string;
  specialtyId: number;
  specialtyName: string;
  baseColor: string;
  toneColor: string;
  toneIndex: number;
}

const STORAGE_KEY =
  "entre-afetos-specialty-agenda-colors";

export const SPECIALTY_AGENDA_COLORS_CHANGED_EVENT =
  "entre-afetos:specialty-agenda-colors-changed";

const DEFAULT_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#059669",
  "#DB2777",
  "#EA580C",
  "#0891B2",
  "#4F46E5",
  "#65A30D",
  "#C026D3",
  "#D97706",
];

function notifyChanged() {
  window.dispatchEvent(
    new CustomEvent(
      SPECIALTY_AGENDA_COLORS_CHANGED_EVENT
    )
  );
}

function normalizeHex(
  value:
    string
) {
  const cleaned =
    value
      .trim()
      .toUpperCase();

  if (
    /^#[0-9A-F]{6}$/.test(
      cleaned
    )
  ) {
    return cleaned;
  }

  return "#7C3AED";
}

function readItems():
  SpecialtyAgendaColorSetting[] {
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

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    const defaultUnitId =
      getDefaultClinicUnitId();

    return parsed
      .filter(
        (
          item
        ) =>
          Number.isFinite(
            Number(
              item?.specialtyId
            )
          )
      )
      .map(
        (
          item
        ) => ({
          unitId:
            Number.isFinite(
              Number(
                item?.unitId
              )
            ) &&
            Number(
              item?.unitId
            ) >
              0
              ? Number(
                  item.unitId
                )
              : defaultUnitId,

          specialtyId:
            Number(
              item.specialtyId
            ),

          specialtyName:
            String(
              item.specialtyName ??
              ""
            ),

          baseColor:
            normalizeHex(
              String(
                item.baseColor ??
                "#7C3AED"
              )
            ),

          updatedAt:
            String(
              item.updatedAt ??
              new Date()
                .toISOString()
            ),
        })
      );
  } catch {
    return [];
  }
}

function persist(
  items:
    SpecialtyAgendaColorSetting[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items
    )
  );

  notifyChanged();
}

export function getSpecialtyAgendaColor(
  unitId:
    number,

  specialtyId:
    number
) {
  const specialty =
    getActiveSpecialties()
      .find(
        (
          item
        ) =>
          item.id ===
          specialtyId
      );

  const stored =
    readItems()
      .find(
        (
          item
        ) =>
          item.unitId ===
            unitId &&
          item.specialtyId ===
            specialtyId
      );

  if (
    stored
  ) {
    return stored.baseColor;
  }

  const specialtyIndex =
    Math.max(
      getActiveSpecialties()
        .findIndex(
          (
            item
          ) =>
            item.id ===
            specialtyId
        ),
      0
    );

  return DEFAULT_COLORS[
    specialtyIndex %
      DEFAULT_COLORS.length
  ];
}

export function setSpecialtyAgendaColor(
  unitId:
    number,

  specialtyId:
    number,

  baseColor:
    string
) {
  const specialty =
    getActiveSpecialties()
      .find(
        (
          item
        ) =>
          item.id ===
          specialtyId
      );

  if (
    !specialty
  ) {
    throw new Error(
      "Especialidade não encontrada."
    );
  }

  const normalized =
    normalizeHex(
      baseColor
    );

  const current =
    readItems();

  const nextItem:
    SpecialtyAgendaColorSetting = {
    unitId,
    specialtyId,
    specialtyName:
      specialty.name,
    baseColor:
      normalized,
    updatedAt:
      new Date()
        .toISOString(),
  };

  const exists =
    current.some(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.specialtyId ===
          specialtyId
    );

  const next =
    exists
      ? current.map(
          (
            item
          ) =>
            item.unitId ===
                unitId &&
              item.specialtyId ===
                specialtyId
              ? nextItem
              : item
        )
      : [
          ...current,
          nextItem,
        ];

  persist(
    next
  );

  return nextItem;
}

export function removeSpecialtyAgendaColor(
  unitId:
    number,

  specialtyId:
    number
) {
  persist(
    readItems()
      .filter(
        (
          item
        ) =>
          !(
            item.unitId ===
              unitId &&
            item.specialtyId ===
              specialtyId
          )
      )
  );
}

function hexToRgb(
  hex:
    string
) {
  const normalized =
    normalizeHex(
      hex
    )
      .slice(
        1
      );

  return {
    r:
      parseInt(
        normalized.slice(
          0,
          2
        ),
        16
      ),

    g:
      parseInt(
        normalized.slice(
          2,
          4
        ),
        16
      ),

    b:
      parseInt(
        normalized.slice(
          4,
          6
        ),
        16
      ),
  };
}

function rgbToHex(
  r:
    number,
  g:
    number,
  b:
    number
) {
  const value =
    (
      component:
        number
    ) =>
      Math.round(
        Math.max(
          0,
          Math.min(
            255,
            component
          )
        )
      )
        .toString(
          16
        )
        .padStart(
          2,
          "0"
        );

  return `#${value(r)}${value(g)}${value(b)}`
    .toUpperCase();
}

function mixWithWhite(
  baseColor:
    string,

  ratio:
    number
) {
  const {
    r,
    g,
    b,
  } =
    hexToRgb(
      baseColor
    );

  return rgbToHex(
    r +
      (
        255 -
        r
      ) *
        ratio,

    g +
      (
        255 -
        g
      ) *
        ratio,

    b +
      (
        255 -
        b
      ) *
        ratio
  );
}

function mixWithBlack(
  baseColor:
    string,

  ratio:
    number
) {
  const {
    r,
    g,
    b,
  } =
    hexToRgb(
      baseColor
    );

  return rgbToHex(
    r *
      (
        1 -
        ratio
      ),

    g *
      (
        1 -
        ratio
      ),

    b *
      (
        1 -
        ratio
      )
  );
}

/**
 * Gera tons visualmente próximos à cor-base.
 * Todos os profissionais da mesma especialidade continuam
 * reconhecíveis como pertencentes à mesma família de cor.
 */
export function generateProfessionalTone(
  baseColor:
    string,

  index:
    number,

  total:
    number
) {
  const normalized =
    normalizeHex(
      baseColor
    );

  if (
    total <=
    1
  ) {
    return normalized;
  }

  const positions = [
    -0.22,
    -0.12,
    0,
    0.12,
    0.22,
    0.32,
    -0.3,
    0.4,
  ];

  const position =
    positions[
      index %
      positions.length
    ];

  return position <
    0
    ? mixWithBlack(
        normalized,
        Math.abs(
          position
        )
      )
    : mixWithWhite(
        normalized,
        position
      );
}

export function getProfessionalAgendaTonesBySpecialty(
  unitId:
    number,

  specialtyId:
    number
):
  ProfessionalAgendaTone[] {
  const specialty =
    getActiveSpecialties()
      .find(
        (
          item
        ) =>
          item.id ===
          specialtyId
      );

  if (
    !specialty
  ) {
    return [];
  }

  const professionals =
    getActiveProfessionals()
      .filter(
        (
          professional
        ) =>
          professional.specialty ===
            specialty.name &&
          professionalWorksAtUnit(
            professional.id,
            unitId
          )
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

  const baseColor =
    getSpecialtyAgendaColor(
      unitId,
      specialtyId
    );

  return professionals.map(
    (
      professional,
      index
    ) => ({
      professionalId:
        professional.id,

      professionalName:
        professional.name,

      specialtyId:
        specialty.id,

      specialtyName:
        specialty.name,

      baseColor,

      toneColor:
        generateProfessionalTone(
          baseColor,
          index,
          professionals.length
        ),

      toneIndex:
        index,
    })
  );
}

export function getProfessionalAgendaTone(
  unitId:
    number,

  professionalId:
    number
) {
  const professional =
    getActiveProfessionals()
      .find(
        (
          item
        ) =>
          item.id ===
          professionalId
      );

  if (
    !professional
  ) {
    return undefined;
  }

  const specialty =
    getActiveSpecialties()
      .find(
        (
          item
        ) =>
          item.name ===
          professional.specialty
      );

  if (
    !specialty
  ) {
    return undefined;
  }

  return getProfessionalAgendaTonesBySpecialty(
    unitId,
    specialty.id
  )
    .find(
      (
        item
      ) =>
        item.professionalId ===
        professionalId
    );
}
