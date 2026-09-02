import type { ApiDashboardGestor } from "@/services/dashboardGestor";

const labels = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

interface GestorVisaoGeralProps {
  atendimentosPorMes: ApiDashboardGestor["atendimentosPorMes"];
}

export function GestorVisaoGeral({
  atendimentosPorMes,
}: GestorVisaoGeralProps) {
  const maiorTotal = Math.max(1, ...atendimentosPorMes.map((m) => m.total));

  const totalRealizados = atendimentosPorMes.reduce((acc, m) => acc + m.realizados, 0);
  const totalAgendados   = atendimentosPorMes.reduce((acc, m) => acc + m.agendados, 0);
  const totalCancelados  = atendimentosPorMes.reduce((acc, m) => acc + m.cancelados, 0);
  const totalGeral       = totalRealizados + totalAgendados + totalCancelados;

  const statusItems = [
    { label: "Realizados", value: totalRealizados, barStyle: "bg-[#6847f5]", dotStyle: "bg-[#6847f5]" },
    { label: "Agendados",  value: totalAgendados,  barStyle: "bg-[#37a8e0]", dotStyle: "bg-[#37a8e0]" },
    { label: "Cancelados", value: totalCancelados, barStyle: "bg-[#ef6975]", dotStyle: "bg-[#ef6975]" },
  ];

  return (
    <section
      className="
        rounded-2xl
        border
        border-[#eceef6]
        bg-white
        p-6
        shadow-[0_4px_16px_rgba(51,65,120,0.04)]
      "
    >
      {/* CABEÇALHO */}

      <div>
        <h2 className="text-[17px] font-extrabold text-[#10235f]">
          Visão geral
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8a95b4]">
          Evolução dos atendimentos ao longo do ano.
        </p>
      </div>

      {/* CONTEÚDO */}

      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_210px]">
        {/* GRÁFICO */}

        <div
          className="
            relative
            flex
            h-64
            items-end
            gap-3
            overflow-hidden
            rounded-2xl
            bg-[#fafaff]
            px-4
            pb-5
            pt-6
          "
        >
          {/* LINHAS DE FUNDO */}

          <div className="pointer-events-none absolute inset-x-4 bottom-[42px] top-6 flex flex-col justify-between">
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
            <div className="border-t border-dashed border-[#e9eaf4]" />
          </div>

          {atendimentosPorMes.map(
            (mes, index) => {
              const altura = Math.round((mes.total / maiorTotal) * 100);

              return (
                <div
                  key={
                    labels[index]
                  }
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    flex-1
                    flex-col
                    items-center
                    justify-end
                    gap-2
                  "
                  title={`${mes.total} atendimento${mes.total === 1 ? "" : "s"}`}
                >
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className="
                        w-full
                        max-w-[30px]
                        rounded-t-[7px]
                        bg-gradient-to-t
                        from-[#6544ef]
                        to-[#8a6df8]
                        shadow-[0_4px_10px_rgba(101,68,239,0.12)]
                      "
                      style={{
                        height: `${Math.max(altura, mes.total > 0 ? 3 : 0)}%`,
                      }}
                    />
                  </div>

                  <span className="text-[9px] font-semibold text-[#9ba4bd]">
                    {
                      labels[index]
                    }
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* STATUS */}

        <div>
          <p className="text-sm font-extrabold text-[#10235f]">
            Status do ano
          </p>

          <div className="mt-6 space-y-6">
            {statusItems.map(
              (item) => {
                const percent = totalGeral > 0
                  ? Math.round((item.value / totalGeral) * 100)
                  : 0;

                return (
                  <div
                    key={
                      item.label
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            h-2
                            w-2
                            rounded-full
                            ${item.dotStyle}
                          `}
                        />

                        <span className="text-xs font-semibold text-[#727e9f]">
                          {
                            item.label
                          }
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-[#263765]">
                        {
                          item.value
                        }
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#f0f1f7]">
                      <div
                        className={`
                          h-full
                          rounded-full
                          ${item.barStyle}
                        `}
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
