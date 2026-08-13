import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  FilterX,
  Goal,
  Printer,
  RefreshCcw,
  Share2,
  Stethoscope,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

/* =========================================
   TIPOS
========================================= */

type ReportType =
  | "atendimentos"
  | "financeiro"
  | "pacientes"
  | "profissionais";

interface ReportCardConfig {
  id:
    ReportType;

  title:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  tone:
    "purple"
    | "green"
    | "blue"
    | "orange";

  bullets:
    string[];

  route:
    string;
}

/* =========================================
   RELATÓRIOS DISPONÍVEIS
========================================= */

const reportCards:
  ReportCardConfig[] = [
  {
    id:
      "pacientes",

    title:
      "Relatório de Pacientes",

    description:
      "Visão completa dos atendimentos, faltas, equipe envolvida e situação financeira.",

    icon:
      <UsersRound
        size={26}
      />,

    tone:
      "purple",

    bullets: [
      "Atendimentos e frequência",
      "Objetivos terapêuticos",
      "Evoluções finalizadas",
      "Equipe envolvida",
      "Situação financeira",
    ],

    route:
      "/relatorios/pacientes",
  },

  {
    id:
      "atendimentos",

    title:
      "Relatório de Atendimentos",

    description:
      "Produção clínica, sessões realizadas, faltas e cancelamentos no período.",

    icon:
      <CalendarDays
        size={26}
      />,

    tone:
      "green",

    bullets: [
      "Sessões realizadas",
      "Comparecimento",
      "Faltas registradas",
      "Cancelamentos",
      "Produção por período",
    ],

    route:
      "/relatorios/atendimentos",
  },

  {
    id:
      "profissionais",

    title:
      "Relatório por Profissional",

    description:
      "Desempenho individual, pacientes atendidos e produção de cada profissional.",

    icon:
      <Stethoscope
        size={26}
      />,

    tone:
      "blue",

    bullets: [
      "Pacientes atendidos",
      "Sessões realizadas",
      "Produção individual",
      "Repasses pagos e pendentes",
      "Resumo por especialidade",
    ],

    route:
      "/relatorios/profissionais",
  },

  {
    id:
      "financeiro",

    title:
      "Relatório Financeiro",

    description:
      "Faturamento, recebimentos, despesas e resultado líquido da clínica.",

    icon:
      <CircleDollarSign
        size={26}
      />,

    tone:
      "orange",

    bullets: [
      "Faturamento gerado",
      "Valores recebidos",
      "Despesas registradas",
      "Repasses profissionais",
      "Resultado líquido real",
    ],

    route:
      "/relatorios/financeiro",
  },
];

/* =========================================
   PÁGINA
========================================= */

function parsePeriod(
  value:
    string
) {
  const matches =
    value.match(
      /(\d{2})\/(\d{2})\/(\d{4})\s*(?:até|a|-)\s*(\d{2})\/(\d{2})\/(\d{4})/i
    );

  if (
    !matches
  ) {
    return {
      startDate:
        "",
      endDate:
        "",
    };
  }

  return {
    startDate:
      `${matches[3]}-${matches[2]}-${matches[1]}`,

    endDate:
      `${matches[6]}-${matches[5]}-${matches[4]}`,
  };
}

