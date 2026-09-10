import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

import type {
  EvolutionMaterialFormData,
  EvolutionObjectiveFormData,
  NutritionEvolutionData,
  ReferralPriority,
  SessionResult,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

import {
  getEvolutionObjectiveMarkerScore,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

import type {
  AbaEvolutionData,
} from "@/components/pacientes/profile/evolutions/abaEvolution.types";

import {
  createDefaultAbaEvolutionData,
} from "@/components/pacientes/profile/evolutions/abaEvolution.types";

import type {
  AbaSupervisionEvolutionData,
} from "@/components/pacientes/profile/evolutions/abaSupervision.types";

import {
  createDefaultAbaSupervisionEvolutionData,
} from "@/components/pacientes/profile/evolutions/abaSupervision.types";

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

  /**
   * Pasta do prontuário onde o anexo deve aparecer.
   * Opcional para preservar anexos antigos, que continuam em "Sem pasta".
   */
  folderId?: string;
}

export interface StoredEvolution {
  id: number;

  patientId: number;

  /**
   * Unidade onde a evolução foi registrada.
   * O prontuário continua global entre unidades.
   */
  unitId: number;

  /**
   * Tipo do formulário utilizado.
   * Registros antigos sem este campo são tratados como PADRAO.
   */
  evolutionType:
    | "PADRAO"
    | "ABA"
    | "SUPERVISAO_ABA";

  /**
   * Dados estruturados exclusivos da Evolução Diária - ABA.
   * Para a evolução padrão, permanece undefined.
   */
  abaData?: AbaEvolutionData;

  /**
   * Dados estruturados exclusivos da Ficha de Evolução
   * da Supervisão ABA.
   */
  abaSupervisionData?: AbaSupervisionEvolutionData;

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

  nutrition:
    NutritionEvolutionData;

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

  unitId?: number;

  evolutionType?:
    | "PADRAO"
    | "ABA"
    | "SUPERVISAO_ABA";

  abaData?:
    Partial<
      AbaEvolutionData
    >;

  abaSupervisionData?:
    Partial<
      AbaSupervisionEvolutionData
    >;

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

  nutrition?:
    Partial<
      NutritionEvolutionData
    >;

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

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed =
      false;

    const normalized =
      parsed
        .filter(
          isValidStoredEvolution
        )
        .map(
          (
            evolution
          ) => {
            const unitId =
              Number(
                evolution.unitId
              );

            const normalizedUnitId =
              Number.isFinite(
                unitId
              ) &&
              unitId > 0
                ? unitId
                : defaultUnitId;

            const materials =
              normalizeMaterials(
                Array.isArray(
                  evolution.materials
                )
                  ? evolution.materials
                  : []
              );

            const nutrition =
              normalizeNutrition(
                evolution.nutrition
              );

            const evolutionType =
              evolution.evolutionType ===
              "ABA"
                ? "ABA"
                : evolution.evolutionType ===
                    "SUPERVISAO_ABA"
                  ? "SUPERVISAO_ABA"
                  : "PADRAO";

            const abaData =
              evolutionType ===
              "ABA"
                ? normalizeAbaData(
                    evolution.abaData
                  )
                : undefined;

            const abaSupervisionData =
              evolutionType ===
              "SUPERVISAO_ABA"
                ? normalizeAbaSupervisionData(
                    evolution.abaSupervisionData
                  )
                : undefined;

            if (
              normalizedUnitId !==
                evolution.unitId ||
              !Array.isArray(
                evolution.materials
              ) ||
              !evolution.nutrition ||
              evolution.evolutionType !==
                evolutionType ||
              (
                evolutionType ===
                  "ABA" &&
                !evolution.abaData
              ) ||
              (
                evolutionType ===
                  "SUPERVISAO_ABA" &&
                !evolution.abaSupervisionData
              )
            ) {
              changed =
                true;
            }

            return {
              ...evolution,
              unitId:
                normalizedUnitId,
              materials,
              nutrition,
              evolutionType,
              abaData,
              abaSupervisionData,
            };
          }
        );

    if (
      changed
    ) {
      saveEvolutions(
        normalized
      );
    }

    return normalized;
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
    if (
      data.evolutionType ===
      "ABA"
    ) {
      validateFinalizedAbaEvolution(
        data
      );
    } else if (
      data.evolutionType ===
      "SUPERVISAO_ABA"
    ) {
      validateFinalizedAbaSupervisionEvolution(
        data
      );
    } else {
      validateFinalizedEvolution(
        data
      );
    }
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

    unitId:
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
        : getDefaultClinicUnitId(),

    evolutionType:
      data.evolutionType ===
      "ABA"
        ? "ABA"
        : data.evolutionType ===
            "SUPERVISAO_ABA"
          ? "SUPERVISAO_ABA"
          : "PADRAO",

    abaData:
      data.evolutionType ===
      "ABA"
        ? normalizeAbaData(
            data.abaData
          )
        : undefined,

    abaSupervisionData:
      data.evolutionType ===
      "SUPERVISAO_ABA"
        ? normalizeAbaSupervisionData(
            data.abaSupervisionData
          )
        : undefined,

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

    nutrition:
      normalizeNutrition(
        data.nutrition
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

    evolutionType:
      data.evolutionType ===
      "ABA"
        ? "ABA"
        : data.evolutionType ===
            "SUPERVISAO_ABA"
          ? "SUPERVISAO_ABA"
          : data.evolutionType ===
              "PADRAO"
            ? "PADRAO"
            : existing.evolutionType,

    abaData:
      data.abaData !==
      undefined
        ? normalizeAbaData(
            data.abaData
          )
        : existing.abaData,

    abaSupervisionData:
      data.abaSupervisionData !==
      undefined
        ? normalizeAbaSupervisionData(
            data.abaSupervisionData
          )
        : existing.abaSupervisionData,

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

    nutrition:
      data.nutrition !==
      undefined
        ? normalizeNutrition(
            data.nutrition
          )
        : existing.nutrition,

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
    if (
      merged.evolutionType ===
      "ABA"
    ) {
      validateFinalizedAbaEvolution(
        merged
      );
    } else if (
      merged.evolutionType ===
      "SUPERVISAO_ABA"
    ) {
      validateFinalizedAbaSupervisionEvolution(
        merged
      );
    } else {
      validateFinalizedEvolution(
        merged
      );
    }

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
   VALIDAR FINALIZAÇÃO ABA
========================================= */

function validateFinalizedAbaEvolution(
  data:
    Pick<
      CreateEvolutionData,
      | "patientId"
      | "sessionDate"
      | "professional"
      | "abaData"
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
    !cleanText(
      data.professional
    )
  ) {
    throw new Error(
      "Informe o profissional responsável."
    );
  }

  const aba =
    normalizeAbaData(
      data.abaData
    );

  if (
    !aba.conditionEntry
  ) {
    throw new Error(
      "Informe a condição de entrada."
    );
  }

  const filledPrograms =
    aba.programs.filter(
      (
        program
      ) =>
        Boolean(
          program.program
        )
    );

  if (
    filledPrograms.length ===
    0
  ) {
    throw new Error(
      "Informe pelo menos um programa."
    );
  }

  if (
    filledPrograms.some(
      (
        program
      ) =>
        !program.response
    )
  ) {
    throw new Error(
      "Selecione a resposta dos programas preenchidos."
    );
  }

  if (
    !aba.programsExecution
  ) {
    throw new Error(
      "Informe a execução dos programas."
    );
  }

  if (
    !aba.conclusion
  ) {
    throw new Error(
      "Informe a conclusão da evolução."
    );
  }
}

/* =========================================
   VALIDAR SUPERVISÃO ABA
========================================= */

function validateFinalizedAbaSupervisionEvolution(
  data:
    Pick<
      CreateEvolutionData,
      | "patientId"
      | "sessionDate"
      | "startTime"
      | "professional"
      | "abaSupervisionData"
    >
) {
  validatePatientId(
    data.patientId
  );

  if (!data.sessionDate) {
    throw new Error(
      "Informe a data da supervisão."
    );
  }

  if (!data.startTime) {
    throw new Error(
      "Informe o horário de início."
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

  const supervision =
    normalizeAbaSupervisionData(
      data.abaSupervisionData
    );

  if (
    !supervision.conditionEntry
  ) {
    throw new Error(
      "Informe a condição de entrada do paciente."
    );
  }

  if (
    !supervision.companionAttendance
  ) {
    throw new Error(
      "Informe se o acompanhante compareceu à supervisão."
    );
  }

  if (
    !supervision.allProgramsApplied
  ) {
    throw new Error(
      "Informe se todos os programas foram aplicados na semana."
    );
  }

  if (
    !supervision.programNeedsModification
  ) {
    throw new Error(
      "Informe se algum programa precisa ser modificado."
    );
  }

  if (
    !supervision.programEnded
  ) {
    throw new Error(
      "Informe se algum programa foi encerrado."
    );
  }

  if (
    !supervision.helpLevelEvolution
  ) {
    throw new Error(
      "Informe se houve evolução no nível de ajuda."
    );
  }

  if (
    !supervision.conclusion
  ) {
    throw new Error(
      "Informe a conclusão da supervisão."
    );
  }
}

/* =========================================
   NORMALIZAR SUPERVISÃO ABA
========================================= */

function normalizeAbaSupervisionData(
  value:
    Partial<
      AbaSupervisionEvolutionData
    > |
    undefined
):
  AbaSupervisionEvolutionData {
  const defaults =
    createDefaultAbaSupervisionEvolutionData();

  const attendance =
    value?.companionAttendance ===
        "SIM" ||
      value?.companionAttendance ===
        "NAO" ||
      value?.companionAttendance ===
        "JUSTIFICOU_AUSENCIA"
      ? value.companionAttendance
      : "";

  const normalizeYesNo = (
    candidate:
      unknown
  ):
    "" | "SIM" | "NAO" =>
    candidate === "SIM" ||
    candidate === "NAO"
      ? candidate
      : "";

  return {
    ...defaults,

    conditionEntry:
      cleanText(
        value?.conditionEntry
      ),

    therapeuticCompanion:
      cleanText(
        value?.therapeuticCompanion
      ),

    companionAttendance:
      attendance,

    allProgramsApplied:
      normalizeYesNo(
        value?.allProgramsApplied
      ),

    programNeedsModification:
      normalizeYesNo(
        value?.programNeedsModification
      ),

    hardestProgram:
      cleanText(
        value?.hardestProgram
      ),

    programEnded:
      normalizeYesNo(
        value?.programEnded
      ),

    helpLevelEvolution:
      normalizeYesNo(
        value?.helpLevelEvolution
      ),

    additionalObservations:
      cleanText(
        value?.additionalObservations
      ),

    conclusion:
      cleanText(
        value?.conclusion
      ),
  };
}

/* =========================================
   NORMALIZAR EVOLUÇÃO ABA
========================================= */

function normalizeAbaData(
  value:
    Partial<
      AbaEvolutionData
    > |
    undefined
):
  AbaEvolutionData {
  const defaults =
    createDefaultAbaEvolutionData();

  const sourcePrograms =
    Array.isArray(
      value?.programs
    )
      ? value!.programs!
      : [];

  return {
    conditionEntry:
      cleanText(
        value?.conditionEntry
      ),

    programs:
      defaults.programs.map(
        (
          defaultProgram
        ) => {
          const source =
            sourcePrograms.find(
              (
                program
              ) =>
                Number(
                  program.index
                ) ===
                defaultProgram.index
            );

          const response =
            source?.response ===
                "APOIO_TOTAL" ||
              source?.response ===
                "APOIO_PARCIAL" ||
              source?.response ===
                "INDEPENDENCIA"
              ? source.response
              : "";

          return {
            index:
              defaultProgram.index,

            program:
              cleanText(
                source?.program
              ),

            response,
          };
        }
      ),

    programsExecution:
      value?.programsExecution ===
          "TOTALMENTE_REALIZADOS" ||
        value?.programsExecution ===
          "PARCIALMENTE_REALIZADOS" ||
        value?.programsExecution ===
          "NAO_REALIZADOS"
        ? value.programsExecution
        : "",

    additionalObservations:
      cleanText(
        value?.additionalObservations
      ),

    conclusion:
      cleanText(
        value?.conclusion
      ),
  };
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

      markerScore:
        getEvolutionObjectiveMarkerScore(
          objective.status
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
          cleanText(
            material.name
          ),
        quantity:
          cleanText(
            material.quantity
          ),
        observation:
          cleanText(
            material.observation
          ),
      })
    )
    .filter(
      (
        material
      ) =>
        Boolean(
          material.name ||
          material.quantity ||
          material.observation
        )
    );
}

/* =========================================
   NORMALIZAR DADOS NUTRICIONAIS
========================================= */

function normalizeNutrition(
  nutrition:
    Partial<
      NutritionEvolutionData
    > |
    undefined
):
  NutritionEvolutionData {
  return {
    weightKg:
      cleanText(
        nutrition?.weightKg
      ),

    heightCm:
      cleanText(
        nutrition?.heightCm
      ),

    appetite:
      nutrition?.appetite ??
      "",

    foodAcceptance:
      nutrition?.foodAcceptance ??
      "",

    foodSelectivity:
      nutrition?.foodSelectivity ??
      "",

    hydration:
      cleanText(
        nutrition?.hydration
      ),

    acceptedTextures:
      cleanText(
        nutrition?.acceptedTextures
      ),

    foodsPresented:
      cleanText(
        nutrition?.foodsPresented
      ),

    foodsAccepted:
      cleanText(
        nutrition?.foodsAccepted
      ),

    refusalsAversions:
      cleanText(
        nutrition?.refusalsAversions
      ),

    gastrointestinalSymptoms:
      cleanText(
        nutrition?.gastrointestinalSymptoms
      ),

    bowelPattern:
      cleanText(
        nutrition?.bowelPattern
      ),

    nutritionalConduct:
      cleanText(
        nutrition?.nutritionalConduct
      ),

    familyGuidance:
      cleanText(
        nutrition?.familyGuidance
      ),

    nextSessionPlan:
      cleanText(
        nutrition?.nextSessionPlan
      ),
  };
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