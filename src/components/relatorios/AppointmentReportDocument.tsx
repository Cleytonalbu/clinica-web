/* =========================================
   TIPOS
========================================= */

export interface AppointmentReportDocumentItem {
  id: number;

  patientId: number;

  patient: string;

  professional: string;

  specialty: string;

  date: string;

  time: string;

  endTime: string;

  room: string;

  type: string;

  status: string;
}

interface AppointmentReportDocumentProps {
  startDate: string;

  endDate: string;

  professionalFilter: string;

  specialtyFilter: string;

  statusFilter: string;

  appointments:
    AppointmentReportDocumentItem[];

  total: number;

  scheduled: number;

  confirmed: number;

  realized: number;

  absent: number;

  cancelled: number;

  attendanceRate: number;
}

/* =========================================
   DOCUMENTO
========================================= */

export function AppointmentReportDocument({
  startDate,
  endDate,
  professionalFilter,
  specialtyFilter,
  statusFilter,
  appointments,
  total,
  scheduled,
  confirmed,
  realized,
  absent,
  cancelled,
  attendanceRate,
}: AppointmentReportDocumentProps) {
  const generatedAt =
    new Date();

  const realizedRate =
    total >
    0
      ? Math.round(
          (
            realized /
            total
          ) *
            100
        )
      : 0;

  const professionalGroups =
    buildProfessionalGroups(
      appointments
    );

  const specialtyGroups =
    buildSpecialtyGroups(
      appointments
    );

  const leadingProfessional =
    professionalGroups[0];

  const leadingSpecialty =
    specialtyGroups[0];

  return (
    <article className="appointment-report-document">
      <header className="appointment-document-header">
        <div className="appointment-brand-line">
          <div className="appointment-brand-mark">
            EA
          </div>

          <div>
            <p className="appointment-brand-kicker">
              CLÍNICA INTEGRADA
            </p>

            <p className="appointment-brand-name">
              Entre Afetos
            </p>
          </div>
        </div>

        <div className="appointment-document-meta">
          <p>
            Relatório gerencial
          </p>

          <strong>
            Atendimentos
          </strong>
        </div>
      </header>

      <section className="appointment-document-title">
        <div>
          <p className="appointment-eyebrow">
            PRODUÇÃO CLÍNICA
          </p>

          <h1>
            Relatório de Atendimentos
          </h1>

          <p className="appointment-subtitle">
            Consolidado de sessões, comparecimento, faltas, cancelamentos e produção por profissional e especialidade.
          </p>
        </div>

        <div className="appointment-period-box">
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

      <section className="appointment-filter-summary">
        <span>
          <strong>
            Profissional:
          </strong>{" "}
          {professionalFilter}
        </span>

        <span>
          <strong>
            Especialidade:
          </strong>{" "}
          {specialtyFilter}
        </span>

        <span>
          <strong>
            Status:
          </strong>{" "}
          {statusFilter}
        </span>
      </section>

      <section className="appointment-document-section">
        <SectionTitle
          number="01"
          title="Resumo executivo"
          subtitle="Indicadores gerais dos atendimentos no período."
        />

        <div className="appointment-metrics-grid">
          <Metric
            label="Atendimentos"
            value={String(
              total
            )}
            note="registros no período"
          />

          <Metric
            label="Realizados"
            value={String(
              realized
            )}
            note={`${realizedRate}% do total`}
          />

          <Metric
            label="Comparecimento"
            value={`${attendanceRate}%`}
            note="realizados sobre realizados + faltas"
          />

          <Metric
            label="Confirmados"
            value={String(
              confirmed
            )}
            note="aguardando realização"
          />

          <Metric
            label="Faltas"
            value={String(
              absent
            )}
            note="ausências registradas"
          />

          <Metric
            label="Cancelados"
            value={String(
              cancelled
            )}
            note="sessões canceladas"
          />
        </div>
      </section>

      <section className="appointment-document-section appointment-two-columns">
        <div>
          <SectionTitle
            number="02"
            title="Situação dos atendimentos"
            subtitle="Distribuição dos principais status do período."
          />

          <StatusChart
            realized={
              realized
            }
            absent={
              absent
            }
            cancelled={
              cancelled
            }
            confirmed={
              confirmed
            }
            scheduled={
              scheduled
            }
          />
        </div>

        <div>
          <SectionTitle
            number="03"
            title="Produção por especialidade"
            subtitle="Comparativo do volume de atendimentos registrados."
          />

          <GroupBars
            groups={
              specialtyGroups
            }
          />
        </div>
      </section>

      <section className="appointment-document-section">
        <SectionTitle
          number="04"
          title="Produção por profissional"
          subtitle="Profissionais com maior volume de atendimentos no período."
        />

        <GroupBars
          groups={
            professionalGroups
          }
          limit={
            6
          }
        />
      </section>

      <section className="appointment-document-section">
        <SectionTitle
          number="05"
          title="Análise do período"
          subtitle="Leitura automática dos principais indicadores operacionais."
        />

        <div className="appointment-analysis-box">
          <p>
            No período selecionado, foram registrados{" "}
            <strong>
              {total} atendimento
              {total ===
              1
                ? ""
                : "s"}
            </strong>
            , dos quais{" "}
            <strong>
              {realized} foram realizados
            </strong>
            . Isso corresponde a uma taxa de realização de{" "}
            <strong>
              {realizedRate}%
            </strong>
            .
          </p>

          <p>
            Considerando os atendimentos realizados e as faltas, a taxa de comparecimento foi de{" "}
            <strong>
              {attendanceRate}%
            </strong>
            . Foram registradas{" "}
            <strong>
              {absent} falta
              {absent ===
              1
                ? ""
                : "s"}
            </strong>{" "}
            e{" "}
            <strong>
              {cancelled} cancelamento
              {cancelled ===
              1
                ? ""
                : "s"}
            </strong>
            .
          </p>

          {leadingProfessional && (
            <p>
              O maior volume individual de atendimentos ficou com{" "}
              <strong>
                {
                  leadingProfessional.label
                }
              </strong>
              , com{" "}
              <strong>
                {
                  leadingProfessional.value
                } atendimento
                {leadingProfessional.value ===
                1
                  ? ""
                  : "s"}
              </strong>{" "}
              no período.
            </p>
          )}

          {leadingSpecialty && (
            <p>
              A especialidade com maior produção foi{" "}
              <strong>
                {
                  leadingSpecialty.label
                }
              </strong>
              , totalizando{" "}
              <strong>
                {
                  leadingSpecialty.value
                } atendimento
                {leadingSpecialty.value ===
                1
                  ? ""
                  : "s"}
              </strong>
              .
            </p>
          )}
        </div>
      </section>

      <section className="appointment-document-section appointment-detail-section">
        <SectionTitle
          number="06"
          title="Detalhamento dos atendimentos"
          subtitle="Relação das sessões filtradas no período selecionado."
        />

        <table className="appointment-document-table">
          <thead>
            <tr>
              <th>
                Data
              </th>

              <th>
                Paciente
              </th>

              <th>
                Profissional
              </th>

              <th>
                Especialidade
              </th>

              <th>
                Horário
              </th>

              <th>
                Tipo
              </th>

              <th>
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {appointments.map(
              (
                appointment
              ) => (
                <tr
                  key={
                    appointment.id
                  }
                >
                  <td>
                    {formatDate(
                      appointment.date
                    )}
                  </td>

                  <td>
                    <strong>
                      {
                        appointment.patient
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      appointment.professional
                    }
                  </td>

                  <td>
                    {
                      appointment.specialty
                    }
                  </td>

                  <td>
                    {appointment.time}
                    {appointment.endTime
                      ? ` - ${appointment.endTime}`
                      : ""}
                  </td>

                  <td>
                    {
                      appointment.type
                    }
                  </td>

                  <td>
                    <span className="appointment-status-text">
                      {
                        appointment.status
                      }
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>

      <footer className="appointment-document-footer">
        <div>
          <strong>
            Clínica Integrada Entre Afetos
          </strong>

          <span>
            Relatório de Atendimentos
          </span>
        </div>

        <div className="appointment-footer-right">
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
   COMPONENTES
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
    <div className="appointment-section-title">
      <span className="appointment-section-number">
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
    <div className="appointment-document-metric">
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

function StatusChart({
  realized,
  absent,
  cancelled,
  confirmed,
  scheduled,
}: {
  realized:
    number;

  absent:
    number;

  cancelled:
    number;

  confirmed:
    number;

  scheduled:
    number;
}) {
  const items = [
    {
      label:
        "Realizados",
      value:
        realized,
      color:
        "#6543ef",
    },
    {
      label:
        "Confirmados",
      value:
        confirmed,
      color:
        "#536de8",
    },
    {
      label:
        "Agendados",
      value:
        scheduled,
      color:
        "#8b9bf4",
    },
    {
      label:
        "Faltas",
      value:
        absent,
      color:
        "#f59e0b",
    },
    {
      label:
        "Cancelados",
      value:
        cancelled,
      color:
        "#ef476f",
    },
  ];

  const max =
    Math.max(
      1,
      ...items.map(
        (
          item
        ) =>
          item.value
      )
    );

  return (
    <div className="appointment-status-chart">
      {items.map(
        (
          item
        ) => (
          <div
            className="appointment-status-row"
            key={
              item.label
            }
          >
            <span>
              {
                item.label
              }
            </span>

            <div className="appointment-status-track">
              <div
                className="appointment-status-fill"
                style={{
                  width: `${(
                    item.value /
                    max
                  ) *
                  100}%`,
                  background:
                    item.color,
                }}
              />
            </div>

            <strong>
              {
                item.value
              }
            </strong>
          </div>
        )
      )}
    </div>
  );
}

interface GroupValue {
  label:
    string;

  value:
    number;
}

function GroupBars({
  groups,
  limit,
}: {
  groups:
    GroupValue[];

  limit?:
    number;
}) {
  const visible =
    typeof limit ===
    "number"
      ? groups.slice(
          0,
          limit
        )
      : groups;

  const max =
    Math.max(
      1,
      ...visible.map(
        (
          group
        ) =>
          group.value
      )
    );

  return (
    <div className="appointment-group-chart">
      {visible.length >
      0 ? (
        visible.map(
          (
            group
          ) => (
            <div
              className="appointment-group-row"
              key={
                group.label
              }
            >
              <span>
                {
                  group.label
                }
              </span>

              <div className="appointment-group-track">
                <div
                  className="appointment-group-fill"
                  style={{
                    width: `${(
                      group.value /
                      max
                    ) *
                    100}%`,
                  }}
                />
              </div>

              <strong>
                {
                  group.value
                }
              </strong>
            </div>
          )
        )
      ) : (
        <p className="appointment-empty">
          Sem dados no período.
        </p>
      )}
    </div>
  );
}

/* =========================================
   AGREGAÇÕES
========================================= */

function buildProfessionalGroups(
  appointments:
    AppointmentReportDocumentItem[]
): GroupValue[] {
  const map =
    new Map<
      string,
      number
    >();

  appointments.forEach(
    (
      appointment
    ) => {
      map.set(
        appointment.professional,
        (
          map.get(
            appointment.professional
          ) ??
          0
        ) +
          1
      );
    }
  );

  return Array.from(
    map.entries()
  )
    .map(
      ([
        label,
        value,
      ]) => ({
        label,
        value,
      })
    )
    .sort(
      (
        a,
        b
      ) =>
        b.value -
        a.value
    );
}

function buildSpecialtyGroups(
  appointments:
    AppointmentReportDocumentItem[]
): GroupValue[] {
  const map =
    new Map<
      string,
      number
    >();

  appointments.forEach(
    (
      appointment
    ) => {
      map.set(
        appointment.specialty,
        (
          map.get(
            appointment.specialty
          ) ??
          0
        ) +
          1
      );
    }
  );

  return Array.from(
    map.entries()
  )
    .map(
      ([
        label,
        value,
      ]) => ({
        label,
        value,
      })
    )
    .sort(
      (
        a,
        b
      ) =>
        b.value -
        a.value
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
   ESTILOS
========================================= */

export const APPOINTMENT_REPORT_DOCUMENT_STYLES = `
  .appointment-report-document {
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

    .appointment-report-document,
    .appointment-report-document * {
      visibility: visible !important;
    }

    .appointment-report-document {
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

    .appointment-report-document * {
      box-sizing: border-box !important;
    }

    .appointment-document-header,
    .appointment-brand-line,
    .appointment-filter-summary,
    .appointment-document-footer {
      display: flex;
    }

    .appointment-document-header {
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #10235f;
    }

    .appointment-brand-line {
      align-items: center;
      gap: 10px;
    }

    .appointment-brand-mark {
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

    .appointment-brand-kicker {
      margin: 0;
      color: #6543ef !important;
      font-size: 6.5pt;
      font-weight: 800;
      letter-spacing: 1.2px;
    }

    .appointment-brand-name {
      margin: 1px 0 0;
      color: #10235f !important;
      font-size: 15pt;
      font-weight: 800;
    }

    .appointment-document-meta {
      text-align: right;
      color: #64748b !important;
      font-size: 7.5pt;
    }

    .appointment-document-meta p {
      margin: 0;
    }

    .appointment-document-meta strong {
      display: block;
      color: #10235f !important;
      font-size: 10pt;
    }

    .appointment-document-title {
      display: grid;
      grid-template-columns: 1fr 210px;
      gap: 22px;
      align-items: end;
      padding: 18px 0 12px;
    }

    .appointment-eyebrow {
      margin: 0 0 4px;
      color: #6543ef !important;
      font-size: 7pt;
      font-weight: 800;
      letter-spacing: 1.1px;
    }

    .appointment-report-document h1 {
      margin: 0;
      color: #10235f !important;
      font-size: 23pt !important;
      line-height: 1.05 !important;
    }

    .appointment-subtitle {
      max-width: 520px;
      margin: 6px 0 0;
      color: #66728f !important;
      font-size: 8.5pt;
    }

    .appointment-period-box {
      padding: 10px 12px;
      border: 1px solid #dfe4f2;
      border-radius: 8px;
      background: #f7f8fc !important;
    }

    .appointment-period-box span,
    .appointment-period-box small {
      display: block;
      color: #7c879f !important;
      font-size: 6.8pt;
    }

    .appointment-period-box strong {
      display: block;
      margin: 3px 0;
      color: #10235f !important;
      font-size: 8.5pt;
    }

    .appointment-filter-summary {
      gap: 20px;
      margin-bottom: 17px;
      padding: 8px 10px;
      border-left: 3px solid #6543ef;
      background: #f7f5ff !important;
      color: #5e6983 !important;
      font-size: 7.5pt;
    }

    .appointment-filter-summary strong {
      color: #2c3754 !important;
    }

    .appointment-document-section {
      margin-top: 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .appointment-two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      align-items: start;
    }

    .appointment-section-title {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      margin-bottom: 10px;
    }

    .appointment-section-number {
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

    .appointment-section-title h2 {
      margin: 0;
      color: #10235f !important;
      font-size: 11pt !important;
      line-height: 1.2 !important;
    }

    .appointment-section-title p {
      margin: 2px 0 0;
      color: #7a859e !important;
      font-size: 7pt;
    }

    .appointment-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .appointment-document-metric {
      padding: 10px;
      border: 1px solid #e2e6f0;
      border-radius: 8px;
      background: #ffffff !important;
    }

    .appointment-document-metric > span {
      display: block;
      color: #7b869d !important;
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .appointment-document-metric > strong {
      display: block;
      margin-top: 3px;
      color: #10235f !important;
      font-size: 14pt;
      line-height: 1.1;
    }

    .appointment-document-metric small {
      display: block;
      margin-top: 3px;
      color: #98a1b5 !important;
      font-size: 6.5pt;
    }

    .appointment-status-chart,
    .appointment-group-chart {
      display: grid;
      gap: 9px;
      padding: 12px;
      border: 1px solid #e4e8f2;
      border-radius: 9px;
      background: #fbfbfd !important;
    }

    .appointment-status-row {
      display: grid;
      grid-template-columns: 78px 1fr 22px;
      gap: 8px;
      align-items: center;
      color: #66728b !important;
      font-size: 7pt;
    }

    .appointment-status-track,
    .appointment-group-track {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: #eceff5 !important;
    }

    .appointment-status-fill,
    .appointment-group-fill {
      height: 100%;
      border-radius: 999px;
    }

    .appointment-status-row strong,
    .appointment-group-row strong {
      color: #26324d !important;
      text-align: right;
    }

    .appointment-group-row {
      display: grid;
      grid-template-columns: 145px 1fr 22px;
      gap: 8px;
      align-items: center;
      color: #66728b !important;
      font-size: 7pt;
    }

    .appointment-group-fill {
      background: #6543ef !important;
    }

    .appointment-analysis-box {
      padding: 12px 14px;
      border: 1px solid #dfe4f2;
      border-left: 4px solid #6543ef;
      border-radius: 8px;
      background: #faf9ff !important;
      color: #536078 !important;
      font-size: 8pt;
    }

    .appointment-analysis-box p {
      margin: 0 0 7px;
    }

    .appointment-analysis-box p:last-child {
      margin-bottom: 0;
    }

    .appointment-analysis-box strong {
      color: #27334f !important;
    }

    .appointment-detail-section {
      break-before: page;
      page-break-before: always;
    }

    .appointment-document-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
    }

    .appointment-document-table thead {
      display: table-header-group;
    }

    .appointment-document-table th {
      padding: 7px 6px;
      border-bottom: 1.5px solid #10235f;
      background: #f4f5f9 !important;
      color: #36415c !important;
      text-align: left;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: .3px;
    }

    .appointment-document-table td {
      padding: 7px 6px;
      border-bottom: 1px solid #e6e9f1;
      color: #556179 !important;
    }

    .appointment-document-table td strong {
      color: #26324e !important;
    }

    .appointment-document-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .appointment-status-text {
      font-weight: 700;
      color: #4c5a78 !important;
    }

    .appointment-document-footer {
      justify-content: space-between;
      gap: 20px;
      margin-top: 20px;
      padding-top: 9px;
      border-top: 1px solid #d9deea;
      color: #8a94a9 !important;
      font-size: 6.5pt;
    }

    .appointment-document-footer strong,
    .appointment-document-footer span {
      display: block;
    }

    .appointment-document-footer strong {
      color: #10235f !important;
    }

    .appointment-footer-right {
      text-align: right;
    }

    .appointment-empty {
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