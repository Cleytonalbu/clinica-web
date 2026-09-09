import {
  CalendarDays,
  Eye,
  MoreVertical,
  Play,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

import {
  getFixedScheduleOccurrences,
  type FixedScheduleOccurrence,
} from "@/pages/Agenda/fixedScheduleStorage";

interface ProfessionalDashboardAppointment {
  key: string;
  appointmentId?: number;
  patientId: number;
  time: string;
  patient: string;
  specialty: string;
  status:
    | "Agendado"
    | "Confirmado"
    | "Realizado"
    | "Cancelado"
    | "Faltou";
}

function getToday() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    now.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}

function normalizeText(
  value:
    string
) {
  return value
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function occurrenceStatus(
  occurrence:
    FixedScheduleOccurrence
): ProfessionalDashboardAppointment["status"] {
  switch (
    occurrence.exception?.status
  ) {
    case "Confirmado":
      return "Confirmado";

    case "Cancelado pelo paciente":
    case "Cancelado pela clínica":
    case "Bloqueado":
      return "Cancelado";

    case "Falta":
    case "Falta do profissional":
      return "Faltou";

    default:
      return "Agendado";
  }
}

function getRealProfessionalAppointments(
  activeUnitId:
    number,
  professionalName:
    string,
  date:
    string
): ProfessionalDashboardAppointment[] {
  const normalizedProfessional =
    normalizeText(
      professionalName
    );

  const savedAppointments =
    getSavedAppointments()
      .filter(
        (
          appointment
        ) =>
          appointment.unitId ===
            activeUnitId &&
          appointment.date ===
            date &&
          normalizeText(
            appointment.professional
          ) ===
            normalizedProfessional
      );

  const savedKeys =
    new Set(
      savedAppointments.map(
        (
          appointment
        ) =>
          `${appointment.patientId}|${normalizeText(
            appointment.professional
          )}|${appointment.date}|${appointment.time}`
      )
    );

  const fixedOccurrences =
    getFixedScheduleOccurrences(
      activeUnitId,
      date,
      date
    )
      .filter(
        (
          occurrence
        ) =>
          normalizeText(
            occurrence.professionalName
          ) ===
            normalizedProfessional &&
          !savedKeys.has(
            `${occurrence.patientId}|${normalizeText(
              occurrence.professionalName
            )}|${occurrence.date}|${occurrence.startTime}`
          )
      );

  return [
    ...savedAppointments.map(
      (
        appointment:
          StoredAppointment
      ): ProfessionalDashboardAppointment => ({
        key:
          `appointment-${appointment.id}`,
        appointmentId:
          appointment.id,
        patientId:
          appointment.patientId,
        time:
          `${appointment.time} - ${appointment.endTime}`,
        patient:
          appointment.patient,
        specialty:
          appointment.specialty,
        status:
          appointment.status,
      })
    ),

    ...fixedOccurrences.map(
      (
        occurrence
      ): ProfessionalDashboardAppointment => ({
        key:
          `fixed-${occurrence.fixedScheduleId}-${occurrence.date}`,
        patientId:
          occurrence.patientId,
        time:
          `${occurrence.startTime} - ${occurrence.endTime}`,
        patient:
          occurrence.patientName,
        specialty:
          occurrence.specialty,
        status:
          occurrenceStatus(
            occurrence
          ),
      })
    ),
  ].sort(
    (
      a,
      b
    ) =>
      a.time.localeCompare(
        b.time
      )
  );
}

function getStatusStyle(
  status:
    ProfessionalDashboardAppointment["status"]
) {
  switch (
    status
  ) {
    case "Realizado":
      return {
        badge:
          "bg-emerald-50 text-emerald-600",
        border:
          "bg-emerald-500",
      };

    case "Confirmado":
      return {
        badge:
          "bg-violet-50 text-violet-600",
        border:
          "bg-violet-500",
      };

    case "Agendado":
      return {
        badge:
          "bg-amber-50 text-amber-600",
        border:
          "bg-amber-400",
      };

    case "Cancelado":
      return {
        badge:
          "bg-rose-50 text-rose-600",
        border:
          "bg-rose-500",
      };

    case "Faltou":
      return {
        badge:
          "bg-red-50 text-red-600",
        border:
          "bg-red-500",
      };

    default:
      return {
        badge:
          "bg-slate-100 text-slate-600",
        border:
          "bg-slate-400",
      };
  }
}

export function ProfissionalAgendaHoje() {
  const navigate =
    useNavigate();

  const {
    user,
  } =
    useAuth();

  const {
    activeUnitId,
  } =
    useUnit();

  const professionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const agenda =
    getRealProfessionalAppointments(
      activeUnitId,
      professionalName,
      getToday()
    );

  function handleAppointment(
    appointment:
      ProfessionalDashboardAppointment
  ) {
    if (
      appointment.status ===
      "Realizado"
    ) {
      navigate(
        `/pacientes/${appointment.patientId}?tab=evolucoes`
      );

      return;
    }

    if (
      appointment.status ===
        "Cancelado" ||
      appointment.status ===
        "Faltou"
    ) {
      if (
        appointment.appointmentId
      ) {
        navigate(
          `/agenda/${appointment.appointmentId}`
        );

        return;
      }

      navigate(
        "/agenda"
      );

      return;
    }

    navigate(
      `/pacientes/${appointment.patientId}/evolucoes/nova${
        appointment.appointmentId
          ? `?appointmentId=${appointment.appointmentId}`
          : ""
      }`
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarDays
              size={20}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Agenda de hoje
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Seus atendimentos reais programados para hoje.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
        >
          Ver agenda completa
        </button>
      </div>

      {agenda.length ===
      0 ? (
        <div className="p-8 text-center text-sm text-slate-400">
          Nenhum atendimento agendado para hoje.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
          {agenda.map(
            (
              appointment
            ) => {
              const style =
                getStatusStyle(
                  appointment.status
                );

              return (
                <div
                  key={
                    appointment.key
                  }
                  className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-4 pl-5"
                >
                  <span
                    className={`absolute bottom-0 left-0 top-0 w-1 ${style.border}`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-violet-600">
                        {
                          appointment.time
                        }
                      </p>

                      <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {
                          appointment.patient
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          appointment.specialty
                        }
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-lg px-2 py-1 text-[10px] font-semibold ${style.badge}`}
                      >
                        {
                          appointment.status
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        appointment.appointmentId
                          ? navigate(
                              `/agenda/${appointment.appointmentId}`
                            )
                          : navigate(
                              "/agenda"
                            )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
                      aria-label="Abrir detalhes do atendimento"
                    >
                      <MoreVertical
                        size={16}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAppointment(
                        appointment
                      )
                    }
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                      appointment.status ===
                      "Realizado"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : appointment.status ===
                              "Cancelado" ||
                            appointment.status ===
                              "Faltou"
                          ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {appointment.status ===
                    "Realizado" ? (
                      <Eye
                        size={14}
                      />
                    ) : (
                      <Play
                        size={14}
                      />
                    )}

                    {appointment.status ===
                    "Realizado"
                      ? "Ver evolução"
                      : appointment.status ===
                            "Cancelado" ||
                          appointment.status ===
                            "Faltou"
                        ? "Ver detalhes"
                        : "Iniciar atendimento"}
                  </button>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
