import { markAdministrativePaymentAsPaid } from "@/pages/PagamentosAdministrativos/administrativePaymentStorage";

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

  unitId: number;

  description: string;

  category: ExpenseCategory;

  supplier: string;

  /*
   * Competência financeira.
   *
   * Formato:
   * YYYY-MM
   *
   * Exemplo:
   * 2026-07
   */
  competenceDate?: string;

  /*
   * Data de vencimento.
   *
   * Formato:
   * YYYY-MM-DD
   */
  dueDate: string;

  /*
   * Data real em que o pagamento
   * foi realizado.
   */
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

  bankAccountId?: string;

  bankAccountName?: string;

  /* Vínculos opcionais com módulos administrativos. */
  sourceAdministrativePaymentId?: string;
  sourceLeaveId?: string;

  createdAt: string;
}

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-financial-expenses";

/* =========================================
   LISTAR DESPESAS
========================================= */

export function getFinancialExpenses():
  FinancialExpense[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const expenses =
      JSON.parse(
        stored
      ) as FinancialExpense[];

    /*
     * COMPATIBILIDADE
     *
     * Despesas criadas antes do campo
     * competenceDate continuam funcionando.
     *
     * Para elas, utilizamos o mês do
     * vencimento como competência.
     */

    return expenses.map(
      (
        expense
      ) => ({
        ...expense,

        competenceDate:
          expense.competenceDate ||
          getCompetenceFromDueDate(
            expense.dueDate
          ),

        originalAmount:
          expense.originalAmount ??
          expense.amount,

        discount:
          expense.discount ??
          0,

        surcharge:
          expense.surcharge ??
          0,
      })
    );
  } catch {
    return [];
  }
}

/* =========================================
   BUSCAR DESPESA
========================================= */

export function getFinancialExpenseById(
  expenseId: number
) {
  return getFinancialExpenses().find(
    (
      expense
    ) =>
      expense.id ===
      expenseId
  );
}

/* =========================================
   SALVAR DESPESA
========================================= */

export function saveFinancialExpense(
  expense: FinancialExpense
) {
  const current =
    getFinancialExpenses();

  const normalizedExpense:
    FinancialExpense = {
    ...expense,

    competenceDate:
      expense.competenceDate ||
      getCompetenceFromDueDate(
        expense.dueDate
      ),

    originalAmount:
      expense.originalAmount ??
      expense.amount,

    discount:
      expense.discount ??
      0,

    surcharge:
      expense.surcharge ??
      0,
  };

  const next = [
    ...current,
    normalizedExpense,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

/* =========================================
   ATUALIZAR DESPESA
========================================= */

export function updateFinancialExpense(
  expenseId: number,

  data:
    Partial<FinancialExpense>
) {
  const current =
    getFinancialExpenses();

  const next =
    current.map(
      (
        expense
      ) =>
        expense.id ===
        expenseId
          ? {
              ...expense,
              ...data,
            }
          : expense
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

/* =========================================
   PAGAMENTO
========================================= */

interface PayExpenseData {
  paymentDate: string;

  paymentMethod: string;

  paidAmount: number;

  discount: number;

  surcharge: number;

  observation?: string;

  bankAccountId?: string;

  bankAccountName?: string;
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

      bankAccountId:
        data.bankAccountId,

      bankAccountName:
        data.bankAccountName,
    }
  );

  /*
   * INTEGRAÇÃO COM PAGAMENTOS ADMINISTRATIVOS
   *
   * Quando uma despesa tiver sido gerada a partir de um
   * pagamento administrativo (ex.: férias), a confirmação
   * do pagamento em Despesas também quita automaticamente
   * o pagamento administrativo vinculado.
   *
   * Dessa forma:
   * Despesas = Pago
   * Pagamentos Administrativos = Pago
   * Férias = Pago
   */
  if (expense.sourceAdministrativePaymentId) {
    markAdministrativePaymentAsPaid(
      expense.sourceAdministrativePaymentId,
      data.paymentDate,
      data.paymentMethod
    );
  }
}

/* =========================================
   CANCELAR DESPESA
========================================= */

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

/* =========================================
   REMOVER DESPESA
========================================= */

export function removeFinancialExpense(
  expenseId: number
) {
  const current =
    getFinancialExpenses();

  const next =
    current.filter(
      (
        expense
      ) =>
        expense.id !==
        expenseId
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

/* =========================================
   GERAR COMPETÊNCIA PELO VENCIMENTO
========================================= */

function getCompetenceFromDueDate(
  dueDate: string
) {
  if (!dueDate) {
    return "";
  }

  const [
    year,
    month,
  ] =
    dueDate.split(
      "-"
    );

  if (
    !year ||
    !month
  ) {
    return "";
  }

  return `${year}-${month}`;
}