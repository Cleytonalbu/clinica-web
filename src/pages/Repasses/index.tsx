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
  useUnit,
} from "@/providers/UnitContext";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  markProfessionalPayoutAsPaid,
  markProfessionalPayoutAsPending,
  syncProfessionalPayoutsFromAppointments,
  type ProfessionalPayout,
} from "@/pages/Financeiro/professionalPayoutStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

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

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PeriodMode = "Dia" | "Semana" | "Mês";

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPeriodBounds(mode: PeriodMode, referenceDate: string) {
  const reference = parseLocalDate(referenceDate || getTodayValue());
  const start = new Date(reference);
  const end = new Date(reference);

  if (mode === "Semana") {
    const day = reference.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(reference.getDate() + diffToMonday);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  } else if (mode === "Mês") {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1, 0);
  }

  return { start: toDateValue(start), end: toDateValue(end) };
}

function getPeriodLabel(mode: PeriodMode, referenceDate: string) {
  const bounds = getPeriodBounds(mode, referenceDate);
  if (mode === "Dia") return formatDate(bounds.start);
  if (mode === "Semana") return `${formatDate(bounds.start)} a ${formatDate(bounds.end)}`;
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(parseLocalDate(referenceDate));
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
  const {
    selectedUnitIds,
    isAllUnits,
  } =
    useUnit();

  const [
    payouts,
    setPayouts,
  ] =
    useState<ProfessionalPayout[]>(
      () =>
        syncProfessionalPayoutsFromAppointments()
    );

  const [
    periodMode,
    setPeriodMode,
  ] = useState<PeriodMode>("Dia");

  const [
    referenceDate,
    setReferenceDate,
  ] = useState(getTodayValue());

  const [
    professionalFilter,
    setProfessionalFilter,
  ] = useState("Todos");

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

  const scopedPayouts =
    useMemo(
      () =>
        payouts.filter(
          (
            payout
          ) =>
            selectedUnitIds.includes(
              payout.unitId
            )
        ),
      [
        payouts,
        selectedUnitIds,
      ]
    );

  const periodBounds =
    useMemo(
      () => getPeriodBounds(periodMode, referenceDate),
      [periodMode, referenceDate]
    );

  const professionalOptions =
    useMemo(
      () =>
        getActiveProfessionals()
          .filter(
            (professional) =>
              isAllUnits ||
              selectedUnitIds.some(
                (unitId) =>
                  professionalWorksAtUnit(
                    professional.id,
                    unitId
                  )
              )
          )
          .map(
            (professional) => ({
              id: professional.id,
              name: professional.name,
              specialty: professional.specialty,
            })
          )
          .sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        isAllUnits,
        selectedUnitIds,
      ]
    );

  const competencePayouts =
    useMemo(
      () =>
        scopedPayouts.filter((payout) => {
          const serviceDate = payout.serviceDate.slice(0, 10);
          const matchesPeriod =
            serviceDate >= periodBounds.start &&
            serviceDate <= periodBounds.end;
          const matchesProfessional =
            professionalFilter === "Todos" ||
            payout.professional === professionalFilter;

          return matchesPeriod && matchesProfessional;
        }),
      [
        scopedPayouts,
        periodBounds.start,
        periodBounds.end,
        professionalFilter,
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
      isAllUnits
    ) {
      window.alert(
        "Na visão consolidada os repasses são apenas para consulta. Selecione uma unidade para confirmar pagamentos."
      );

      return;
    }

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
      isAllUnits
    ) {
      window.alert(
        "Na visão consolidada os repasses são apenas para consulta. Selecione uma unidade para alterar o pagamento."
      );

      return;
    }

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
        {/* FILTROS NO TOPO */}
        {/* ===================================== */}

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Período dos repasses</p>
              <p className="mt-1 text-xs text-gray-500">{getPeriodLabel(periodMode, referenceDate)}</p>
            </div>

            <div className="inline-flex w-fit rounded-xl bg-gray-100 p-1">
              {(["Dia", "Semana", "Mês"] as PeriodMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPeriodMode(mode)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    periodMode === mode
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-violet-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[190px_240px_1fr_180px]">
            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500"
              />
              <input
                type="date"
                value={referenceDate}
                onChange={(event) => setReferenceDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <select
              value={professionalFilter}
              onChange={(event) => setProfessionalFilter(event.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="Todos">Todos os profissionais</option>
              {professionalOptions.map((professional) => (
                <option
                  key={professional.id}
                  value={professional.name}
                >
                  {professional.name}
                  {professional.specialty
                    ? ` — ${professional.specialty}`
                    : ""}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar profissional ou especialidade..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="Todos">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Parcial">Parcial</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
        </div>

        {/* ===================================== */}
        {/* RESUMO */}
        {/* ===================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title={periodMode === "Dia" ? "Total do dia" : periodMode === "Semana" ? "Total da semana" : "Total do mês"}
            value={formatCurrency(totals.total)}
            description={`${competencePayouts.length} atendimento${competencePayouts.length === 1 ? "" : "s"} realizado${competencePayouts.length === 1 ? "" : "s"}`}
            icon={CircleDollarSign}
            tone="violet"
          />

          <SummaryCard
            title="Repasses pagos"
            value={formatCurrency(totals.paid)}
            description="Pagamentos já confirmados"
            icon={CheckCircle2}
            tone="emerald"
          />

          <SummaryCard
            title="Repasses pendentes"
            value={formatCurrency(totals.pending)}
            description="Valor ainda a pagar"
            icon={Clock3}
            tone="amber"
          />

          <SummaryCard
            title="Profissionais"
            value={String(totals.professionals)}
            description="Com atendimentos no período"
            icon={Users}
            tone="blue"
          />
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
  tone = "violet",
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof CircleDollarSign;
  tone?: "violet" | "emerald" | "amber" | "blue";
}) {
  const tones = {
    violet: { card: "border-violet-100 bg-violet-50/40", icon: "bg-violet-100 text-violet-700" },
    emerald: { card: "border-emerald-100 bg-emerald-50/40", icon: "bg-emerald-100 text-emerald-700" },
    amber: { card: "border-amber-100 bg-amber-50/40", icon: "bg-amber-100 text-amber-700" },
    blue: { card: "border-blue-100 bg-blue-50/40", icon: "bg-blue-100 text-blue-700" },
  } as const;

  const selectedTone = tones[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${selectedTone.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selectedTone.icon}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
