import {
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

interface Appointment {
  id: number;
  time: string;
  arrival: string;
  patient: string;
  age: string;
  responsible: string;
  tag: string;
  professional: string;
  specialty: string;
  status:
    | "Em atendimento"
    | "Aguardando"
    | "Agendado";
}

const appointments: Appointment[] = [
  {
    id: 1,
    time: "08:00",
    arrival: "Chegada 07:55",
    patient: "João Miguel Silva",
    age: "8 anos",
    responsible: "Mariana Silva",
    tag: "TEA - Nível 1",
    professional: "Dra. Juliana Santos",
    specialty: "Psicologia",
    status: "Em atendimento",
  },

  {
    id: 2,
    time: "09:00",
    arrival: "Chegada 08:50",
    patient: "Ana Clara Rodrigues",
    age: "7 anos",
    responsible: "Camila Rodrigues",
    tag: "TDAH",
    professional: "Dra. Juliana Santos",
    specialty: "Psicologia",
    status: "Aguardando",
  },

  {
    id: 3,
    time: "10:00",
    arrival: "Chegada --",
    patient: "Pedro Henrique Santos",
    age: "6 anos",
    responsible: "Juliana Santos",
    tag: "Atraso escolar",
    professional: "Dra. Juliana Santos",
    specialty: "Psicologia",
    status: "Agendado",
  },

  {
    id: 4,
    time: "11:00",
    arrival: "Chegada --",
    patient: "Maria Eduarda Lima",
    age: "9 anos",
    responsible: "Fernanda Lima",
    tag: "Ansiedade",
    professional: "Dra. Juliana Santos",
    specialty: "Psicologia",
    status: "Agendado",
  },

  {
    id: 5,
    time: "14:00",
    arrival: "Chegada --",
    patient: "Lucas Gabriel Alves",
    age: "10 anos",
    responsible: "Juliana Alves",
    tag: "T. Opositivo",
    professional: "Dra. Juliana Santos",
    specialty: "Psicologia",
    status: "Agendado",
  },
];

export function RecepcaoAgendaHoje() {
  const navigate =
    useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={21}
            className="text-violet-600"
          />

          <h2 className="text-lg font-bold text-slate-900">
            Agenda de hoje
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/agenda"
              )
            }
            className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
          >
            Ver agenda completa
          </button>

        </div>
      </div>

      <div>
        {appointments.map(
          (
            appointment
          ) => (
            <div
              key={
                appointment.id
              }
              className="grid grid-cols-1 gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 lg:grid-cols-[70px_minmax(0,1.3fr)_140px_minmax(180px,0.9fr)_130px_36px] lg:items-center"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {
                    appointment.time
                  }
                </p>

                <p className={`mt-1 text-[11px] ${
                  appointment.arrival.includes(
                    "--"
                  )
                    ? "text-slate-400"
                    : "text-emerald-600"
                }`}>
                  {
                    appointment.arrival
                  }
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {
                    appointment.patient
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {appointment.age} • Responsável:{" "}
                  {
                    appointment.responsible
                  }
                </p>
              </div>

              <div>
                <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                  {
                    appointment.tag
                  }
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {
                    appointment.professional
                  }
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    appointment.specialty
                  }
                </p>
              </div>

              <StatusBadge
                status={
                  appointment.status
                }
              />

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <MoreHorizontal
                  size={18}
                />
              </button>
            </div>
          )
        )}
      </div>

      <div className="border-t border-slate-100 p-4 text-center">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="text-sm font-semibold text-violet-600"
        >
          Ver todos os agendamentos do dia →
        </button>
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status:
    Appointment["status"];
}) {
  const style =
    status ===
    "Em atendimento"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : status ===
        "Aguardando"
      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
      : "bg-violet-50 text-violet-700 ring-1 ring-violet-100";

  return (
    <span
      className={`inline-flex justify-center rounded-lg px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      {
        status
      }
    </span>
  );
}