export default function Relatorios() {
  const navigate =
    useNavigate();

  const [
    period,
    setPeriod,
  ] =
    useState(
      "01/08/2026 até 31/08/2026"
    );

  const [
    patient,
    setPatient,
  ] =
    useState(
      "Todos"
    );

  const [
    professional,
    setProfessional,
  ] =
    useState(
      "Todos"
    );

  const [
    reportType,
    setReportType,
  ] =
    useState<ReportType>(
      "atendimentos"
    );

  const selectedReport =
    useMemo(
      () =>
        reportCards.find(
          (
            report
          ) =>
            report.id ===
            reportType
        ) ??
        reportCards[0],
      [
        reportType,
      ]
    );

  function handleClearFilters() {
    setPeriod(
      "01/08/2026 até 31/08/2026"
    );

    setPatient(
      "Todos"
    );

    setProfessional(
      "Todos"
    );

    setReportType(
      "atendimentos"
    );
  }

  function handleGenerateReport() {
    const {
      startDate,
      endDate,
    } =
      parsePeriod(
        period
      );

    const params =
      new URLSearchParams();

    if (
      startDate
    ) {
      params.set(
        "startDate",
        startDate
      );
    }

    if (
      endDate
    ) {
      params.set(
        "endDate",
        endDate
      );
    }

    if (
      patient !==
      "Todos"
    ) {
      params.set(
        "patient",
        patient
      );
    }

    if (
      professional !==
      "Todos"
    ) {
      params.set(
        "professional",
        professional
      );
    }

    const query =
      params.toString();

    navigate(
      `${selectedReport.route}${query ? `?${query}` : ""}`
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
            Relatórios
          </h1>

          <p className="mt-1.5 text-sm font-medium text-[#7d89a8]">
            Gere relatórios completos com base nos dados registrados na clínica.
          </p>
        </div>

        {/* ================================= */}
        {/* FILTROS NO TOPO */}
        {/* ================================= */}

        <section className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.25fr_1fr_1fr_1fr_auto_auto]">
            <FilterField
              label="Período"
            >
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6847f5]"
                />

                <input
                  type="text"
                  value={
                    period
                  }
                  onChange={(
                    event
                  ) =>
                    setPeriod(
                      event.target
                        .value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-3 pr-9 text-xs font-semibold text-[#526080] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
                />
              </div>
            </FilterField>

            <FilterField
              label="Paciente"
            >
              <select
                value={
                  patient
                }
                onChange={(
                  event
                ) =>
                  setPatient(
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-3 text-xs font-semibold text-[#526080] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
              >
                <option value="Todos">
                  Todos os pacientes
                </option>

                <option value="Maria Oliveira">
                  Maria Oliveira
                </option>

                <option value="João Pedro">
                  João Pedro
                </option>

                <option value="Fernanda Souza">
                  Fernanda Souza
                </option>
              </select>
            </FilterField>

            <FilterField
              label="Profissional"
            >
              <select
                value={
                  professional
                }
                onChange={(
                  event
                ) =>
                  setProfessional(
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-3 text-xs font-semibold text-[#526080] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
              >
                <option value="Todos">
                  Todos os profissionais
                </option>

                <option value="Dra. Ana Paula">
                  Dra. Ana Paula
                </option>

                <option value="Dra. Camila Soares">
                  Dra. Camila Soares
                </option>

                <option value="Dra. Larissa Lima">
                  Dra. Larissa Lima
                </option>
              </select>
            </FilterField>

            <FilterField
              label="Tipo de relatório"
            >
              <select
                value={
                  reportType
                }
                onChange={(
                  event
                ) =>
                  setReportType(
                    event.target
                      .value as ReportType
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-3 text-xs font-semibold text-[#526080] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
              >
                <option value="atendimentos">
                  Atendimentos
                </option>

                <option value="financeiro">
                  Financeiro
                </option>

                <option value="pacientes">
                  Pacientes
                </option>

                <option value="profissionais">
                  Profissionais
                </option>
              </select>
            </FilterField>

            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e1e4ef] bg-white px-4 text-xs font-bold text-[#657295] transition hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef] xl:w-auto"
              >
                <FilterX
                  size={16}
                />

                Limpar filtros
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  handleGenerateReport
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(103,66,246,0.18)] transition hover:opacity-95 xl:w-auto"
              >
                <Download
                  size={16}
                />

                Gerar relatório
              </button>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* ÁREA PRINCIPAL */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* ================================= */}
          {/* RELATÓRIOS DISPONÍVEIS */}
          {/* ================================= */}

          <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
            <div>
              <h2 className="text-lg font-extrabold text-[#10235f]">
                Relatórios disponíveis
              </h2>

              <p className="mt-1 text-xs font-medium text-[#8a95b4]">
                Selecione o tipo de relatório que deseja consultar.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {reportCards.map(
                (
                  report
                ) => (
                  <ReportCard
                    key={
                      report.id
                    }
                    report={
                      report
                    }
                    onClick={() =>
                      navigate(
                        report.route
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* ================================= */}
          {/* COLUNA LATERAL */}
          {/* ================================= */}

          <div className="space-y-5">
            {/* RELATÓRIO RÁPIDO */}

            <section className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
              <h2 className="text-base font-extrabold text-[#10235f]">
                Gerar relatório rápido
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#8a95b4]">
                Escolha uma opção para facilitar.
              </p>

              <div className="mt-4 space-y-2">
                {reportCards.map(
                  (
                    report
                  ) => (
                    <QuickReportButton
                      key={
                        report.id
                      }
                      report={
                        report
                      }
                      onClick={() =>
                        navigate(
                          report.route
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* EXPORTAR */}

            <section className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
              <h2 className="text-base font-extrabold text-[#10235f]">
                Exportar relatórios
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#8a95b4]">
                Escolha o formato desejado.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <ExportButton
                  label="PDF"
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                  tone="red"
                />

                <ExportButton
                  label="Excel"
                  icon={
                    <FileSpreadsheet
                      size={18}
                    />
                  }
                  tone="green"
                />

                <ExportButton
                  label="Imprimir"
                  icon={
                    <Printer
                      size={18}
                    />
                  }
                  tone="purple"
                  onClick={() =>
                    window.print()
                  }
                />
              </div>

              <button
                type="button"
                className="mt-3 flex w-full items-center gap-3 rounded-xl border border-[#e8eaf3] bg-[#fbfbfe] px-3 py-3 text-left transition hover:bg-[#f8f6ff]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
                  <Share2
                    size={16}
                  />
                </span>

                <span>
                  <strong className="block text-xs text-[#263765]">
                    Compartilhar
                  </strong>

                  <small className="mt-0.5 block text-[9px] text-[#8a95b4]">
                    Enviar por e-mail ou link
                  </small>
                </span>
              </button>
            </section>
          </div>
        </div>

        {/* ================================= */}
        {/* CONTEÚDO DOS RELATÓRIOS */}
        {/* ================================= */}

        <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <h2 className="text-base font-extrabold text-[#10235f]">
            Todos os relatórios incluem os seguintes dados
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
            {/* LISTA */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ReportInfoItem
                icon={
                  <UserRound
                    size={15}
                  />
                }
                label="Perfil do paciente"
              />

              <ReportInfoItem
                icon={
                  <BarChart3
                    size={15}
                  />
                }
                label="Indicadores e produção"
              />

              <ReportInfoItem
                icon={
                  <Stethoscope
                    size={15}
                  />
                }
                label="Especialidades em acompanhamento"
              />

              <ReportInfoItem
                icon={
                  <FileBarChart2
                    size={15}
                  />
                }
                label="Gráficos e evolução"
              />

              <ReportInfoItem
                icon={
                  <Target
                    size={15}
                  />
                }
                label="Objetivos e acompanhamento"
              />

              <ReportInfoItem
                icon={
                  <CalendarDays
                    size={15}
                  />
                }
                label="Frequência, faltas e sessões"
              />

              <ReportInfoItem
                icon={
                  <Goal
                    size={15}
                  />
                }
                label="Resultados por período"
              />

              <ReportInfoItem
                icon={
                  <CircleDollarSign
                    size={15}
                  />
                }
                label="Dados financeiros"
              />
            </div>

            {/* RESUMO VISUAL */}

            <div className="rounded-2xl bg-[#fbfbfe] p-4">
              <p className="text-xs font-extrabold text-[#526080]">
                Exemplo: distribuição de frequência
              </p>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
                <div
                  className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#2daf82 0deg 327.6deg, #eb5771 327.6deg 338.4deg, #ed982f 338.4deg 349.2deg, #3b91ed 349.2deg 360deg)",
                  }}
                >
                  <div className="h-[90px] w-[90px] rounded-full bg-white" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric
                    title="Sessões realizadas"
                    value="582"
                    tone="green"
                  />

                  <MiniMetric
                    title="Faltas"
                    value="18"
                    tone="red"
                  />

                  <MiniMetric
                    title="Cancelamentos"
                    value="22"
                    tone="orange"
                  />

                  <MiniMetric
                    title="Comparecimento"
                    value="91%"
                    tone="purple"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* RODAPÉ INFORMATIVO */}
        {/* ================================= */}

        <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e2ff] bg-gradient-to-r from-[#f4f0ff] via-[#f8f5ff] to-[#fbf9ff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
              <RefreshCcw
                size={17}
              />
            </span>

            <p className="text-xs font-medium text-[#657196]">
              Os relatórios utilizam os dados registrados no sistema.
            </p>
          </div>

          <span className="text-xs font-bold text-[#6847f5]">
            Última atualização: agora
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CAMPO DE FILTRO
========================================= */

function FilterField({
  label,
  children,
}: {
  label:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-wide text-[#6847f5]">
        {
          label
        }
      </label>

      {
        children
      }
    </div>
  );
}

/* =========================================
   CARD DO RELATÓRIO
========================================= */

function ReportCard({
  report,
  onClick,
}: {
  report:
    ReportCardConfig;

  onClick:
    () => void;
}) {
  const tone =
    getTone(
      report.tone
    );

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="group relative min-h-[245px] rounded-2xl border border-[#e8eaf3] bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#dcd6ff] hover:shadow-[0_10px_28px_rgba(61,72,126,0.08)]"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
        >
          {
            report.icon
          }
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-[#263765]">
            {
              report.title
            }
          </h3>

          <p className="mt-1.5 text-[11px] leading-5 text-[#7d89a8]">
            {
              report.description
            }
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {report.bullets.map(
          (
            bullet
          ) => (
            <div
              key={
                bullet
              }
              className="flex items-center gap-2 text-[10px] font-medium text-[#667394]"
            >
              <Check
                size={13}
                className="text-[#2daf82]"
              />

              {
                bullet
              }
            </div>
          )
        )}
      </div>

      <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e3ef] bg-white text-[#6847f5] transition group-hover:translate-x-0.5 group-hover:border-[#cfc7ff]">
        <ChevronRight
          size={17}
        />
      </span>
    </button>
  );
}

/* =========================================
   RELATÓRIO RÁPIDO
========================================= */

function QuickReportButton({
  report,
  onClick,
}: {
  report:
    ReportCardConfig;

  onClick:
    () => void;
}) {
  const tone =
    getTone(
      report.tone
    );

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 rounded-xl border border-[#edf0f5] bg-[#fbfbfe] px-3 py-3 text-left transition hover:border-[#ddd8ff] hover:bg-[#f9f7ff]"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
      >
        {
          report.icon
        }
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block truncate text-[10px] text-[#263765]">
          {
            report.title
          }
        </strong>

        <small className="mt-0.5 block truncate text-[8px] text-[#8a95b4]">
          Abrir relatório
        </small>
      </span>

      <ChevronRight
        size={15}
        className="text-[#6847f5]"
      />
    </button>
  );
}

/* =========================================
   EXPORTAÇÃO
========================================= */

function ExportButton({
  label,
  icon,
  tone,
  onClick,
}: {
  label:
    string;

  icon:
    React.ReactNode;

  tone:
    "red"
    | "green"
    | "purple";

  onClick?:
    () => void;
}) {
  const styles = {
    red:
      "bg-[#fff0f3] text-[#df4e67]",

    green:
      "bg-[#e8f8f1] text-[#269d75]",

    purple:
      "bg-[#eeeaff] text-[#6847f5]",
  }[tone];

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="rounded-xl border border-[#e8eaf3] bg-white p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <span
        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${styles}`}
      >
        {
          icon
        }
      </span>

      <span className="mt-2 block text-[9px] font-extrabold text-[#526080]">
        {
          label
        }
      </span>
    </button>
  );
}

/* =========================================
   ITEM DE INFORMAÇÃO
========================================= */

function ReportInfoItem({
  icon,
  label,
}: {
  icon:
    React.ReactNode;

  label:
    string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#fbfbfe] px-3 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eeeaff] text-[#6847f5]">
        {
          icon
        }
      </span>

      <span className="text-[10px] font-semibold text-[#657196]">
        {
          label
        }
      </span>
    </div>
  );
}

/* =========================================
   MINI MÉTRICA
========================================= */

function MiniMetric({
  title,
  value,
  tone,
}: {
  title:
    string;

  value:
    string;

  tone:
    "green"
    | "red"
    | "orange"
    | "purple";
}) {
  const styles = {
    green:
      "border-[#dcefe8] bg-[#f7fcfa] text-[#269d75]",

    red:
      "border-[#f6dde3] bg-[#fff9fa] text-[#df4e67]",

    orange:
      "border-[#f5e4cf] bg-[#fffaf4] text-[#dc8a27]",

    purple:
      "border-[#e8e2ff] bg-[#faf8ff] text-[#6847f5]",
  }[tone];

  return (
    <div
      className={`rounded-xl border p-3 ${styles}`}
    >
      <p className="text-[8px] font-semibold opacity-70">
        {
          title
        }
      </p>

      <p className="mt-1 text-lg font-extrabold">
        {
          value
        }
      </p>
    </div>
  );
}

/* =========================================
   TONS
========================================= */

function getTone(
  tone:
    ReportCardConfig["tone"]
) {
  const tones = {
    purple: {
      icon:
        "bg-[#eeeaff] text-[#6847f5]",
    },

    green: {
      icon:
        "bg-[#e8f8f1] text-[#269d75]",
    },

    blue: {
      icon:
        "bg-[#eaf4ff] text-[#3984dc]",
    },

    orange: {
      icon:
        "bg-[#fff3e4] text-[#df8a27]",
    },
  };

  return tones[
    tone
  ];
}