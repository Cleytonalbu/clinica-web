import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BarChart3,
  CircleDollarSign,
  Plus,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  Input,
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

type FinanceView =
  | "receivables"
  | "expenses";

export default function Financeiro() {
  const navigate =
    useNavigate();

  const [
    view,
    setView,
  ] =
    useState<FinanceView>(
      "receivables"
    );

  const [
    charges,
  ] =
    useState<
      FinancialCharge[]
    >(
      () =>
        getFinancialCharges()
    );

  const [
    expenses,
  ] =
    useState<
      FinancialExpense[]
    >(
      () =>
        getFinancialExpenses()
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

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

  const filteredCharges =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return charges.filter(
          (
            charge
          ) => {
            const matchesSearch =
              !term ||
              charge.patient
                .toLowerCase()
                .includes(
                  term
                ) ||
              charge.professional
                .toLowerCase()
                .includes(
                  term
                ) ||
              charge.specialty
                .toLowerCase()
                .includes(
                  term
                );

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
              matchesSearch &&
              matchesStatus &&
              matchesBilling
            );
          }
        );
      },
      [
        charges,
        search,
        status,
        billingType,
      ]
    );

  const filteredExpenses =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return expenses.filter(
          (
            expense
          ) => {
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
                ) ||
              expense.category
                .toLowerCase()
                .includes(
                  term
                );

            const matchesStatus =
              status ===
                "Todos" ||
              expense.status ===
                status;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        expenses,
        search,
        status,
      ]
    );

  const validCharges =
    charges.filter(
      (
        charge
      ) =>
        charge.status !==
        "Cancelado"
    );

  const totalRevenue =
    validCharges.reduce(
      (
        sum,
        charge
      ) =>
        sum +
        charge.amount,
      0
    );

  const pendingRevenue =
    charges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pendente"
      )
      .reduce(
        (
          sum,
          charge
        ) =>
          sum +
          charge.amount,
        0
      );

  const receivedRevenue =
    charges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pago"
      )
      .reduce(
        (
          sum,
          charge
        ) =>
          sum +
          (
            charge.receivedAmount ??
            charge.amount
          ),
        0
      );

  const validExpenses =
    expenses.filter(
      (
        expense
      ) =>
        expense.status !==
        "Cancelado"
    );

  const totalExpenses =
    validExpenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        expense.amount,
      0
    );

  const pendingExpenses =
    expenses
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

  const paidExpenses =
    expenses
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
          (
            expense.paidAmount ??
            expense.amount
          ),
        0
      );

  const netResult =
    receivedRevenue -
    paidExpenses;

  function handleViewChange(
    nextView:
      FinanceView
  ) {
    setView(
      nextView
    );

    setSearch(
      ""
    );

    setStatus(
      "Todos"
    );

    setBillingType(
      "Todos"
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              Financeiro
            </h1>

            <p className="mt-1.5 text-sm font-medium text-[#7d89a8]">
              Controle receitas, despesas e o resultado financeiro da clínica.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  "/financeiro/dashboard"
                )
              }
              className="border-[#dfe3f2] bg-white text-[#263765] hover:bg-[#faf9ff]"
            >
              <BarChart3
                size={18}
              />

              Dashboard financeiro
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/financeiro/despesas/nova"
                )
              }
              className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] shadow-[0_8px_20px_rgba(103,66,246,0.18)] hover:opacity-95"
            >
              <Plus
                size={18}
              />

              Nova despesa
            </Button>
          </div>
        </div>

        <PageCard
          title="Filtros"
          description={
            view ===
            "receivables"
              ? "Pesquise e filtre as cobranças."
              : "Pesquise e filtre as despesas."
          }
        >
          <div
            className={
              view ===
              "receivables"
                ? "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px]"
                : "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"
            }
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  view ===
                  "receivables"
                    ? "Paciente, profissional ou especialidade..."
                    : "Descrição, fornecedor ou categoria..."
                }
                className="border-[#e1e4f1] bg-[#fbfbfe] pl-11 focus:bg-white"
              />
            </div>

            {view ===
              "receivables" && (
              <Select
                value={
                  billingType
                }
                className="border-[#e1e4f1] bg-[#fbfbfe] focus:bg-white"
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
            )}

            <Select
              value={
                status
              }
              className="border-[#e1e4f1] bg-[#fbfbfe] focus:bg-white"
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
                Pendentes
              </option>

              <option value="Pago">
                Pagos
              </option>

              <option value="Cancelado">
                Cancelados
              </option>
            </Select>
          </div>
        </PageCard>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                totalRevenue
              )
            }
            description="Receitas geradas"
            tone="purple"
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
                receivedRevenue
              )
            }
            description="Entradas confirmadas"
            tone="green"
            icon={
              <ArrowUpCircle
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
            description="Contas cadastradas"
            tone="red"
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
                pendingExpenses
              )
            }
            description="Despesas pendentes"
            tone="orange"
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
                netResult
              )
            }
            description="Recebido menos pago"
            tone={
              netResult >= 0
                ? "blue"
                : "red"
            }
            icon={
              <Banknote
                size={22}
              />
            }
          />
        </div>

        <PageCard
          title="Movimentações"
          description="Alterne entre receitas e despesas."
        >
          <div className="flex flex-wrap gap-2">
            <ViewButton
              active={
                view ===
                "receivables"
              }
              onClick={() =>
                handleViewChange(
                  "receivables"
                )
              }
            >
              Contas a receber
            </ViewButton>

            <ViewButton
              active={
                view ===
                "expenses"
              }
              onClick={() =>
                handleViewChange(
                  "expenses"
                )
              }
            >
              Contas a pagar
            </ViewButton>
          </div>
        </PageCard>

        {view ===
          "receivables" ? (
          <PageCard
            title="Contas a receber"
            description={`${filteredCharges.length} cobrança(s) encontrada(s).`}
          >
            {filteredCharges.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-[#e8eaf3] bg-[#fbfbfe] text-left">
                      <TableHeader>
                        Paciente
                      </TableHeader>

                      <TableHeader>
                        Atendimento
                      </TableHeader>

                      <TableHeader>
                        Profissional
                      </TableHeader>

                      <TableHeader>
                        Cobrança
                      </TableHeader>

                      <TableHeader>
                        Pagamento
                      </TableHeader>

                      <TableHeader>
                        Data
                      </TableHeader>

                      <TableHeader>
                        Valor
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Ações
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCharges.map(
                      (
                        charge
                      ) => (
                        <tr
                          key={
                            charge.id
                          }
                          className="border-b border-[#eef0f5] transition last:border-b-0 hover:bg-[#fcfbff]"
                        >
                          <TableCell>
                            <p className="font-semibold text-slate-800">
                              {
                                charge.patient
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Paciente #
                              {
                                charge.patientId
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="font-medium text-slate-700">
                              {
                                charge.specialty
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Agendamento #
                              {
                                charge.appointmentId
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            {
                              charge.professional
                            }
                          </TableCell>

                          <TableCell>
                            <BillingBadge
                              type={
                                charge.billingType
                              }
                            />

                            {charge.convenio && (
                              <p className="mt-2 text-xs text-slate-500">
                                {
                                  charge.convenio
                                }
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            {
                              charge.paymentMethod
                            }
                          </TableCell>

                          <TableCell>
                            {
                              formatDate(
                                charge.date
                              )
                            }
                          </TableCell>

                          <TableCell>
                            <p className="font-extrabold text-[#269d75]">
                              {
                                formatCurrency(
                                  charge.amount
                                )
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <ChargeStatusBadge
                              status={
                                charge.status
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/financeiro/paciente/${charge.patientId}`
                                  )
                                }
                              >
                                <UserRound
                                  size={15}
                                />

                                Histórico
                              </Button>

                              {charge.status ===
                                "Pendente" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    navigate(
                                      `/financeiro/receber/${charge.id}`
                                    )
                                  }
                                >
                                  Receber
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Nenhuma cobrança encontrada"
                description="As cobranças aparecerão quando os atendimentos forem realizados."
              />
            )}
          </PageCard>
        ) : (
          <PageCard
            title="Contas a pagar"
            description={`${filteredExpenses.length} despesa(s) encontrada(s).`}
          >
            {filteredExpenses.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-[#e8eaf3] bg-[#fbfbfe] text-left">
                      <TableHeader>
                        Despesa
                      </TableHeader>

                      <TableHeader>
                        Categoria
                      </TableHeader>

                      <TableHeader>
                        Fornecedor
                      </TableHeader>

                      <TableHeader>
                        Vencimento
                      </TableHeader>

                      <TableHeader>
                        Valor
                      </TableHeader>

                      <TableHeader>
                        Pagamento
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Ações
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExpenses.map(
                      (
                        expense
                      ) => (
                        <tr
                          key={
                            expense.id
                          }
                          className="border-b border-[#eef0f5] transition last:border-b-0 hover:bg-[#fcfbff]"
                        >
                          <TableCell>
                            <p className="font-semibold text-slate-800">
                              {
                                expense.description
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <span className="rounded-lg bg-[#f2efff] px-2.5 py-1 text-xs font-semibold text-[#6847f5]">
                              {
                                expense.category
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            {
                              expense.supplier
                            }
                          </TableCell>

                          <TableCell>
                            {
                              formatDate(
                                expense.dueDate
                              )
                            }
                          </TableCell>

                          <TableCell>
                            <p className="font-extrabold text-[#df4e67]">
                              {
                                formatCurrency(
                                  expense.amount
                                )
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            {expense.status ===
                            "Pago" ? (
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {
                                    expense.paymentMethod ??
                                    "-"
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {expense.paymentDate
                                    ? formatDate(
                                        expense.paymentDate
                                      )
                                    : "-"}
                                </p>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>

                          <TableCell>
                            <ExpenseStatusBadge
                              status={
                                expense.status
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {expense.status ===
                              "Pendente" ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/financeiro/despesas/${expense.id}/pagar`
                                  )
                                }
                              >
                                Pagar
                              </Button>
                            ) : (
                              <span className="text-sm text-slate-400">
                                {
                                  expense.status
                                }
                              </span>
                            )}
                          </TableCell>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Nenhuma despesa encontrada"
                description="Cadastre contas como aluguel, energia, internet ou materiais."
              />
            )}
          </PageCard>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SmallSummary
            title="A receber"
            tone="purple"
            value={
              formatCurrency(
                pendingRevenue
              )
            }
          />

          <SmallSummary
            title="Despesas pagas"
            tone="red"
            value={
              formatCurrency(
                paidExpenses
              )
            }
          />

          <SmallSummary
            title="Resultado realizado"
            tone={
              netResult >= 0
                ? "green"
                : "red"
            }
            value={
              formatCurrency(
                netResult
              )
            }
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e2ff] bg-gradient-to-r from-[#f3efff] via-[#f7f4ff] to-[#fbf9ff] px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
            <BarChart3
              size={18}
            />
          </span>

          <p className="text-sm font-medium text-[#657196]">
            <strong className="text-[#6543ef]">
              Resumo financeiro:
            </strong>{" "}
            acompanhe entradas, despesas pendentes e resultado realizado para identificar rapidamente a saúde financeira da clínica.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function BillingBadge({
  type,
}: {
  type:
    FinancialCharge["billingType"];
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        type ===
        "Particular"
          ? "bg-[#eeeaff] text-[#6847f5]"
          : "bg-[#eaf4ff] text-[#3984dc]"
      }`}
    >
      {
        type
      }
    </span>
  );
}

function ChargeStatusBadge({
  status,
}: {
  status:
    FinancialCharge["status"];
}) {
  const styles: Record<
    FinancialCharge["status"],
    string
  > = {
    Pendente:
      "bg-[#fff3e4] text-[#df8a27]",

    Pago:
      "bg-[#e7f8f0] text-[#269d75]",

    Cancelado:
      "bg-[#fff0f3] text-[#df4e67]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        status
      }
    </span>
  );
}

function ExpenseStatusBadge({
  status,
}: {
  status:
    FinancialExpense["status"];
}) {
  const styles: Record<
    FinancialExpense["status"],
    string
  > = {
    Pendente:
      "bg-[#fff3e4] text-[#df8a27]",

    Pago:
      "bg-[#e7f8f0] text-[#269d75]",

    Cancelado:
      "bg-[#fff0f3] text-[#df4e67]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        status
      }
    </span>
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

  tone:
    "purple"
    | "green"
    | "red"
    | "orange"
    | "blue";
}

function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: MetricCardProps) {
  const styles = {
    purple: {
      icon:
        "bg-[#eeeaff] text-[#6847f5]",
      value:
        "text-[#6847f5]",
    },

    green: {
      icon:
        "bg-[#e8faf4] text-[#2daf82]",
      value:
        "text-[#269d75]",
    },

    red: {
      icon:
        "bg-[#fff0f3] text-[#eb5771]",
      value:
        "text-[#df4e67]",
    },

    orange: {
      icon:
        "bg-[#fff4e7] text-[#ed982f]",
      value:
        "text-[#dc8a27]",
    },

    blue: {
      icon:
        "bg-[#eaf4ff] text-[#3988e8]",
      value:
        "text-[#357fd6]",
    },
  }[tone];

  return (
    <div className="rounded-2xl border border-[#e9ebf4] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(51,65,120,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-[#68769b]">
            {
              title
            }
          </p>

          <p
            className={`mt-3 text-[27px] font-extrabold tracking-[-0.03em] ${styles.value}`}
          >
            {
              value
            }
          </p>

          <p className="mt-1.5 text-[10px] font-medium text-[#98a1ba]">
            {
              description
            }
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  children,
  onClick,
}: {
  active:
    boolean;

  children:
    React.ReactNode;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-[#5d3df5] to-[#773cf5] text-white shadow-[0_7px_18px_rgba(103,66,246,0.18)]"
          : "border border-[#e0e3ef] bg-white text-[#58678e] hover:border-[#d3ccff] hover:bg-[#faf9ff] hover:text-[#6543ef]"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-[#8d97b1]">
      {
        children
      }
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
    <td className="px-4 py-4 text-sm text-[#657295]">
      {
        children
      }
    </td>
  );
}

function EmptyState({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#dedfea] bg-[#fbfbfd] p-10 text-center">
      <CircleDollarSign
        size={34}
        className="mx-auto text-[#c1c6d4]"
      />

      <p className="mt-4 font-extrabold text-[#526080]">
        {
          title
        }
      </p>

      <p className="mt-1 text-sm text-[#929bb3]">
        {
          description
        }
      </p>
    </div>
  );
}

function SmallSummary({
  title,
  value,
  tone,
}: {
  title:
    string;

  value:
    string;

  tone:
    "purple"
    | "green"
    | "red";
}) {
  const styles = {
    purple:
      "border-[#e8e2ff] bg-[#faf8ff] text-[#6847f5]",

    green:
      "border-[#dcefe8] bg-[#f7fcfa] text-[#269d75]",

    red:
      "border-[#f6dde3] bg-[#fff9fa] text-[#df4e67]",
  }[tone];

  return (
    <div
      className={`rounded-xl border p-4 ${styles}`}
    >
      <p className="text-sm font-semibold opacity-75">
        {
          title
        }
      </p>

      <p className="mt-1 text-lg font-extrabold">
        {
          value
        }
      </p>
    </div>
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