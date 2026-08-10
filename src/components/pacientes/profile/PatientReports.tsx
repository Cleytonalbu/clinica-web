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
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  PageCard,
  Select,
} from "@/components/ui";

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

  updatedAt: string;

  gestorOnly?: boolean;
}

/* =========================================
   RELATÓRIOS
========================================= */

const reports: PatientReport[] = [
  {
    id: 1,

    type:
      "clinical",

    title:
      "Relatório de Evolução Clínica",

    description:
      "Resumo das evoluções registradas no período selecionado.",

    icon:
      TrendingUp,

    updatedAt:
      "07/08/2026",
  },

  {
    id: 2,

    type:
      "objectives",

    title:
      "Relatório de Objetivos Terapêuticos",

    description:
      "Acompanhamento do progresso dos objetivos do plano terapêutico.",

    icon:
      Target,

    updatedAt:
      "07/08/2026",
  },

  {
    id: 3,

    type:
      "attendance",

    title:
      "Relatório de Frequência",

    description:
      "Presenças, faltas, cancelamentos e taxa de comparecimento.",

    icon:
      CalendarCheck2,

    updatedAt:
      "06/08/2026",
  },

  {
    id: 4,

    type:
      "financial",

    title:
      "Relatório Financeiro",

    description:
      "Histórico de cobranças, pagamentos e pendências do paciente.",

    icon:
      WalletCards,

    updatedAt:
      "05/08/2026",

    gestorOnly:
      true,
  },
];

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientReports() {
  const {
    user,
  } = useAuth();

  const [
    period,
    setPeriod,
  ] = useState(
    "ultimos90"
  );

  const [
    specialty,
    setSpecialty,
  ] = useState(
    "todas"
  );

  const [
    format,
    setFormat,
  ] = useState(
    "pdf"
  );

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isProfissional =
    user?.profile ===
    "Profissional";

  /*
   * Esta aba já não aparece para
   * a Recepção.
   */

  const canAccessReports =
    isGestor ||
    isProfissional;

  /* =======================================
     RELATÓRIOS VISÍVEIS
  ======================================= */

  const visibleReports =
    useMemo(
      () => {
        return reports.filter(
          (
            report
          ) => {
            if (
              report.gestorOnly
            ) {
              return isGestor;
            }

            return true;
          }
        );
      },
      [
        isGestor,
      ]
    );

  /* =======================================
     GERAR RELATÓRIO GERAL
  ======================================= */

  function handleGenerateReport() {
    if (
      !canAccessReports
    ) {
      return;
    }

    /*
     * Futuramente estes dados serão
     * enviados para a API.
     */

    console.log(
      "Gerar relatório",
      {
        period,
        specialty,
        format,
      }
    );
  }

  /* =======================================
     VISUALIZAR
  ======================================= */

  function handleViewReport(
    report: PatientReport
  ) {
    if (
      !canAccessReports
    ) {
      return;
    }

    /*
     * Futuramente abriremos uma tela
     * de pré-visualização do relatório.
     */

    console.log(
      "Visualizar relatório:",
      report.id
    );
  }

  /* =======================================
     GERAR PDF
  ======================================= */

  function handleGeneratePdf(
    report: PatientReport
  ) {
    if (
      !canAccessReports
    ) {
      return;
    }

    /*
     * Futuramente o backend vai gerar
     * o PDF real utilizando os dados
     * do paciente e do período.
     */

    console.log(
      "Gerar PDF:",
      {
        reportId:
          report.id,

        period,

        specialty,
      }
    );
  }

  /* =======================================
     SEGURANÇA EXTRA
  ======================================= */

  if (
    !canAccessReports
  ) {
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
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Relatórios
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isProfissional
              ? "Gere e consulte relatórios clínicos do acompanhamento do paciente."
              : "Gere e consulte relatórios consolidados do acompanhamento do paciente."}
          </p>
        </div>

        <Button
          type="button"
          onClick={
            handleGenerateReport
          }
        >
          <FileText
            size={
              18
            }
          />

          Gerar relatório
        </Button>
      </div>

      {/* ================================= */}
      {/* INDICADORES */}
      {/* ================================= */}

      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
          isGestor
            ? "xl:grid-cols-4"
            : "xl:grid-cols-3"
        }`}
      >
        <MetricCard
          title="Evoluções"
          value="128"
          icon={
            <TrendingUp
              size={
                22
              }
            />
          }
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Objetivos"
          value="6"
          icon={
            <Target
              size={
                22
              }
            />
          }
          className="bg-violet-100 text-violet-600"
        />

        <MetricCard
          title="Presenças"
          value="92%"
          icon={
            <CalendarCheck2
              size={
                22
              }
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        {isGestor && (
          <MetricCard
            title="Relatórios"
            value="12"
            icon={
              <BarChart3
                size={
                  22
                }
              />
            }
            className="bg-amber-100 text-amber-600"
          />
        )}
      </div>

      {/* ================================= */}
      {/* FILTROS */}
      {/* ================================= */}

      <PageCard
        title="Filtros do relatório"
        description="Selecione o período e o tipo de informação."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* ============================= */}
          {/* PERÍODO */}
          {/* ============================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Período
            </label>

            <Select
              value={
                period
              }
              onChange={(
                event
              ) =>
                setPeriod(
                  event
                    .target
                    .value
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

              <option value="personalizado">
                Período personalizado
              </option>
            </Select>
          </div>

          {/* ============================= */}
          {/* ESPECIALIDADE */}
          {/* ============================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Especialidade
            </label>

            <Select
              value={
                specialty
              }
              onChange={(
                event
              ) =>
                setSpecialty(
                  event
                    .target
                    .value
                )
              }
            >
              <option value="todas">
                Todas
              </option>

              <option value="psicologia">
                Psicologia
              </option>

              <option value="fono">
                Fonoaudiologia
              </option>

              <option value="to">
                Terapia Ocupacional
              </option>

              <option value="fisio">
                Fisioterapia
              </option>
            </Select>
          </div>

          {/* ============================= */}
          {/* FORMATO */}
          {/* ============================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Formato
            </label>

            <Select
              value={
                format
              }
              onChange={(
                event
              ) =>
                setFormat(
                  event
                    .target
                    .value
                )
              }
            >
              <option value="pdf">
                PDF
              </option>

              <option value="visualizacao">
                Visualização na tela
              </option>
            </Select>
          </div>
        </div>
      </PageCard>

      {/* ================================= */}
      {/* RELATÓRIOS DISPONÍVEIS */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {visibleReports.map(
          (
            report
          ) => {
            const Icon =
              report.icon;

            return (
              <div
                key={
                  report.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* ========================= */}
                {/* CABEÇALHO DO CARD */}
                {/* ========================= */}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Icon
                      size={
                        22
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {
                        report.title
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {
                        report.description
                      }
                    </p>

                    <p className="mt-4 text-xs text-slate-400">
                      Atualizado em{" "}
                      {
                        report.updatedAt
                      }
                    </p>
                  </div>
                </div>

                {/* ========================= */}
                {/* AÇÕES */}
                {/* ========================= */}

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
                    <Download
                      size={
                        16
                      }
                    />

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
   CARD DE MÉTRICA
========================================= */

interface MetricCardProps {
  title:
    string;

  value:
    string;

  icon:
    React.ReactNode;

  className:
    string;
}

function MetricCard({
  title,

  value,

  icon,

  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {
              title
            }
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              value
            }
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}