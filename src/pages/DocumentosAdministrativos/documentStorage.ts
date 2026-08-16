export type AdministrativeDocumentCategory =
  | "Contrato de profissional"
  | "Contrato de prestador"
  | "Contrato de fornecedor"
  | "Documento fiscal"
  | "Licença / Certificado"
  | "Outros";

export type AdministrativeDocumentStatus =
  | "Ativo"
  | "Arquivado";

export interface AdministrativeDocument {
  id: string;
  title: string;
  category: AdministrativeDocumentCategory;
  relatedTo: string;
  documentNumber: string;
  startDate: string;
  endDate: string;
  status: AdministrativeDocumentStatus;
  notes: string;
  fileName: string;
  fileType: string;
  fileDataUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type AdministrativeDocumentDisplayStatus =
  | "Ativo"
  | "Vencendo"
  | "Vencido"
  | "Arquivado";

const STORAGE_KEY = "entre-afetos-administrative-documents";

function read(): AdministrativeDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: AdministrativeDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAdministrativeDocuments() {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveAdministrativeDocument(
  data: Omit<AdministrativeDocument, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();

  const item: AdministrativeDocument = {
    ...data,
    id: `adm-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };

  const items = [item, ...read()];
  write(items);
  return items;
}

export function updateAdministrativeDocumentStatus(
  id: string,
  status: AdministrativeDocumentStatus
) {
  const items = read().map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  write(items);
  return items;
}

function parseLocalDate(date: string) {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function getAdministrativeDocumentDisplayStatus(
  document: AdministrativeDocument
): AdministrativeDocumentDisplayStatus {
  if (document.status === "Arquivado") return "Arquivado";

  const endDate = parseLocalDate(document.endDate);
  if (!endDate) return "Ativo";

  const now = new Date();
  if (endDate.getTime() < now.getTime()) return "Vencido";

  const diffDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 30) return "Vencendo";
  return "Ativo";
}