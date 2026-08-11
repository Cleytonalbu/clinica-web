import {
  BarChart3,
  CalendarCheck2,
  Download,
  FileText,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getEvolutionsByPatientId,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getObjectivesByPatientId,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getPatientFinancialHistory,
} from "@/pages/Financeiro/financeStorage";

import {
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

type ReportType =
  | "clinical"
  | "objectives"
  | "attendance"
  | "financial";

interface PatientReport {
  id: number;
  type: ReportType;
  title: string;
  description: string;
  icon: typeof FileText;
  gestorOnly?: boolean;
}

/* =========================================
   RELATÓRIOS DISPONÍVEIS
========================================= */

const reports: PatientReport[] = [
  {
    id: 1,
    type: "clinical",
    title: "Relatório de Evolução Clínica",
    description:
      "Resumo das evoluções registradas no período selecionado.",
    icon: TrendingUp,
  },
  {
    id: 2,
    type: "objectives",
    title: "Relatório de Objetivos Terapêuticos",
    description:
      "Acompanhamento do progresso dos objetivos do plano terapêutico.",
    icon: Target,
  },
  {
    id: 3,
    type: "attendance",
    title: "Relatório de Frequência",
    description:
      "Presenças, faltas, cancelamentos e taxa de comparecimento.",
    icon: CalendarCheck2,
  },
  {
    id: 4,
    type: "financial",
    title: "Relatório Financeiro",
    description:
      "Histórico de cobranças, pagamentos e pendências do paciente.",
    icon: WalletCards,
    gestorOnly: true,
  },
];

/* =========================================
   COMPONENTE
========================================= */

export function PatientReports() {
  const { user } = useAuth();
  const { id } = useParams();

  const patientId = Number(id);

  const [period, setPeriod] =
    useState("ultimos90");

  const [specialty, setSpecialty] =
    useState("todas");

  const [format, setFormat] =
    useState("visualizacao");

  const [feedback, setFeedback] =
    useState<string | null>(null);

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile === "Gestor";

  const isProfissional =
    user?.profile === "Profissional";

  const canAccessReports =
    isGestor || isProfissional;

  /* =======================================
     ESPECIALIDADES
  ======================================= */

  const specialties =
    useMemo(
      () => getActiveSpecialties(),
      []
    );

  /* =======================================
     PERÍODO
  ======================================= */

  const periodRange =
    useMemo(
      () => getPeriodRange(period),
      [period]
    );

  /* =======================================
     DADOS REAIS
  ======================================= */

  const evolutions =
    useMemo(() => {
      if (
        !Number.isFinite(patientId) ||
        patientId <= 0
      ) {
        return [];
      }

      return getEvolutionsByPatientId(
        patientId
      ).filter(
        (evolution) =>
          matchesDateRange(
            evolution.sessionDate,
            periodRange
          ) &&
          matchesSpecialty(
            evolution.specialty,
            specialty
          )
      );
    }, [
      patientId,
      periodRange,
      specialty,
    ]);

  const objectives =
    useMemo(() => {
      if (
        !Number.isFinite(patientId) ||
        patientId <= 0
      ) {
        return [];
      }

      return getObjectivesByPatientId(
        patientId
      ).filter(
        (objective) =>
          matchesDateRange(
            objective.createdAt,
            periodRange
          ) &&
          matchesSpecialty(
            objective.specialty,
            specialty
          )
      );
    }, [
      patientId,
      periodRange,
      specialty,
    ]);

  const appointments =
    useMemo(() => {
      if (
        !Number.isFinite(patientId) ||
        patientId <= 0
      ) {
        return [];
      }

      return getSavedAppointments().filter(
        (appointment) =>
          appointment.patientId === patientId &&
          matchesDateRange(
            appointment.date,
            periodRange
          ) &&
          matchesSpecialty(
            appointment.specialty,
            specialty
          )
      );
    }, [
      patientId,
      periodRange,
      specialty,
    ]);

  const financialHistory =
    useMemo(() => {
      if (
        !isGestor ||
        !Number.isFinite(patientId) ||
        patientId <= 0
      ) {
        return [];
      }

      return getPatientFinancialHistory(
        patientId
      ).filter(
        (charge) =>
          matchesDateRange(
            charge.date,
            periodRange
          ) &&
          matchesSpecialty(
            charge.specialty,
            specialty
          )
      );
    }, [
      isGestor,
      patientId,
      periodRange,
      specialty,
    ]);

  /* =======================================
     INDICADORES
  ======================================= */

  const finalizedEvolutions =
    evolutions.filter(
      (evolution) =>
        evolution.status === "FINALIZADA"
    ).length;

  const activeObjectives =
    objectives.filter(
      (objective) =>
        objective.status !== "Atingido"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Realizado"
    ).length;

  const missedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Faltou"
    ).length;

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Cancelado"
    ).length;

  const attendanceBase =
    completedAppointments +
    missedAppointments;

  const attendanceRate =
    attendanceBase > 0
      ? Math.round(
          (completedAppointments /
            attendanceBase) *
            100
        )
      : 0;

  const pendingFinancial =
    financialHistory
      .filter(
        (charge) =>
          charge.status === "Pendente"
      )
      .reduce(
        (total, charge) =>
          total + charge.amount,
        0
      );

  /* =======================================
     RELATÓRIOS VISÍVEIS
  ======================================= */

  const visibleReports =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            !report.gestorOnly ||
            isGestor
        ),
      [isGestor]
    );

  /* =======================================
     AÇÕES
  ======================================= */

  function handleGenerateReport() {
    if (!canAccessReports) {
      return;
    }

    setFeedback(
      format === "pdf"
        ? "A geração do arquivo PDF será ativada quando o backend de relatórios estiver integrado."
        : "Os dados abaixo já representam a visualização do período e especialidade selecionados."
    );
  }

  function handleViewReport(
    report: PatientReport
  ) {
    if (!canAccessReports) {
      return;
    }

    setFeedback(
      buildReportFeedback(
        report.type,
        {
          finalizedEvolutions,
          activeObjectives,
          completedAppointments,
          missedAppointments,
          cancelledAppointments,
          attendanceRate,
          pendingFinancial,
        }
      )
    );
  }

  function handleGeneratePdf(
    report: PatientReport
  ) {
    if (!canAccessReports) {
      return;
    }

    setFeedback(
      `O relatório "${report.title}" está pronto para visualização com os dados atuais. A exportação real em PDF dependerá da integração com o backend.`
    );
  }

  /* =======================================
     SEGURANÇA
  ======================================= */

  if (!canAccessReports) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileText
          size={34}
          className="mx-auto text-slate-300"
        />

        <p className="mt-4 font-semibold text-slate-700">
          Relatórios indisponíveis
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Seu perfil não possui acesso aos relatórios deste paciente.
        </p>
      </div>
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Relatórios
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isProfissional
              ? "Consulte indicadores clínicos do acompanhamento do paciente."
              : "Consulte indicadores clínicos e financeiros do acompanhamento do paciente."}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGenerateReport}
        >
          <FileText size={18} />
          Gerar relatório
        </Button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
          {feedback}
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
          isGestor
            ? "xl:grid-cols-4"
            : "xl:grid-cols-3"
        }`}
      >
        <MetricCard
          title="Evoluções"
          value={String(
            finalizedEvolutions
          )}
          description="Finalizadas no período"
          icon={<TrendingUp size={22} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Objetivos ativos"
          value={String(
            activeObjectives
          )}
          description="Em acompanhamento"
          icon={<Target size={22} />}
          className="bg-violet-100 text-violet-600"
        />

        <MetricCard
          title="Presença"
          value={`${attendanceRate}%`}
          description={`${completedAppointments} realizadas • ${missedAppointments} faltas`}
          icon={
            <CalendarCheck2 size={22} />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        {isGestor && (
          <MetricCard
            title="Pendências"
            value={
              formatCurrency(
                pendingFinancial
              )
            }
            description="Cobranças pendentes"
            icon={<BarChart3 size={22} />}
            className="bg-amber-100 text-amber-600"
          />
        )}
      </div>

      <PageCard
        title="Filtros do relatório"
        description="Selecione o período e o tipo de informação."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Período
            </label>

            <Select
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value
                )
              }
            >
              <option value="ultimos30">
                Últimos 30 dias
              </option>

              <option value="ultimos60">
                Últimos 60 dias
              </option>

              <option value="ultimos90">
                Últimos 90 dias
              </option>

              <option value="ano">
                Ano atual
              </option>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Especialidade
            </label>

            <Select
              value={specialty}
              onChange={(event) =>
                setSpecialty(
                  event.target.value
                )
              }
            >
              <option value="todas">
                Todas
              </option>

              {specialties.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                )
              )}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Formato
            </label>

            <Select
              value={format}
              onChange={(event) =>
                setFormat(
                  event.target.value
                )
              }
            >
              <option value="visualizacao">
                Visualização na tela
              </option>

              <option value="pdf">
                PDF
              </option>
            </Select>
          </div>
        </div>
      </PageCard>

      <PageCard
        title="Frequência no período"
        description="Resumo dos atendimentos considerados para o paciente."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SmallMetric
            label="Realizados"
            value={String(
              completedAppointments
            )}
          />

          <SmallMetric
            label="Faltas"
            value={String(
              missedAppointments
            )}
          />

          <SmallMetric
            label="Cancelados"
            value={String(
              cancelledAppointments
            )}
          />

          <SmallMetric
            label="Taxa de presença"
            value={`${attendanceRate}%`}
          />
        </div>
      </PageCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {visibleReports.map(
          (report) => {
            const Icon =
              report.icon;

            return (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {report.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {report.description}
                    </p>

                    <p className="mt-4 text-xs text-slate-400">
                      Dados calculados conforme os filtros atuais.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleViewReport(
                        report
                      )
                    }
                  >
                    Visualizar
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      handleGeneratePdf(
                        report
                      )
                    }
                  >
                    <Download size={16} />
                    Gerar PDF
                  </Button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================
   CARD PRINCIPAL
========================================= */

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   MÉTRICA PEQUENA
========================================= */

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================
   PERÍODO
========================================= */

interface DateRange {
  start: Date;
  end: Date;
}

function getPeriodRange(
  period: string
): DateRange {
  const now =
    new Date();

  const end =
    new Date(now);

  end.setHours(
    23,
    59,
    59,
    999
  );

  if (
    period === "ano"
  ) {
    const start =
      new Date(
        now.getFullYear(),
        0,
        1,
        0,
        0,
        0,
        0
      );

    return {
      start,
      end,
    };
  }

  const days =
    period === "ultimos30"
      ? 30
      : period === "ultimos60"
        ? 60
        : 90;

  const start =
    new Date(now);

  start.setDate(
    start.getDate() -
      days
  );

  start.setHours(
    0,
    0,
    0,
    0
  );

  return {
    start,
    end,
  };
}

/* =========================================
   FILTRO DE DATA
========================================= */

function matchesDateRange(
  value: string,
  range: DateRange
) {
  if (!value) {
    return false;
  }

  const date =
    parseDate(value);

  if (!date) {
    return false;
  }

  return (
    date.getTime() >=
      range.start.getTime() &&
    date.getTime() <=
      range.end.getTime()
  );
}

/* =========================================
   FILTRO DE ESPECIALIDADE
========================================= */

function matchesSpecialty(
  itemSpecialty: string,
  selected: string
) {
  if (
    selected === "todas"
  ) {
    return true;
  }

  return (
    itemSpecialty
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      ) ===
    selected
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      )
  );
}

/* =========================================
   PARSE DE DATA
========================================= */

function parseDate(
  value: string
) {
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
      ? new Date(
          `${value}T12:00:00`
        )
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

/* =========================================
   FEEDBACK
========================================= */

function buildReportFeedback(
  type: ReportType,
  data: {
    finalizedEvolutions: number;
    activeObjectives: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointments: number;
    attendanceRate: number;
    pendingFinancial: number;
  }
) {
  if (
    type === "clinical"
  ) {
    return `Evoluções finalizadas no período: ${data.finalizedEvolutions}.`;
  }

  if (
    type === "objectives"
  ) {
    return `Objetivos ativos no período: ${data.activeObjectives}.`;
  }

  if (
    type === "attendance"
  ) {
    return `Realizados: ${data.completedAppointments}. Faltas: ${data.missedAppointments}. Cancelados: ${data.cancelledAppointments}. Taxa de presença: ${data.attendanceRate}%.`;
  }

  return `Pendências financeiras no período: ${formatCurrency(data.pendingFinancial)}.`;
}

/* =========================================
   MOEDA
========================================= */

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}