import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface CriancasPorEspecialidadeProps {
  dados: ApiIndicadoresGerais["criancasPorEspecialidade"];
}

const cores = ["#6847f5", "#3b91ed", "#ed982f", "#2daf82", "#e95f9b", "#a04ed7"];

export function CriancasPorEspecialidade({
  dados,
}: CriancasPorEspecialidadeProps) {
  const total = dados.reduce((acc, item) => acc + item.total, 0);
  const maior = Math.max(...dados.map((item) => item.total), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Crianças por especialidade
      </h2>

      {dados.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum dado no período selecionado.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {dados.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.especialidadeId
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">
                    {
                      item.nome
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {
                      item.total
                    }
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((item.total / maior) * 100)}%`,
                      backgroundColor: item.cor ?? cores[index % cores.length],
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-slate-600">
          Total
        </span>

        <span className="text-sm font-bold text-slate-900">
          {total}
        </span>
      </div>
    </section>
  );
}
