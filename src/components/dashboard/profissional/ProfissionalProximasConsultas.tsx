import {
  useNavigate,
} from "react-router-dom";

import type { ApiAgendamento, ApiStatusAgendamento } from "@/services/agenda";

interface ProfissionalProximasConsultasProps {
  agendaHoje: ApiAgendamento[];
  loading: boolean;
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProfissionalProximasConsultas({
  agendaHoje,
  loading,
}: ProfissionalProximasConsultasProps) {
  const navigate =
    useNavigate();

  const agora = new Date();

  const proximas = agendaHoje
    .filter((a) =>
      new Date(a.dataHora) >= agora &&
      a.status !== "CANCELADO" &&
      a.status !== "FALTOU" &&
      a.status !== "CONCLUIDO"
    )
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Próximas consultas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Seus próximos atendimentos de hoje.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="text-sm font-semibold text-indigo-600"
        >
          Ver agenda
        </button>
      </div>

      {loading ? (
        <p className="p-5 text-sm text-slate-400">Carregando…</p>
      ) : proximas.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">
          Nenhum atendimento restante para hoje.
        </p>
      ) : (
        <div>
          {proximas.map(
            (
              consultation
            ) => (
              <div
                key={
                  consultation.id
                }
                className="grid grid-cols-[65px_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
              >
                <span className="text-sm font-bold text-slate-900">
                  {
                    formatarHora(consultation.dataHora)
                  }
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {
                      consultation.paciente?.nome ?? "-"
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      consultation.especialidade?.nome ??
                        consultation.profissional?.especialidades[0]?.especialidade.nome ??
                        ""
                    }
                  </p>
                </div>

                <StatusBadge
                  status={
                    consultation.status
                  }
                />
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: ApiStatusAgendamento;
}) {
  const labels: Partial<Record<ApiStatusAgendamento, string>> = {
    AGENDADO: "Confirmado",
    AGUARDANDO: "Aguardando",
    EM_ATENDIMENTO: "Em atendimento",
  };

  const style =
    status === "AGENDADO"
      ? "bg-emerald-50 text-emerald-600"
      : status === "AGUARDANDO"
      ? "bg-sky-50 text-sky-600"
      : "bg-orange-50 text-orange-600";

  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      {
        labels[status] ?? status
      }
    </span>
  );
}
