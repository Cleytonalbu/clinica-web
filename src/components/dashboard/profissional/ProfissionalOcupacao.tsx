import {
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { ApiAgendamento } from "@/services/agenda";

interface ProfissionalOcupacaoProps {
  agendaMes: ApiAgendamento[];
  loading: boolean;
}

function classificacao(percentual: number) {
  if (percentual >= 80) return { label: "Ótima", cor: "emerald" as const };
  if (percentual >= 50) return { label: "Boa", cor: "sky" as const };
  return { label: "Baixa", cor: "amber" as const };
}

// Ocupação = proporção de atendimentos que não foram cancelados/faltados
// dentre tudo que foi agendado no mês — não existe um modelo de "vagas
// disponíveis" no backend para calcular ocupação real de horários livres.
export function ProfissionalOcupacao({
  agendaMes,
  loading,
}: ProfissionalOcupacaoProps) {
  const total = agendaMes.length;
  const efetivos = agendaMes.filter((a) => a.status !== "CANCELADO" && a.status !== "FALTOU").length;
  const percentual = total > 0 ? Math.round((efetivos / total) * 100) : 0;

  const { label, cor } = classificacao(percentual);

  const corClasses = {
    emerald: { border: "border-emerald-500", texto: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600" },
    sky: { border: "border-sky-500", texto: "text-sky-600", bg: "bg-sky-50 text-sky-600" },
    amber: { border: "border-amber-500", texto: "text-amber-600", bg: "bg-amber-50 text-amber-600" },
  }[cor];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Taxa de ocupação
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Ocupação da sua agenda neste mês.
      </p>

      <div className="mt-5 flex justify-center">
        <div className={`relative flex h-36 w-36 items-center justify-center rounded-full border-[14px] ${corClasses.border}`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              {
                loading ? "…" : `${percentual}%`
              }
            </p>

            <p className={`mt-1 text-sm font-semibold ${corClasses.texto}`}>
              {
                total === 0 ? "Sem dados" : label
              }
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${corClasses.bg}`}>
        {percentual >= 50 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}

        {
          total === 0
            ? "Nenhum atendimento agendado este mês"
            : `${efetivos} de ${total} atendimentos mantidos`
        }
      </div>
    </section>
  );
}
