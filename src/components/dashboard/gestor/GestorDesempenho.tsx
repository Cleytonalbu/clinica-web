import {
  useMemo,
} from "react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

import {
  specialtyWorksAtUnit,
} from "@/pages/Configuracoes/specialtyUnitStorage";

const styles = [
  {
    barStyle:
      "bg-[#6847f5]",
    valueStyle:
      "text-[#6847f5]",
  },
  {
    barStyle:
      "bg-[#36a9e1]",
    valueStyle:
      "text-[#299bd2]",
  },
  {
    barStyle:
      "bg-[#35bd92]",
    valueStyle:
      "text-[#29a77f]",
  },
  {
    barStyle:
      "bg-[#f2b347]",
    valueStyle:
      "text-[#dc9b2e]",
  },
];

export function GestorDesempenho() {
  const {
    activeUnitId,
  } =
    useUnit();

  const specialties =
    useMemo(
      () => {
        const now =
          new Date();

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
                activeUnitId &&
              item.date.startsWith(
                monthPrefix
              )
          );

        return getActiveSpecialties()
          .filter(
            (
              specialty
            ) =>
              specialtyWorksAtUnit(
                specialty.id,
                activeUnitId
              )
          )
          .map(
            (
              specialty,
              index
            ) => {
              const specialtyAppointments =
                appointments.filter(
                  (
                    item
                  ) =>
                    item.specialty ===
                    specialty.name
                );

              const realized =
                specialtyAppointments.filter(
                  (
                    item
                  ) =>
                    item.status ===
                    "Realizado"
                ).length;

              const percentage =
                specialtyAppointments.length >
                  0
                  ? Math.round(
                      (
                        realized /
                        specialtyAppointments.length
                      ) *
                        100
                    )
                  : 0;

              return {
                id:
                  specialty.id,

                name:
                  specialty.name,

                value:
                  percentage,

                ...styles[
                  index %
                  styles.length
                ],
              };
            }
          );
      },
      [
        activeUnitId,
      ]
    );

  return (
    <section className="rounded-2xl border border-[#eceef6] bg-white p-6 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <h2 className="text-[17px] font-extrabold text-[#10235f]">
        Desempenho por especialidade
      </h2>

      <p className="mt-1 text-xs font-medium text-[#8a95b4]">
        Percentual de atendimentos realizados no mês.
      </p>

      <div className="mt-7 space-y-6">
        {specialties.map(
          (
            specialty
          ) => (
            <div
              key={
                specialty.id
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#667397]">
                  {
                    specialty.name
                  }
                </span>

                <span className={`text-xs font-extrabold ${specialty.valueStyle}`}>
                  {
                    specialty.value
                  }
                  %
                </span>
              </div>

              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#f0f1f7]">
                <div
                  className={`h-full rounded-full transition-all ${specialty.barStyle}`}
                  style={{
                    width:
                      `${specialty.value}%`,
                  }}
                />
              </div>
            </div>
          )
        )}

        {specialties.length ===
          0 && (
          <p className="text-xs font-medium text-[#8a95b4]">
            Nenhuma especialidade ativa nesta unidade.
          </p>
        )}
      </div>
    </section>
  );
}
