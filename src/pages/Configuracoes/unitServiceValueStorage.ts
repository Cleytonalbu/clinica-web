import {
  getSystemSettings,
} from "./settingsStorage";

import {
  specialtyWorksAtUnit,
} from "./specialtyUnitStorage";

import {
  convenioWorksAtUnit,
} from "./convenioUnitStorage";

const STORAGE_KEY =
  "entre-afetos-unit-service-values";

export interface UnitSpecialtyValue {
  unitId: number;
  specialtyId: number;
  value: number;
  repasseValue: number;
}

export interface UnitProfessionalValue {
  unitId: number;
  professionalId: number;
  value?: number;
  repasseValue?: number;
}

export interface UnitConvenioSpecialtyValue {
  unitId: number;
  convenioId: number;
  specialtyId: number;
  value?: number;
}

interface UnitServiceValueData {
  specialties:
    UnitSpecialtyValue[];

  professionals:
    UnitProfessionalValue[];

  convenios:
    UnitConvenioSpecialtyValue[];
}

const emptyData:
  UnitServiceValueData = {
  specialties: [],
  professionals: [],
  convenios: [],
};

function readData():
  UnitServiceValueData {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return {
        ...emptyData,
      };
    }

    const parsed =
      JSON.parse(
        raw
      ) as
        Partial<UnitServiceValueData>;

    return {
      specialties:
        Array.isArray(
          parsed.specialties
        )
          ? parsed.specialties
          : [],

      professionals:
        Array.isArray(
          parsed.professionals
        )
          ? parsed.professionals
          : [],

      convenios:
        Array.isArray(
          parsed.convenios
        )
          ? parsed.convenios
          : [],
    };
  } catch {
    return {
      ...emptyData,
    };
  }
}

function saveData(
  data:
    UnitServiceValueData
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      data
    )
  );
}

export function getUnitSpecialtyValue(
  unitId: number,
  specialtyId: number
) {
  const settings =
    getSystemSettings();

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.id ===
        specialtyId
    );

  const custom =
    readData().specialties.find(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.specialtyId ===
          specialtyId
    );

  return {
    value:
      custom?.value ??
      specialty?.value ??
      0,

    repasseValue:
      custom?.repasseValue ??
      specialty?.repasseValue ??
      0,
  };
}

export function setUnitSpecialtyValue(
  unitId: number,
  specialtyId: number,
  data: {
    value?: number;
    repasseValue?: number;
  }
) {
  const current =
    readData();

  const existing =
    getUnitSpecialtyValue(
      unitId,
      specialtyId
    );

  const nextRecord:
    UnitSpecialtyValue = {
    unitId,
    specialtyId,

    value:
      data.value ??
      existing.value,

    repasseValue:
      data.repasseValue ??
      existing.repasseValue,
  };

  const exists =
    current.specialties.some(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.specialtyId ===
          specialtyId
    );

  saveData({
    ...current,

    specialties:
      exists
        ? current.specialties.map(
            (
              item
            ) =>
              item.unitId ===
                  unitId &&
                item.specialtyId ===
                  specialtyId
                ? nextRecord
                : item
          )
        : [
            ...current.specialties,
            nextRecord,
          ],
  });

  return nextRecord;
}

export function getUnitProfessionalValue(
  unitId: number,
  professionalId: number
) {
  return readData()
    .professionals
    .find(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.professionalId ===
          professionalId
    );
}

export function setUnitProfessionalValue(
  unitId: number,
  professionalId: number,
  data: {
    value?: number;
    repasseValue?: number;
  }
) {
  const current =
    readData();

  const currentRecord =
    getUnitProfessionalValue(
      unitId,
      professionalId
    );

  const nextRecord:
    UnitProfessionalValue = {
    unitId,
    professionalId,

    value:
      data.value !==
      undefined
        ? data.value
        : currentRecord?.value,

    repasseValue:
      data.repasseValue !==
      undefined
        ? data.repasseValue
        : currentRecord?.repasseValue,
  };

  const exists =
    current.professionals.some(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.professionalId ===
          professionalId
    );

  saveData({
    ...current,

    professionals:
      exists
        ? current.professionals.map(
            (
              item
            ) =>
              item.unitId ===
                  unitId &&
                item.professionalId ===
                  professionalId
                ? nextRecord
                : item
          )
        : [
            ...current.professionals,
            nextRecord,
          ],
  });

  return nextRecord;
}

