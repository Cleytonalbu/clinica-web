import {
  Target,
} from "lucide-react";

const objectives = [
  {
    patient: "Ana Clara",
    objective:
      "Autorregulação emocional",
    progress: 75,
  },

  {
    patient: "João Miguel",
    objective:
      "Interação social",
    progress: 60,
  },

  {
    patient: "Pedro Henrique",
    objective:
      "Atenção e concentração",
    progress: 45,
  },

  {
    patient: "Maria Eduarda",
    objective:
      "Comunicação funcional",
    progress: 82,
  },
];

export function ProfissionalObjetivos() {
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

      <div className="mt-6 space-y-5">
        {objectives.map(
          (
            objective
          ) => (
            <div
              key={
                `${objective.patient}-${objective.objective}`
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {
                      objective.patient
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      objective.objective
                    }
                  </p>
                </div>

                <span className="text-sm font-bold text-pink-500">
                  {
                    objective.progress
                  }%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-pink-500"
                  style={{
                    width:
                      `${objective.progress}%`,
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