import {
  useMemo,
} from "react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

const labels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function GestorVisaoGeral() {
  const {
    activeUnitId,
  } =
    useUnit();

  const {
    chartValues,
    statusItems,
  } =
    useMemo(
      () => {
        const now =
          new Date();

        const year =
          now.getFullYear();

        const month =
          now.getMonth();

        const appointments =
          getSavedAppointments().filter(
            (
              item
            ) =>
              item.unitId ===
                activeUnitId &&
              item.date.startsWith(
                `${year}-`
              )
          );

        const monthly =
          Array.from(
            {
              length:
                12,
            },
            (
              _,
              index
            ) =>
              appointments.filter(
                (
                  item
                ) =>
                  Number(
                    item.date.slice(
                      5,
                      7
                    )
                  ) ===
                    index +
                      1 &&
                  item.status ===
                    "Realizado"
              ).length
          );

        const maxValue =
          Math.max(
            ...monthly,
            1
          );

        const chart =
          monthly.map(
            (
              value
            ) =>
              value ===
                0
                ? 0
                : Math.max(
                    Math.round(
                      (
                        value /
                        maxValue
                      ) *
                        100
                    ),
                    8
                  )
          );

        const monthPrefix =
          `${year}-${String(
            month +
              1
          ).padStart(
            2,
            "0"
          )}`;

        const monthItems =
          appointments.filter(
            (
              item
            ) =>
              item.date.startsWith(
                monthPrefix
              )
          );

        const total =
          Math.max(
            monthItems.length,
            1
          );

        return {
          chartValues:
            chart,

          statusItems: [
            {
              label:
                "Realizados",
              value:
                monthItems.filter(
                  (
                    item
                  ) =>
                    item.status ===
                      "Realizado"
                ).length,
              total,
              barStyle:
                "bg-[#6847f5]",
              dotStyle:
                "bg-[#6847f5]",
            },
            {
              label:
                "Agendados",
              value:
                monthItems.filter(
                  (
                    item
                  ) =>
                    item.status ===
                      "Agendado" ||
                    item.status ===
                      "Confirmado"
                ).length,
              total,
              barStyle:
                "bg-[#37a8e0]",
              dotStyle:
                "bg-[#37a8e0]",
            },
            {
              label:
                "Cancelados",
              value:
                monthItems.filter(
                  (
                    item
                  ) =>
                    item.status ===
                      "Cancelado"
                ).length,
              total,
              barStyle:
                "bg-[#ef6975]",
              dotStyle:
                "bg-[#ef6975]",
            },
          ],
        };
      },
      [
        activeUnitId,
      ]
    );

  return (
    <section className="rounded-2xl border border-[#eceef6] bg-white p-6 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div>
        <h2 className="text-[17px] font-extrabold text-[#10235f]">
          Visão geral
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8a95b4]">
          Evolução dos atendimentos ao longo do ano.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="relative flex h-64 items-end gap-3 overflow-hidden rounded-2xl bg-[#fafaff] px-4 pb-5 pt-6">
          <div className="pointer-events-none absolute inset-x-4 bottom-[42px] top-6 flex flex-col justify-between">
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
          </div>

          {chartValues.map(
            (
              value,
              index
            ) => (
              <div
                key={
                  labels[
                    index
                  ]
                }
                className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-[30px] rounded-t-[7px] bg-gradient-to-t from-[#6544ef] to-[#8a6df8] shadow-[0_4px_10px_rgba(101,68,239,0.12)]"
                    style={{
                      height:
                        `${value}%`,
                    }}
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#9ba4bd]">
                  {
                    labels[
                      index
                    ]
                  }
                </span>
              </div>
            )
          )}
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#10235f]">
            Status mensal
          </p>

          <div className="mt-6 space-y-6">
            {statusItems.map(
              (
                item
              ) => {
                const percent =
                  Math.round(
                    (
                      item.value /
                      item.total
                    ) *
                      100
                  );

                return (
                  <div
                    key={
                      item.label
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.dotStyle}`} />

                        <span className="text-xs font-semibold text-[#727e9f]">
                          {
                            item.label
                          }
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-[#263765]">
                        {
                          item.value
                        }
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#f0f1f7]">
                      <div
                        className={`h-full rounded-full ${item.barStyle}`}
                        style={{
                          width:
                            `${percent}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
