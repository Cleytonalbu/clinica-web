import {
  type ReactNode,
} from "react";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

/* =========================================
   TIPOS
========================================= */

export interface ProfessionalReportDocumentItem {
  professional: string;

  specialty: string;

  appointments: number;

  realized: number;

  absent: number;

  cancelled: number;

  scheduled: number;

  patients: number[];

  billed: number;

  received: number;

  pending: number;

  payoutTotal: number;

  payoutPaid: number;

  payoutPending: number;
}

interface ProfessionalReportDocumentProps {
  startDate: string;

  endDate: string;

  professionalFilter: string;

  specialtyFilter: string;

  report: ProfessionalReportDocumentItem[];

  totalProfessionals: number;

  totalAppointments: number;

  totalRealized: number;

  totalAbsences: number;

  totalPatients: number;

  totalBilled: number;

  totalReceived: number;

  totalPending: number;

  totalPayoutPaid: number;

  totalPayoutPending: number;
}

/* =========================================
   DOCUMENTO
========================================= */

export function ProfessionalReportDocument({
  startDate,
  endDate,
  professionalFilter,
  specialtyFilter,
  report,
  totalProfessionals,
  totalAppointments,
  totalRealized,
  totalAbsences,
  totalPatients,
  totalBilled,
  totalReceived,
  totalPending,
  totalPayoutPaid,
  totalPayoutPending,
}: ProfessionalReportDocumentProps) {
  const totalCancelled =
    report.reduce(
      (
        total,
        item
      ) =>
        total +
        item.cancelled,
      0
    );

  const attendanceBase =
    totalRealized +
    totalAbsences;

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

  const leadingProfessional =
    [...report].sort(
      (
        a,
        b
      ) =>
        b.realized -
        a.realized
    )[0];

  const generatedAt =
    new Date();

  return (
    <article className="professional-report-document">
      <header className="document-header">
        <div>
          <div className="brand-line">
            <div className="brand-mark">
              EA
            </div>

            <div>
              <p className="brand-kicker">
                CLÍNICA INTEGRADA
              </p>

              <p className="brand-name">
                Entre Afetos
              </p>
            </div>
          </div>
        </div>

        <div className="document-meta">
          <p>
            Relatório gerencial
          </p>

          <strong>
            Profissionais
          </strong>
        </div>
      </header>

      <section className="document-title">
        <div>
          <p className="eyebrow">
            PRODUÇÃO CLÍNICA
          </p>

          <h1>
            Relatório de Profissionais
          </h1>

          <p className="subtitle">
            Consolidado da produção clínica, pacientes atendidos e repasses profissionais.
          </p>
        </div>

        <div className="period-box">
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

      <section className="filter-summary">
        <span>
          <strong>
            Profissional:
          </strong>{" "}
          {professionalFilter ||
            "Todos"}
        </span>

        <span>
          <strong>
            Especialidade:
          </strong>{" "}
          {specialtyFilter ===
          "Todas"
            ? "Todas"
            : specialtyFilter}
        </span>
      </section>

      <section className="document-section">
        <SectionTitle
          number="01"
          title="Resumo executivo"
          subtitle="Principais números do período selecionado."
        />

        <div className="metrics-grid">
          <Metric
            label="Profissionais"
            value={String(
              totalProfessionals
            )}
            note="com produção no período"
          />

          <Metric
            label="Atendimentos"
            value={String(
              totalAppointments
            )}
            note="total registrado"
          />

          <Metric
            label="Realizados"
            value={String(
              totalRealized
            )}
            note={`${realizationRate}% dos atendimentos`}
          />

          <Metric
            label="Pacientes"
            value={String(
              totalPatients
            )}
            note="pacientes únicos"
          />

          <Metric
            label="Faturamento"
            value={formatCurrency(
              totalBilled
            )}
            note="produção financeira"
          />

          <Metric
            label="Repasses pagos"
            value={formatCurrency(
              totalPayoutPaid
            )}
            note="confirmados aos profissionais"
          />
        </div>
      </section>

      <section className="document-section two-columns">
        <div>
          <SectionTitle
            number="02"
            title="Produção por profissional"
            subtitle="Comparativo de atendimentos realizados."
          />

          <HorizontalBars
            items={report}
          />
        </div>

        <div>
          <SectionTitle
            number="03"
            title="Situação dos atendimentos"
            subtitle="Distribuição dos principais status."
          />

          <StatusComposition
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
      </section>

      <section className="document-section">
        <SectionTitle
          number="04"
          title="Análise do período"
          subtitle="Leitura automática dos indicadores apresentados."
        />

        <div className="analysis-box">
          <p>
            No período analisado, a clínica registrou{" "}
            <strong>
              {totalAppointments} atendimento
              {totalAppointments ===
              1
                ? ""
                : "s"}
            </strong>
            , dos quais{" "}
            <strong>
              {totalRealized} foram realizados
            </strong>
            , resultando em taxa de realização de{" "}
            <strong>
              {realizationRate}%
            </strong>
            .
          </p>

          <p>
            Considerando apenas atendimentos realizados e faltas, a taxa de comparecimento foi de{" "}
            <strong>
              {attendanceRate}%
            </strong>
            . Foram acompanhados{" "}
            <strong>
              {totalPatients} paciente
              {totalPatients ===
              1
                ? ""
                : "s"} único
              {totalPatients ===
              1
                ? ""
                : "s"}
            </strong>
            .
          </p>

          {leadingProfessional && (
            <p>
              O maior volume de atendimentos realizados no período foi de{" "}
              <strong>
                {leadingProfessional.professional}
              </strong>
              , da especialidade de{" "}
              <strong>
                {leadingProfessional.specialty}
              </strong>
              , com{" "}
              <strong>
                {leadingProfessional.realized} atendimento
                {leadingProfessional.realized ===
                1
                  ? ""
                  : "s"}
              </strong>
              .
            </p>
          )}

          <p>
            O faturamento associado à produção foi de{" "}
            <strong>
              {formatCurrency(
                totalBilled
              )}
            </strong>
            , com{" "}
            <strong>
              {formatCurrency(
                totalReceived
              )}
            </strong>{" "}
            recebidos e{" "}
            <strong>
              {formatCurrency(
                totalPending
              )}
            </strong>{" "}
            ainda pendentes.
          </p>
        </div>
      </section>

      <section className="document-section two-columns finance-columns">
        <div>
          <SectionTitle
            number="05"
            title="Repasses profissionais"
            subtitle="Pagamentos vinculados aos atendimentos realizados."
          />

          <div className="repasse-summary">
            <Metric
              label="Pago"
              value={formatCurrency(
                totalPayoutPaid
              )}
              note="repasses confirmados"
            />

            <Metric
              label="Pendente"
              value={formatCurrency(
                totalPayoutPending
              )}
              note="ainda a repassar"
            />
          </div>
        </div>

        <div>
          <SectionTitle
            number="06"
            title="Visão financeira"
            subtitle="Produção da equipe no período."
          />

          <FinanceComparison
            billed={
              totalBilled
            }
            received={
              totalReceived
            }
            payoutPaid={
              totalPayoutPaid
            }
          />
        </div>
      </section>

      <section className="document-section detail-section">
        <SectionTitle
          number="07"
          title="Detalhamento da equipe"
          subtitle="Resumo individual dos profissionais com produção no período."
        />

        <table className="document-table">
          <thead>
            <tr>
              <th>
                Profissional
              </th>

              <th>
                Especialidade
              </th>

              <th className="number">
                Atend.
              </th>

              <th className="number">
                Realiz.
              </th>

              <th className="number">
                Pacientes
              </th>

              <th className="money">
                Faturado
              </th>

              <th className="money">
                Repasse pago
              </th>

              <th className="money">
                Repasse pend.
              </th>
            </tr>
          </thead>

          <tbody>
            {report.map(
              (
                item
              ) => (
                <tr
                  key={`${item.professional}-${item.specialty}`}
                >
                  <td>
                    <strong>
                      {
                        item.professional
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      item.specialty
                    }
                  </td>

                  <td className="number">
                    {
                      item.appointments
                    }
                  </td>

                  <td className="number">
                    {
                      item.realized
                    }
                  </td>

                  <td className="number">
                    {
                      item.patients.length
                    }
                  </td>

                  <td className="money">
                    {formatCurrency(
                      item.billed
                    )}
                  </td>

                  <td className="money">
                    {formatCurrency(
                      item.payoutPaid
                    )}
                  </td>

                  <td className="money">
                    {formatCurrency(
                      item.payoutPending
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>

      <footer className="document-footer">
        <div>
          <strong>
            Clínica Integrada Entre Afetos
          </strong>

          <span>
            Relatório de Profissionais
          </span>
        </div>

        <div className="footer-right">
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
   TÍTULO DE SEÇÃO
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
    <div className="section-title">
      <span className="section-number">
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

/* =========================================
   MÉTRICA
========================================= */

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
    <div className="document-metric">
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

/* =========================================
   GRÁFICO DE BARRAS
========================================= */

function HorizontalBars({
  items,
}: {
  items:
    ProfessionalReportDocumentItem[];
}) {
  const maxValue =
    Math.max(
      1,
      ...items.map(
        (
          item
        ) =>
          item.realized
      )
    );

  return (
    <div className="bar-chart">
      {items.length >
      0 ? (
        items.map(
          (
            item
          ) => {
            const width =
              (
                item.realized /
                maxValue
              ) *
              100;

            return (
              <div
                className="bar-row"
                key={`${item.professional}-${item.specialty}`}
              >
                <div className="bar-label">
                  <strong>
                    {
                      item.professional
                    }
                  </strong>

                  <span>
                    {
                      item.specialty
                    }
                  </span>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>

                <strong className="bar-value">
                  {
                    item.realized
                  }
                </strong>
              </div>
            );
          }
        )
      ) : (
        <p className="empty-document">
          Sem produção no período.
        </p>
      )}
    </div>
  );
}

/* =========================================
   DONUT DE STATUS
========================================= */

function StatusComposition({
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

  const realizedValue =
    realized /
    total;

  const absentValue =
    absent /
    total;

  const circumference =
    2 *
    Math.PI *
    42;

  const realizedLength =
    circumference *
    realizedValue;

  const absentLength =
    circumference *
    absentValue;

  return (
    <div className="status-composition">
      <div className="donut-wrap">
        <svg
          viewBox="0 0 110 110"
          role="img"
          aria-label="Distribuição dos status de atendimento"
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
            strokeDasharray={`${realizedLength} ${circumference - realizedLength}`}
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
            strokeDasharray={`${absentLength} ${circumference - absentLength}`}
            strokeDashoffset={
              -realizedLength
            }
            transform="rotate(-90 55 55)"
          />

          <text
            x="55"
            y="51"
            textAnchor="middle"
            className="donut-value"
          >
            {
              realized
            }
          </text>

          <text
            x="55"
            y="68"
            textAnchor="middle"
            className="donut-label"
          >
            realizados
          </text>
        </svg>
      </div>

      <div className="status-legend">
        <LegendRow
          color="#6543ef"
          label="Realizados"
          value={
            realized
          }
          percentage={
            Math.round(
              (
                realized /
                total
              ) *
                100
            )
          }
        />

        <LegendRow
          color="#f59e0b"
          label="Faltas"
          value={
            absent
          }
          percentage={
            Math.round(
              (
                absent /
                total
              ) *
                100
            )
          }
        />

        <LegendRow
          color="#ef476f"
          label="Cancelados"
          value={
            cancelled
          }
          percentage={
            Math.round(
              (
                cancelled /
                total
              ) *
                100
            )
          }
        />
      </div>
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
  percentage,
}: {
  color:
    string;

  label:
    string;

  value:
    number;

  percentage:
    number;
}) {
  return (
    <div className="legend-row">
      <span
        className="legend-dot"
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
        {value} • {percentage}%
      </strong>
    </div>
  );
}

/* =========================================
   FINANCEIRO
========================================= */

function FinanceComparison({
  billed,
  received,
  payoutPaid,
}: {
  billed:
    number;

  received:
    number;

  payoutPaid:
    number;
}) {
  const max =
    Math.max(
      1,
      billed,
      received,
      payoutPaid
    );

  return (
    <div className="finance-comparison">
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
          received
        }
        max={
          max
        }
      />

      <FinanceBar
        label="Repasses pagos"
        value={
          payoutPaid
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
    <div className="finance-row">
      <div className="finance-row-top">
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

      <div className="finance-track">
        <div
          className="finance-fill"
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

/* =========================================
   HELPERS
========================================= */

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



export const PROFESSIONAL_REPORT_DOCUMENT_STYLES = `
  .professional-report-document {
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

    .professional-report-document,
    .professional-report-document * {
      visibility: visible !important;
    }

    .professional-report-document {
      display: block !important;
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      width: 100% !important;
      color: #172033 !important;
      background: #ffffff !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 9pt !important;
      line-height: 1.45 !important;
    }

    .professional-report-document * {
      box-sizing: border-box !important;
    }

    .professional-report-document .document-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #10235f;
    }

    .professional-report-document .brand-line {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .professional-report-document .brand-mark {
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

    .professional-report-document .brand-kicker {
      margin: 0;
      color: #6543ef !important;
      font-size: 6.5pt;
      font-weight: 800;
      letter-spacing: 1.2px;
    }

    .professional-report-document .brand-name {
      margin: 1px 0 0;
      color: #10235f !important;
      font-size: 15pt;
      font-weight: 800;
    }

    .professional-report-document .document-meta {
      text-align: right;
      color: #64748b !important;
      font-size: 7.5pt;
    }

    .professional-report-document .document-meta p {
      margin: 0;
    }

    .professional-report-document .document-meta strong {
      display: block;
      margin-top: 1px;
      color: #10235f !important;
      font-size: 10pt;
    }

    .professional-report-document .document-title {
      display: grid;
      grid-template-columns: 1fr 210px;
      gap: 22px;
      align-items: end;
      padding: 18px 0 12px;
    }

    .professional-report-document .eyebrow {
      margin: 0 0 4px;
      color: #6543ef !important;
      font-size: 7pt;
      font-weight: 800;
      letter-spacing: 1.1px;
    }

    .professional-report-document h1 {
      margin: 0;
      color: #10235f !important;
      font-size: 23pt !important;
      line-height: 1.05 !important;
      font-weight: 800;
    }

    .professional-report-document .subtitle {
      max-width: 520px;
      margin: 6px 0 0;
      color: #66728f !important;
      font-size: 8.5pt;
    }

    .professional-report-document .period-box {
      padding: 10px 12px;
      border: 1px solid #dfe4f2;
      border-radius: 8px;
      background: #f7f8fc !important;
    }

    .professional-report-document .period-box span,
    .professional-report-document .period-box small {
      display: block;
      color: #7c879f !important;
      font-size: 6.8pt;
    }

    .professional-report-document .period-box strong {
      display: block;
      margin: 3px 0;
      color: #10235f !important;
      font-size: 8.5pt;
    }

    .professional-report-document .filter-summary {
      display: flex;
      gap: 20px;
      margin-bottom: 17px;
      padding: 8px 10px;
      border-left: 3px solid #6543ef;
      background: #f7f5ff !important;
      color: #5e6983 !important;
      font-size: 7.5pt;
    }

    .professional-report-document .filter-summary strong {
      color: #2c3754 !important;
    }

    .professional-report-document .document-section {
      margin-top: 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .professional-report-document .two-columns {
      display: grid;
      grid-template-columns: 1.45fr 1fr;
      gap: 18px;
      align-items: start;
    }

    .professional-report-document .finance-columns {
      grid-template-columns: 0.8fr 1.2fr;
    }

    .professional-report-document .section-title {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      margin-bottom: 10px;
    }

    .professional-report-document .section-number {
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

    .professional-report-document .section-title h2 {
      margin: 0;
      color: #10235f !important;
      font-size: 11pt !important;
      line-height: 1.2 !important;
    }

    .professional-report-document .section-title p {
      margin: 2px 0 0;
      color: #7a859e !important;
      font-size: 7pt;
    }

    .professional-report-document .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .professional-report-document .document-metric {
      padding: 10px;
      border: 1px solid #e2e6f0;
      border-radius: 8px;
      background: #ffffff !important;
    }

    .professional-report-document .document-metric > span {
      display: block;
      color: #7b869d !important;
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .professional-report-document .document-metric > strong {
      display: block;
      margin-top: 3px;
      color: #10235f !important;
      font-size: 14pt;
      line-height: 1.1;
    }

    .professional-report-document .document-metric small {
      display: block;
      margin-top: 3px;
      color: #98a1b5 !important;
      font-size: 6.5pt;
    }

    .professional-report-document .bar-chart {
      padding: 11px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
      background: #fbfbfd !important;
    }

    .professional-report-document .bar-row {
      display: grid;
      grid-template-columns: 135px 1fr 22px;
      gap: 8px;
      align-items: center;
      margin: 8px 0;
    }

    .professional-report-document .bar-label strong,
    .professional-report-document .bar-label span {
      display: block;
    }

    .professional-report-document .bar-label strong {
      color: #28334f !important;
      font-size: 7pt;
    }

    .professional-report-document .bar-label span {
      margin-top: 1px;
      color: #8993aa !important;
      font-size: 6pt;
    }

    .professional-report-document .bar-track,
    .professional-report-document .finance-track {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: #eceff5 !important;
    }

    .professional-report-document .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: #6543ef !important;
    }

    .professional-report-document .bar-value {
      color: #10235f !important;
      font-size: 7.5pt;
      text-align: right;
    }

    .professional-report-document .status-composition {
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 12px;
      align-items: center;
      padding: 10px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
    }

    .professional-report-document .donut-wrap svg {
      width: 108px;
      height: 108px;
    }

    .professional-report-document .donut-value {
      fill: #10235f !important;
      font-size: 16px;
      font-weight: 800;
    }

    .professional-report-document .donut-label {
      fill: #8791a8 !important;
      font-size: 7px;
    }

    .professional-report-document .status-legend {
      display: grid;
      gap: 7px;
    }

    .professional-report-document .legend-row {
      display: grid;
      grid-template-columns: 8px 1fr auto;
      gap: 6px;
      align-items: center;
      color: #66728b !important;
      font-size: 7pt;
    }

    .professional-report-document .legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .professional-report-document .legend-row strong {
      color: #28334f !important;
    }

    .professional-report-document .analysis-box {
      padding: 12px 14px;
      border: 1px solid #dfe4f2;
      border-left: 4px solid #6543ef;
      border-radius: 8px;
      background: #faf9ff !important;
      color: #536078 !important;
      font-size: 8pt;
    }

    .professional-report-document .analysis-box p {
      margin: 0 0 7px;
    }

    .professional-report-document .analysis-box p:last-child {
      margin-bottom: 0;
    }

    .professional-report-document .analysis-box strong {
      color: #27334f !important;
    }

    .professional-report-document .repasse-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .professional-report-document .finance-comparison {
      display: grid;
      gap: 11px;
      padding: 12px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
    }

    .professional-report-document .finance-row-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
      color: #68748c !important;
      font-size: 7pt;
    }

    .professional-report-document .finance-row-top strong {
      color: #26324d !important;
    }

    .professional-report-document .finance-fill {
      height: 100%;
      border-radius: 999px;
      background: #536de8 !important;
    }

    .professional-report-document .detail-section {
      break-before: page;
      page-break-before: always;
    }

    .professional-report-document .document-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
    }

    .professional-report-document .document-table thead {
      display: table-header-group;
    }

    .professional-report-document .document-table th {
      padding: 7px 6px;
      border-bottom: 1.5px solid #10235f;
      background: #f4f5f9 !important;
      color: #36415c !important;
      text-align: left;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: .3px;
    }

    .professional-report-document .document-table td {
      padding: 7px 6px;
      border-bottom: 1px solid #e6e9f1;
      color: #556179 !important;
    }

    .professional-report-document .document-table td strong {
      color: #26324e !important;
    }

    .professional-report-document .document-table .number,
    .professional-report-document .document-table .money {
      text-align: right;
      white-space: nowrap;
    }

    .professional-report-document .document-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .professional-report-document .document-footer {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 20px;
      padding-top: 9px;
      border-top: 1px solid #d9deea;
      color: #8a94a9 !important;
      font-size: 6.5pt;
    }

    .professional-report-document .document-footer strong,
    .professional-report-document .document-footer span {
      display: block;
    }

    .professional-report-document .document-footer strong {
      color: #10235f !important;
    }

    .professional-report-document .footer-right {
      text-align: right;
    }

    .professional-report-document .empty-document {
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