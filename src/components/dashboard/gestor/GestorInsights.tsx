import {
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export function GestorInsights() {
  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
            <Lightbulb
              size={23}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Insights da semana
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              O número de atendimentos realizados cresceu 12% em relação à semana anterior. Psicologia segue como a especialidade com maior volume de atendimentos.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-600 shadow-sm">
          <TrendingUp
            size={18}
          />

          +12% atendimentos
        </div>
      </div>
    </section>
  );
}