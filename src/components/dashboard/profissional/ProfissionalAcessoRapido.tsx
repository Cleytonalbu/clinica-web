import {
  CalendarPlus,
  ClipboardPlus,
  FileText,
  Target,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

const actions = [
  {
    label: "Nova evolução",
    description:
      "Registrar atendimento",
    icon: ClipboardPlus,
    path: "/pacientes",
  },

  {
    label: "Ver agenda",
    description:
      "Consultar horários",
    icon: CalendarPlus,
    path: "/agenda",
  },

  {
    label: "Objetivos",
    description:
      "Acompanhar metas",
    icon: Target,
    path: "/pacientes",
  },

  {
    label: "Prontuários",
    description:
      "Acessar pacientes",
    icon: FileText,
    path: "/pacientes",
  },
];

export function ProfissionalAcessoRapido() {
  const navigate =
    useNavigate();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Acesso rápido
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map(
          (
            action
          ) => {
            const Icon =
              action.icon;

            return (
              <button
                key={
                  action.label
                }
                type="button"
                onClick={() =>
                  navigate(
                    action.path
                  )
                }
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon
                    size={19}
                  />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800">
                  {
                    action.label
                  }
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {
                    action.description
                  }
                </p>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}