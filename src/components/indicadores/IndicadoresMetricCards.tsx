import type {
  ReactNode,
} from "react";

import {
  CircleCheckBig,
  CircleX,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";


import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  getObjectives,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

interface Metric {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone:
    | "indigo"
    | "blue"
    | "violet"
    | "green"
    | "orange"
    | "red"
    | "pink";
}

const toneClasses = {
  indigo:
    "bg-indigo-50 text-indigo-600",
  blue:
    "bg-sky-50 text-sky-600",
  violet:
    "bg-violet-50 text-violet-600",
  green:
    "bg-emerald-50 text-emerald-600",
  orange:
    "bg-orange-50 text-orange-600",
  red:
    "bg-red-50 text-red-600",
  pink:
    "bg-pink-50 text-pink-600",
};

export function IndicadoresMetricCards() {
  const {
    activeUnitId,
  } =
    useUnit();

  const patients =
    getPatients().filter(
      (
        patient
      ) =>
        patient.status ===
          "Ativo"
    );

  const professionals =
    getActiveProfessionals().filter(
      (
        professional
      ) =>
        professionalWorksAtUnit(
          professional.id,
          activeUnitId
        )
    );

  const objectives =
    getObjectives().filter(
      (
        objective
      ) =>
        objective.unitId ===
          activeUnitId
    );

  const appointments =
    getSavedAppointments().filter(
      (
        appointment
      ) =>
        appointment.unitId ===
          activeUnitId
    );

  const metrics:
    Metric[] = [
    {
      title:
        "Crianças cadastradas",
      value:
        String(
          patients.length
        ),
      description:
        "Pacientes ativos nesta unidade",
      icon:
        <UsersRound
          size={21}
        />,
      tone:
        "indigo",
    },

    {
      title:
        "Profissionais ativos",
      value:
        String(
          professionals.length
        ),
      description:
        "Profissionais vinculados à unidade",
      icon:
        <CircleCheckBig
          size={21}
        />,
      tone:
        "blue",
    },

    {
      title:
        "Objetivos ativos",
      value:
        String(
          objectives.filter(
            (
              item
            ) =>
              item.status ===
                "Em evolução" ||
              item.status ===
                "Com regressão"
          ).length
        ),
      description:
        "Objetivos ainda em acompanhamento",
      icon:
        <Target
          size={21}
        />,
      tone:
        "violet",
    },

    {
      title:
        "Objetivos alcançados",
      value:
        String(
          objectives.filter(
            (
              item
            ) =>
              item.status ===
                "Atingido"
          ).length
        ),
      description:
        "Objetivos registrados como atingidos",
      icon:
        <Trophy
          size={21}
        />,
      tone:
        "green",
    },

    {
      title:
        "Objetivos em evolução",
      value:
        String(
          objectives.filter(
            (
              item
            ) =>
              item.status ===
                "Em evolução"
          ).length
        ),
      description:
        "Objetivos com progresso em andamento",
      icon:
        <TrendingUp
          size={21}
        />,
      tone:
        "orange",
    },

    {
      title:
        "Objetivos com regressão",
      value:
        String(
          objectives.filter(
            (
              item
            ) =>
              item.status ===
                "Com regressão"
          ).length
        ),
      description:
        "Objetivos que exigem atenção",
      icon:
        <TrendingDown
          size={21}
        />,
      tone:
        "red",
    },

    {
      title:
        "Faltas registradas",
      value:
        String(
          appointments.filter(
            (
              item
            ) =>
              item.status ===
                "Faltou"
          ).length
        ),
      description:
        "Faltas registradas nesta unidade",
      icon:
        <CircleX
          size={21}
        />,
      tone:
        "pink",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
      {metrics.map(
        (
          metric
        ) => (
          <div
            key={
              metric.title
            }
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold leading-5 text-slate-600">
                  {
                    metric.title
                  }
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {
                    metric.value
                  }
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  toneClasses[
                    metric.tone
                  ]
                }`}
              >
                {
                  metric.icon
                }
              </div>
            </div>

            <p className="mt-4 text-[10px] leading-4 text-slate-400">
              {
                metric.description
              }
            </p>
          </div>
        )
      )}
    </div>
  );
}
