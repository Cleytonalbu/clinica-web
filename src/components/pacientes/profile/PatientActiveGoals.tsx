import { ArrowRight, Target } from "lucide-react";

const goals = [
  {
    id: 1,
    title: "Melhorar comunicação verbal",
    specialty: "Fonoaudiologia",
    progress: 70,
  },
  {
    id: 2,
    title: "Aumentar atenção sustentada",
    specialty: "Psicologia",
    progress: 60,
  },
  {
    id: 3,
    title: "Desenvolver autonomia nas tarefas",
    specialty: "Terapia Ocupacional",
    progress: 40,
  },
];

export function PatientActiveGoals() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Objetivos ativos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhamento terapêutico atual.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Target size={20} />
        </div>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">
                  {goal.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {goal.specialty}
                </p>
              </div>

              <span className="text-sm font-semibold text-violet-600">
                {goal.progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
      >
        Ver todos os objetivos
        <ArrowRight size={16} />
      </button>
    </div>
  );
}