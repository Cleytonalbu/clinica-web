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
} from "@/pages/Agenda/appointmentStorage";

import {
  getFixedScheduleOccurrences,
  type FixedScheduleOccurrence,
} from "@/pages/Agenda/fixedScheduleStorage";

interface ProfessionalNextAppointment {
  key: string;
  appointmentId?: number;
  patientId: number;
  time: string;
  patient: string;
  specialty: string;
  status:
    | "Agendado"
    | "Confirmado";
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

function fixedOccurrenceIsActive(
  occurrence:
    FixedScheduleOccurrence
) {
  return (
    !occurrence.exception ||
    occurrence.exception.status ===
      "Confirmado"
  );
}

export function ProfissionalProximasConsultas() {
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

  const normalizedProfessional =
    normalizeText(
      professionalName
    );

  const today =
    getToday();

  const nowTime =
    new Date()
      .toTimeString()
      .slice(
        0,
        5
      );

  const savedAppointments =
    getSavedAppointments()
      .filter(
        (
          appointment
        ) =>
          appointment.unitId ===
            activeUnitId &&
          normalizeText(
            appointment.professional
          ) ===
            normalizedProfessional &&
          appointment.date ===
            today &&
          appointment.time >=
            nowTime &&
          (
            appointment.status ===
              "Agendado" ||
            appointment.status ===
              "Confirmado"
          )
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
      today,
      today
    )
      .filter(
        (
          occurrence
        ) =>
          normalizeText(
            occurrence.professionalName
          ) ===
            normalizedProfessional &&
          occurrence.startTime >=
            nowTime &&
          fixedOccurrenceIsActive(
            occurrence
          ) &&
          !savedKeys.has(
            `${occurrence.patientId}|${normalizeText(
              occurrence.professionalName
            )}|${occurrence.date}|${occurrence.startTime}`
          )
      );

  const consultations:
    ProfessionalNextAppointment[] = [
      ...savedAppointments.map(
        (
          appointment
        ) => ({
          key:
            `appointment-${appointment.id}`,
          appointmentId:
            appointment.id,
          patientId:
            appointment.patientId,
          time:
            appointment.time,
          patient:
            appointment.patient,
          specialty:
            appointment.specialty,
          status:
            appointment.status as
              | "Agendado"
              | "Confirmado",
        })
      ),

      ...fixedOccurrences.map(
        (
          occurrence
        ) => ({
          key:
            `fixed-${occurrence.fixedScheduleId}-${occurrence.date}`,
          patientId:
            occurrence.patientId,
          time:
            occurrence.startTime,
          patient:
            occurrence.patientName,
          specialty:
            occurrence.specialty,
          status:
            occurrence.exception?.status ===
            "Confirmado"
              ? "Confirmado"
              : "Agendado",
        })
      ),
    ]
      .sort(
        (
          a,
          b
        ) =>
          a.time.localeCompare(
            b.time
          )
      )
      .slice(
        0,
        5
      );

  function openConsultation(
    consultation:
      ProfessionalNextAppointment
  ) {
    if (
      consultation.appointmentId
    ) {
      navigate(
        `/agenda/${consultation.appointmentId}`
      );

      return;
    }

    navigate(
      "/agenda"
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Próximas consultas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Seus próximos atendimentos reais de hoje.
          </p>
        </div>

        <button
          type="button"
          onClick={
            () =>
              navigate(
                "/agenda"
              )
          }
          className="text-sm font-semibold text-indigo-600"
        >
          Ver agenda
        </button>
      </div>

      {consultations.length ===
      0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          Nenhum próximo atendimento hoje.
        </div>
      ) : (
        <div>
          {consultations.map(
            (
              consultation
            ) => (
              <button
                key={
                  consultation.key
                }
                type="button"
                onClick={
                  () =>
                    openConsultation(
                      consultation
                    )
                }
                className="grid w-full grid-cols-[65px_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 text-left last:border-b-0 hover:bg-slate-50"
              >
                <span className="text-sm font-bold text-slate-900">
                  {
                    consultation.time
                  }
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {
                      consultation.patient
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      consultation.specialty
                    }
                  </p>
                </div>

                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    consultation.status ===
                    "Confirmado"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {
                    consultation.status
                  }
                </span>
              </button>
            )
          )}
        </div>
      )}
    </section>
  );
}
