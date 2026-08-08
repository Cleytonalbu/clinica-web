import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  PageCard,
  Select,
} from "@/components/ui";

import {
  getFinancialCharges,
  type FinancialCharge,
} from "./financeStorage";

import {
  getFinancialExpenses,
  type FinancialExpense,
} from "./expenseStorage";

import {
  formatCurrency,
} from "./financeRules";

const monthOptions = [
  {
    value: 1,
    label: "Janeiro",
  },
  {
    value: 2,
    label: "Fevereiro",
  },
  {
    value: 3,
    label: "Março",
  },
  {
    value: 4,
    label: "Abril",
  },
  {
    value: 5,
    label: "Maio",
  },
  {
    value: 6,
    label: "Junho",
  },
  {
    value: 7,
    label: "Julho",
  },
  {
    value: 8,
    label: "Agosto",
  },
  {
    value: 9,
    label: "Setembro",
  },
  {
    value: 10,
    label: "Outubro",
  },
  {
    value: 11,
    label: "Novembro",
  },
  {
    value: 12,
    label: "Dezembro",
  },
];

const currentDate =
  new Date();

const currentYear =
  currentDate.getFullYear();

const currentMonth =
  currentDate.getMonth() + 1;

const years = Array.from(
  {
    length: 6,
  },
  (
    _,
    index
  ) =>
    currentYear - 3 + index
);

