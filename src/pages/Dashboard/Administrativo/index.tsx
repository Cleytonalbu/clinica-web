import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRight,
  Banknote,
  Building2,
  CircleDollarSign,
  FileBarChart,
  FileClock,
  FileWarning,
  HandCoins,
  Landmark,
  ReceiptText,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../../../layouts/DashboardLayout";
import { useUnit } from "../../../providers/UnitContext";
import {
  getAdministrativeDocumentDisplayStatus,
  getAdministrativeDocuments,
} from "../../DocumentosAdministrativos/documentStorage";
import { getFinancialExpenses } from "../../Financeiro/expenseStorage";
import { getFinancialCharges } from "../../Financeiro/financeStorage";
import { formatCurrency } from "../../Financeiro/financeRules";
import { syncProfessionalPayoutsFromAppointments } from "../../Financeiro/professionalPayoutStorage";
import { getSuppliers } from "../../Fornecedores/supplierStorage";
import { getBankAccounts } from "../../ContasBancarias/bankAccountStorage";
import { getBankTransactions } from "../../ImportarExtrato/bankTransactionStorage";
import { getBankReconciliations } from "../../MovimentacoesBancarias/bankReconciliationStorage";

function isSameMonth(dateValue: string | undefined, referenceDate = new Date()) {
  if (!dateValue) return false;

  const date = new Date(`${dateValue.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
}

function getStatusBadgeClass(status: string) {
  if (status === "Pago") return "bg-emerald-50 text-emerald-700";
  if (status === "Pendente") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function DashboardAdministrativo() {
  const navigate = useNavigate();

  const {
    activeUnitId,
  } =
    useUnit();

  const charges = useMemo(
    () => getFinancialCharges().filter((charge) => charge.unitId === activeUnitId),
    [activeUnitId]
  );
  const expenses = useMemo(
    () => getFinancialExpenses().filter((expense) => expense.unitId === activeUnitId),
    [activeUnitId]
  );
  const payouts = useMemo(
    () => syncProfessionalPayoutsFromAppointments().filter(
      (payout) => payout.unitId === activeUnitId
    ),
    [activeUnitId]
  );
  const documents = useMemo(
    () => getAdministrativeDocuments().filter(
      (document) => document.unitId === activeUnitId
    ),
    [activeUnitId]
  );
  const suppliers = useMemo(
    () => getSuppliers().filter((supplier) => supplier.unitId === activeUnitId),
    [activeUnitId]
  );
  const bankAccounts = useMemo(
    () => getBankAccounts().filter((account) => account.unitId === activeUnitId),
    [activeUnitId]
  );
  const bankTransactions = useMemo(() => getBankTransactions(), []);
  const bankReconciliations = useMemo(() => getBankReconciliations(), []);

  const monthCharges = charges.filter((charge) => isSameMonth(charge.date));

  const monthExpenses = expenses.filter((expense) =>
    isSameMonth(
      expense.competenceDate
        ? `${expense.competenceDate}-01`
        : expense.dueDate
    )
  );

  const monthPayouts = payouts.filter((payout) =>
    isSameMonth(payout.serviceDate)
  );

  const received = monthCharges
    .filter((charge) => charge.status === "Pago")
    .reduce(
      (total, charge) => total + (charge.receivedAmount ?? charge.amount),
      0
    );

  const receivable = charges
    .filter((charge) => charge.status === "Pendente")
    .reduce((total, charge) => total + charge.amount, 0);

  const expensesPaid = monthExpenses
    .filter((expense) => expense.status === "Pago")
    .reduce(
      (total, expense) => total + (expense.paidAmount ?? expense.amount),
      0
    );

  const pendingPayouts = monthPayouts
    .filter((payout) => payout.status === "Pendente")
    .reduce((total, payout) => total + payout.amount, 0);

  const pendingExpenses = expenses.filter(
    (expense) => expense.status === "Pendente"
  );

  const activeBankAccounts = bankAccounts.filter(
    (account) => account.status === "Ativa"
  );

  const totalBankBalance = activeBankAccounts.reduce(
    (total, account) => total + account.currentBalance,
    0
  );

  const activeAccountIds = new Set(
    activeBankAccounts.map((account) => account.id)
  );

  const monthBankTransactions = bankTransactions.filter(
    (transaction) =>
      activeAccountIds.has(transaction.accountId) &&
      isSameMonth(transaction.date)
  );

  const bankEntries = monthBankTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

  const bankExits = monthBankTransactions
    .filter((transaction) => transaction.amount < 0)
    .reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0
    );

  const reconciledTransactionIds = new Set(
    bankReconciliations.map(
      (reconciliation) => reconciliation.transactionId
    )
  );

  const pendingBankReconciliations = monthBankTransactions.filter(
    (transaction) =>
      !reconciledTransactionIds.has(transaction.id)
  ).length;

  const reconciledBankTransactions =
    Math.max(
      monthBankTransactions.length -
        pendingBankReconciliations,
      0
    );

  const bankMovementTotal =
    bankEntries +
    bankExits;

  const bankEntriesPercent =
    bankMovementTotal > 0
      ? (bankEntries / bankMovementTotal) * 100
      : 0;

  const bankExitsPercent =
    bankMovementTotal > 0
      ? (bankExits / bankMovementTotal) * 100
      : 0;

  const financialFlowMax =
    Math.max(
      received,
      expensesPaid,
      1
    );

  const receivedPercent =
    (received / financialFlowMax) * 100;

  const expensesPercent =
    (expensesPaid / financialFlowMax) * 100;

  const reconciliationTotal =
    reconciledBankTransactions +
    pendingBankReconciliations;

  const reconciledPercent =
    reconciliationTotal > 0
      ? (reconciledBankTransactions /
          reconciliationTotal) *
        100
      : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueExpenses = pendingExpenses.filter((expense) => {
    const dueDate = new Date(`${expense.dueDate}T12:00:00`);
    return dueDate.getTime() < today.getTime();
  });

  const expiringDocuments = documents.filter(
    (document) =>
      getAdministrativeDocumentDisplayStatus(document) === "Vencendo"
  );

  const expiredDocuments = documents.filter(
    (document) =>
      getAdministrativeDocumentDisplayStatus(document) === "Vencido"
  );

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Ativo"
  );

  const pendingPayoutCount = monthPayouts.filter(
    (payout) => payout.status === "Pendente"
  ).length;

  const recentMovements = [
    ...charges
      .filter((charge) => charge.status === "Pago")
      .map((charge) => ({
        id: `charge-${charge.id}`,
        title: charge.patient,
        description: charge.description,
        value: charge.receivedAmount ?? charge.amount,
        date: charge.paymentDate ?? charge.paidAt ?? charge.date,
        status: charge.status,
        type: "Entrada" as const,
      })),
    ...expenses
      .filter((expense) => expense.status === "Pago")
      .map((expense) => ({
        id: `expense-${expense.id}`,
        title: expense.description,
        description: expense.supplier || expense.category,
        value: expense.paidAmount ?? expense.amount,
        date: expense.paymentDate ?? expense.dueDate,
        status: expense.status,
        type: "Saída" as const,
      })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 6);

  const metricCards = [
    {
      title: "Recebido no mês",
      value: formatCurrency(received),
      helper: `${monthCharges.filter((charge) => charge.status === "Pago").length} recebimentos`,
      icon: TrendingUp,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "A receber",
      value: formatCurrency(receivable),
      helper: `${charges.filter((charge) => charge.status === "Pendente").length} cobranças pendentes`,
      icon: CircleDollarSign,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Despesas do mês",
      value: formatCurrency(expensesPaid),
      helper: `${monthExpenses.filter((expense) => expense.status === "Pago").length} despesas pagas`,
      icon: ReceiptText,
      iconClass: "bg-rose-50 text-rose-600",
    },
    {
      title: "Repasses pendentes",
      value: formatCurrency(pendingPayouts),
      helper: `${pendingPayoutCount} lançamentos`,
      icon: HandCoins,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  const administrativeCards = [
    {
      title: "Despesas vencidas",
      value: String(overdueExpenses.length),
      helper: "Pendentes após o vencimento",
      icon: FileWarning,
      iconClass: "bg-rose-50 text-rose-600",
      path: "/despesas",
    },
    {
      title: "Documentos vencendo",
      value: String(expiringDocuments.length),
      helper: "Vencimento nos próximos 30 dias",
      icon: FileClock,
      iconClass: "bg-amber-50 text-amber-600",
      path: "/documentos-administrativos",
    },
    {
      title: "Documentos vencidos",
      value: String(expiredDocuments.length),
      helper: "Precisam de regularização",
      icon: AlertTriangle,
      iconClass: "bg-orange-50 text-orange-600",
      path: "/documentos-administrativos",
    },
    {
      title: "Fornecedores ativos",
      value: String(activeSuppliers.length),
      helper: `${suppliers.length} fornecedores cadastrados`,
      icon: Building2,
      iconClass: "bg-violet-50 text-violet-600",
      path: "/fornecedores",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ========================================= */}
        {/* MOVIMENTO BANCÁRIO NO TOPO */}
        {/* ========================================= */}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Contas bancárias
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Movimento bancário do mês
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/contas-bancarias",
                )
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Ver contas bancárias
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              title="Saldo bancário atual"
              value={formatCurrency(
                totalBankBalance,
              )}
              description={`${activeBankAccounts.length} conta(s) ativa(s)`}
              icon={Landmark}
              iconClassName="bg-indigo-50 text-indigo-600"
            />

            <DashboardStatCard
              title="Entradas no mês"
              value={formatCurrency(
                bankEntries,
              )}
              description={`${monthBankTransactions.filter(
                (item) =>
                  item.amount > 0,
              ).length} movimentação(ões)`}
              icon={ArrowUpCircle}
              iconClassName="bg-emerald-50 text-emerald-600"
            />

            <DashboardStatCard
              title="Saídas no mês"
              value={formatCurrency(
                bankExits,
              )}
              description={`${monthBankTransactions.filter(
                (item) =>
                  item.amount < 0,
              ).length} movimentação(ões)`}
              icon={ArrowDownCircle}
              iconClassName="bg-red-50 text-red-600"
            />

            <DashboardStatCard
              title="Não conciliadas"
              value={String(
                pendingBankReconciliations,
              )}
              description="Movimentações do mês atual"
              icon={AlertTriangle}
              iconClassName="bg-amber-50 text-amber-600"
            />
          </div>
        </section>

        {/* ========================================= */}
        {/* INDICADORES FINANCEIROS */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <div
                  key={
                    card.title
                  }
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {
                          card.title
                        }
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {
                          card.value
                        }
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {
                          card.helper
                        }
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* ========================================= */}
        {/* GRÁFICOS DO MÊS */}
        {/* ========================================= */}

        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Visão gráfica
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Desempenho financeiro do mês
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* ENTRADAS X SAÍDAS BANCÁRIAS */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Entradas x saídas bancárias
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Movimento real das contas no mês atual.
                  </p>
                </div>

                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
                  <Landmark size={19} />
                </div>
              </div>

              <div className="mt-6 flex h-44 items-end justify-center gap-10 rounded-xl bg-slate-50 px-6 pb-4 pt-5">
                <div className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-xs font-bold text-emerald-700">
                    {formatCurrency(bankEntries)}
                  </span>

                  <div className="flex h-28 w-14 items-end overflow-hidden rounded-t-xl bg-emerald-100">
                    <div
                      className="w-full rounded-t-xl bg-emerald-500 transition-all"
                      style={{
                        height: `${Math.max(
                          bankEntriesPercent,
                          bankEntries > 0 ? 8 : 0,
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    Entradas
                  </span>
                </div>

                <div className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-xs font-bold text-rose-700">
                    {formatCurrency(bankExits)}
                  </span>

                  <div className="flex h-28 w-14 items-end overflow-hidden rounded-t-xl bg-rose-100">
                    <div
                      className="w-full rounded-t-xl bg-rose-500 transition-all"
                      style={{
                        height: `${Math.max(
                          bankExitsPercent,
                          bankExits > 0 ? 8 : 0,
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    Saídas
                  </span>
                </div>
              </div>
            </div>

            {/* RECEBIMENTOS X DESPESAS */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recebimentos x despesas
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Comparação do financeiro no mês atual.
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <TrendingUp size={19} />
                </div>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Recebido
                    </span>

                    <span className="text-sm font-bold text-emerald-700">
                      {formatCurrency(received)}
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.max(
                          receivedPercent,
                          received > 0 ? 5 : 0,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Despesas
                    </span>

                    <span className="text-sm font-bold text-rose-700">
                      {formatCurrency(expensesPaid)}
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-rose-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{
                        width: `${Math.max(
                          expensesPercent,
                          expensesPaid > 0 ? 5 : 0,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Resultado do mês
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        received - expensesPaid >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {formatCurrency(
                        received -
                          expensesPaid,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONCILIAÇÃO */}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Conciliação bancária
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Movimentações conferidas no mês atual.
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <AlertTriangle size={19} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      reconciliationTotal > 0
                        ? `conic-gradient(rgb(16 185 129) 0% ${reconciledPercent}%, rgb(251 191 36) ${reconciledPercent}% 100%)`
                        : "conic-gradient(rgb(226 232 240) 0% 100%)",
                  }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="text-2xl font-bold text-slate-900">
                      {reconciliationTotal > 0
                        ? Math.round(
                            reconciledPercent,
                          )
                        : 0}
                      %
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      conciliado
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                      <span className="text-xs font-semibold text-emerald-800">
                        Conciliadas
                      </span>
                    </div>

                    <span className="text-base font-bold text-emerald-700">
                      {reconciledBankTransactions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                      <span className="text-xs font-semibold text-amber-800">
                        Pendentes
                      </span>
                    </div>

                    <span className="text-base font-bold text-amber-700">
                      {pendingBankReconciliations}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/contas-bancarias",
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Conferir movimentações
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* CONTEÚDO PRINCIPAL + LATERAL */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Indicadores administrativos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Situação atual das principais rotinas administrativas.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {administrativeCards.map(
                  (card) => {
                    const Icon =
                      card.icon;

                    return (
                      <button
                        key={
                          card.title
                        }
                        type="button"
                        onClick={() =>
                          navigate(
                            card.path,
                          )
                        }
                        className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50/70"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              {
                                card.title
                              }
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                              {
                                card.value
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                card.helper
                              }
                            </p>
                          </div>

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                          >
                            <Icon size={19} />
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Movimentações recentes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Últimas entradas e saídas registradas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/financeiro",
                    )
                  }
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Ver financeiro
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
                {recentMovements.length >
                0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentMovements.map(
                      (
                        movement,
                      ) => (
                        <div
                          key={
                            movement.id
                          }
                          className="flex items-center justify-between gap-4 px-4 py-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  movement.type ===
                                  "Entrada"
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                                }`}
                              />

                              <p className="truncate text-sm font-semibold text-slate-800">
                                {
                                  movement.title
                                }
                              </p>
                            </div>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                movement.description
                              }
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={`text-sm font-bold ${
                                movement.type ===
                                "Entrada"
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {movement.type ===
                              "Entrada"
                                ? "+"
                                : "-"}
                              {formatCurrency(
                                movement.value,
                              )}
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                                movement.status,
                              )}`}
                            >
                              {
                                movement.status
                              }
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-slate-400">
                    Nenhuma movimentação financeira registrada até o momento.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ========================================= */}
          {/* LATERAL DIREITA */}
          {/* ========================================= */}

          <aside className="space-y-6">
<section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Pendências
                  </h2>

                  <p className="text-xs text-slate-500">
                    Itens que precisam de atenção.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <PendingItem
                  title="Cobranças pendentes"
                  value={
                    charges.filter(
                      (charge) =>
                        charge.status ===
                        "Pendente",
                    ).length
                  }
                  colorClassName="bg-indigo-50 text-indigo-600"
                  onClick={() =>
                    navigate(
                      "/faturamento",
                    )
                  }
                />

                <PendingItem
                  title="Despesas vencidas"
                  value={
                    overdueExpenses.length
                  }
                  colorClassName="bg-rose-50 text-rose-600"
                  onClick={() =>
                    navigate(
                      "/despesas",
                    )
                  }
                />

                <PendingItem
                  title="Repasses pendentes"
                  value={
                    pendingPayoutCount
                  }
                  colorClassName="bg-amber-50 text-amber-600"
                  onClick={() =>
                    navigate(
                      "/repasses",
                    )
                  }
                />

                <PendingItem
                  title="Documentos vencidos"
                  value={
                    expiredDocuments.length
                  }
                  colorClassName="bg-orange-50 text-orange-600"
                  onClick={() =>
                    navigate(
                      "/documentos-administrativos",
                    )
                  }
                />

                <PendingItem
                  title="Documentos vencendo"
                  value={
                    expiringDocuments.length
                  }
                  colorClassName="bg-violet-50 text-violet-600"
                  onClick={() =>
                    navigate(
                      "/documentos-administrativos",
                    )
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Landmark;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function PendingItem({
  title,
  value,
  colorClassName,
  onClick,
}: {
  title: string;
  value: number;
  colorClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
    >
      <span className="text-sm font-semibold text-slate-700">
        {title}
      </span>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${colorClassName}`}
      >
        {value}
      </span>
    </button>
  );
}