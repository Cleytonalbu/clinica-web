import {
  TrendingUp,
} from "lucide-react";

export function ProfissionalOcupacao() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Taxa de ocupação
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Ocupação da sua agenda neste mês.
      </p>

      <div className="mt-5 flex justify-center">
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-emerald-500">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              85%
            </p>

            <p className="mt-1 text-sm font-semibold text-emerald-600">
              Ótima
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-600">
        <TrendingUp
          size={16}
        />

        +6% em relação ao mês passado
      </div>
    </section>
  );
}