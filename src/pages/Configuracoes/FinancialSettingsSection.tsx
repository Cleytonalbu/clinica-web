import {
  Banknote,
  BellRing,
  CircleDollarSign,
  CreditCard,
  FileText,
  Percent,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  FinancialSettings,
  PaymentMethodSetting,
} from "./settingsStorage";

interface Props {
  settings:
    FinancialSettings;

  onChange:
    (
      settings:
        FinancialSettings
    ) => void;
}

export default function FinancialSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof FinancialSettings
  >(
    field: K,
    value:
      FinancialSettings[K]
  ) {
    onChange({
      ...settings,

      [field]:
        value,
    });
  }

  function updatePaymentMethod(
    id: number,
    data:
      Partial<PaymentMethodSetting>
  ) {
    onChange({
      ...settings,

      paymentMethods:
        settings.paymentMethods.map(
          (
            method
          ) =>
            method.id === id
              ? {
                  ...method,

                  ...data,
                }
              : method
        ),
    });
  }

  const activeMethods =
    settings.paymentMethods.filter(
      (
        method
      ) =>
        method.active
    ).length;

  const installmentMethods =
    settings.paymentMethods.filter(
      (
        method
      ) =>
        method.active &&
        method.allowInstallments
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Formas de pagamento"
          value={String(
            settings.paymentMethods.length
          )}
        />

        <SummaryCard
          title="Formas ativas"
          value={String(
            activeMethods
          )}
        />

        <SummaryCard
          title="Com parcelamento"
          value={String(
            installmentMethods
          )}
        />

        <SummaryCard
          title="Vencimento padrão"
          value={`Dia ${settings.defaultDueDay}`}
        />
      </div>

      <PageCard
        title="Formas de Pagamento"
        description="Defina quais formas de pagamento estarão disponíveis no sistema."
      >
        <div className="space-y-4">
          {settings.paymentMethods.map(
            (
              method
            ) => (
              <div
                key={
                  method.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_160px_170px_170px_140px]">
                  <FormField
                    label="Forma de pagamento"
                  >
                    <Input
                      value={
                        method.name
                      }
                      onChange={(
                        event
                      ) =>
                        updatePaymentMethod(
                          method.id,
                          {
                            name:
                              event.target.value,
                          }
                        )
                      }
                    />
                  </FormField>

                  <FormField
                    label="Taxa (%)"
                  >
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        method.feePercent
                      }
                      onChange={(
                        event
                      ) =>
                        updatePaymentMethod(
                          method.id,
                          {
                            feePercent:
                              Math.max(
                                Number(
                                  event.target.value
                                ) ||
                                  0,
                                0
                              ),
                          }
                        )
                      }
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Parcelamento
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        updatePaymentMethod(
                          method.id,
                          {
                            allowInstallments:
                              !method.allowInstallments,

                            maxInstallments:
                              method.allowInstallments
                                ? 1
                                : Math.max(
                                    method.maxInstallments,
                                    2
                                  ),
                          }
                        )
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        method.allowInstallments
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {method.allowInstallments
                        ? "Permitido"
                        : "Não permitido"}
                    </button>
                  </div>

                  <FormField
                    label="Máx. parcelas"
                  >
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      disabled={
                        !method.allowInstallments
                      }
                      value={
                        method.maxInstallments
                      }
                      onChange={(
                        event
                      ) =>
                        updatePaymentMethod(
                          method.id,
                          {
                            maxInstallments:
                              Math.max(
                                Number(
                                  event.target.value
                                ) ||
                                  1,
                                1
                              ),
                          }
                        )
                      }
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Status
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        updatePaymentMethod(
                          method.id,
                          {
                            active:
                              !method.active,
                          }
                        )
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        method.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {method.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Cobranças"
        description="Configure como as cobranças devem ser geradas e tratadas pelo sistema."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Gerar cobrança automaticamente"
            description="Cria cobranças financeiras automaticamente conforme as regras definidas."
            checked={
              settings.generateChargeAutomatically
            }
            onChange={(
              value
            ) =>
              updateField(
                "generateChargeAutomatically",
                value
              )
            }
          />

          <BooleanSetting
            title="Cobrar ao criar agendamento"
            description="Gera a cobrança no momento em que o atendimento é agendado."
            checked={
              settings.chargeOnAppointmentCreation
            }
            onChange={(
              value
            ) =>
              updateField(
                "chargeOnAppointmentCreation",
                value
              )
            }
          />

          <BooleanSetting
            title="Cobrar após atendimento"
            description="Gera ou confirma a cobrança após a realização do atendimento."
            checked={
              settings.chargeAfterAppointment
            }
            onChange={(
              value
            ) =>
              updateField(
                "chargeAfterAppointment",
                value
              )
            }
          />

          <BooleanSetting
            title="Permitir pagamento parcial"
            description="Aceita recebimentos menores que o valor total da cobrança."
            checked={
              settings.allowPartialPayment
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowPartialPayment",
                value
              )
            }
          />

          <BooleanSetting
            title="Permitir pagamento acima do valor"
            description="Aceita valor superior à cobrança para posterior ajuste."
            checked={
              settings.allowOverpayment
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowOverpayment",
                value
              )
            }
          />

          <BooleanSetting
            title="Exigir forma de pagamento"
            description="Não permite concluir o recebimento sem selecionar a forma utilizada."
            checked={
              settings.requirePaymentMethodOnConfirmation
            }
            onChange={(
              value
            ) =>
              updateField(
                "requirePaymentMethodOnConfirmation",
                value
              )
            }
          />
        </div>

        <div className="mt-5 max-w-xs">
          <FormField
            label="Dia padrão de vencimento"
          >
            <Select
              value={String(
                settings.defaultDueDay
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "defaultDueDay",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              {[
                1,
                5,
                10,
                15,
                20,
                25,
                30,
              ].map(
                (
                  day
                ) => (
                  <option
                    key={
                      day
                    }
                    value={
                      day
                    }
                  >
                    Dia{" "}
                    {
                      day
                    }
                  </option>
                )
              )}
            </Select>
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Multa, Juros e Descontos"
        description="Defina as regras utilizadas para atrasos e descontos."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <RuleCard
            icon={
              <Percent
                size={20}
              />
            }
            title="Multa por atraso"
            active={
              settings.applyLateFee
            }
            onToggle={() =>
              updateField(
                "applyLateFee",
                !settings.applyLateFee
              )
            }
          >
            <FormField
              label="Multa (%)"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={
                  !settings.applyLateFee
                }
                value={
                  settings.lateFeePercent
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "lateFeePercent",
                    Math.max(
                      Number(
                        event.target.value
                      ) ||
                        0,
                      0
                    )
                  )
                }
              />
            </FormField>
          </RuleCard>

          <RuleCard
            icon={
              <CircleDollarSign
                size={20}
              />
            }
            title="Juros"
            active={
              settings.applyInterest
            }
            onToggle={() =>
              updateField(
                "applyInterest",
                !settings.applyInterest
              )
            }
          >
            <FormField
              label="Juros ao mês (%)"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={
                  !settings.applyInterest
                }
                value={
                  settings.monthlyInterestPercent
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "monthlyInterestPercent",
                    Math.max(
                      Number(
                        event.target.value
                      ) ||
                        0,
                      0
                    )
                  )
                }
              />
            </FormField>
          </RuleCard>

          <RuleCard
            icon={
              <Banknote
                size={20}
              />
            }
            title="Descontos"
            active={
              settings.allowDiscount
            }
            onToggle={() =>
              updateField(
                "allowDiscount",
                !settings.allowDiscount
              )
            }
          >
            <FormField
              label="Desconto máximo (%)"
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                disabled={
                  !settings.allowDiscount
                }
                value={
                  settings.maximumDiscountPercent
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "maximumDiscountPercent",
                    Math.min(
                      Math.max(
                        Number(
                          event.target.value
                        ) ||
                          0,
                        0
                      ),
                      100
                    )
                  )
                }
              />
            </FormField>
          </RuleCard>
        </div>
      </PageCard>

      <PageCard
        title="Recibos"
        description="Configure os recibos emitidos após confirmação dos pagamentos."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Gerar recibo automaticamente"
            description="Cria um recibo assim que o pagamento for confirmado."
            checked={
              settings.generateReceiptAutomatically
            }
            onChange={(
              value
            ) =>
              updateField(
                "generateReceiptAutomatically",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir dados da clínica"
            description="Inclui nome e dados institucionais no recibo."
            checked={
              settings.showClinicDataOnReceipt
            }
            onChange={(
              value
            ) =>
              updateField(
                "showClinicDataOnReceipt",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir profissional"
            description="Inclui o profissional relacionado ao atendimento."
            checked={
              settings.showProfessionalOnReceipt
            }
            onChange={(
              value
            ) =>
              updateField(
                "showProfessionalOnReceipt",
                value
              )
            }
          />

          <BooleanSetting
            title="Exibir paciente"
            description="Inclui o nome do paciente no recibo."
            checked={
              settings.showPatientOnReceipt
            }
            onChange={(
              value
            ) =>
              updateField(
                "showPatientOnReceipt",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Carteira Digital"
        description="Configure o funcionamento da carteira integrada ao aplicativo dos responsáveis."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Ativar carteira digital"
            description="Habilita saldo pré-pago para utilização nos atendimentos."
            checked={
              settings.digitalWalletEnabled
            }
            onChange={(
              value
            ) =>
              updateField(
                "digitalWalletEnabled",
                value
              )
            }
          />

          <BooleanSetting
            title="Permitir depósito pelo responsável"
            description="Responsáveis podem adicionar crédito pelo aplicativo."
            checked={
              settings.allowResponsibleWalletDeposit
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowResponsibleWalletDeposit",
                value
              )
            }
          />

          <BooleanSetting
            title="Avisar saldo baixo"
            description="Gera aviso quando o saldo ficar abaixo do limite configurado."
            checked={
              settings.walletLowBalanceWarning
            }
            onChange={(
              value
            ) =>
              updateField(
                "walletLowBalanceWarning",
                value
              )
            }
          />

          <BooleanSetting
            title="Usar saldo automaticamente"
            description="Quando houver saldo suficiente, permite descontar automaticamente uma cobrança."
            checked={
              settings.useWalletAutomatically
            }
            onChange={(
              value
            ) =>
              updateField(
                "useWalletAutomatically",
                value
              )
            }
          />
        </div>

        {settings.digitalWalletEnabled && (
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <FormField
              label="Depósito mínimo"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  settings.minimumWalletDeposit
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "minimumWalletDeposit",
                    Math.max(
                      Number(
                        event.target.value
                      ) ||
                        0,
                      0
                    )
                  )
                }
              />
            </FormField>

            <FormField
              label="Valor considerado saldo baixo"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  settings.walletLowBalanceAmount
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "walletLowBalanceAmount",
                    Math.max(
                      Number(
                        event.target.value
                      ) ||
                        0,
                      0
                    )
                  )
                }
              />
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Lembretes Financeiros"
        description="Configure alertas de vencimento e atraso."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <BellRing
                size={20}
                className="mt-0.5 text-indigo-600"
              />

              <div className="flex-1">
                <BooleanSetting
                  title="Avisar antes do vencimento"
                  description="Envia lembrete ao responsável antes da cobrança vencer."
                  checked={
                    settings.notifyBeforeDueDate
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "notifyBeforeDueDate",
                      value
                    )
                  }
                />

                {settings.notifyBeforeDueDate && (
                  <div className="mt-4">
                    <FormField
                      label="Dias antes"
                    >
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={
                          settings.daysBeforeDueDate
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "daysBeforeDueDate",
                            Math.max(
                              Number(
                                event.target.value
                              ) ||
                                1,
                              1
                            )
                          )
                        }
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <BellRing
                size={20}
                className="mt-0.5 text-indigo-600"
              />

              <div className="flex-1">
                <BooleanSetting
                  title="Avisar após o vencimento"
                  description="Envia lembrete caso a cobrança permaneça em aberto."
                  checked={
                    settings.notifyAfterDueDate
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "notifyAfterDueDate",
                      value
                    )
                  }
                />

                {settings.notifyAfterDueDate && (
                  <div className="mt-4">
                    <FormField
                      label="Dias após"
                    >
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={
                          settings.daysAfterDueDate
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            "daysAfterDueDate",
                            Math.max(
                              Number(
                                event.target.value
                              ) ||
                                1,
                              1
                            )
                          )
                        }
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <ReceiptText
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Configuração financeira central
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Estas regras serão utilizadas pelas cobranças, recebimentos, recibos, relatórios financeiros e pela carteira digital do aplicativo dos responsáveis.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function RuleCard({
  icon,
  title,
  active,
  onToggle,
  children,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  active:
    boolean;

  onToggle:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        active
          ? "border-indigo-200 bg-indigo-50/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              active
                ? "bg-white text-indigo-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {
              icon
            }
          </div>

          <p className="font-semibold text-slate-800">
            {
              title
            }
          </p>
        </div>

        <button
          type="button"
          onClick={
            onToggle
          }
          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
            active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {active
            ? "Ativo"
            : "Inativo"}
        </button>
      </div>

      <div className="mt-5">
        {
          children
        }
      </div>
    </div>
  );
}

function BooleanSetting({
  title,
  description,
  checked,
  onChange,
}: {
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200">
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