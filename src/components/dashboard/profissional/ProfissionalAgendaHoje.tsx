import {
  CalendarDays,
  MoreVertical,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

const agenda = [
  {
    time: "08:00 - 09:00",
    patient: "Maria Alice Silva",
    specialty: "Psicologia",
    status: "Concluído",
  },

  {
    time: "09:00 - 10:00",
    patient: "João Miguel Tavares",
    specialty: "Psicologia",
    status: "Em atendimento",
  },

  {
    time: "10:00 - 11:00",
    patient: "Laura Vitória Pereira",
    specialty: "Psicologia",
    status: "Aguardando",
  },

  {
    time: "11:00 - 12:00",
    patient: "Bernardo Ferreira",
    specialty: "Psicologia",
    status: "Confirmado",
  },

  {
    time: "14:00 - 15:00",
    patient: "Isadora Alves",
    specialty: "Psicologia",
    status: "Confirmado",
  },
];

export function ProfissionalAgendaHoje() {
  const navigate =
    useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarDays
              size={20}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Agenda de hoje
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Seus atendimentos programados para hoje.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
        >
          Ver agenda completa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
        {agenda.map(
          (
            appointment
          ) => (
            <div
              key={
                `${appointment.time}-${appointment.patient}`
              }
              className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-4 pl-5"
            >
              <span className="absolute bottom-0 left-0 top-0 w-1 bg-violet-500" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-violet-600">
                    {
                      appointment.time
                    }
                  </p>

                  <p className="mt-2 truncate text-sm font-bold text-slate-800">
                    {
                      appointment.patient
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      appointment.specialty
                    }
                  </p>

                  <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                    {
                      appointment.status
                    }
                  </span>
                </div>

                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
                >
                  <MoreVertical
                    size={16}
                  />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}