const specialties = [
  {
    name: "Psicologia",
    value: 82,
    barStyle: "bg-[#6847f5]",
    valueStyle: "text-[#6847f5]",
  },

  {
    name: "Fonoaudiologia",
    value: 74,
    barStyle: "bg-[#36a9e1]",
    valueStyle: "text-[#299bd2]",
  },

  {
    name: "Terapia Ocupacional",
    value: 68,
    barStyle: "bg-[#35bd92]",
    valueStyle: "text-[#29a77f]",
  },

  {
    name: "Fisioterapia",
    value: 61,
    barStyle: "bg-[#f2b347]",
    valueStyle: "text-[#dc9b2e]",
  },
];

export function GestorDesempenho() {
  return (
    <section
      className="
        rounded-2xl
        border
        border-[#eceef6]
        bg-white
        p-6
        shadow-[0_4px_16px_rgba(51,65,120,0.04)]
      "
    >
      <h2 className="text-[17px] font-extrabold text-[#10235f]">
        Desempenho por especialidade
      </h2>

      <p className="mt-1 text-xs font-medium text-[#8a95b4]">
        Atendimentos realizados no mês.
      </p>

      <div className="mt-7 space-y-6">
        {specialties.map(
          (specialty) => (
            <div
              key={
                specialty.name
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#667397]">
                  {
                    specialty.name
                  }
                </span>

                <span
                  className={`
                    text-xs
                    font-extrabold
                    ${specialty.valueStyle}
                  `}
                >
                  {
                    specialty.value
                  }
                  %
                </span>
              </div>

              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#f0f1f7]">
                <div
                  className={`
                    h-full
                    rounded-full
                    transition-all
                    ${specialty.barStyle}
                  `}
                  style={{
                    width:
                      `${specialty.value}%`,
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