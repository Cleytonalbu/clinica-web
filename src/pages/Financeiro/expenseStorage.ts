export type ExpenseStatus =
  | "Pendente"
  | "Pago"
  | "Cancelado";

export type ExpenseCategory =
  | "Aluguel"
  | "Energia"
  | "Água"
  | "Internet"
  | "Material"
  | "Manutenção"
  | "Funcionários"
  | "Impostos"
  | "Serviços"
  | "Outros";

export interface FinancialExpense {
  id: number;

  description: string;

  category: ExpenseCategory;

  supplier: string;

  dueDate: string;

  paymentDate?: string;

  amount: number;

  originalAmount?: number;

  paidAmount?: number;

  discount?: number;

  surcharge?: number;

  status: ExpenseStatus;

  paymentMethod?: string;

  observation?: string;

  paymentObservation?: string;

  createdAt: string;
}

const STORAGE_KEY =
  "entre-afetos-financial-expenses";

export function getFinancialExpenses(): FinancialExpense[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    return JSON.parse(
      stored
    ) as FinancialExpense[];
  } catch {
    return [];
  }
}

export function getFinancialExpenseById(
  expenseId: number
) {
  return getFinancialExpenses().find(
    (expense) =>
      expense.id === expenseId
  );
}

export function saveFinancialExpense(
  expense: FinancialExpense
) {
  const current =
    getFinancialExpenses();

  const normalizedExpense: FinancialExpense = {
    ...expense,

    originalAmount:
      expense.originalAmount ??
      expense.amount,

    discount:
      expense.discount ?? 0,

    surcharge:
      expense.surcharge ?? 0,
  };

  const next = [
    ...current,
    normalizedExpense,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}

export function updateFinancialExpense(
  expenseId: number,
  data: Partial<FinancialExpense>
) {
  const current =
    getFinancialExpenses();

  const next =
    current.map(
      (expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              ...data,
            }
          : expense
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}

interface PayExpenseData {
  paymentDate: string;

  paymentMethod: string;

  paidAmount: number;

  discount: number;

  surcharge: number;

  observation?: string;
}

export function payFinancialExpense(
  expenseId: number,
  data: PayExpenseData
) {
  const expense =
    getFinancialExpenseById(
      expenseId
    );

  if (!expense) {
    throw new Error(
      "Despesa não encontrada."
    );
  }

  const originalAmount =
    expense.originalAmount ??
    expense.amount;

  const finalAmount =
    Math.max(
      originalAmount -
        data.discount +
        data.surcharge,
      0
    );

  updateFinancialExpense(
    expenseId,
    {
      originalAmount,

      amount:
        finalAmount,

      paidAmount:
        data.paidAmount,

      discount:
        data.discount,

      surcharge:
        data.surcharge,

      status:
        "Pago",

      paymentDate:
        data.paymentDate,

      paymentMethod:
        data.paymentMethod,

      paymentObservation:
        data.observation,
    }
  );
}

export function cancelFinancialExpense(
  expenseId: number
) {
  updateFinancialExpense(
    expenseId,
    {
      status:
        "Cancelado",
    }
  );
}

export function removeFinancialExpense(
  expenseId: number
) {
  const current =
    getFinancialExpenses();

  const next =
    current.filter(
      (expense) =>
        expense.id !== expenseId
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}