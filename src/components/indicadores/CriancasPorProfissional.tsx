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
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

const badges = [
  "bg-[#eeeaff] text-[#6847f5]",
  "bg-[#eaf4ff] text-[#3984dc]",
  "bg-[#e8f8f1] text-[#269d75]",
  "bg-[#fff3e4] text-[#df8a27]",
  "bg-[#f8eaff] text-[#a04ed7]",
];

export function CriancasPorProfissional() {
  const {
    activeUnitId,
  } =
    useUnit();

  const professionals =
    useMemo(
      () =>
        getActiveProfessionals()
          .filter(
            (
              item
            ) =>
              professionalWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .map(
            (
              professional
            ) => {
              const patientIds =
                new Set(
                  getSavedAppointments()
                    .filter(
                      (
                        appointment
                      ) =>
                        appointment.unitId ===
                          activeUnitId &&
                        (
                          appointment.professionalId !==
                            undefined
                            ? appointment.professionalId ===
                              professional.id
                            : appointment.professional ===
                              professional.name
                        ) &&
                        appointment.status !==
                          "Cancelado"
                    )
                    .map(
                      (
                        appointment
                      ) =>
                        appointment.patientId
                    )
                );

              return {
                id:
                  professional.id,

                name:
                  professional.name,

                value:
                  patientIds.size,
              };
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              b.value -
                a.value ||
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
      ]
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Crianças por profissional
      </h2>

      <div className="mt-5 space-y-3">
        {professionals.map(
          (
            professional,
            index
          ) => (
            <div
              key={
                professional.id
              }
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  badges[
                    index %
                    badges.length
                  ]
                }`}
              >
                {
                  index +
                  1
                }
              </div>

              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                {
                  professional.name
                }
              </p>

              <span className="text-sm font-bold text-slate-900">
                {
                  professional.value
                }
              </span>
            </div>
          )
        )}

        {professionals.length ===
          0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum profissional ativo nesta unidade.
          </p>
        )}
      </div>
    </section>
  );
}
