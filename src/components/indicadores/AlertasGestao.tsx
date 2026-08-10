import {
  AlertTriangle,
  CalendarClock,
  Target,
  UserX,
} from "lucide-react";

const alerts = [
  {
    id: 1,
    title:
      "Crianças sem atendimento há mais de 15 dias",
    detail:
      "12 crianças",
    icon:
      UserX,
  },

  {
    id: 2,
    title:
      "Objetivos sem atualização há mais de 30 dias",
    detail:
      "28 objetivos",
    icon:
      Target,
  },

  {
    id: 3,
    title:
      "Profissionais com agenda ociosa",
    detail:
      "4 profissionais",
    icon:
      CalendarClock,
  },

  {
    id: 4,
    title:
      "Especialidade com maior índice de faltas",
    detail:
      "Fonoaudiologia (18%)",
    icon:
      AlertTriangle,
  },
];

export function AlertasGestao() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Alertas da gestão
      </h2>

      <div className="mt-5 space-y-3">
        {alerts.map(
          (
            alert
          ) => {
            const Icon =
              alert.icon;

            return (
              <div
                key={
                  alert.id
                }
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon
                    size={18}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5 text-slate-700">
                    {
                      alert.title
                    }
                  </p>
                </div>

                <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                  {
                    alert.detail
                  }
                </span>
              </div>
            );
          }
        )}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Ver todos os alertas
      </button>
    </section>
  );
}