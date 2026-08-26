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
  useUnit,
} from "@/providers/UnitContext";

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

/* =========================================
   MESES
========================================= */

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

/* =========================================
   PERÍODO ATUAL
========================================= */

const currentDate =
  new Date();

const currentYear =
  currentDate.getFullYear();

const currentMonth =
  currentDate.getMonth() +
  1;

const years =
  Array.from(
    {
      length: 6,
    },

    (
      _,
      index
    ) =>
      currentYear -
      3 +
      index
  );

/* =========================================
   COMPONENTE
========================================= */

export default function DashboardFinanceiro() {
  const {
    activeUnitId,
  } =
    useUnit();

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

  /* =======================================
     DADOS
  ======================================= */

  const charges =
    useMemo(
      () =>
        getFinancialCharges().filter(
          (charge) =>
            charge.unitId ===
            activeUnitId
        ),

      [
        activeUnitId,
      ]
    );

  const expenses =
    useMemo(
      () =>
        getFinancialExpenses().filter(
          (expense) =>
            expense.unitId ===
            activeUnitId
        ),

      [
        activeUnitId,
      ]
    );

  /* =======================================
     RECEITAS POR COMPETÊNCIA
     
     A receita pertence ao mês da
     cobrança/atendimento.
  ======================================= */

  const competenceCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            charge.status !==
              "Cancelado" &&
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

  /* =======================================
     RECEITAS RECEBIDAS

     Aqui usamos paymentDate,
     pois representa entrada real no caixa.
  ======================================= */

  const receivedCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            charge.status ===
              "Pago" &&
            Boolean(
              charge.paymentDate
            ) &&
            isDateInPeriod(
              charge.paymentDate!,

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

  /* =======================================
     DESPESAS POR COMPETÊNCIA

     Agora utilizamos competenceDate.

     Para despesas antigas, utilizamos
     dueDate como fallback.
  ======================================= */

  const competenceExpenses =
    useMemo(
      () =>
        expenses.filter(
          (
            expense
          ) =>
            expense.status !==
              "Cancelado" &&
            isDateInPeriod(
              expense.competenceDate ||
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

  /* =======================================
     DESPESAS PAGAS

     Entrada de caixa usa paymentDate.
  ======================================= */

  const paidExpenseItems =
    useMemo(
      () =>
        expenses.filter(
          (
            expense
          ) =>
            expense.status ===
              "Pago" &&
            Boolean(
              expense.paymentDate
            ) &&
            isDateInPeriod(
              expense.paymentDate!,

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

  /* =======================================
     FATURADO
  ======================================= */

  const billed =
    competenceCharges.reduce(
      (
        total,

        charge
      ) =>
        total +
        charge.amount,

      0
    );

  /* =======================================
     RECEBIDO
  ======================================= */

  const received =
    receivedCharges.reduce(
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

  /* =======================================
     A RECEBER
  ======================================= */

  const receivable =
    competenceCharges
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

  /* =======================================
     DESPESAS LANÇADAS
  ======================================= */

  const totalExpenses =
    competenceExpenses.reduce(
      (
        total,

        expense
      ) =>
        total +
        expense.amount,

      0
    );

  /* =======================================
     DESPESAS PAGAS
  ======================================= */

  const paidExpenses =
    paidExpenseItems.reduce(
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

  /* =======================================
     A PAGAR
  ======================================= */

  const payable =
    competenceExpenses
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

  /* =======================================
     RESULTADO REALIZADO
  ======================================= */

  const result =
    received -
    paidExpenses;

  /* =======================================
     RECEBIMENTO DAS COBRANÇAS
     DA COMPETÊNCIA
  ======================================= */

  const receivedFromCompetence =
    competenceCharges
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

  /* =======================================
     DESPESAS PAGAS DA COMPETÊNCIA
  ======================================= */

  const paidFromCompetence =
    competenceExpenses
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

  /* =======================================
     MOVIMENTAÇÕES DE CAIXA
  ======================================= */

  const movements =
    useMemo(
      () =>
        buildMovements(
          receivedCharges,

          paidExpenseItems
        ),

      [
        receivedCharges,

        paidExpenseItems,
      ]
    );

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Financeiro
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Analise receitas, despesas e resultado por período.
            </p>
          </div>

          {/* =============================== */}
          {/* FILTROS */}
          {/* =============================== */}

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

        {/* ================================= */}
        {/* PERÍODO SELECIONADO */}
        {/* ================================= */}

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600">
              <CalendarDays
                size={
                  21
                }
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

        {/* ================================= */}
        {/* INDICADORES */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                billed
              )
            }
            description="Receitas geradas no período"
            icon={
              <CircleDollarSign
                size={
                  22
                }
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
            description="Entradas de caixa no período"
            icon={
              <ArrowUpCircle
                size={
                  22
                }
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
            description="Cobranças pendentes da competência"
            icon={
              <WalletCards
                size={
                  22
                }
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
            description="Despesas da competência"
            icon={
              <ArrowDownCircle
                size={
                  22
                }
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
            description="Despesas pendentes da competência"
            icon={
              <WalletCards
                size={
                  22
                }
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
            description="Entradas menos saídas de caixa"
            icon={
              <Banknote
                size={
                  22
                }
              />
            }
            highlight
          />
        </div>

        {/* ================================= */}
        {/* COMPETÊNCIA E CAIXA */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              Visão por competência
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Faturado, a receber, despesas e a pagar consideram o mês ao qual cada receita ou despesa pertence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              Visão de caixa
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Recebido, despesas pagas, resultado e movimentações consideram a data real em que o dinheiro entrou ou saiu.
            </p>
          </div>
        </div>

        {/* ================================= */}
        {/* RESUMOS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* =============================== */}
          {/* RECEITAS */}
          {/* =============================== */}

          <PageCard
            title="Resumo de Receitas"
            description="Situação das cobranças pertencentes à competência selecionada."
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
                  receivedFromCompetence
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

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Este bloco acompanha as cobranças geradas para a competência selecionada, independentemente do mês em que o pagamento ocorreu.
            </p>
          </PageCard>

          {/* =============================== */}
          {/* DESPESAS */}
          {/* =============================== */}

          <PageCard
            title="Resumo de Despesas"
            description="Situação das despesas pertencentes à competência selecionada."
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
                  paidFromCompetence
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

            <p className="mt-5 text-xs leading-5 text-slate-400">
              O resumo considera a competência cadastrada na despesa. Despesas antigas sem competência utilizam o mês do vencimento automaticamente.
            </p>
          </PageCard>
        </div>

        {/* ================================= */}
        {/* MOVIMENTAÇÕES */}
        {/* ================================= */}

        <PageCard
          title="Movimentações do Período"
          description={`${movements.length} movimentação(ões) de caixa encontrada(s).`}
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
                size={
                  34
                }
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Nenhuma movimentação de caixa neste período
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Não houve recebimentos ou pagamentos confirmados no mês selecionado.
              </p>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CARD DE MÉTRICA
========================================= */

interface MetricCardProps {
  title: string;

  value: string;

  description: string;

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

  highlight =
    false,
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

/* =========================================
   LINHA DO RESUMO
========================================= */

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
    total >
    0
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
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================
   MOVIMENTAÇÃO
========================================= */

interface Movement {
  id:
    string;

  type:
    | "Receita"
    | "Despesa";

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

  paymentMethod?:
    string;
}

/* =========================================
   LINHA DA MOVIMENTAÇÃO
========================================= */

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
              size={
                19
              }
            />
          ) : (
            <ArrowDownCircle
              size={
                19
              }
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
            }

            {movement.paymentMethod && (
              <>
                {" "}
                •{" "}
                {
                  movement.paymentMethod
                }
              </>
            )}

            {" "}
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

/* =========================================
   MONTAR MOVIMENTAÇÕES
========================================= */

function buildMovements(
  charges:
    FinancialCharge[],

  expenses:
    FinancialExpense[]
): Movement[] {
  /*
   * Somente movimentações realmente
   * pagas entram aqui.
   *
   * Pendente não é entrada nem saída
   * de caixa.
   */

  const revenueMovements =
    charges
      .filter(
        (
          charge
        ) =>
          charge.status ===
            "Pago" &&
          Boolean(
            charge.paymentDate
          )
      )
      .map(
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
            charge.paymentDate!,

          amount:
            charge.receivedAmount ??
            charge.amount,

          status:
            "Pago",

          paymentMethod:
            charge.paymentMethod,
        })
      );

  const expenseMovements =
    expenses
      .filter(
        (
          expense
        ) =>
          expense.status ===
            "Pago" &&
          Boolean(
            expense.paymentDate
          )
      )
      .map(
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
            expense.paymentDate!,

          amount:
            expense.paidAmount ??
            expense.amount,

          status:
            "Pago",

          paymentMethod:
            expense.paymentMethod,
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

/* =========================================
   VERIFICAR PERÍODO
========================================= */

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
      .split(
        "-"
      )
      .map(
        Number
      );

  return (
    valueYear ===
      year &&
    valueMonth ===
      month
  );
}

/* =========================================
   NOME DO MÊS
========================================= */

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

/* =========================================
   FORMATAR DATA
========================================= */

function formatDate(
  value:
    string
) {
  if (!value) {
    return "-";
  }

  const [
    year,

    month,

    day,
  ] =
    value.split(
      "-"
    );

  return `${day}/${month}/${year}`;
}