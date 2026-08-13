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
  HandCoins,
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

import {
  markProfessionalPayoutAsPaid,
  markProfessionalPayoutAsPending,
  syncProfessionalPayoutsFromAppointments,
  type ProfessionalPayout,
} from "./professionalPayoutStorage";

type FinanceView =
  | "receivables"
  | "expenses"
  | "professionalPayouts";

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
    payouts,
    setPayouts,
  ] =
    useState<
      ProfessionalPayout[]
    >(
      () =>
        syncProfessionalPayoutsFromAppointments()
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

  const filteredPayouts =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return payouts.filter(
          (
            payout
          ) => {
            const matchesSearch =
              !term ||
              payout.professional
                .toLowerCase()
                .includes(
                  term
                ) ||
              payout.patient
                .toLowerCase()
                .includes(
                  term
                ) ||
              payout.specialty
                .toLowerCase()
                .includes(
                  term
                );

            const matchesStatus =
              status ===
                "Todos" ||
              payout.status ===
                status;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        payouts,
        search,
        status,
      ]
    );

  const payoutGroups =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            {
              professional: string;
              specialty: string;
              appointments: number;
              total: number;
              paid: number;
              pending: number;
            }
          >();

        payouts.forEach(
          (
            payout
          ) => {
            const key =
              `${payout.professional}__${payout.specialty}`;

            const current =
              grouped.get(
                key
              ) ?? {
                professional:
                  payout.professional,
                specialty:
                  payout.specialty,
                appointments:
                  0,
                total:
                  0,
                paid:
                  0,
                pending:
                  0,
              };

            current.appointments += 1;
            current.total += payout.amount;

            if (
              payout.status ===
              "Pago"
            ) {
              current.paid += payout.amount;
            } else {
              current.pending += payout.amount;
            }

            grouped.set(
              key,
              current
            );
          }
        );

        return Array.from(
          grouped.values()
        ).sort(
          (
            a,
            b
          ) =>
            a.professional.localeCompare(
              b.professional,
              "pt-BR"
            )
        );
      },
      [
        payouts,
      ]
    );

  const totalPayouts =
    payouts.reduce(
      (
        sum,
        payout
      ) =>
        sum +
        payout.amount,
      0
    );

  const paidPayouts =
    payouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pago"
      )
      .reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

  const pendingPayouts =
    payouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      )
      .reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
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
    paidExpenses -
    paidPayouts;

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

  function handlePayPayout(
    payoutId:
      string
  ) {
    const confirmed =
      window.confirm(
        "Confirmar pagamento deste repasse ao profissional?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    markProfessionalPayoutAsPaid(
      payoutId
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function handleReopenPayout(
    payoutId:
      string
  ) {
    const confirmed =
      window.confirm(
        "Deseja voltar este repasse para pendente?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    markProfessionalPayoutAsPending(
      payoutId
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function handlePayAllProfessionalPayouts(
    professional:
      string,
    specialty:
      string
  ) {
    const pending =
      payouts.filter(
        (
          payout
        ) =>
          payout.professional ===
            professional &&
          payout.specialty ===
            specialty &&
          payout.status ===
            "Pendente"
      );

    if (
      pending.length ===
      0
    ) {
      return;
    }

    const total =
      pending.reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

    const confirmed =
      window.confirm(
        `Confirmar pagamento de ${formatCurrency(total)} para ${professional}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    pending.forEach(
      (
        payout
      ) =>
        markProfessionalPayoutAsPaid(
          payout.id
        )
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Financeiro
            </h1>

            <p className="mt-2 text-sm text-slate-500">
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
            >
              <Plus
                size={18}
              />

              Nova despesa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                totalRevenue
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
                receivedRevenue
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
            title="Despesas"
            value={
              formatCurrency(
                totalExpenses
              )
            }
            description="Contas cadastradas"
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
            description="Recebido − despesas − repasses pagos"
            icon={
              <Banknote
                size={22}
              />
            }
          />
        </div>

        <PageCard
          title="Movimentações"
          description="Alterne entre cobranças, despesas e repasses aos profissionais."
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

            <ViewButton
              active={
                view ===
                "professionalPayouts"
              }
              onClick={() =>
                handleViewChange(
                  "professionalPayouts"
                )
              }
            >
              Repasses aos profissionais
            </ViewButton>
          </div>
        </PageCard>

        <PageCard
          title="Filtros"
          description={
            view ===
            "receivables"
              ? "Pesquise e filtre as cobranças."
              : view ===
                "expenses"
                ? "Pesquise e filtre as despesas."
                : "Pesquise profissional, paciente ou especialidade."
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
                    : view ===
                      "expenses"
                      ? "Descrição, fornecedor ou categoria..."
                      : "Profissional, paciente ou especialidade..."
                }
                className="pl-11"
              />
            </div>

            {view ===
              "receivables" && (
              <Select
                value={
                  billingType
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
            )}

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
                Pendentes
              </option>

              <option value="Pago">
                Pagos
              </option>

              {view !==
                "professionalPayouts" && (
                <option value="Cancelado">
                  Cancelados
                </option>
              )}
            </Select>
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
                    <tr className="border-b border-slate-200 text-left">
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
                          className="border-b border-slate-100 last:border-b-0"
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
                            <p className="font-bold text-slate-900">
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
        ) : view ===
          "expenses" ? (
          <PageCard
            title="Contas a pagar"
            description={`${filteredExpenses.length} despesa(s) encontrada(s).`}
          >
            {filteredExpenses.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
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
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <TableCell>
                            <p className="font-semibold text-slate-800">
                              {
                                expense.description
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
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
                            <p className="font-bold text-slate-900">
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
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                title="Repasses gerados"
                value={
                  formatCurrency(
                    totalPayouts
                  )
                }
                description="Total dos atendimentos realizados"
                icon={
                  <HandCoins
                    size={22}
                  />
                }
              />

              <MetricCard
                title="Repasses pagos"
                value={
                  formatCurrency(
                    paidPayouts
                  )
                }
                description="Valores já confirmados"
                icon={
                  <ArrowUpCircle
                    size={22}
                  />
                }
              />

              <MetricCard
                title="Repasses pendentes"
                value={
                  formatCurrency(
                    pendingPayouts
                  )
                }
                description="Valores ainda a pagar"
                icon={
                  <WalletCards
                    size={22}
                  />
                }
              />
            </div>

            <PageCard
              title="Resumo por profissional"
              description={`${payoutGroups.length} profissional(is) com repasses gerados.`}
            >
              {payoutGroups.length >
              0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <TableHeader>
                          Profissional
                        </TableHeader>

                        <TableHeader>
                          Atendimentos
                        </TableHeader>

                        <TableHeader>
                          Total
                        </TableHeader>

                        <TableHeader>
                          Pago
                        </TableHeader>

                        <TableHeader>
                          Pendente
                        </TableHeader>

                        <TableHeader>
                          Ação
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody>
                      {payoutGroups.map(
                        (
                          group
                        ) => (
                          <tr
                            key={`${group.professional}-${group.specialty}`}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <TableCell>
                              <p className="font-semibold text-slate-800">
                                {
                                  group.professional
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  group.specialty
                                }
                              </p>
                            </TableCell>

                            <TableCell>
                              {
                                group.appointments
                              }
                            </TableCell>

                            <TableCell>
                              <p className="font-bold text-slate-900">
                                {formatCurrency(
                                  group.total
                                )}
                              </p>
                            </TableCell>

                            <TableCell>
                              <p className="font-semibold text-emerald-600">
                                {formatCurrency(
                                  group.paid
                                )}
                              </p>
                            </TableCell>

                            <TableCell>
                              <p className="font-semibold text-amber-600">
                                {formatCurrency(
                                  group.pending
                                )}
                              </p>
                            </TableCell>

                            <TableCell>
                              {group.pending >
                              0 ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    handlePayAllProfessionalPayouts(
                                      group.professional,
                                      group.specialty
                                    )
                                  }
                                >
                                  Pagar pendentes
                                </Button>
                              ) : (
                                <span className="text-sm font-medium text-emerald-600">
                                  Quitado
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
                  title="Nenhum repasse gerado"
                  description="Os repasses serão criados automaticamente quando atendimentos forem marcados como realizados."
                />
              )}
            </PageCard>

            <PageCard
              title="Detalhamento dos repasses"
              description={`${filteredPayouts.length} lançamento(s) encontrado(s).`}
            >
              {filteredPayouts.length >
              0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <TableHeader>
                          Profissional
                        </TableHeader>

                        <TableHeader>
                          Paciente
                        </TableHeader>

                        <TableHeader>
                          Especialidade
                        </TableHeader>

                        <TableHeader>
                          Data
                        </TableHeader>

                        <TableHeader>
                          Repasse
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader>
                          Ação
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPayouts.map(
                        (
                          payout
                        ) => (
                          <tr
                            key={
                              payout.id
                            }
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <TableCell>
                              <p className="font-semibold text-slate-800">
                                {
                                  payout.professional
                                }
                              </p>
                            </TableCell>

                            <TableCell>
                              <p className="font-medium text-slate-700">
                                {
                                  payout.patient
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Paciente #{payout.patientId}
                              </p>
                            </TableCell>

                            <TableCell>
                              {
                                payout.specialty
                              }
                            </TableCell>

                            <TableCell>
                              {formatDate(
                                payout.serviceDate
                              )}
                            </TableCell>

                            <TableCell>
                              <p className="font-bold text-violet-700">
                                {formatCurrency(
                                  payout.amount
                                )}
                              </p>
                            </TableCell>

                            <TableCell>
                              <PayoutStatusBadge
                                status={
                                  payout.status
                                }
                              />
                            </TableCell>

                            <TableCell>
                              {payout.status ===
                              "Pendente" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    handlePayPayout(
                                      payout.id
                                    )
                                  }
                                >
                                  Confirmar pagamento
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleReopenPayout(
                                      payout.id
                                    )
                                  }
                                >
                                  Voltar para pendente
                                </Button>
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
                  title="Nenhum repasse encontrado"
                  description="Ajuste a busca ou o filtro de status."
                />
              )}
            </PageCard>
          </div>
        )}

        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-5 py-4">
          <p className="text-xs font-semibold text-violet-800">
            Resultado líquido da clínica
          </p>

          <p className="mt-1 text-xs leading-5 text-violet-700">
            Receitas recebidas − despesas pagas − repasses pagos aos profissionais.
            Repasses ainda pendentes não reduzem o resultado realizado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {view ===
          "professionalPayouts" ? (
            <>
              <SmallSummary
                title="Repasses do período"
                value={
                  formatCurrency(
                    totalPayouts
                  )
                }
              />

              <SmallSummary
                title="Repasses pagos"
                value={
                  formatCurrency(
                    paidPayouts
                  )
                }
              />

              <SmallSummary
                title="Repasses pendentes"
                value={
                  formatCurrency(
                    pendingPayouts
                  )
                }
              />
            </>
          ) : (
            <>
              <SmallSummary
                title="A receber"
                value={
                  formatCurrency(
                    pendingRevenue
                  )
                }
              />

              <SmallSummary
                title="Despesas pagas"
                value={
                  formatCurrency(
                    paidExpenses
                  )
                }
              />

              <SmallSummary
                title="Resultado líquido"
                value={
                  formatCurrency(
                    netResult
                  )
                }
              />
            </>
          )}
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
          ? "bg-indigo-100 text-indigo-700"
          : "bg-cyan-100 text-cyan-700"
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
      "bg-amber-100 text-amber-700",

    Pago:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
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
      "bg-amber-100 text-amber-700",

    Pago:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
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

function PayoutStatusBadge({
  status,
}: {
  status:
    ProfessionalPayout["status"];
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        status ===
        "Pago"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
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
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {
              title
            }
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {
              value
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              description
            }
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
          ? "bg-indigo-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
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
    <td className="px-4 py-4 text-sm text-slate-600">
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
    <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
      <CircleDollarSign
        size={34}
        className="mx-auto text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        {
          title
        }
      </p>

      <p className="mt-1 text-sm text-slate-500">
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
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
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