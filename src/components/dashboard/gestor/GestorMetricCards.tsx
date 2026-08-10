import type {
  ReactNode,
} from "react";

import {
  CalendarCheck2,
  CircleDollarSign,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}

const cards: MetricCard[] = [
  {
    title: "Atendimentos hoje",
    value: "24",
    subtitle: "+12% em relação a ontem",
    icon: (
      <CalendarCheck2
        size={22}
      />
    ),
  },

  {
    title: "Novos pacientes",
    value: "18",
    subtitle: "Neste mês",
    icon: (
      <UserPlus
        size={22}
      />
    ),
  },

  {
    title: "Sessões realizadas",
    value: "156",
    subtitle: "Neste mês",
    icon: (
      <UsersRound
        size={22}
      />
    ),
  },

  {
    title: "Faturamento",
    value: "R$ 28.450",
    subtitle: "Neste mês",
    icon: (
      <CircleDollarSign
        size={22}
      />
    ),
  },

  {
    title: "Cancelamentos",
    value: "7",
    subtitle: "Neste mês",
    icon: (
      <XCircle
        size={22}
      />
    ),
  },
];

export function GestorMetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        (
          card
        ) => (
          <div
            key={
              card.title
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {
                    card.title
                  }
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {
                    card.value
                  }
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                {
                  card.icon
                }
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              {
                card.subtitle
              }
            </p>
          </div>
        )
      )}
    </div>
  );
}