export type ObjectiveStatus =
  | "Em evolução"
  | "Atingido"
  | "Com regressão";

export interface TherapeuticObjective {
  id: number;

  patientId: number;

  generalObjective: string;

  title: string;

  specialty: string;

  professional: string;

  startDate: string;

  targetDate: string;

  progress: number;

  status: ObjectiveStatus;

  observation?: string;

  createdAt: string;

  updatedAt: string;
}

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-therapeutic-objectives";

/* =========================================
   LISTAR TODOS
========================================= */

export function getObjectives():
  TherapeuticObjective[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Array<TherapeuticObjective & { generalObjective?: string }>;

    return parsed.map((objective) => ({
      ...objective,
      generalObjective: objective.generalObjective?.trim() || "Objetivo terapêutico geral",
    }));
  } catch {
    return [];
  }
}

/* =========================================
   OBJETIVOS DO PACIENTE
========================================= */

export function getObjectivesByPatientId(
  patientId: number
) {
  return getObjectives().filter(
    (
      objective
    ) =>
      objective.patientId ===
      patientId
  );
}

/* =========================================
   AGRUPAR POR OBJETIVO GERAL
========================================= */

export interface ObjectiveGroup {
  generalObjective: string;
  objectives: TherapeuticObjective[];
}

export function getObjectiveGroupsByPatientId(patientId: number): ObjectiveGroup[] {
  const groups = new Map<string, TherapeuticObjective[]>();

  getObjectivesByPatientId(patientId).forEach((objective) => {
    const key = objective.generalObjective.trim() || "Objetivo terapêutico geral";
    groups.set(key, [...(groups.get(key) ?? []), objective]);
  });

  return Array.from(groups.entries()).map(([generalObjective, objectives]) => ({
    generalObjective,
    objectives,
  }));
}

/* =========================================
   BUSCAR POR ID
========================================= */

export function getObjectiveById(
  objectiveId: number
) {
  return getObjectives().find(
    (
      objective
    ) =>
      objective.id ===
      objectiveId
  );
}

/* =========================================
   CRIAR
========================================= */

interface CreateObjectiveData {
  patientId: number;

  generalObjective: string;

  title: string;

  specialty: string;

  professional: string;

  startDate: string;

  targetDate: string;

  progress?: number;

  status?: ObjectiveStatus;

  observation?: string;
}

export function createObjective(
  data: CreateObjectiveData
) {
  const current =
    getObjectives();

  const now =
    new Date().toISOString();

  const objective:
    TherapeuticObjective = {
    id:
      generateObjectiveId(
        current
      ),

    patientId:
      data.patientId,

    generalObjective:
      data.generalObjective.trim(),

    title:
      data.title.trim(),

    specialty:
      data.specialty,

    professional:
      data.professional,

    startDate:
      data.startDate,

    targetDate:
      data.targetDate,

    progress:
      normalizeProgress(
        data.progress ??
          0
      ),

    status:
      data.status ??
      "Em evolução",

    observation:
      data.observation?.trim() ||
      undefined,

    createdAt:
      now,

    updatedAt:
      now,
  };

  saveObjectives(
    [
      ...current,
      objective,
    ]
  );

  return objective;
}

/* =========================================
   ATUALIZAR
========================================= */

export function updateObjective(
  objectiveId: number,

  data:
    Partial<
      Omit<
        TherapeuticObjective,
        | "id"
        | "patientId"
        | "createdAt"
      >
    >
) {
  const current =
    getObjectives();

  const existing =
    current.find(
      (
        objective
      ) =>
        objective.id ===
        objectiveId
    );

  if (!existing) {
    throw new Error(
      "Objetivo não encontrado."
    );
  }

  const next =
    current.map(
      (
        objective
      ) => {
        if (
          objective.id !==
          objectiveId
        ) {
          return objective;
        }

        return {
          ...objective,

          ...data,

          progress:
            data.progress !==
            undefined
              ? normalizeProgress(
                  data.progress
                )
              : objective.progress,

          updatedAt:
            new Date()
              .toISOString(),
        };
      }
    );

  saveObjectives(
    next
  );

  return next.find(
    (
      objective
    ) =>
      objective.id ===
      objectiveId
  );
}

/* =========================================
   REMOVER
========================================= */

export function deleteObjective(
  objectiveId: number
) {
  const current =
    getObjectives();

  const next =
    current.filter(
      (
        objective
      ) =>
        objective.id !==
        objectiveId
    );

  saveObjectives(
    next
  );
}

/* =========================================
   OBJETIVOS ATIVOS
========================================= */

export function getActiveObjectivesByPatientId(
  patientId: number
) {
  return getObjectivesByPatientId(
    patientId
  ).filter(
    (
      objective
    ) =>
      objective.status ===
        "Em evolução" ||
      objective.status ===
        "Com regressão"
  );
}

/* =========================================
   CONTADORES
========================================= */

export function getObjectiveSummary(
  patientId: number
) {
  const objectives =
    getObjectivesByPatientId(
      patientId
    );

  return {
    total:
      objectives.length,

    inProgress:
      objectives.filter(
        (
          objective
        ) =>
          objective.status ===
          "Em evolução"
      ).length,

    achieved:
      objectives.filter(
        (
          objective
        ) =>
          objective.status ===
          "Atingido"
      ).length,

    regression:
      objectives.filter(
        (
          objective
        ) =>
          objective.status ===
          "Com regressão"
      ).length,
  };
}

/* =========================================
   SALVAR LISTA
========================================= */

function saveObjectives(
  objectives:
    TherapeuticObjective[]
) {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      objectives
    )
  );
}

/* =========================================
   GERAR ID
========================================= */

function generateObjectiveId(
  objectives:
    TherapeuticObjective[]
) {
  if (
    objectives.length ===
    0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...objectives.map(
        (
          objective
        ) =>
          objective.id
      )
    ) +
    1
  );
}

/* =========================================
   NORMALIZAR PROGRESSO
========================================= */

function normalizeProgress(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.min(
    Math.max(
      Math.round(
        value
      ),
      0
    ),
    100
  );
}