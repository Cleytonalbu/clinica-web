import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";

export type ProfessionalProfileTab =
  | "resumo"
  | "agenda"
  | "pacientes"
  | "producao"
  | "horarios";

interface ProfessionalProfileNavProps {
  activeTab: ProfessionalProfileTab;

  onChange: (
    tab: ProfessionalProfileTab
  ) => void;
}

const items = [
  {
    id: "resumo" as const,
    label: "Resumo",
    icon: LayoutDashboard,
  },
  {
    id: "agenda" as const,
    label: "Agenda",
    icon: CalendarDays,
  },
  {
    id: "pacientes" as const,
    label: "Pacientes",
    icon: Users,
  },
  {
    id: "producao" as const,
    label: "Produção",
    icon: TrendingUp,
  },
  {
    id: "horarios" as const,
    label: "Horários",
    icon: Clock3,
  },
];

export function ProfessionalProfileNav({
  activeTab,
  onChange,
}: ProfessionalProfileNavProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-1">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onChange(item.id)
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}