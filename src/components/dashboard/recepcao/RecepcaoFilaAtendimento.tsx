import {
  UsersRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { ApiAgendamento } from "@/services/agenda";

interface RecepcaoFilaAtendimentoProps {
  agendamentos: ApiAgendamento[];
  loading: boolean;
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RecepcaoFilaAtendimento({
  agendamentos,
  loading,
}: RecepcaoFilaAtendimentoProps) {
  const navigate = useNavigate();

  const fila = agendamentos
    .filter((a) => a.status === "AGUARDANDO")
    .sort((a, b) => (a.horaChegada ?? a.dataHora).localeCompare(b.horaChegada ?? b.dataHora));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <UsersRound
          size={20}
          className="text-cyan-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Fila de atendimento
        </h2>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-slate-400">Carregando…</p>
      ) : fila.length === 0 ? (
        <p className="mt-5 text-sm text-slate-400">
          Ninguém aguardando no momento.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {fila.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.id
                }
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-violet-50 text-violet-700"
                    : index === 1
                      ? "bg-amber-50 text-amber-700"
                      : "bg-cyan-50 text-cyan-700"
                }`}>
                  {
                    index + 1
                  }
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {
                      item.paciente?.nome ?? "-"
                    }
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    {
                      item.horaChegada
                        ? `Chegada ${formatarHora(item.horaChegada)}`
                        : "Chegada não registrada"
                    }
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-600">
                    Aguardando
                  </span>

                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {
                      formatarHora(item.dataHora)
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/agenda")}
        className="mt-5 w-full text-sm font-semibold text-violet-600"
      >
        Ver fila completa →
      </button>
    </section>
  );
}
