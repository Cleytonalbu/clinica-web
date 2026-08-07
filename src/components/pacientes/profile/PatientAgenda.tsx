import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Plus,
  RefreshCcw,
  UserRound,
  XCircle,
} from "lucide-react";

import { Button, PageCard } from "@/components/ui";

type AppointmentStatus =
  | "Agendado"
  | "Confirmado"
  | "Realizado"
  | "Cancelado";

interface Appointment {
  id: number;
  date: string;
  day: string;
  time: string;
  specialty: string;
  professional: string;
  status: AppointmentStatus;
}

const appointments: Appointment[] = [
  {
    id: 1,
    date: "10/08/2026",
    day: "Segunda-feira",
    time: "10:30",
    specialty: "Psicologia",
    professional: "Dra. Ana Paula",
    status: "Confirmado",
  },
  {
    id: 2,
    date: "12/08/2026",
    day: "Quarta-feira",
    time: "14:00",
    specialty: "Fonoaudiologia",
    professional: "Dra. Camila Soares",
    status: "Agendado",
  },
  {
    id: 3,
    date: "15/08/2026",
    day: "Sábado",
    time: "09:00",
    specialty: "Terapia Ocupacional",
    professional: "Dra. Larissa Lima",
    status: "Agendado",
  },
];

const history: Appointment[] = [
  {
    id: 4,
    date: "05/08/2026",
    day: "Quarta-feira",
    time: "08:00",
    specialty: "Psicologia",
    professional: "Dra. Ana Paula",
    status: "Realizado",
  },
  {
    id: 5,
    date: "02/08/2026",
    day: "Domingo",
    time: "15:30",
    specialty: "Fonoaudiologia",
    professional: "Dra. Camila Soares",
    status: "Realizado",
  },
  {
    id: 6,
    date: "29/07/2026",
    day: "Quarta-feira",
    time: "11:00",
    specialty: "Psicologia",
    professional: "Dra. Ana Paula",
    status: "Cancelado",
  },
];

export function PatientAgenda() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Agenda do Paciente
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os próximos atendimentos e o histórico de sessões.
          </p>
        </div>

        <Button type="button">
          <Plus size={18} />
          Novo agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Próximas sessões"
          value="3"
          description="Agendamentos futuros"
          icon={<CalendarDays size={22} />}
          iconClassName="bg-blue-100 text-blue-600"
        />

        <SummaryCard
          title="Sessões realizadas"
          value="24"
          description="Total de atendimentos"
          icon={<CheckCircle2 size={22} />}
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Cancelamentos"
          value="2"
          description="Nos últimos 90 dias"
          icon={<XCircle size={22} />}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      <PageCard
        title="Próximos Atendimentos"
        description="Sessões já programadas para este paciente."
        actions={
          <Button
            variant="outline"
            size="sm"
            type="button"
          >
            <RefreshCcw size={15} />
            Atualizar
          </Button>
        }
      >
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
            />
          ))}
        </div>
      </PageCard>

      <PageCard
        title="Histórico de Atendimentos"
        description="Últimas sessões registradas."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Data
                </th>

                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Horário
                </th>

                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Especialidade
                </th>

                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Profissional
                </th>

                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4">
                    <p className="font-medium text-slate-800">
                      {appointment.date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {appointment.day}
                    </p>
                  </td>

                  <td className="py-4 text-sm text-slate-600">
                    {appointment.time}
                  </td>

                  <td className="py-4 text-sm text-slate-600">
                    {appointment.specialty}
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <UserRound size={17} />
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {appointment.professional}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <StatusBadge status={appointment.status} />
                  </td>

                  <td className="py-4 text-right">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}

interface AppointmentRowProps {
  appointment: Appointment;
}

function AppointmentRow({
  appointment,
}: AppointmentRowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <CalendarDays size={21} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {appointment.specialty}
            </p>

            <StatusBadge status={appointment.status} />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {appointment.professional}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <CalendarDays size={15} />
              {appointment.date}
            </span>

            <span className="flex items-center gap-2">
              <Clock3 size={15} />
              {appointment.time}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
        >
          Remarcar
        </Button>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: AppointmentStatus;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<AppointmentStatus, string> = {
    Agendado:
      "bg-blue-100 text-blue-700",

    Confirmado:
      "bg-violet-100 text-violet-700",

    Realizado:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}