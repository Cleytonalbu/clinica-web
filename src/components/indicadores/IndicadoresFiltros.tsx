import {
  CalendarDays,
  RefreshCcw,
} from "lucide-react";

interface IndicadoresFiltrosProps {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (value: string) => void;
  onDataFimChange: (value: string) => void;
  onAtualizar: () => void;
  loading: boolean;
}

export function IndicadoresFiltros({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  onAtualizar,
  loading,
}: IndicadoresFiltrosProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Data início
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
            />

            <input
              type="date"
              value={dataInicio}
              onChange={(event) => onDataInicioChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Data fim
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(event) => onDataFimChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onAtualizar}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={16}
            />

            {loading ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
      </div>
    </section>
  );
}
