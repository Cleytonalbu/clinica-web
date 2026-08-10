const specialties = [
  {
    name: "Psicologia",
    value: 82,
  },

  {
    name: "Fonoaudiologia",
    value: 74,
  },

  {
    name: "Terapia Ocupacional",
    value: 68,
  },

  {
    name: "Fisioterapia",
    value: 61,
  },
];

export function GestorDesempenho() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Desempenho por especialidade
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Atendimentos realizados no mês.
      </p>

      <div className="mt-6 space-y-5">
        {specialties.map(
          (
            specialty
          ) => (
            <div
              key={
                specialty.name
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-600">
                  {
                    specialty.name
                  }
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {
                    specialty.value
                  }%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{
                    width: `${specialty.value}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}