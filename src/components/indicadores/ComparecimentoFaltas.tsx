import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface ComparecimentoFaltasProps {
  dados: ApiIndicadoresGerais["comparecimento"];
}

export function ComparecimentoFaltas({
  dados,
}: ComparecimentoFaltasProps) {
  const { comparecimentos, faltas, agendados, emAtendimento, total, taxaComparecimento } = dados;

  const items = [
    { label: "Comparecimentos", value: comparecimentos, dot: "bg-[#2daf82]" },
    { label: "Faltas", value: faltas, dot: "bg-[#eb5771]" },
    { label: "Agendados", value: agendados, dot: "bg-[#ed982f]" },
    { label: "Em atendimento", value: emAtendimento, dot: "bg-[#3b91ed]" },
  ];

  function percentDe(value: number) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  const faltasDeg = total > 0 ? (faltas / total) * 360 : 0;
  const agendadosDeg = total > 0 ? (agendados / total) * 360 : 0;
  const emAtendimentoDeg = total > 0 ? (emAtendimento / total) * 360 : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Taxa de comparecimento
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr] sm:items-center">
        <div
          className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#2daf82 0deg ${360 - faltasDeg - agendadosDeg - emAtendimentoDeg}deg, #eb5771 ${360 - faltasDeg - agendadosDeg - emAtendimentoDeg}deg ${360 - agendadosDeg - emAtendimentoDeg}deg, #ed982f ${360 - agendadosDeg - emAtendimentoDeg}deg ${360 - emAtendimentoDeg}deg, #3b91ed ${360 - emAtendimentoDeg}deg 360deg)`,
          }}
        >
          <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                {taxaComparecimento}%
              </p>

              <p className="text-xs text-slate-400">
                comparecimento
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.map(
            (
              item
            ) => (
              <div
                key={
                  item.label
                }
                className="flex items-center justify-between gap-4"
              >
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                  />

                  {
                    item.label
                  }
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {item.value} ({percentDe(item.value)}%)
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
