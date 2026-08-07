import {
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Target,
  WalletCards,
} from "lucide-react";

export type PatientProfileTab =
  | "resumo"
  | "agenda"
  | "objetivos"
  | "evolucoes"
  | "documentos"
  | "financeiro"
  | "relatorios";

interface PatientProfileNavProps {
  activeTab: PatientProfileTab;
  onChange: (tab: PatientProfileTab) => void;
}

const items: Array<{
  id: PatientProfileTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "resumo",
    label: "Resumo",
    icon: LayoutDashboard,
  },
  {
    id: "agenda",
    label: "Agenda",
    icon: CalendarDays,
  },
  {
    id: "objetivos",
    label: "Objetivos",
    icon: Target,
  },
  {
    id: "evolucoes",
    label: "Evoluções",
    icon: ClipboardList,
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FolderOpen,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: WalletCards,
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: FileText,
  },
];

export function PatientProfileNav({
  activeTab,
  onChange,
}: PatientProfileNavProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
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