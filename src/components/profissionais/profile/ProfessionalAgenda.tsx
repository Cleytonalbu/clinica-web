import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  Button,
  PageCard,
} from "@/components/ui";

type AppointmentStatus =
  | "Confirmado"
  | "Agendado"
  | "Realizado"
  | "Cancelado";

interface Appointment {
  id: number;
  patientId: number;
  patient: string;
  time: string;
  endTime: string;
  specialty: string;
  type: string;
  status: AppointmentStatus;
}

const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patient: "Maria Oliveira",
    time: "08:00",
    endTime: "08:50",
    specialty: "Psicologia",
    type: "Individual",
    status: "Realizado",
  },
  {
    id: 2,
    patientId: 2,
    patient: "João Miguel Silva",
    time: "09:00",
    endTime: "09:50",
    specialty: "Psicologia",
    type: "Individual",
    status: "Confirmado",
  },
  {
    id: 3,
    patientId: 3,
    patient: "Lucas Gabriel",
    time: "10:30",
    endTime: "11:20",
    specialty: "Psicologia",
    type: "Individual",
    status: "Agendado",
  },
  {
    id: 4,
    patientId: 4,
    patient: "Ana Clara Rodrigues",
    time: "14:00",
    endTime: "14:50",
    specialty: "Psicologia",
    type: "Individual",
    status: "Confirmado",
  },
  {
    id: 5,
    patientId: 5,
    patient: "Pedro Henrique",
    time: "15:30",
    endTime: "16:20",
    specialty: "Psicologia",
    type: "Avaliação",
    status: "Cancelado",
  },
];

export function ProfessionalAgenda() {
  const navigate = useNavigate();

  const realized = appointments.filter(
    (item) => item.status === "Realizado"
  ).length;

  const confirmed = appointments.filter(
    (item) => item.status === "Confirmado"
  ).length;

  const cancelled = appointments.filter(
    (item) => item.status === "Cancelado"
  ).length;

  function handlePatient(
    patientId: number
  ) {
    navigate(`/pacientes/${patientId}`);
  }

  function handleEvolution(
    patientId: number
  ) {
    navigate(
      `/pacientes/${patientId}/evolucoes/nova`
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Agenda do Profissional
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Atendimentos programados e realizados no dia.
          </p>
        </div>

        <Button type="button">
          <CalendarDays size={18} />
          Novo agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AgendaMetric
          label="Hoje"
          value={String(appointments.length)}
          description="Atendimentos"
          icon={<CalendarDays size={21} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <AgendaMetric
          label="Realizados"
          value={String(realized)}
          description="Concluídos"
          icon={<CheckCircle2 size={21} />}
          className="bg-emerald-100 text-emerald-600"
        />

        <AgendaMetric
          label="Confirmados"
          value={String(confirmed)}
          description="Aguardando horário"
          icon={<Clock3 size={21} />}
          className="bg-blue-100 text-blue-600"
        />

        <AgendaMetric
          label="Cancelados"
          value={String(cancelled)}
          description="No dia"
          icon={<XCircle size={21} />}
          className="bg-red-100 text-red-600"
        />
      </div>

      <PageCard
        title="Agenda de Hoje"
        description="Sexta-feira, 07 de agosto de 2026."
      >
        <div className="space-y-3">
          {appointments.map(
            (appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPatient={() =>
                  handlePatient(
                    appointment.patientId
                  )
                }
                onEvolution={() =>
                  handleEvolution(
                    appointment.patientId
                  )
                }
              />
            )
          )}
        </div>
      </PageCard>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPatient: () => void;
  onEvolution: () => void;
}

function AppointmentCard({
  appointment,
  onPatient,
  onEvolution,
}: AppointmentCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex min-w-20 flex-col items-center justify-center rounded-xl bg-indigo-50 px-3 py-3 text-indigo-700">
            <span className="text-lg font-bold">
              {appointment.time}
            </span>

            <span className="mt-1 text-xs">
              {appointment.endTime}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPatient}
                className="text-left font-semibold text-slate-900 transition hover:text-indigo-600"
              >
                {appointment.patient}
              </button>

              <AppointmentStatusBadge
                status={appointment.status}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <UserRound size={15} />
                {appointment.specialty}
              </span>

              <span>
                {appointment.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPatient}
          >
            <UserRound size={16} />
            Paciente
          </Button>

          {appointment.status !==
            "Cancelado" && (
            <Button
              type="button"
              size="sm"
              onClick={onEvolution}
            >
              <FileText size={16} />
              Registrar evolução
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AgendaMetricProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function AgendaMetric({
  label,
  value,
  description,
  icon,
  className,
}: AgendaMetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const styles: Record<
    AppointmentStatus,
    string
  > = {
    Confirmado:
      "bg-blue-100 text-blue-700",

    Agendado:
      "bg-amber-100 text-amber-700",

    Realizado:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}