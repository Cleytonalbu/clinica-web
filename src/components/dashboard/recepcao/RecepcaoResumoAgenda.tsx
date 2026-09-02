import type { ApiAgendamento } from "@/services/agenda";

const CORES = ["#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444", "#64748b"];

interface RecepcaoResumoAgendaProps {
  agendamentos: ApiAgendamento[];
  loading: boolean;
}

export function RecepcaoResumoAgenda({
  agendamentos,
  loading,
}: RecepcaoResumoAgendaProps) {
  const porServico = new Map<string, number>();

  agendamentos.forEach((a) => {
    const nome = a.servico?.nome ?? "Outros";
    porServico.set(nome, (porServico.get(nome) ?? 0) + 1);
  });

  const total = agendamentos.length;

  const items = Array.from(porServico.entries())
    .map(([label, value], index) => ({
      label,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
      cor: CORES[index % CORES.length],
    }))
    .sort((a, b) => b.value - a.value);

  const gradienteStops = (() => {
    let acumulado = 0;
    return items
      .map((item) => {
        const inicio = acumulado;
        acumulado += item.percent;
        return `${item.cor} ${inicio}% ${acumulado}%`;
      })
      .join(", ");
  })();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Resumo da agenda
      </h2>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Carregando…</p>
      ) : total === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          Nenhum atendimento agendado para hoje.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_150px] sm:items-center">
          <div className="space-y-4">
            {items.map(
              (
                item
              ) => (
                <div
                  key={
                    item.label
                  }
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.cor }}
                    />

                    <span className="text-sm text-slate-600">
                      {
                        item.label
                      }
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {item.value} ({item.percent}%)
                  </span>
                </div>
              )
            )}
          </div>

          <div
            className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${gradienteStops})`,
            }}
          >
            <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-inner">
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
          </div>
        </div>
      )}
    </section>
  );
}
