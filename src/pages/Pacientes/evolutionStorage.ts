import type {
  EvolutionMaterialFormData,
  EvolutionObjectiveFormData,
  ReferralPriority,
  SessionResult,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

/* =========================================
   TIPOS
========================================= */

export type EvolutionStatus =
  | "RASCUNHO"
  | "FINALIZADA";

export interface StoredEvolutionAttachment {
  id: string;

  name: string;

  type: string;

  size: number;
}

export interface StoredEvolution {
  id: number;

  patientId: number;

  sessionDate: string;

  startTime: string;

  endTime: string;

  specialty: string;

  appointmentType: string;

  appointmentLocation: string;

  objectives:
    EvolutionObjectiveFormData[];

  materials:
    EvolutionMaterialFormData[];

  writtenEvolution: string;

  referralSpecialty: string;

  referralProfessional: string;

  referralReason: string;

  referralPriority:
    ReferralPriority;

  referralObservation: string;

  notifyProfessional: boolean;

  addProfessionalAgenda: boolean;

  notifyManager: boolean;

  observedImpacts:
    string[];

  sessionResult:
    SessionResult;

  sessionResultObservation:
    string;

  attachments:
    StoredEvolutionAttachment[];

  professional: string;

  status:
    EvolutionStatus;

  createdAt: string;

  updatedAt: string;

  finalizedAt?: string;
}

/* =========================================
   DADOS PARA CRIAÇÃO
========================================= */

export interface CreateEvolutionData {
  patientId: number;

  sessionDate?: string;

  startTime?: string;

  endTime?: string;

  specialty?: string;

  appointmentType?: string;

  appointmentLocation?: string;

  objectives?:
    EvolutionObjectiveFormData[];

  materials?:
    EvolutionMaterialFormData[];

  writtenEvolution?: string;

  referralSpecialty?: string;

  referralProfessional?: string;

  referralReason?: string;

  referralPriority?:
    ReferralPriority;

  referralObservation?: string;

  notifyProfessional?: boolean;

  addProfessionalAgenda?: boolean;

  notifyManager?: boolean;

  observedImpacts?:
    string[];

  sessionResult?:
    SessionResult;

  sessionResultObservation?: string;

  attachments?:
    StoredEvolutionAttachment[];

  professional?: string;

  status:
    EvolutionStatus;
}

/* =========================================
   DADOS PARA ATUALIZAÇÃO
========================================= */

export type UpdateEvolutionData =
  Partial<
    Omit<
      StoredEvolution,
      | "id"
      | "patientId"
      | "createdAt"
    >
  >;

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-clinical-evolutions";

/* =========================================
   LISTAR TODAS
========================================= */

export function getEvolutions():
  StoredEvolution[] {
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

    return parsed
      .filter(
        isValidStoredEvolution
      )
      .map(
        (evolution) => ({
          ...evolution,
          materials:
            normalizeMaterials(
              Array.isArray(
                evolution.materials
              )
                ? evolution.materials
                : []
            ),
        })
      );
  } catch {
    return [];
  }
}

/* =========================================
   EVOLUÇÕES DO PACIENTE
========================================= */

export function getEvolutionsByPatientId(
  patientId: number
) {
  if (
    !Number.isFinite(
      patientId
    ) ||
    patientId <= 0
  ) {
    return [];
  }

  return getEvolutions()
    .filter(
      (
        evolution
      ) =>
        evolution.patientId ===
        patientId
    )
    .sort(
      (
        a,
        b
      ) =>
        getEvolutionTimestamp(
          b
        ) -
        getEvolutionTimestamp(
          a
        )
    );
}

/* =========================================
   FINALIZADAS DO PACIENTE
========================================= */

export function getFinalizedEvolutionsByPatientId(
  patientId: number
) {
  return getEvolutionsByPatientId(
    patientId
  ).filter(
    (
      evolution
    ) =>
      evolution.status ===
      "FINALIZADA"
  );
}

/* =========================================
   RASCUNHOS DO PACIENTE
========================================= */

export function getDraftEvolutionsByPatientId(
  patientId: number
) {
  return getEvolutionsByPatientId(
    patientId
  ).filter(
    (
      evolution
    ) =>
      evolution.status ===
      "RASCUNHO"
  );
}

