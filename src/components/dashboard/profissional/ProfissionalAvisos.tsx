import {
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

import type { ApiEvolucaoMinha, ApiObjetivoMeu } from "@/services/dashboardProfissional";

interface ProfissionalAvisosProps {
  evolucoes: ApiEvolucaoMinha[];
  objetivos: ApiObjetivoMeu[];
  loading: boolean;
}

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

/*
 * ⚠️ O item original "Reunião de equipe hoje às 17:00" foi removido: não
 * existe no backend nenhum conceito de aviso/comunicado da clínica — seria
 * uma feature nova (agenda de eventos internos), fora do escopo desta
 * migração. Os dois avisos abaixo são reais, calculados a partir de
 * evoluções e objetivos do próprio profissional.
 */
export function ProfissionalAvisos({
  evolucoes,
  objetivos,
  loading,
}: ProfissionalAvisosProps) {
  const evolucoesPendentes = evolucoes.filter((e) => e.rascunho).length;

  const agora = Date.now();
  const objetivosDesatualizados = objetivos.filter(
    (o) => agora - new Date(o.atualizadoEm).getTime() > TRINTA_DIAS_MS
  ).length;

  const alerts = [
    evolucoesPendentes > 0 && {
      id: "evolucoes",
      title: `${evolucoesPendentes} evolução${evolucoesPendentes === 1 ? "" : "ões"} precisa${evolucoesPendentes === 1 ? "" : "m"} ser finalizada${evolucoesPendentes === 1 ? "" : "s"}`,
      icon: ClipboardCheck,
    },
    objetivosDesatualizados > 0 && {
      id: "objetivos",
      title: `${objetivosDesatualizados} objetivo${objetivosDesatualizados === 1 ? "" : "s"} sem atualização há mais de 30 dias`,
      icon: AlertTriangle,
    },
  ].filter(Boolean) as { id: string; title: string; icon: typeof ClipboardCheck }[];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-bold text-slate-900">
          Avisos importantes
        </h2>
      </div>

      {loading ? (
        <p className="p-5 text-sm text-slate-400">Carregando…</p>
      ) : alerts.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">
          Nenhum aviso no momento.
        </p>
      ) : (
        <div>
          {alerts.map(
            (
              alert
            ) => {
              const Icon =
                alert.icon;

              return (
                <div
                  key={
                    alert.id
                  }
                  className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Icon
                      size={18}
                    />
                  </div>

                  <p className="text-sm leading-5 text-slate-600">
                    {
                      alert.title
                    }
                  </p>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
