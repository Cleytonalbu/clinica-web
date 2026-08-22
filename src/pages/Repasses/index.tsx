import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Landmark,
  Search,
  X,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getClinicUnitById,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  markProfessionalPayoutAsPending,
  markProfessionalPayoutsAsPaid,
  syncProfessionalPayoutsFromAppointments,
  type ProfessionalPayout,
} from "@/pages/Financeiro/professionalPayoutStorage";


import {
  getBankAccounts,
} from "@/pages/ContasBancarias/bankAccountStorage";

import {
  saveFinancialExpense,
  payFinancialExpense,
  removeFinancialExpense,
  type FinancialExpense,
} from "@/pages/Financeiro/expenseStorage";

import {
  createManualBankTransaction,
  removeManualBankTransaction,
} from "@/pages/ImportarExtrato/bankTransactionStorage";

import {
  reconcileBankTransaction,
  removeBankReconciliation,
} from "@/pages/MovimentacoesBancarias/bankReconciliationStorage";

import {
  openPayoutReceiptPrint,
} from "./payoutReceiptPrint";

/* =========================================
   TIPOS
========================================= */

interface ProfessionalSummary {
  key: string;
  professional: string;
  specialty: string;
  appointments: number;
  pendingAppointments: number;
  paidAppointments: number;
  total: number;
  pending: number;
  paid: number;
  unitAmounts: number[];
  payouts: ProfessionalPayout[];
}


interface PayoutPaymentTarget {
  professional: string;
  specialty: string;
  payouts: ProfessionalPayout[];
  amount: number;
}

/* =========================================
   HELPERS
========================================= */

