const chartValues = [
  42,
  58,
  46,
  68,
  73,
  64,
  82,
  76,
  91,
  86,
  96,
  88,
];

const labels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const statusItems = [
  {
    label: "Realizados",
    value: 156,
    total: 200,
  },

  {
    label: "Agendados",
    value: 32,
    total: 200,
  },

  {
    label: "Cancelados",
    value: 7,
    total: 200,
  },
];

export function GestorVisaoGeral() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Visão geral
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Evolução dos atendimentos ao longo do ano.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="flex h-64 items-end gap-3 rounded-2xl bg-slate-50 px-4 pb-5 pt-6">
            {chartValues.map(
              (
                value,
                index
              ) => (
                <div
                  key={
                    labels[
                      index
                    ]
                  }
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-sky-500"
                      style={{
                        height: `${value}%`,
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-medium text-slate-400">
                    {
                      labels[
                        index
                      ]
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-800">
            Status mensal
          </p>

          <div className="mt-5 space-y-5">
            {statusItems.map(
              (
                item
              ) => {
                const percent =
                  Math.round(
                    (
                      item.value /
                      item.total
                    ) *
                      100
                  );

                return (
                  <div
                    key={
                      item.label
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        {
                          item.label
                        }
                      </span>

                      <span className="text-sm font-bold text-slate-800">
                        {
                          item.value
                        }
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500"
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