import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  PageCard,
} from "@/components/ui";

const appointments = [
  {
    id: 1,
    patientId: 1,
    patient: "Maria Oliveira",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
    date: "07/08/2026",
    time: "08:00",
    endTime: "08:50",
    room: "Sala 01",
    type: "Individual",
    status: "Realizado",
    observations:
      "Paciente compareceu acompanhado pela responsável.",
  },
  {
    id: 2,
    patientId: 2,
    patient: "João Miguel Silva",
    professional: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
    date: "07/08/2026",
    time: "08:00",
    endTime: "08:50",
    room: "Sala 02",
    type: "Individual",
    status: "Confirmado",
    observations: "",
  },
];

export default function DetalheAgendamento() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const appointment = appointments.find(
    (item) =>
      item.id === Number(appointmentId)
  );

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Agendamento não encontrado
          </h1>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate("/agenda")
            }
          >
            Voltar para agenda
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/agenda")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para agenda
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Detalhes do Agendamento
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Consulte todas as informações do atendimento.
              </p>
            </div>

            <StatusBadge
              status={appointment.status}
            />
          </div>
        </div>

        <PageCard
          title="Paciente"
          description="Paciente vinculado ao atendimento."
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound size={26} />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">
                  {appointment.patient}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Paciente #{appointment.patientId}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  `/pacientes/${appointment.patientId}`
                )
              }
            >
              Abrir prontuário
            </Button>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="Dados do Atendimento"
            description="Informações principais."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info
                icon={<CalendarDays size={18} />}
                label="Data"
                value={appointment.date}
              />

              <Info
                icon={<Clock3 size={18} />}
                label="Horário"
                value={`${appointment.time} às ${appointment.endTime}`}
              />

              <Info
                icon={<Stethoscope size={18} />}
                label="Profissional"
                value={appointment.professional}
              />

              <Info
                icon={<Stethoscope size={18} />}
                label="Especialidade"
                value={appointment.specialty}
              />

              <Info
                icon={<MapPin size={18} />}
                label="Sala"
                value={appointment.room}
              />

              <Info
                icon={<FileText size={18} />}
                label="Tipo"
                value={appointment.type}
              />
            </div>
          </PageCard>

          <PageCard
            title="Observações"
            description="Informações adicionais do agendamento."
          >
            <p className="text-sm leading-7 text-slate-600">
              {appointment.observations ||
                "Nenhuma observação registrada."}
            </p>
          </PageCard>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate(
                `/agenda/${appointment.id}/remarcar`
              )
            }
          >
            Remarcar
          </Button>

          <Button
            type="button"
            onClick={() =>
              navigate(
                `/pacientes/${appointment.patientId}/evolucoes/nova`
              )
            }
          >
            Registrar evolução
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface InfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Info({
  icon,
  label,
  value,
}: InfoProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
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
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}