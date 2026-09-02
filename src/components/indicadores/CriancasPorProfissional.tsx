import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface CriancasPorProfissionalProps {
  dados: ApiIndicadoresGerais["criancasPorProfissional"];
}

const badges = [
  "bg-[#eeeaff] text-[#6847f5]",
  "bg-[#eaf4ff] text-[#3984dc]",
  "bg-[#e8f8f1] text-[#269d75]",
  "bg-[#fff3e4] text-[#df8a27]",
  "bg-[#f8eaff] text-[#a04ed7]",
];

export function CriancasPorProfissional({
  dados,
}: CriancasPorProfissionalProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Crianças por profissional
      </h2>

      {dados.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum dado no período selecionado.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {dados.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.profissionalId
                }
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badges[index % badges.length]}`}
                >
                  {
                    index +
                    1
                  }
                </div>

                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                  {
                    item.nome
                  }
                </p>

                <span className="text-sm font-bold text-slate-900">
                  {
                    item.total
                  }
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
