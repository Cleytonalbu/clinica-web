const specialties = [
  {
    name: "Psicologia",
    value: "78%",
  },

  {
    name: "Fonoaudiologia",
    value: "82%",
  },

  {
    name: "Fisioterapia",
    value: "75%",
  },

  {
    name: "Terapia Ocupacional",
    value: "71%",
  },

  {
    name: "Psicopedagogia",
    value: "69%",
  },
];

export function EvolucaoPorEspecialidade() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Evolução por especialidade
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-indigo-500">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              75%
            </p>

            <p className="text-xs text-slate-400">
              média
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {specialties.map(
            (
              specialty
            ) => (
              <div
                key={
                  specialty.name
                }
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm text-slate-600">
                  {
                    specialty.name
                  }
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {
                    specialty.value
                  }
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}