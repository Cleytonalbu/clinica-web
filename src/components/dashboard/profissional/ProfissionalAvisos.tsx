import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";

const alerts = [
  {
    id: 1,
    title:
      "3 evoluções precisam ser finalizadas",
    icon: ClipboardCheck,
  },

  {
    id: 2,
    title:
      "2 pacientes possuem objetivos para revisão",
    icon: AlertTriangle,
  },

  {
    id: 3,
    title:
      "Reunião de equipe hoje às 17:00",
    icon: CalendarClock,
  },
];

export function ProfissionalAvisos() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-bold text-slate-900">
          Avisos importantes
        </h2>
      </div>

      <div>
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
                className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Icon
                    size={18}
                  />
                </div>

                <p className="text-sm leading-5 text-slate-600">
                  {
                    alert.title
                  }
                </p>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}