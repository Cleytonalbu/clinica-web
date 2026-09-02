import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Play,
  Stethoscope,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type { ApiAgendamento, ApiStatusAgendamento } from "@/services/agenda";

interface ProfissionalAgendaHojeProps {
  agendamentos: ApiAgendamento[];
  loading: boolean;
}

const LABELS: Record<ApiStatusAgendamento, string> = {
  AGENDADO: "Confirmado",
  AGUARDANDO: "Aguardando",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  FALTOU: "Faltou",
};

function getStatusStyle(status: ApiStatusAgendamento) {
  switch (status) {
    case "CONCLUIDO":
      return { badge: "bg-emerald-50 text-emerald-600", border: "bg-emerald-500" };
    case "EM_ATENDIMENTO":
      return { badge: "bg-blue-50 text-blue-600", border: "bg-blue-500" };
    case "AGUARDANDO":
      return { badge: "bg-amber-50 text-amber-600", border: "bg-amber-400" };
    case "AGENDADO":
      return { badge: "bg-violet-50 text-violet-600", border: "bg-violet-500" };
    case "CANCELADO":
      return { badge: "bg-rose-50 text-rose-600", border: "bg-rose-500" };
    case "FALTOU":
      return { badge: "bg-red-50 text-red-600", border: "bg-red-500" };
  }
}

function getActionConfig(status: ApiStatusAgendamento) {
  switch (status) {
    case "CONCLUIDO":
      return {
        label: "Ver evolução",
        icon: Eye,
        className: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      };
    case "EM_ATENDIMENTO":
      return {
        label: "Continuar",
        icon: Stethoscope,
        className: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      };
    case "AGUARDANDO":
    case "AGENDADO":
      return {
        label: "Iniciar atendimento",
        icon: Play,
        className: "border border-violet-200 bg-violet-600 text-white hover:bg-violet-700",
      };
    default:
      return null;
  }
}

function formatarHorario(a: ApiAgendamento) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const inicio = new Date(a.dataHora);
  const fimStr = a.dataFim ? new Date(a.dataFim) : null;
  const horaInicio = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`;
  if (!fimStr) return horaInicio;
  return `${horaInicio} - ${pad(fimStr.getHours())}:${pad(fimStr.getMinutes())}`;
}

export function ProfissionalAgendaHoje({
  agendamentos,
  loading,
}: ProfissionalAgendaHojeProps) {
  const navigate =
    useNavigate();

  function handleAppointment(appointment: ApiAgendamento) {
    const pacienteId = appointment.paciente?.id;
    if (!pacienteId) return;

    if (appointment.status === "CONCLUIDO") {
      navigate(`/pacientes/${pacienteId}?tab=evolucoes`);
      return;
    }

    navigate(`/pacientes/${pacienteId}/evolucoes/nova?appointmentId=${appointment.id}`);
  }

  const ordenados = [...agendamentos].sort((a, b) => a.dataHora.localeCompare(b.dataHora));

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

      {loading ? (
        <p className="p-5 text-sm text-slate-400">Carregando…</p>
      ) : ordenados.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">
          Nenhum atendimento agendado para hoje.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
          {ordenados.map(
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
                            formatarHorario(appointment)
                          }
                        </p>
                      </div>

                      {/* PACIENTE */}

                      <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {
                          appointment.paciente?.nome ?? "-"
                        }
                      </p>

                      {/* ESPECIALIDADE */}

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          appointment.especialidade?.nome ??
                            appointment.profissional?.especialidades[0]?.especialidade.nome ??
                            ""
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
                          "CONCLUIDO" && (
                          <CheckCircle2
                            size={11}
                          />
                        )}

                        {
                          LABELS[appointment.status]
                        }
                      </span>
                    </div>
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
      )}
    </section>
  );
}
