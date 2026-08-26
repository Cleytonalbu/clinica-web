import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

export type ReportRequestStatus =
  | "Solicitado"
  | "Em andamento"
  | "Entregue";

export type ReportRequestDisplayStatus =
  | ReportRequestStatus
  | "Em atraso";

export type ReportDocumentType =
  | "Relatório de acompanhamento"
  | "Relatório terapêutico"
  | "Declaração de acompanhamento"
  | "Relatório psicológico";

export interface ReportDocumentTypeDefinition {
  value: ReportDocumentType;
  label: string;
  description: string;
}

export const REPORT_DOCUMENT_TYPES: ReportDocumentTypeDefinition[] = [
  {
    value: "Relatório de acompanhamento",
    label: "Relatório de acompanhamento",
    description:
      "Relatório referente ao acompanhamento terapêutico da criança.",
  },
  {
    value: "Relatório terapêutico",
    label: "Relatório terapêutico",
    description:
      "Relatório solicitado para acompanhamento do desenvolvimento terapêutico.",
  },
  {
    value: "Declaração de acompanhamento",
    label: "Declaração de acompanhamento",
    description:
      "Declaração referente ao acompanhamento realizado na clínica.",
  },
  {
    value: "Relatório psicológico",
    label: "Relatório psicológico",
    description:
      "Relatório referente ao acompanhamento psicológico.",
  },
];

export const DEFAULT_REPORT_DOCUMENT_TYPE: ReportDocumentType =
  "Relatório de acompanhamento";

export type ReportSpecialtyKey =
  | "psicologia"
  | "psicopedagogia"
  | "psicomotricidade-fisioterapia"
  | "nutricao"
  | "terapia-ocupacional"
  | "fonoaudiologia"
  | "analista-comportamento";

export interface ReportSpecialtyDefinition {
  key: ReportSpecialtyKey;
  label: string;
  shortLabel: string;
  professionalSpecialties: string[];
}

export interface ReportRequestItem {
  id: string;
  specialtyKey: ReportSpecialtyKey;
  specialtyLabel: string;
  professionalId: number | null;
  professionalName: string;
  status: ReportRequestStatus;
  updatedAt: string;
  deliveredAt: string | null;
}

export interface ReportRequest {
  id: string;
  unitId: number;

  /* Tipo solicitado pelo responsável/recepção. */
  reportType: ReportDocumentType;

  patientId: number;
  patientName: string;
  responsibleName: string;
  requestedAt: string;
  deadline: string;
  purpose: string;
  notes: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  items: ReportRequestItem[];
}

export const REPORT_REQUEST_SPECIALTIES: ReportSpecialtyDefinition[] = [
  {
    key: "psicologia",
    label: "Psicologia",
    shortLabel: "Psicologia",
    professionalSpecialties: ["Psicologia"],
  },
  {
    key: "psicopedagogia",
    label: "Psicopedagogia",
    shortLabel: "Psicoped.",
    professionalSpecialties: ["Psicopedagogia"],
  },
  {
    key: "psicomotricidade-fisioterapia",
    label: "Fisioterapia/Psicomotricidade",
    shortLabel: "Psicomo/Fisio",
    professionalSpecialties: [
      "Fisioterapia",
      "Psicomotricidade",
      "Fisioterapia/Psicomotricidade",
    ],
  },
  {
    key: "nutricao",
    label: "Nutrição",
    shortLabel: "Nutrição",
    professionalSpecialties: ["Nutrição"],
  },
  {
    key: "terapia-ocupacional",
    label: "Terapia Ocupacional",
    shortLabel: "TO",
    professionalSpecialties: ["Terapia Ocupacional"],
  },
  {
    key: "fonoaudiologia",
    label: "Fonoaudiologia",
    shortLabel: "Fono",
    professionalSpecialties: ["Fonoaudiologia"],
  },
  {
    key: "analista-comportamento",
    label: "Analista do Comportamento",
    shortLabel: "Analista Comp.",
    professionalSpecialties: [
      "Analista do Comportamento",
      "Análise do Comportamento",
      "ABA",
    ],
  },
];

const STORAGE_KEY = "entre-afetos-report-requests";

export const REPORT_REQUESTS_CHANGED_EVENT =
  "entre-afetos-report-requests-changed";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function emitChanged() {
  window.dispatchEvent(
    new CustomEvent(REPORT_REQUESTS_CHANGED_EVENT)
  );
}

function isReportRequest(value: unknown): value is ReportRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request = value as Partial<ReportRequest>;

  return (
    typeof request.id === "string" &&
    Number.isFinite(Number(request.patientId)) &&
    typeof request.patientName === "string" &&
    typeof request.requestedAt === "string" &&
    typeof request.deadline === "string" &&
    Array.isArray(request.items)
  );
}

