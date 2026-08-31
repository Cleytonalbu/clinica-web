import type {
  BillingType,
  PaymentMethod,
} from "@/pages/Financeiro/financeRules";

import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

export type StoredAppointmentStatus =
  | "Confirmado"
  | "Agendado"
  | "Realizado"
  | "Cancelado"
  | "Faltou";

export interface StoredAppointment {
  id: number;
  patientId: number;

  unitId: number;

  patient: string;

  /**
   * IDs são as referências canônicas dos cadastros.
   * Os nomes continuam salvos para exibição e compatibilidade
   * com registros antigos do protótipo.
   */
  professionalId?: number;
  professional: string;

  specialty: string;

  date: string;

  time: string;
  endTime: string;

  room: string;

  type: string;

  status: StoredAppointmentStatus;

  observations?: string;

  billingType?: BillingType;

  convenioId?: number;
  convenio?: string;

  paymentMethod?: PaymentMethod;

  serviceValue?: number;

  /**
   * Quando preenchido, este atendimento foi agendado
   * para consumir uma sessão específica de um pacote
   * já adquirido pelo paciente.
   */
  patientPackageId?: number;

  patientPackageName?: string;
}

const STORAGE_KEY =
  "entre-afetos-appointments";

export const APPOINTMENTS_CHANGED_EVENT =
  "entre-afetos:appointments-changed";

function notifyAppointmentsChanged() {
  window.dispatchEvent(
    new CustomEvent(
      APPOINTMENTS_CHANGED_EVENT
    )
  );
}

export function getSavedAppointments(): StoredAppointment[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(
        stored
      ) as
        Array<
          StoredAppointment |
          Omit<
            StoredAppointment,
            "unitId"
          >
        >;

    let changed =
      false;

    const defaultUnitId =
      getDefaultClinicUnitId();

    const migrated =
      parsed.map(
        (
          appointment
        ) => {
          if (
            "unitId" in
              appointment &&
            Number.isFinite(
              Number(
                appointment.unitId
              )
            )
          ) {
            return {
              ...appointment,

              unitId:
                Number(
                  appointment.unitId
                ),
            } as StoredAppointment;
          }

          changed =
            true;

          return {
            ...appointment,

            unitId:
              defaultUnitId,
          } as StoredAppointment;
        }
      );

    if (
      changed
    ) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          migrated
        )
      );
    }

    return migrated;
  } catch {
    return [];
  }
}

export function saveAppointment(
  appointment: StoredAppointment
) {
  const current =
    getSavedAppointments();

  const normalizedAppointment:
    StoredAppointment = {
    ...appointment,

    unitId:
      Number.isFinite(
        Number(
          appointment.unitId
        )
      )
        ? Number(
            appointment.unitId
          )
        : getDefaultClinicUnitId(),
  };

  /*
   * Evita duplicidade do mesmo agendamento quando uma ação
   * é disparada duas vezes pela interface.
   */
  const alreadyExists =
    current.some(
      (
        item
      ) =>
        item.id ===
        normalizedAppointment.id
    );

  if (
    alreadyExists
  ) {
    return current.find(
      (
        item
      ) =>
        item.id ===
        normalizedAppointment.id
    );
  }

  const next = [
    ...current,
    normalizedAppointment,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  notifyAppointmentsChanged();

  return normalizedAppointment;
}

export function updateSavedAppointment(
  appointmentId: number,
  data: Partial<StoredAppointment>
) {
  const current =
    getSavedAppointments();

  const next =
    current.map(
      (
        appointment
      ) =>
        appointment.id ===
        appointmentId
          ? {
              ...appointment,

              ...data,

              unitId:
                data.unitId !==
                undefined
                  ? data.unitId
                  : appointment.unitId,
            }
          : appointment
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  notifyAppointmentsChanged();
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

  notifyAppointmentsChanged();
}