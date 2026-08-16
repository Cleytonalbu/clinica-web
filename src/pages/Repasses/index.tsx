import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  HandCoins,
  Search,
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
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  markProfessionalPayoutAsPaid,
  markProfessionalPayoutAsPending,
  syncProfessionalPayoutsFromAppointments,
  type ProfessionalPayout,
} from "@/pages/Financeiro/professionalPayoutStorage";

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

  const competencePayouts =
    useMemo(
      () =>
        payouts.filter(
          (
            payout
          ) =>
            !competence ||
            getPayoutCompetence(
              payout
            ) ===
              competence
        ),
      [
        payouts,
        competence,
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

  function refreshPayouts() {
    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function handlePaySummary(
    summary: ProfessionalSummary
  ) {
    if (
      summary.pendingAppointments ===
      0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Confirmar o pagamento de ${formatCurrency(
          summary.pending
        )} para ${summary.professional}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    summary.payouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      )
      .forEach(
        (
          payout
        ) => {
          markProfessionalPayoutAsPaid(
            payout.id
          );
        }
      );

    refreshPayouts();
  }

  function handleTogglePayout(
    payout: ProfessionalPayout
  ) {
    if (
      payout.status ===
      "Pendente"
    ) {
      const confirmed =
        window.confirm(
          `Confirmar o pagamento deste repasse de ${formatCurrency(
            payout.amount
          )}?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      markProfessionalPayoutAsPaid(
        payout.id
      );
    } else {
      const confirmed =
        window.confirm(
          "Deseja realmente voltar este repasse para pendente?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      markProfessionalPayoutAsPending(
        payout.id
      );
    }

    refreshPayouts();
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
                                                    className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                                                      payout.status ===
                                                      "Pendente"
                                                        ? "bg-[#e54747] text-white hover:bg-[#d63f3f]"
                                                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                  >
                                                    {payout.status ===
                                                    "Pendente"
                                                      ? "Marcar pago"
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
    </DashboardLayout>
  );
}

/* =========================================
   CARD DE RESUMO
========================================= */

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