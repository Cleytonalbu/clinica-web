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

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";


import {
  getFinancialCharges,
} from "@/pages/Financeiro/financeStorage";

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

function localDateValue(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export function GestorMetricCards() {
  const {
    activeUnitId,
  } =
    useUnit();

  const now =
    new Date();

  const today =
    localDateValue(
      now
    );

  const monthPrefix =
    `${now.getFullYear()}-${String(
      now.getMonth() +
        1
    ).padStart(
      2,
      "0"
    )}`;

  const appointments =
    getSavedAppointments().filter(
      (
        item
      ) =>
        item.unitId ===
          activeUnitId
    );

  const charges =
    getFinancialCharges().filter(
      (
        item
      ) =>
        item.unitId ===
          activeUnitId
    );

  const patients =
    getPatients();

  const cards:
    MetricCard[] = [
    {
      title:
        "Atendimentos hoje",
      value:
        String(
          appointments.filter(
            (
              item
            ) =>
              item.date ===
                today &&
              item.status !==
                "Cancelado" &&
              item.status !==
                "Faltou"
          ).length
        ),
      subtitle:
        "Agenda da unidade",
      icon:
        CalendarCheck2,
      iconStyle:
        "bg-[#eeeaff] text-[#6847f5]",
      valueStyle:
        "text-[#6241ed]",
      subtitleStyle:
        "text-[#23a875]",
    },

    {
      title:
        "Novos pacientes",
      value:
        String(
          patients.filter(
            (
              item
            ) =>
              item.createdAt.startsWith(
                monthPrefix
              )
          ).length
        ),
      subtitle:
        "Neste mês",
      icon:
        UserPlus,
      iconStyle:
        "bg-[#eaf7ff] text-[#2b9bd8]",
      valueStyle:
        "text-[#258dca]",
    },

    {
      title:
        "Sessões realizadas",
      value:
        String(
          appointments.filter(
            (
              item
            ) =>
              item.date.startsWith(
                monthPrefix
              ) &&
              item.status ===
                "Realizado"
          ).length
        ),
      subtitle:
        "Neste mês",
      icon:
        UsersRound,
      iconStyle:
        "bg-[#eafbf6] text-[#27ae83]",
      valueStyle:
        "text-[#249b77]",
    },

    {
      title:
        "Faturamento",
      value:
        new Intl.NumberFormat(
          "pt-BR",
          {
            style:
              "currency",
            currency:
              "BRL",
            maximumFractionDigits:
              0,
          }
        ).format(
          charges
            .filter(
              (
                item
              ) =>
                item.date.startsWith(
                  monthPrefix
                ) &&
                item.status !==
                  "Cancelado"
            )
            .reduce(
              (
                total,
                item
              ) =>
                total +
                item.amount,
              0
            )
        ),
      subtitle:
        "Neste mês",
      icon:
        CircleDollarSign,
      iconStyle:
        "bg-[#fff5df] text-[#e7a229]",
      valueStyle:
        "text-[#db951d]",
    },

    {
      title:
        "Cancelamentos",
      value:
        String(
          appointments.filter(
            (
              item
            ) =>
              item.date.startsWith(
                monthPrefix
              ) &&
              item.status ===
                "Cancelado"
          ).length
        ),
      subtitle:
        "Neste mês",
      icon:
        XCircle,
      iconStyle:
        "bg-[#fff0f1] text-[#ec6571]",
      valueStyle:
        "text-[#e85d69]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        (
          card
        ) => {
          const Icon =
            card.icon;

          return (
            <div
              key={
                card.title
              }
              className="rounded-2xl border border-[#eceef6] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(51,65,120,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#69769d]">
                    {
                      card.title
                    }
                  </p>

                  <p className={`mt-3 whitespace-nowrap text-[26px] font-extrabold tracking-[-0.02em] ${card.valueStyle}`}>
                    {
                      card.value
                    }
                  </p>
                </div>

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}>
                  <Icon
                    size={21}
                  />
                </div>
              </div>

              <p className={`mt-4 text-[11px] font-semibold ${card.subtitleStyle ?? "text-[#9aa3bd]"}`}>
                {
                  card.subtitle
                }
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}
