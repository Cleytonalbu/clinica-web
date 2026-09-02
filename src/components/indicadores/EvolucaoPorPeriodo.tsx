import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface EvolucaoPorPeriodoProps {
  dados: ApiIndicadoresGerais["evolucaoPorPeriodo"];
}

export function EvolucaoPorPeriodo({
  dados,
}: EvolucaoPorPeriodoProps) {
  const media =
    dados.length > 0
      ? (
          dados.reduce((acc, item) => acc + item.mediaDesempenho, 0) / dados.length
        ).toFixed(1)
      : "0";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Evolução por período
      </h2>

      {dados.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum dado no período selecionado.</p>
      ) : (
        <div className="mt-6">
          <div className="flex h-64 items-end gap-4 rounded-xl bg-slate-50 px-4 pb-5 pt-8">
            {dados.map(
              (
                item
              ) => (
                <div
                  key={
                    item.mes
                  }
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-bold text-[#6847f5]">
                    {
                      item.mediaDesempenho
                    }%
                  </span>

                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-[#6847f5]"
                      style={{
                        height: `${Math.max(item.mediaDesempenho, 2)}%`,
                      }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {
                      item.mes
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="mt-5 text-center">
        <p className="text-xs text-slate-400">
          Desempenho médio no período
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {media}%
        </p>
      </div>
    </section>
  );
}
