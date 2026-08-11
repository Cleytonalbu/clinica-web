const objectiveItems = [
  {
    label: "Alcançados",
    value: 324,
    percent: 38.5,
    bar: "bg-[#2daf82]",
  },

  {
    label: "Em evolução",
    value: 472,
    percent: 56.1,
    bar: "bg-[#3b91ed]",
  },

  {
    label: "Em regressão",
    value: 46,
    percent: 5.4,
    bar: "bg-[#eb5771]",
  },
];

export function ResumoObjetivos() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Resumo dos objetivos
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[160px_1fr] sm:items-center">
        <div
          className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
          style={{
            background:
              "conic-gradient(#2daf82 0deg 138.6deg, #3b91ed 138.6deg 340.56deg, #eb5771 340.56deg 360deg)",
          }}
        >
          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                842
              </p>

              <p className="text-xs text-slate-400">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {objectiveItems.map(
            (
              item
            ) => (
              <div
                key={
                  item.label
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    {
                      item.label
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {item.value} ({item.percent}%)
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.bar}`}
                    style={{
                      width: `${item.percent}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}