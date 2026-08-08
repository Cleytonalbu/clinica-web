import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CircleDollarSign,
  FileText,
  Filter,
  Printer,
  WalletCards,
} from "lucide-react";

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
  getFinancialCharges,
  type FinancialCharge,
} from "@/pages/Financeiro/financeStorage";

import {
  getFinancialExpenses,
  type FinancialExpense,
} from "@/pages/Financeiro/expenseStorage";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

type MovementType =
  | "Todos"
  | "Receitas"
  | "Despesas";

interface FinancialMovement {
  id: string;

  sourceId: number;

  type:
    | "Receita"
    | "Despesa";

  description: string;

  person: string;

  date: string;

  amount: number;

  status: string;

  detail: string;
}

export default function RelatorioFinanceiro() {
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

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      "2026-08-01"
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      "2026-08-31"
    );

  const [
    movementType,
    setMovementType,
  ] =
    useState<MovementType>(
      "Todos"
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "Todos"
    );

  const [
    billingType,
    setBillingType,
  ] =
    useState(
      "Todos"
    );

  const periodCharges =
    useMemo(() => {
      return charges.filter(
        (
          charge
        ) => {
          const matchesStart =
            !startDate ||
            charge.date >=
              startDate;

          const matchesEnd =
            !endDate ||
            charge.date <=
              endDate;

          const matchesStatus =
            status ===
              "Todos" ||
            charge.status ===
              status;

          const matchesBilling =
            billingType ===
              "Todos" ||
            charge.billingType ===
              billingType;

          return (
            matchesStart &&
            matchesEnd &&
            matchesStatus &&
            matchesBilling
          );
        }
      );
    }, [
      charges,
      startDate,
      endDate,
      status,
      billingType,
    ]);

  const periodExpenses =
    useMemo(() => {
      return expenses.filter(
        (
          expense
        ) => {
          const referenceDate =
            expense.paymentDate ??
            expense.dueDate;

          const matchesStart =
            !startDate ||
            referenceDate >=
              startDate;

          const matchesEnd =
            !endDate ||
            referenceDate <=
              endDate;

          const matchesStatus =
            status ===
              "Todos" ||
            expense.status ===
              status;

          return (
            matchesStart &&
            matchesEnd &&
            matchesStatus
          );
        }
      );
    }, [
      expenses,
      startDate,
      endDate,
      status,
    ]);

  const allPeriodCharges =
    useMemo(() => {
      return charges.filter(
        (
          charge
        ) =>
          (
            !startDate ||
            charge.date >=
              startDate
          ) &&
          (
            !endDate ||
            charge.date <=
              endDate
          ) &&
          (
            billingType ===
              "Todos" ||
            charge.billingType ===
              billingType
          )
      );
    }, [
      charges,
      startDate,
      endDate,
      billingType,
    ]);

  const allPeriodExpenses =
    useMemo(() => {
      return expenses.filter(
        (
          expense
        ) => {
          const referenceDate =
            expense.paymentDate ??
            expense.dueDate;

          return (
            (
              !startDate ||
              referenceDate >=
                startDate
            ) &&
            (
              !endDate ||
              referenceDate <=
                endDate
            )
          );
        }
      );
    }, [
      expenses,
      startDate,
      endDate,
    ]);

  const validCharges =
    allPeriodCharges.filter(
      (
        charge
      ) =>
        charge.status !==
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
    allPeriodCharges
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
    allPeriodCharges
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

  const validExpenses =
    allPeriodExpenses.filter(
      (
        expense
      ) =>
        expense.status !==
        "Cancelado"
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
    allPeriodExpenses
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
    allPeriodExpenses
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
    useMemo(() => {
      const revenueMovements:
        FinancialMovement[] =
        movementType ===
        "Despesas"
          ? []
          : periodCharges.map(
              (
                charge
              ) => ({
                id:
                  `charge-${charge.id}`,

                sourceId:
                  charge.id,

                type:
                  "Receita",

                description:
                  charge.description,

                person:
                  charge.patient,

                date:
                  charge.paymentDate ??
                  charge.date,

                amount:
                  charge.status ===
                    "Pago"
                    ? charge.receivedAmount ??
                      charge.amount
                    : charge.amount,

                status:
                  charge.status,

                detail:
                  charge.billingType ===
                    "Convênio"
                    ? `${charge.billingType}${
                        charge.convenio
                          ? ` - ${charge.convenio}`
                          : ""
                      }`
                    : charge.paymentMethod,
              })
            );

      const expenseMovements:
        FinancialMovement[] =
        movementType ===
        "Receitas"
          ? []
          : periodExpenses.map(
              (
                expense
              ) => ({
                id:
                  `expense-${expense.id}`,

                sourceId:
                  expense.id,

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
                  expense.status ===
                    "Pago"
                    ? expense.paidAmount ??
                      expense.amount
                    : expense.amount,

                status:
                  expense.status,

                detail:
                  expense.category,
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
    }, [
      movementType,
      periodCharges,
      periodExpenses,
    ]);

  const particularTotal =
    allPeriodCharges
      .filter(
        (
          charge
        ) =>
          charge.status !==
            "Cancelado" &&
          charge.billingType ===
            "Particular"
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

  const convenioTotal =
    allPeriodCharges
      .filter(
        (
          charge
        ) =>
          charge.status !==
            "Cancelado" &&
          charge.billingType ===
            "Convênio"
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

  function handleClearFilters() {
    setStartDate(
      "2026-08-01"
    );

    setEndDate(
      "2026-08-31"
    );

    setMovementType(
      "Todos"
    );

    setStatus(
      "Todos"
    );

    setBillingType(
      "Todos"
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Relatório Financeiro
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Analise receitas, despesas e resultado financeiro da clínica.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={
                handleClearFilters
              }
            >
              <Filter
                size={17}
              />

              Limpar filtros
            </Button>

            <Button
              type="button"
              onClick={
                handlePrint
              }
            >
              <Printer
                size={17}
              />

              Imprimir relatório
            </Button>
          </div>
        </div>

        <PageCard
          title="Filtros"
          description="Defina o período e os tipos de movimentação."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <FormField
              label="Data inicial"
            >
              <Input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Data final"
            >
              <Input
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Movimentação"
            >
              <Select
                value={
                  movementType
                }
                onChange={(
                  event
                ) =>
                  setMovementType(
                    event.target
                      .value as MovementType
                  )
                }
              >
                <option value="Todos">
                  Receitas e despesas
                </option>

                <option value="Receitas">
                  Somente receitas
                </option>

                <option value="Despesas">
                  Somente despesas
                </option>
              </Select>
            </FormField>

            <FormField
              label="Tipo de cobrança"
            >
              <Select
                value={
                  billingType
                }
                disabled={
                  movementType ===
                  "Despesas"
                }
                onChange={(
                  event
                ) =>
                  setBillingType(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Particular e Convênio
                </option>

                <option value="Particular">
                  Particular
                </option>

                <option value="Convênio">
                  Convênio
                </option>
              </Select>
            </FormField>

            <FormField
              label="Status"
            >
              <Select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos os status
                </option>

                <option value="Pendente">
                  Pendente
                </option>

                <option value="Pago">
                  Pago
                </option>

                <option value="Cancelado">
                  Cancelado
                </option>
              </Select>
            </FormField>
          </div>
        </PageCard>

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
            description="Contas pendentes"
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
            description="Recebimentos menos pagamentos"
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
            title="Receitas"
            description="Composição do faturamento."
          >
            <div className="space-y-4">
              <SummaryRow
                label="Particular"
                value={
                  particularTotal
                }
                total={
                  billed
                }
              />

              <SummaryRow
                label="Convênios"
                value={
                  convenioTotal
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
                label="Em aberto"
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
            title="Despesas"
            description="Situação das contas da clínica."
          >
            <div className="space-y-4">
              <SummaryRow
                label="Total de despesas"
                value={
                  totalExpenses
                }
                total={
                  totalExpenses
                }
              />

              <SummaryRow
                label="Despesas pagas"
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
          title="Resultado do Período"
          description="Comparação entre entradas e saídas efetivamente realizadas."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ResultCard
              title="Entradas"
              value={
                received
              }
              positive
            />

            <ResultCard
              title="Saídas"
              value={
                paidExpenses
              }
            />

            <ResultCard
              title="Resultado líquido"
              value={
                result
              }
              highlight
            />
          </div>
        </PageCard>

        <PageCard
          title="Movimentações"
          description={`${movements.length} lançamento(s) encontrado(s).`}
        >
          {movements.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <TableHeader>
                      Data
                    </TableHeader>

                    <TableHeader>
                      Tipo
                    </TableHeader>

                    <TableHeader>
                      Descrição
                    </TableHeader>

                    <TableHeader>
                      Paciente / Fornecedor
                    </TableHeader>

                    <TableHeader>
                      Detalhe
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                    <TableHeader>
                      Valor
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {movements.map(
                    (
                      movement
                    ) => (
                      <tr
                        key={
                          movement.id
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell>
                          {
                            formatDate(
                              movement.date
                            )
                          }
                        </TableCell>

                        <TableCell>
                          <MovementBadge
                            type={
                              movement.type
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <p className="font-semibold text-slate-800">
                            {
                              movement.description
                            }
                          </p>
                        </TableCell>

                        <TableCell>
                          {
                            movement.person
                          }
                        </TableCell>

                        <TableCell>
                          {
                            movement.detail
                          }
                        </TableCell>

                        <TableCell>
                          <SimpleStatusBadge
                            status={
                              movement.status
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <p
                            className={`font-bold ${
                              movement.type ===
                              "Receita"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {movement.type ===
                            "Receita"
                              ? "+"
                              : "-"}
                            {
                              formatCurrency(
                                movement.amount
                              )
                            }
                          </p>
                        </TableCell>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <FileText
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Nenhuma movimentação encontrada
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Altere os filtros para visualizar outros lançamentos.
              </p>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}: {
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
}) {
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
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              highlight
                ? "text-indigo-900"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs ${
              highlight
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            highlight
              ? "bg-white text-indigo-600"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          {label}
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
          className="h-full rounded-full bg-indigo-500"
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  value,
  positive = false,
  highlight = false,
}: {
  title:
    string;

  value:
    number;

  positive?:
    boolean;

  highlight?:
    boolean;
}) {
  let className =
    "border-slate-200 bg-slate-50";

  let valueClass =
    "text-slate-900";

  if (positive) {
    className =
      "border-emerald-100 bg-emerald-50";

    valueClass =
      "text-emerald-700";
  }

  if (highlight) {
    className =
      value >= 0
        ? "border-indigo-200 bg-indigo-50"
        : "border-red-200 bg-red-50";

    valueClass =
      value >= 0
        ? "text-indigo-800"
        : "text-red-700";
  }

  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
    >
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {
          formatCurrency(
            value
          )
        }
      </p>
    </div>
  );
}

function MovementBadge({
  type,
}: {
  type:
    FinancialMovement["type"];
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        type ===
        "Receita"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {type}
    </span>
  );
}

function SimpleStatusBadge({
  status,
}: {
  status:
    string;
}) {
  const style =
    status ===
    "Pago"
      ? "bg-emerald-100 text-emerald-700"
      : status ===
        "Cancelado"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}

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
    value.split("-");

  return `${day}/${month}/${year}`;
}