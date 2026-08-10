const specialties = [
  {
    name: "Psicologia",
    value: 16,
    percent: 57,
  },

  {
    name: "Fonoaudiologia",
    value: 5,
    percent: 18,
  },

  {
    name: "Terapia Ocupacional",
    value: 4,
    percent: 14,
  },

  {
    name: "Fisioterapia",
    value: 3,
    percent: 11,
  },
];

export function ProfissionalEspecialidades() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Atendimentos por especialidade
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Distribuição dos pacientes atendidos no mês.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-violet-500">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              28
            </p>

            <p className="text-xs text-slate-400">
              atendimentos
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
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">
                    {
                      specialty.name
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {specialty.value} ({specialty.percent}%)
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{
                      width:
                        `${specialty.percent}%`,
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