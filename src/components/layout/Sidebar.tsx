import {
  CalendarDays,
  ChevronLeft,
  Home,
  Settings,
  Users,
} from "lucide-react";

interface MenuItem {
  id: number;
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    label: "Dashboard",
    icon: Home,
    active: true,
  },
  {
    id: 2,
    label: "Agenda",
    icon: CalendarDays,
  },
  {
    id: 3,
    label: "Pacientes",
    icon: Users,
  },
  {
    id: 4,
    label: "Configurações",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-slate-200">
        <div className="text-center">
          <h1 className="text-xl font-bold text-sky-600">
            Entre Afetos
          </h1>

          <p className="text-xs text-slate-500">
            Sistema de Gestão
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-5">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                    item.active
                      ? "bg-sky-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={20} />

                  <span className="font-medium">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-slate-600 transition hover:bg-slate-100">
          <ChevronLeft size={18} />

          <span>Recolher menu</span>
        </button>

        <div className="mt-5 rounded-xl bg-sky-600 p-4 text-white">
          <p className="text-sm font-semibold">
            Desenvolvido por
          </p>

          <p className="mt-1 text-lg font-bold">
            AC Software
          </p>

          <p className="mt-2 text-xs text-sky-100">
            Gestão inteligente para clínicas multiprofissionais.
          </p>
        </div>
      </div>
    </aside>
  );
}