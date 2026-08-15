export interface ProfessionalScheduleDay {
  id: number;
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}

export interface ProfessionalUnitSchedule {
  professionalId: number;
  unitId: number;
  days: ProfessionalScheduleDay[];
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-professional-schedules";

const defaultSchedule:
  ProfessionalScheduleDay[] = [
  {
    id: 1,
    day: "Segunda-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 2,
    day: "Terça-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 3,
    day: "Quarta-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 4,
    day: "Quinta-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 5,
    day: "Sexta-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 6,
    day: "Sábado",
    enabled: false,
    start: "",
    end: "",
    breakStart: "",
    breakEnd: "",
  },
  {
    id: 7,
    day: "Domingo",
    enabled: false,
    start: "",
    end: "",
    breakStart: "",
    breakEnd: "",
  },
];

export function getDefaultProfessionalSchedule() {
  return defaultSchedule.map(
    (
      day
    ) => ({
      ...day,
    })
  );
}

export function getProfessionalSchedules():
  ProfessionalUnitSchedule[] {
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

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function getProfessionalSchedule(
  professionalId: number,
  unitId: number
) {
  return getProfessionalSchedules().find(
    (
      item
    ) =>
      item.professionalId ===
        professionalId &&
      item.unitId ===
        unitId
  );
}

export function getProfessionalScheduleDays(
  professionalId: number,
  unitId: number
) {
  return (
    getProfessionalSchedule(
      professionalId,
      unitId
    )?.days ??
    getDefaultProfessionalSchedule()
  );
}

export function saveProfessionalSchedule(
  professionalId: number,
  unitId: number,
  days: ProfessionalScheduleDay[]
) {
  const current =
    getProfessionalSchedules();

  const record:
    ProfessionalUnitSchedule = {
    professionalId,
    unitId,
    days,
    updatedAt:
      new Date()
        .toISOString(),
  };

  const exists =
    current.some(
      (
        item
      ) =>
        item.professionalId ===
          professionalId &&
        item.unitId ===
          unitId
    );

  const next =
    exists
      ? current.map(
          (
            item
          ) =>
            item.professionalId ===
                professionalId &&
              item.unitId ===
                unitId
              ? record
              : item
        )
      : [
          ...current,
          record,
        ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  return record;
}