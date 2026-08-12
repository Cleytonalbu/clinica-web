import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MoreVertical,
  Play,
  Stethoscope,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

/* =========================================
   TIPOS
========================================= */

type AppointmentStatus =
  | "Concluído"
  | "Em atendimento"
  | "Aguardando"
  | "Confirmado"
  | "Cancelado"
  | "Faltou";

interface Appointment {
  id: number;
  patientId: number;
  time: string;
  patient: string;
  specialty: string;
  status: AppointmentStatus;
}

/* =========================================
   AGENDA DEMONSTRAÇÃO
========================================= */

const agenda: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    time: "08:00 - 09:00",
    patient: "Maria Alice Silva",
    specialty: "Psicologia",
    status: "Concluído",
  },

  {
    id: 2,
    patientId: 2,
    time: "09:00 - 10:00",
    patient: "João Miguel Tavares",
    specialty: "Psicologia",
    status: "Em atendimento",
  },

  {
    id: 3,
    patientId: 3,
    time: "10:00 - 11:00",
    patient: "Laura Vitória Pereira",
    specialty: "Psicologia",
    status: "Aguardando",
  },

  {
    id: 4,
    patientId: 4,
    time: "11:00 - 12:00",
    patient: "Bernardo Ferreira",
    specialty: "Psicologia",
    status: "Confirmado",
  },

  {
    id: 5,
    patientId: 5,
    time: "14:00 - 15:00",
    patient: "Isadora Alves",
    specialty: "Psicologia",
    status: "Confirmado",
  },
];

/* =========================================
   ESTILO DOS STATUS
========================================= */

function getStatusStyle(
  status: AppointmentStatus
) {
  switch (status) {
    case "Concluído":
      return {
        badge:
          "bg-emerald-50 text-emerald-600",
        border:
          "bg-emerald-500",
      };

    case "Em atendimento":
      return {
        badge:
          "bg-blue-50 text-blue-600",
        border:
          "bg-blue-500",
      };

    case "Aguardando":
      return {
        badge:
          "bg-amber-50 text-amber-600",
        border:
          "bg-amber-400",
      };

    case "Confirmado":
      return {
        badge:
          "bg-violet-50 text-violet-600",
        border:
          "bg-violet-500",
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

/* =========================================
   AÇÃO DO ATENDIMENTO
========================================= */

function getActionConfig(
  status: AppointmentStatus
) {
  switch (status) {
    case "Concluído":
      return {
        label: "Ver evolução",
        icon: Eye,
        className:
          "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      };

    case "Em atendimento":
      return {
        label: "Continuar",
        icon: Stethoscope,
        className:
          "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      };

    case "Aguardando":
    case "Confirmado":
      return {
        label: "Iniciar atendimento",
        icon: Play,
        className:
          "border border-violet-200 bg-violet-600 text-white hover:bg-violet-700",
      };

    default:
      return null;
  }
}

/* =========================================
   COMPONENTE
========================================= */

export function ProfissionalAgendaHoje() {
  const navigate =
    useNavigate();

  /* =======================================
     ABRIR ATENDIMENTO
  ======================================= */

  function handleAppointment(
    appointment: Appointment
  ) {
    /*
      Quando a evolução já estiver concluída,
      abrimos o prontuário/evolução existente.
    */

    if (
      appointment.status ===
      "Concluído"
    ) {
      navigate(
        `/pacientes/${appointment.patientId}?tab=evolucoes`
      );

      return;
    }

    /*
      Para atendimento confirmado,
      aguardando ou em andamento,
      abrimos diretamente a tela de evolução.

      O appointmentId permite que futuramente
      a API saiba exatamente qual atendimento
      originou essa evolução.
    */

    navigate(
      `/pacientes/${appointment.patientId}/evolucoes/nova?appointmentId=${appointment.id}`
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

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
              Seus atendimentos programados para hoje.
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

      {/* ================================= */}
      {/* ATENDIMENTOS */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
        {agenda.map(
          (
            appointment
          ) => {
            const statusStyle =
              getStatusStyle(
                appointment.status
              );

            const action =
              getActionConfig(
                appointment.status
              );

            const ActionIcon =
              action?.icon;

            return (
              <div
                key={
                  appointment.id
                }
                className="
                  group
                  relative
                  flex
                  min-h-[210px]
                  flex-col
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/60
                  p-4
                  pl-5
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-violet-100
                  hover:bg-white
                  hover:shadow-md
                "
              >
                {/* BARRA LATERAL */}

                <span
                  className={`
                    absolute
                    bottom-0
                    left-0
                    top-0
                    w-1
                    ${statusStyle.border}
                  `}
                />

                {/* CONTEÚDO */}

                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* HORÁRIO */}

                    <div className="flex items-center gap-1.5">
                      <Clock3
                        size={12}
                        className="text-violet-500"
                      />

                      <p className="text-[11px] font-semibold text-violet-600">
                        {
                          appointment.time
                        }
                      </p>
                    </div>

                    {/* PACIENTE */}

                    <p className="mt-2 truncate text-sm font-bold text-slate-800">
                      {
                        appointment.patient
                      }
                    </p>

                    {/* ESPECIALIDADE */}

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        appointment.specialty
                      }
                    </p>

                    {/* STATUS */}

                    <span
                      className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1
                        rounded-lg
                        px-2
                        py-1
                        text-[10px]
                        font-semibold
                        ${statusStyle.badge}
                      `}
                    >
                      {appointment.status ===
                        "Concluído" && (
                        <CheckCircle2
                          size={11}
                        />
                      )}

                      {
                        appointment.status
                      }
                    </span>
                  </div>

                  {/* MENU */}

                  <button
                    type="button"
                    title="Mais opções"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-white
                      hover:text-slate-600
                    "
                  >
                    <MoreVertical
                      size={16}
                    />
                  </button>
                </div>

                {/* ================================= */}
                {/* AÇÃO DO ATENDIMENTO */}
                {/* ================================= */}

                {action &&
                  ActionIcon && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAppointment(
                          appointment
                        )
                      }
                      className={`
                        mt-4
                        flex
                        h-9
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        px-3
                        text-[11px]
                        font-bold
                        transition
                        ${action.className}
                      `}
                    >
                      <ActionIcon
                        size={14}
                      />

                      {
                        action.label
                      }
                    </button>
                  )}
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}