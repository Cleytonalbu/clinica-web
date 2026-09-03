import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Target,
  UserX,
  X,
} from "lucide-react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getObjectives,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

type AlertId =
  | 1
  | 2
  | 3
  | 4;

type AlertSelection =
  | AlertId
  | "all"
  | null;

const alerts = [
  {
    id:
      1 as const,
    title:
      "Crianças sem atendimento há mais de 15 dias",
    detail:
      "12 crianças",
    icon:
      UserX,
  },

  {
    id:
      2 as const,
    title:
      "Objetivos sem atualização há mais de 30 dias",
    detail:
      "28 objetivos",
    icon:
      Target,
  },

  {
    id:
      3 as const,
    title:
      "Profissionais com agenda ociosa",
    detail:
      "4 profissionais",
    icon:
      CalendarClock,
  },

  {
    id:
      4 as const,
    title:
      "Especialidade com maior índice de faltas",
    detail:
      "Fonoaudiologia (18%)",
    icon:
      AlertTriangle,
  },
];

function parseDate(
  value:
    string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const [
      year,
      month,
      day,
    ] =
      value
        .split("-")
        .map(
          Number
        );

    return new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
      0
    );
  }

  return new Date(
    value
  );
}

function differenceInDays(
  from:
    Date,
  to:
    Date
) {
  const fromDay =
    new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
      12
    ).getTime();

  const toDay =
    new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate(),
      12
    ).getTime();

  return Math.max(
    0,
    Math.floor(
      (
        toDay -
        fromDay
      ) /
        86_400_000
    )
  );
}

function formatDate(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    date
  );
}

