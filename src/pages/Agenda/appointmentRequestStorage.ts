import type {
  BillingType,
  PaymentMethod,
} from "@/pages/Financeiro/financeRules";

import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

export type AppointmentRequestStatus =
  | "Pendente"
  | "Agendado"
  | "Recusado"
  | "Cancelado";

export interface AppointmentRequest {
  id: number;
  unitId: number;

  patientId: number;
  patient: string;

  professionalId?: number;
  professional: string;

  specialty: string;

  date: string;
  time: string;
  endTime: string;

  appointmentType:
    | "Individual"
    | "Grupo"
    | "Avaliação"
    | "Retorno";

  status: AppointmentRequestStatus;

  billingType?: BillingType;
  convenioId?: number;
  convenio?: string;
  paymentMethod?: PaymentMethod;

  observations?: string;

  source: "App";

  createdAt: string;

  confirmedAt?: string;
  confirmedAppointmentId?: number;
  confirmedRoom?: string;

  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CreateAppointmentRequestData {
  unitId: number;

  patientId: number;
  patient: string;

  professionalId?: number;
  professional: string;

  specialty: string;

  date: string;
  time: string;
  endTime: string;

  appointmentType?:
    | "Individual"
    | "Grupo"
    | "Avaliação"
    | "Retorno";

  billingType?: BillingType;
  convenioId?: number;
  convenio?: string;
  paymentMethod?: PaymentMethod;

  observations?: string;
}

const STORAGE_KEY =
  "entre-afetos-appointment-requests";

export const APPOINTMENT_REQUESTS_CHANGED_EVENT =
  "entre-afetos:appointment-requests-changed";

function notifyAppointmentRequestsChanged() {
  window.dispatchEvent(
    new CustomEvent(
      APPOINTMENT_REQUESTS_CHANGED_EVENT
    )
  );
}

function normalizeRequest(
  request:
    AppointmentRequest |
    Omit<
      AppointmentRequest,
      "unitId" | "source"
    >
): AppointmentRequest {
  const rawUnitId =
    Number(
      (
        request as
          Partial<
            AppointmentRequest
          >
      ).unitId
    );

  return {
    ...request,

    unitId:
      Number.isFinite(
        rawUnitId
      ) &&
      rawUnitId > 0
        ? rawUnitId
        : getDefaultClinicUnitId(),

    source:
      "App",
  } as AppointmentRequest;
}

export function getAppointmentRequests():
  AppointmentRequest[] {
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
      ) as AppointmentRequest[];

    const normalized =
      parsed.map(
        normalizeRequest
      );

    if (
      JSON.stringify(
        parsed
      ) !==
      JSON.stringify(
        normalized
      )
    ) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );
    }

    return normalized;
  } catch {
    return [];
  }
}

export function getAppointmentRequestsByUnit(
  unitId: number
) {
  return getAppointmentRequests()
    .filter(
      (
        request
      ) =>
        request.unitId ===
        unitId
    )
    .sort(
      (
        a,
        b
      ) =>
        b.createdAt.localeCompare(
          a.createdAt
        )
    );
}

/**
 * Esta função é o ponto de entrada que a API do app deverá
 * reproduzir no backend. Antes de salvar, o app/API deve usar
 * isAppointmentSlotAvailable() para garantir que o horário
 * continua livre.
 */
export function createAppointmentRequest(
  data:
    CreateAppointmentRequestData
) {
  const current =
    getAppointmentRequests();

  /*
   * Impede duas solicitações pendentes idênticas para o mesmo
   * paciente, profissional, unidade, data e horário.
   */
  const duplicatePendingRequest =
    current.find(
      (
        item
      ) =>
        item.status ===
          "Pendente" &&
        item.unitId ===
          data.unitId &&
        item.patientId ===
          data.patientId &&
        (
          data.professionalId !==
            undefined
            ? item.professionalId ===
              data.professionalId
            : item.professional ===
              data.professional
        ) &&
        item.date ===
          data.date &&
        item.time ===
          data.time
    );

  if (
    duplicatePendingRequest
  ) {
    return duplicatePendingRequest;
  }

  const request:
    AppointmentRequest = {
    id:
      Date.now(),

    unitId:
      data.unitId,

    patientId:
      data.patientId,

    patient:
      data.patient,

    professionalId:
      data.professionalId,

    professional:
      data.professional,

    specialty:
      data.specialty,

    date:
      data.date,

    time:
      data.time,

    endTime:
      data.endTime,

    appointmentType:
      data.appointmentType ??
      "Individual",

    status:
      "Pendente",

    billingType:
      data.billingType ??
      "Particular",

    convenioId:
      data.convenioId,

    convenio:
      data.convenio,

    paymentMethod:
      data.paymentMethod,

    observations:
      data.observations,

    source:
      "App",

    createdAt:
      new Date()
        .toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      [
        ...current,
        request,
      ]
    )
  );

  notifyAppointmentRequestsChanged();

  return request;
}

export function updateAppointmentRequest(
  requestId: number,
  data:
    Partial<
      AppointmentRequest
    >
) {
  const current =
    getAppointmentRequests();

  const next =
    current.map(
      (
        request
      ) =>
        request.id ===
        requestId
          ? {
              ...request,
              ...data,
              id:
                request.id,
              unitId:
                request.unitId,
            }
          : request
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  notifyAppointmentRequestsChanged();

  return next.find(
    (
      request
    ) =>
      request.id ===
      requestId
  );
}

export function markAppointmentRequestAsScheduled(
  requestId: number,
  appointmentId: number,
  room: string
) {
  return updateAppointmentRequest(
    requestId,
    {
      status:
        "Agendado",

      confirmedAt:
        new Date()
          .toISOString(),

      confirmedAppointmentId:
        appointmentId,

      confirmedRoom:
        room,
    }
  );
}

export function rejectAppointmentRequest(
  requestId: number,
  reason: string
) {
  return updateAppointmentRequest(
    requestId,
    {
      status:
        "Recusado",

      rejectedAt:
        new Date()
          .toISOString(),

      rejectionReason:
        reason.trim() ||
        "Solicitação recusada pela recepção.",
    }
  );
}