export function clearUnitProfessionalValue(
  unitId: number,
  professionalId: number,
  field:
    | "value"
    | "repasseValue"
) {
  const current =
    readData();

  const record =
    getUnitProfessionalValue(
      unitId,
      professionalId
    );

  if (!record) {
    return;
  }

  const nextRecord = {
    ...record,
    [field]:
      undefined,
  };

  saveData({
    ...current,

    professionals:
      current.professionals.map(
        (
          item
        ) =>
          item.unitId ===
              unitId &&
            item.professionalId ===
              professionalId
            ? nextRecord
            : item
      ),
  });
}

export function getUnitConvenioSpecialtyValue(
  unitId: number,
  convenioId: number,
  specialtyId: number
) {
  return readData()
    .convenios
    .find(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.convenioId ===
          convenioId &&
        item.specialtyId ===
          specialtyId
    )
    ?.value;
}

export function setUnitConvenioSpecialtyValue(
  unitId: number,
  convenioId: number,
  specialtyId: number,
  value?: number
) {
  const current =
    readData();

  const exists =
    current.convenios.some(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.convenioId ===
          convenioId &&
        item.specialtyId ===
          specialtyId
    );

  const nextRecord:
    UnitConvenioSpecialtyValue = {
    unitId,
    convenioId,
    specialtyId,
    value,
  };

  saveData({
    ...current,

    convenios:
      exists
        ? current.convenios.map(
            (
              item
            ) =>
              item.unitId ===
                  unitId &&
                item.convenioId ===
                  convenioId &&
                item.specialtyId ===
                  specialtyId
                ? nextRecord
                : item
          )
        : [
            ...current.convenios,
            nextRecord,
          ],
  });

  return nextRecord;
}

export function getResolvedProfessionalServiceValue(
  unitId: number,
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const professional =
    settings.professionals.find(
      (
        item
      ) =>
        item.name ===
        professionalName
    );

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
          specialtyName &&
        specialtyWorksAtUnit(
          item.id,
          unitId
        )
    ) ??
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  if (!specialty) {
    return 0;
  }

  if (professional) {
    const custom =
      getUnitProfessionalValue(
        unitId,
        professional.id
      )?.value;

    if (
      custom !==
        undefined &&
      custom >= 0
    ) {
      return custom;
    }
  }

  return getUnitSpecialtyValue(
    unitId,
    specialty.id
  ).value;
}

export function getResolvedProfessionalRepasseValue(
  unitId: number,
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const professional =
    settings.professionals.find(
      (
        item
      ) =>
        item.name ===
        professionalName
    );

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
          specialtyName &&
        specialtyWorksAtUnit(
          item.id,
          unitId
        )
    ) ??
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  if (!specialty) {
    return 0;
  }

  if (professional) {
    const custom =
      getUnitProfessionalValue(
        unitId,
        professional.id
      )?.repasseValue;

    if (
      custom !==
        undefined &&
      custom >= 0
    ) {
      return custom;
    }
  }

  return getUnitSpecialtyValue(
    unitId,
    specialty.id
  ).repasseValue;
}

export function getResolvedConvenioServiceValue(
  unitId: number,
  convenioName: string,
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const baseValue =
    getResolvedProfessionalServiceValue(
      unitId,
      professionalName,
      specialtyName
    );

  const convenio =
    settings.convenios.find(
      (
        item
      ) =>
        item.name ===
          convenioName &&
        convenioWorksAtUnit(
          item.id,
          unitId
        )
    ) ??
    settings.convenios.find(
      (
        item
      ) =>
        item.name ===
        convenioName
    );

  if (
    !convenio ||
    !convenio.active
  ) {
    return baseValue;
  }

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
          specialtyName &&
        specialtyWorksAtUnit(
          item.id,
          unitId
        )
    ) ??
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  if (!specialty) {
    return baseValue;
  }

  const customValue =
    getUnitConvenioSpecialtyValue(
      unitId,
      convenio.id,
      specialty.id
    );

  if (
    customValue !==
      undefined &&
    customValue > 0
  ) {
    return customValue;
  }

  const legacyValue =
    convenio.specialtyValues[
      specialtyName
    ];

  if (
    legacyValue !==
      undefined &&
    legacyValue > 0
  ) {
    return legacyValue;
  }

  const discount =
    Math.max(
      0,
      Math.min(
        convenio.discountPercent,
        100
      )
    );

  return (
    baseValue *
    (
      1 -
      discount /
        100
    )
  );
}