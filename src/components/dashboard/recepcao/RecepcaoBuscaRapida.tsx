import {
  Search,
} from "lucide-react";

export function RecepcaoBuscaRapida() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Search
          size={20}
          className="text-indigo-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Busca rápida
        </h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Encontre informações de forma rápida.
      </p>

      <div className="relative mt-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Buscar paciente ou responsável..."
          className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <select className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-600 outline-none">
        <option>
          Todos os registros
        </option>

        <option>
          Pacientes
        </option>

        <option>
          Responsáveis
        </option>
      </select>

      <button
        type="button"
        className="mt-3 h-11 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        Buscar
      </button>

      <button
        type="button"
        className="mt-4 text-xs font-semibold text-indigo-600"
      >
        Busca avançada
      </button>
    </section>
  );
}