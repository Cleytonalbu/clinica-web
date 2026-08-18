import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Save,
  Store,
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
} from "./financeRules";

import {
  getFinancialExpenseById,
  payFinancialExpense,
} from "./expenseStorage";

const paymentMethods = [
  "Pix",
  "Dinheiro",
  "Cartão de débito",
  "Cartão de crédito",
  "Transferência",
  "Boleto",
];

export default function PagarDespesa() {
  const navigate =
    useNavigate();

  const {
    expenseId,
  } =
    useParams();

  const numericId =
    Number(
      expenseId
    );

  const expense =
    getFinancialExpenseById(
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
      expense?.bankAccountId ??
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

  const originalAmount =
    expense?.originalAmount ??
    expense?.amount ??
    0;

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState(
      expense?.paymentMethod ??
        "Pix"
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
    discount,
    setDiscount,
  ] =
    useState(
      expense?.discount ??
        0
    );

  const [
    surcharge,
    setSurcharge,
  ] =
    useState(
      expense?.surcharge ??
        0
    );

  const [
    paidAmount,
    setPaidAmount,
  ] =
    useState(
      expense?.amount ??
        0
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

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      | "success"
      | "error"
      | null
    >(null);

  const finalAmount =
    useMemo(
      () =>
        Math.max(
          originalAmount -
            discount +
            surcharge,
          0
        ),
      [
        originalAmount,
        discount,
        surcharge,
      ]
    );

  if (!expense) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Despesa não encontrada
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            A despesa pode ter sido removida ou não existe.
          </p>

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

    setPaidAmount(
      Math.max(
        originalAmount -
          amount +
          surcharge,
        0
      )
    );

    clearFeedback();
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

    setPaidAmount(
      Math.max(
        originalAmount -
          discount +
          amount,
        0
      )
    );

    clearFeedback();
  }

  function handlePaidAmount(
    value: string
  ) {
    setPaidAmount(
      Number(
        value
      ) || 0
    );

    clearFeedback();
  }

  function clearFeedback() {
    setFeedback(
      null
    );

    setFeedbackType(
      null
    );
  }

  function showError(
    message: string
  ) {
    setFeedback(
      message
    );

    setFeedbackType(
      "error"
    );
  }

  function validate() {
    if (
      expense.status ===
      "Pago"
    ) {
      showError(
        "Esta despesa já foi paga."
      );

      return false;
    }

    if (
      expense.status ===
      "Cancelado"
    ) {
      showError(
        "Esta despesa está cancelada."
      );

      return false;
    }

    if (
      !paymentDate
    ) {
      showError(
        "Informe a data do pagamento."
      );

      return false;
    }

    if (
      !paymentMethod
    ) {
      showError(
        "Selecione a forma de pagamento."
      );

      return false;
    }

    if (
      !bankAccountId
    ) {
      showError(
        "Selecione a conta bancária usada no pagamento."
      );

      return false;
    }

    if (
      !selectedBankAccount
    ) {
      showError(
        "A conta bancária selecionada não está disponível."
      );

      return false;
    }

    if (
      paidAmount <
      0
    ) {
      showError(
        "O valor pago é inválido."
      );

      return false;
    }

    return true;
  }

  async function handleSave() {
    if (
      !validate()
    ) {
      return;
    }

    setSaving(
      true
    );

    try {
      payFinancialExpense(
        expense.id,
        {
          paymentDate,

          paymentMethod,

          paidAmount,

          discount,

          surcharge,

          observation:
            observation.trim(),

          bankAccountId:
            selectedBankAccount?.id,

          bankAccountName:
            selectedBankAccount
              ? `${selectedBankAccount.accountName} — ${selectedBankAccount.bankName}`
              : undefined,
        }
      );

      setFeedback(
        "Pagamento da despesa registrado com sucesso."
      );

      setFeedbackType(
        "success"
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
      showError(
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
            Pagar Despesa
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Registre os dados completos do pagamento da conta.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType ===
              "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
          </div>
        )}

        <PageCard
          title="Despesa"
          description={`Conta #${expense.id}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Summary
              icon={
                <Banknote
                  size={18}
                />
              }
              label="Descrição"
              value={
                expense.description
              }
            />

            <Summary
              icon={
                <Store
                  size={18}
                />
              }
              label="Fornecedor"
              value={
                expense.supplier
              }
            />

            <Summary
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Vencimento"
              value={
                formatDate(
                  expense.dueDate
                )
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
                  originalAmount
                )
              }
            />
          </div>
        </PageCard>

        <PageCard
          title="Pagamento"
          description="Informe como a despesa será paga."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                ) => {
                  setPaymentMethod(
                    event.target.value
                  );

                  clearFeedback();
                }}
              >
                {paymentMethods.map(
                  (
                    method
                  ) => (
                    <option
                      key={
                        method
                      }
                      value={
                        method
                      }
                    >
                      {
                        method
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField
              label="Conta de pagamento"
              required
            >
              <Select
                value={
                  bankAccountId
                }
                onChange={(
                  event
                ) => {
                  setBankAccountId(
                    event.target.value
                  );

                  clearFeedback();
                }}
              >
                <option value="">
                  Selecione a conta
                </option>

                {bankAccounts.map(
                  (
                    account
                  ) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.accountName
                      }{" "}
                      —{" "}
                      {
                        account.bankName
                      }
                    </option>
                  )
                )}
              </Select>

              {bankAccounts.length ===
                0 && (
                <p className="mt-2 text-xs text-amber-600">
                  Nenhuma conta bancária ativa foi cadastrada.
                </p>
              )}
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
                ) => {
                  setPaymentDate(
                    event.target.value
                  );

                  clearFeedback();
                }}
              />
            </FormField>

            <FormField
              label="Valor pago"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  paidAmount
                }
                onChange={(
                  event
                ) =>
                  handlePaidAmount(
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Ajustes"
          description="Registre desconto ou acréscimo da conta."
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
          description="Informações adicionais sobre o pagamento."
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
            placeholder="Ex.: pagamento realizado via Pix, comprovante enviado pelo fornecedor..."
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

                Resumo do pagamento
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Será registrado{" "}
                <strong className="text-slate-700">
                  {
                    formatCurrency(
                      paidAmount
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
                    {" "}pela conta{" "}
                    <strong className="text-slate-700">
                      {
                        selectedBankAccount.accountName
                      }{" "}
                      —{" "}
                      {
                        selectedBankAccount.bankName
                      }
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
                  expense.status !==
                    "Pendente"
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
                  : "Confirmar pagamento"}
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