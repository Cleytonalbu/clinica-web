const professionals = [
  {
    name: "Dra. Juliana Santos",
    value: 32,
    badge:
      "bg-[#eeeaff] text-[#6847f5]",
  },

  {
    name: "Dra. Camila Soares",
    value: 28,
    badge:
      "bg-[#eaf4ff] text-[#3984dc]",
  },

  {
    name: "Dra. Larissa Lima",
    value: 26,
    badge:
      "bg-[#e8f8f1] text-[#269d75]",
  },

  {
    name: "Dr. Rafael Almeida",
    value: 24,
    badge:
      "bg-[#fff3e4] text-[#df8a27]",
  },

  {
    name: "Dra. Fernanda Lima",
    value: 22,
    badge:
      "bg-[#f8eaff] text-[#a04ed7]",
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
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${professional.badge}`}
              >
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