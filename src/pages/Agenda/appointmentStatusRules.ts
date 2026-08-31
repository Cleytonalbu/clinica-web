import type {
  StoredAppointment,
} from "./appointmentStorage";

export type AppointmentStatus =
  StoredAppointment["status"];

export const FINAL_APPOINTMENT_STATUSES:
  AppointmentStatus[] = [
    "Realizado",
    "Cancelado",
    "Faltou",
  ];

export const ACTIVE_APPOINTMENT_STATUSES:
  AppointmentStatus[] = [
    "Agendado",
    "Confirmado",
  ];

export function isFinalAppointmentStatus(
  status: AppointmentStatus
) {
  return FINAL_APPOINTMENT_STATUSES.includes(
    status
  );
}

export function isActiveAppointmentStatus(
  status: AppointmentStatus
) {
  return ACTIVE_APPOINTMENT_STATUSES.includes(
    status
  );
}

export function appointmentOccupiesSchedule(
  status: AppointmentStatus
) {
  return (
    status !==
      "Cancelado" &&
    status !==
      "Faltou"
  );
}

export function appointmentCanBeRescheduled(
  status: AppointmentStatus
) {
  return isActiveAppointmentStatus(
    status
  );
}

export function appointmentCanGenerateClinicalEvolution(
  status: AppointmentStatus
) {
  return (
    status ===
      "Confirmado" ||
    status ===
      "Realizado"
  );
}
