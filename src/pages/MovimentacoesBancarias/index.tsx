import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle2,
  Landmark,
  Link2,
  Search,
  Tags,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  getBankAccounts,
} from "@/pages/ContasBancarias/bankAccountStorage";

import type {
  BankAccount,
} from "@/pages/ContasBancarias/bankAccountStorage";

import {
  getBankTransactions,
} from "@/pages/ImportarExtrato/bankTransactionStorage";

import type {
  BankTransaction,
} from "@/pages/ImportarExtrato/bankTransactionStorage";

import {
  getFinancialCharges,
  receiveFinancialCharge,
} from "@/pages/Financeiro/financeStorage";

import type {
  FinancialCharge,
} from "@/pages/Financeiro/financeStorage";

import {
  getFinancialExpenses,
  payFinancialExpense,
} from "@/pages/Financeiro/expenseStorage";

import type {
  FinancialExpense,
} from "@/pages/Financeiro/expenseStorage";

import {
  getBankReconciliations,
  reconcileBankTransaction,
  removeBankReconciliation,
} from "./bankReconciliationStorage";

import type {
  BankReconciliation,
  ReconciliationLinkType,
  ReconciliationType,
} from "./bankReconciliationStorage";

function money(
  value: number,
) {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

function date(
  value: string,
) {
  return value
    ? new Date(
        `${value}T12:00:00`,
      ).toLocaleDateString(
        "pt-BR",
      )
    : "—";
}

type PeriodMode =
  | "Dia"
  | "Mês"
  | "Ano";

function currentDateValue() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function currentMonthValue() {
  return new Date()
    .toISOString()
    .slice(0, 7);
}

function currentYearValue() {
  return String(
    new Date().getFullYear(),
  );
}

function matchesPeriod(
  transactionDate: string,
  mode: PeriodMode,
  selectedDate: string,
  selectedMonth: string,
  selectedYear: string,
) {
  const value =
    transactionDate.slice(
      0,
      10,
    );

  if (
    mode === "Dia"
  ) {
    return (
      !selectedDate ||
      value ===
        selectedDate
    );
  }

  if (
    mode === "Ano"
  ) {
    return (
      !selectedYear ||
      value.slice(
        0,
        4,
      ) ===
        selectedYear
    );
  }

  return (
    !selectedMonth ||
    value.slice(
      0,
      7,
    ) ===
      selectedMonth
  );
}

function sameAmount(
  left: number,
  right: number,
) {
  return (
    Math.abs(
      Math.abs(left) -
        Math.abs(right),
    ) <= 0.01
  );
}

const revenueCategories = [
  "Atendimento particular",
  "Convênio",
  "Reembolso",
  "Outras receitas",
];

const expenseCategories = [
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Material",
  "Fornecedor",
  "Folha / Pagamento",
  "Impostos",
  "Outras despesas",
];

interface FinancialMatch {
  key: string;
  linkType:
    ReconciliationLinkType;
  id: number;
  label: string;
  description: string;
  amount: number;
  date: string;
}

export default function MovimentacoesBancarias() {
  const navigate =
    useNavigate();

  const {
    accountId,
  } =
    useParams();

  const [
    account,
    setAccount,
  ] =
    useState<
      BankAccount | null
    >(null);

  const [
    items,
    setItems,
  ] =
    useState<
      BankTransaction[]
    >([]);

  const [
    reconciliations,
    setReconciliations,
  ] =
    useState<
      BankReconciliation[]
    >([]);

  const [
    charges,
    setCharges,
  ] =
    useState<
      FinancialCharge[]
    >([]);

  const [
    expenses,
    setExpenses,
  ] =
    useState<
      FinancialExpense[]
    >([]);

  const [
    periodMode,
    setPeriodMode,
  ] =
    useState<
      PeriodMode
    >("Mês");

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      currentDateValue()
    );

  const [
    selectedMonth,
    setSelectedMonth,
  ] =
    useState(
      currentMonthValue()
    );

  const [
    selectedYear,
    setSelectedYear,
  ] =
    useState(
      currentYearValue()
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    type,
    setType,
  ] =
    useState<
      | "Todos"
      | "Entradas"
      | "Saídas"
    >("Todos");

  const [
    status,
    setStatus,
  ] =
    useState<
      | "Todos"
      | "Conciliados"
      | "Não conciliados"
    >("Todos");

  const [
    selected,
    setSelected,
  ] =
    useState<
      BankTransaction | null
    >(null);

  const [
    reconciliationType,
    setReconciliationType,
  ] =
    useState<
      ReconciliationType
    >("Receita");

  const [
    category,
    setCategory,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    selectedFinancialLink,
    setSelectedFinancialLink,
  ] =
    useState("");

  function load() {
    setAccount(
      getBankAccounts().find(
        (item) =>
          item.id ===
          accountId,
      ) ?? null,
    );

    setItems(
      getBankTransactions()
        .filter(
          (item) =>
            item.accountId ===
            accountId,
        )
        .sort(
          (left, right) =>
            right.date.localeCompare(
              left.date,
            ),
        ),
    );

    setReconciliations(
      getBankReconciliations(),
    );

    setCharges(
      getFinancialCharges(),
    );

    setExpenses(
      getFinancialExpenses(),
    );
  }

  useEffect(() => {
    load();

    const refresh =
      () => load();

    window.addEventListener(
      "bank-transactions-changed",
      refresh,
    );

    window.addEventListener(
      "bank-accounts-changed",
      refresh,
    );

    window.addEventListener(
      "bank-reconciliations-changed",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "bank-transactions-changed",
        refresh,
      );

      window.removeEventListener(
        "bank-accounts-changed",
        refresh,
      );

      window.removeEventListener(
        "bank-reconciliations-changed",
        refresh,
      );
    };
  }, [
    accountId,
  ]);

  const reconciliationMap =
    useMemo(
      () =>
        new Map(
          reconciliations.map(
            (item) => [
              item.transactionId,
              item,
            ],
          ),
        ),
      [
        reconciliations,
      ],
    );

  const filtered =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          const reconciliation =
            reconciliationMap.get(
              item.id,
            );

          const matchesSearch =
            !term ||
            item.description
              .toLowerCase()
              .includes(
                term,
              ) ||
            reconciliation
              ?.category
              .toLowerCase()
              .includes(
                term,
              ) ||
            reconciliation
              ?.linkedLabel
              ?.toLowerCase()
              .includes(
                term,
              );

          const matchesType =
            type ===
              "Todos" ||
            (
              type ===
                "Entradas" &&
              item.amount >
                0
            ) ||
            (
              type ===
                "Saídas" &&
              item.amount <
                0
            );

          const matchesStatus =
            status ===
              "Todos" ||
            (
              status ===
                "Conciliados" &&
              !!reconciliation
            ) ||
            (
              status ===
                "Não conciliados" &&
              !reconciliation
            );

          const matchesDate =
            matchesPeriod(
              item.date,
              periodMode,
              selectedDate,
              selectedMonth,
              selectedYear,
            );

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesDate
          );
        },
      );
    }, [
      items,
      search,
      type,
      status,
      periodMode,
      selectedDate,
      selectedMonth,
      selectedYear,
      reconciliationMap,
    ]);

  const summary =
    useMemo(() => {
      const entries =
        filtered
          .filter(
            (item) =>
              item.amount >
              0,
          )
          .reduce(
            (
              total,
              item,
            ) =>
              total +
              item.amount,
            0,
          );

      const exits =
        filtered
          .filter(
            (item) =>
              item.amount <
              0,
          )
          .reduce(
            (
              total,
              item,
            ) =>
              total +
              Math.abs(
                item.amount,
              ),
            0,
          );

      const reconciled =
        filtered.filter(
          (item) =>
            reconciliationMap.has(
              item.id,
            ),
        ).length;

      return {
        entries,
        exits,
        reconciled,
        pending:
          filtered.length -
          reconciled,
      };
    }, [
      filtered,
      reconciliationMap,
    ]);

  const financialMatches =
    useMemo<
      FinancialMatch[]
    >(() => {
      if (!selected) {
        return [];
      }

      if (
        reconciliationType ===
          "Receita" &&
        selected.amount >
          0
      ) {
        return charges
          .filter(
            (charge) =>
              charge.status ===
                "Pendente" &&
              sameAmount(
                charge.amount,
                selected.amount,
              ),
          )
          .map(
            (
              charge,
            ) => ({
              key:
                `charge-${charge.id}`,
              linkType:
                "charge",
              id:
                charge.id,
              label:
                `${charge.patient} — ${charge.description}`,
              description:
                `${charge.professional} • ${charge.specialty}`,
              amount:
                charge.amount,
              date:
                charge.dueDate ||
                charge.date,
            }),
          );
      }

      if (
        reconciliationType ===
          "Despesa" &&
        selected.amount <
          0
      ) {
        return expenses
          .filter(
            (expense) =>
              expense.status ===
                "Pendente" &&
              sameAmount(
                expense.amount,
                selected.amount,
              ),
          )
          .map(
            (
              expense,
            ) => ({
              key:
                `expense-${expense.id}`,
              linkType:
                "expense",
              id:
                expense.id,
              label:
                expense.description,
              description:
                expense.supplier ||
                expense.category,
              amount:
                expense.amount,
              date:
                expense.dueDate,
            }),
          );
      }

      return [];
    }, [
      selected,
      reconciliationType,
      charges,
      expenses,
    ]);

  const existingSelectedReconciliation =
    selected
      ? reconciliationMap.get(
          selected.id,
        )
      : undefined;

  function openReconciliation(
    item: BankTransaction,
  ) {
    const existing =
      reconciliationMap.get(
        item.id,
      );

    setSelected(
      item,
    );

    setSelectedFinancialLink(
      "",
    );

    if (existing) {
      setReconciliationType(
        existing.type,
      );

      setCategory(
        existing.category,
      );

      setNotes(
        existing.notes ??
          "",
      );

      return;
    }

    const defaultType:
      ReconciliationType =
      item.amount >= 0
        ? "Receita"
        : "Despesa";

    setReconciliationType(
      defaultType,
    );

    setCategory("");
    setNotes("");
  }

  function submitReconciliation(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    if (
      !category.trim()
    ) {
      window.alert(
        "Informe a categoria.",
      );

      return;
    }

    let linkedType:
      ReconciliationLinkType |
      undefined =
      existingSelectedReconciliation
        ?.linkedType;

    let linkedId:
      number |
      undefined =
      existingSelectedReconciliation
        ?.linkedId;

    let linkedLabel:
      string |
      undefined =
      existingSelectedReconciliation
        ?.linkedLabel;

    /*
     * Um vínculo já confirmado não é trocado.
     * Isso evita quitar dois lançamentos
     * diferentes com a mesma movimentação.
     */
    if (
      !linkedType &&
      selectedFinancialLink
    ) {
      const match =
        financialMatches.find(
          (item) =>
            item.key ===
            selectedFinancialLink,
        );

      if (match) {
        const confirmed =
          window.confirm(
            `Vincular ${money(
              Math.abs(
                selected.amount,
              ),
            )} a "${match.label}" e marcar o lançamento como pago?`,
          );

        if (
          !confirmed
        ) {
          return;
        }

        if (
          match.linkType ===
          "charge"
        ) {
          receiveFinancialCharge(
            match.id,
            {
              paymentMethod:
                "Transferência",
              receivedAmount:
                Math.abs(
                  selected.amount,
                ),
              discount: 0,
              surcharge: 0,
              paymentDate:
                selected.date,
              observation:
                `Conciliado com movimentação bancária: ${selected.description}`,
            },
          );
        } else {
          payFinancialExpense(
            match.id,
            {
              paymentDate:
                selected.date,
              paymentMethod:
                "Transferência",
              paidAmount:
                Math.abs(
                  selected.amount,
                ),
              discount: 0,
              surcharge: 0,
              observation:
                `Conciliado com movimentação bancária: ${selected.description}`,
            },
          );
        }

        linkedType =
          match.linkType;

        linkedId =
          match.id;

        linkedLabel =
          match.label;
      }
    }

    reconcileBankTransaction(
      {
        transactionId:
          selected.id,
        type:
          reconciliationType,
        category:
          category.trim(),
        notes:
          notes.trim(),
        reconciledAt:
          new Date().toISOString(),
        linkedType,
        linkedId,
        linkedLabel,
      },
    );

    setSelected(null);
    setSelectedFinancialLink(
      "",
    );

    load();
  }

  function clearFilters() {
    setSearch("");
    setType("Todos");
    setStatus("Todos");
  }

  const availableCategories =
    reconciliationType ===
      "Receita"
      ? revenueCategories
      : reconciliationType ===
          "Despesa"
        ? expenseCategories
        : [
            "Transferência",
            "Ajuste",
            "Outro",
          ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/contas-bancarias",
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft
              size={17}
            />
            Voltar para contas bancárias
          </button>

          <h1 className="text-2xl font-semibold text-slate-900">
            Movimentações bancárias
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {account
              ? `${account.accountName} — ${account.bankName}`
              : "Conta bancária"}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Período das movimentações
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Selecione dia, mês ou ano e refine a movimentação bancária.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "Dia",
                    "Mês",
                    "Ano",
                  ] as PeriodMode[]
                ).map(
                  (
                    mode,
                  ) => {
                    const active =
                      periodMode ===
                      mode;

                    return (
                      <button
                        key={
                          mode
                        }
                        type="button"
                        onClick={() =>
                          setPeriodMode(
                            mode,
                          )
                        }
                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                          active
                            ? "border-violet-300 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CalendarDays
                          size={
                            15
                          }
                        />

                        {
                          mode
                        }
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[190px_1fr_200px_220px_auto]">
              <div>
                {periodMode ===
                "Dia" ? (
                  <input
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                ) : periodMode ===
                  "Mês" ? (
                  <input
                    type="month"
                    value={
                      selectedMonth
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedMonth(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                ) : (
                  <select
                    value={
                      selectedYear
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedYear(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {Array.from(
                      {
                        length:
                          8,
                      },
                      (
                        _,
                        index,
                      ) =>
                        String(
                          new Date().getFullYear() -
                            4 +
                            index,
                        ),
                    ).map(
                      (
                        year,
                      ) => (
                        <option
                          key={
                            year
                          }
                          value={
                            year
                          }
                        >
                          {
                            year
                          }
                        </option>
                      ),
                    )}
                  </select>
                )}
              </div>

              <label className="relative">
                <Search
                  size={
                    18
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Buscar movimentação, categoria ou vínculo"
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <select
                value={
                  type
                }
                onChange={(
                  event,
                ) =>
                  setType(
                    event.target
                      .value as typeof type,
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option>
                  Todos
                </option>

                <option>
                  Entradas
                </option>

                <option>
                  Saídas
                </option>
              </select>

              <select
                value={
                  status
                }
                onChange={(
                  event,
                ) =>
                  setStatus(
                    event.target
                      .value as typeof status,
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option>
                  Todos
                </option>

                <option>
                  Conciliados
                </option>

                <option>
                  Não conciliados
                </option>
              </select>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            icon={
              Landmark
            }
            label="Saldo atual"
            tone="violet"
            value={money(
              account
                ?.currentBalance ??
                0,
            )}
          />

          <Card
            icon={
              ArrowUpCircle
            }
            label="Entradas exibidas"
            tone="emerald"
            value={money(
              summary.entries,
            )}
          />

          <Card
            icon={
              ArrowDownCircle
            }
            label="Saídas exibidas"
            tone="rose"
            value={money(
              summary.exits,
            )}
          />

          <Card
            icon={
              CheckCircle2
            }
            label="Não conciliadas"
            tone="amber"
            value={String(
              summary.pending,
            )}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Data",
                    "Descrição",
                    "Entrada",
                    "Saída",
                    "Categoria",
                    "Vínculo",
                    "Situação",
                    "Ação",
                  ].map(
                    (
                      heading,
                    ) => (
                      <th
                        key={
                          heading
                        }
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {
                          heading
                        }
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map(
                  (
                    item,
                  ) => {
                    const reconciliation =
                      reconciliationMap.get(
                        item.id,
                      );

                    return (
                      <tr
                        key={
                          item.id
                        }
                        className="transition hover:bg-violet-50/30"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                          {date(
                            item.date,
                          )}
                        </td>

                        <td className="min-w-[260px] px-4 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {
                              item.description
                            }
                          </div>

                          <div className="text-xs text-slate-500">
                            {
                              item.source
                            }
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium text-emerald-700">
                          {item.amount >
                          0
                            ? money(
                                item.amount,
                              )
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium text-rose-700">
                          {item.amount <
                          0
                            ? money(
                                Math.abs(
                                  item.amount,
                                ),
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-4">
                          {reconciliation ? (
                            <>
                              <div className="text-sm font-medium text-slate-800">
                                {
                                  reconciliation.category
                                }
                              </div>

                              <div className="text-xs text-slate-500">
                                {
                                  reconciliation.type
                                }
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Não categorizado
                            </span>
                          )}
                        </td>

                        <td className="min-w-[220px] px-4 py-4">
                          {reconciliation
                            ?.linkedLabel ? (
                            <div className="flex items-start gap-2">
                              <Link2
                                size={
                                  16
                                }
                                className="mt-0.5 shrink-0 text-indigo-600"
                              />

                              <div>
                                <div className="text-sm font-medium text-slate-800">
                                  {
                                    reconciliation.linkedLabel
                                  }
                                </div>

                                <div className="text-xs text-indigo-600">
                                  Vinculado ao Financeiro
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Sem vínculo
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {reconciliation ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Conciliado
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Pendente
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openReconciliation(
                                  item,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                            >
                              <Tags
                                size={
                                  14
                                }
                              />

                              {reconciliation
                                ? "Editar"
                                : "Conciliar"}
                            </button>

                            {reconciliation &&
                              !reconciliation.linkedType && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      !window.confirm(
                                        "Deseja remover a conciliação desta movimentação?",
                                      )
                                    ) {
                                      return;
                                    }

                                    try {
                                      removeBankReconciliation(
                                        item.id,
                                      );
                                    } catch (
                                      error
                                    ) {
                                      window.alert(
                                        error instanceof
                                          Error
                                          ? error.message
                                          : "Não foi possível remover a conciliação.",
                                      );
                                    }
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  Remover
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}

                {filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        8
                      }
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Conciliar movimentação
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      selected.description
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      null,
                    )
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X
                    size={
                      20
                    }
                  />
                </button>
              </div>

              <form
                onSubmit={
                  submitReconciliation
                }
                className="space-y-5 p-6"
              >
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Data
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {date(
                          selected.date,
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Valor
                      </p>

                      <p
                        className={`mt-1 font-semibold ${
                          selected.amount >=
                          0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {money(
                          selected.amount,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <Field label="Tipo *">
                  <select
                    value={
                      reconciliationType
                    }
                    disabled={
                      !!existingSelectedReconciliation
                        ?.linkedType
                    }
                    onChange={(
                      event,
                    ) => {
                      setReconciliationType(
                        event.target
                          .value as ReconciliationType,
                      );

                      setCategory(
                        "",
                      );

                      setSelectedFinancialLink(
                        "",
                      );
                    }}
                    className="input-reconciliation"
                  >
                    <option>
                      Receita
                    </option>

                    <option>
                      Despesa
                    </option>

                    <option>
                      Outro
                    </option>
                  </select>
                </Field>

                <Field label="Categoria *">
                  <select
                    required
                    value={
                      category
                    }
                    onChange={(
                      event,
                    ) =>
                      setCategory(
                        event.target.value,
                      )
                    }
                    className="input-reconciliation"
                  >
                    <option value="">
                      Selecione
                    </option>

                    {availableCategories.map(
                      (
                        item,
                      ) => (
                        <option
                          key={
                            item
                          }
                        >
                          {
                            item
                          }
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                {existingSelectedReconciliation
                  ?.linkedLabel ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2
                        size={
                          20
                        }
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          Já vinculado ao Financeiro
                        </p>

                        <p className="mt-1 text-sm text-emerald-700">
                          {
                            existingSelectedReconciliation.linkedLabel
                          }
                        </p>

                        <p className="mt-1 text-xs text-emerald-600">
                          O lançamento correspondente já foi marcado como pago.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  (
                    reconciliationType ===
                      "Receita" ||
                    reconciliationType ===
                      "Despesa"
                  ) && (
                    <Field label="Vincular a lançamento do Financeiro">
                      <select
                        value={
                          selectedFinancialLink
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedFinancialLink(
                            event.target.value,
                          )
                        }
                        className="input-reconciliation"
                      >
                        <option value="">
                          Somente categorizar, sem vincular
                        </option>

                        {financialMatches.map(
                          (
                            match,
                          ) => (
                            <option
                              key={
                                match.key
                              }
                              value={
                                match.key
                              }
                            >
                              {match.label} —{" "}
                              {money(
                                match.amount,
                              )}{" "}
                              — venc.{" "}
                              {date(
                                match.date,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        O sistema mostra apenas lançamentos pendentes com o mesmo valor da movimentação bancária.
                      </p>

                      {financialMatches.length ===
                        0 && (
                        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          Nenhum lançamento pendente com esse mesmo valor foi encontrado no Financeiro. Você pode salvar apenas a categorização.
                        </p>
                      )}
                    </Field>
                  )
                )}

                <Field label="Observações">
                  <textarea
                    rows={
                      4
                    }
                    value={
                      notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setNotes(
                        event.target.value,
                      )
                    }
                    className="input-reconciliation resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(
                        null,
                      )
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar conciliação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-reconciliation {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: .5rem;
            padding: .625rem .75rem;
            font-size: .875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-reconciliation:focus {
            border-color: rgb(148 163 184);
          }

          .input-reconciliation:disabled {
            background: rgb(248 250 252);
            color: rgb(100 116 139);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  tone =
    "violet",
}: {
  icon:
    typeof Landmark;
  label:
    string;
  value:
    string;
  tone?:
    | "violet"
    | "emerald"
    | "rose"
    | "amber";
}) {
  const tones = {
    violet:
      "border-violet-100 bg-violet-50/40 text-violet-700",
    emerald:
      "border-emerald-100 bg-emerald-50/40 text-emerald-700",
    rose:
      "border-rose-100 bg-rose-50/40 text-rose-700",
    amber:
      "border-amber-100 bg-amber-50/40 text-amber-700",
  } as const;

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            {
              label
            }
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {
              value
            }
          </p>
        </div>

        <div className="rounded-xl bg-white/80 p-3">
          <Icon
            size={
              22
            }
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {
          label
        }
      </span>

      {
        children
      }
    </label>
  );
}
