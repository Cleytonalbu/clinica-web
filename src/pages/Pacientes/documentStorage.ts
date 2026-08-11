/* =========================================
   TIPOS
========================================= */

export type DocumentCategory =
  | "Laudo"
  | "Relatório"
  | "Termo"
  | "Documento pessoal"
  | "Evolução"
  | "Outros";

export type DocumentType =
  | "PDF"
  | "Imagem";

export interface StoredPatientDocument {
  id: number;

  patientId: number;

  name: string;

  category:
    DocumentCategory;

  type:
    DocumentType;

  mimeType:
    string;

  size:
    number;

  professional:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  source:
    | "DOCUMENTO"
    | "EVOLUCAO";

  evolutionId?:
    number;

  attachmentId?:
    string;
}

/* =========================================
   CRIAÇÃO
========================================= */

export interface CreatePatientDocumentData {
  patientId:
    number;

  name:
    string;

  category:
    DocumentCategory;

  type:
    DocumentType;

  mimeType?:
    string;

  size:
    number;

  professional:
    string;

  source?:
    StoredPatientDocument["source"];

  evolutionId?:
    number;

  attachmentId?:
    string;
}

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-patient-documents";

/* =========================================
   LISTAR TODOS
========================================= */

export function getDocuments():
  StoredPatientDocument[] {
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

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      isStoredDocument
    );
  } catch {
    return [];
  }
}

/* =========================================
   DOCUMENTOS DO PACIENTE
========================================= */

export function getDocumentsByPatientId(
  patientId:
    number
) {
  if (
    !Number.isFinite(
      patientId
    ) ||
    patientId <= 0
  ) {
    return [];
  }

  return getDocuments()
    .filter(
      (
        document
      ) =>
        document.patientId ===
        patientId
    )
    .sort(
      (
        a,
        b
      ) =>
        getTimestamp(
          b.createdAt
        ) -
        getTimestamp(
          a.createdAt
        )
    );
}

/* =========================================
   BUSCAR POR ID
========================================= */

export function getDocumentById(
  documentId:
    number
) {
  return getDocuments().find(
    (
      document
    ) =>
      document.id ===
      documentId
  );
}

/* =========================================
   CRIAR DOCUMENTO
========================================= */

export function createPatientDocument(
  data:
    CreatePatientDocumentData
) {
  validatePatientId(
    data.patientId
  );

  if (
    !data.name.trim()
  ) {
    throw new Error(
      "Informe o nome do documento."
    );
  }

  const documents =
    getDocuments();

  const now =
    new Date()
      .toISOString();

  const document:
    StoredPatientDocument = {
    id:
      generateDocumentId(
        documents
      ),

    patientId:
      data.patientId,

    name:
      data.name.trim(),

    category:
      data.category,

    type:
      data.type,

    mimeType:
      data.mimeType?.trim() ||
      "",

    size:
      normalizeSize(
        data.size
      ),

    professional:
      data.professional.trim() ||
      "Usuário",

    source:
      data.source ??
      "DOCUMENTO",

    evolutionId:
      data.evolutionId,

    attachmentId:
      data.attachmentId,

    createdAt:
      now,

    updatedAt:
      now,
  };

  saveDocuments(
    [
      ...documents,
      document,
    ]
  );

  return document;
}

/* =========================================
   CRIAR A PARTIR DE FILE
========================================= */

export function createPatientDocumentFromFile(
  patientId:
    number,

  file:
    File,

  options: {
    category:
      DocumentCategory;

    professional:
      string;
  }
) {
  return createPatientDocument(
    {
      patientId,

      name:
        file.name,

      category:
        options.category,

      type:
        file.type.startsWith(
          "image/"
        )
          ? "Imagem"
          : "PDF",

      mimeType:
        file.type,

      size:
        file.size,

      professional:
        options.professional,

      source:
        "DOCUMENTO",
    }
  );
}

/* =========================================
   EXCLUIR
========================================= */

