export type EvolutionLaterRequestStatus =
  | "Pendente"
  | "Aprovado"
  | "Recusado";

export interface EvolutionLaterRequest {
  id: number;
  unitId: number;

  patientId: number;
  patientName: string;

  professional: string;
  specialty: string;

  appointmentId?: number;

  sessionDate: string;
  startTime: string;
  endTime: string;

  reason: string;

  status: EvolutionLaterRequestStatus;

  createdAt: string;
  reviewedAt?: string;
}

const STORAGE_KEY =
  "entre-afetos-evolution-later-requests";

export const EVOLUTION_LATER_REQUESTS_CHANGED_EVENT =
  "entre-afetos:evolution-later-requests-changed";

export function getEvolutionLaterRequests():
  EvolutionLaterRequest[] {
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
      );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function getEvolutionLaterRequestsByUnit(
  unitId:
    number
) {
  return getEvolutionLaterRequests()
    .filter(
      (
        request
      ) =>
        request.unitId ===
        unitId
    );
}

export function getLatestEvolutionLaterRequestForSession(
  params: {
    unitId:
      number;

    patientId:
      number;

    professional:
      string;

    sessionDate?:
      string;

    startTime?:
      string;
  }
) {
  const professional =
    params.professional
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  return getEvolutionLaterRequests()
    .filter(
      (
        request
      ) =>
        request.unitId ===
          params.unitId &&
        request.patientId ===
          params.patientId &&
        request.professional
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          ) ===
          professional &&
        (
          !params.sessionDate ||
          request.sessionDate ===
            params.sessionDate
        ) &&
        (
          !params.startTime ||
          request.startTime ===
            params.startTime
        )
    )
    .sort(
      (
        a,
        b
      ) =>
        (
          b.reviewedAt ||
          b.createdAt
        ).localeCompare(
          a.reviewedAt ||
          a.createdAt
        )
    )[0];
}

export function saveEvolutionLaterRequest(
  request:
    EvolutionLaterRequest
) {
  const current =
    getEvolutionLaterRequests();

  const duplicate =
    current.some(
      (
        item
      ) =>
        item.unitId ===
          request.unitId &&
        item.patientId ===
          request.patientId &&
        item.professional ===
          request.professional &&
        item.sessionDate ===
          request.sessionDate &&
        item.startTime ===
          request.startTime &&
        item.status ===
          "Pendente"
    );

  if (duplicate) {
    throw new Error(
      "Já existe uma solicitação pendente para este atendimento."
    );
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      [
        ...current,
        request,
      ]
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      EVOLUTION_LATER_REQUESTS_CHANGED_EVENT
    )
  );

  return request;
}

export function updateEvolutionLaterRequestStatus(
  requestId:
    number,
  status:
    EvolutionLaterRequestStatus
) {
  const current =
    getEvolutionLaterRequests();

  const next =
    current.map(
      (
        request
      ) =>
        request.id ===
          requestId
          ? {
              ...request,
              status,
              reviewedAt:
                new Date()
                  .toISOString(),
            }
          : request
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  window.dispatchEvent(
    new CustomEvent(
      EVOLUTION_LATER_REQUESTS_CHANGED_EVENT
    )
  );
}
