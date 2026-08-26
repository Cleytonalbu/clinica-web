import {
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Plus,
  ReceiptText,
  Search,
  Store,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  Button,
  Input,
  Select,
} from "@/components/ui";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  getFinancialExpenses,
  type ExpenseCategory,
  type FinancialExpense,
} from "@/pages/Financeiro/expenseStorage";

/* =========================================
   CATEGORIAS
========================================= */

const categories: Array<
  ExpenseCategory | "Todas"
> = [
  "Todas",
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

/* =========================================
   HELPERS
========================================= */

function getCurrentCompetence() {
  const now =
    new Date();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${now.getFullYear()}-${month}`;
}

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const normalized =
    value.includes("T")
      ? value
      : `${value.slice(0, 10)}T12:00:00`;

  const date =
    new Date(
      normalized
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    date
  );
}

function getExpenseCompetence(
  expense: FinancialExpense
) {
  return (
    expense.competenceDate ||
    expense.dueDate.slice(
      0,
      7
    )
  );
}

function isOverdue(
  expense: FinancialExpense
) {
  if (
    expense.status !==
    "Pendente"
  ) {
    return false;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const dueDate =
    new Date(
      `${expense.dueDate}T12:00:00`
    );

  return (
    !Number.isNaN(
      dueDate.getTime()
    ) &&
    dueDate < today
  );
}

function getDisplayStatus(
  expense: FinancialExpense
) {
  if (
    isOverdue(
      expense
    )
  ) {
    return "Vencido";
  }

  return expense.status;
}

function getStatusClass(
  status: string
) {
  if (
    status ===
    "Pago"
  ) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    status ===
    "Vencido"
  ) {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (
    status ===
    "Cancelado"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-amber-100 bg-amber-50 text-amber-700";
}

/* =========================================
   COMPONENTE
========================================= */

export default function Despesas() {
  const {
    activeUnitId,
  } =
    useUnit();

  const navigate =
    useNavigate();

  const [
    expenses,
  ] =
    useState<FinancialExpense[]>(
      () =>
        getFinancialExpenses().filter(
          (
            expense
          ) =>
            expense.unitId ===
            activeUnitId
        )
    );

  const [
    competence,
    setCompetence,
  ] =
    useState(
      getCurrentCompetence()
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "Todos"
    );

  const [
    category,
    setCategory,
  ] =
    useState<
      ExpenseCategory | "Todas"
    >(
      "Todas"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  /* =======================================
     DESPESAS DA COMPETÊNCIA
  ======================================= */

  const competenceExpenses =
    useMemo(
      () =>
        expenses.filter(
          (
            expense
          ) =>
            !competence ||
            getExpenseCompetence(
              expense
            ) ===
              competence
        ),
      [
        expenses,
        competence,
      ]
    );

  /* =======================================
     RESUMO
  ======================================= */

  const summary =
    useMemo(
      () => {
        const active =
          competenceExpenses.filter(
            (
              expense
            ) =>
              expense.status !==
              "Cancelado"
          );

        const total =
          active.reduce(
            (
              sum,
              expense
            ) =>
              sum +
              expense.amount,
            0
          );

        const paid =
          active
            .filter(
              (
                expense
              ) =>
                expense.status ===
                "Pago"
            )
            .reduce(
              (
                sum,
                expense
              ) =>
                sum +
                (expense.paidAmount ??
                  expense.amount),
              0
            );

        const pending =
          active
            .filter(
              (
                expense
              ) =>
                expense.status ===
                "Pendente"
            )
            .reduce(
              (
                sum,
                expense
              ) =>
                sum +
                expense.amount,
              0
            );

        const overdue =
          active
            .filter(
              (
                expense
              ) =>
                isOverdue(
                  expense
                )
            )
            .reduce(
              (
                sum,
                expense
              ) =>
                sum +
                expense.amount,
              0
            );

        return {
          total,
          paid,
          pending,
          overdue,
        };
      },
      [
        competenceExpenses,
      ]
    );

  /* =======================================
     FILTROS
  ======================================= */

  const filteredExpenses =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return competenceExpenses
          .filter(
            (
              expense
            ) => {
              const displayStatus =
                getDisplayStatus(
                  expense
                );

              const matchesStatus =
                status ===
                  "Todos" ||
                displayStatus ===
                  status;

              const matchesCategory =
                category ===
                  "Todas" ||
                expense.category ===
                  category;

              const matchesSearch =
                !term ||
                expense.description
                  .toLowerCase()
                  .includes(
                    term
                  ) ||
                expense.supplier
                  .toLowerCase()
                  .includes(
                    term
                  );

              return (
                matchesStatus &&
                matchesCategory &&
                matchesSearch
              );
            }
          )
          .sort(
            (
              first,
              second
            ) =>
              first.dueDate.localeCompare(
                second.dueDate
              )
          );
      },
      [
        competenceExpenses,
        status,
        category,
        search,
      ]
    );

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===================================== */}
        {/* CABEÇALHO */}
        {/* ===================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Despesas
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe as despesas administrativas da clínica por competência.
            </p>
          </div>

          <Button
            type="button"
            onClick={() =>
              navigate(
                "/financeiro/despesas/nova"
              )
            }
          >
            <Plus
              size={18}
              className="mr-2"
            />

            Nova despesa
          </Button>
        </div>

        {/* ===================================== */}
        {/* CARDS */}
        {/* ===================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Despesas da competência"
            value={formatCurrency(
              summary.total
            )}
            icon={ReceiptText}
            description="Total lançado no período"
          />

          <SummaryCard
            title="Pago"
            value={formatCurrency(
              summary.paid
            )}
            icon={WalletCards}
            description="Despesas já quitadas"
          />

          <SummaryCard
            title="Pendente"
            value={formatCurrency(
              summary.pending
            )}
            icon={Clock3}
            description="Valores ainda em aberto"
          />

          <SummaryCard
            title="Vencido"
            value={formatCurrency(
              summary.overdue
            )}
            icon={CircleDollarSign}
            description="Pendências fora do prazo"
          />
        </div>

        {/* ===================================== */}
        {/* FILTROS */}
        {/* ===================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Competência
              </label>

              <Input
                type="month"
                value={competence}
                onChange={(
                  event
                ) =>
                  setCompetence(
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Situação
              </label>

              <Select
                value={status}
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos
                </option>

                <option value="Pendente">
                  Pendente
                </option>

                <option value="Vencido">
                  Vencido
                </option>

                <option value="Pago">
                  Pago
                </option>

                <option value="Cancelado">
                  Cancelado
                </option>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoria
              </label>

              <Select
                value={category}
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target.value as
                      | ExpenseCategory
                      | "Todas"
                  )
                }
              >
                {categories.map(
                  (
                    item
                  ) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buscar
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Descrição ou fornecedor"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* TABELA */}
        {/* ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Lançamentos
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredExpenses.length}{" "}
                despesa(s) encontrada(s)
              </p>
            </div>

            <Banknote
              size={20}
              className="text-slate-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Despesa
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Categoria
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Fornecedor
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Vencimento
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Valor
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Pagamento
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Situação
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(
                  (
                    expense
                  ) => {
                    const displayStatus =
                      getDisplayStatus(
                        expense
                      );

                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {expense.description}
                          </div>

                          {expense.observation && (
                            <div className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                              {expense.observation}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {expense.category}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Store
                              size={15}
                              className="text-slate-400"
                            />

                            {expense.supplier}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            {formatDate(
                              expense.dueDate
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(
                            expense.amount
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {expense.status ===
                          "Pago" ? (
                            <div>
                              <div>
                                {expense.paymentMethod ||
                                  "-"}
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                {formatDate(
                                  expense.paymentDate
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              displayStatus
                            )}`}
                          >
                            {displayStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {expense.status ===
                          "Pendente" ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/financeiro/despesas/${expense.id}/pagar`
                                )
                              }
                            >
                              Pagar
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredExpenses.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center"
                    >
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                        <ReceiptText
                          size={20}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-3 font-medium text-slate-700">
                        Nenhuma despesa encontrada
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Ajuste os filtros ou cadastre uma nova despesa.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CARD DE RESUMO
========================================= */

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: typeof Banknote;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon
            size={19}
          />
        </div>
      </div>
    </div>
  );
}