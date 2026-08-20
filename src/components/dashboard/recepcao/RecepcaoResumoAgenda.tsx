const items = [
  {
    label: "Consultas",
    value: 14,
    percent: 54,
    dotClass: "bg-violet-500",
  },

  {
    label: "Terapias",
    value: 8,
    percent: 31,
    dotClass: "bg-emerald-500",
  },

  {
    label: "Avaliações",
    value: 3,
    percent: 12,
    dotClass: "bg-amber-500",
  },

  {
    label: "Outros",
    value: 1,
    percent: 3,
    dotClass: "bg-sky-500",
  },
];

export function RecepcaoResumoAgenda() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Resumo da agenda
      </h2>

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
                    className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`}
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
            background:
              "conic-gradient(#8b5cf6 0% 54%, #10b981 54% 85%, #f59e0b 85% 97%, #0ea5e9 97% 100%)",
          }}
        >
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                26
              </p>

              <p className="text-xs text-slate-400">
                Total
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}