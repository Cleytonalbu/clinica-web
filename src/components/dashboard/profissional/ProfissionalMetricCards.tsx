import type {
  ReactNode,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  UserX,
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone:
    | "purple"
    | "cyan"
    | "orange"
    | "blue"
    | "pink";
}

const metrics: MetricCard[] = [
  {
    title: "Consultas hoje",
    value: "8",
    description: "2 já realizadas",
    icon: (
      <CalendarDays
        size={22}
      />
    ),
    tone: "purple",
  },

  {
    title: "Pacientes atendidos",
    value: "28",
    description: "+8% este mês",
    icon: (
      <CheckCircle2
        size={22}
      />
    ),
    tone: "cyan",
  },

  {
    title: "Evoluções pendentes",
    value: "7",
    description: "Precisam de atenção",
    icon: (
      <ClipboardList
        size={22}
      />
    ),
    tone: "orange",
  },

  {
    title: "Próximos atendimentos",
    value: "5",
    description: "Até o fim do dia",
    icon: (
      <Clock3
        size={22}
      />
    ),
    tone: "blue",
  },

  {
    title: "Faltas hoje",
    value: "1",
    description: "1 ausência registrada",
    icon: (
      <UserX
        size={22}
      />
    ),
    tone: "pink",
  },
];

const tones = {
  purple:
    "bg-violet-50 text-violet-600",

  cyan:
    "bg-cyan-50 text-cyan-600",

  orange:
    "bg-orange-50 text-orange-600",

  blue:
    "bg-sky-50 text-sky-600",

  pink:
    "bg-pink-50 text-pink-600",
};

export function ProfissionalMetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map(
        (
          metric
        ) => (
          <div
            key={
              metric.title
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {
                    metric.title
                  }
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {
                    metric.value
                  }
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  tones[
                    metric.tone
                  ]
                }`}
              >
                {
                  metric.icon
                }
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
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