import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

export type RequestedReportDocumentStatus =
  | "Rascunho"
  | "Assinado"
  | "Enviado";

export interface RequestedReportDocument {
  id: string;
  unitId: number;

  requestId: string;
  itemId: string;

  patientId: number;
  patientName: string;
  birthDate: string;
  responsibleName: string;
  diagnosis: string;

  professionalName: string;
  specialty: string;
  professionalRegistration: string;

  developmentHistory: string;
  evaluationResults: string;

  objectiveIds: number[];
  therapeuticObjectives: string[];

  conclusionReferrals: string;

  reportDate: string;
  city: string;
  state: string;

  signatureDataUrl: string | null;
  signedAt: string | null;

  status:
    RequestedReportDocumentStatus;

  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

const STORAGE_KEY =
  "entre-afetos-requested-report-documents";

export const REQUESTED_REPORT_DOCUMENTS_CHANGED_EVENT =
  "entre-afetos-requested-report-documents-changed";

function emitChange() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new Event(
      REQUESTED_REPORT_DOCUMENTS_CHANGED_EVENT
    )
  );
}

export function getRequestedReportDocuments():
  RequestedReportDocument[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (!Array.isArray(parsed)) {
      return [];
    }

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed = false;

    const normalized =
      parsed.map(
        (document) => {
          const unitId =
            Number(
              document?.unitId
            );

          if (
            Number.isFinite(unitId) &&
            unitId > 0
          ) {
            return {
              ...document,
              unitId,
            } as RequestedReportDocument;
          }

          changed = true;

          return {
            ...document,
            unitId:
              defaultUnitId,
          } as RequestedReportDocument;
        }
      );

    if (changed) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
      );
    }

    return normalized;
  } catch {
    return [];
  }
}

export function getRequestedReportDocument(
  requestId: string,
  itemId: string
) {
  return getRequestedReportDocuments().find(
    (
      document
    ) =>
      document.requestId ===
        requestId &&
      document.itemId ===
        itemId
  );
}

export function saveRequestedReportDocument(
  data:
    Omit<
      RequestedReportDocument,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "unitId"
    > & {
      unitId?: number;
      id?: string;
      createdAt?: string;
    }
) {
  const current =
    getRequestedReportDocuments();

  const existing =
    current.find(
      (
        document
      ) =>
        document.requestId ===
          data.requestId &&
        document.itemId ===
          data.itemId
    );

  const now =
    new Date()
      .toISOString();

  const document:
    RequestedReportDocument = {
    ...data,

    unitId:
      existing?.unitId ??
      (
        Number.isFinite(
          Number(
            data.unitId
          )
        ) &&
        Number(
          data.unitId
        ) > 0
          ? Number(
              data.unitId
            )
          : getDefaultClinicUnitId()
      ),

    id:
      existing?.id ??
      data.id ??
      (
        typeof crypto !==
          "undefined" &&
        "randomUUID" in
          crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`
      ),

    createdAt:
      existing?.createdAt ??
      data.createdAt ??
      now,

    updatedAt:
      now,
  };

  const next =
    existing
      ? current.map(
          (
            item
          ) =>
            item.id ===
            existing.id
              ? document
              : item
        )
      : [
          document,
          ...current,
        ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  emitChange();

  return document;
}