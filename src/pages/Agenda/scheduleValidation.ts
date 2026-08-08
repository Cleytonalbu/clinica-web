import {
  getSavedAppointments,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  getSavedBlocks,
} from "./blockStorage";

import type {
  ScheduleBlock,
} from "./ScheduleBlocksView";

export interface ScheduleConflict {
  type:
    | "appointment"
    | "block";

  title: string;
  description: string;
}

const defaultAppointments: StoredAppointment[] = [
  {
    id: 1,
    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-07",

    time:
      "08:00",

    endTime:
      "08:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Realizado",
  },

  {
    id: 2,
    patientId: 2,

    patient:
      "João Miguel Silva",

    professional:
      "Dra. Camila Soares",

    specialty:
      "Fonoaudiologia",

    date:
      "2026-08-07",

    time:
      "08:00",

    endTime:
      "08:50",

    room:
      "Sala 02",

    type:
      "Individual",

    status:
      "Confirmado",
  },

  {
    id: 3,
    patientId: 3,

    patient:
      "Lucas Gabriel",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-07",

    time:
      "09:00",

    endTime:
      "09:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Confirmado",
  },

  {
    id: 4,
    patientId: 4,

    patient:
      "Ana Clara Rodrigues",

    professional:
      "Dra. Larissa Lima",

    specialty:
      "Terapia Ocupacional",

    date:
      "2026-08-07",

    time:
      "10:00",

    endTime:
      "10:50",

    room:
      "Sala 03",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 5,
    patientId: 5,

    patient:
      "Pedro Henrique",

    professional:
      "Dr. Rafael Costa",

    specialty:
      "Fisioterapia",

    date:
      "2026-08-07",

    time:
      "11:00",

    endTime:
      "11:50",

    room:
      "Sala 04",

    type:
      "Avaliação",

    status:
      "Cancelado",
  },

  {
    id: 6,
    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Camila Soares",

    specialty:
      "Fonoaudiologia",

    date:
      "2026-08-07",

    time:
      "14:00",

    endTime:
      "14:50",

    room:
      "Sala 02",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 7,
    patientId: 3,

    patient:
      "Lucas Gabriel",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-08",

    time:
      "09:00",

    endTime:
      "09:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 8,
    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-10",

    time:
      "10:30",

    endTime:
      "11:20",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Confirmado",
  },
];

const defaultBlocks: ScheduleBlock[] = [
  {
    id: 1,

    professional:
      "Dra. Ana Paula",

    date:
      "2026-08-07",

    startTime:
      "12:00",

    endTime:
      "13:00",

    type:
      "Almoço",

    reason:
      "Intervalo de almoço",
  },

  {
    id: 2,

    professional:
      "Dra. Camila Soares",

    date:
      "2026-08-07",

    startTime:
      "11:00",

    endTime:
      "12:00",

    type:
      "Reunião",

    reason:
      "Reunião da equipe clínica",
  },

  {
    id: 3,

    professional:
      "Dra. Larissa Lima",

    date:
      "2026-08-07",

    startTime:
      "14:00",

    endTime:
      "17:00",

    type:
      "Indisponível",

    reason:
      "Atividade externa",
  },

  {
    id: 4,

    professional:
      "Dr. Rafael Costa",

    date:
      "2026-08-08",

    startTime:
      "08:00",

    endTime:
      "17:00",

    type:
      "Férias",

    reason:
      "Período de férias",
  },
];

interface CheckScheduleConflictParams {
  professional: string;
  date: string;
  startTime: string;
  endTime: string;

  ignoreAppointmentId?: number;
}

export function checkScheduleConflict({
  professional,
  date,
  startTime,
  endTime,
  ignoreAppointmentId,
}: CheckScheduleConflictParams): ScheduleConflict | null {
  if (
    !professional ||
    !date ||
    !startTime ||
    !endTime
  ) {
    return null;
  }

  const appointments = [
    ...defaultAppointments,
    ...getSavedAppointments(),
  ];

  const appointmentConflict =
    appointments.find(
      (appointment) =>
        appointment.id !==
          ignoreAppointmentId &&
        appointment.professional ===
          professional &&
        appointment.date ===
          date &&
        appointment.status !==
          "Cancelado" &&
        appointment.status !==
          "Faltou" &&
        periodsOverlap(
          startTime,
          endTime,
          appointment.time,
          appointment.endTime
        )
    );

  if (
    appointmentConflict
  ) {
    return {
      type:
        "appointment",

      title:
        "Conflito com outro atendimento",

      description: `${professional} já possui atendimento com ${appointmentConflict.patient} das ${appointmentConflict.time} às ${appointmentConflict.endTime}.`,
    };
  }

  const blocks = [
    ...defaultBlocks,
    ...getSavedBlocks(),
  ];

  const blockConflict =
    blocks.find(
      (block) =>
        block.professional ===
          professional &&
        block.date ===
          date &&
        periodsOverlap(
          startTime,
          endTime,
          block.startTime,
          block.endTime
        )
    );

  if (blockConflict) {
    return {
      type:
        "block",

      title:
        "Profissional indisponível",

      description: `${professional} possui um bloqueio de ${blockConflict.type.toLowerCase()} das ${blockConflict.startTime} às ${blockConflict.endTime}. ${blockConflict.reason}`,
    };
  }

  return null;
}

export function periodsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const startAMinutes =
    timeToMinutes(
      startA
    );

  const endAMinutes =
    timeToMinutes(
      endA
    );

  const startBMinutes =
    timeToMinutes(
      startB
    );

  const endBMinutes =
    timeToMinutes(
      endB
    );

  return (
    startAMinutes <
      endBMinutes &&
    endAMinutes >
      startBMinutes
  );
}

export function addMinutesToTime(
  time: string,
  minutesToAdd: number
) {
  if (!time) {
    return "";
  }

  const total =
    timeToMinutes(
      time
    ) +
    minutesToAdd;

  const normalized =
    Math.min(
      total,
      23 * 60 + 59
    );

  const hours =
    Math.floor(
      normalized / 60
    );

  const minutes =
    normalized % 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}`;
}

function timeToMinutes(
  value: string
) {
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}