import type {
  ReactNode,
} from "react";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Hourglass,
  XCircle,
} from "lucide-react";

interface Metric {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  progressClass: string;
  accentClass: string;
  progressWidth: string;
}

const metrics: Metric[] = [
  {
    title: "Atendimentos hoje",
    value: "18",
    description: "de 26 agendados",
    icon: (
      <CalendarCheck2
        size={22}
      />
    ),
    iconClass: "bg-violet-50 text-violet-600",
    progressClass: "bg-violet-500",
    accentClass: "from-violet-500/10 via-transparent to-transparent",
    progressWidth: "w-[69%]",
  },

  {
    title: "Concluídos",
    value: "12",
    description: "66% do total",
    icon: (
      <CheckCircle2
        size={22}
      />
    ),
    iconClass: "bg-emerald-50 text-emerald-600",
    progressClass: "bg-emerald-500",
    accentClass: "from-emerald-500/10 via-transparent to-transparent",
    progressWidth: "w-[66%]",
  },

  {
    title: "Em andamento",
    value: "3",
    description: "17% do total",
    icon: (
      <Hourglass
        size={22}
      />
    ),
    iconClass: "bg-amber-50 text-amber-600",
    progressClass: "bg-amber-500",
    accentClass: "from-amber-500/10 via-transparent to-transparent",
    progressWidth: "w-[17%]",
  },

  {
    title: "Aguardando",
    value: "4",
    description: "17% do total",
    icon: (
      <Clock3
        size={22}
      />
    ),
    iconClass: "bg-sky-50 text-sky-600",
    progressClass: "bg-sky-500",
    accentClass: "from-sky-500/10 via-transparent to-transparent",
    progressWidth: "w-[17%]",
  },

  {
    title: "Cancelamentos",
    value: "1",
    description: "Hoje",
    icon: (
      <XCircle
        size={22}
      />
    ),
    iconClass: "bg-rose-50 text-rose-600",
    progressClass: "bg-rose-500",
    accentClass: "from-rose-500/10 via-transparent to-transparent",
    progressWidth: "w-[20%]",
  },
];

export function RecepcaoMetricCards() {
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
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${metric.accentClass}`}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
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
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.iconClass}`}
              >
                {
                  metric.icon
                }
              </div>
            </div>

            <p className="relative mt-4 text-xs font-medium text-slate-400">
              {
                metric.description
              }
            </p>

            <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${metric.progressClass} ${metric.progressWidth}`}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}