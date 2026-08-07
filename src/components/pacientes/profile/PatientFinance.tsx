import { useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  MoreVertical,
  Receipt,
  Search,
  WalletCards,
} from "lucide-react";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

type PaymentStatus =
  | "Pago"
  | "Pendente"
  | "Atrasado";

interface PatientPayment {
  id: number;
  description: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  status: PaymentStatus;
  method?: string;
}

const initialPayments: PatientPayment[] = [
  {
    id: 1,
    description: "Mensalidade Agosto/2026",
    dueDate: "10/08/2026",
    amount: 850,
    status: "Pendente",
  },
  {
    id: 2,
    description: "Mensalidade Julho/2026",
    dueDate: "10/07/2026",
    paymentDate: "08/07/2026",
    amount: 850,
    status: "Pago",
    method: "PIX",
  },
  {
    id: 3,
    description: "Mensalidade Junho/2026",
    dueDate: "10/06/2026",
    paymentDate: "10/06/2026",
    amount: 850,
    status: "Pago",
    method: "Cartão",
  },
  {
    id: 4,
    description: "Avaliação complementar",
    dueDate: "20/05/2026",
    amount: 250,
    status: "Atrasado",
  },
];

export function PatientFinance() {
  const [payments] =
    useState<PatientPayment[]>(
      initialPayments
    );

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("Todos");

  const filteredPayments =
    useMemo(() => {
      return payments.filter(
        (payment) => {
          const matchesSearch =
            payment.description
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            status === "Todos" ||
            payment.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      payments,
      search,
      status,
    ]);

  const paidTotal = payments
    .filter(
      (item) =>
        item.status === "Pago"
    )
    .reduce(
      (total, item) =>
        total + item.amount,
      0
    );

  const pendingTotal = payments
    .filter(
      (item) =>
        item.status === "Pendente"
    )
    .reduce(
      (total, item) =>
        total + item.amount,
      0
    );

  const overdueTotal = payments
    .filter(
      (item) =>
        item.status === "Atrasado"
    )
    .reduce(
      (total, item) =>
        total + item.amount,
      0
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Financeiro
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mensalidades, cobranças
            e pagamentos vinculados
            ao paciente.
          </p>
        </div>

        <Button type="button">
          <CreditCard size={18} />
          Nova cobrança
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceSummaryCard
          title="Pago"
          value={formatCurrency(
            paidTotal
          )}
          description="Valores recebidos"
          icon={
            <CheckCircle2
              size={22}
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <FinanceSummaryCard
          title="Pendente"
          value={formatCurrency(
            pendingTotal
          )}
          description="Aguardando pagamento"
          icon={
            <WalletCards
              size={22}
            />
          }
          className="bg-amber-100 text-amber-600"
        />

        <FinanceSummaryCard
          title="Em atraso"
          value={formatCurrency(
            overdueTotal
          )}
          description="Pendências vencidas"
          icon={
            <AlertCircle
              size={22}
            />
          }
          className="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PageCard
            title="Cobranças"
            description="Histórico financeiro do paciente."
          >
            <div className="mb-6 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Pesquisar cobrança..."
                  className="pl-11"
                />
              </div>

              <Select
                value={status}
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target
                      .value
                  )
                }
                className="lg:w-52"
              >
                <option value="Todos">
                  Todos os status
                </option>

                <option value="Pago">
                  Pago
                </option>

                <option value="Pendente">
                  Pendente
                </option>

                <option value="Atrasado">
                  Atrasado
                </option>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <Header>
                      Cobrança
                    </Header>

                    <Header>
                      Vencimento
                    </Header>

                    <Header>
                      Pagamento
                    </Header>

                    <Header>
                      Valor
                    </Header>

                    <Header>
                      Status
                    </Header>

                    <Header align="right">
                      Ações
                    </Header>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map(
                    (payment) => (
                      <tr
                        key={
                          payment.id
                        }
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Receipt
                                size={
                                  18
                                }
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {
                                  payment.description
                                }
                              </p>

                              {payment.method && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    payment.method
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-600">
                          {
                            payment.dueDate
                          }
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-600">
                          {payment.paymentDate ??
                            "—"}
                        </td>

                        <td className="py-4 pr-4 text-sm font-semibold text-slate-800">
                          {formatCurrency(
                            payment.amount
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <PaymentStatusBadge
                            status={
                              payment.status
                            }
                          />
                        </td>

                        <td className="py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                              title="Baixar comprovante"
                            >
                              <Download
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreVertical
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </PageCard>
        </div>

        <div className="space-y-6">
          <PageCard
            title="Plano Atual"
            description="Informações do plano financeiro."
          >
            <div className="rounded-xl bg-indigo-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Plano terapêutico
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                Plano Mensal
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Psicologia +
                Fonoaudiologia + TO
              </p>

              <div className="mt-5 border-t border-indigo-100 pt-5">
                <p className="text-xs text-slate-500">
                  Valor mensal
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-700">
                  R$ 850,00
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500">
                  Vencimento
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Todo dia 10
                </p>
              </div>
            </div>
          </PageCard>

          <PageCard
            title="Situação Financeira"
            description="Resumo atual da conta."
          >
            <div className="space-y-3">
              <FinanceRow
                label="Situação"
                value="Regular"
                valueClassName="text-emerald-600"
              />

              <FinanceRow
                label="Próximo vencimento"
                value="10/08/2026"
              />

              <FinanceRow
                label="Forma principal"
                value="PIX"
              />

              <FinanceRow
                label="Responsável financeiro"
                value="Ana Oliveira"
              />
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}

interface FinanceSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function FinanceSummaryCard({
  title,
  value,
  description,
  icon,
  className,
}: FinanceSummaryCardProps) {
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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  children: React.ReactNode;
  align?: "left" | "right";
}

function Header({
  children,
  align = "left",
}: HeaderProps) {
  return (
    <th
      className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

function PaymentStatusBadge({
  status,
}: PaymentStatusBadgeProps) {
  const styles: Record<
    PaymentStatus,
    string
  > = {
    Pago:
      "bg-emerald-100 text-emerald-700",

    Pendente:
      "bg-amber-100 text-amber-700",

    Atrasado:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface FinanceRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function FinanceRow({
  label,
  value,
  valueClassName = "text-slate-800",
}: FinanceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`text-right text-sm font-semibold ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}