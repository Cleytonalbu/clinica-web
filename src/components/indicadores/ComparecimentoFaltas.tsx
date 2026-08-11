const attendanceItems = [
  {
    label: "Comparecimentos",
    value: 582,
    percent: 91,
    dot: "bg-[#2daf82]",
  },

  {
    label: "Faltas",
    value: 18,
    percent: 3,
    dot: "bg-[#eb5771]",
  },

  {
    label: "Cancelamentos",
    value: 22,
    percent: 3,
    dot: "bg-[#e95f9b]",
  },

  {
    label: "Remarcações",
    value: 18,
    percent: 3,
    dot: "bg-[#ed982f]",
  },
];

export function ComparecimentoFaltas() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Taxa de comparecimento e faltas
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr] sm:items-center">
        <div
          className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background:
              "conic-gradient(#2daf82 0deg 327.6deg, #eb5771 327.6deg 338.4deg, #e95f9b 338.4deg 349.2deg, #ed982f 349.2deg 360deg)",
          }}
        >
          <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">
                91%
              </p>

              <p className="text-xs text-slate-400">
                comparecimento
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {attendanceItems.map(
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
                  {item.value} ({item.percent}%)
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Ver detalhes
      </button>
    </section>
  );
}