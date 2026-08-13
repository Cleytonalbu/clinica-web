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
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  useParams,
} from "react-router-dom";

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
  getProfessionalSpecialty,
} from "@/pages/Pacientes/patientAccessRules";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  PatientIndividualReportDocument,
  PATIENT_INDIVIDUAL_REPORT_STYLES,
  type PatientIndividualReportType,
} from "@/components/relatorios/PatientIndividualReportDocument";

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

  const {
    id,
  } = useParams();

  const patientId =
    Number(
      id
    );

  const patient =
    getPatientById(
      patientId
    );

  const [
    activeReport,
    setActiveReport,
  ] =
    useState<
      PatientIndividualReportType |
      null
    >(
      null
    );

  const [
    previewOpen,
    setPreviewOpen,
  ] =
    useState(
      false
    );

  const [
    printRequested,
    setPrintRequested,
  ] =
    useState(
      false
    );

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

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const professionalSpecialty =
    isProfissional
      ? getProfessionalSpecialty(
          loggedProfessionalName
        )
      : "";

  /*
   * Esta aba já não aparece para
   * a Recepção.
   */

  const canAccessReports =
    isGestor ||
    isProfissional;

  const accessibleEvolutions =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        const all =
          getEvolutionsByPatientId(
            patientId
          );

        if (
          !isProfissional
        ) {
          return all;
        }

        return all.filter(
          (
            evolution
          ) =>
            evolution.professional ===
              loggedProfessionalName &&
            (
              !professionalSpecialty ||
              evolution.specialty ===
                professionalSpecialty
            )
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
        patientId,
        professionalSpecialty,
      ]
    );

  const accessibleObjectives =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        const all =
          getObjectivesByPatientId(
            patientId
          );

        if (
          !isProfissional
        ) {
          return all;
        }

        return all.filter(
          (
            objective
          ) =>
            objective.professional ===
              loggedProfessionalName &&
            (
              !professionalSpecialty ||
              objective.specialty ===
                professionalSpecialty
            )
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
        patientId,
        professionalSpecialty,
      ]
    );

  const accessibleAppointments =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        return getSavedAppointments().filter(
          (
            appointment
          ) =>
            appointment.patientId ===
              patientId &&
            (
              !isProfissional ||
              (
                appointment.professional ===
                  loggedProfessionalName &&
                (
                  !professionalSpecialty ||
                  appointment.specialty ===
                    professionalSpecialty
                )
              )
            )
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
        patientId,
        professionalSpecialty,
      ]
    );

  const completedAppointments =
    accessibleAppointments.filter(
      (
        appointment
      ) =>
        appointment.status ===
        "Realizado"
    ).length;

  const attendanceBase =
    accessibleAppointments.filter(
      (
        appointment
      ) =>
        appointment.status ===
          "Realizado" ||
        appointment.status ===
          "Faltou"
    ).length;

  const attendanceRate =
    attendanceBase > 0
      ? Math.round(
          (
            completedAppointments /
            attendanceBase
          ) * 100
        )
      : 0;

  const periodRange =
    useMemo(
      () =>
        getReportPeriodRange(
          period
        ),
      [
        period,
      ]
    );

  const effectiveSpecialty =
    isProfissional
      ? professionalSpecialty
      : specialty;

  const filteredEvolutions =
    useMemo(
      () =>
        accessibleEvolutions.filter(
          (
            evolution
          ) =>
            isDateInRange(
              evolution.sessionDate,
              periodRange
            ) &&
            (
              !effectiveSpecialty ||
              effectiveSpecialty ===
                "todas" ||
              normalizeSpecialty(
                evolution.specialty
              ) ===
                normalizeSpecialty(
                  effectiveSpecialty
                )
            )
        ),
      [
        accessibleEvolutions,
        effectiveSpecialty,
        periodRange,
      ]
    );

  const filteredObjectives =
    useMemo(
      () =>
        accessibleObjectives.filter(
          (
            objective
          ) =>
            isDateInRange(
              objective.startDate,
              periodRange
            ) &&
            (
              !effectiveSpecialty ||
              effectiveSpecialty ===
                "todas" ||
              normalizeSpecialty(
                objective.specialty
              ) ===
                normalizeSpecialty(
                  effectiveSpecialty
                )
            )
        ),
      [
        accessibleObjectives,
        effectiveSpecialty,
        periodRange,
      ]
    );

  const filteredAppointments =
    useMemo(
      () =>
        accessibleAppointments.filter(
          (
            appointment
          ) =>
            isDateInRange(
              appointment.date,
              periodRange
            ) &&
            (
              !effectiveSpecialty ||
              effectiveSpecialty ===
                "todas" ||
              normalizeSpecialty(
                appointment.specialty
              ) ===
                normalizeSpecialty(
                  effectiveSpecialty
                )
            )
        ),
      [
        accessibleAppointments,
        effectiveSpecialty,
        periodRange,
      ]
    );

  const filteredCompleted =
    filteredAppointments.filter(
      (
        appointment
      ) =>
        appointment.status ===
        "Realizado"
    ).length;

  const filteredMissed =
    filteredAppointments.filter(
      (
        appointment
      ) =>
        appointment.status ===
        "Faltou"
    ).length;

  const filteredAttendanceBase =
    filteredCompleted +
    filteredMissed;

  const filteredAttendanceRate =
    filteredAttendanceBase > 0
      ? Math.round(
          (
            filteredCompleted /
            filteredAttendanceBase
          ) * 100
        )
      : 0;

  const periodLabel =
    getReportPeriodLabel(
      period,
      periodRange
    );

  useEffect(
    () => {
      if (
        !printRequested ||
        !activeReport
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          () => {
            window.print();

            setPrintRequested(
              false
            );
          },
          100
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      activeReport,
      printRequested,
    ]
  );

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

    setActiveReport(
      "complete"
    );

    if (
      format ===
      "visualizacao"
    ) {
      setPreviewOpen(
        true
      );

      setPrintRequested(
        false
      );

      return;
    }

    setPreviewOpen(
      false
    );

    setPrintRequested(
      true
    );
  }

  /* =======================================
     VISUALIZAR
  ======================================= */

  function handleViewReport(
    report: PatientReport
  ) {
    if (
      !canAccessReports ||
      report.type ===
        "financial"
    ) {
      return;
    }

    setActiveReport(
      report.type
    );

    setPreviewOpen(
      true
    );
  }

  /* =======================================
     GERAR PDF
  ======================================= */

  function handleGeneratePdf(
    report: PatientReport
  ) {
    if (
      !canAccessReports ||
      report.type ===
        "financial"
    ) {
      return;
    }

    setActiveReport(
      report.type
    );

    setPreviewOpen(
      false
    );

    setPrintRequested(
      true
    );
  }

  function handlePrintActiveReport() {
    if (
      !activeReport
    ) {
      return;
    }

    setPreviewOpen(
      false
    );

    setPrintRequested(
      true
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
      <style>
        {
          PATIENT_INDIVIDUAL_REPORT_STYLES
        }
      </style>

      {activeReport && (
        <PatientIndividualReportDocument
          type={
            activeReport
          }
          patientName={
            patient?.name ??
            `Paciente #${patientId}`
          }
          patientId={
            patientId
          }
          specialty={
            effectiveSpecialty ===
            "todas"
              ? "Todas"
              : effectiveSpecialty
          }
          periodLabel={
            periodLabel
          }
          professionalName={
            isProfissional
              ? loggedProfessionalName
              : "Equipe clínica"
          }
          evolutions={
            filteredEvolutions
          }
          objectives={
            filteredObjectives
          }
          appointments={
            filteredAppointments
          }
        />
      )}

      {activeReport &&
        previewOpen && (
          <PatientIndividualReportDocument
            type={
              activeReport
            }
            patientName={
              patient?.name ??
              `Paciente #${patientId}`
            }
            patientId={
              patientId
            }
            specialty={
              effectiveSpecialty ===
              "todas"
                ? "Todas"
                : effectiveSpecialty
            }
            periodLabel={
              periodLabel
            }
            professionalName={
              isProfissional
                ? loggedProfessionalName
                : "Equipe clínica"
            }
            evolutions={
              filteredEvolutions
            }
            objectives={
              filteredObjectives
            }
            appointments={
              filteredAppointments
            }
            preview
            onClose={() =>
              setPreviewOpen(
                false
              )
            }
            onPrint={
              handlePrintActiveReport
            }
          />
        )}
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

          {isProfissional && (
            <p className="mt-2 text-xs font-semibold text-violet-600">
              Relatórios restritos às suas evoluções, objetivos e atendimentos de {professionalSpecialty || "sua especialidade"}.
            </p>
          )}
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

          Gerar relatório consolidado
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
          value={String(
            filteredEvolutions.filter(
              (
                evolution
              ) =>
                evolution.status ===
                "FINALIZADA"
            ).length
          )}
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
          value={String(
            filteredObjectives.length
          )}
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
          value={`${filteredAttendanceRate}%`}
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

            {isProfissional ? (
              <Select
                value={
                  professionalSpecialty
                }
                disabled
              >
                <option
                  value={
                    professionalSpecialty
                  }
                >
                  {professionalSpecialty || "Sua especialidade"}
                </option>
              </Select>
            ) : (
              <Select
                value={
                  specialty
                }
                onChange={(
                  event
                ) =>
                  setSpecialty(
                    event.target.value
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
            )}
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
                      Dados calculados conforme os filtros atuais.
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

interface ReportPeriodRange {
  start: string;
  end: string;
}

function getReportPeriodRange(
  period: string
): ReportPeriodRange {
  const today =
    new Date();

  const end =
    formatIsoDate(
      today
    );

  if (
    period === "ano"
  ) {
    return {
      start:
        `${today.getFullYear()}-01-01`,
      end,
    };
  }

  const days =
    period === "ultimos30"
      ? 30
      : period === "ultimos60"
        ? 60
        : 90;

  const startDate =
    new Date(
      today
    );

  startDate.setDate(
    startDate.getDate() -
      (days - 1)
  );

  return {
    start:
      formatIsoDate(
        startDate
      ),
    end,
  };
}

function getReportPeriodLabel(
  period: string,
  range: ReportPeriodRange
) {
  const dates =
    `${formatDisplayDate(range.start)} a ${formatDisplayDate(range.end)}`;

  if (
    period === "ultimos30"
  ) {
    return `Últimos 30 dias (${dates})`;
  }

  if (
    period === "ultimos60"
  ) {
    return `Últimos 60 dias (${dates})`;
  }

  if (
    period === "ano"
  ) {
    return `Ano atual (${dates})`;
  }

  if (
    period === "personalizado"
  ) {
    return `Período selecionado (${dates})`;
  }

  return `Últimos 90 dias (${dates})`;
}

function isDateInRange(
  value: string,
  range: ReportPeriodRange
) {
  return (
    Boolean(
      value
    ) &&
    value >=
      range.start &&
    value <=
      range.end
  );
}

function normalizeSpecialty(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      ""
    );
}

function formatIsoDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  return year &&
    month &&
    day
      ? `${day}/${month}/${year}`
      : value;
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