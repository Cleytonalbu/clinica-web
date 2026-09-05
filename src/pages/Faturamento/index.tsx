import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Filter,
  ReceiptText,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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
  getFinancialCharges,
  type FinancialCharge,
} from "@/pages/Financeiro/financeStorage";

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

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}

type PeriodMode = "Dia" | "Mês" | "Ano";

function chargeMatchesPeriod(
  charge: FinancialCharge,
  periodMode: PeriodMode,
  selectedDate: string,
  selectedMonth: string,
  selectedYear: string
) {
  const chargeDate = charge.date.slice(0, 10);

  if (periodMode === "Dia") {
    return !selectedDate || chargeDate === selectedDate;
  }

  if (periodMode === "Ano") {
    return !selectedYear || chargeDate.slice(0, 4) === selectedYear;
  }

  return !selectedMonth || chargeDate.slice(0, 7) === selectedMonth;
}

function formatDate(
  value: string
) {
  if (
    !value
  ) {
    return "-";
  }

  const date =
    new Date(
      `${value.slice(0, 10)}T12:00:00`
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


function isOverdue(
  charge: FinancialCharge
) {
  if (
    charge.status !==
    "Pendente"
  ) {
    return false;
  }

  const dueDate =
    new Date(
      `${charge.dueDate.slice(0, 10)}T23:59:59`
    );

  const today =
    new Date();

  return (
    !Number.isNaN(
      dueDate.getTime()
    ) &&
    dueDate <
      today
  );
}

function getStatusLabel(
  charge: FinancialCharge
) {
  if (
    isOverdue(
      charge
    )
  ) {
    return "Vencido";
  }

  return charge.status;
}

function getStatusClass(
  charge: FinancialCharge
) {
  const status =
    getStatusLabel(
      charge
    );

  if (
    status ===
    "Pago"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (
    status ===
    "Vencido"
  ) {
    return "bg-red-50 text-red-700 border-red-100";
  }

  if (
    status ===
    "Cancelado"
  ) {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
}

/* =========================================
   COMPONENTE
========================================= */

export default function Faturamento() {
  const navigate =
    useNavigate();

  /*
   * MULTIUNIDADES:
   * O Administrativo pode visualizar uma unidade específica
   * ou consolidar todas as unidades às quais possui acesso.
   * Os filtros e o visual existentes permanecem inalterados.
   */
  const {
    selectedUnitIds,
  } =
    useUnit();

  const [
    charges,
  ] =
    useState<FinancialCharge[]>(
      () =>
        getFinancialCharges()
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    periodMode,
    setPeriodMode,
  ] = useState<PeriodMode>("Mês");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(getCurrentDate());

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(getCurrentCompetence());

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(getCurrentYear());

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

  const [
    professionalFilter,
    setProfessionalFilter,
  ] = useState("Todos");

  const [
    specialtyFilter,
    setSpecialtyFilter,
  ] = useState("Todas");

  const [
    convenioFilter,
    setConvenioFilter,
  ] = useState("Todos");

  /*
   * Primeiro isolamos os lançamentos da unidade.
   * Depois os filtros já existentes continuam funcionando
   * exatamente da mesma forma sobre esses lançamentos.
   */
  const unitCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            selectedUnitIds.includes(
              charge.unitId
            )
        ),
      [
        charges,
        selectedUnitIds,
      ]
    );

  const periodCharges =
    useMemo(
      () =>
        unitCharges.filter((charge) =>
          chargeMatchesPeriod(
            charge,
            periodMode,
            selectedDate,
            selectedMonth,
            selectedYear
          )
        ),
      [
        unitCharges,
        periodMode,
        selectedDate,
        selectedMonth,
        selectedYear,
      ]
    );

  const professionalOptions = useMemo(
    () =>
      Array.from(
        new Set(unitCharges.map((charge) => charge.professional).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [unitCharges]
  );

  const specialtyOptions = useMemo(
    () =>
      Array.from(
        new Set(unitCharges.map((charge) => charge.specialty).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [unitCharges]
  );

  const convenioOptions = useMemo(
    () =>
      Array.from(
        new Set(
          unitCharges
            .map((charge) => charge.convenio)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [unitCharges]
  );

  const filteredCharges =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return periodCharges.filter(
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
                ) ||
              charge.description
                .toLowerCase()
                .includes(
                  term
                ) ||
              charge.convenio
                ?.toLowerCase()
                .includes(
                  term
                );

            const currentStatus =
              getStatusLabel(
                charge
              );

            const matchesStatus =
              status ===
                "Todos" ||
              currentStatus ===
                status;

            const matchesBillingType =
              billingType ===
                "Todos" ||
              charge.billingType ===
                billingType;

            const matchesProfessional =
              professionalFilter === "Todos" ||
              charge.professional === professionalFilter;

            const matchesSpecialty =
              specialtyFilter === "Todas" ||
              charge.specialty === specialtyFilter;

            const matchesConvenio =
              convenioFilter === "Todos" ||
              charge.convenio === convenioFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesBillingType &&
              matchesProfessional &&
              matchesSpecialty &&
              matchesConvenio
            );
          }
        );
      },
      [
        periodCharges,
        search,
        status,
        billingType,
        professionalFilter,
        specialtyFilter,
        convenioFilter,
      ]
    );

  const summary =
    useMemo(
      () => {
        const activeCharges =
          periodCharges.filter(
            (
              charge
            ) =>
              charge.status !==
              "Cancelado"
          );

        const invoiced =
          activeCharges.reduce(
            (
              total,
              charge
            ) =>
              total +
              charge.amount,
            0
          );

        const received =
          activeCharges
            .filter(
              (
                charge
              ) =>
                charge.status ===
                "Pago"
            )
            .reduce(
              (
                total,
                charge
              ) =>
                total +
                (
                  charge.receivedAmount ??
                  charge.amount
                ),
              0
            );

        const pending =
          activeCharges
            .filter(
              (
                charge
              ) =>
                charge.status ===
                "Pendente"
            )
            .reduce(
              (
                total,
                charge
              ) =>
                total +
                charge.amount,
              0
            );

        const convenio =
          activeCharges
            .filter(
              (
                charge
              ) =>
                charge.billingType ===
                "Convênio"
            )
            .reduce(
              (
                total,
                charge
              ) =>
                total +
                charge.amount,
              0
            );

        return {
          invoiced,
          received,
          pending,
          convenio,
        };
      },
      [
        periodCharges,
      ]
    );

  function clearFilters() {
    setSearch("");
    setStatus("Todos");
    setBillingType("Todos");
    setProfessionalFilter("Todos");
    setSpecialtyFilter("Todas");
    setConvenioFilter("Todos");
  }

  function handleRefresh() {
    setCharges(
      getFinancialCharges()
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* CABEÇALHO */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#142a78]">
              Faturamento
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe os atendimentos faturados, recebimentos e pendências administrativas.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Atualizar dados
          </button>
        </div>

        {/* FILTROS */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-[#5b69d8]" />
                  <h2 className="font-bold text-[#142a78]">Filtros do faturamento</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Selecione o período e refine os lançamentos conforme necessário.</p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Limpar filtros
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["Dia", "Mês", "Ano"] as PeriodMode[]).map((mode) => {
                const selected = periodMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPeriodMode(mode)}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                      selected
                        ? "border-[#5b69d8]/40 bg-[#5b69d8]/10 text-[#142a78]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <CalendarDays
                      size={15}
                      className={
                        selected
                          ? "text-[#5b69d8]"
                          : "text-slate-400"
                      }
                    />
                    {mode}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Período selecionado</label>
                {periodMode === "Dia" ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                  />
                ) : periodMode === "Mês" ? (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                  />
                ) : (
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                  >
                    {Array.from({ length: 8 }, (_, index) => String(new Date().getFullYear() - 4 + index)).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                >
                  <option>Todos</option>
                  <option>Pendente</option>
                  <option>Vencido</option>
                  <option>Pago</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tipo de cobrança</label>
                <select
                  value={billingType}
                  onChange={(event) => setBillingType(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                >
                  <option>Todos</option>
                  <option>Particular</option>
                  <option>Convênio</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Profissional</label>
                <select
                  value={professionalFilter}
                  onChange={(event) => setProfessionalFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                >
                  <option value="Todos">Todos os profissionais</option>
                  {professionalOptions.map((professional) => (
                    <option key={professional} value={professional}>{professional}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Especialidade</label>
                <select
                  value={specialtyFilter}
                  onChange={(event) => setSpecialtyFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                >
                  <option value="Todas">Todas as especialidades</option>
                  {specialtyOptions.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Convênio</label>
                <select
                  value={convenioFilter}
                  onChange={(event) => setConvenioFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                >
                  <option value="Todos">Todos os convênios</option>
                  {convenioOptions.map((convenio) => (
                    <option key={convenio} value={convenio}>{convenio}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Busca</label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar paciente, profissional, especialidade, descrição ou convênio"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#5b69d8] focus:ring-2 focus:ring-[#5b69d8]/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESUMO */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Faturado no período
                </p>

                <p className="mt-2 text-2xl font-bold text-[#142a78]">
                  {formatCurrency(
                    summary.invoiced
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ReceiptText
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recebido
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {formatCurrency(
                    summary.received
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pendente
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {formatCurrency(
                    summary.pending
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Faturamento convênios
                </p>

                <p className="mt-2 text-2xl font-bold text-violet-700">
                  {formatCurrency(
                    summary.convenio
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Building2
                  size={22}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABELA */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#142a78]">
                Lançamentos faturados
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredCharges.length} lançamento(s) encontrado(s)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <WalletCards
                size={16}
              />

              Os valores são gerados a partir dos atendimentos da clínica.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">
                    Paciente
                  </th>

                  <th className="px-4 py-4">
                    Profissional
                  </th>

                  <th className="px-4 py-4">
                    Especialidade
                  </th>

                  <th className="px-4 py-4">
                    Atendimento
                  </th>

                  <th className="px-4 py-4">
                    Cobrança
                  </th>

                  <th className="px-4 py-4 text-right">
                    Valor
                  </th>

                  <th className="px-4 py-4">
                    Situação
                  </th>

                  <th className="px-5 py-4 text-right">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCharges.map(
                  (
                    charge
                  ) => (
                    <tr
                      key={
                        charge.id
                      }
                      className="text-sm text-slate-700 transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {charge.patient}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          #{charge.id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {charge.professional}
                      </td>

                      <td className="px-4 py-4">
                        {charge.specialty}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDate(
                          charge.date
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-700">
                          {charge.billingType}
                        </div>

                        {charge.convenio && (
                          <div className="mt-1 text-xs text-slate-400">
                            {charge.convenio}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-slate-800">
                        {formatCurrency(
                          charge.receivedAmount ??
                            charge.amount
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            charge
                          )}`}
                        >
                          {getStatusLabel(
                            charge
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {charge.status ===
                        "Pendente" ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/financeiro/receber/${charge.id}`
                              )
                            }
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#5b69d8] px-3 text-xs font-semibold text-white transition hover:bg-[#4f5dc6]"
                          >
                            Receber
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            {charge.status ===
                            "Pago"
                              ? "Concluído"
                              : "Sem ação"}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}

                {filteredCharges.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <CircleDollarSign
                          size={23}
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-700">
                        Nenhum faturamento encontrado
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Ajuste os filtros ou aguarde novos atendimentos gerarem lançamentos financeiros.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
