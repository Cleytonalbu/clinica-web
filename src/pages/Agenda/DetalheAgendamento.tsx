import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Stethoscope,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  getSavedAppointments,
  updateSavedAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  createChargeFromAppointment,
} from "@/pages/Financeiro/financeStorage";

const defaultAppointments: StoredAppointment[] = [
  {
    id: 1,
    patientId: 1,
    patient:
      "Maria Oliveira",
    professional:
      "Dra. Ana Paula",
    specialty:
      "Psicologia",
    date:
      "2026-08-07",
    time:
      "08:00",
    endTime:
      "08:50",
    room:
      "Sala 01",
    type:
      "Individual",
    status:
      "Realizado",
    observations:
      "Paciente compareceu acompanhado pela responsável.",
  },

  {
    id: 2,
    patientId: 2,
    patient:
      "João Miguel Silva",
    professional:
      "Dra. Camila Soares",
    specialty:
      "Fonoaudiologia",
    date:
      "2026-08-07",
    time:
      "08:00",
    endTime:
      "08:50",
    room:
      "Sala 02",
    type:
      "Individual",
    status:
      "Confirmado",
    observations:
      "",
  },

  {
    id: 3,
    patientId: 3,
    patient:
      "Lucas Gabriel",
    professional:
      "Dra. Ana Paula",
    specialty:
      "Psicologia",
    date:
      "2026-08-07",
    time:
      "09:00",
    endTime:
      "09:50",
    room:
      "Sala 01",
    type:
      "Individual",
    status:
      "Confirmado",
    observations:
      "",
  },

  {
    id: 4,
    patientId: 4,
    patient:
      "Ana Clara Rodrigues",
    professional:
      "Dra. Larissa Lima",
    specialty:
      "Terapia Ocupacional",
    date:
      "2026-08-07",
    time:
      "10:00",
    endTime:
      "10:50",
    room:
      "Sala 03",
    type:
      "Individual",
    status:
      "Agendado",
    observations:
      "",
  },

  {
    id: 5,
    patientId: 5,
    patient:
      "Pedro Henrique",
    professional:
      "Dr. Rafael Costa",
    specialty:
      "Fisioterapia",
    date:
      "2026-08-07",
    time:
      "11:00",
    endTime:
      "11:50",
    room:
      "Sala 04",
    type:
      "Avaliação",
    status:
      "Cancelado",
    observations:
      "",
  },

  {
    id: 6,
    patientId: 1,
    patient:
      "Maria Oliveira",
    professional:
      "Dra. Camila Soares",
    specialty:
      "Fonoaudiologia",
    date:
      "2026-08-07",
    time:
      "14:00",
    endTime:
      "14:50",
    room:
      "Sala 02",
    type:
      "Individual",
    status:
      "Agendado",
    observations:
      "",
  },

  {
    id: 7,
    patientId: 3,
    patient:
      "Lucas Gabriel",
    professional:
      "Dra. Ana Paula",
    specialty:
      "Psicologia",
    date:
      "2026-08-08",
    time:
      "09:00",
    endTime:
      "09:50",
    room:
      "Sala 01",
    type:
      "Individual",
    status:
      "Agendado",
    observations:
      "",
  },

  {
    id: 8,
    patientId: 1,
    patient:
      "Maria Oliveira",
    professional:
      "Dra. Ana Paula",
    specialty:
      "Psicologia",
    date:
      "2026-08-10",
    time:
      "10:30",
    endTime:
      "11:20",
    room:
      "Sala 01",
    type:
      "Individual",
    status:
      "Confirmado",
    observations:
      "",
  },
];

