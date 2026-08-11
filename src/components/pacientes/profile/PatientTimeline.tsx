import {
  CheckCircle2,
  ClipboardList,
  Target,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getEvolutionsByPatientId,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getObjectivesByPatientId,
} from "@/pages/Pacientes/objectiveStorage";

/* =========================================
   TIPOS
========================================= */

interface TimelineItem {
  id:
    string;

  title:
    string;

  description:
    string;

  date:
    string;

  timestamp:
    number;

  icon:
    typeof ClipboardList;

  className:
    string;
}

/* =========================================
   COMPONENTE
========================================= */

export function PatientTimeline() {
  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     HISTÓRICO
  ======================================= */

  const timeline =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        const items:
          TimelineItem[] = [];

        /* =================================
           EVOLUÇÕES
        ================================= */

        const evolutions =
          getEvolutionsByPatientId(
            patientId
          );

        evolutions.forEach(
          (
            evolution
          ) => {
            const timestamp =
              getEvolutionTimestamp(
                evolution.sessionDate,
                evolution.startTime,
                evolution.updatedAt
              );

            items.push(
              {
                id:
                  `evolution-${evolution.id}`,

                title:
                  evolution.status ===
                  "FINALIZADA"
                    ? "Evolução finalizada"
                    : "Rascunho de evolução",

                description:
                  buildEvolutionDescription(
                    evolution.specialty,
                    evolution.professional
                  ),

                date:
                  formatTimelineDate(
                    timestamp
                  ),

                timestamp,

                icon:
                  ClipboardList,

                className:
                  evolution.status ===
                  "FINALIZADA"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600",
              }
            );
          }
        );

        /* =================================
           OBJETIVOS
        ================================= */

        const objectives =
          getObjectivesByPatientId(
            patientId
          );

        objectives.forEach(
          (
            objective
          ) => {
            const createdTimestamp =
              getIsoTimestamp(
                objective.createdAt
              );

            items.push(
              {
                id:
                  `objective-created-${objective.id}`,

                title:
                  "Objetivo criado",

                description:
                  `Objetivo “${objective.title}” adicionado ao plano terapêutico.`,

                date:
                  formatTimelineDate(
                    createdTimestamp
                  ),

                timestamp:
                  createdTimestamp,

                icon:
                  Target,

                className:
                  "bg-violet-100 text-violet-600",
              }
            );

            const updatedTimestamp =
              getIsoTimestamp(
                objective.updatedAt
              );

            /*
             * Só criamos um segundo evento
             * quando houve alteração real
             * após a criação.
             */

            if (
              updatedTimestamp >
              createdTimestamp +
                1000
            ) {
              items.push(
                {
                  id:
                    `objective-updated-${objective.id}`,

                  title:
                    objective.status ===
                    "Atingido"
                      ? "Objetivo concluído"
                      : "Objetivo atualizado",

                  description:
                    buildObjectiveDescription(
                      objective.title,
                      objective.status,
                      objective.progress
                    ),

                  date:
                    formatTimelineDate(
                      updatedTimestamp
                    ),

                  timestamp:
                    updatedTimestamp,

                  icon:
                    objective.status ===
                    "Atingido"
                      ? CheckCircle2
                      : Target,

                  className:
                    objective.status ===
                    "Atingido"
                      ? "bg-emerald-100 text-emerald-600"
                      : objective.status ===
                        "Com regressão"
                        ? "bg-red-100 text-red-600"
                        : "bg-violet-100 text-violet-600",
                }
              );
            }
          }
        );

        /* =================================
           ORDENAR + LIMITAR
        ================================= */

        return items
          .sort(
            (
              a,
              b
            ) =>
              b.timestamp -
              a.timestamp
          )
          .slice(
            0,
            6
          );
      },
      [
        patientId,
      ]
    );

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Histórico recente
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Últimas movimentações clínicas do paciente.
        </p>
      </div>

      {timeline.length >
      0 ? (
        <div className="space-y-1">
          {timeline.map(
            (
              item,
              index
            ) => {
              const Icon =
                item.icon;

              const last =
                index ===
                timeline.length -
                  1;

              return (
                <div
                  key={
                    item.id
                  }
                  className="relative flex gap-4 pb-6"
                >
                  {!last && (
                    <div className="absolute left-5 top-10 h-[calc(100%-16px)] w-px bg-slate-200" />
                  )}

                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.className}`}
                  >
                    <Icon
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-slate-800">
                        {
                          item.title
                        }
                      </p>

                      <span className="text-xs text-slate-400">
                        {
                          item.date
                        }
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {
                        item.description
                      }
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <ClipboardList
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 font-semibold text-slate-700">
            Nenhuma movimentação clínica
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            As evoluções e alterações dos objetivos terapêuticos aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================
   DESCRIÇÃO DA EVOLUÇÃO
========================================= */

function buildEvolutionDescription(
  specialty:
    string,

  professional:
    string
) {
  const parts =
    [
      specialty,
      professional,
    ].filter(
      Boolean
    );

  if (
    parts.length ===
    0
  ) {
    return "Registro clínico do paciente.";
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0];
  }

  return `${parts[0]} com ${parts[1]}.`;
}

/* =========================================
   DESCRIÇÃO DO OBJETIVO
========================================= */

function buildObjectiveDescription(
  title:
    string,

  status:
    string,

  progress:
    number
) {
  if (
    status ===
    "Atingido"
  ) {
    return `Objetivo “${title}” foi marcado como atingido.`;
  }

  if (
    status ===
    "Com regressão"
  ) {
    return `Objetivo “${title}” apresentou regressão. Progresso atual: ${progress}%.`;
  }

  return `Objetivo “${title}” atualizado. Progresso atual: ${progress}%.`;
}

/* =========================================
   TIMESTAMP DA EVOLUÇÃO
========================================= */

function getEvolutionTimestamp(
  sessionDate:
    string,

  startTime:
    string,

  fallback:
    string
) {
  if (
    sessionDate
  ) {
    const date =
      new Date(
        `${sessionDate}T${
          startTime ||
          "00:00"
        }:00`
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.getTime();
    }
  }

  return getIsoTimestamp(
    fallback
  );
}

/* =========================================
   TIMESTAMP ISO
========================================= */

function getIsoTimestamp(
  value:
    string
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 0;
  }

  return date.getTime();
}

/* =========================================
   FORMATAR DATA
========================================= */

function formatTimelineDate(
  timestamp:
    number
) {
  if (
    !timestamp
  ) {
    return "-";
  }

  const date =
    new Date(
      timestamp
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  const now =
    new Date();

  const sameDay =
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate();

  const time =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    ).format(
      date
    );

  if (
    sameDay
  ) {
    return `Hoje • ${time}`;
  }

  const day =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",
      }
    ).format(
      date
    );

  return `${day} • ${time}`;
}