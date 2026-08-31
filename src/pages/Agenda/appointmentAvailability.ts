import {
  getAgendaSettings,
  getActiveProfessionals,
  getActiveRooms,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  roomWorksAtUnit,
} from "@/pages/Configuracoes/roomUnitStorage";

import {
  addMinutesToTime,
  checkScheduleConflict,
  periodsOverlap,
} from "./scheduleValidation";

import {
  getSavedAppointments,
} from "./appointmentStorage";

import {
  getSavedBlocks,
} from "./blockStorage";

import {
  checkProfessionalScheduleAvailability,
} from "@/pages/Profissionais/professionalScheduleStorage";

const WEEK_DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

interface AvailabilityParams {
  unitId: number;
  professionalId?: number;
  professional: string;
  date: string;
  startTime: string;
  endTime: string;
  ignoreAppointmentId?: number;
}

interface AvailableSlotsParams {
  unitId: number;
  professionalId?: number;
  professional: string;
  date: string;
  durationMinutes?: number;
  stepMinutes?: number;
}

function timeToMinutes(
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

function isInsideClinicSchedule(
  date: string,
  startTime: string,
  endTime: string
) {
  const settings =
    getAgendaSettings();

  const parsedDate =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return false;
  }

  const dayName =
    WEEK_DAY_NAMES[
      parsedDate.getDay()
    ];

  const day =
    settings.days.find(
      (
        item
      ) =>
        item.day ===
        dayName
    );

  if (
    !day ||
    !day.active
  ) {
    return false;
  }

  if (
    startTime <
      day.startTime ||
    endTime >
      day.endTime
  ) {
    return false;
  }

  if (
    settings.hasLunchBreak &&
    periodsOverlap(
      startTime,
      endTime,
      settings.lunchStartTime,
      settings.lunchEndTime
    )
  ) {
    return false;
  }

  return true;
}

export function isAppointmentSlotAvailable({
  unitId,
  professional,
  date,
  startTime,
  endTime,
  ignoreAppointmentId,
}: AvailabilityParams) {
  const professionalSetting =
    getActiveProfessionals()
      .find(
        (
          item
        ) =>
          professionalId !==
            undefined
            ? item.id ===
              professionalId
            : item.name ===
              professional
      );

  if (
    !professionalSetting ||
    !professionalWorksAtUnit(
      professionalSetting.id,
      unitId
    )
  ) {
    return {
      available:
        false,

      reason:
        "O profissional não atende nesta unidade.",
    };
  }

  if (
    !isInsideClinicSchedule(
      date,
      startTime,
      endTime
    )
  ) {
    return {
      available:
        false,

      reason:
        "Este horário está fora da agenda disponível da clínica.",
    };
  }

  const professionalSchedule =
    checkProfessionalScheduleAvailability(
      professionalSetting.id,
      unitId,
      date,
      startTime,
      endTime
    );

  if (
    !professionalSchedule.available
  ) {
    return {
      available:
        false,

      reason:
        professionalSchedule.reason,
    };
  }

  const conflict =
    checkScheduleConflict(
      {
        professionalId:
          professionalSetting.id,
        professional,
        date,
        startTime,
        endTime,
        unitId,
        ignoreAppointmentId,
      }
    );

  if (
    conflict
  ) {
    return {
      available:
        false,

      reason:
        conflict.description,
    };
  }

  return {
    available:
      true,

    reason:
      "",
  };
}

/**
 * Retorna somente horários que o app pode exibir.
 * Horários ocupados, bloqueados, fora do expediente ou
 * de profissional sem vínculo com a unidade não são retornados.
 */
export function getAvailableAppointmentSlots({
  unitId,
  professionalId,
  professional,
  date,
  durationMinutes,
  stepMinutes,
}: AvailableSlotsParams) {
  const settings =
    getAgendaSettings();

  const duration =
    durationMinutes ??
    settings.defaultSessionDuration;

  const step =
    stepMinutes ??
    Math.max(
      duration +
        settings.intervalBetweenAppointments,
      1
    );

  const parsedDate =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return [];
  }

  const dayName =
    WEEK_DAY_NAMES[
      parsedDate.getDay()
    ];

  const day =
    settings.days.find(
      (
        item
      ) =>
        item.day ===
        dayName
    );

  if (
    !day ||
    !day.active
  ) {
    return [];
  }

  const slots:
    Array<{
      time: string;
      endTime: string;
    }> = [];

  let cursor =
    day.startTime;

  while (
    timeToMinutes(
      cursor
    ) +
      duration <=
    timeToMinutes(
      day.endTime
    )
  ) {
    const endTime =
      addMinutesToTime(
        cursor,
        duration
      );

    const availability =
      isAppointmentSlotAvailable(
        {
          unitId,
          professional,
          date,
          startTime:
            cursor,
          endTime,
        }
      );

    if (
      availability.available
    ) {
      slots.push(
        {
          time:
            cursor,
          endTime,
        }
      );
    }

    cursor =
      addMinutesToTime(
        cursor,
        step
      );
  }

  return slots;
}

/**
 * A sala não é escolhida pelo responsável no app.
 * Na confirmação, a recepção recebe automaticamente
 * a primeira sala livre vinculada à unidade.
 */
export function findFirstAvailableRoom({
  unitId,
  professional,
  date,
  startTime,
  endTime,
}: AvailabilityParams) {
  const rooms =
    getActiveRooms()
      .filter(
        (
          room
        ) =>
          roomWorksAtUnit(
            room.id,
            unitId
          )
      );

  const appointments =
    getSavedAppointments()
      .filter(
        (
          appointment
        ) =>
          appointment.unitId ===
            unitId &&
          appointment.date ===
            date &&
          appointment.status !==
            "Cancelado" &&
          appointment.status !==
            "Faltou"
      );

  for (
    const room of
    rooms
  ) {
    const occupied =
      appointments.some(
        (
          appointment
        ) =>
          appointment.room ===
            room.name &&
          periodsOverlap(
            startTime,
            endTime,
            appointment.time,
            appointment.endTime
          )
      );

    if (
      !occupied
    ) {
      return room;
    }
  }

  return null;
}
