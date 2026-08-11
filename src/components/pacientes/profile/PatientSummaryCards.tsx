import {
  CalendarCheck2,
  ClipboardList,
  FileText,
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
   COMPONENTE
========================================= */

export function PatientSummaryCards() {
  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     INDICADORES
  ======================================= */

  const stats =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return {
            appointments:
              0,

            activeObjectives:
              0,

            evolutions:
              0,

            documents:
              0,
          };
        }

        /* =================================
           EVOLUÇÕES
        ================================= */

        const evolutions =
          getEvolutionsByPatientId(
            patientId
          );

        /* =================================
           OBJETIVOS
        ================================= */

        const objectives =
          getObjectivesByPatientId(
            patientId
          );

        /* =================================
           ATENDIMENTOS
        ================================= */

        const appointments =
          evolutions.filter(
            (
              evolution
            ) =>
              evolution.status ===
              "FINALIZADA"
          ).length;

        /* =================================
           OBJETIVOS ATIVOS
        ================================= */

        const activeObjectives =
          objectives.filter(
            (
              objective
            ) =>
              objective.status !==
              "Atingido"
          ).length;

        /* =================================
           DOCUMENTOS / ANEXOS
        ================================= */

        const documents =
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
          appointments,

          activeObjectives,

          evolutions:
            evolutions.length,

          documents,
        };
      },
      [
        patientId,
      ]
    );

  /* =======================================
     CARDS
  ======================================= */

  const cards = [
    {
      id:
        1,

      label:
        "Atendimentos",

      value:
        String(
          stats.appointments
        ),

      description:
        stats.appointments ===
        1
          ? "Sessão realizada"
          : "Sessões realizadas",

      icon:
        CalendarCheck2,

      className:
        "bg-blue-50 text-blue-600",
    },

    {
      id:
        2,

      label:
        "Objetivos ativos",

      value:
        String(
          stats.activeObjectives
        ),

      description:
        stats.activeObjectives ===
        1
          ? "Em acompanhamento"
          : "Em acompanhamento",

      icon:
        Target,

      className:
        "bg-violet-50 text-violet-600",
    },

    {
      id:
        3,

      label:
        "Evoluções",

      value:
        String(
          stats.evolutions
        ),

      description:
        stats.evolutions ===
        1
          ? "Registro clínico"
          : "Registros clínicos",

      icon:
        ClipboardList,

      className:
        "bg-emerald-50 text-emerald-600",
    },

    {
      id:
        4,

      label:
        "Documentos",

      value:
        String(
          stats.documents
        ),

      description:
        stats.documents ===
        1
          ? "Arquivo vinculado"
          : "Arquivos vinculados",

      icon:
        FileText,

      className:
        "bg-amber-50 text-amber-600",
    },
  ];

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(
        (
          card
        ) => {
          const Icon =
            card.icon;

          return (
            <div
              key={
                card.id
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {
                      card.label
                    }
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {
                      card.value
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      card.description
                    }
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.className}`}
                >
                  <Icon
                    size={22}
                  />
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}