/* =========================================
   BUSCAR POR ID
========================================= */

export function getEvolutionById(
  evolutionId: number
) {
  return getEvolutions().find(
    (
      evolution
    ) =>
      evolution.id ===
      evolutionId
  );
}

/* =========================================
   BUSCAR EVOLUÇÃO DO PACIENTE
========================================= */

export function getPatientEvolutionById(
  patientId: number,

  evolutionId: number
) {
  return getEvolutions().find(
    (
      evolution
    ) =>
      evolution.id ===
        evolutionId &&
      evolution.patientId ===
        patientId
  );
}

/* =========================================
   CRIAR
========================================= */

export function createEvolution(
  data:
    CreateEvolutionData
) {
  validatePatientId(
    data.patientId
  );

  if (
    data.status ===
    "FINALIZADA"
  ) {
    validateFinalizedEvolution(
      data
    );
  }

  const current =
    getEvolutions();

  const now =
    new Date()
      .toISOString();

  const evolution:
    StoredEvolution = {
    id:
      generateEvolutionId(
        current
      ),

    patientId:
      data.patientId,

    sessionDate:
      data.sessionDate ??
      "",

    startTime:
      data.startTime ??
      "",

    endTime:
      data.endTime ??
      "",

    specialty:
      cleanText(
        data.specialty
      ),

    appointmentType:
      cleanText(
        data.appointmentType
      ),

    appointmentLocation:
      cleanText(
        data.appointmentLocation
      ),

    objectives:
      normalizeObjectives(
        data.objectives ??
          []
      ),

    materials:
      normalizeMaterials(
        data.materials ??
          []
      ),

    writtenEvolution:
      cleanText(
        data.writtenEvolution
      ),

    referralSpecialty:
      cleanText(
        data.referralSpecialty
      ),

    referralProfessional:
      cleanText(
        data.referralProfessional
      ),

    referralReason:
      cleanText(
        data.referralReason
      ),

    referralPriority:
      data.referralPriority ??
      "Média",

    referralObservation:
      cleanText(
        data.referralObservation
      ),

    notifyProfessional:
      data.notifyProfessional ??
      false,

    addProfessionalAgenda:
      data.addProfessionalAgenda ??
      false,

    notifyManager:
      data.notifyManager ??
      false,

    observedImpacts:
      normalizeStringArray(
        data.observedImpacts ??
          []
      ),

    sessionResult:
      data.sessionResult ??
      "Dentro do esperado",

    sessionResultObservation:
      cleanText(
        data.sessionResultObservation
      ),

    attachments:
      normalizeAttachments(
        data.attachments ??
          []
      ),

    professional:
      cleanText(
        data.professional
      ),

    status:
      data.status,

    createdAt:
      now,

    updatedAt:
      now,

    finalizedAt:
      data.status ===
      "FINALIZADA"
        ? now
        : undefined,
  };

  saveEvolutions(
    [
      ...current,
      evolution,
    ]
  );

  return evolution;
}

/* =========================================
   ATUALIZAR
========================================= */

