import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  MoreVertical,
  Receipt,
  Search,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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
  cancelFinancialCharge,
  getPatientFinancialHistory,
  type FinancialCharge,
} from "@/pages/Financeiro/financeStorage";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

/* =========================================
   STATUS DE EXIBIÇÃO
========================================= */

type DisplayPaymentStatus =
  | "Pago"
  | "Pendente"
  | "Atrasado"
  | "Cancelado";

/* =========================================
   COMPONENTE
========================================= */

export function PatientFinance() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const {
    user,
  } =
    useAuth();

  const patientId =
    Number(
      id
    );

  const patient =
    getPatientById(
      patientId
    );

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0
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

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
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

  const canManageFinance =
    isGestor;

  const canReceivePayment =
    isGestor ||
    isRecepcao;

  /* =======================================
     COBRANÇAS REAIS
  ======================================= */

  const payments =
    useMemo(
      () => {
        void refreshKey;

        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        return getPatientFinancialHistory(
          patientId
        );
      },
      [
        patientId,
        refreshKey,
      ]
    );

  /* =======================================
     FILTROS
  ======================================= */

  const filteredPayments =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return payments.filter(
          (
            payment
          ) => {
            const matchesSearch =
              !normalizedSearch ||
              payment.description
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              payment.professional
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              payment.specialty
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                );

            const displayStatus =
              getDisplayStatus(
                payment
              );

            const matchesStatus =
              status ===
                "Todos" ||
              displayStatus ===
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
          (
            item.receivedAmount ??
            item.amount
          ),
        0
      );

  const pendingTotal =
    payments
      .filter(
        (
          item
        ) =>
          getDisplayStatus(
            item
          ) ===
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
          getDisplayStatus(
            item
          ) ===
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
     PRÓXIMO VENCIMENTO
  ======================================= */

  const nextDueCharge =
    useMemo(
      () => {
        const today =
          startOfToday();

        return payments
          .filter(
            (
              payment
            ) =>
              payment.status ===
              "Pendente" &&
              Boolean(
                payment.dueDate
              )
          )
          .filter(
            (
              payment
            ) => {
              const due =
                parseDate(
                  payment.dueDate
                );

              return (
                due !==
                  null &&
                due.getTime() >=
                  today.getTime()
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              (
                parseDate(
                  a.dueDate
                )?.getTime() ??
                0
              ) -
              (
                parseDate(
                  b.dueDate
                )?.getTime() ??
                0
              )
          )[0];
      },
      [
        payments,
      ]
    );

  /* =======================================
     FORMA PRINCIPAL
  ======================================= */

  const primaryPaymentMethod =
    useMemo(
      () => {
        const counts =
          new Map<
            string,
            number
          >();

        payments
          .filter(
            (
              payment
            ) =>
              payment.status ===
              "Pago"
          )
          .forEach(
            (
              payment
            ) => {
              const method =
                payment.paymentMethod;

              counts.set(
                method,
                (
                  counts.get(
                    method
                  ) ??
                  0
                ) +
                  1
              );
            }
          );

        let winner =
          "-";

        let max =
          0;

        counts.forEach(
          (
            count,
            method
          ) => {
            if (
              count >
              max
            ) {
              max =
                count;

              winner =
                method;
            }
          }
        );

        return winner;
      },
      [
        payments,
      ]
    );

  /* =======================================
     RESPONSÁVEL FINANCEIRO
  ======================================= */

  const financialResponsible =
    patient?.responsavelNome ||
    "-";

  /* =======================================
     NOVA COBRANÇA
  ======================================= */

  function handleNewCharge() {
    if (
      !canManageFinance
    ) {
      return;
    }

    setFeedback(
      "As cobranças são geradas a partir dos agendamentos. Para criar uma nova cobrança, crie ou ajuste um agendamento do paciente."
    );
  }

  /* =======================================
     RECEBER
  ======================================= */

  function handleReceivePayment(
    payment:
      FinancialCharge
  ) {
    if (
      !canReceivePayment ||
      payment.status ===
        "Pago" ||
      payment.status ===
        "Cancelado"
    ) {
      return;
    }

    navigate(
      `/financeiro/receber/${payment.id}`
    );
  }

  /* =======================================
     COMPROVANTE
  ======================================= */

  function handleDownload(
    payment:
      FinancialCharge
  ) {
    setFeedback(
      `O pagamento de "${payment.description}" está registrado, mas o comprovante em arquivo dependerá da integração com a API.`
    );
  }

  /* =======================================
     MAIS OPÇÕES
  ======================================= */

  function handleMoreOptions(
    payment:
      FinancialCharge
  ) {
    if (
      !canManageFinance
    ) {
      return;
    }

    const action =
      window.prompt(
        [
          "Digite a opção desejada:",
          "",
          "1 - Ver histórico financeiro do paciente",
          "2 - Cancelar cobrança",
        ].join(
          "\n"
        )
      );

    if (
      action ===
      "1"
    ) {
      navigate(
        `/financeiro/paciente/${patientId}`
      );

      return;
    }

    if (
      action ===
      "2"
    ) {
      if (
        payment.status ===
        "Pago"
      ) {
        setFeedback(
          "Uma cobrança já paga não pode ser cancelada por esta tela."
        );

        return;
      }

      if (
        payment.status ===
        "Cancelado"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Deseja realmente cancelar a cobrança "${payment.description}"?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      cancelFinancialCharge(
        payment.id
      );

      setRefreshKey(
        (
          current
        ) =>
          current + 1
      );

      setFeedback(
        "Cobrança cancelada com sucesso."
      );
    }
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
            Cobranças e pagamentos vinculados ao paciente.
          </p>
        </div>

        {canManageFinance && (
          <Button
            type="button"
            variant="outline"
            onClick={
              handleNewCharge
            }
          >
            Ver origem das cobranças
          </Button>
        )}
      </div>

      {/* ================================= */}
      {/* FEEDBACK */}
      {/* ================================= */}

      {feedback && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
          {
            feedback
          }
        </div>
      )}

      {/* ================================= */}
      {/* RESUMO */}
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
              size={22}
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
          description="Aguardando vencimento"
          icon={
            <WalletCards
              size={22}
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
              size={22}
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
            <div className="mb-6 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
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

                <option value="Cancelado">
                  Cancelado
                </option>
              </Select>
            </div>

            {filteredPayments.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
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
                      ) => {
                        const displayStatus =
                          getDisplayStatus(
                            payment
                          );

                        return (
                          <tr
                            key={
                              payment.id
                            }
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <Receipt
                                    size={18}
                                  />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {
                                      payment.description
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {
                                      payment.specialty
                                    }{" "}
                                    •{" "}
                                    {
                                      payment.professional
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {
                                      payment.billingType
                                    }
                                    {" • "}
                                    {
                                      payment.paymentMethod
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 pr-4 text-sm text-slate-600">
                              {
                                formatDate(
                                  payment.dueDate
                                )
                              }
                            </td>

                            <td className="py-4 pr-4 text-sm text-slate-600">
                              {payment.paymentDate
                                ? formatDate(
                                    payment.paymentDate
                                  )
                                : "—"}
                            </td>

                            <td className="py-4 pr-4 text-sm font-semibold text-slate-800">
                              {
                                formatCurrency(
                                  payment.status ===
                                    "Pago"
                                    ? (
                                        payment.receivedAmount ??
                                        payment.amount
                                      )
                                    : payment.amount
                                )
                              }
                            </td>

                            <td className="py-4 pr-4">
                              <PaymentStatusBadge
                                status={
                                  displayStatus
                                }
                              />
                            </td>

                            <td className="py-4">
                              <div className="flex justify-end gap-1">
                                {canReceivePayment &&
                                  (
                                    displayStatus ===
                                      "Pendente" ||
                                    displayStatus ===
                                      "Atrasado"
                                  ) && (
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
                                    title="Comprovante"
                                  >
                                    <Download
                                      size={17}
                                    />
                                  </button>
                                )}

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
                                      size={17}
                                    />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Receipt
                  size={34}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 font-semibold text-slate-700">
                  Nenhuma cobrança encontrada
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Este paciente ainda não possui cobranças compatíveis com os filtros selecionados.
                </p>
              </div>
            )}
          </PageCard>
        </div>

        {/* ================================= */}
        {/* LATERAL */}
        {/* ================================= */}

        <div className="space-y-6">
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
                value={
                  nextDueCharge
                    ? formatDate(
                        nextDueCharge.dueDate
                      )
                    : "-"
                }
              />

              <FinanceRow
                label="Forma principal"
                value={
                  primaryPaymentMethod
                }
              />

              <FinanceRow
                label="Responsável financeiro"
                value={
                  financialResponsible
                }
              />

              <FinanceRow
                label="Cobranças"
                value={
                  String(
                    payments.filter(
                      (
                        payment
                      ) =>
                        payment.status !==
                        "Cancelado"
                    ).length
                  )
                }
              />
            </div>

            {(isGestor ||
              isRecepcao) && (
              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full"
                onClick={() =>
                  navigate(
                    `/financeiro/paciente/${patientId}`
                  )
                }
              >
                Ver histórico completo
              </Button>
            )}
          </PageCard>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STATUS VISUAL
========================================= */

function getDisplayStatus(
  payment:
    FinancialCharge
):
  DisplayPaymentStatus {
  if (
    payment.status ===
    "Pago"
  ) {
    return "Pago";
  }

  if (
    payment.status ===
    "Cancelado"
  ) {
    return "Cancelado";
  }

  const due =
    parseDate(
      payment.dueDate
    );

  if (
    due &&
    due.getTime() <
      startOfToday().getTime()
  ) {
    return "Atrasado";
  }

  return "Pendente";
}

/* =========================================
   CARD FINANCEIRO
========================================= */

interface FinanceSummaryCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

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
   CABEÇALHO
========================================= */

interface HeaderProps {
  children:
    React.ReactNode;

  align?:
    "left" |
    "right";
}

function Header({
  children,
  align =
    "left",
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
   BADGE
========================================= */

function PaymentStatusBadge({
  status,
}: {
  status:
    DisplayPaymentStatus;
}) {
  const styles:
    Record<
      DisplayPaymentStatus,
      string
    > = {
    Pago:
      "bg-emerald-100 text-emerald-700",

    Pendente:
      "bg-amber-100 text-amber-700",

    Atrasado:
      "bg-red-100 text-red-700",

    Cancelado:
      "bg-slate-100 text-slate-500",
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
   DATA
========================================= */

function parseDate(
  value:
    string
) {
  if (
    !value
  ) {
    return null;
  }

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
      ? new Date(
          `${value}T12:00:00`
        )
      : new Date(
          value
        );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  if (
    !date
  ) {
    return value ||
      "-";
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    date
  );
}

function startOfToday() {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return today;
}