export default function DashboardFinanceiro() {
  const [
    selectedMonth,
    setSelectedMonth,
  ] =
    useState(
      currentMonth
    );

  const [
    selectedYear,
    setSelectedYear,
  ] =
    useState(
      currentYear
    );

  const charges =
    useMemo(
      () =>
        getFinancialCharges(),
      []
    );

  const expenses =
    useMemo(
      () =>
        getFinancialExpenses(),
      []
    );

  const periodCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            isDateInPeriod(
              charge.date,
              selectedMonth,
              selectedYear
            )
        ),
      [
        charges,
        selectedMonth,
        selectedYear,
      ]
    );

  const periodExpenses =
    useMemo(
      () =>
        expenses.filter(
          (
            expense
          ) =>
            isDateInPeriod(
              expense.dueDate,
              selectedMonth,
              selectedYear
            )
        ),
      [
        expenses,
        selectedMonth,
        selectedYear,
      ]
    );

  const validCharges =
    periodCharges.filter(
      (
        charge
      ) =>
        charge.status !==
        "Cancelado"
    );

  const validExpenses =
    periodExpenses.filter(
      (
        expense
      ) =>
        expense.status !==
        "Cancelado"
    );

  const billed =
    validCharges.reduce(
      (
        total,
        charge
      ) =>
        total +
        charge.amount,
      0
    );

  const received =
    periodCharges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pago"
      )
      .reduce(
        (
          total,
          charge
        ) =>
          total +
          (
            charge.receivedAmount ??
            charge.amount
          ),
        0
      );

  const receivable =
    periodCharges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pendente"
      )
      .reduce(
        (
          total,
          charge
        ) =>
          total +
          charge.amount,
        0
      );

  const totalExpenses =
    validExpenses.reduce(
      (
        total,
        expense
      ) =>
        total +
        expense.amount,
      0
    );

  const paidExpenses =
    periodExpenses
      .filter(
        (
          expense
        ) =>
          expense.status ===
          "Pago"
      )
      .reduce(
        (
          total,
          expense
        ) =>
          total +
          (
            expense.paidAmount ??
            expense.amount
          ),
        0
      );

  const payable =
    periodExpenses
      .filter(
        (
          expense
        ) =>
          expense.status ===
          "Pendente"
      )
      .reduce(
        (
          total,
          expense
        ) =>
          total +
          expense.amount,
        0
      );

  const result =
    received -
    paidExpenses;

  const movements =
    useMemo(
      () =>
        buildMovements(
          periodCharges,
          periodExpenses
        ),
      [
        periodCharges,
        periodExpenses,
      ]
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Financeiro
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Analise receitas, despesas e resultado por período.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-44">
              <Select
                value={
                  String(
                    selectedMonth
                  )
                }
                onChange={(
                  event
                ) =>
                  setSelectedMonth(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {monthOptions.map(
                  (
                    month
                  ) => (
                    <option
                      key={
                        month.value
                      }
                      value={
                        month.value
                      }
                    >
                      {
                        month.label
                      }
                    </option>
                  )
                )}
              </Select>
            </div>

            <div className="min-w-32">
              <Select
                value={
                  String(
                    selectedYear
                  )
                }
                onChange={(
                  event
                ) =>
                  setSelectedYear(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                {years.map(
                  (
                    year
                  ) => (
                    <option
                      key={
                        year
                      }
                      value={
                        year
                      }
                    >
                      {
                        year
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600">
              <CalendarDays
                size={21}
              />
            </div>

            <div>
              <p className="font-semibold text-indigo-900">
                Período selecionado
              </p>

              <p className="mt-1 text-sm text-indigo-700">
                {
                  getMonthName(
                    selectedMonth
                  )
                }{" "}
                de{" "}
                {
                  selectedYear
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                billed
              )
            }
            description="Receitas geradas"
            icon={
              <CircleDollarSign
                size={22}
              />
            }
          />

          <MetricCard
            title="Recebido"
            value={
              formatCurrency(
                received
              )
            }
            description="Entradas confirmadas"
            icon={
              <ArrowUpCircle
                size={22}
              />
            }
          />

          <MetricCard
            title="A receber"
            value={
              formatCurrency(
                receivable
              )
            }
            description="Cobranças pendentes"
            icon={
              <WalletCards
                size={22}
              />
            }
          />

          <MetricCard
            title="Despesas"
            value={
              formatCurrency(
                totalExpenses
              )
            }
            description="Contas do período"
            icon={
              <ArrowDownCircle
                size={22}
              />
            }
          />

          <MetricCard
            title="A pagar"
            value={
              formatCurrency(
                payable
              )
            }
            description="Despesas pendentes"
            icon={
              <WalletCards
                size={22}
              />
            }
          />

          <MetricCard
            title="Resultado"
            value={
              formatCurrency(
                result
              )
            }
            description="Recebido menos despesas pagas"
            icon={
              <Banknote
                size={22}
              />
            }
            highlight
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="Resumo de Receitas"
            description="Situação das cobranças do período."
          >
            <div className="space-y-4">
              <SummaryRow
                label="Faturado"
                value={
                  billed
                }
                total={
                  billed
                }
              />

              <SummaryRow
                label="Recebido"
                value={
                  received
                }
                total={
                  billed
                }
              />

              <SummaryRow
                label="A receber"
                value={
                  receivable
                }
                total={
                  billed
                }
              />
            </div>
          </PageCard>

          <PageCard
            title="Resumo de Despesas"
            description="Situação das contas do período."
          >
            <div className="space-y-4">
              <SummaryRow
                label="Total"
                value={
                  totalExpenses
                }
                total={
                  totalExpenses
                }
              />

              <SummaryRow
                label="Pago"
                value={
                  paidExpenses
                }
                total={
                  totalExpenses
                }
              />

              <SummaryRow
                label="A pagar"
                value={
                  payable
                }
                total={
                  totalExpenses
                }
              />
            </div>
          </PageCard>
        </div>

        <PageCard
          title="Movimentações do Período"
          description={`${movements.length} movimentação(ões) encontrada(s).`}
        >
          {movements.length >
          0 ? (
            <div className="space-y-3">
              {movements.map(
                (
                  movement
                ) => (
                  <MovementRow
                    key={
                      movement.id
                    }
                    movement={
                      movement
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Nenhuma movimentação neste período
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Altere o mês ou o ano para visualizar outros lançamentos.
              </p>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

interface MetricCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  highlight?:
    boolean;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-medium ${
              highlight
                ? "text-indigo-700"
                : "text-slate-500"
            }`}
          >
            {
              title
            }
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              highlight
                ? "text-indigo-900"
                : "text-slate-900"
            }`}
          >
            {
              value
            }
          </p>

          <p
            className={`mt-1 text-xs ${
              highlight
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            {
              description
            }
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            highlight
              ? "bg-white text-indigo-600"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  total,
}: {
  label:
    string;

  value:
    number;

  total:
    number;
}) {
  const percentage =
    total > 0
      ? Math.min(
          (
            value /
            total
          ) *
            100,
          100
        )
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-600">
          {
            label
          }
        </p>

        <p className="text-sm font-bold text-slate-900">
          {
            formatCurrency(
              value
            )
          }
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

interface Movement {
  id:
    string;

  type:
    "Receita" |
    "Despesa";

  description:
    string;

  person:
    string;

  date:
    string;

  amount:
    number;

  status:
    string;
}

function MovementRow({
  movement,
}: {
  movement:
    Movement;
}) {
  const isRevenue =
    movement.type ===
    "Receita";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isRevenue
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isRevenue ? (
            <ArrowUpCircle
              size={19}
            />
          ) : (
            <ArrowDownCircle
              size={19}
            />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {
                movement.description
              }
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isRevenue
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {
                movement.type
              }
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {
              movement.person
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              formatDate(
                movement.date
              )
            }{" "}
            •{" "}
            {
              movement.status
            }
          </p>
        </div>
      </div>

      <p
        className={`text-lg font-bold ${
          isRevenue
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {isRevenue
          ? "+"
          : "-"}
        {
          formatCurrency(
            movement.amount
          )
        }
      </p>
    </div>
  );
}

function buildMovements(
  charges:
    FinancialCharge[],
  expenses:
    FinancialExpense[]
): Movement[] {
  const revenueMovements =
    charges.map(
      (
        charge
      ): Movement => ({
        id:
          `charge-${charge.id}`,

        type:
          "Receita",

        description:
          charge.description,

        person:
          charge.patient,

        date:
          charge.date,

        amount:
          charge.receivedAmount ??
          charge.amount,

        status:
          charge.status,
      })
    );

  const expenseMovements =
    expenses.map(
      (
        expense
      ): Movement => ({
        id:
          `expense-${expense.id}`,

        type:
          "Despesa",

        description:
          expense.description,

        person:
          expense.supplier,

        date:
          expense.paymentDate ??
          expense.dueDate,

        amount:
          expense.paidAmount ??
          expense.amount,

        status:
          expense.status,
      })
    );

  return [
    ...revenueMovements,
    ...expenseMovements,
  ].sort(
    (
      a,
      b
    ) =>
      new Date(
        `${b.date}T12:00:00`
      ).getTime() -
      new Date(
        `${a.date}T12:00:00`
      ).getTime()
  );
}

function isDateInPeriod(
  value:
    string,
  month:
    number,
  year:
    number
) {
  if (!value) {
    return false;
  }

  const [
    valueYear,
    valueMonth,
  ] =
    value
      .split("-")
      .map(Number);

  return (
    valueYear ===
      year &&
    valueMonth ===
      month
  );
}

function getMonthName(
  month:
    number
) {
  return (
    monthOptions.find(
      (
        item
      ) =>
        item.value ===
        month
    )?.label ??
    ""
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
    value.split("-");

  return `${day}/${month}/${year}`;
}