import {
  CalendarClock,
  Target,
  UserX,
} from "lucide-react";

import type { ApiAlertasGestao } from "@/services/indicadores";

interface AlertasGestaoProps {
  dados: ApiAlertasGestao | null;
}

export function AlertasGestao({
  dados,
}: AlertasGestaoProps) {
  if (!dados) {
    return null;
  }

  const alerts = [
    {
      id: "sem-atendimento",
      title: "Crianças sem atendimento há mais de 15 dias",
      detail: `${dados.criancasSemAtendimento.total} criança${dados.criancasSemAtendimento.total === 1 ? "" : "s"}`,
      icon: UserX,
    },
    {
      id: "desatualizados",
      title: "Objetivos sem atualização há mais de 30 dias",
      detail: `${dados.objetivosDesatualizados.total} objetivo${dados.objetivosDesatualizados.total === 1 ? "" : "s"}`,
      icon: Target,
    },
    {
      id: "ociosos",
      title: "Profissionais com agenda ociosa nos próximos 7 dias",
      detail: `${dados.profissionaisOciosos.total} profissional${dados.profissionaisOciosos.total === 1 ? "" : "is"}`,
      icon: CalendarClock,
    },
  ];

  const semAlertas = alerts.every((alert) => alert.detail.startsWith("0"));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Alertas da gestão
      </h2>

      {semAlertas ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum alerta no momento.</p>
      ) : (
        <div className="mt-5 space-y-3">
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
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-5 text-slate-700">
                      {
                        alert.title
                      }
                    </p>
                  </div>

                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                    {
                      alert.detail
                    }
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
