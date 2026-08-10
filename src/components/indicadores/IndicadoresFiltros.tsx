import {
  CalendarDays,
  RefreshCcw,
  SlidersHorizontal,
} from "lucide-react";

export function IndicadoresFiltros() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Período
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
            />

            <input
              type="text"
              value="01/05/2026 até 31/05/2026"
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Especialidade
          </label>

          <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
            <option>
              Todas as especialidades
            </option>

            <option>
              Psicologia
            </option>

            <option>
              Fonoaudiologia
            </option>

            <option>
              Terapia Ocupacional
            </option>

            <option>
              Fisioterapia
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Profissional
          </label>

          <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
            <option>
              Todos os profissionais
            </option>

            <option>
              Dra. Juliana Santos
            </option>

            <option>
              Dra. Camila Soares
            </option>

            <option>
              Dra. Larissa Lima
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Criança
          </label>

          <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
            <option>
              Todas as crianças
            </option>

            <option>
              Ana Clara
            </option>

            <option>
              João Miguel
            </option>

            <option>
              Maria Eduarda
            </option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <SlidersHorizontal
            size={16}
          />

          Limpar filtros
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <RefreshCcw
            size={16}
          />

          Atualizar
        </button>
      </div>
    </section>
  );
}