import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  listarAgendamentos,
  type ApiAgendamento,
  type ApiStatusAgendamento,
} from "@/services/agenda";

interface ProfessionalAgendaProps {
  profissionalId: string;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LABELS: Record<ApiStatusAgendamento, string> = {
  AGENDADO: "Agendado",
  AGUARDANDO: "Aguardando",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Realizado",
  CANCELADO: "Cancelado",
  FALTOU: "Faltou",
};

export function ProfessionalAgenda({
  profissionalId,
}: ProfessionalAgendaProps) {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<ApiAgendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    listarAgendamentos({ profissionalId, data: hojeISO(), porPagina: 100 })
      .then((resposta) => {
        if (cancelado) return;
        setAgendamentos(
          resposta.dados
            .filter((a) => a.tipo === "ATENDIMENTO")
            .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [profissionalId]);

  const realizados = agendamentos.filter((a) => a.status === "CONCLUIDO").length;
  const confirmados = agendamentos.filter((a) => a.status === "AGUARDANDO" || a.status === "AGENDADO").length;
  const cancelados = agendamentos.filter((a) => a.status === "CANCELADO" || a.status === "FALTOU").length;

  function handlePatient(
    patientId: string
  ) {
    navigate(`/pacientes/${patientId}`);
  }

  function handleEvolution(
    patientId: string,
    appointmentId: string
  ) {
    navigate(
      `/pacientes/${patientId}/evolucoes/nova?appointmentId=${appointmentId}`
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AgendaMetric
          label="Hoje"
          value={loading ? "…" : String(agendamentos.length)}
          description="Atendimentos"
          icon={<CalendarDays size={21} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <AgendaMetric
          label="Realizados"
          value={loading ? "…" : String(realizados)}
          description="Concluídos"
          icon={<CheckCircle2 size={21} />}
          className="bg-emerald-100 text-emerald-600"
        />

        <AgendaMetric
          label="Confirmados"
          value={loading ? "…" : String(confirmados)}
          description="Aguardando horário"
          icon={<Clock3 size={21} />}
          className="bg-blue-100 text-blue-600"
        />

        <AgendaMetric
          label="Cancelados/Faltas"
          value={loading ? "…" : String(cancelados)}
          description="No dia"
          icon={<XCircle size={21} />}
          className="bg-red-100 text-red-600"
        />
      </div>

      <PageCard
        title="Agenda de Hoje"
        description={new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}
      >
        {loading ? (
          <p className="text-sm text-slate-400">Carregando…</p>
        ) : agendamentos.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum atendimento agendado para hoje.</p>
        ) : (
          <div className="space-y-3">
            {agendamentos.map(
              (appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPatient={() =>
                    appointment.paciente && handlePatient(
                      appointment.paciente.id
                    )
                  }
                  onEvolution={() =>
                    appointment.paciente && handleEvolution(
                      appointment.paciente.id,
                      appointment.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </PageCard>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: ApiAgendamento;
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
              {formatarHora(appointment.dataHora)}
            </span>

            {appointment.dataFim && (
              <span className="mt-1 text-xs">
                {formatarHora(appointment.dataFim)}
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPatient}
                className="text-left font-semibold text-slate-900 transition hover:text-indigo-600"
              >
                {appointment.paciente?.nome ?? "-"}
              </button>

              <AppointmentStatusBadge
                status={appointment.status}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <UserRound size={15} />
                {appointment.especialidade?.nome ??
                  appointment.profissional?.especialidades[0]?.especialidade.nome ??
                  ""}
              </span>

              <span>
                {appointment.servico?.nome ?? ""}
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

          {appointment.status !== "CANCELADO" &&
            appointment.status !== "FALTOU" && (
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
  status: ApiStatusAgendamento;
}

function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const styles: Record<
    ApiStatusAgendamento,
    string
  > = {
    AGUARDANDO:
      "bg-blue-100 text-blue-700",

    AGENDADO:
      "bg-amber-100 text-amber-700",

    EM_ATENDIMENTO:
      "bg-blue-100 text-blue-700",

    CONCLUIDO:
      "bg-emerald-100 text-emerald-700",

    CANCELADO:
      "bg-red-100 text-red-700",

    FALTOU:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