export default function DetalheAgendamento() {
  const navigate =
    useNavigate();

  const {
    appointmentId,
  } =
    useParams();

  const numericId =
    Number(
      appointmentId
    );

  const savedAppointments =
    getSavedAppointments();

  const isSavedAppointment =
    savedAppointments.some(
      (item) =>
        item.id ===
        numericId
    );

  const initialAppointment =
    useMemo(
      () =>
        [
          ...defaultAppointments,
          ...savedAppointments,
        ].find(
          (item) =>
            item.id ===
            numericId
        ),
      [
        numericId,
      ]
    );

  const [
    appointment,
    setAppointment,
  ] =
    useState<
      StoredAppointment | undefined
    >(
      initialAppointment
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string | null
    >(null);

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      | "success"
      | "error"
      | null
    >(null);

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Agendamento não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O atendimento pode ter sido removido ou não existe.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/agenda"
              )
            }
          >
            Voltar para agenda
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  function changeStatus(
    status:
      StoredAppointment["status"]
  ) {
    if (
      !isSavedAppointment
    ) {
      setFeedback(
        "Os atendimentos de demonstração ainda não podem ter o status alterado permanentemente."
      );

      setFeedbackType(
        "error"
      );

      return;
    }

    updateSavedAppointment(
      appointment.id,
      {
        status,
      }
    );

    if (
      status ===
      "Realizado"
    ) {
      createChargeFromAppointment(
        {
          appointmentId:
            appointment.id,

          patientId:
            appointment.patientId,

          patient:
            appointment.patient,

          professional:
            appointment.professional,

          specialty:
            appointment.specialty,

          date:
            appointment.date,

          amount:
            150,
        }
      );
    }

    setAppointment(
      (current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
    );

    if (
      status ===
      "Realizado"
    ) {
      setFeedback(
        "Atendimento realizado. Uma cobrança de R$ 150,00 foi gerada automaticamente no Financeiro."
      );
    } else {
      setFeedback(
        getStatusMessage(
          status
        )
      );
    }

    setFeedbackType(
      "success"
    );
  }

  const finished =
    appointment.status ===
      "Realizado" ||
    appointment.status ===
      "Cancelado" ||
    appointment.status ===
      "Faltou";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/agenda"
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para agenda
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Detalhes do Agendamento
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Consulte e gerencie o atendimento.
              </p>
            </div>

            <StatusBadge
              status={
                appointment.status
              }
            />
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType ===
              "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
          </div>
        )}

        {!isSavedAppointment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Este é um atendimento de demonstração. As alterações permanentes estão disponíveis nos novos agendamentos criados pelo sistema.
          </div>
        )}

        <PageCard
          title="Paciente"
          description="Paciente vinculado ao atendimento."
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound
                  size={26}
                />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">
                  {
                    appointment.patient
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Paciente #
                  {
                    appointment.patientId
                  }
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
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="Data"
                value={
                  formatDate(
                    appointment.date
                  )
                }
              />

              <Info
                icon={
                  <Clock3
                    size={18}
                  />
                }
                label="Horário"
                value={`${appointment.time} às ${appointment.endTime}`}
              />

              <Info
                icon={
                  <Stethoscope
                    size={18}
                  />
                }
                label="Profissional"
                value={
                  appointment.professional
                }
              />

              <Info
                icon={
                  <Stethoscope
                    size={18}
                  />
                }
                label="Especialidade"
                value={
                  appointment.specialty
                }
              />

              <Info
                icon={
                  <MapPin
                    size={18}
                  />
                }
                label="Sala"
                value={
                  appointment.room
                }
              />

              <Info
                icon={
                  <FileText
                    size={18}
                  />
                }
                label="Tipo"
                value={
                  appointment.type
                }
              />
            </div>
          </PageCard>

          <PageCard
            title="Observações"
            description="Informações adicionais do agendamento."
          >
            <p className="text-sm leading-7 text-slate-600">
              {appointment.observations?.trim() ||
                "Nenhuma observação registrada."}
            </p>
          </PageCard>
        </div>

        <PageCard
          title="Situação do Atendimento"
          description="Atualize o andamento da consulta."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              title="Confirmar"
              description="Confirma o comparecimento previsto."
              icon={
                <CheckCircle2
                  size={21}
                />
              }
              active={
                appointment.status ===
                "Confirmado"
              }
              disabled={
                finished
              }
              onClick={() =>
                changeStatus(
                  "Confirmado"
                )
              }
            />

            <ActionCard
              title="Realizado"
              description="Conclui o atendimento e gera a cobrança."
              icon={
                <CheckCircle2
                  size={21}
                />
              }
              active={
                appointment.status ===
                "Realizado"
              }
              disabled={
                appointment.status ===
                  "Cancelado" ||
                appointment.status ===
                  "Faltou"
              }
              onClick={() =>
                changeStatus(
                  "Realizado"
                )
              }
            />

            <ActionCard
              title="Faltou"
              description="Registra ausência sem gerar cobrança."
              icon={
                <UserX
                  size={21}
                />
              }
              active={
                appointment.status ===
                "Faltou"
              }
              warning
              disabled={
                appointment.status ===
                  "Realizado" ||
                appointment.status ===
                  "Cancelado"
              }
              onClick={() =>
                changeStatus(
                  "Faltou"
                )
              }
            />

            <ActionCard
              title="Cancelar"
              description="Cancela o atendimento sem gerar cobrança."
              icon={
                <XCircle
                  size={21}
                />
              }
              active={
                appointment.status ===
                "Cancelado"
              }
              danger
              disabled={
                appointment.status ===
                  "Realizado" ||
                appointment.status ===
                  "Faltou"
              }
              onClick={() =>
                changeStatus(
                  "Cancelado"
                )
              }
            />
          </div>
        </PageCard>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={
              finished
            }
            onClick={() =>
              navigate(
                `/agenda/${appointment.id}/remarcar`
              )
            }
          >
            Remarcar
          </Button>

          {appointment.status ===
            "Realizado" && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  "/financeiro"
                )
              }
            >
              Ver cobrança
            </Button>
          )}

          <Button
            type="button"
            disabled={
              appointment.status !==
              "Realizado"
            }
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
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
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

interface ActionCardProps {
  title:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  active?:
    boolean;

  danger?:
    boolean;

  warning?:
    boolean;

  disabled?:
    boolean;

  onClick:
    () => void;
}

function ActionCard({
  title,
  description,
  icon,
  active = false,
  danger = false,
  warning = false,
  disabled = false,
  onClick,
}: ActionCardProps) {
  let className =
    "border-slate-200 bg-white text-slate-700";

  if (
    active &&
    danger
  ) {
    className =
      "border-red-300 bg-red-50 text-red-700";
  } else if (
    active &&
    warning
  ) {
    className =
      "border-orange-300 bg-orange-50 text-orange-700";
  } else if (
    active
  ) {
    className =
      "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`rounded-2xl border p-5 text-left transition ${className} ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:-translate-y-0.5 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          {icon}
        </div>

        <p className="font-semibold">
          {title}
        </p>
      </div>

      <p className="mt-3 text-sm leading-6 opacity-80">
        {description}
      </p>
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status:
    StoredAppointment["status"];
}) {
  const styles: Record<
    StoredAppointment["status"],
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

    Faltou:
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function getStatusMessage(
  status:
    StoredAppointment["status"]
) {
  switch (status) {
    case "Confirmado":
      return "Atendimento confirmado com sucesso.";

    case "Realizado":
      return "Atendimento marcado como realizado.";

    case "Faltou":
      return "Falta do paciente registrada.";

    case "Cancelado":
      return "Atendimento cancelado.";

    default:
      return "Status atualizado.";
  }
}

function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  return `${day}/${month}/${year}`;
}