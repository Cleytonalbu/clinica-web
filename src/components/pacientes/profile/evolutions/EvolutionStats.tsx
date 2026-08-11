import {
  ClipboardList,
  FileText,
  Users,
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

/* =========================================
   COMPONENTE
========================================= */

export function EvolutionStats() {
  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     EVOLUÇÕES DO PACIENTE
  ======================================= */

  const evolutions =
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

        return getEvolutionsByPatientId(
          patientId
        );
      },
      [
        patientId,
      ]
    );

  /* =======================================
     TOTAL DE EVOLUÇÕES
  ======================================= */

  const totalEvolutions =
    evolutions.length;

  /* =======================================
     ESPECIALIDADES
  ======================================= */

  const totalSpecialties =
    useMemo(
      () => {
        const specialties =
          new Set(
            evolutions
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

        return specialties.size;
      },
      [
        evolutions,
      ]
    );

  /* =======================================
     ANEXOS
  ======================================= */

  const totalAttachments =
    useMemo(
      () =>
        evolutions.reduce(
          (
            total,
            evolution
          ) =>
            total +
            (
              Number.isFinite(
                evolution.attachments
              )
                ? evolution.attachments
                : 0
            ),

          0
        ),
      [
        evolutions,
      ]
    );

  /* =======================================
     CARDS
  ======================================= */

  const stats = [
    {
      title:
        "Evoluções",

      value:
        String(
          totalEvolutions
        ),

      description:
        totalEvolutions ===
        1
          ? "registro clínico"
          : "registros clínicos",

      icon:
        ClipboardList,
    },

    {
      title:
        "Especialidades",

      value:
        String(
          totalSpecialties
        ),

      description:
        totalSpecialties ===
        1
          ? "especialidade envolvida"
          : "especialidades envolvidas",

      icon:
        Users,
    },

    {
      title:
        "Anexos",

      value:
        String(
          totalAttachments
        ),

      description:
        totalAttachments ===
        1
          ? "arquivo vinculado"
          : "arquivos vinculados",

      icon:
        FileText,
    },
  ];

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map(
        (
          stat
        ) => {
          const Icon =
            stat.icon;

          return (
            <div
              key={
                stat.title
              }
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    {
                      stat.title
                    }
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {
                      stat.value
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      stat.description
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
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