import {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileClock,
  FileText,
  HandCoins,
  Printer,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getFinancialCharges,
} from "@/pages/Financeiro/financeStorage";

import {
  getFinancialExpenses,
} from "@/pages/Financeiro/expenseStorage";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  syncProfessionalPayoutsFromAppointments,
} from "@/pages/Financeiro/professionalPayoutStorage";

import {
  getSuppliers,
} from "@/pages/Fornecedores/supplierStorage";

import {
  getAdministrativeDocuments,
  getAdministrativeDocumentDisplayStatus,
} from "@/pages/DocumentosAdministrativos/documentStorage";

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function getCurrentMonthStart() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-01`;
}

function getCurrentMonthEnd() {
  const now = new Date();

  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function normalizeDate(value?: string) {
  if (!value) return "";

  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01`;
  }

  return value.slice(0, 10);
}

function isDateInPeriod(
  value: string | undefined,
  startDate: string,
  endDate: string
) {
  const date = normalizeDate(value);

  if (!date) return false;

  return date >= startDate && date <= endDate;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const normalized = normalizeDate(value);
  const [year, month, day] = normalized.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function getPeriodLabel(startDate: string, endDate: string) {
  return `${formatDate(startDate)} até ${formatDate(endDate)}`;
}

/* =========================================
   COMPONENTE
========================================= */

export default function RelatoriosAdministrativos() {
  /*
   * MULTIUNIDADES:
   * o relatório administrativo usa somente os dados financeiros
   * pertencentes à unidade atualmente selecionada.
   */
  const {
    selectedUnitIds,
  } =
    useUnit();

  const [startDate, setStartDate] = useState(getCurrentMonthStart());
  const [endDate, setEndDate] = useState(getCurrentMonthEnd());

  const charges = useMemo(
    () =>
      getFinancialCharges().filter(
        (charge) =>
          selectedUnitIds.includes(
            charge.unitId
          )
      ),
    [selectedUnitIds]
  );

  const expenses = useMemo(
    () =>
      getFinancialExpenses().filter(
        (expense) =>
          selectedUnitIds.includes(
            expense.unitId
          )
      ),
    [selectedUnitIds]
  );

  const payouts = useMemo(
    () =>
      syncProfessionalPayoutsFromAppointments().filter(
        (payout) =>
          selectedUnitIds.includes(
            payout.unitId
          )
      ),
    [selectedUnitIds]
  );

  const suppliers = useMemo(
    () =>
      getSuppliers().filter(
        (
          supplier
        ) =>
          selectedUnitIds.includes(
            supplier.unitId
          )
      ),
    [selectedUnitIds]
  );

  const documents = useMemo(
    () =>
      getAdministrativeDocuments().filter(
        (
          document
        ) =>
          selectedUnitIds.includes(
            document.unitId
          )
      ),
    [selectedUnitIds]
  );

  const periodCharges = charges.filter((charge) =>
    isDateInPeriod(charge.date, startDate, endDate)
  );

  const periodExpenses = expenses.filter((expense) =>
    isDateInPeriod(
      expense.competenceDate
        ? `${expense.competenceDate}-01`
        : expense.dueDate,
      startDate,
      endDate
    )
  );

  const periodPayouts = payouts.filter((payout) =>
    isDateInPeriod(payout.serviceDate, startDate, endDate)
  );

  const billed = periodCharges
    .filter((charge) => charge.status !== "Cancelado")
    .reduce((total, charge) => total + charge.amount, 0);

  const received = periodCharges
    .filter((charge) => charge.status === "Pago")
    .reduce(
      (total, charge) =>
        total + (charge.receivedAmount ?? charge.amount),
      0
    );

  const pendingReceivables = periodCharges
    .filter((charge) => charge.status === "Pendente")
    .reduce((total, charge) => total + charge.amount, 0);

  const paidExpenses = periodExpenses
    .filter((expense) => expense.status === "Pago")
    .reduce(
      (total, expense) =>
        total + (expense.paidAmount ?? expense.amount),
      0
    );

  const registeredExpenses = periodExpenses
    .filter((expense) => expense.status !== "Cancelado")
    .reduce((total, expense) => total + expense.amount, 0);

  const paidPayouts = periodPayouts
    .filter((payout) => payout.status === "Pago")
    .reduce((total, payout) => total + payout.amount, 0);

  const pendingPayouts = periodPayouts
    .filter((payout) => payout.status === "Pendente")
    .reduce((total, payout) => total + payout.amount, 0);

  const netResult = received - paidExpenses - paidPayouts;

  const billingByType = useMemo(() => {
    const grouped = new Map<
      string,
      {
        type: string;
        count: number;
        billed: number;
        received: number;
        pending: number;
      }
    >();

    periodCharges
      .filter((charge) => charge.status !== "Cancelado")
      .forEach((charge) => {
        const type =
          charge.billingType === "Convênio" && charge.convenio
            ? `Convênio - ${charge.convenio}`
            : charge.billingType;

        const current = grouped.get(type) ?? {
          type,
          count: 0,
          billed: 0,
          received: 0,
          pending: 0,
        };

        current.count += 1;
        current.billed += charge.amount;

        if (charge.status === "Pago") {
          current.received += charge.receivedAmount ?? charge.amount;
        }

        if (charge.status === "Pendente") {
          current.pending += charge.amount;
        }

        grouped.set(type, current);
      });

    return Array.from(grouped.values()).sort(
      (a, b) => b.billed - a.billed
    );
  }, [periodCharges]);

  const expensesByCategory = useMemo(() => {
    const grouped = new Map<
      string,
      {
        category: string;
        count: number;
        total: number;
        paid: number;
        pending: number;
      }
    >();

    periodExpenses
      .filter((expense) => expense.status !== "Cancelado")
      .forEach((expense) => {
        const current = grouped.get(expense.category) ?? {
          category: expense.category,
          count: 0,
          total: 0,
          paid: 0,
          pending: 0,
        };

        current.count += 1;
        current.total += expense.amount;

        if (expense.status === "Pago") {
          current.paid += expense.paidAmount ?? expense.amount;
        }

        if (expense.status === "Pendente") {
          current.pending += expense.amount;
        }

        grouped.set(expense.category, current);
      });

    return Array.from(grouped.values()).sort(
      (a, b) => b.total - a.total
    );
  }, [periodExpenses]);

  const payoutsByProfessional = useMemo(() => {
    const grouped = new Map<
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

    periodPayouts.forEach((payout) => {
      const key = `${payout.professional}__${payout.specialty}`;

      const current = grouped.get(key) ?? {
        professional: payout.professional,
        specialty: payout.specialty,
        appointments: 0,
        total: 0,
        paid: 0,
        pending: 0,
      };

      current.appointments += 1;
      current.total += payout.amount;

      if (payout.status === "Pago") {
        current.paid += payout.amount;
      } else {
        current.pending += payout.amount;
      }

      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.total - a.total
    );
  }, [periodPayouts]);

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Ativo"
  ).length;

  const documentSummary = {
    active: documents.filter(
      (document) =>
        getAdministrativeDocumentDisplayStatus(document) === "Ativo"
    ).length,
    expiring: documents.filter(
      (document) =>
        getAdministrativeDocumentDisplayStatus(document) === "Vencendo"
    ).length,
    expired: documents.filter(
      (document) =>
        getAdministrativeDocumentDisplayStatus(document) === "Vencido"
    ).length,
  };

  const metricCards = [
    {
      title: "Faturamento",
      value: formatCurrency(billed),
      helper: `${periodCharges.filter((charge) => charge.status !== "Cancelado").length} cobranças no período`,
      icon: CircleDollarSign,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Recebido",
      value: formatCurrency(received),
      helper: `${formatCurrency(pendingReceivables)} ainda a receber`,
      icon: TrendingUp,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Despesas",
      value: formatCurrency(registeredExpenses),
      helper: `${formatCurrency(paidExpenses)} já pago`,
      icon: TrendingDown,
      iconClass: "bg-rose-50 text-rose-600",
    },
    {
      title: "Repasses",
      value: formatCurrency(
        periodPayouts.reduce((total, payout) => total + payout.amount, 0)
      ),
      helper: `${formatCurrency(pendingPayouts)} pendente`,
      icon: HandCoins,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Resultado líquido",
      value: formatCurrency(netResult),
      helper: "Recebido - despesas pagas - repasses pagos",
      icon: WalletCards,
      iconClass:
        netResult >= 0
          ? "bg-emerald-50 text-emerald-600"
          : "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 report-admin-print-area">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            body * {
              visibility: hidden !important;
            }

            .report-admin-print-area,
            .report-admin-print-area * {
              visibility: visible !important;
            }

            .report-admin-print-area {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 100% !important;
              background: white !important;
            }

            .report-admin-print-hide {
              display: none !important;
            }

            .report-admin-print-area table {
              width: 100% !important;
              font-size: 8pt !important;
            }

            .report-admin-print-area section,
            .report-admin-print-area .rounded-2xl {
              break-inside: avoid;
              box-shadow: none !important;
            }
          }
        `}</style>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Relatórios Administrativos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Visão consolidada da operação financeira e administrativa da clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="report-admin-print-hide inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer size={17} />
            Imprimir relatório
          </button>
        </div>

        <section className="report-admin-print-hide rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <CalendarDays size={18} className="text-indigo-600" />
            <h2 className="font-bold">Período do relatório</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:max-w-2xl">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-600">
                Data inicial
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-600">
                Data final
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <div className="hidden print:block">
          <p className="text-sm text-slate-500">
            Período: {getPeriodLabel(startDate, endDate)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-2 truncate text-xl font-bold text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {card.helper}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ReceiptText size={19} className="text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Faturamento por tipo
              </h2>
              <p className="text-sm text-slate-500">
                Particular e convênios dentro do período selecionado.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Cobranças</th>
                  <th className="pb-3 font-semibold">Faturado</th>
                  <th className="pb-3 font-semibold">Recebido</th>
                  <th className="pb-3 font-semibold">Pendente</th>
                </tr>
              </thead>
              <tbody>
                {billingByType.length > 0 ? (
                  billingByType.map((item) => (
                    <tr
                      key={item.type}
                      className="border-b border-slate-50 text-slate-700 last:border-0"
                    >
                      <td className="py-3.5 font-semibold text-slate-800">
                        {item.type}
                      </td>
                      <td className="py-3.5">{item.count}</td>
                      <td className="py-3.5">{formatCurrency(item.billed)}</td>
                      <td className="py-3.5 text-emerald-700">
                        {formatCurrency(item.received)}
                      </td>
                      <td className="py-3.5 text-amber-700">
                        {formatCurrency(item.pending)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nenhum faturamento encontrado no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <WalletCards size={19} className="text-rose-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Despesas por categoria
                </h2>
                <p className="text-sm text-slate-500">
                  Distribuição das despesas registradas.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold">Qtd.</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Pago</th>
                    <th className="pb-3 font-semibold">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.length > 0 ? (
                    expensesByCategory.map((item) => (
                      <tr
                        key={item.category}
                        className="border-b border-slate-50 text-slate-700 last:border-0"
                      >
                        <td className="py-3.5 font-semibold text-slate-800">
                          {item.category}
                        </td>
                        <td className="py-3.5">{item.count}</td>
                        <td className="py-3.5">{formatCurrency(item.total)}</td>
                        <td className="py-3.5 text-emerald-700">
                          {formatCurrency(item.paid)}
                        </td>
                        <td className="py-3.5 text-amber-700">
                          {formatCurrency(item.pending)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhuma despesa encontrada no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <HandCoins size={19} className="text-amber-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Repasses por profissional
                </h2>
                <p className="text-sm text-slate-500">
                  Produção e situação dos repasses no período.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 font-semibold">Profissional</th>
                    <th className="pb-3 font-semibold">Atend.</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Pago</th>
                    <th className="pb-3 font-semibold">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsByProfessional.length > 0 ? (
                    payoutsByProfessional.map((item) => (
                      <tr
                        key={`${item.professional}-${item.specialty}`}
                        className="border-b border-slate-50 text-slate-700 last:border-0"
                      >
                        <td className="py-3.5">
                          <p className="font-semibold text-slate-800">
                            {item.professional}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.specialty}
                          </p>
                        </td>
                        <td className="py-3.5">{item.appointments}</td>
                        <td className="py-3.5">{formatCurrency(item.total)}</td>
                        <td className="py-3.5 text-emerald-700">
                          {formatCurrency(item.paid)}
                        </td>
                        <td className="py-3.5 text-amber-700">
                          {formatCurrency(item.pending)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhum repasse encontrado no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Situação administrativa
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Resumo de fornecedores e documentos administrativos.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Fornecedores ativos
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {activeSuppliers}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {suppliers.length} cadastrados
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Building2 size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Documentos ativos
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {documentSummary.active}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Regulares
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Vencendo em 30 dias
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {documentSummary.expiring}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Exigem acompanhamento
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FileClock size={19} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Documentos vencidos
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {documentSummary.expired}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Precisam de regularização
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <FileClock size={19} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="hidden print:flex print:items-center print:justify-between print:border-t print:border-slate-200 print:pt-4 print:text-xs print:text-slate-500">
          <span>
            Relatório Administrativo — {getPeriodLabel(startDate, endDate)}
          </span>
          <span>Clínica Integrada Entre Afetos</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
