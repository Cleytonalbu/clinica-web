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

/* =========================================
   DISPONIBILIDADE DO PROFISSIONAL
========================================= */

const WEEK_DAY_TO_SCHEDULE_NAME = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export interface ProfessionalScheduleAvailability {
  available: boolean;
  reason: string;
  day:
    ProfessionalScheduleDay |
    null;
}

/**
 * Verifica se um profissional está dentro da sua jornada
 * semanal configurada para uma unidade específica.
 *
 * Esta função é usada pela Agenda e também pelo cálculo de
 * horários disponíveis para o aplicativo dos responsáveis.
 */
export function checkProfessionalScheduleAvailability(
  professionalId: number,
  unitId: number,
  date: string,
  startTime: string,
  endTime: string
): ProfessionalScheduleAvailability {
  const parsedDate =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return {
      available:
        false,

      reason:
        "Data inválida.",

      day:
        null,
    };
  }

  if (
    !startTime ||
    !endTime ||
    startTime >=
      endTime
  ) {
    return {
      available:
        false,

      reason:
        "Horário inválido.",

      day:
        null,
    };
  }

  const dayName =
    WEEK_DAY_TO_SCHEDULE_NAME[
      parsedDate.getDay()
    ];

  const scheduleDay =
    getProfessionalScheduleDays(
      professionalId,
      unitId
    ).find(
      (
        day
      ) =>
        day.day ===
        dayName
    ) ??
    null;

  if (
    !scheduleDay ||
    !scheduleDay.enabled
  ) {
    return {
      available:
        false,

      reason:
        "O profissional não atende neste dia da semana.",

      day:
        scheduleDay,
    };
  }

  if (
    !scheduleDay.start ||
    !scheduleDay.end
  ) {
    return {
      available:
        false,

      reason:
        "O profissional não possui horário de atendimento configurado para este dia.",

      day:
        scheduleDay,
    };
  }

  if (
    startTime <
      scheduleDay.start ||
    endTime >
      scheduleDay.end
  ) {
    return {
      available:
        false,

      reason:
        `O profissional atende neste dia das ${scheduleDay.start} às ${scheduleDay.end}.`,

      day:
        scheduleDay,
    };
  }

  if (
    scheduleDay.breakStart &&
    scheduleDay.breakEnd &&
    periodsOverlapLocal(
      startTime,
      endTime,
      scheduleDay.breakStart,
      scheduleDay.breakEnd
    )
  ) {
    return {
      available:
        false,

      reason:
        `O profissional possui intervalo das ${scheduleDay.breakStart} às ${scheduleDay.breakEnd}.`,

      day:
        scheduleDay,
    };
  }

  return {
    available:
      true,

    reason:
      "",

    day:
      scheduleDay,
  };
}

function periodsOverlapLocal(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return (
    timeToMinutesLocal(
      startA
    ) <
      timeToMinutesLocal(
        endB
      ) &&
    timeToMinutesLocal(
      endA
    ) >
      timeToMinutesLocal(
        startB
      )
  );
}

function timeToMinutesLocal(
  value: string
) {
  const [
    hours,
    minutes,
  ] =
    value
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
}
