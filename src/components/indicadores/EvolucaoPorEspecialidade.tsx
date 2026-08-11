const specialties = [
  {
    name: "Psicologia",
    value: "78%",
    dot: "bg-[#6847f5]",
  },

  {
    name: "Fonoaudiologia",
    value: "82%",
    dot: "bg-[#3b91ed]",
  },

  {
    name: "Fisioterapia",
    value: "75%",
    dot: "bg-[#2daf82]",
  },

  {
    name: "Terapia Ocupacional",
    value: "71%",
    dot: "bg-[#ed982f]",
  },

  {
    name: "Psicopedagogia",
    value: "69%",
    dot: "bg-[#e95f9b]",
  },
];

export function EvolucaoPorEspecialidade() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Evolução por especialidade
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[180px_1fr] sm:items-center">
        <div
          className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background:
              "conic-gradient(#6847f5 0deg 88deg, #3b91ed 88deg 162deg, #2daf82 162deg 234deg, #ed982f 234deg 302deg, #e95f9b 302deg 360deg)",
          }}
        >
          <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                75%
              </p>

              <p className="text-xs text-slate-400">
                média
              </p>
            </div>
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
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${specialty.dot}`}
                  />

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