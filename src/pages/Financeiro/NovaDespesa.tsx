import {
  useState,
} from "react";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Save,
} from "lucide-react";

import {
  useNavigate,
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
  saveFinancialExpense,
  type ExpenseCategory,
  type FinancialExpense,
} from "./expenseStorage";

interface ExpenseFormData {
  description: string;

  category:
    ExpenseCategory;

  supplier:
    string;

  dueDate:
    string;

  amount:
    string;

  observation:
    string;
}

const initialValues: ExpenseFormData = {
  description:
    "",

  category:
    "Outros",

  supplier:
    "",

  dueDate:
    "",

  amount:
    "",

  observation:
    "",
};

const categories: ExpenseCategory[] = [
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Material",
  "Manutenção",
  "Funcionários",
  "Impostos",
  "Serviços",
  "Outros",
];

export default function NovaDespesa() {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] =
    useState<ExpenseFormData>(
      initialValues
    );

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

  function updateField<
    K extends keyof ExpenseFormData
  >(
    field: K,
    value: ExpenseFormData[K]
  ) {
    setFormData(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );

    setFeedback(
      null
    );

    setFeedbackType(
      null
    );
  }

  function validate() {
    if (
      !formData.description.trim()
    ) {
      showError(
        "Informe a descrição da despesa."
      );

      return false;
    }

    if (
      !formData.supplier.trim()
    ) {
      showError(
        "Informe o fornecedor ou beneficiário."
      );

      return false;
    }

    if (
      !formData.dueDate
    ) {
      showError(
        "Informe a data de vencimento."
      );

      return false;
    }

    const amount =
      Number(
        formData.amount
      );

    if (
      !amount ||
      amount <= 0
    ) {
      showError(
        "Informe um valor válido."
      );

      return false;
    }

    return true;
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
      const expense: FinancialExpense = {
        id:
          Date.now(),

        description:
          formData.description.trim(),

        category:
          formData.category,

        supplier:
          formData.supplier.trim(),

        dueDate:
          formData.dueDate,

        amount:
          Number(
            formData.amount
          ),

        status:
          "Pendente",

        observation:
          formData.observation.trim(),

        createdAt:
          new Date().toISOString(),
      };

      saveFinancialExpense(
        expense
      );

      setFeedback(
        "Despesa cadastrada com sucesso."
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
        "Não foi possível cadastrar a despesa."
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
            Nova Despesa
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre contas e despesas administrativas da clínica.
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
          title="Dados da Despesa"
          description="Informe os dados principais da conta."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Descrição"
              required
            >
              <Input
                value={
                  formData.description
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Ex.: Conta de energia"
              />
            </FormField>

            <FormField
              label="Categoria"
              required
            >
              <Select
                value={
                  formData.category
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "category",
                    event.target.value as ExpenseCategory
                  )
                }
              >
                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField
              label="Fornecedor / Beneficiário"
              required
            >
              <Input
                value={
                  formData.supplier
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "supplier",
                    event.target.value
                  )
                }
                placeholder="Ex.: Energisa"
              />
            </FormField>

            <FormField
              label="Valor"
              required
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  formData.amount
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "amount",
                    event.target.value
                  )
                }
                placeholder="0,00"
              />
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Vencimento"
          description="Defina quando esta despesa precisa ser paga."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Data de vencimento"
              required
            >
              <Input
                type="date"
                value={
                  formData.dueDate
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "dueDate",
                    event.target.value
                  )
                }
              />
            </FormField>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <CalendarDays
                  size={18}
                />

                <span className="text-sm font-semibold">
                  Status inicial
                </span>
              </div>

              <p className="mt-3 text-lg font-bold text-indigo-900">
                Pendente
              </p>

              <p className="mt-1 text-xs text-indigo-600">
                A conta ficará em aberto até o pagamento.
              </p>
            </div>
          </div>
        </PageCard>

        <PageCard
          title="Observações"
          description="Informações adicionais sobre a despesa."
        >
          <textarea
            value={
              formData.observation
            }
            onChange={(
              event
            ) =>
              updateField(
                "observation",
                event.target.value
              )
            }
            maxLength={500}
            placeholder="Ex.: referente ao consumo do mês..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              formData.observation.length
            }
            /500
          </div>
        </PageCard>

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Banknote
                size={18}
                className="text-indigo-500"
              />

              A despesa será adicionada às contas a pagar.
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
                  saving
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
                  : "Salvar despesa"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}