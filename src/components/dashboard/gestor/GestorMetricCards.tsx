import type {
  ComponentType,
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

  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;

  iconStyle: string;
  valueStyle: string;
  subtitleStyle?: string;
}

const cards: MetricCard[] = [
  {
    title: "Atendimentos hoje",
    value: "24",
    subtitle: "+12% em relação a ontem",
    icon: CalendarCheck2,
    iconStyle:
      "bg-[#eeeaff] text-[#6847f5]",
    valueStyle:
      "text-[#6241ed]",
    subtitleStyle:
      "text-[#23a875]",
  },

  {
    title: "Novos pacientes",
    value: "18",
    subtitle: "Neste mês",
    icon: UserPlus,
    iconStyle:
      "bg-[#eaf7ff] text-[#2b9bd8]",
    valueStyle:
      "text-[#258dca]",
  },

  {
    title: "Sessões realizadas",
    value: "156",
    subtitle: "Neste mês",
    icon: UsersRound,
    iconStyle:
      "bg-[#eafbf6] text-[#27ae83]",
    valueStyle:
      "text-[#249b77]",
  },

  {
    title: "Faturamento",
    value: "R$ 28.450",
    subtitle: "Neste mês",
    icon: CircleDollarSign,
    iconStyle:
      "bg-[#fff5df] text-[#e7a229]",
    valueStyle:
      "text-[#db951d]",
  },

  {
    title: "Cancelamentos",
    value: "7",
    subtitle: "Neste mês",
    icon: XCircle,
    iconStyle:
      "bg-[#fff0f1] text-[#ec6571]",
    valueStyle:
      "text-[#e85d69]",
  },
];

export function GestorMetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        (card) => {
          const Icon =
            card.icon;

          return (
            <div
              key={card.title}
              className="
                rounded-2xl
                border
                border-[#eceef6]
                bg-white
                p-5
                shadow-[0_4px_16px_rgba(51,65,120,0.04)]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_8px_24px_rgba(51,65,120,0.08)]
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#69769d]">
                    {card.title}
                  </p>

                  <p
                    className={`
                      mt-3
                      whitespace-nowrap
                      text-[26px]
                      font-extrabold
                      tracking-[-0.02em]
                      ${card.valueStyle}
                    `}
                  >
                    {card.value}
                  </p>
                </div>

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${card.iconStyle}
                  `}
                >
                  <Icon size={21} />
                </div>
              </div>

              <p
                className={`
                  mt-4
                  text-[11px]
                  font-semibold
                  ${
                    card.subtitleStyle ??
                    "text-[#9aa3bd]"
                  }
                `}
              >
                {card.subtitle}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}