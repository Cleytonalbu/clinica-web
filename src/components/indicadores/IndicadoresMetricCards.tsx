import type {
  ReactNode,
} from "react";

import {
  CircleCheckBig,
  CircleX,
  Goal,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";

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

const metrics: Metric[] = [
  {
    title: "Crianças cadastradas",
    value: "156",
    description: "+8% em relação ao mês anterior",
    icon: (
      <UsersRound
        size={21}
      />
    ),
    tone: "indigo",
  },

  {
    title: "Profissionais ativos",
    value: "18",
    description: "Sem alteração",
    icon: (
      <CircleCheckBig
        size={21}
      />
    ),
    tone: "blue",
  },

  {
    title: "Objetivos ativos",
    value: "842",
    description: "+12% em relação ao mês anterior",
    icon: (
      <Target
        size={21}
      />
    ),
    tone: "violet",
  },

  {
    title: "Objetivos alcançados",
    value: "324",
    description: "+12% em relação ao mês anterior",
    icon: (
      <Trophy
        size={21}
      />
    ),
    tone: "green",
  },

  {
    title: "Objetivos em evolução",
    value: "472",
    description: "+10% em relação ao mês anterior",
    icon: (
      <TrendingUp
        size={21}
      />
    ),
    tone: "orange",
  },

  {
    title: "Objetivos com regressão",
    value: "46",
    description: "-5% em relação ao mês anterior",
    icon: (
      <TrendingDown
        size={21}
      />
    ),
    tone: "red",
  },

  {
    title: "Faltas registradas",
    value: "18",
    description: "-8% em relação ao mês anterior",
    icon: (
      <CircleX
        size={21}
      />
    ),
    tone: "pink",
  },
];

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