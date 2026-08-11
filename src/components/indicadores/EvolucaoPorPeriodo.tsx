const values = [
  {
    month: "Jan/26",
    percent: 42,
    bar: "bg-[#6847f5]",
    text: "text-[#6847f5]",
  },

  {
    month: "Fev/26",
    percent: 51,
    bar: "bg-[#5f74ef]",
    text: "text-[#5f74ef]",
  },

  {
    month: "Mar/26",
    percent: 60,
    bar: "bg-[#3b91ed]",
    text: "text-[#3b91ed]",
  },

  {
    month: "Abr/26",
    percent: 68,
    bar: "bg-[#2daf82]",
    text: "text-[#269d75]",
  },

  {
    month: "Mai/26",
    percent: 72,
    bar: "bg-[#ed982f]",
    text: "text-[#dc8a27]",
  },

  {
    month: "Jun/26",
    percent: 76,
    bar: "bg-[#e95f9b]",
    text: "text-[#d9548e]",
  },
];

export function EvolucaoPorPeriodo() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Evolução por período
      </h2>

      <div className="mt-6">
        <div className="flex h-64 items-end gap-4 rounded-xl bg-slate-50 px-4 pb-5 pt-8">
          {values.map(
            (
              item
            ) => (
              <div
                key={
                  item.month
                }
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span
                  className={`text-xs font-bold ${item.text}`}
                >
                  {
                    item.percent
                  }%
                </span>

                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-md ${item.bar}`}
                    style={{
                      height:
                        `${item.percent}%`,
                    }}
                  />
                </div>

                <span className="text-[10px] text-slate-400">
                  {
                    item.month
                  }
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="mt-5 text-center">
        <p className="text-xs text-slate-400">
          Taxa média no período
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          61,5%
        </p>
      </div>
    </section>
  );
}