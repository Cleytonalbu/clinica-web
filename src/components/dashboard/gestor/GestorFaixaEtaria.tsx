const ageGroups = [
  {
    label: "0 a 5 anos",
    value: 38,
  },

  {
    label: "6 a 10 anos",
    value: 31,
  },

  {
    label: "11 a 15 anos",
    value: 19,
  },

  {
    label: "16+ anos",
    value: 12,
  },
];

export function GestorFaixaEtaria() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Pacientes por faixa etária
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribuição atual dos pacientes.
      </p>

      <div className="mt-6 flex justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-sky-500">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              146
            </p>

            <p className="text-xs text-slate-400">
              pacientes
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {ageGroups.map(
          (
            group
          ) => (
            <div
              key={
                group.label
              }
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-slate-500">
                {
                  group.label
                }
              </span>

              <span className="text-sm font-bold text-slate-800">
                {
                  group.value
                }%
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}