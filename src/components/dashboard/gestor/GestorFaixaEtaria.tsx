const ageGroups = [
  {
    label: "0 a 5 anos",
    value: 38,
    dotStyle: "bg-[#6847f5]",
  },

  {
    label: "6 a 10 anos",
    value: 31,
    dotStyle: "bg-[#38a8df]",
  },

  {
    label: "11 a 15 anos",
    value: 19,
    dotStyle: "bg-[#38bd92]",
  },

  {
    label: "16+ anos",
    value: 12,
    dotStyle: "bg-[#f0b144]",
  },
];

export function GestorFaixaEtaria() {
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
        Pacientes por faixa etária
      </h2>

      <p className="mt-1 text-xs font-medium text-[#8a95b4]">
        Distribuição atual dos pacientes.
      </p>

      {/* GRÁFICO */}

      <div className="mt-6 flex justify-center">
        <div
          className="
            relative
            flex
            h-40
            w-40
            items-center
            justify-center
            rounded-full
          "
          style={{
            background:
              "conic-gradient(#6847f5 0% 38%, #38a8df 38% 69%, #38bd92 69% 88%, #f0b144 88% 100%)",
          }}
        >
          {/* CENTRO */}

          <div
            className="
              flex
              h-[112px]
              w-[112px]
              flex-col
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-[inset_0_0_0_1px_rgba(235,237,245,0.8)]
            "
          >
            <p className="text-[26px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              146
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-[#929cb8]">
              pacientes
            </p>
          </div>
        </div>
      </div>

      {/* LEGENDA */}

      <div className="mt-6 space-y-3">
        {ageGroups.map(
          (group) => (
            <div
              key={
                group.label
              }
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    ${group.dotStyle}
                  `}
                />

                <span className="text-xs font-semibold text-[#727e9f]">
                  {
                    group.label
                  }
                </span>
              </div>

              <span className="text-xs font-extrabold text-[#263765]">
                {
                  group.value
                }
                %
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}