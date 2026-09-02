import {
  ClipboardList,
} from "lucide-react";

import type { ApiEvolucaoMinha } from "@/services/dashboardProfissional";

interface ProfissionalEvolucoesStatusProps {
  evolucoes: ApiEvolucaoMinha[];
  loading: boolean;
}

// O schema só distingue rascunho (não assinada) de assinada — não existem
// os estados "aguardando assinatura" / "pendente" separados que a versão
// mock mostrava, então os 4 buckets viraram 2 reais.
export function ProfissionalEvolucoesStatus({
  evolucoes,
  loading,
}: ProfissionalEvolucoesStatusProps) {
  const total = evolucoes.length;
  const assinadas = evolucoes.filter((e) => !e.rascunho).length;
  const rascunhos = evolucoes.filter((e) => e.rascunho).length;

  const percentAssinadas = total > 0 ? Math.round((assinadas / total) * 100) : 0;
  const percentRascunhos = total > 0 ? Math.round((rascunhos / total) * 100) : 0;

  const statuses = [
    { label: "Assinadas", value: assinadas, percent: percentAssinadas, cor: "bg-emerald-500" },
    { label: "Em rascunho", value: rascunhos, percent: percentRascunhos, cor: "bg-amber-500" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <ClipboardList
          size={20}
          className="text-violet-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Evoluções por status
        </h2>
      </div>

      {loading ? (
        <p className="mt-7 text-sm text-slate-400">Carregando…</p>
      ) : total === 0 ? (
        <p className="mt-7 text-sm text-slate-400">
          Nenhuma evolução registrada ainda.
        </p>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-[150px_1fr] sm:items-center">
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[16px] border-emerald-500">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {
                  total
                }
              </p>

              <p className="text-xs text-slate-400">
                Total
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {statuses.map(
              (
                status
              ) => (
                <div
                  key={
                    status.label
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-600">
                      {
                        status.label
                      }
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {status.value} ({status.percent}%)
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${status.cor}`}
                      style={{
                        width:
                          `${status.percent}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
