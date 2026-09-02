import { useState } from "react";

import {
  CalendarDays,
  Plus,
  UserCheck,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  registrarChegadaAgendamento,
  type ApiAgendamento,
  type ApiStatusAgendamento,
} from "@/services/agenda";

interface RecepcaoAgendaHojeProps {
  agendamentos: ApiAgendamento[];
  loading: boolean;
  onAtualizar: () => void;
}

function calcularIdade(dataNascimentoISO: string) {
  const nascimento = new Date(dataNascimentoISO);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RecepcaoAgendaHoje({
  agendamentos,
  loading,
  onAtualizar,
}: RecepcaoAgendaHojeProps) {
  const navigate =
    useNavigate();

  const [processandoId, setProcessandoId] = useState<string | null>(null);

  async function handleCheckin(id: string) {
    setProcessandoId(id);
    try {
      await registrarChegadaAgendamento(id);
      onAtualizar();
    } catch {
      // feedback simples — a lista só não atualiza se falhar
    } finally {
      setProcessandoId(null);
    }
  }

  const ordenados = [...agendamentos].sort((a, b) => a.dataHora.localeCompare(b.dataHora));

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={21}
            className="text-violet-600"
          />

          <h2 className="text-lg font-bold text-slate-900">
            Agenda de hoje
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/agenda"
              )
            }
            className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
          >
            Ver agenda completa
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agenda/novo"
              )
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            <Plus
              size={17}
            />

            Novo agendamento
          </button>
        </div>
      </div>

      {loading ? (
        <p className="p-5 text-sm text-slate-400">Carregando…</p>
      ) : ordenados.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">
          Nenhum atendimento agendado para hoje.
        </p>
      ) : (
        <div>
          {ordenados.map(
            (
              appointment
            ) => (
              <div
                key={
                  appointment.id
                }
                className="grid grid-cols-1 gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 lg:grid-cols-[70px_minmax(0,1.3fr)_140px_minmax(180px,0.9fr)_130px_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {
                      formatarHora(appointment.dataHora)
                    }
                  </p>

                  <p className={`mt-1 text-[11px] ${
                    appointment.horaChegada
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}>
                    {
                      appointment.horaChegada
                        ? `Chegada ${formatarHora(appointment.horaChegada)}`
                        : "Chegada --"
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {
                      appointment.paciente?.nome ?? "-"
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {appointment.paciente ? `${calcularIdade(appointment.paciente.dataNascimento)} anos` : ""}
                    {appointment.paciente?.responsavel && ` • Responsável: ${appointment.paciente.responsavel}`}
                  </p>
                </div>

                <div>
                  {appointment.paciente?.diagnostico && (
                    <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                      {
                        appointment.paciente.diagnostico
                      }
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {
                      appointment.profissional?.usuario.nome ?? "-"
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      appointment.especialidade?.nome ??
                        appointment.profissional?.especialidades[0]?.especialidade.nome ??
                        ""
                    }
                  </p>
                </div>

                <StatusBadge
                  status={
                    appointment.status
                  }
                />

                {appointment.status === "AGENDADO" ? (
                  <button
                    type="button"
                    disabled={processandoId === appointment.id}
                    onClick={() => handleCheckin(appointment.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserCheck size={15} />
                    Chegou
                  </button>
                ) : (
                  <span />
                )}
              </div>
            )
          )}
        </div>
      )}

      <div className="border-t border-slate-100 p-4 text-center">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="text-sm font-semibold text-violet-600"
        >
          Ver todos os agendamentos do dia →
        </button>
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: ApiStatusAgendamento;
}) {
  const labels: Record<ApiStatusAgendamento, string> = {
    AGENDADO: "Agendado",
    AGUARDANDO: "Aguardando",
    EM_ATENDIMENTO: "Em atendimento",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
    FALTOU: "Faltou",
  };

  const style =
    status === "EM_ATENDIMENTO"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : status === "AGUARDANDO"
      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
      : status === "CONCLUIDO"
      ? "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      : status === "CANCELADO" || status === "FALTOU"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
      : "bg-violet-50 text-violet-700 ring-1 ring-violet-100";

  return (
    <span
      className={`inline-flex justify-center rounded-lg px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      {
        labels[status]
      }
    </span>
  );
}
