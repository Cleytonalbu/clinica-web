import {
  Clock3,
} from "lucide-react";

interface Appointment {
  id: number;
  time: string;
  patient: string;
  professional: string;
  specialty: string;
}

const appointments: Appointment[] = [
  {
    id: 1,
    time: "08:00",
    patient: "Ana Clara",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
  },

  {
    id: 2,
    time: "09:00",
    patient: "João Miguel",
    professional: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
  },

  {
    id: 3,
    time: "10:00",
    patient: "Beatriz Lima",
    professional: "Dra. Larissa Lima",
    specialty: "Terapia Ocupacional",
  },

  {
    id: 4,
    time: "11:00",
    patient: "Lucas Gabriel",
    professional: "Dr. Rafael Costa",
    specialty: "Fisioterapia",
  },
];

export function GestorProximosAtendimentos() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Próximos atendimentos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Agenda de hoje.
          </p>
        </div>

        <span className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600">
          Hoje
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {appointments.map(
          (
            appointment
          ) => (
            <div
              key={
                appointment.id
              }
              className="rounded-xl border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Clock3
                    size={18}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {
                        appointment.patient
                      }
                    </p>

                    <span className="text-sm font-bold text-sky-600">
                      {
                        appointment.time
                      }
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {
                      appointment.professional
                    }
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {
                      appointment.specialty
                    }
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Ver agenda completa
      </button>
    </section>
  );
}