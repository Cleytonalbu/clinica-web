import type {
  ReactNode,
} from "react";

import {
  CircleCheckBig,
  CircleX,
  Target,
  Trophy,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface IndicadoresMetricCardsProps {
  contadores: ApiIndicadoresGerais["contadores"];
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

  pink:
    "bg-pink-50 text-pink-600",
};

export function IndicadoresMetricCards({
  contadores,
}: IndicadoresMetricCardsProps) {
  const metrics: {
    title: string;
    value: string;
    icon: ReactNode;
    tone: keyof typeof toneClasses;
  }[] = [
    {
      title: "Crianças cadastradas",
      value: String(contadores.criancasCadastradas),
      icon: <UsersRound size={21} />,
      tone: "indigo",
    },
    {
      title: "Profissionais ativos",
      value: String(contadores.profissionaisAtivos),
      icon: <CircleCheckBig size={21} />,
      tone: "blue",
    },
    {
      title: "Objetivos ativos",
      value: String(contadores.objetivosAtivos),
      icon: <Target size={21} />,
      tone: "violet",
    },
    {
      title: "Objetivos alcançados",
      value: String(contadores.objetivosAlcancados),
      icon: <Trophy size={21} />,
      tone: "green",
    },
    {
      title: "Objetivos em evolução",
      value: String(contadores.objetivosEmEvolucao),
      icon: <TrendingUp size={21} />,
      tone: "orange",
    },
    {
      title: "Faltas registradas",
      value: String(contadores.faltasRegistradas),
      icon: <CircleX size={21} />,
      tone: "pink",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
          </div>
        )
      )}
    </div>
  );
}
