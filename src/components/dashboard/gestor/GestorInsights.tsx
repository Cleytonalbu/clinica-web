import {
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export function GestorInsights() {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#e7e1ff]
        bg-gradient-to-r
        from-[#f5f1ff]
        via-[#f8f5ff]
        to-[#fbf9ff]
        px-6
        py-5
      "
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* TEXTO */}

        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              text-[#7046ff]
              shadow-[0_5px_15px_rgba(95,63,224,0.08)]
            "
          >
            <Lightbulb
              size={21}
            />
          </div>

          <div>
            <h2 className="text-[17px] font-extrabold text-[#10235f]">
              Insights da semana
            </h2>

            <p className="mt-1 max-w-3xl text-xs font-medium leading-5 text-[#68759b]">
              O número de atendimentos realizados cresceu 12% em relação à semana anterior. Psicologia segue como a especialidade com maior volume de atendimentos.
            </p>
          </div>
        </div>

        {/* INDICADOR */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            rounded-xl
            border
            border-white
            bg-white/90
            px-4
            py-3
            text-xs
            font-extrabold
            text-[#28a678]
            shadow-[0_5px_16px_rgba(65,74,120,0.05)]
          "
        >
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-[#eafbf5]
            "
          >
            <TrendingUp
              size={15}
            />
          </div>

          +12% atendimentos
        </div>
      </div>
    </section>
  );
}