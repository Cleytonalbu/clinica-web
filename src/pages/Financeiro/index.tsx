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
  useAuth,
} from "@/auth/AuthContext";

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

  const {
    user,
  } = useAuth();

  const isRecepcao =
    user?.profile ===
    "Recepção";

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

  const pendingChargeCount =
    charges.filter(
      (
        charge
      ) =>
        charge.status ===
        "Pendente"
    ).length;

  const paidChargeCount =
    charges.filter(
      (
        charge
      ) =>
        charge.status ===
        "Pago"
    ).length;

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

  if (
    isRecepcao
  ) {
    return (
      <DashboardLayout>
        <div className="space-y-5">
          {/* ================================= */}
          {/* CABEÇALHO RECEPÇÃO */}
          {/* ================================= */}

          <div>
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              Financeiro dos Pacientes
            </h1>

            <p className="mt-1.5 text-sm font-medium text-[#7d89a8]">
              Consulte cobranças, acompanhe pendências e registre recebimentos dos pacientes.
            </p>
          </div>

          {/* ================================= */}
          {/* RESUMO OPERACIONAL */}
          {/* SOMENTE VALORES QUE PASSAM PELA RECEPÇÃO */}
          {/* ================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReceptionMetricCard
              title="A receber"
              value={
                formatCurrency(
                  pendingRevenue
                )
              }
              description={`${pendingChargeCount} cobrança(s) pendente(s)`}
              tone="violet"
              icon={
                <WalletCards
                  size={21}
                />
              }
            />

            <ReceptionMetricCard
              title="Recebido"
              value={
                formatCurrency(
                  receivedRevenue
                )
              }
              description={`${paidChargeCount} pagamento(s) confirmado(s)`}
              tone="green"
              icon={
                <ArrowUpCircle
                  size={21}
                />
              }
            />

            <ReceptionMetricCard
              title="Cobranças"
              value={
                String(
                  validCharges.length
                )
              }
              description="Atendimentos com cobrança"
              tone="blue"
              icon={
                <CircleDollarSign
                  size={21}
                />
              }
            />

            <ReceptionMetricCard
              title="Total lançado"
              value={
                formatCurrency(
                  totalRevenue
                )
              }
              description="Valores vinculados a pacientes"
              tone="amber"
              icon={
                <Banknote
                  size={21}
                />
              }
            />
          </div>

          {/* ================================= */}
          {/* FILTROS DISCRETOS */}
          {/* ================================= */}

          <section className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792b3]"
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
                  placeholder="Buscar paciente, profissional ou especialidade..."
                  className="h-11 border-[#e1e4f1] bg-[#fbfbfe] pl-11 focus:bg-white"
                />
              </div>

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
                className="h-11 border-[#e1e4f1] bg-[#fbfbfe]"
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
                className="h-11 border-[#e1e4f1] bg-[#fbfbfe]"
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
          </section>

          {/* ================================= */}
          {/* COBRANÇAS DOS PACIENTES */}
          {/* ================================= */}

          <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
            <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#10235f]">
                  Cobranças dos pacientes
                </h2>

                <p className="mt-1 text-xs font-medium text-[#8b95b2]">
                  {filteredCharges.length} cobrança(s) encontrada(s).
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-[#f0ecff] px-3 py-1.5 text-[10px] font-extrabold text-[#6847f5]">
                Recepção
              </span>
            </div>

            {filteredCharges.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px]">
                  <thead>
                    <tr className="border-b border-[#eceef5] bg-[#fbfbfe] text-left">
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
                          className="border-b border-[#f0f1f6] transition last:border-b-0 hover:bg-[#fcfbff]"
                        >
                          <TableCell>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/pacientes/${charge.patientId}`
                                )
                              }
                              className="text-left"
                            >
                              <p className="font-extrabold text-[#263765] transition hover:text-[#6543ef]">
                                {
                                  charge.patient
                                }
                              </p>

                              <p className="mt-1 text-[10px] font-medium text-[#98a1b8]">
                                Paciente #
                                {
                                  charge.patientId
                                }
                              </p>
                            </button>
                          </TableCell>

                          <TableCell>
                            <p className="font-semibold text-[#526080]">
                              {
                                charge.specialty
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-[#98a1b8]">
                              Agendamento #
                              {
                                charge.appointmentId
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <span className="font-medium text-[#697699]">
                              {
                                charge.professional
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <BillingBadge
                              type={
                                charge.billingType
                              }
                            />

                            {charge.convenio && (
                              <p className="mt-2 text-[10px] font-medium text-[#7d89a8]">
                                {
                                  charge.convenio
                                }
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className="text-sm font-medium text-[#5f6e93]">
                              {
                                charge.paymentMethod
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-[#697699]">
                              {
                                formatDate(
                                  charge.date
                                )
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <p className="font-extrabold text-[#263765]">
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
                                  className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] hover:opacity-95"
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
                description="As cobranças dos pacientes aparecerão aqui conforme os atendimentos forem lançados."
              />
            )}
          </section>

          {/* ================================= */}
          {/* RESUMO DA RECEPÇÃO */}
          {/* ================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReceptionSummary
              title="Pendências de pacientes"
              value={
                formatCurrency(
                  pendingRevenue
                )
              }
              description={`${pendingChargeCount} cobrança(s) aguardando pagamento`}
              tone="violet"
            />

            <ReceptionSummary
              title="Recebimentos confirmados"
              value={
                formatCurrency(
                  receivedRevenue
                )
              }
              description={`${paidChargeCount} pagamento(s) registrado(s)`}
              tone="green"
            />

            <ReceptionSummary
              title="Atendimentos financeiros"
              value={
                String(
                  validCharges.length
                )
              }
              description="Cobranças vinculadas aos pacientes"
              tone="blue"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#e9e3ff] bg-gradient-to-r from-[#f4f0ff] via-[#f8f5ff] to-[#fbf9ff] px-5 py-4 text-sm text-[#5d678c]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
              <CircleDollarSign
                size={18}
              />
            </span>

            <p>
              <strong className="text-[#6543ef]">
                Financeiro da recepção:
              </strong>{" "}
              aqui aparecem somente cobranças e recebimentos vinculados aos pacientes. Despesas administrativas permanecem restritas à gestão.
            </p>
          </div>
        </div>
      </DashboardLayout>
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
            description="Recebido menos pago"
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

              <option value="Cancelado">
                Cancelados
              </option>
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
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            title="Resultado realizado"
            value={
              formatCurrency(
                netResult
              )
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

type ReceptionTone =
  | "violet"
  | "green"
  | "blue"
  | "amber";

interface ReceptionMetricCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  tone:
    ReceptionTone;
}

function ReceptionMetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: ReceptionMetricCardProps) {
  const toneStyles: Record<
    ReceptionTone,
    {
      card:
        string;
      icon:
        string;
      value:
        string;
    }
  > = {
    violet: {
      card:
        "border-[#e4ddff] bg-gradient-to-br from-white to-[#f8f5ff]",
      icon:
        "bg-[#eeeaff] text-[#6847f5]",
      value:
        "text-[#6847f5]",
    },

    green: {
      card:
        "border-[#d8f1e8] bg-gradient-to-br from-white to-[#f4fcf8]",
      icon:
        "bg-[#e7f8f1] text-[#28a77d]",
      value:
        "text-[#249b75]",
    },

    blue: {
      card:
        "border-[#dcecff] bg-gradient-to-br from-white to-[#f5faff]",
      icon:
        "bg-[#eaf4ff] text-[#3988e8]",
      value:
        "text-[#397fd5]",
    },

    amber: {
      card:
        "border-[#f5e5cf] bg-gradient-to-br from-white to-[#fffaf3]",
      icon:
        "bg-[#fff1df] text-[#e38c28]",
      value:
        "text-[#d98725]",
    },
  };

  const style =
    toneStyles[
      tone
    ];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] ${style.card}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-[#68769b]">
            {
              title
            }
          </p>

          <p
            className={`mt-3 text-[26px] font-extrabold tracking-[-0.03em] ${style.value}`}
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

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          {
            icon
          }
        </span>
      </div>
    </div>
  );
}

interface ReceptionSummaryProps {
  title:
    string;

  value:
    string;

  description:
    string;

  tone:
    "violet"
    | "green"
    | "blue";
}

function ReceptionSummary({
  title,
  value,
  description,
  tone,
}: ReceptionSummaryProps) {
  const styles = {
    violet:
      "border-[#e4ddff] bg-[#faf8ff] text-[#6847f5]",

    green:
      "border-[#d8f1e8] bg-[#f6fcf9] text-[#269d75]",

    blue:
      "border-[#dcecff] bg-[#f7fbff] text-[#397fd5]",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[tone]}`}
    >
      <p className="text-xs font-semibold opacity-80">
        {
          title
        }
      </p>

      <p className="mt-2 text-xl font-extrabold">
        {
          value
        }
      </p>

      <p className="mt-1 text-[10px] font-medium opacity-70">
        {
          description
        }
      </p>
    </div>
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