import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Save,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getBankAccounts,
} from "@/pages/ContasBancarias/bankAccountStorage";

import {
  formatCurrency,
  type PaymentMethod,
} from "./financeRules";

import {
  getFinancialChargeById,
  receiveFinancialCharge,
} from "./financeStorage";

export default function ReceberCobranca() {
  const navigate =
    useNavigate();

  const {
    chargeId,
  } =
    useParams();

  const numericId =
    Number(
      chargeId
    );

  const charge =
    getFinancialChargeById(
      numericId
    );

  const bankAccounts =
    useMemo(
      () =>
        getBankAccounts().filter(
          (account) =>
            account.status ===
            "Ativa"
        ),
      []
    );

  const [
    bankAccountId,
    setBankAccountId,
  ] =
    useState(
      charge?.bankAccountId ??
        (bankAccounts.length === 1
          ? bankAccounts[0].id
          : "")
    );

  const selectedBankAccount =
    useMemo(
      () =>
        bankAccounts.find(
          (account) =>
            account.id ===
            bankAccountId
        ),
      [
        bankAccounts,
        bankAccountId,
      ]
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      charge?.paymentMethod ??
        "Pix"
    );

  const [
    discount,
    setDiscount,
  ] =
    useState(
      charge?.discount ??
        0
    );

  const [
    surcharge,
    setSurcharge,
  ] =
    useState(
      charge?.surcharge ??
        0
    );

  const [
    receivedAmount,
    setReceivedAmount,
  ] =
    useState(
      charge?.amount ??
        0
    );

  const [
    paymentDate,
    setPaymentDate,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

  const [
    observation,
    setObservation,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string | null
    >(null);

  const finalAmount =
    useMemo(() => {
      if (!charge) {
        return 0;
      }

      return Math.max(
        charge.originalAmount -
          discount +
          surcharge,
        0
      );
    }, [
      charge,
      discount,
      surcharge,
    ]);

  if (!charge) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Cobrança não encontrada
          </h1>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/financeiro"
              )
            }
          >
            Voltar ao Financeiro
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  function handleReceivedAmount(
    value: string
  ) {
    setReceivedAmount(
      Number(
        value
      ) || 0
    );
  }

  function handleDiscount(
    value: string
  ) {
    const amount =
      Number(
        value
      ) || 0;

    setDiscount(
      amount
    );

    setReceivedAmount(
      Math.max(
        charge.originalAmount -
          amount +
          surcharge,
        0
      )
    );
  }

  function handleSurcharge(
    value: string
  ) {
    const amount =
      Number(
        value
      ) || 0;

    setSurcharge(
      amount
    );

    setReceivedAmount(
      Math.max(
        charge.originalAmount -
          discount +
          amount,
        0
      )
    );
  }

  function validate() {
    if (
      charge.status ===
      "Pago"
    ) {
      setFeedback(
        "Esta cobrança já foi recebida."
      );

      return false;
    }

    if (
      !paymentDate
    ) {
      setFeedback(
        "Informe a data do pagamento."
      );

      return false;
    }

    if (
      receivedAmount <
      0
    ) {
      setFeedback(
        "O valor recebido é inválido."
      );

      return false;
    }

    if (
      !bankAccountId
    ) {
      setFeedback(
        "Selecione a conta bancária que recebeu o pagamento."
      );

      return false;
    }

    return true;
  }

  async function handleSave() {
    if (!validate()) {
      return;
    }

    setSaving(
      true
    );

    try {
      receiveFinancialCharge(
        charge.id,
        {
          paymentMethod,

          receivedAmount,

          discount,

          surcharge,

          paymentDate,

          observation,

          bankAccountId,

          bankAccountName:
            selectedBankAccount
              ? `${selectedBankAccount.accountName} — ${selectedBankAccount.bankName}`
              : undefined,
        }
      );

      setFeedback(
        "Pagamento registrado com sucesso."
      );

      setTimeout(
        () => {
          navigate(
            "/financeiro"
          );
        },
        700
      );
    } catch {
      setFeedback(
        "Não foi possível registrar o pagamento."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/financeiro"
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar ao Financeiro
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Receber Cobrança
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Registre os dados completos do pagamento.
          </p>
        </div>

        {feedback && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {feedback}
          </div>
        )}

        <PageCard
          title="Cobrança"
          description={`Lançamento #${charge.id}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Summary
              icon={
                <UserRound
                  size={18}
                />
              }
              label="Paciente"
              value={
                charge.patient
              }
            />

            <Summary
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Atendimento"
              value={
                formatDate(
                  charge.date
                )
              }
            />

            <Summary
              icon={
                <CreditCard
                  size={18}
                />
              }
              label="Tipo"
              value={
                charge.billingType ===
                  "Convênio" &&
                charge.convenio
                  ? `${charge.billingType} - ${charge.convenio}`
                  : charge.billingType
              }
            />

            <Summary
              icon={
                <Banknote
                  size={18}
                />
              }
              label="Valor original"
              value={
                formatCurrency(
                  charge.originalAmount
                )
              }
            />
          </div>
        </PageCard>

        <PageCard
          title="Pagamento"
          description="Informe como o pagamento foi realizado."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <FormField
              label="Forma de pagamento"
              required
            >
              <Select
                value={
                  paymentMethod
                }
                onChange={(
                  event
                ) =>
                  setPaymentMethod(
                    event.target.value as PaymentMethod
                  )
                }
              >
                <option value="Pix">
                  Pix
                </option>

                <option value="Dinheiro">
                  Dinheiro
                </option>

                <option value="Cartão de débito">
                  Cartão de débito
                </option>

                <option value="Cartão de crédito">
                  Cartão de crédito
                </option>

                <option value="Transferência">
                  Transferência
                </option>

                <option value="Convênio">
                  Convênio
                </option>
              </Select>
            </FormField>

            <FormField
              label="Conta de recebimento"
              required
            >
              <Select
                value={
                  bankAccountId
                }
                onChange={(
                  event
                ) =>
                  setBankAccountId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione uma conta
                </option>

                {bankAccounts.map(
                  (account) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {account.accountName} — {account.bankName}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField
              label="Data do pagamento"
              required
            >
              <Input
                type="date"
                value={
                  paymentDate
                }
                onChange={(
                  event
                ) =>
                  setPaymentDate(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Valor recebido"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  receivedAmount
                }
                onChange={(
                  event
                ) =>
                  handleReceivedAmount(
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Ajustes"
          description="Aplique desconto ou acréscimo se necessário."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField
              label="Desconto"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  discount
                }
                onChange={(
                  event
                ) =>
                  handleDiscount(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Acréscimo"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  surcharge
                }
                onChange={(
                  event
                ) =>
                  handleSurcharge(
                    event.target.value
                  )
                }
              />
            </FormField>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Valor final
              </p>

              <p className="mt-2 text-2xl font-bold text-indigo-900">
                {
                  formatCurrency(
                    finalAmount
                  )
                }
              </p>

              <p className="mt-1 text-xs text-indigo-600">
                Após desconto e acréscimo
              </p>
            </div>
          </div>
        </PageCard>

        <PageCard
          title="Observação"
          description="Informações adicionais sobre o recebimento."
        >
          <textarea
            value={
              observation
            }
            onChange={(
              event
            ) =>
              setObservation(
                event.target.value
              )
            }
            maxLength={500}
            placeholder="Ex.: pagamento realizado pelo responsável via Pix..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              observation.length
            }
            /500
          </div>
        </PageCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CheckCircle2
                  size={18}
                  className="text-emerald-600"
                />

                Resumo do recebimento
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Será registrado{" "}
                <strong className="text-slate-700">
                  {
                    formatCurrency(
                      receivedAmount
                    )
                  }
                </strong>{" "}
                via{" "}
                <strong className="text-slate-700">
                  {
                    paymentMethod
                  }
                </strong>
                {selectedBankAccount && (
                  <>
                    {" "}
                    na conta
                    {" "}
                    <strong className="text-slate-700">
                      {selectedBankAccount.accountName} — {selectedBankAccount.bankName}
                    </strong>
                  </>
                )}
                .
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(
                    "/financeiro"
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={
                  saving ||
                  charge.status ===
                    "Pago"
                }
                onClick={
                  handleSave
                }
              >
                <Save
                  size={17}
                />

                {saving
                  ? "Salvando..."
                  : "Confirmar recebimento"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Summary({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  return `${day}/${month}/${year}`;
}