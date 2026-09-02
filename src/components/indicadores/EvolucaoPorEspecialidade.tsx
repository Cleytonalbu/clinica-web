import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface EvolucaoPorEspecialidadeProps {
  dados: ApiIndicadoresGerais["evolucaoPorEspecialidade"];
}

const cores = ["#6847f5", "#3b91ed", "#2daf82", "#ed982f", "#e95f9b", "#a04ed7"];

export function EvolucaoPorEspecialidade({
  dados,
}: EvolucaoPorEspecialidadeProps) {
  const media =
    dados.length > 0
      ? Math.round(
          dados.reduce((acc, item) => acc + item.mediaEvolucao, 0) / dados.length
        )
      : 0;

  const gradienteStops = (() => {
    let acumulado = 0;
    const total = dados.reduce((acc, item) => acc + item.totalObjetivos, 0) || 1;

    return dados
      .map((item, index) => {
        const inicio = (acumulado / total) * 360;
        acumulado += item.totalObjetivos;
        const fim = (acumulado / total) * 360;
        return `${cores[index % cores.length]} ${inicio}deg ${fim}deg`;
      })
      .join(", ");
  })();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Evolução por especialidade
      </h2>

      {dados.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum dado no período selecionado.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[180px_1fr] sm:items-center">
          <div
            className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${gradienteStops})`,
            }}
          >
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {media}%
                </p>

                <p className="text-xs text-slate-400">
                  média
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {dados.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.categoria
                  }
                  className="flex items-center justify-between gap-4"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cores[index % cores.length] }}
                    />

                    {
                      item.categoria
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {item.mediaEvolucao}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
