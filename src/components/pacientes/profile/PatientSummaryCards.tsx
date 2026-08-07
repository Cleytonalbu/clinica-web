import {
  CalendarCheck2,
  ClipboardList,
  FileText,
  Target,
} from "lucide-react";

const cards = [
  {
    id: 1,
    label: "Atendimentos",
    value: "24",
    description: "Sessões realizadas",
    icon: CalendarCheck2,
    className: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    label: "Objetivos ativos",
    value: "6",
    description: "Em acompanhamento",
    icon: Target,
    className: "bg-violet-50 text-violet-600",
  },
  {
    id: 3,
    label: "Evoluções",
    value: "18",
    description: "Registros clínicos",
    icon: ClipboardList,
    className: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 4,
    label: "Documentos",
    value: "7",
    description: "Arquivos cadastrados",
    icon: FileText,
    className: "bg-amber-50 text-amber-600",
  },
];

export function PatientSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.className}`}
              >
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}