export function AlertasGestao() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [
    selectedAlert,
    setSelectedAlert,
  ] =
    useState<
      AlertSelection
    >(
      null
    );

  const today =
    useMemo(
      () =>
        new Date(),
      []
    );

  const patients =
    getPatients()
      .filter(
        (
          patient
        ) =>
          patient.status ===
          "Ativo"
      );

  const appointments =
    getSavedAppointments()
      .filter(
        (
          appointment
        ) =>
          appointment.unitId ===
          activeUnitId
      );

  const objectives =
    getObjectives()
      .filter(
        (
          objective
        ) =>
          objective.unitId ===
          activeUnitId
      );

  const professionals =
    getActiveProfessionals()
      .filter(
        (
          professional
        ) =>
          professionalWorksAtUnit(
            professional.id,
            activeUnitId
          )
      );

  const patientsWithoutAttendance =
    useMemo(
      () =>
        patients
          .map(
            (
              patient
            ) => {
              const patientAppointments =
                appointments
                  .filter(
                    (
                      appointment
                    ) =>
                      appointment.patientId ===
                      patient.id
                  )
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      b.date.localeCompare(
                        a.date
                      )
                  );

              const lastCompleted =
                patientAppointments.find(
                  (
                    appointment
                  ) =>
                    appointment.status ===
                    "Realizado"
                );

              const referenceDate =
                lastCompleted?.date ??
                patient.createdAt;

              const daysWithoutAttendance =
                differenceInDays(
                  parseDate(
                    referenceDate
                  ),
                  today
                );

              const lastProblem =
                patientAppointments.find(
                  (
                    appointment
                  ) =>
                    appointment.status ===
                      "Faltou" ||
                    appointment.status ===
                      "Cancelado"
                );

              const reason =
                lastProblem?.observations?.trim() ||
                "Não informado";

              return {
                id:
                  patient.id,
                name:
                  patient.nome,
                days:
                  daysWithoutAttendance,
                lastAttendance:
                  lastCompleted?.date,
                reason,
              };
            }
          )
          .filter(
            (
              item
            ) =>
              item.days >
              15
          )
          .sort(
            (
              a,
              b
            ) =>
              b.days -
              a.days
          ),
      [
        appointments,
        patients,
        today,
      ]
    );

  const staleObjectives =
    useMemo(
      () =>
        objectives
          .map(
            (
              objective
            ) => {
              const patient =
                patients.find(
                  (
                    item
                  ) =>
                    item.id ===
                    objective.patientId
                );

              const days =
                differenceInDays(
                  parseDate(
                    objective.updatedAt
                  ),
                  today
                );

              return {
                id:
                  objective.id,
                patient:
                  patient?.nome ??
                  `Paciente #${objective.patientId}`,
                title:
                  objective.title,
                professional:
                  objective.professional,
                specialty:
                  objective.specialty,
                days,
                updatedAt:
                  objective.updatedAt,
              };
            }
          )
          .filter(
            (
              item
            ) =>
              item.days >
              30
          )
          .sort(
            (
              a,
              b
            ) =>
              b.days -
              a.days
          ),
      [
        objectives,
        patients,
        today,
      ]
    );

  const idleProfessionals =
    useMemo(
      () =>
        professionals
          .map(
            (
              professional
            ) => {
              const professionalAppointments =
                appointments
                  .filter(
                    (
                      appointment
                    ) =>
                      appointment.professionalId ===
                        professional.id ||
                      (
                        appointment.professionalId ===
                          undefined &&
                        appointment.professional ===
                          professional.name
                      )
                  )
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      b.date.localeCompare(
                        a.date
                      )
                  );

              const lastCompleted =
                professionalAppointments.find(
                  (
                    appointment
                  ) =>
                    appointment.status ===
                    "Realizado"
                );

              const days =
                lastCompleted
                  ? differenceInDays(
                      parseDate(
                        lastCompleted.date
                      ),
                      today
                    )
                  : null;

              return {
                id:
                  professional.id,
                name:
                  professional.name,
                specialty:
                  professional.specialty,
                days,
                lastAttendance:
                  lastCompleted?.date,
              };
            }
          )
          .filter(
            (
              item
            ) =>
              item.days ===
                null ||
              item.days >
                7
          )
          .sort(
            (
              a,
              b
            ) => {
              if (
                a.days ===
                null
              ) {
                return -1;
              }

              if (
                b.days ===
                null
              ) {
                return 1;
              }

              return (
                b.days -
                a.days
              );
            }
          ),
      [
        appointments,
        professionals,
        today,
      ]
    );

  const absenceBySpecialty =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              total:
                number;
              absences:
                number;
            }
          >();

        appointments.forEach(
          (
            appointment
          ) => {
            const current =
              map.get(
                appointment.specialty
              ) ?? {
                total:
                  0,
                absences:
                  0,
              };

            current.total +=
              1;

            if (
              appointment.status ===
              "Faltou"
            ) {
              current.absences +=
                1;
            }

            map.set(
              appointment.specialty,
              current
            );
          }
        );

        return Array.from(
          map.entries()
        )
          .map(
            ([
              specialty,
              values,
            ]) => ({
              specialty,
              total:
                values.total,
              absences:
                values.absences,
              rate:
                values.total >
                  0
                  ? Math.round(
                      (
                        values.absences /
                        values.total
                      ) *
                        100
                    )
                  : 0,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.rate -
              a.rate
          );
      },
      [
        appointments,
      ]
    );

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Alertas da gestão
        </h2>

        <div className="mt-5 space-y-3">
          {alerts.map(
            (
              alert
            ) => {
              const Icon =
                alert.icon;

              return (
                <button
                  key={
                    alert.id
                  }
                  type="button"
                  onClick={() =>
                    setSelectedAlert(
                      alert.id
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-5 text-slate-700">
                      {
                        alert.title
                      }
                    </p>
                  </div>

                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                    {
                      alert.detail
                    }
                  </span>

                  <ChevronRight
                    size={16}
                    className="shrink-0 text-slate-300"
                  />
                </button>
              );
            }
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setSelectedAlert(
              "all"
            )
          }
          className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Ver todos os alertas
        </button>
      </section>

      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4">
          <div className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                  Alertas da gestão
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {
                    selectedAlert ===
                    "all"
                      ? "Detalhamento dos alertas"
                      : alerts.find(
                          (
                            item
                          ) =>
                            item.id ===
                            selectedAlert
                        )?.title
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAlert(
                    null
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                title="Fechar"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <div className="max-h-[calc(86vh-82px)] overflow-y-auto p-5">
              {(
                selectedAlert ===
                  1 ||
                selectedAlert ===
                  "all"
              ) && (
                <AlertSection
                  title="Crianças sem atendimento há mais de 15 dias"
                  count={
                    patientsWithoutAttendance.length
                  }
                >
                  {patientsWithoutAttendance.length >
                    0 ? (
                    patientsWithoutAttendance.map(
                      (
                        item
                      ) => (
                        <DetailRow
                          key={
                            item.id
                          }
                          title={
                            item.name
                          }
                          badge={`${item.days} dias`}
                          lines={[
                            item.lastAttendance
                              ? `Último atendimento: ${formatDate(item.lastAttendance)}`
                              : "Sem atendimento realizado registrado",
                            `Motivo: ${item.reason}`,
                          ]}
                        />
                      )
                    )
                  ) : (
                    <EmptyDetail />
                  )}
                </AlertSection>
              )}

              {(
                selectedAlert ===
                  2 ||
                selectedAlert ===
                  "all"
              ) && (
                <AlertSection
                  title="Objetivos sem atualização há mais de 30 dias"
                  count={
                    staleObjectives.length
                  }
                >
                  {staleObjectives.length >
                    0 ? (
                    staleObjectives.map(
                      (
                        item
                      ) => (
                        <DetailRow
                          key={
                            item.id
                          }
                          title={`${item.patient} — ${item.title}`}
                          badge={`${item.days} dias`}
                          lines={[
                            `${item.professional} • ${item.specialty}`,
                            `Última atualização: ${formatDate(item.updatedAt)}`,
                          ]}
                        />
                      )
                    )
                  ) : (
                    <EmptyDetail />
                  )}
                </AlertSection>
              )}

              {(
                selectedAlert ===
                  3 ||
                selectedAlert ===
                  "all"
              ) && (
                <AlertSection
                  title="Profissionais com agenda ociosa"
                  count={
                    idleProfessionals.length
                  }
                >
                  {idleProfessionals.length >
                    0 ? (
                    idleProfessionals.map(
                      (
                        item
                      ) => (
                        <DetailRow
                          key={
                            item.id
                          }
                          title={
                            item.name
                          }
                          badge={
                            item.days ===
                              null
                              ? "Sem atendimento"
                              : `${item.days} dias`
                          }
                          lines={[
                            item.specialty,
                            item.lastAttendance
                              ? `Último atendimento: ${formatDate(item.lastAttendance)}`
                              : "Nenhum atendimento realizado registrado",
                          ]}
                        />
                      )
                    )
                  ) : (
                    <EmptyDetail />
                  )}
                </AlertSection>
              )}

              {(
                selectedAlert ===
                  4 ||
                selectedAlert ===
                  "all"
              ) && (
                <AlertSection
                  title="Índice de faltas por especialidade"
                  count={
                    absenceBySpecialty.length
                  }
                >
                  {absenceBySpecialty.length >
                    0 ? (
                    absenceBySpecialty.map(
                      (
                        item,
                        index
                      ) => (
                        <DetailRow
                          key={
                            item.specialty
                          }
                          title={`${index + 1}º ${item.specialty}`}
                          badge={`${item.rate}%`}
                          lines={[
                            `${item.absences} falta(s) em ${item.total} atendimento(s) registrados`,
                          ]}
                        />
                      )
                    )
                  ) : (
                    <EmptyDetail />
                  )}
                </AlertSection>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AlertSection({
  title,
  count,
  children,
}: {
  title:
    string;
  count:
    number;
  children:
    React.ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-slate-800">
          {
            title
          }
        </h4>

        <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
          {
            count
          }
        </span>
      </div>

      <div className="space-y-2">
        {
          children
        }
      </div>
    </section>
  );
}

function DetailRow({
  title,
  badge,
  lines,
}: {
  title:
    string;
  badge:
    string;
  lines:
    string[];
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {
              title
            }
          </p>

          <div className="mt-1 space-y-0.5">
            {lines.map(
              (
                line,
                index
              ) => (
                <p
                  key={`${line}-${index}`}
                  className="text-xs leading-5 text-slate-500"
                >
                  {
                    line
                  }
                </p>
              )
            )}
          </div>
        </div>

        <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-100">
          {
            badge
          }
        </span>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      Nenhum registro encontrado para este alerta na unidade atual.
    </div>
  );
}
