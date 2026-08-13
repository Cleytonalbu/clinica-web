import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

/* =========================================
   TIPOS
========================================= */

export interface PatientReportDocumentItem {
  patientId: number;

  patient: string;

  appointments: number;

  realized: number;

  absent: number;

  cancelled: number;

  scheduled: number;

  professionals: string[];

  specialties: string[];

  billed: number;

  paid: number;

  pending: number;

  objectives: number;

  achievedObjectives: number;

  evolutions: number;
}

interface PatientReportDocumentProps {
  startDate: string;

  endDate: string;

  searchFilter: string;

  situationFilter: string;

  report:
    PatientReportDocumentItem[];

  totalPatients: number;

  totalAppointments: number;

  totalRealized: number;

  totalAbsences: number;

  totalPending: number;

  averageAppointments: string;
}

/* =========================================
   DOCUMENTO
========================================= */

export function PatientReportDocument({
  startDate,
  endDate,
  searchFilter,
  situationFilter,
  report,
  totalPatients,
  totalAppointments,
  totalRealized,
  totalAbsences,
  totalPending,
  averageAppointments,
}: PatientReportDocumentProps) {
  const totalCancelled =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.cancelled,
      0
    );

  const totalObjectives =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.objectives,
      0
    );

  const achievedObjectives =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.achievedObjectives,
      0
    );

  const evolvingObjectives =
    Math.max(
      0,
      totalObjectives -
        achievedObjectives
    );

  const totalEvolutions =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.evolutions,
      0
    );

  const billed =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.billed,
      0
    );

  const paid =
    report.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.paid,
      0
    );

  const realizationRate =
    totalAppointments >
    0
      ? Math.round(
          (
            totalRealized /
            totalAppointments
          ) *
            100
        )
      : 0;

  const attendanceBase =
    totalRealized +
    totalAbsences;

  const attendanceRate =
    attendanceBase >
    0
      ? Math.round(
          (
            totalRealized /
            attendanceBase
          ) *
            100
        )
      : 0;

  const objectiveAchievementRate =
    totalObjectives >
    0
      ? Math.round(
          (
            achievedObjectives /
            totalObjectives
          ) *
            100
        )
      : 0;

  const patientWithMostAppointments =
    [...report].sort(
      (
        a,
        b
      ) =>
        b.appointments -
        a.appointments
    )[0];

  const generatedAt =
    new Date();

  return (
    <article className="patient-report-document">
      <header className="patient-document-header">
        <div className="patient-brand-line">
          <div className="patient-brand-mark">
            EA
          </div>

          <div>
            <p className="patient-brand-kicker">
              CLÍNICA INTEGRADA
            </p>

            <p className="patient-brand-name">
              Entre Afetos
            </p>
          </div>
        </div>

        <div className="patient-document-meta">
          <p>
            Relatório gerencial
          </p>

          <strong>
            Pacientes
          </strong>
        </div>
      </header>

      <section className="patient-document-title">
        <div>
          <p className="patient-eyebrow">
            ACOMPANHAMENTO CLÍNICO
          </p>

          <h1>
            Relatório de Pacientes
          </h1>

          <p className="patient-subtitle">
            Consolidado de atendimentos, frequência, objetivos terapêuticos, evoluções e situação financeira.
          </p>
        </div>

        <div className="patient-period-box">
          <span>
            Período analisado
          </span>

          <strong>
            {formatDate(
              startDate
            )}{" "}
            a{" "}
            {formatDate(
              endDate
            )}
          </strong>

          <small>
            Gerado em{" "}
            {generatedAt.toLocaleString(
              "pt-BR"
            )}
          </small>
        </div>
      </section>

      <section className="patient-filter-summary">
        <span>
          <strong>
            Pesquisa:
          </strong>{" "}
          {searchFilter ||
            "Todos os pacientes"}
        </span>

        <span>
          <strong>
            Situação:
          </strong>{" "}
          {situationFilter}
        </span>
      </section>

      <section className="patient-document-section">
        <SectionTitle
          number="01"
          title="Resumo executivo"
          subtitle="Indicadores gerais do acompanhamento no período."
        />

        <div className="patient-metrics-grid">
          <Metric
            label="Pacientes"
            value={String(
              totalPatients
            )}
            note="acompanhados no período"
          />

          <Metric
            label="Atendimentos"
            value={String(
              totalAppointments
            )}
            note={`${averageAppointments} por paciente`}
          />

          <Metric
            label="Realizados"
            value={String(
              totalRealized
            )}
            note={`${realizationRate}% do total`}
          />

          <Metric
            label="Evoluções"
            value={String(
              totalEvolutions
            )}
            note="registros finalizados"
          />

          <Metric
            label="Objetivos"
            value={String(
              totalObjectives
            )}
            note={`${achievedObjectives} atingidos`}
          />

          <Metric
            label="A receber"
            value={formatCurrency(
              totalPending
            )}
            note="pendências financeiras"
          />
        </div>
      </section>

      <section className="patient-document-section patient-two-columns">
        <div>
          <SectionTitle
            number="02"
            title="Frequência e comparecimento"
            subtitle="Distribuição dos atendimentos por situação."
          />

          <AttendanceChart
            realized={
              totalRealized
            }
            absent={
              totalAbsences
            }
            cancelled={
              totalCancelled
            }
          />
        </div>

        <div>
          <SectionTitle
            number="03"
            title="Objetivos terapêuticos"
            subtitle="Situação consolidada dos objetivos cadastrados."
          />

          <ObjectiveChart
            achieved={
              achievedObjectives
            }
            evolving={
              evolvingObjectives
            }
          />
        </div>
      </section>

      <section className="patient-document-section">
        <SectionTitle
          number="04"
          title="Pacientes com maior volume de atendimentos"
          subtitle="Comparativo do número de atendimentos registrados no período."
        />

        <PatientBars
          patients={
            report
          }
        />
      </section>

      <section className="patient-document-section">
        <SectionTitle
          number="05"
          title="Análise do período"
          subtitle="Leitura automática dos principais indicadores clínicos e operacionais."
        />

        <div className="patient-analysis-box">
          <p>
            No período selecionado, foram acompanhados{" "}
            <strong>
              {totalPatients} paciente
              {totalPatients ===
              1
                ? ""
                : "s"}
            </strong>
            , com{" "}
            <strong>
              {totalAppointments} atendimento
              {totalAppointments ===
              1
                ? ""
                : "s"}
            </strong>{" "}
            registrados. Desses,{" "}
            <strong>
              {totalRealized} foram realizados
            </strong>
            , correspondendo a{" "}
            <strong>
              {realizationRate}% do total
            </strong>
            .
          </p>

          <p>
            Considerando atendimentos realizados e faltas, a taxa de comparecimento foi de{" "}
            <strong>
              {attendanceRate}%
            </strong>
            . Foram registradas{" "}
            <strong>
              {totalAbsences} falta
              {totalAbsences ===
              1
                ? ""
                : "s"}
            </strong>{" "}
            e{" "}
            <strong>
              {totalCancelled} cancelamento
              {totalCancelled ===
              1
                ? ""
                : "s"}
            </strong>
            .
          </p>

          <p>
            O acompanhamento terapêutico possui{" "}
            <strong>
              {totalObjectives} objetivo
              {totalObjectives ===
              1
                ? ""
                : "s"}
            </strong>
            , sendo{" "}
            <strong>
              {achievedObjectives} atingido
              {achievedObjectives ===
              1
                ? ""
                : "s"}
            </strong>
            . Isso representa uma taxa de alcance de{" "}
            <strong>
              {objectiveAchievementRate}%
            </strong>
            .
          </p>

          {patientWithMostAppointments && (
            <p>
              O paciente com maior volume de atendimentos no período foi{" "}
              <strong>
                {
                  patientWithMostAppointments.patient
                }
              </strong>
              , com{" "}
              <strong>
                {
                  patientWithMostAppointments.appointments
                } atendimento
                {patientWithMostAppointments.appointments ===
                1
                  ? ""
                  : "s"}
              </strong>
              .
            </p>
          )}

          <p>
            Financeiramente, os pacientes do relatório somam{" "}
            <strong>
              {formatCurrency(
                billed
              )}
            </strong>{" "}
            em cobranças, com{" "}
            <strong>
              {formatCurrency(
                paid
              )}
            </strong>{" "}
            já recebidos e{" "}
            <strong>
              {formatCurrency(
                totalPending
              )}
            </strong>{" "}
            pendentes.
          </p>
        </div>
      </section>

      <section className="patient-document-section patient-finance-clinical">
        <div>
          <SectionTitle
            number="06"
            title="Indicadores clínicos"
            subtitle="Objetivos e registros de evolução."
          />

          <div className="patient-small-metrics">
            <Metric
              label="Objetivos atingidos"
              value={String(
                achievedObjectives
              )}
              note={`${objectiveAchievementRate}% dos objetivos`}
            />

            <Metric
              label="Em acompanhamento"
              value={String(
                evolvingObjectives
              )}
              note="objetivos não concluídos"
            />

            <Metric
              label="Evoluções"
              value={String(
                totalEvolutions
              )}
              note="registros finalizados"
            />
          </div>
        </div>

        <div>
          <SectionTitle
            number="07"
            title="Resumo financeiro"
            subtitle="Situação financeira dos pacientes do relatório."
          />

          <FinanceChart
            billed={
              billed
            }
            paid={
              paid
            }
            pending={
              totalPending
            }
          />
        </div>
      </section>

      <section className="patient-document-section patient-detail-section">
        <SectionTitle
          number="08"
          title="Detalhamento dos pacientes"
          subtitle="Resumo individual do acompanhamento no período selecionado."
        />

        <table className="patient-document-table">
          <thead>
            <tr>
              <th>
                Paciente
              </th>

              <th className="patient-number">
                Atend.
              </th>

              <th className="patient-number">
                Realiz.
              </th>

              <th className="patient-number">
                Faltas
              </th>

              <th className="patient-number">
                Objetivos
              </th>

              <th className="patient-number">
                Atingidos
              </th>

              <th className="patient-number">
                Evoluções
              </th>

              <th className="patient-money">
                Pendente
              </th>
            </tr>
          </thead>

          <tbody>
            {report.map(
              (
                patient
              ) => (
                <tr
                  key={
                    patient.patientId
                  }
                >
                  <td>
                    <strong>
                      {
                        patient.patient
                      }
                    </strong>

                    <small>
                      {patient.specialties.join(
                        ", "
                      ) ||
                        "Sem especialidade"}
                    </small>
                  </td>

                  <td className="patient-number">
                    {
                      patient.appointments
                    }
                  </td>

                  <td className="patient-number">
                    {
                      patient.realized
                    }
                  </td>

                  <td className="patient-number">
                    {
                      patient.absent
                    }
                  </td>

                  <td className="patient-number">
                    {
                      patient.objectives
                    }
                  </td>

                  <td className="patient-number">
                    {
                      patient.achievedObjectives
                    }
                  </td>

                  <td className="patient-number">
                    {
                      patient.evolutions
                    }
                  </td>

                  <td className="patient-money">
                    {formatCurrency(
                      patient.pending
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>

      <footer className="patient-document-footer">
        <div>
          <strong>
            Clínica Integrada Entre Afetos
          </strong>

          <span>
            Relatório de Pacientes
          </span>
        </div>

        <div className="patient-footer-right">
          <span>
            AC Software
          </span>

          <span>
            Documento gerado pelo sistema
          </span>
        </div>
      </footer>
    </article>
  );
}

/* =========================================
   COMPONENTES VISUAIS
========================================= */

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number:
    string;

  title:
    string;

  subtitle:
    string;
}) {
  return (
    <div className="patient-section-title">
      <span className="patient-section-number">
        {
          number
        }
      </span>

      <div>
        <h2>
          {
            title
          }
        </h2>

        <p>
          {
            subtitle
          }
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label:
    string;

  value:
    string;

  note:
    string;
}) {
  return (
    <div className="patient-document-metric">
      <span>
        {
          label
        }
      </span>

      <strong>
        {
          value
        }
      </strong>

      <small>
        {
          note
        }
      </small>
    </div>
  );
}

function AttendanceChart({
  realized,
  absent,
  cancelled,
}: {
  realized:
    number;

  absent:
    number;

  cancelled:
    number;
}) {
  const total =
    Math.max(
      1,
      realized +
        absent +
        cancelled
    );

  return (
    <div className="patient-status-box">
      <Donut
        total={
          total
        }
        primary={
          realized
        }
        secondary={
          absent
        }
        label="realizados"
      />

      <div className="patient-status-legend">
        <Legend
          color="#6543ef"
          label="Realizados"
          value={
            realized
          }
          total={
            total
          }
        />

        <Legend
          color="#f59e0b"
          label="Faltas"
          value={
            absent
          }
          total={
            total
          }
        />

        <Legend
          color="#ef476f"
          label="Cancelados"
          value={
            cancelled
          }
          total={
            total
          }
        />
      </div>
    </div>
  );
}

function ObjectiveChart({
  achieved,
  evolving,
}: {
  achieved:
    number;

  evolving:
    number;
}) {
  const total =
    Math.max(
      1,
      achieved +
        evolving
    );

  const achievedPercent =
    Math.round(
      (
        achieved /
        total
      ) *
        100
    );

  return (
    <div className="patient-objective-box">
      <div className="patient-objective-header">
        <div>
          <span>
            Alcance dos objetivos
          </span>

          <strong>
            {achievedPercent}%
          </strong>
        </div>

        <small>
          {achieved} de {achieved + evolving}
        </small>
      </div>

      <div className="patient-objective-track">
        <div
          className="patient-objective-fill"
          style={{
            width: `${achievedPercent}%`,
          }}
        />
      </div>

      <div className="patient-objective-grid">
        <div>
          <span>
            Atingidos
          </span>

          <strong>
            {
              achieved
            }
          </strong>
        </div>

        <div>
          <span>
            Em acompanhamento
          </span>

          <strong>
            {
              evolving
            }
          </strong>
        </div>
      </div>
    </div>
  );
}

function PatientBars({
  patients,
}: {
  patients:
    PatientReportDocumentItem[];
}) {
  const top =
    [...patients]
      .sort(
        (
          a,
          b
        ) =>
          b.appointments -
          a.appointments
      )
      .slice(
        0,
        6
      );

  const max =
    Math.max(
      1,
      ...top.map(
        (
          patient
        ) =>
          patient.appointments
      )
    );

  return (
    <div className="patient-bar-chart">
      {top.length >
      0 ? (
        top.map(
          (
            patient
          ) => (
            <div
              className="patient-bar-row"
              key={
                patient.patientId
              }
            >
              <div className="patient-bar-label">
                <strong>
                  {
                    patient.patient
                  }
                </strong>

                <span>
                  {patient.specialties[0] ||
                    "Sem especialidade"}
                </span>
              </div>

              <div className="patient-bar-track">
                <div
                  className="patient-bar-fill"
                  style={{
                    width: `${(
                      patient.appointments /
                      max
                    ) *
                    100}%`,
                  }}
                />
              </div>

              <strong className="patient-bar-value">
                {
                  patient.appointments
                }
              </strong>
            </div>
          )
        )
      ) : (
        <p className="patient-empty">
          Sem atendimentos no período.
        </p>
      )}
    </div>
  );
}

function FinanceChart({
  billed,
  paid,
  pending,
}: {
  billed:
    number;

  paid:
    number;

  pending:
    number;
}) {
  const max =
    Math.max(
      1,
      billed,
      paid,
      pending
    );

  return (
    <div className="patient-finance-chart">
      <FinanceBar
        label="Faturado"
        value={
          billed
        }
        max={
          max
        }
      />

      <FinanceBar
        label="Recebido"
        value={
          paid
        }
        max={
          max
        }
      />

      <FinanceBar
        label="Pendente"
        value={
          pending
        }
        max={
          max
        }
      />
    </div>
  );
}

function FinanceBar({
  label,
  value,
  max,
}: {
  label:
    string;

  value:
    number;

  max:
    number;
}) {
  return (
    <div className="patient-finance-row">
      <div className="patient-finance-top">
        <span>
          {
            label
          }
        </span>

        <strong>
          {formatCurrency(
            value
          )}
        </strong>
      </div>

      <div className="patient-finance-track">
        <div
          className="patient-finance-fill"
          style={{
            width: `${(
              value /
              max
            ) *
            100}%`,
          }}
        />
      </div>
    </div>
  );
}

function Donut({
  total,
  primary,
  secondary,
  label,
}: {
  total:
    number;

  primary:
    number;

  secondary:
    number;

  label:
    string;
}) {
  const circumference =
    2 *
    Math.PI *
    42;

  const primaryLength =
    circumference *
    (
      primary /
      total
    );

  const secondaryLength =
    circumference *
    (
      secondary /
      total
    );

  return (
    <div className="patient-donut-wrap">
      <svg
        viewBox="0 0 110 110"
        role="img"
        aria-label="Distribuição de frequência"
      >
        <circle
          cx="55"
          cy="55"
          r="42"
          fill="none"
          stroke="#eef1f7"
          strokeWidth="14"
        />

        <circle
          cx="55"
          cy="55"
          r="42"
          fill="none"
          stroke="#6543ef"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${primaryLength} ${circumference - primaryLength}`}
          transform="rotate(-90 55 55)"
        />

        <circle
          cx="55"
          cy="55"
          r="42"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${secondaryLength} ${circumference - secondaryLength}`}
          strokeDashoffset={
            -primaryLength
          }
          transform="rotate(-90 55 55)"
        />

        <text
          x="55"
          y="51"
          textAnchor="middle"
          className="patient-donut-value"
        >
          {
            primary
          }
        </text>

        <text
          x="55"
          y="68"
          textAnchor="middle"
          className="patient-donut-label"
        >
          {
            label
          }
        </text>
      </svg>
    </div>
  );
}

function Legend({
  color,
  label,
  value,
  total,
}: {
  color:
    string;

  label:
    string;

  value:
    number;

  total:
    number;
}) {
  return (
    <div className="patient-legend-row">
      <span
        className="patient-legend-dot"
        style={{
          background:
            color,
        }}
      />

      <span>
        {
          label
        }
      </span>

      <strong>
        {value} •{" "}
        {Math.round(
          (
            value /
            total
          ) *
            100
        )}
        %
      </strong>
    </div>
  );
}

function formatDate(
  value:
    string
) {
  if (
    !value
  ) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

/* =========================================
   ESTILOS DE IMPRESSÃO
========================================= */

export const PATIENT_REPORT_DOCUMENT_STYLES = `
  .patient-report-document {
    display: none;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 13mm;
    }

    html,
    body {
      background: #ffffff !important;
      overflow: visible !important;
    }

    body * {
      visibility: hidden !important;
    }

    .patient-report-document,
    .patient-report-document * {
      visibility: visible !important;
    }

    .patient-report-document {
      display: block !important;
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      width: 100% !important;
      background: #ffffff !important;
      color: #172033 !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 9pt !important;
      line-height: 1.45 !important;
    }

    .patient-report-document * {
      box-sizing: border-box !important;
    }

    .patient-document-header,
    .patient-brand-line,
    .patient-filter-summary,
    .patient-document-footer,
    .patient-finance-top,
    .patient-objective-header {
      display: flex;
    }

    .patient-document-header {
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #10235f;
    }

    .patient-brand-line {
      align-items: center;
      gap: 10px;
    }

    .patient-brand-mark {
      display: flex;
      width: 38px;
      height: 38px;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: #6543ef !important;
      color: #ffffff !important;
      font-weight: 800;
      font-size: 11pt;
    }

    .patient-brand-kicker {
      margin: 0;
      color: #6543ef !important;
      font-size: 6.5pt;
      font-weight: 800;
      letter-spacing: 1.2px;
    }

    .patient-brand-name {
      margin: 1px 0 0;
      color: #10235f !important;
      font-size: 15pt;
      font-weight: 800;
    }

    .patient-document-meta {
      text-align: right;
      color: #64748b !important;
      font-size: 7.5pt;
    }

    .patient-document-meta p {
      margin: 0;
    }

    .patient-document-meta strong {
      display: block;
      color: #10235f !important;
      font-size: 10pt;
    }

    .patient-document-title {
      display: grid;
      grid-template-columns: 1fr 210px;
      gap: 22px;
      align-items: end;
      padding: 18px 0 12px;
    }

    .patient-eyebrow {
      margin: 0 0 4px;
      color: #6543ef !important;
      font-size: 7pt;
      font-weight: 800;
      letter-spacing: 1.1px;
    }

    .patient-report-document h1 {
      margin: 0;
      color: #10235f !important;
      font-size: 23pt !important;
      line-height: 1.05 !important;
    }

    .patient-subtitle {
      max-width: 520px;
      margin: 6px 0 0;
      color: #66728f !important;
      font-size: 8.5pt;
    }

    .patient-period-box {
      padding: 10px 12px;
      border: 1px solid #dfe4f2;
      border-radius: 8px;
      background: #f7f8fc !important;
    }

    .patient-period-box span,
    .patient-period-box small {
      display: block;
      color: #7c879f !important;
      font-size: 6.8pt;
    }

    .patient-period-box strong {
      display: block;
      margin: 3px 0;
      color: #10235f !important;
      font-size: 8.5pt;
    }

    .patient-filter-summary {
      gap: 20px;
      margin-bottom: 17px;
      padding: 8px 10px;
      border-left: 3px solid #6543ef;
      background: #f7f5ff !important;
      color: #5e6983 !important;
      font-size: 7.5pt;
    }

    .patient-filter-summary strong {
      color: #2c3754 !important;
    }

    .patient-document-section {
      margin-top: 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .patient-two-columns,
    .patient-finance-clinical {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      align-items: start;
    }

    .patient-section-title {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      margin-bottom: 10px;
    }

    .patient-section-number {
      display: flex;
      width: 25px;
      height: 25px;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      background: #eeeaff !important;
      color: #6543ef !important;
      font-size: 7pt;
      font-weight: 800;
    }

    .patient-section-title h2 {
      margin: 0;
      color: #10235f !important;
      font-size: 11pt !important;
      line-height: 1.2 !important;
    }

    .patient-section-title p {
      margin: 2px 0 0;
      color: #7a859e !important;
      font-size: 7pt;
    }

    .patient-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .patient-document-metric {
      padding: 10px;
      border: 1px solid #e2e6f0;
      border-radius: 8px;
      background: #ffffff !important;
    }

    .patient-document-metric > span {
      display: block;
      color: #7b869d !important;
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .patient-document-metric > strong {
      display: block;
      margin-top: 3px;
      color: #10235f !important;
      font-size: 14pt;
      line-height: 1.1;
    }

    .patient-document-metric small {
      display: block;
      margin-top: 3px;
      color: #98a1b5 !important;
      font-size: 6.5pt;
    }

    .patient-status-box {
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 12px;
      align-items: center;
      min-height: 136px;
      padding: 10px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
    }

    .patient-donut-wrap svg {
      width: 108px;
      height: 108px;
    }

    .patient-donut-value {
      fill: #10235f !important;
      font-size: 16px;
      font-weight: 800;
    }

    .patient-donut-label {
      fill: #8791a8 !important;
      font-size: 7px;
    }

    .patient-status-legend {
      display: grid;
      gap: 7px;
    }

    .patient-legend-row {
      display: grid;
      grid-template-columns: 8px 1fr auto;
      gap: 6px;
      align-items: center;
      color: #66728b !important;
      font-size: 7pt;
    }

    .patient-legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .patient-legend-row strong {
      color: #28334f !important;
    }

    .patient-objective-box {
      min-height: 136px;
      padding: 14px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
      background: #fbfbfd !important;
    }

    .patient-objective-header {
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .patient-objective-header span,
    .patient-objective-header small {
      display: block;
      color: #7c879f !important;
      font-size: 7pt;
    }

    .patient-objective-header strong {
      display: block;
      margin-top: 2px;
      color: #10235f !important;
      font-size: 18pt;
    }

    .patient-objective-track,
    .patient-bar-track,
    .patient-finance-track {
      overflow: hidden;
      border-radius: 999px;
      background: #eceff5 !important;
    }

    .patient-objective-track {
      height: 10px;
      margin: 12px 0;
    }

    .patient-objective-fill {
      height: 100%;
      border-radius: 999px;
      background: #6543ef !important;
    }

    .patient-objective-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .patient-objective-grid > div {
      padding: 7px 8px;
      border-radius: 7px;
      background: #ffffff !important;
      border: 1px solid #eceef4;
    }

    .patient-objective-grid span,
    .patient-objective-grid strong {
      display: block;
    }

    .patient-objective-grid span {
      color: #8892a8 !important;
      font-size: 6.5pt;
    }

    .patient-objective-grid strong {
      margin-top: 2px;
      color: #26324d !important;
      font-size: 10pt;
    }

    .patient-bar-chart {
      padding: 11px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
      background: #fbfbfd !important;
    }

    .patient-bar-row {
      display: grid;
      grid-template-columns: 145px 1fr 22px;
      gap: 8px;
      align-items: center;
      margin: 7px 0;
    }

    .patient-bar-label strong,
    .patient-bar-label span {
      display: block;
    }

    .patient-bar-label strong {
      color: #28334f !important;
      font-size: 7pt;
    }

    .patient-bar-label span {
      color: #8993aa !important;
      font-size: 6pt;
    }

    .patient-bar-track {
      height: 8px;
    }

    .patient-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: #536de8 !important;
    }

    .patient-bar-value {
      text-align: right;
      color: #10235f !important;
      font-size: 7.5pt;
    }

    .patient-analysis-box {
      padding: 12px 14px;
      border: 1px solid #dfe4f2;
      border-left: 4px solid #6543ef;
      border-radius: 8px;
      background: #faf9ff !important;
      color: #536078 !important;
      font-size: 8pt;
    }

    .patient-analysis-box p {
      margin: 0 0 7px;
    }

    .patient-analysis-box p:last-child {
      margin-bottom: 0;
    }

    .patient-analysis-box strong {
      color: #27334f !important;
    }

    .patient-small-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
    }

    .patient-finance-chart {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
    }

    .patient-finance-top {
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
      color: #68748c !important;
      font-size: 7pt;
    }

    .patient-finance-top strong {
      color: #26324d !important;
    }

    .patient-finance-track {
      height: 8px;
    }

    .patient-finance-fill {
      height: 100%;
      border-radius: 999px;
      background: #6543ef !important;
    }

    .patient-detail-section {
      break-before: page;
      page-break-before: always;
    }

    .patient-document-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
    }

    .patient-document-table thead {
      display: table-header-group;
    }

    .patient-document-table th {
      padding: 7px 6px;
      border-bottom: 1.5px solid #10235f;
      background: #f4f5f9 !important;
      color: #36415c !important;
      text-align: left;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: .3px;
    }

    .patient-document-table td {
      padding: 7px 6px;
      border-bottom: 1px solid #e6e9f1;
      color: #556179 !important;
    }

    .patient-document-table td strong,
    .patient-document-table td small {
      display: block;
    }

    .patient-document-table td strong {
      color: #26324e !important;
    }

    .patient-document-table td small {
      margin-top: 2px;
      color: #8c96aa !important;
      font-size: 6pt;
    }

    .patient-document-table .patient-number,
    .patient-document-table .patient-money {
      text-align: right;
      white-space: nowrap;
    }

    .patient-document-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .patient-document-footer {
      justify-content: space-between;
      gap: 20px;
      margin-top: 20px;
      padding-top: 9px;
      border-top: 1px solid #d9deea;
      color: #8a94a9 !important;
      font-size: 6.5pt;
    }

    .patient-document-footer strong,
    .patient-document-footer span {
      display: block;
    }

    .patient-document-footer strong {
      color: #10235f !important;
    }

    .patient-footer-right {
      text-align: right;
    }

    .patient-empty {
      margin: 0;
      color: #8791a8 !important;
      font-size: 7pt;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;