export function deletePatientDocument(
  patientId:
    number,

  documentId:
    number
) {
  const documents =
    getDocuments();

  const existing =
    documents.find(
      (
        document
      ) =>
        document.id ===
          documentId &&
        document.patientId ===
          patientId
    );

  if (!existing) {
    return false;
  }

  saveDocuments(
    documents.filter(
      (
        document
      ) =>
        document.id !==
        documentId
    )
  );

  return true;
}

/* =========================================
   ATUALIZAR CATEGORIA
========================================= */

export function updatePatientDocumentCategory(
  patientId:
    number,

  documentId:
    number,

  category:
    DocumentCategory
) {
  const documents =
    getDocuments();

  let updated:
    StoredPatientDocument |
    undefined;

  const next =
    documents.map(
      (
        document
      ) => {
        if (
          document.id !==
            documentId ||
          document.patientId !==
            patientId
        ) {
          return document;
        }

        updated = {
          ...document,

          category,

          updatedAt:
            new Date()
              .toISOString(),
        };

        return updated;
      }
    );

  if (!updated) {
    throw new Error(
      "Documento não encontrado."
    );
  }

  saveDocuments(
    next
  );

  return updated;
}

/* =========================================
   RENOMEAR
========================================= */

export function renamePatientDocument(
  patientId:
    number,

  documentId:
    number,

  name:
    string
) {
  const normalizedName =
    name.trim();

  if (
    !normalizedName
  ) {
    throw new Error(
      "Informe o nome do documento."
    );
  }

  const documents =
    getDocuments();

  let updated:
    StoredPatientDocument |
    undefined;

  const next =
    documents.map(
      (
        document
      ) => {
        if (
          document.id !==
            documentId ||
          document.patientId !==
            patientId
        ) {
          return document;
        }

        updated = {
          ...document,

          name:
            normalizedName,

          updatedAt:
            new Date()
              .toISOString(),
        };

        return updated;
      }
    );

  if (!updated) {
    throw new Error(
      "Documento não encontrado."
    );
  }

  saveDocuments(
    next
  );

  return updated;
}

/* =========================================
   RESUMO
========================================= */

export function getDocumentSummary(
  patientId:
    number
) {
  const documents =
    getDocumentsByPatientId(
      patientId
    );

  return {
    total:
      documents.length,

    reports:
      documents.filter(
        (
          document
        ) =>
          document.category ===
          "Relatório"
      ).length,

    clinicalAttachments:
      documents.filter(
        (
          document
        ) =>
          document.category ===
            "Evolução" ||
          document.source ===
            "EVOLUCAO"
      ).length,
  };
}

/* =========================================
   SALVAR
========================================= */

function saveDocuments(
  documents:
    StoredPatientDocument[]
) {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      documents
    )
  );
}

/* =========================================
   GERAR ID
========================================= */

function generateDocumentId(
  documents:
    StoredPatientDocument[]
) {
  if (
    documents.length ===
    0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...documents.map(
        (
          document
        ) =>
          document.id
      )
    ) +
    1
  );
}

/* =========================================
   VALIDAR PACIENTE
========================================= */

function validatePatientId(
  patientId:
    number
) {
  if (
    !Number.isFinite(
      patientId
    ) ||
    patientId <= 0
  ) {
    throw new Error(
      "Paciente inválido."
    );
  }
}

/* =========================================
   TAMANHO
========================================= */

function normalizeSize(
  size:
    number
) {
  if (
    !Number.isFinite(
      size
    ) ||
    size < 0
  ) {
    return 0;
  }

  return Math.round(
    size
  );
}

/* =========================================
   TIMESTAMP
========================================= */

function getTimestamp(
  value:
    string
) {
  const timestamp =
    new Date(
      value
    ).getTime();

  return Number.isNaN(
    timestamp
  )
    ? 0
    : timestamp;
}

/* =========================================
   VALIDAR STORAGE
========================================= */

function isStoredDocument(
  value:
    unknown
): value is StoredPatientDocument {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const document =
    value as Partial<StoredPatientDocument>;

  return (
    typeof document.id ===
      "number" &&
    typeof document.patientId ===
      "number" &&
    typeof document.name ===
      "string"
  );
}