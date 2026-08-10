const items = [
  {
    name: "Psicologia",
    value: 82,
    percent: 100,
  },

  {
    name: "Fonoaudiologia",
    value: 74,
    percent: 90,
  },

  {
    name: "Terapia Ocupacional",
    value: 68,
    percent: 83,
  },

  {
    name: "Fisioterapia",
    value: 52,
    percent: 63,
  },

  {
    name: "Psicopedagogia",
    value: 41,
    percent: 50,
  },
];

export function CriancasPorEspecialidade() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Crianças por especialidade
      </h2>

      <div className="mt-5 space-y-4">
        {items.map(
          (
            item
          ) => (
            <div
              key={
                item.name
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-600">
                  {
                    item.name
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
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width:
                      `${item.percent}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-slate-600">
          Total
        </span>

        <span className="text-sm font-bold text-slate-900">
          317
        </span>
      </div>
    </section>
  );
}