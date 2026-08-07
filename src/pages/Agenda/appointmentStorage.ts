export type StoredAppointmentStatus =
  | "Confirmado"
  | "Agendado"
  | "Realizado"
  | "Cancelado";

export interface StoredAppointment {
  id: number;
  patientId: number;

  patient: string;
  professional: string;
  specialty: string;

  date: string;

  time: string;
  endTime: string;

  room: string;

  type: string;

  status: StoredAppointmentStatus;

  observations?: string;
}

const STORAGE_KEY =
  "entre-afetos-appointments";

export function getSavedAppointments(): StoredAppointment[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    return JSON.parse(
      stored
    ) as StoredAppointment[];
  } catch {
    return [];
  }
}

export function saveAppointment(
  appointment: StoredAppointment
) {
  const current =
    getSavedAppointments();

  const next = [
    ...current,
    appointment,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}

export function updateSavedAppointment(
  appointmentId: number,
  data: Partial<StoredAppointment>
) {
  const current =
    getSavedAppointments();

  const next =
    current.map(
      (appointment) =>
        appointment.id ===
        appointmentId
          ? {
              ...appointment,
              ...data,
            }
          : appointment
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}

export function removeSavedAppointment(
  appointmentId: number
) {
  const current =
    getSavedAppointments();

  const next =
    current.filter(
      (appointment) =>
        appointment.id !==
        appointmentId
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}