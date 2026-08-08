export interface SpecialtySetting {
  id: number;

  name: string;

  value: number;

  active: boolean;
}

export interface RoomSetting {
  id: number;

  name: string;

  active: boolean;
}

export interface ProfessionalSetting {
  id: number;

  name: string;

  specialty: string;

  registration: string;

  active: boolean;

  customValue?: number;
}

export interface ConvenioSetting {
  id: number;

  name: string;

  active: boolean;

  discountPercent: number;

  specialtyValues: Record<
    string,
    number
  >;
}

export interface SystemSettings {
  specialties: SpecialtySetting[];

  rooms: RoomSetting[];

  professionals: ProfessionalSetting[];

  convenios: ConvenioSetting[];
}

const STORAGE_KEY =
  "entre-afetos-system-settings";

const defaultSettings: SystemSettings = {
  specialties: [
    {
      id: 1,
      name: "Psicologia",
      value: 150,
      active: true,
    },
    {
      id: 2,
      name: "Fonoaudiologia",
      value: 140,
      active: true,
    },
    {
      id: 3,
      name: "Terapia Ocupacional",
      value: 160,
      active: true,
    },
    {
      id: 4,
      name: "Fisioterapia",
      value: 130,
      active: true,
    },
    {
      id: 5,
      name: "Psicopedagogia",
      value: 140,
      active: true,
    },
    {
      id: 6,
      name: "Nutrição",
      value: 150,
      active: true,
    },
  ],

  rooms: [
    {
      id: 1,
      name: "Sala 01",
      active: true,
    },
    {
      id: 2,
      name: "Sala 02",
      active: true,
    },
    {
      id: 3,
      name: "Sala 03",
      active: true,
    },
    {
      id: 4,
      name: "Sala 04",
      active: true,
    },
  ],

  professionals: [
    {
      id: 1,
      name: "Dra. Ana Paula",
      specialty: "Psicologia",
      registration: "CRP 00/00001",
      active: true,
    },
    {
      id: 2,
      name: "Dra. Camila Soares",
      specialty: "Fonoaudiologia",
      registration: "CRFa 00001",
      active: true,
    },
    {
      id: 3,
      name: "Dra. Larissa Lima",
      specialty: "Terapia Ocupacional",
      registration: "CREFITO 00001",
      active: true,
    },
    {
      id: 4,
      name: "Dr. Rafael Costa",
      specialty: "Fisioterapia",
      registration: "CREFITO 00002",
      active: true,
    },
  ],

  convenios: [
    {
      id: 1,
      name: "Unimed",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
    {
      id: 2,
      name: "Bradesco Saúde",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
    {
      id: 3,
      name: "SulAmérica",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
    {
      id: 4,
      name: "Hapvida",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
    {
      id: 5,
      name: "Amil",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
  ],
};

export function getSystemSettings(): SystemSettings {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          defaultSettings
        )
      );

      return defaultSettings;
    }

    const parsed =
      JSON.parse(
        stored
      ) as Partial<SystemSettings>;

    const normalized: SystemSettings = {
      specialties:
        parsed.specialties ??
        defaultSettings.specialties,

      rooms:
        parsed.rooms ??
        defaultSettings.rooms,

      professionals:
        parsed.professionals ??
        defaultSettings.professionals,

      convenios:
        parsed.convenios ??
        defaultSettings.convenios,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    return normalized;
  } catch {
    return defaultSettings;
  }
}

export function saveSystemSettings(
  settings: SystemSettings
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      settings
    )
  );
}

export function getActiveSpecialties() {
  return getSystemSettings().specialties.filter(
    (
      specialty
    ) =>
      specialty.active
  );
}

export function getActiveRooms() {
  return getSystemSettings().rooms.filter(
    (
      room
    ) =>
      room.active
  );
}

export function getActiveProfessionals() {
  return getSystemSettings().professionals.filter(
    (
      professional
    ) =>
      professional.active
  );
}

export function getActiveConvenios() {
  return getSystemSettings().convenios.filter(
    (
      convenio
    ) =>
      convenio.active
  );
}

export function getProfessionalByName(
  name: string
) {
  return getSystemSettings().professionals.find(
    (
      professional
    ) =>
      professional.name ===
      name
  );
}

export function getProfessionalServiceValue(
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

  if (
    professional?.customValue !==
      undefined &&
    professional.customValue >
      0
  ) {
    return professional.customValue;
  }

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  return specialty?.value ?? 150;
}

export function getConvenioServiceValue(
  convenioName: string,
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const baseValue =
    getProfessionalServiceValue(
      professionalName,
      specialtyName
    );

  const convenio =
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

  const specialtyValue =
    convenio.specialtyValues[
      specialtyName
    ];

  if (
    specialtyValue !==
      undefined &&
    specialtyValue >
      0
  ) {
    return specialtyValue;
  }

  const discount =
    Math.max(
      Math.min(
        convenio.discountPercent,
        100
      ),
      0
    );

  return (
    baseValue *
    (
      1 -
      discount / 100
    )
  );
}