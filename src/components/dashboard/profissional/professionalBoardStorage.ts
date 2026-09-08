export type ProfessionalBoardDocumentType =
  | "pdf"
  | "image"
  | "text"
  | "other";

export interface ProfessionalBoardDocument {
  id: string;
  professionalKey: string;
  name: string;
  description?: string;
  fileName: string;
  mimeType: string;
  fileType: ProfessionalBoardDocumentType;
  dataUrl: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entre-afetos-professional-digital-board";
export const PROFESSIONAL_BOARD_CHANGED_EVENT =
  "entre-afetos-professional-digital-board-changed";

function normalizeProfessionalKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function readDocuments(): ProfessionalBoardDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.professionalKey === "string" &&
        typeof item.name === "string" &&
        typeof item.fileName === "string" &&
        typeof item.mimeType === "string" &&
        typeof item.dataUrl === "string"
    ) as ProfessionalBoardDocument[];
  } catch {
    return [];
  }
}

function saveDocuments(documents: ProfessionalBoardDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  window.dispatchEvent(
    new CustomEvent(PROFESSIONAL_BOARD_CHANGED_EVENT)
  );
}

function detectType(mimeType: string): ProfessionalBoardDocumentType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/")) return "text";
  return "other";
}

export function getProfessionalBoardDocuments(
  professionalName: string
) {
  const key = normalizeProfessionalKey(professionalName);

  return readDocuments()
    .filter((item) => item.professionalKey === key)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function addProfessionalBoardDocument(data: {
  professionalName: string;
  file: File;
  displayName?: string;
  description?: string;
}) {
  const professionalKey = normalizeProfessionalKey(
    data.professionalName
  );

  if (!professionalKey) {
    throw new Error("Profissional não identificado.");
  }

  if (data.file.size > 3 * 1024 * 1024) {
    throw new Error("O arquivo deve ter no máximo 3 MB nesta versão do sistema.");
  }

  const dataUrl = await fileToDataUrl(data.file);
  const now = new Date().toISOString();

  const document: ProfessionalBoardDocument = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    professionalKey,
    name:
      data.displayName?.trim() ||
      removeExtension(data.file.name),
    description: data.description?.trim() || undefined,
    fileName: data.file.name,
    mimeType: data.file.type || "application/octet-stream",
    fileType: detectType(data.file.type),
    dataUrl,
    size: data.file.size,
    createdAt: now,
    updatedAt: now,
  };

  saveDocuments([document, ...readDocuments()]);
  return document;
}

export function removeProfessionalBoardDocument(
  professionalName: string,
  documentId: string
) {
  const key = normalizeProfessionalKey(professionalName);

  saveDocuments(
    readDocuments().filter(
      (item) =>
        !(
          item.id === documentId &&
          item.professionalKey === key
        )
    )
  );
}

export function downloadProfessionalBoardDocument(
  document: ProfessionalBoardDocument
) {
  const link = window.document.createElement("a");
  link.href = document.dataUrl;
  link.download = document.fileName;
  link.rel = "noopener";
  window.document.body.appendChild(link);
  link.click();
  link.remove();
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function removeExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(0, index) : fileName;
}