export function updateEvolution(
  evolutionId: number,

  data:
    UpdateEvolutionData
) {
  const current =
    getEvolutions();

  const existing =
    current.find(
      (
        evolution
      ) =>
        evolution.id ===
        evolutionId
    );

  if (!existing) {
    throw new Error(
      "Evolução não encontrada."
    );
  }

  const merged:
    StoredEvolution = {
    ...existing,

    ...data,

    specialty:
      data.specialty !==
      undefined
        ? cleanText(
            data.specialty
          )
        : existing.specialty,

    appointmentType:
      data.appointmentType !==
      undefined
        ? cleanText(
            data.appointmentType
          )
        : existing.appointmentType,

    appointmentLocation:
      data.appointmentLocation !==
      undefined
        ? cleanText(
            data.appointmentLocation
          )
        : existing.appointmentLocation,

    objectives:
      data.objectives !==
      undefined
        ? normalizeObjectives(
            data.objectives
          )
        : existing.objectives,

    materials:
      data.materials !==
      undefined
        ? normalizeMaterials(
            data.materials
          )
        : existing.materials,

    writtenEvolution:
      data.writtenEvolution !==
      undefined
        ? cleanText(
            data.writtenEvolution
          )
        : existing.writtenEvolution,

    referralSpecialty:
      data.referralSpecialty !==
      undefined
        ? cleanText(
            data.referralSpecialty
          )
        : existing.referralSpecialty,

    referralProfessional:
      data.referralProfessional !==
      undefined
        ? cleanText(
            data.referralProfessional
          )
        : existing.referralProfessional,

    referralReason:
      data.referralReason !==
      undefined
        ? cleanText(
            data.referralReason
          )
        : existing.referralReason,

    referralObservation:
      data.referralObservation !==
      undefined
        ? cleanText(
            data.referralObservation
          )
        : existing.referralObservation,

    observedImpacts:
      data.observedImpacts !==
      undefined
        ? normalizeStringArray(
            data.observedImpacts
          )
        : existing.observedImpacts,

    attachments:
      data.attachments !==
      undefined
        ? normalizeAttachments(
            data.attachments
          )
        : existing.attachments,

    professional:
      data.professional !==
      undefined
        ? cleanText(
            data.professional
          )
        : existing.professional,

    updatedAt:
      new Date()
        .toISOString(),
  };

  if (
    merged.status ===
    "FINALIZADA"
  ) {
    validateFinalizedEvolution(
      merged
    );

    if (
      existing.status !==
      "FINALIZADA"
    ) {
      merged.finalizedAt =
        new Date()
          .toISOString();
    }
  }

  const next =
    current.map(
      (
        evolution
      ) =>
        evolution.id ===
        evolutionId
          ? merged
          : evolution
    );

  saveEvolutions(
    next
  );

  return merged;
}

/* =========================================
   EXCLUIR
========================================= */

export function deleteEvolution(
  evolutionId: number
) {
  const current =
    getEvolutions();

  const next =
    current.filter(
      (
        evolution
      ) =>
        evolution.id !==
        evolutionId
    );

  saveEvolutions(
    next
  );
}

/* =========================================
   ÚLTIMA EVOLUÇÃO
========================================= */

export function getLastEvolutionByPatientId(
  patientId: number
) {
  return getFinalizedEvolutionsByPatientId(
    patientId
  )[0];
}

/* =========================================
   RESUMO
========================================= */

export function getEvolutionSummary(
  patientId: number
) {
  const evolutions =
    getEvolutionsByPatientId(
      patientId
    );

  const finalized =
    evolutions.filter(
      (
        evolution
      ) =>
        evolution.status ===
        "FINALIZADA"
    );

  const drafts =
    evolutions.filter(
      (
        evolution
      ) =>
        evolution.status ===
        "RASCUNHO"
    );

  const specialties =
    new Set(
      finalized
        .map(
          (
            evolution
          ) =>
            evolution.specialty
              .trim()
              .toLocaleLowerCase(
                "pt-BR"
              )
        )
        .filter(
          Boolean
        )
    );

  const attachments =
    evolutions.reduce(
      (
        total,
        evolution
      ) =>
        total +
        evolution.attachments.length,

      0
    );

  return {
    total:
      evolutions.length,

    finalized:
      finalized.length,

    drafts:
      drafts.length,

    specialties:
      specialties.size,

    attachments,
  };
}

/* =========================================
   CONVERTER FILES PARA METADADOS
========================================= */

export function createStoredAttachments(
  files:
    File[]
):
  StoredEvolutionAttachment[] {
  return files.map(
    (
      file,
      index
    ) => ({
      id:
        createAttachmentId(
          file,
          index
        ),

      name:
        file.name,

      type:
        file.type,

      size:
        file.size,
    })
  );
}

/* =========================================
   SALVAR
========================================= */

function saveEvolutions(
  evolutions:
    StoredEvolution[]
) {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      evolutions
    )
  );
}

/* =========================================
   ID
========================================= */

function generateEvolutionId(
  evolutions:
    StoredEvolution[]
) {
  if (
    evolutions.length ===
    0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...evolutions.map(
        (
          evolution
        ) =>
          evolution.id
      )
    ) +
    1
  );
}