function getCurrentCompetence() {
  const now =
    new Date();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${now.getFullYear()}-${month}`;
}

function formatDate(
  value?: string
) {
  if (
    !value
  ) {
    return "-";
  }

  const normalized =
    value.includes(
      "T"
    )
      ? value
      : `${value.slice(0, 10)}T12:00:00`;

  const date =
    new Date(
      normalized
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    date
  );
}

function getPayoutCompetence(
  payout: ProfessionalPayout
) {
  return payout.serviceDate.slice(
    0,
    7
  );
}

function getStatusClass(
  status: ProfessionalPayout["status"]
) {
  if (
    status ===
    "Pago"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
}

function getSummaryStatus(
  summary: ProfessionalSummary
) {
  if (
    summary.pendingAppointments ===
    0 &&
    summary.appointments >
      0
  ) {
    return "Pago";
  }

  if (
    summary.paidAppointments >
      0 &&
    summary.pendingAppointments >
      0
  ) {
    return "Parcial";
  }

  return "Pendente";
}

function getSummaryStatusClass(
  status: string
) {
  if (
    status ===
    "Pago"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (
    status ===
    "Parcial"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
}

function getUnitAmountLabel(
  amounts: number[]
) {
  if (
    amounts.length >
      0 &&
    amounts.every(
      (
        amount
      ) =>
        amount <=
        0
    )
  ) {
    return "Não configurado";
  }

  const unique =
    Array.from(
      new Set(
        amounts.map(
          (
            amount
          ) =>
            Number(
              amount.toFixed(
                2
              )
            )
        )
      )
    );

  if (
    unique.length ===
    0
  ) {
    return "-";
  }

  if (
    unique.length ===
    1
  ) {
    return formatCurrency(
      unique[0]
    );
  }

  return "Variável";
}

/* =========================================
   COMPONENTE
========================================= */

export default function Repasses() {
  const {
    activeUnitId,
  } =
    useUnit();

  const activeUnit =
    useMemo(
      () =>
        getClinicUnitById(
          activeUnitId
        ),
      [
        activeUnitId,
      ]
    );

  const [
    payouts,
    setPayouts,
  ] =
    useState<ProfessionalPayout[]>(
      () =>
        syncProfessionalPayoutsFromAppointments()
    );

  const [
    competence,
    setCompetence,
  ] =
    useState(
      getCurrentCompetence()
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
    expandedKey,
    setExpandedKey,
  ] =
    useState<string | null>(
      null
    );


  const [
    paymentTarget,
    setPaymentTarget,
  ] =
    useState<
      PayoutPaymentTarget |
      null
    >(
      null
    );

  const [
    paymentDate,
    setPaymentDate,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState(
      "PIX"
    );

  const [
    paymentBankAccountId,
    setPaymentBankAccountId,
  ] =
    useState(
      ""
    );

  const [
    paymentObservation,
    setPaymentObservation,
  ] =
    useState(
      ""
    );

  const [
    savingPayment,
    setSavingPayment,
  ] =
    useState(
      false
    );


  const [
    generateReceipt,
    setGenerateReceipt,
  ] =
    useState(
      true
    );

  const bankAccounts =
    useMemo(
      () =>
        getBankAccounts().filter(
          (
            account
          ) =>
            account.status ===
            "Ativa"
        ),
      []
    );

  const selectedBankAccount =
    useMemo(
      () =>
        bankAccounts.find(
          (
            account
          ) =>
            account.id ===
            paymentBankAccountId
        ),
      [
        bankAccounts,
        paymentBankAccountId,
      ]
    );

  const competencePayouts =
    useMemo(
      () =>
        payouts.filter(
          (
            payout
          ) =>
            payout.unitId ===
              activeUnitId &&
            (
              !competence ||
              getPayoutCompetence(
                payout
              ) ===
                competence
            )
        ),
      [
        payouts,
        competence,
        activeUnitId,
      ]
    );

  const summaries =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            ProfessionalSummary
          >();

        competencePayouts.forEach(
          (
            payout
          ) => {
            const key =
              `${payout.professional}__${payout.specialty}`;

            const current =
              grouped.get(
                key
              ) ?? {
                key,
                professional:
                  payout.professional,
                specialty:
                  payout.specialty,
                appointments:
                  0,
                pendingAppointments:
                  0,
                paidAppointments:
                  0,
                total:
                  0,
                pending:
                  0,
                paid:
                  0,
                unitAmounts:
                  [],
                payouts:
                  [],
              };

            current.appointments +=
              1;

            current.total +=
              payout.amount;

            current.unitAmounts.push(
              payout.amount
            );

            current.payouts.push(
              payout
            );

            if (
              payout.status ===
              "Pago"
            ) {
              current.paidAppointments +=
                1;

              current.paid +=
                payout.amount;
            } else {
              current.pendingAppointments +=
                1;

              current.pending +=
                payout.amount;
            }

            grouped.set(
              key,
              current
            );
          }
        );

        const term =
          search
            .trim()
            .toLowerCase();

        return Array.from(
          grouped.values()
        )
          .filter(
            (
              summary
            ) => {
              const matchesSearch =
                !term ||
                summary.professional
                  .toLowerCase()
                  .includes(
                    term
                  ) ||
                summary.specialty
                  .toLowerCase()
                  .includes(
                    term
                  );

              const currentStatus =
                getSummaryStatus(
                  summary
                );

              const matchesStatus =
                status ===
                  "Todos" ||
                currentStatus ===
                  status;

              return (
                matchesSearch &&
                matchesStatus
              );
            }
          )
          .sort(
            (
              a,
              b
            ) => {
              if (
                a.pendingAppointments >
                  0 &&
                b.pendingAppointments ===
                  0
              ) {
                return -1;
              }

              if (
                a.pendingAppointments ===
                  0 &&
                b.pendingAppointments >
                  0
              ) {
                return 1;
              }

              return a.professional.localeCompare(
                b.professional,
                "pt-BR"
              );
            }
          );
      },
      [
        competencePayouts,
        search,
        status,
      ]
    );

  const totals =
    useMemo(
      () => {
        const total =
          competencePayouts.reduce(
            (
              sum,
              payout
            ) =>
              sum +
              payout.amount,
            0
          );

        const paid =
          competencePayouts
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

        const pending =
          competencePayouts
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

        const professionals =
          new Set(
            competencePayouts.map(
              (
                payout
              ) =>
                payout.professional
            )
          ).size;

        return {
          total,
          paid,
          pending,
          professionals,
        };
      },
      [
        competencePayouts,
      ]
    );

  const zeroValuePayouts =
    competencePayouts.filter(
      (
        payout
      ) =>
        payout.status ===
          "Pendente" &&
        payout.amount <=
          0
    );

  const hasMissingRepasseConfiguration =
    zeroValuePayouts.length >
    0;

  function refreshPayouts() {
    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function openPayment(
    target:
      PayoutPaymentTarget
  ) {
    const pending =
      target.payouts.filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      );

    const amount =
      pending.reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

    if (
      pending.length ===
      0
    ) {
      return;
    }

    if (
      amount <=
      0
    ) {
      window.alert(
        "O repasse está em R$ 0,00. Configure primeiro o valor de repasse do profissional ou da especialidade."
      );
      return;
    }

    setPaymentTarget({
      ...target,
      payouts:
        pending,
      amount,
    });

    setPaymentDate(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

    setPaymentMethod(
      "PIX"
    );

    setPaymentBankAccountId(
      ""
    );

    setPaymentObservation(
      ""
    );

    setGenerateReceipt(
      true
    );
  }

  function handlePaySummary(
    summary:
      ProfessionalSummary
  ) {
    openPayment({
      professional:
        summary.professional,
      specialty:
        summary.specialty,
      payouts:
        summary.payouts,
      amount:
        summary.pending,
    });
  }

  function handleTogglePayout(
    payout:
      ProfessionalPayout
  ) {
    if (
      payout.status ===
      "Pendente"
    ) {
      openPayment({
        professional:
          payout.professional,
        specialty:
          payout.specialty,
        payouts: [
          payout,
        ],
        amount:
          payout.amount,
      });
      return;
    }

    if (
      payout.financialExpenseId ||
      payout.bankTransactionId
    ) {
      window.alert(
        "Este repasse já possui despesa e movimentação bancária vinculadas. Para preservar o histórico financeiro, ele não pode voltar para pendente nesta tela."
      );
      return;
    }

    if (
      !window.confirm(
        "Este é um pagamento antigo sem movimentação bancária vinculada. Deseja voltar este repasse para pendente?"
      )
    ) {
      return;
    }

    try {
      markProfessionalPayoutAsPending(
        payout.id
      );
      refreshPayouts();
    } catch (
      error
    ) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o repasse."
      );
    }
  }

  function closePaymentModal() {
    if (
      savingPayment
    ) {
      return;
    }

    setPaymentTarget(
      null
    );
    setPaymentBankAccountId(
      ""
    );
    setPaymentObservation(
      ""
    );
  }

  function confirmPayment() {
    if (
      !paymentTarget
    ) {
      return;
    }

    if (
      !paymentDate
    ) {
      window.alert(
        "Informe a data do pagamento."
      );

      return;
    }

    if (
      !selectedBankAccount
    ) {
      window.alert(
        "Selecione a conta bancária utilizada para pagar o profissional."
      );

      return;
    }

    const pendingPayouts =
      paymentTarget.payouts.filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      );

    const amount =
      pendingPayouts.reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

    if (
      pendingPayouts.length ===
        0 ||
      amount <=
        0
    ) {
      window.alert(
        "Não existem repasses pendentes válidos para este pagamento."
      );

      return;
    }

    setSavingPayment(
      true
    );

    /*
     * Referência única deste pagamento.
     *
     * Ela diferencia corretamente dois repasses
     * do mesmo profissional, mesmo valor, conta
     * e data, sem desativar a proteção geral
     * contra duplicidade bancária.
     */
    const paymentReference =
      typeof crypto !==
        "undefined" &&
      "randomUUID" in
        crypto
        ? crypto
            .randomUUID()
            .slice(
              0,
              8
            )
            .toUpperCase()
        : `${Date.now()}`;

    const expenseId =
      Date.now();

    let expenseCreated =
      false;

    let bankTransactionId:
      string |
      null =
      null;

    let reconciliationCreated =
      false;

    try {
      const competenceDate =
        pendingPayouts[
          0
        ]?.serviceDate.slice(
          0,
          7
        ) ??
        paymentDate.slice(
          0,
          7
        );

      const description =
        `Repasse profissional - ${paymentTarget.professional} - ${paymentTarget.specialty}`;

      const bankAccountName =
        `${selectedBankAccount.accountName} — ${selectedBankAccount.bankName}`;

      const expense:
        FinancialExpense = {
        id:
          expenseId,

        unitId:
          activeUnitId,

        description,

        category:
          "Serviços",

        supplier:
          paymentTarget.professional,

        competenceDate,

        dueDate:
          paymentDate,

        amount,

        originalAmount:
          amount,

        discount:
          0,

        surcharge:
          0,

        status:
          "Pendente",

        observation:
          `Repasse de ${pendingPayouts.length} atendimento(s) realizado(s). Referência ${paymentReference}.`,

        createdAt:
          new Date()
            .toISOString(),
      };

      /*
       * 1. Registra a despesa.
       */
      saveFinancialExpense(
        expense
      );

      expenseCreated =
        true;

      payFinancialExpense(
        expenseId,
        {
          paymentDate,

          paymentMethod,

          paidAmount:
            amount,

          discount:
            0,

          surcharge:
            0,

          observation:
            paymentObservation.trim() ||
            `Pagamento do repasse de ${pendingPayouts.length} atendimento(s) para ${paymentTarget.professional}. Ref. ${paymentReference}.`,

          bankAccountId:
            selectedBankAccount.id,

          bankAccountName,
        }
      );

      /*
       * 2. Registra a saída bancária.
       *
       * A referência única faz parte da descrição
       * e, consequentemente, do fingerprint.
       */
      const bankTransaction =
        createManualBankTransaction({
          accountId:
            selectedBankAccount.id,

          date:
            paymentDate,

          description:
            `REPASSE PROFISSIONAL | ${paymentTarget.professional.toUpperCase()} | ${competenceDate} | REF ${paymentReference}`,

          amount:
            -Math.abs(
              amount
            ),
        });

      bankTransactionId =
        bankTransaction.id;

      /*
       * 3. Concilia banco + despesa.
       */
      reconcileBankTransaction({
        transactionId:
          bankTransaction.id,

        type:
          "Despesa",

        category:
          "Repasse profissional",

        notes:
          paymentObservation.trim() ||
          `Pagamento de ${pendingPayouts.length} atendimento(s) de ${paymentTarget.professional}. Ref. ${paymentReference}.`,

        reconciledAt:
          new Date()
            .toISOString(),

        linkedType:
          "expense",

        linkedId:
          expenseId,

        linkedLabel:
          description,
      });

      reconciliationCreated =
        true;

      /*
       * 4. Somente após todo o Financeiro estar
       * concluído, marca os repasses como pagos.
       */
      markProfessionalPayoutsAsPaid(
        pendingPayouts.map(
          (
            payout
          ) =>
            payout.id
        ),
        {
          paymentDate,

          paymentMethod,

          bankAccountId:
            selectedBankAccount.id,

          bankAccountName,

          financialExpenseId:
            expenseId,

          bankTransactionId:
            bankTransaction.id,
        }
      );

      /*
       * 5. Comprovante só abre quando todas
       * as etapas anteriores concluíram.
       */
      if (
        generateReceipt
      ) {
        openPayoutReceiptPrint({
          receiptNumber:
            paymentReference,

          clinicName:
            "Clínica Integrada Entre Afetos",

          unitName:
            activeUnit?.name,

          professional:
            paymentTarget.professional,

          specialty:
            paymentTarget.specialty,

          competence:
            competenceDate,

          appointments:
            pendingPayouts.map(
              (
                payout
              ) => ({
                patient:
                  payout.patient,

                serviceDate:
                  payout.serviceDate,

                amount:
                  payout.amount,
              })
            ),

          totalAmount:
            amount,

          paymentDate,

          paymentMethod,

          bankAccountName,

          observation:
            paymentObservation.trim() ||
            undefined,
        });
      }

      refreshPayouts();

      setPaymentTarget(
        null
      );

      setPaymentBankAccountId(
        ""
      );

      setPaymentObservation(
        ""
      );

      window.alert(
        `Repasse pago com sucesso. Referência: ${paymentReference}.`
      );
    } catch (
      error
    ) {
      /*
       * ROLLBACK
       *
       * Se qualquer etapa falhar antes da conclusão,
       * remove tudo o que foi criado nesta tentativa.
       */
      try {
        if (
          reconciliationCreated &&
          bankTransactionId
        ) {
          /*
           * A função de conciliação protege vínculos
           * financeiros normais. Neste rollback ela
           * pode recusar a remoção se já estiver
           * vinculada; nesse caso seguimos e não
           * mascaramos o erro original.
           */
          try {
            removeBankReconciliation(
              bankTransactionId
            );
          } catch {
            // rollback best-effort
          }
        }

        if (
          bankTransactionId
        ) {
          try {
            removeManualBankTransaction(
              bankTransactionId
            );
          } catch {
            // rollback best-effort
          }
        }

        if (
          expenseCreated
        ) {
          try {
            removeFinancialExpense(
              expenseId
            );
          } catch {
            // rollback best-effort
          }
        }
      } finally {
        window.alert(
          error instanceof
          Error
            ? error.message
            : "Não foi possível registrar o pagamento do repasse."
        );
      }
    } finally {
      setSavingPayment(
        false
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===================================== */}
        {/* CABEÇALHO */}
        {/* ===================================== */}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Repasses aos profissionais
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Acompanhe os atendimentos realizados, valores de repasse e pagamentos dos profissionais.
          </p>
        </div>

        {hasMissingRepasseConfiguration && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <CircleDollarSign
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-sm font-bold text-amber-800">
                  Existem atendimentos com repasse em R$ 0,00
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  O atendimento foi sincronizado normalmente, mas não foi encontrado um valor de repasse configurado para o profissional ou para a especialidade nesta unidade. Defina o valor em Configurações → Profissionais ou Configurações → Especialidades. Assim que salvar, esta tela recalcula os repasses pendentes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* RESUMO */}
        {/* ===================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total da competência"
            value={formatCurrency(
              totals.total
            )}
            description={`${competencePayouts.length} atendimento${
              competencePayouts.length ===
              1
                ? ""
                : "s"
            } realizado${
              competencePayouts.length ===
              1
                ? ""
                : "s"
            }`}
            icon={CircleDollarSign}
          />

          <SummaryCard
            title="Repasses pagos"
            value={formatCurrency(
              totals.paid
            )}
            description="Pagamentos já confirmados"
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Repasses pendentes"
            value={formatCurrency(
              totals.pending
            )}
            description="Valor ainda a pagar"
            icon={Clock3}
          />

          <SummaryCard
            title="Profissionais"
            value={String(
              totals.professionals
            )}
            description="Com atendimentos na competência"
            icon={Users}
          />
        </div>

        {/* ===================================== */}
        {/* FILTROS */}
        {/* ===================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_190px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar profissional ou especialidade..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#e54747] focus:ring-2 focus:ring-[#e54747]/10"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="month"
                value={competence}
                onChange={(
                  event
                ) =>
                  setCompetence(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#e54747] focus:ring-2 focus:ring-[#e54747]/10"
              />
            </div>

            <select
              value={status}
              onChange={(
                event
              ) =>
                setStatus(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#e54747] focus:ring-2 focus:ring-[#e54747]/10"
            >
              <option value="Todos">
                Todos os status
              </option>
              <option value="Pendente">
                Pendente
              </option>
              <option value="Parcial">
                Parcial
              </option>
              <option value="Pago">
                Pago
              </option>
            </select>
          </div>
        </div>

        {/* ===================================== */}
        {/* TABELA PRINCIPAL */}
        {/* ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#e54747]">
                <HandCoins
                  size={20}
                />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Fechamento por profissional
                </h2>

                <p className="text-sm text-gray-500">
                  Clique em uma linha para visualizar os atendimentos que compõem o repasse.
                </p>
              </div>
            </div>
          </div>

          {summaries.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <HandCoins
                size={34}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-700">
                Nenhum repasse encontrado
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Os repasses são gerados automaticamente a partir dos atendimentos marcados como realizados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">
                      Profissional
                    </th>
                    <th className="px-5 py-3">
                      Especialidade
                    </th>
                    <th className="px-5 py-3 text-center">
                      Atendimentos
                    </th>
                    <th className="px-5 py-3">
                      Valor / atendimento
                    </th>
                    <th className="px-5 py-3">
                      Total
                    </th>
                    <th className="px-5 py-3">
                      Pago
                    </th>
                    <th className="px-5 py-3">
                      Pendente
                    </th>
                    <th className="px-5 py-3">
                      Situação
                    </th>
                    <th className="px-5 py-3 text-right">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {summaries.map(
                    (
                      summary
                    ) => {
                      const currentStatus =
                        getSummaryStatus(
                          summary
                        );

                      const isExpanded =
                        expandedKey ===
                        summary.key;

                      return (
                        <>
                          <tr
                            key={summary.key}
                            className="transition hover:bg-gray-50/70"
                          >
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedKey(
                                    isExpanded
                                      ? null
                                      : summary.key
                                  )
                                }
                                className="flex items-center gap-2 text-left"
                              >
                                {isExpanded ? (
                                  <ChevronUp
                                    size={17}
                                    className="text-gray-400"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={17}
                                    className="text-gray-400"
                                  />
                                )}

                                <span className="font-medium text-gray-900">
                                  {summary.professional}
                                </span>
                              </button>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {summary.specialty}
                            </td>

                            <td className="px-5 py-4 text-center text-sm font-medium text-gray-700">
                              {summary.appointments}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {getUnitAmountLabel(
                                summary.unitAmounts
                              )}
                            </td>

                            <td className="px-5 py-4 font-semibold text-gray-900">
                              {formatCurrency(
                                summary.total
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                              {formatCurrency(
                                summary.paid
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-amber-700">
                              {formatCurrency(
                                summary.pending
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSummaryStatusClass(
                                  currentStatus
                                )}`}
                              >
                                {currentStatus}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              {summary.pendingAppointments >
                              0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePaySummary(
                                      summary
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#e54747] px-3 text-sm font-medium text-white transition hover:bg-[#d63f3f]"
                                >
                                  <Banknote
                                    size={16}
                                  />
                                  Pagar
                                </button>
                              ) : (
                                <span className="text-sm font-medium text-emerald-600">
                                  Quitado
                                </span>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr
                              key={`${summary.key}-details`}
                            >
                              <td
                                colSpan={9}
                                className="bg-gray-50/70 px-5 py-5"
                              >
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                  <div className="border-b border-gray-100 px-4 py-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                      Atendimentos do repasse
                                    </p>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                      <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                          <th className="px-4 py-3">
                                            Data
                                          </th>
                                          <th className="px-4 py-3">
                                            Paciente
                                          </th>
                                          <th className="px-4 py-3">
                                            Repasse
                                          </th>
                                          <th className="px-4 py-3">
                                            Situação
                                          </th>
                                          <th className="px-4 py-3">
                                            Data pagamento
                                          </th>
                                          <th className="px-4 py-3 text-right">
                                            Ação
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-100">
                                        {summary.payouts
                                          .slice()
                                          .sort(
                                            (
                                              a,
                                              b
                                            ) =>
                                              b.serviceDate.localeCompare(
                                                a.serviceDate
                                              )
                                          )
                                          .map(
                                            (
                                              payout
                                            ) => (
                                              <tr
                                                key={payout.id}
                                              >
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                  {formatDate(
                                                    payout.serviceDate
                                                  )}
                                                </td>

                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                  {payout.patient}
                                                </td>

                                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                                  {formatCurrency(
                                                    payout.amount
                                                  )}
                                                </td>

                                                <td className="px-4 py-3">
                                                  <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                                      payout.status
                                                    )}`}
                                                  >
                                                    {payout.status}
                                                  </span>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                  {formatDate(
                                                    payout.paymentDate ??
                                                    payout.paidAt
                                                  )}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleTogglePayout(
                                                        payout
                                                      )
                                                    }
                                                    disabled={
                                                      payout.status ===
                                                        "Pago" &&
                                                      Boolean(
                                                        payout.financialExpenseId ||
                                                        payout.bankTransactionId
                                                      )
                                                    }
                                                    className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                                                      payout.status ===
                                                      "Pendente"
                                                        ? "bg-[#e54747] text-white hover:bg-[#d63f3f]"
                                                        : payout.financialExpenseId ||
                                                            payout.bankTransactionId
                                                          ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                  >
                                                    {payout.status ===
                                                    "Pendente"
                                                      ? "Pagar"
                                                      : payout.financialExpenseId ||
                                                          payout.bankTransactionId
                                                        ? "Pago"
                                                        : "Voltar pendente"}
                                                  </button>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Banknote
                    size={20}
                    className="text-[#e54747]"
                  />

                  <h2 className="text-lg font-bold text-gray-900">
                    Pagar repasse profissional
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {paymentTarget.professional} • {paymentTarget.specialty}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closePaymentModal
                }
                disabled={
                  savingPayment
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <PaymentInfo
                  label="Atendimentos"
                  value={
                    String(
                      paymentTarget.payouts.length
                    )
                  }
                />

                <PaymentInfo
                  label="Valor do repasse"
                  value={
                    formatCurrency(
                      paymentTarget.amount
                    )
                  }
                  strong
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs font-bold text-gray-600">
                    Data do pagamento *
                  </span>

                  <input
                    type="date"
                    value={
                      paymentDate
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#e54747]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-gray-600">
                    Forma de pagamento *
                  </span>

                  <select
                    value={
                      paymentMethod
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#e54747]"
                  >
                    <option value="PIX">
                      PIX
                    </option>
                    <option value="Transferência">
                      Transferência
                    </option>
                    <option value="Dinheiro">
                      Dinheiro
                    </option>
                    <option value="Outro">
                      Outro
                    </option>
                  </select>
                </label>
              </div>

              <label>
                <span className="mb-1.5 block text-xs font-bold text-gray-600">
                  Conta bancária utilizada *
                </span>

                <select
                  value={
                    paymentBankAccountId
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentBankAccountId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#e54747]"
                >
                  <option value="">
                    Selecione a conta...
                  </option>

                  {bankAccounts.map(
                    (
                      account
                    ) => (
                      <option
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                      >
                        {account.accountName} — {account.bankName}
                      </option>
                    )
                  )}
                </select>

                {bankAccounts.length ===
                  0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    Não existe conta bancária ativa cadastrada.
                  </p>
                )}
              </label>

              {selectedBankAccount && (
                <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <Landmark
                    size={18}
                    className="text-[#e54747]"
                  />

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {
                        selectedBankAccount.accountName
                      }
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      {
                        selectedBankAccount.bankName
                      }{" "}
                      • Saldo atual{" "}
                      {formatCurrency(
                        selectedBankAccount.currentBalance
                      )}
                    </p>
                  </div>
                </div>
              )}

              <label>
                <span className="mb-1.5 block text-xs font-bold text-gray-600">
                  Observação
                </span>

                <textarea
                  rows={3}
                  value={
                    paymentObservation
                  }
                  onChange={(
                    event
                  ) =>
                    setPaymentObservation(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: repasse referente à competência atual."
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#e54747]"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    generateReceipt
                  }
                  onChange={(
                    event
                  ) =>
                    setGenerateReceipt(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-[#e54747]"
                />

                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Gerar comprovante após pagamento
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Abre automaticamente o comprovante térmico de 80 mm para impressão ou PDF.
                  </p>
                </div>
              </label>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
                Ao confirmar, o sistema registrará uma despesa paga de repasse profissional, lançará a saída na conta bancária e fará a conciliação automaticamente.
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={
                  closePaymentModal
                }
                disabled={
                  savingPayment
                }
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmPayment
                }
                disabled={
                  savingPayment ||
                  !paymentBankAccountId
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#e54747] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d63f3f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Banknote
                  size={16}
                />

                {savingPayment
                  ? "Registrando..."
                  : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* =========================================
   CARD DE RESUMO
========================================= */

function PaymentInfo({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-base font-extrabold text-[#e54747]"
            : "text-sm font-bold text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#e54747]">
          <Icon
            size={21}
          />
        </div>
      </div>
    </div>
  );
}