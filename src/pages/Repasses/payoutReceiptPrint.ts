export interface PayoutReceiptAppointment {
  patient: string;
  serviceDate: string;
  amount: number;
}

export interface PayoutReceiptData {
  receiptNumber: string;

  clinicName: string;
  unitName?: string;

  professional: string;
  specialty: string;
  competence: string;

  appointments: PayoutReceiptAppointment[];

  totalAmount: number;

  paymentDate: string;
  paymentMethod: string;

  bankAccountName: string;

  observation?: string;
}

function escapeHtml(
  value:
    string |
    undefined
) {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function formatCurrency(
  value:
    number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",
      currency:
        "BRL",
    }
  ).format(
    value
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

  const normalized =
    value.includes(
      "T"
    )
      ? value.slice(
          0,
          10
        )
      : value;

  const [
    year,
    month,
    day,
  ] =
    normalized.split(
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

function formatCompetence(
  value:
    string
) {
  const [
    year,
    month,
  ] =
    value.split(
      "-"
    );

  if (
    !year ||
    !month
  ) {
    return value;
  }

  return `${month}/${year}`;
}

export function openPayoutReceiptPrint(
  data:
    PayoutReceiptData
) {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=430,height=780"
    );

  if (
    !printWindow
  ) {
    window.alert(
      "O navegador bloqueou a abertura do comprovante. Permita pop-ups para este site e tente novamente."
    );

    return;
  }

  const appointmentsHtml =
    data.appointments
      .map(
        (
          appointment,
          index
        ) => `
          <div class="appointment">
            <div class="appointment-top">
              <strong>
                ${index + 1}. ${escapeHtml(
                  appointment.patient
                )}
              </strong>

              <span>
                ${formatCurrency(
                  appointment.amount
                )}
              </span>
            </div>

            <div class="appointment-date">
              Atendimento em
              ${escapeHtml(
                formatDate(
                  appointment.serviceDate
                )
              )}
            </div>
          </div>
        `
      )
      .join(
        ""
      );

  const observationHtml =
    data.observation?.trim()
      ? `
        <div class="observation">
          <div class="small-title">
            Observação
          </div>

          <div class="observation-text">
            ${escapeHtml(
              data.observation
            )}
          </div>
        </div>
      `
      : "";

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />

        <title>
          Comprovante de repasse
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111111;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          body {
            width: 80mm;
            margin: 0 auto;
            padding: 3mm 4mm;
          }

          .receipt {
            width: 72mm;
            max-width: 72mm;
            margin: 0 auto;
          }

          .header {
            padding-bottom: 3mm;
            border-bottom: 1px dashed #222222;
            text-align: center;
          }

          .clinic {
            font-size: 14px;
            font-weight: 900;
            line-height: 1.25;
          }

          .unit {
            margin-top: 1mm;
            font-size: 8.5px;
            font-weight: 700;
          }

          .title {
            margin-top: 3mm;
            font-size: 12px;
            font-weight: 900;
            line-height: 1.3;
            text-transform: uppercase;
          }

          .number {
            margin-top: 1mm;
            font-size: 8px;
          }

          .section {
            padding: 3mm 0;
            border-bottom: 1px dashed #222222;
          }

          .small-title {
            margin-bottom: 1.5mm;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            padding: 1mm 0;
            font-size: 9px;
            line-height: 1.4;
          }

          .row .label {
            color: #444444;
          }

          .row .value {
            max-width: 45mm;
            font-weight: 700;
            text-align: right;
            overflow-wrap: anywhere;
          }

          .total {
            padding: 4mm 0;
            border-bottom: 1px dashed #222222;
            text-align: center;
          }

          .total-label {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .total-value {
            margin-top: 1mm;
            font-size: 21px;
            font-weight: 900;
          }

          .appointment {
            padding: 2mm 0;
            border-bottom: 1px dotted #aaaaaa;
          }

          .appointment:last-child {
            border-bottom: 0;
          }

          .appointment-top {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            font-size: 8.8px;
            line-height: 1.35;
          }

          .appointment-top strong {
            max-width: 47mm;
          }

          .appointment-date {
            margin-top: 0.8mm;
            color: #555555;
            font-size: 7.5px;
          }

          .observation {
            padding: 3mm 0;
            border-bottom: 1px dashed #222222;
          }

          .observation-text {
            font-size: 8.5px;
            line-height: 1.45;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .declaration {
            padding-top: 3mm;
            font-size: 8px;
            line-height: 1.5;
            text-align: center;
          }

          .signature {
            width: 55mm;
            margin: 11mm auto 0;
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #222222;
          }

          .signature-name {
            margin-top: 1.3mm;
            font-size: 8.5px;
            font-weight: 700;
          }

          .signature-help {
            margin-top: 0.7mm;
            font-size: 7px;
            color: #555555;
          }

          .footer {
            margin-top: 5mm;
            padding-top: 2.5mm;
            border-top: 1px dashed #222222;
            font-size: 7px;
            line-height: 1.4;
            text-align: center;
            color: #555555;
          }

          .developer {
            margin-top: 1mm;
            font-weight: 700;
          }

          .actions {
            display: flex;
            width: 72mm;
            margin: 4mm auto 0;
            gap: 2mm;
          }

          .actions button {
            flex: 1;
            cursor: pointer;
            border: 0;
            border-radius: 2mm;
            padding: 3mm 2mm;
            background: #111111;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 800;
          }

          .actions button.secondary {
            border: 1px solid #bbbbbb;
            background: #ffffff;
            color: #333333;
          }

          @page {
            size: 80mm auto;
            margin: 0;
          }

          @media print {
            html,
            body {
              width: 80mm;
              min-width: 80mm;
              margin: 0 !important;
              padding: 0 !important;
            }

            body {
              padding: 3mm 4mm !important;
            }

            .receipt {
              width: 72mm !important;
              max-width: 72mm !important;
            }

            .actions {
              display: none !important;
            }
          }
        </style>
      </head>

      <body>
        <main class="receipt">
          <header class="header">
            <div class="clinic">
              ${escapeHtml(
                data.clinicName
              )}
            </div>

            ${
              data.unitName
                ? `
                  <div class="unit">
                    ${escapeHtml(
                      data.unitName
                    )}
                  </div>
                `
                : ""
            }

            <div class="title">
              Comprovante de Repasse Profissional
            </div>

            <div class="number">
              Nº ${escapeHtml(
                data.receiptNumber
              )}
            </div>
          </header>

          <section class="section">
            <div class="row">
              <span class="label">
                Profissional
              </span>

              <span class="value">
                ${escapeHtml(
                  data.professional
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Especialidade
              </span>

              <span class="value">
                ${escapeHtml(
                  data.specialty
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Competência
              </span>

              <span class="value">
                ${escapeHtml(
                  formatCompetence(
                    data.competence
                  )
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Atendimentos
              </span>

              <span class="value">
                ${data.appointments.length}
              </span>
            </div>
          </section>

          <section class="total">
            <div class="total-label">
              Valor total pago
            </div>

            <div class="total-value">
              ${formatCurrency(
                data.totalAmount
              )}
            </div>
          </section>

          <section class="section">
            <div class="row">
              <span class="label">
                Data
              </span>

              <span class="value">
                ${escapeHtml(
                  formatDate(
                    data.paymentDate
                  )
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Forma
              </span>

              <span class="value">
                ${escapeHtml(
                  data.paymentMethod
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Conta
              </span>

              <span class="value">
                ${escapeHtml(
                  data.bankAccountName
                )}
              </span>
            </div>
          </section>

          <section class="section">
            <div class="small-title">
              Atendimentos incluídos
            </div>

            ${appointmentsHtml}
          </section>

          ${observationHtml}

          <div class="declaration">
            Declaramos o pagamento do valor acima referente aos repasses profissionais dos atendimentos relacionados neste comprovante.
          </div>

          <div class="signature">
            <div class="signature-line"></div>

            <div class="signature-name">
              ${escapeHtml(
                data.professional
              )}
            </div>

            <div class="signature-help">
              Assinatura do profissional
            </div>
          </div>

          <footer class="footer">
            Comprovante emitido em
            ${escapeHtml(
              formatDate(
                data.paymentDate
              )
            )}

            <div class="developer">
              Desenvolvido por AC SOFTWARE
            </div>
          </footer>
        </main>

        <div class="actions">
          <button
            type="button"
            onclick="window.print()"
          >
            Imprimir
          </button>

          <button
            type="button"
            class="secondary"
            onclick="window.close()"
          >
            Fechar
          </button>
        </div>

        <script>
          window.addEventListener(
            "load",
            function () {
              setTimeout(
                function () {
                  window.print();
                },
                250
              );
            }
          );
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();

  printWindow.document.write(
    html
  );

  printWindow.document.close();

  printWindow.focus();
}