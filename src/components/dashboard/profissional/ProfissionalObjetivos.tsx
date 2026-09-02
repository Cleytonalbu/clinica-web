import {
  Target,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { ApiObjetivoMeu } from "@/services/dashboardProfissional";

interface ProfissionalObjetivosProps {
  objetivos: ApiObjetivoMeu[];
  loading: boolean;
}

export function ProfissionalObjetivos({
  objetivos,
  loading,
}: ProfissionalObjetivosProps) {
  const navigate = useNavigate();

  const exibidos = [...objetivos]
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .slice(0, 6);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Target
          size={20}
          className="text-pink-500"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Objetivos em acompanhamento
        </h2>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Carregando…</p>
      ) : exibidos.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          Nenhum objetivo em andamento no momento.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {exibidos.map(
            (
              objetivo
            ) => (
              <button
                key={
                  objetivo.id
                }
                type="button"
                onClick={() => navigate(`/pacientes/${objetivo.pacienteId}?tab=objetivos`)}
                className="block w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {
                        objetivo.paciente.nome
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        objetivo.nome
                      }
                    </p>
                  </div>

                  <span className="text-sm font-bold text-pink-500">
                    {
                      objetivo.progresso
                    }%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-pink-500"
                    style={{
                      width:
                        `${objetivo.progresso}%`,
                    }}
                  />
                </div>
              </button>
            )
          )}
        </div>
      )}
    </section>
  );
}
