const professionals = [
  {
    name: "Dra. Juliana Santos",
    value: 32,
  },

  {
    name: "Dra. Camila Soares",
    value: 28,
  },

  {
    name: "Dra. Larissa Lima",
    value: 26,
  },

  {
    name: "Dr. Rafael Almeida",
    value: 24,
  },

  {
    name: "Dra. Fernanda Lima",
    value: 22,
  },
];

export function CriancasPorProfissional() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Crianças por profissional
      </h2>

      <div className="mt-5 space-y-3">
        {professionals.map(
          (
            professional,
            index
          ) => (
            <div
              key={
                professional.name
              }
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {
                  index +
                  1
                }
              </div>

              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                {
                  professional.name
                }
              </p>

              <span className="text-sm font-bold text-slate-900">
                {
                  professional.value
                }
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}