/* =========================================
   VALIDAR PACIENTE
========================================= */

function validatePatientId(
  patientId: number
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
   VALIDAR FINALIZAÇÃO
========================================= */

function validateFinalizedEvolution(
  data:
    Pick<
      CreateEvolutionData,
      | "patientId"
      | "sessionDate"
      | "startTime"
      | "specialty"
      | "appointmentType"
      | "writtenEvolution"
      | "professional"
    >
) {
  validatePatientId(
    data.patientId
  );

  if (
    !data.sessionDate
  ) {
    throw new Error(
      "Informe a data do atendimento."
    );
  }

  if (
    !data.startTime
  ) {
    throw new Error(
      "Informe o horário de início."
    );
  }

  if (
    !cleanText(
      data.specialty
    )
  ) {
    throw new Error(
      "Informe a especialidade."
    );
  }

  if (
    !cleanText(
      data.appointmentType
    )
  ) {
    throw new Error(
      "Informe o tipo de atendimento."
    );
  }

  if (
    !cleanText(
      data.writtenEvolution
    )
  ) {
    throw new Error(
      "Informe a evolução escrita."
    );
  }

  if (
    !cleanText(
      data.professional
    )
  ) {
    throw new Error(
      "Informe o profissional responsável."
    );
  }
}

/* =========================================
   NORMALIZAR OBJETIVOS
========================================= */

function normalizeObjectives(
  objectives:
    EvolutionObjectiveFormData[]
) {
  return objectives.map(
    (
      objective
    ) => ({
      ...objective,

      name:
        objective.name.trim(),

      performance:
        Math.min(
          5,
          Math.max(
            1,
            Math.round(
              objective.performance
            )
          )
        ),
    })
  );
}

/* =========================================
   NORMALIZAR MATERIAIS
========================================= */

function normalizeMaterials(
  materials:
    EvolutionMaterialFormData[]
) {
  return materials
    .map(
      (
        material
      ) => ({
        ...material,

        name:
          material.name
            .trim(),

        quantity:
          material.quantity
            .trim(),

        observation:
          material.observation
            .trim(),
      })
    )
    .filter(
      (
        material
      ) =>
        Boolean(
          material.name
        )
    );
}

/* =========================================
   NORMALIZAR ARRAY DE TEXTO
========================================= */

function normalizeStringArray(
  values:
    string[]
) {
  return Array.from(
    new Set(
      values
        .map(
          (
            value
          ) =>
            value.trim()
        )
        .filter(
          Boolean
        )
    )
  );
}

/* =========================================
   NORMALIZAR ANEXOS
========================================= */

function normalizeAttachments(
  attachments:
    StoredEvolutionAttachment[]
) {
  return attachments.filter(
    (
      attachment
    ) =>
      Boolean(
        attachment.name
      )
  );
}

/* =========================================
   TEXTO
========================================= */

function cleanText(
  value:
    string |
    undefined
) {
  return value?.trim() ??
    "";
}

/* =========================================
   ID DO ANEXO
========================================= */

function createAttachmentId(
  file: File,

  index: number
) {
  return [
    Date.now(),
    index,
    file.name,
    file.size,
  ].join(
    "-"
  );
}

/* =========================================
   TIMESTAMP DA SESSÃO
========================================= */

function getEvolutionTimestamp(
  evolution:
    StoredEvolution
) {
  if (
    !evolution.sessionDate
  ) {
    return new Date(
      evolution.updatedAt
    ).getTime();
  }

  const date =
    new Date(
      `${evolution.sessionDate}T${
        evolution.startTime ||
        "00:00"
      }:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return new Date(
      evolution.updatedAt
    ).getTime();
  }

  return date.getTime();
}

/* =========================================
   VALIDAÇÃO DO STORAGE
========================================= */

function isValidStoredEvolution(
  value:
    unknown
): value is StoredEvolution {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const evolution =
    value as Partial<StoredEvolution>;

  return (
    typeof evolution.id ===
      "number" &&
    typeof evolution.patientId ===
      "number" &&
    (
      evolution.status ===
        "RASCUNHO" ||
      evolution.status ===
        "FINALIZADA"
    )
  );
}