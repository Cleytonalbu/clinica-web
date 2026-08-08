import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  History,
  Printer,
  ShieldCheck,
  Signature,
} from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  ReportsSettings,
  ReportTypeSetting,
} from "./settingsStorage";

interface Props {
  settings:
    ReportsSettings;

  onChange:
    (
      settings:
        ReportsSettings
    ) => void;
}

export default function ReportsSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof ReportsSettings
  >(
    field: K,
    value:
      ReportsSettings[K]
  ) {
    onChange({
      ...settings,

      [field]:
        value,
    });
  }

  function updateReportType(
    id:
      number,

    data:
      Partial<ReportTypeSetting>
  ) {
    onChange({
      ...settings,

      reportTypes:
        settings.reportTypes.map(
          (
            report
          ) =>
            report.id ===
            id
              ? {
                  ...report,

                  ...data,
                }
              : report
        ),
    });
  }

  const activeReports =
    settings.reportTypes.filter(
      (
        report
      ) =>
        report.active
    ).length;

  const pdfReports =
    settings.reportTypes.filter(
      (
        report
      ) =>
        report.active &&
        report.allowPdf
    ).length;

  const excelReports =
    settings.reportTypes.filter(
      (
        report
      ) =>
        report.active &&
        report.allowExcel
    ).length;

  const chartReports =
    settings.reportTypes.filter(
      (
        report
      ) =>
        report.active &&
        report.includeCharts
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Relatórios ativos"
          value={String(
            activeReports
          )}
        />

        <SummaryCard
          title="Exportação PDF"
          value={String(
            pdfReports
          )}
        />

        <SummaryCard
          title="Exportação Excel"
          value={String(
            excelReports
          )}
        />

        <SummaryCard
          title="Com gráficos"
          value={String(
            chartReports
          )}
        />
      </div>

      <PageCard
        title="Tipos de Relatório"
        description="Defina quais relatórios estarão disponíveis no sistema."
      >
        <div className="space-y-4">
          {settings.reportTypes.map(
            (
              report
            ) => (
              <div
                key={
                  report.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        report.active
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <FileText
                        size={22}
                      />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        {
                          report.name
                        }
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {
                          report.description
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateReportType(
                        report.id,
                        {
                          active:
                            !report.active,
                        }
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      report.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {report.active
                      ? "Ativo"
                      : "Inativo"}
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                  <BooleanSetting
                    title="PDF"
                    description="Permitir exportação em PDF."
                    checked={
                      report.allowPdf
                    }
                    disabled={
                      !report.active ||
                      !settings.allowPdfExport
                    }
                    onChange={(
                      value
                    ) =>
                      updateReportType(
                        report.id,
                        {
                          allowPdf:
                            value,
                        }
                      )
                    }
                  />

                  <BooleanSetting
                    title="Excel"
                    description="Permitir exportação em planilha."
                    checked={
                      report.allowExcel
                    }
                    disabled={
                      !report.active ||
                      !settings.allowExcelExport
                    }
                    onChange={(
                      value
                    ) =>
                      updateReportType(
                        report.id,
                        {
                          allowExcel:
                            value,
                        }
                      )
                    }
                  />

                  <BooleanSetting
                    title="Impressão"
                    description="Permitir impressão direta."
                    checked={
                      report.allowPrint
                    }
                    disabled={
                      !report.active ||
                      !settings.allowPrinting
                    }
                    onChange={(
                      value
                    ) =>
                      updateReportType(
                        report.id,
                        {
                          allowPrint:
                            value,
                        }
                      )
                    }
                  />

                  <BooleanSetting
                    title="Gráficos"
                    description="Incluir visualizações gráficas."
                    checked={
                      report.includeCharts
                    }
                    disabled={
                      !report.active
                    }
                    onChange={(
                      value
                    ) =>
                      updateReportType(
                        report.id,
                        {
                          includeCharts:
                            value,
                        }
                      )
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Identidade dos Relatórios"
        description="Defina quais informações institucionais aparecerão nos documentos."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Exibir logo da clínica"
            description="Inclui a identidade visual no cabeçalho."
            checked={
              settings.showClinicLogo
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicLogo",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir nome da clínica"
            description="Mostra o nome institucional nos relatórios."
            checked={
              settings.showClinicName
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicName",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir CNPJ"
            description="Inclui o documento da clínica."
            checked={
              settings.showClinicDocument
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicDocument",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir endereço"
            description="Inclui endereço institucional."
            checked={
              settings.showClinicAddress
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicAddress",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir telefone"
            description="Inclui telefone de contato."
            checked={
              settings.showClinicPhone
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicPhone",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir e-mail"
            description="Inclui e-mail institucional."
            checked={
              settings.showClinicEmail
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicEmail",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Cabeçalho e Rodapé"
        description="Personalize textos e informações exibidas em todas as páginas."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Utilizar cabeçalho"
            description="Exibe uma área padrão no início de cada relatório."
            checked={
              settings.includeHeader
            }
            onChange={(
              value
            ) =>
              updateField(
                "includeHeader",
                value
              )
            }
          />

          <BooleanSetting
            title="Utilizar rodapé"
            description="Exibe uma área padrão no final das páginas."
            checked={
              settings.includeFooter
            }
            onChange={(
              value
            ) =>
              updateField(
                "includeFooter",
                value
              )
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FormField
            label="Texto do cabeçalho"
          >
            <Input
              disabled={
                !settings.includeHeader
              }
              value={
                settings.headerText
              }
              onChange={(
                event
              ) =>
                updateField(
                  "headerText",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Texto do rodapé"
          >
            <Input
              disabled={
                !settings.includeFooter
              }
              value={
                settings.footerText
              }
              onChange={(
                event
              ) =>
                updateField(
                  "footerText",
                  event.target.value
                )
              }
            />
          </FormField>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Exibir data de geração"
            description="Mostra quando o relatório foi criado."
            checked={
              settings.showGenerationDate
            }
            onChange={(
              value
            ) =>
              updateField(
                "showGenerationDate",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir usuário que gerou"
            description="Mostra qual usuário realizou a geração."
            checked={
              settings.showGeneratedBy
            }
            onChange={(
              value
            ) =>
              updateField(
                "showGeneratedBy",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir número das páginas"
            description="Adiciona paginação aos documentos."
            checked={
              settings.showPageNumbers
            }
            onChange={(
              value
            ) =>
              updateField(
                "showPageNumbers",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir registro profissional"
            description="Inclui CRM, CRP, CREFITO ou outro registro profissional."
            checked={
              settings.showProfessionalRegistration
            }
            onChange={(
              value
            ) =>
              updateField(
                "showProfessionalRegistration",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Assinaturas"
        description="Defina as assinaturas que podem aparecer nos documentos."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Assinatura do profissional"
            description="Reserva área para assinatura do profissional responsável."
            checked={
              settings.includeProfessionalSignature
            }
            onChange={(
              value
            ) =>
              updateField(
                "includeProfessionalSignature",
                value
              )
            }
          />

          <BooleanSetting
            title="Responsável técnico"
            description="Adiciona assinatura do responsável técnico da clínica."
            checked={
              settings.includeTechnicalResponsibleSignature
            }
            onChange={(
              value
            ) =>
              updateField(
                "includeTechnicalResponsibleSignature",
                value
              )
            }
          />
        </div>

        {settings.includeTechnicalResponsibleSignature && (
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <FormField
              label="Nome do responsável técnico"
            >
              <Input
                value={
                  settings.technicalResponsibleName
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "technicalResponsibleName",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Registro profissional"
            >
              <Input
                value={
                  settings.technicalResponsibleRegistration
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "technicalResponsibleRegistration",
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Formato Padrão"
        description="Defina o padrão utilizado quando um novo relatório for gerado."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Orientação"
          >
            <Select
              value={
                settings.defaultOrientation
              }
              onChange={(
                event
              ) =>
                updateField(
                  "defaultOrientation",
                  event.target.value as ReportsSettings["defaultOrientation"]
                )
              }
            >
              <option value="portrait">
                Retrato
              </option>

              <option value="landscape">
                Paisagem
              </option>
            </Select>
          </FormField>

          <FormField
            label="Tamanho do papel"
          >
            <Select
              value={
                settings.paperSize
              }
              onChange={(
                event
              ) =>
                updateField(
                  "paperSize",
                  event.target.value as ReportsSettings["paperSize"]
                )
              }
            >
              <option value="A4">
                A4
              </option>

              <option value="Letter">
                Carta
              </option>
            </Select>
          </FormField>

          <BooleanSetting
            title="Gráficos por padrão"
            description="Inclui gráficos quando disponíveis."
            checked={
              settings.defaultIncludeCharts
            }
            onChange={(
              value
            ) =>
              updateField(
                "defaultIncludeCharts",
                value
              )
            }
          />

          <BooleanSetting
            title="Registros inativos"
            description="Inclui registros inativos por padrão."
            checked={
              settings.defaultIncludeInactiveRecords
            }
            onChange={(
              value
            ) =>
              updateField(
                "defaultIncludeInactiveRecords",
                value
              )
            }
          />
        </div>

        <div className="mt-5">
          <BooleanSetting
            title="Valores financeiros por padrão"
            description="Inclui valores financeiros quando o relatório permitir."
            checked={
              settings.defaultIncludeFinancialValues
            }
            onChange={(
              value
            ) =>
              updateField(
                "defaultIncludeFinancialValues",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Privacidade"
        description="Controle informações sensíveis nos relatórios."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Permitir dados clínicos sensíveis"
            description="Autoriza relatórios contendo informações clínicas completas."
            checked={
              settings.allowSensitiveClinicalData
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowSensitiveClinicalData",
                value
              )
            }
          />

          <BooleanSetting
            title="Exigir motivo para relatório sensível"
            description="Solicita justificativa antes de gerar conteúdo clínico sensível."
            checked={
              settings.requireReasonForSensitiveReport
            }
            disabled={
              !settings.allowSensitiveClinicalData
            }
            onChange={(
              value
            ) =>
              updateField(
                "requireReasonForSensitiveReport",
                value
              )
            }
          />

          <BooleanSetting
            title="Anonimizar dados do paciente"
            description="Substitui dados identificáveis quando necessário."
            checked={
              settings.anonymizePatientData
            }
            onChange={(
              value
            ) =>
              updateField(
                "anonymizePatientData",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir documento do paciente"
            description="Permite exibir CPF ou documento cadastrado."
            checked={
              settings.showPatientDocument
            }
            disabled={
              settings.anonymizePatientData
            }
            onChange={(
              value
            ) =>
              updateField(
                "showPatientDocument",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Exportação"
        description="Configure os formatos que estarão disponíveis globalmente."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ExportCard
            icon={
              <FileText
                size={22}
              />
            }
            title="PDF"
            description="Permite baixar os relatórios em formato PDF."
            checked={
              settings.allowPdfExport
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowPdfExport",
                value
              )
            }
          />

          <ExportCard
            icon={
              <FileSpreadsheet
                size={22}
              />
            }
            title="Excel"
            description="Permite exportação estruturada para planilhas."
            checked={
              settings.allowExcelExport
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowExcelExport",
                value
              )
            }
          />

          <ExportCard
            icon={
              <Printer
                size={22}
              />
            }
            title="Impressão"
            description="Permite impressão direta dos relatórios."
            checked={
              settings.allowPrinting
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowPrinting",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Histórico de Geração"
        description="Configure o registro de auditoria dos relatórios gerados."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
          <BooleanSetting
            title="Manter histórico"
            description="Registra quem gerou, quando gerou e qual relatório foi utilizado."
            checked={
              settings.keepGenerationHistory
            }
            onChange={(
              value
            ) =>
              updateField(
                "keepGenerationHistory",
                value
              )
            }
          />

          <FormField
            label="Manter histórico por"
          >
            <Select
              disabled={
                !settings.keepGenerationHistory
              }
              value={String(
                settings.generationHistoryDays
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "generationHistoryDays",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="30">
                30 dias
              </option>

              <option value="90">
                90 dias
              </option>

              <option value="180">
                180 dias
              </option>

              <option value="365">
                1 ano
              </option>

              <option value="730">
                2 anos
              </option>

              <option value="1825">
                5 anos
              </option>
            </Select>
          </FormField>
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <BarChart3
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Central de relatórios
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Essas configurações servirão como padrão para os relatórios clínicos, financeiros, administrativos e gerenciais. Depois integraremos essas regras diretamente à tela de Relatórios.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function BooleanSetting({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title:
    string;

  description:
    string;

  checked:
    boolean;

  disabled?:
    boolean;

  onChange:
    (
      value:
        boolean
    ) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
          : "cursor-pointer border-slate-200 bg-white hover:border-indigo-200"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {
            title
          }
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {
            description
          }
        </p>
      </div>

      <span
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          disabled={
            disabled
          }
          checked={
            checked
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.checked
            )
          }
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </label>
  );
}

function ExportCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    (
      value:
        boolean
    ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={`rounded-2xl border p-5 text-left transition ${
        checked
          ? "border-indigo-200 bg-indigo-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          checked
            ? "bg-white text-indigo-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {
          icon
        }
      </div>

      <p className="mt-4 font-bold text-slate-900">
        {
          title
        }
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>

      <p
        className={`mt-4 text-xs font-bold ${
          checked
            ? "text-emerald-600"
            : "text-slate-400"
        }`}
      >
        {checked
          ? "Disponível"
          : "Indisponível"}
      </p>
    </button>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {
          value
        }
      </p>
    </div>
  );
}