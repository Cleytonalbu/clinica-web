import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CircleDollarSign,
  FileBarChart,
  FileClock,
  FileWarning,
  HandCoins,
  ReceiptText,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../../../layouts/DashboardLayout";
import {
  getAdministrativeDocumentDisplayStatus,
  getAdministrativeDocuments,
} from "../../DocumentosAdministrativos/documentStorage";
import { getFinancialExpenses } from "../../Financeiro/expenseStorage";
import { getFinancialCharges } from "../../Financeiro/financeStorage";
import { formatCurrency } from "../../Financeiro/financeRules";
import { syncProfessionalPayoutsFromAppointments } from "../../Financeiro/professionalPayoutStorage";
import { getSuppliers } from "../../Fornecedores/supplierStorage";

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

  const charges = useMemo(() => getFinancialCharges(), []);
  const expenses = useMemo(() => getFinancialExpenses(), []);
  const payouts = useMemo(() => syncProfessionalPayoutsFromAppointments(), []);
  const documents = useMemo(() => getAdministrativeDocuments(), []);
  const suppliers = useMemo(() => getSuppliers(), []);

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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Administrativo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a rotina financeira e administrativa da clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {card.helper}
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
          })}
        </div>

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
            {administrativeCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => navigate(card.path)}
                  className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-slate-200 hover:bg-slate-50/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {card.helper}
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
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
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
                onClick={() => navigate("/financeiro")}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Ver financeiro
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
              {recentMovements.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between gap-4 px-4 py-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              movement.type === "Entrada"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {movement.title}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {movement.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-bold ${
                            movement.type === "Entrada"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {movement.type === "Entrada" ? "+" : "-"}
                          {formatCurrency(movement.value)}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                            movement.status
                          )}`}
                        >
                          {movement.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center text-sm text-slate-400">
                  Nenhuma movimentação financeira registrada até o momento.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pendências administrativas
                </h2>
                <p className="text-sm text-slate-500">
                  Itens que precisam de atenção.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/faturamento")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-indigo-100 hover:bg-indigo-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Cobranças pendentes
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Aguardando recebimento
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                  {charges.filter((charge) => charge.status === "Pendente").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/despesas")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-rose-100 hover:bg-rose-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Despesas vencidas
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Pendentes após o vencimento
                  </p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                  {overdueExpenses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/repasses")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-amber-100 hover:bg-amber-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Repasses pendentes
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Profissionais a pagar
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                  {pendingPayoutCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/documentos-administrativos")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-orange-100 hover:bg-orange-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Documentos vencidos
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Contratos e documentos para regularizar
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                  {expiredDocuments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/documentos-administrativos")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition hover:border-violet-100 hover:bg-violet-50/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Documentos vencendo
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Vencimento nos próximos 30 dias
                  </p>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-600">
                  {expiringDocuments.length}
                </span>
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Acesso rápido
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atalhos para as principais rotinas administrativas.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate("/financeiro")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <WalletCards className="text-indigo-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Financeiro</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Contas a receber, despesas e movimentações.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/faturamento")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <CircleDollarSign className="text-emerald-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Faturamento</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Acompanhe cobranças, recebimentos e pendências.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/repasses")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-amber-200 hover:bg-amber-50/40"
            >
              <HandCoins className="text-amber-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Repasses</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Acompanhe os valores destinados aos profissionais.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/despesas")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-rose-200 hover:bg-rose-50/40"
            >
              <Banknote className="text-rose-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Despesas</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Consulte contas, vencimentos e pagamentos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/fornecedores")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
            >
              <UsersRound className="text-violet-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Fornecedores</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Consulte fornecedores ativos e cadastros administrativos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/documentos-administrativos")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40"
            >
              <FileClock className="text-orange-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Documentos</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Contratos, documentos e vencimentos administrativos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/relatorios")}
              className="rounded-xl border border-slate-100 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50/40"
            >
              <FileBarChart className="text-sky-600" size={22} />
              <p className="mt-3 text-sm font-bold text-slate-800">Relatórios</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Consulte relatórios financeiros e administrativos.
              </p>
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}