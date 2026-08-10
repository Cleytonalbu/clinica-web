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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
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

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
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

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-sky-500" />
            </div>
          </div>
        )
      )}
    </div>
  );
}