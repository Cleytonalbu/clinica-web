import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Target,
} from "lucide-react";

const timeline = [
  {
    id: 1,
    title: "Atendimento realizado",
    description:
      "Sessão de Psicologia com Dra. Ana Paula.",
    date: "Hoje • 08:00",
    icon: CalendarCheck2,
    className: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Evolução registrada",
    description:
      "Nova evolução adicionada ao prontuário.",
    date: "05/08/2026 • 14:20",
    icon: ClipboardList,
    className: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    title: "Objetivo atualizado",
    description:
      "Objetivo “Melhorar interação social” passou para em evolução.",
    date: "02/08/2026 • 10:15",
    icon: Target,
    className: "bg-violet-100 text-violet-600",
  },
  {
    id: 4,
    title: "Objetivo concluído",
    description:
      "Objetivo terapêutico marcado como alcançado.",
    date: "28/07/2026 • 16:40",
    icon: CheckCircle2,
    className: "bg-amber-100 text-amber-600",
  },
];

export function PatientTimeline() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Histórico recente
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Últimas movimentações do paciente.
        </p>
      </div>

      <div className="space-y-1">
        {timeline.map((item, index) => {
          const Icon = item.icon;
          const last = index === timeline.length - 1;

          return (
            <div
              key={item.id}
              className="relative flex gap-4 pb-6"
            >
              {!last && (
                <div className="absolute left-5 top-10 h-[calc(100%-16px)] w-px bg-slate-200" />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.className}`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-800">
                    {item.title}
                  </p>

                  <span className="text-xs text-slate-400">
                    {item.date}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}