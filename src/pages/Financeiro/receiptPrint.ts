export interface ReceiptPrintData {
  receiptNumber: string;
  clinicName: string;
  unitName?: string;
  clinicAddress?: string;
  clinicCityState?: string;
  clinicPhone?: string;

  patient: string;
  responsible?: string;

  description: string;
  specialty?: string;

  amount: number;
  paymentMethod: string;

  paymentDate: string;
  paymentTime: string;

  observation?: string;

  receivedBy?: string;
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

export function openReceiptPrint(
  data:
    ReceiptPrintData
) {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=430,height=760"
    );

  if (
    !printWindow
  ) {
    window.alert(
      "O navegador bloqueou a abertura do recibo. Permita pop-ups para este site e tente novamente."
    );

    return;
  }

  const addressLine =
    [
      data.clinicAddress,
      data.clinicCityState,
    ]
      .filter(
        Boolean
      )
      .join(
        " • "
      );

  const responsibleRow =
    data.responsible?.trim()
      ? `
        <div class="row">
          <span class="label">Responsável</span>
          <span class="value">${escapeHtml(
            data.responsible
          )}</span>
        </div>
      `
      : "";

  const specialtyRow =
    data.specialty?.trim()
      ? `
        <div class="row">
          <span class="label">Atendimento</span>
          <span class="value">${escapeHtml(
            data.specialty
          )}</span>
        </div>
      `
      : "";

  const observationBlock =
    data.observation?.trim()
      ? `
        <div class="observation">
          <div class="observation-title">Observação</div>
          <div class="observation-text">${escapeHtml(
            data.observation
          )}</div>
        </div>
      `
      : "";

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />

        <title>
          Recibo ${escapeHtml(
            data.receiptNumber
          )}
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
            border: 0;
            border-radius: 0;
            background: #ffffff;
            box-shadow: none;
          }

          .top-accent {
            display: none;
          }

          .header {
            display: block;
            padding: 0 0 3mm;
            border-bottom: 1px dashed #222222;
            text-align: center;
          }

          .clinic-name {
            margin: 0;
            color: #111111;
            font-size: 15px;
            font-weight: 800;
            line-height: 1.25;
          }

          .unit-name {
            margin-top: 1.5mm;
            color: #222222;
            font-size: 10px;
            font-weight: 700;
          }

          .clinic-meta {
            margin-top: 1.5mm;
            color: #333333;
            font-size: 8.5px;
            line-height: 1.4;
          }

          .receipt-title {
            margin-top: 3mm;
            text-align: center;
          }

          .receipt-title h1 {
            margin: 0;
            color: #111111;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.08em;
          }

          .receipt-number {
            margin-top: 1mm;
            color: #333333;
            font-size: 9px;
            font-weight: 700;
          }

          .body {
            padding: 3mm 0 0;
          }

          .paid-box {
            display: block;
            margin-bottom: 3mm;
            padding: 3mm 0;
            border: 0;
            border-bottom: 1px dashed #222222;
            border-radius: 0;
            background: #ffffff;
            text-align: center;
          }

          .paid-label {
            color: #333333;
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .paid-value {
            margin-top: 1mm;
            color: #111111;
            font-size: 22px;
            font-weight: 900;
          }

          .paid-status {
            display: inline-block;
            margin-top: 1.5mm;
            padding: 1mm 2.5mm;
            border: 1px solid #222222;
            border-radius: 999px;
            background: #ffffff;
            color: #111111;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .section-title {
            margin: 0 0 2mm;
            color: #111111;
            font-size: 9px;
            font-weight: 800;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .details {
            overflow: visible;
            border: 0;
            border-radius: 0;
          }

          .row {
            display: block;
            min-height: 0;
            padding: 1.3mm 0;
            border-bottom: 0;
          }

          .label {
            display: block;
            color: #444444;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .value {
            display: block;
            margin-top: 0.5mm;
            color: #111111;
            font-size: 10px;
            font-weight: 700;
            line-height: 1.35;
            text-align: left;
            overflow-wrap: anywhere;
          }

          .observation {
            margin-top: 2mm;
            padding: 2mm 0;
            border: 0;
            border-top: 1px dashed #222222;
            border-bottom: 1px dashed #222222;
            border-radius: 0;
            background: #ffffff;
          }

          .observation-title {
            color: #222222;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .observation-text {
            margin-top: 1mm;
            color: #111111;
            font-size: 9px;
            line-height: 1.4;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .declaration {
            margin-top: 3mm;
            color: #222222;
            font-size: 8.5px;
            line-height: 1.45;
            text-align: justify;
          }

          .signature {
            width: 58mm;
            margin: 10mm auto 0;
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #222222;
          }

          .signature-name {
            margin-top: 1.5mm;
            color: #111111;
            font-size: 9px;
            font-weight: 700;
          }

          .signature-help {
            margin-top: 0.8mm;
            color: #444444;
            font-size: 8px;
          }

          .footer {
            display: block;
            margin-top: 5mm;
            padding-top: 2.5mm;
            border-top: 1px dashed #222222;
            color: #444444;
            font-size: 7.5px;
            line-height: 1.5;
            text-align: center;
          }

          .developer {
            display: block;
            margin-top: 1mm;
          }

          .developer strong {
            color: #111111;
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
            font-size: 9px;
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
              background: #ffffff !important;
            }

            body {
              padding: 3mm 4mm !important;
            }

            .receipt {
              width: 72mm !important;
              max-width: 72mm !important;
              margin: 0 auto !important;
            }

            .actions {
              display: none !important;
            }
          }

        </style>
      </head>

      <body>
        <main class="receipt">
          <div class="top-accent"></div>

          <header class="header">
            <div>
              <h2 class="clinic-name">
                ${escapeHtml(
                  data.clinicName
                )}
              </h2>

              ${
                data.unitName
                  ? `
                    <div class="unit-name">
                      ${escapeHtml(
                        data.unitName
                      )}
                    </div>
                  `
                  : ""
              }

              <div class="clinic-meta">
                ${
                  addressLine
                    ? `
                      <div>
                        ${escapeHtml(
                          addressLine
                        )}
                      </div>
                    `
                    : ""
                }

                ${
                  data.clinicPhone
                    ? `
                      <div>
                        ${escapeHtml(
                          data.clinicPhone
                        )}
                      </div>
                    `
                    : ""
                }
              </div>
            </div>

            <div class="receipt-title">
              <h1>RECIBO</h1>

              <div class="receipt-number">
                Nº ${escapeHtml(
                  data.receiptNumber
                )}
              </div>
            </div>
          </header>

          <section class="body">
            <div class="paid-box">
              <div>
                <div class="paid-label">
                  Valor recebido
                </div>

                <div class="paid-value">
                  ${formatCurrency(
                    data.amount
                  )}
                </div>
              </div>

              <div class="paid-status">
                Pago
              </div>
            </div>

            <h3 class="section-title">
              Dados do recebimento
            </h3>

            <div class="details">
              <div class="row">
                <span class="label">
                  Paciente
                </span>

                <span class="value">
                  ${escapeHtml(
                    data.patient
                  )}
                </span>
              </div>

              ${responsibleRow}

              <div class="row">
                <span class="label">
                  Referente a
                </span>

                <span class="value">
                  ${escapeHtml(
                    data.description
                  )}
                </span>
              </div>

              ${specialtyRow}

              <div class="row">
                <span class="label">
                  Forma de pagamento
                </span>

                <span class="value">
                  ${escapeHtml(
                    data.paymentMethod
                  )}
                </span>
              </div>

              <div class="row">
                <span class="label">
                  Data do pagamento
                </span>

                <span class="value">
                  ${escapeHtml(
                    formatDate(
                      data.paymentDate
                    )
                  )} às ${escapeHtml(
                    data.paymentTime
                  )}
                </span>
              </div>
            </div>

            ${observationBlock}

            <p class="declaration">
              Declaramos, para os devidos fins, o recebimento do valor acima identificado,
              referente ao serviço descrito neste recibo.
            </p>

            <div class="signature">
              <div class="signature-line"></div>

              <div class="signature-name">
                ${escapeHtml(
                  data.clinicName
                )}
              </div>

              <div class="signature-help">
                Recebido por ${escapeHtml(
                  data.receivedBy ||
                    "Recepção"
                )}
              </div>
            </div>

            <footer class="footer">
              <span>
                Documento emitido em
                ${escapeHtml(
                  formatDate(
                    data.paymentDate
                  )
                )}
                às
                ${escapeHtml(
                  data.paymentTime
                )}
              </span>

              <span class="developer">
                Desenvolvido por
                <strong>AC SOFTWARE</strong>
              </span>
            </footer>
          </section>
        </main>

        <div class="actions">
          <button
            type="button"
            onclick="window.print()"
          >
            Imprimir recibo
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