export function getReportRequests(): ReportRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const defaultUnitId = getDefaultClinicUnitId();
    let changed = false;

    const normalized = parsed
      .filter(isReportRequest)
      .map((request) => {
        const unitId = Number(request.unitId);

        const reportType =
          REPORT_DOCUMENT_TYPES.some(
            (type) =>
              type.value ===
              request.reportType
          )
            ? request.reportType
            : DEFAULT_REPORT_DOCUMENT_TYPE;

        if (
          reportType !==
          request.reportType
        ) {
          changed = true;
        }

        if (Number.isFinite(unitId) && unitId > 0) {
          return {
            ...request,
            unitId,
            reportType,
          };
        }

        changed = true;
        return {
          ...request,
          unitId: defaultUnitId,
          reportType,
        };
      })
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return [];
  }
}

function saveReportRequests(requests: ReportRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  emitChanged();
}

export interface CreateReportRequestInput {
  unitId: number;
  reportType: ReportDocumentType;
  patientId: number;
  patientName: string;
  responsibleName: string;
  requestedAt: string;
  deadline: string;
  purpose: string;
  notes: string;
  requestedBy: string;
  specialties: Array<{
    specialtyKey: ReportSpecialtyKey;
    specialtyLabel: string;
    professionalId: number | null;
    professionalName: string;
  }>;
}

export function createReportRequest(
  input: CreateReportRequestInput
): ReportRequest {
  const now = new Date().toISOString();

  const request: ReportRequest = {
    id: createId("report-request"),
    unitId: input.unitId,
    reportType:
      input.reportType,
    patientId: input.patientId,
    patientName: input.patientName.trim(),
    responsibleName: input.responsibleName.trim(),
    requestedAt: input.requestedAt,
    deadline: input.deadline,
    purpose: input.purpose.trim(),
    notes: input.notes.trim(),
    requestedBy: input.requestedBy.trim(),
    createdAt: now,
    updatedAt: now,
    items: input.specialties.map((specialty) => ({
      id: createId("report-item"),
      specialtyKey: specialty.specialtyKey,
      specialtyLabel: specialty.specialtyLabel,
      professionalId: specialty.professionalId,
      professionalName: specialty.professionalName.trim(),
      status: "Solicitado",
      updatedAt: now,
      deliveredAt: null,
    })),
  };

  const current = getReportRequests();

  saveReportRequests([request, ...current]);

  return request;
}

export function updateReportRequestItemStatus(
  requestId: string,
  itemId: string,
  status: ReportRequestStatus
) {
  const now = new Date().toISOString();
  const requests = getReportRequests();

  const next = requests.map((request) => {
    if (request.id !== requestId) {
      return request;
    }

    return {
      ...request,
      updatedAt: now,
      items: request.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          status,
          updatedAt: now,
          deliveredAt: status === "Entregue" ? now : null,
        };
      }),
    };
  });

  saveReportRequests(next);
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function getReportItemDisplayStatus(
  request: ReportRequest,
  item: ReportRequestItem,
  now = new Date()
): ReportRequestDisplayStatus {
  if (item.status === "Entregue") {
    return "Entregue";
  }

  const deadline = parseLocalDate(request.deadline);

  if (deadline.getTime() < now.getTime()) {
    return "Em atraso";
  }

  return item.status;
}

export function calculateBusinessDeadline(
  requestedAt: string,
  businessDays = 7
) {
  const [year, month, day] = requestedAt
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);
  let added = 0;

  while (added < businessDays) {
    date.setDate(date.getDate() + 1);

    const weekDay = date.getDay();

    if (weekDay !== 0 && weekDay !== 6) {
      added += 1;
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function isProfessionalResponsibleForItem(
  professionalName: string,
  professionalSpecialty: string,
  item: ReportRequestItem
) {
  const normalizedName = professionalName.trim().toLocaleLowerCase("pt-BR");
  const assignedName = item.professionalName
    .trim()
    .toLocaleLowerCase("pt-BR");

  if (assignedName) {
    return assignedName === normalizedName;
  }

  const definition = REPORT_REQUEST_SPECIALTIES.find(
    (specialty) => specialty.key === item.specialtyKey
  );

  if (!definition || !professionalSpecialty.trim()) {
    return false;
  }

  const normalizedSpecialty = professionalSpecialty
    .trim()
    .toLocaleLowerCase("pt-BR");

  return definition.professionalSpecialties.some(
    (specialty) =>
      specialty.trim().toLocaleLowerCase("pt-BR") ===
      normalizedSpecialty
  );
}