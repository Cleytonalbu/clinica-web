import {
  useMemo,
  useState,
} from "react";

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
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

/* =========================================
   TIPOS
========================================= */

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

/* =========================================
   DADOS TEMPORÁRIOS
========================================= */

const initialPayments: PatientPayment[] = [
  {
    id: 1,

    description:
      "Mensalidade Agosto/2026",

    dueDate:
      "10/08/2026",

    amount: 850,

    status:
      "Pendente",
  },

  {
    id: 2,

    description:
      "Mensalidade Julho/2026",

    dueDate:
      "10/07/2026",

    paymentDate:
      "08/07/2026",

    amount: 850,

    status:
      "Pago",

    method:
      "PIX",
  },

  {
    id: 3,

    description:
      "Mensalidade Junho/2026",

    dueDate:
      "10/06/2026",

    paymentDate:
      "10/06/2026",

    amount: 850,

    status:
      "Pago",

    method:
      "Cartão",
  },

  {
    id: 4,

    description:
      "Avaliação complementar",

    dueDate:
      "20/05/2026",

    amount: 250,

    status:
      "Atrasado",
  },
];

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientFinance() {
  const {
    user,
  } = useAuth();

  const [
    payments,
    setPayments,
  ] =
    useState<
      PatientPayment[]
    >(
      initialPayments
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "Todos"
    );

  /* =======================================
     PERFIS
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  /*
   * Gestor possui administração
   * financeira completa.
   */

  const canManageFinance =
    isGestor;

  /*
   * Gestor e Recepção podem registrar
   * recebimentos.
   */

  const canReceivePayment =
    isGestor ||
    isRecepcao;

  /* =======================================
     FILTROS
  ======================================= */

  const filteredPayments =
    useMemo(
      () => {
        return payments.filter(
          (
            payment
          ) => {
            const matchesSearch =
              payment.description
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            const matchesStatus =
              status ===
                "Todos" ||
              payment.status ===
                status;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        payments,
        search,
        status,
      ]
    );

  /* =======================================
     TOTAIS
  ======================================= */

  const paidTotal =
    payments
      .filter(
        (
          item
        ) =>
          item.status ===
          "Pago"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.amount,
        0
      );

  const pendingTotal =
    payments
      .filter(
        (
          item
        ) =>
          item.status ===
          "Pendente"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.amount,
        0
      );

  const overdueTotal =
    payments
      .filter(
        (
          item
        ) =>
          item.status ===
          "Atrasado"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.amount,
        0
      );

  /* =======================================
     NOVA COBRANÇA
  ======================================= */

  function handleNewCharge() {
    if (
      !canManageFinance
    ) {
      return;
    }

    /*
     * A tela de nova cobrança ainda
     * será criada.
     *
     * Futuramente:
     *
     * /financeiro/cobrancas/nova
     */
  }

  /* =======================================
     REGISTRAR RECEBIMENTO
  ======================================= */

  function handleReceivePayment(
    payment: PatientPayment
  ) {
    if (
      !canReceivePayment
    ) {
      return;
    }

    if (
      payment.status ===
      "Pago"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Confirmar o recebimento de ${formatCurrency(
          payment.amount
        )} referente a "${payment.description}"?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    /*
     * TEMPORÁRIO:
     *
     * Enquanto não temos API, marcamos
     * o pagamento como recebido apenas
     * no estado local da tela.
     */

    setPayments(
      (
        current
      ) =>
        current.map(
          (
            currentPayment
          ) =>
            currentPayment.id ===
            payment.id
              ? {
                  ...currentPayment,

                  status:
                    "Pago",

                  paymentDate:
                    new Date().toLocaleDateString(
                      "pt-BR"
                    ),

                  method:
                    "PIX",
                }
              : currentPayment
        )
    );
  }

  /* =======================================
     DOWNLOAD
  ======================================= */

  function handleDownload(
    payment: PatientPayment
  ) {
    /*
     * Quando conectarmos a API,
     * receberemos a URL real
     * do comprovante.
     */

    console.log(
      "Baixar comprovante:",
      payment.id
    );
  }

  /* =======================================
     MAIS OPÇÕES
  ======================================= */

  function handleMoreOptions(
    payment: PatientPayment
  ) {
    /*
     * Posteriormente o Gestor poderá
     * acessar ações como:
     *
     * - editar cobrança;
     * - cancelar cobrança;
     * - alterar vencimento;
     * - consultar detalhes.
     */

    console.log(
      "Opções da cobrança:",
      payment.id
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Financeiro
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mensalidades, cobranças e pagamentos vinculados ao paciente.
          </p>
        </div>

        {/* ================================= */}
        {/* NOVA COBRANÇA */}
        {/* SOMENTE GESTOR */}
        {/* ================================= */}

        {canManageFinance && (
          <Button
            type="button"
            onClick={
              handleNewCharge
            }
          >
            <CreditCard
              size={
                18
              }
            />

            Nova cobrança
          </Button>
        )}
      </div>

      {/* ================================= */}
      {/* RESUMO FINANCEIRO */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceSummaryCard
          title="Pago"
          value={
            formatCurrency(
              paidTotal
            )
          }
          description="Valores recebidos"
          icon={
            <CheckCircle2
              size={
                22
              }
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <FinanceSummaryCard
          title="Pendente"
          value={
            formatCurrency(
              pendingTotal
            )
          }
          description="Aguardando pagamento"
          icon={
            <WalletCards
              size={
                22
              }
            />
          }
          className="bg-amber-100 text-amber-600"
        />

        <FinanceSummaryCard
          title="Em atraso"
          value={
            formatCurrency(
              overdueTotal
            )
          }
          description="Pendências vencidas"
          icon={
            <AlertCircle
              size={
                22
              }
            />
          }
          className="bg-red-100 text-red-600"
        />
      </div>

      {/* ================================= */}
      {/* CONTEÚDO */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ================================= */}
        {/* COBRANÇAS */}
        {/* ================================= */}

        <div className="xl:col-span-2">
          <PageCard
            title="Cobranças"
            description="Histórico financeiro do paciente."
          >
            {/* ============================= */}
            {/* FILTROS */}
            {/* ============================= */}

            <div className="mb-6 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={
                    18
                  }
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
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Pesquisar cobrança..."
                  className="pl-11"
                />
              </div>

              <Select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event
                      .target
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

            {/* ============================= */}
            {/* TABELA */}
            {/* ============================= */}

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
                    (
                      payment
                    ) => (
                      <tr
                        key={
                          payment.id
                        }
                        className="border-b border-slate-100 last:border-0"
                      >
                        {/* ================= */}
                        {/* COBRANÇA */}
                        {/* ================= */}

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

                        {/* ================= */}
                        {/* VENCIMENTO */}
                        {/* ================= */}

                        <td className="py-4 pr-4 text-sm text-slate-600">
                          {
                            payment.dueDate
                          }
                        </td>

                        {/* ================= */}
                        {/* PAGAMENTO */}
                        {/* ================= */}

                        <td className="py-4 pr-4 text-sm text-slate-600">
                          {payment.paymentDate ??
                            "—"}
                        </td>

                        {/* ================= */}
                        {/* VALOR */}
                        {/* ================= */}

                        <td className="py-4 pr-4 text-sm font-semibold text-slate-800">
                          {
                            formatCurrency(
                              payment.amount
                            )
                          }
                        </td>

                        {/* ================= */}
                        {/* STATUS */}
                        {/* ================= */}

                        <td className="py-4 pr-4">
                          <PaymentStatusBadge
                            status={
                              payment.status
                            }
                          />
                        </td>

                        {/* ================= */}
                        {/* AÇÕES */}
                        {/* ================= */}

                        <td className="py-4">
                          <div className="flex justify-end gap-1">
                            {/* RECEBER */}

                            {canReceivePayment &&
                              payment.status !==
                                "Pago" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleReceivePayment(
                                      payment
                                    )
                                  }
                                >
                                  Receber
                                </Button>
                              )}

                            {/* COMPROVANTE */}

                            {payment.status ===
                              "Pago" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    payment
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                title="Baixar comprovante"
                              >
                                <Download
                                  size={
                                    17
                                  }
                                />
                              </button>
                            )}

                            {/* MAIS OPÇÕES
                                SOMENTE GESTOR */}

                            {canManageFinance && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoreOptions(
                                    payment
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Mais opções"
                              >
                                <MoreVertical
                                  size={
                                    17
                                  }
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ============================= */}
            {/* LISTA VAZIA */}
            {/* ============================= */}

            {filteredPayments.length ===
              0 && (
              <div className="py-12 text-center">
                <Receipt
                  size={
                    34
                  }
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 font-semibold text-slate-700">
                  Nenhuma cobrança encontrada
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Altere os filtros para visualizar outros registros.
                </p>
              </div>
            )}
          </PageCard>
        </div>

        {/* ================================= */}
        {/* COLUNA LATERAL */}
        {/* ================================= */}

        <div className="space-y-6">
          {/* =============================== */}
          {/* PLANO ATUAL */}
          {/* =============================== */}

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
                Psicologia + Fonoaudiologia + TO
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

              {/* =========================== */}
              {/* GERENCIAR PLANO */}
              {/* SOMENTE GESTOR */}
              {/* =========================== */}

              {canManageFinance && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full"
                >
                  Gerenciar plano
                </Button>
              )}
            </div>
          </PageCard>

          {/* =============================== */}
          {/* SITUAÇÃO FINANCEIRA */}
          {/* =============================== */}

          <PageCard
            title="Situação Financeira"
            description="Resumo atual da conta."
          >
            <div className="space-y-3">
              <FinanceRow
                label="Situação"
                value={
                  overdueTotal >
                  0
                    ? "Com pendência"
                    : "Regular"
                }
                valueClassName={
                  overdueTotal >
                  0
                    ? "text-red-600"
                    : "text-emerald-600"
                }
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

/* =========================================
   CARD FINANCEIRO
========================================= */

interface FinanceSummaryCardProps {
  title: string;

  value: string;

  description: string;

  icon:
    React.ReactNode;

  className:
    string;
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

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
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
   HEADER DA TABELA
========================================= */

interface HeaderProps {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}

function Header({
  children,

  align = "left",
}: HeaderProps) {
  return (
    <th
      className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
        align ===
        "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {
        children
      }
    </th>
  );
}

/* =========================================
   STATUS
========================================= */

interface PaymentStatusBadgeProps {
  status:
    PaymentStatus;
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
      {
        status
      }
    </span>
  );
}

/* =========================================
   LINHA FINANCEIRA
========================================= */

interface FinanceRowProps {
  label:
    string;

  value:
    string;

  valueClassName?:
    string;
}

function FinanceRow({
  label,

  value,

  valueClassName =
    "text-slate-800",
}: FinanceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">
        {
          label
        }
      </span>

      <span
        className={`text-right text-sm font-semibold ${valueClassName}`}
      >
        {
          value
        }
      </span>
    </div>
  );
}

/* =========================================
   FORMATAÇÃO DE MOEDA
========================================= */

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    }
  ).format(
    value
  );
}