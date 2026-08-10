import {
  CircleDollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useState,
} from "react";

export function ProfissionalValoresReceber() {
  const [
    showValues,
    setShowValues,
  ] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CircleDollarSign
              size={19}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Valores a receber
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Resumo financeiro pessoal.
            </p>
          </div>
        </div>

        <button
          type="button"
          title={
            showValues
              ? "Ocultar valores"
              : "Mostrar valores"
          }
          onClick={() =>
            setShowValues(
              (
                current
              ) =>
                !current
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition hover:bg-slate-100"
        >
          {showValues ? (
            <Eye
              size={16}
            />
          ) : (
            <EyeOff
              size={16}
            />
          )}
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Total a receber
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {showValues
            ? "R$ 4.850,00"
            : "R$ ••••••••"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-medium text-emerald-700">
            Recebido
          </p>

          <p className="mt-2 text-sm font-bold text-emerald-800">
            {showValues
              ? "R$ 3.600,00"
              : "R$ ••••••"}
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-3">
          <p className="text-[10px] font-medium text-orange-700">
            Pendente
          </p>

          <p className="mt-2 text-sm font-bold text-orange-800">
            {showValues
              ? "R$ 1.250,00"
              : "R$ ••••••"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Atendimentos realizados
          </span>

          <span className="text-xs font-bold text-slate-700">
            28
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Valor médio
          </span>

          <span className="text-xs font-bold text-slate-700">
            {showValues
              ? "R$ 173,21"
              : "R$ •••••"}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Ver detalhes
      </button>
    </section>
  );
}