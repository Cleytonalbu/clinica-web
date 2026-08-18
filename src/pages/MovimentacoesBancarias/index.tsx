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
  ChevronLeft,
  ChevronRight,
  Landmark,
  Link2,
  Plus,
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
  createManualBankTransaction,
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

function getCurrentMonth() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function monthLabel(
  value: string,
) {
  if (!value) {
    return "Todos os meses";
  }

  const [
    year,
    month,
  ] =
    value.split("-");

  if (
    !year ||
    !month
  ) {
    return value;
  }

  const reference =
    new Date(
      Number(year),
      Number(month) - 1,
      1,
    );

  const label =
    reference.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      },
    );

  return label.charAt(0).toUpperCase() +
    label.slice(1);
}

function changeMonth(
  value: string,
  difference: number,
) {
  const [
    year,
    month,
  ] =
    value.split("-");

  const reference =
    new Date(
      Number(year),
      Number(month) - 1 +
        difference,
      1,
    );

  return `${reference.getFullYear()}-${String(
    reference.getMonth() + 1,
  ).padStart(2, "0")}`;
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
  bankAccountDefined: boolean;
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
    selectedMonth,
    setSelectedMonth,
  ] =
    useState(
      getCurrentMonth(),
    );

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

  const [
    showManualForm,
    setShowManualForm,
  ] =
    useState(false);

  const [
    manualType,
    setManualType,
  ] =
    useState<
      "Entrada" | "Saída"
    >("Entrada");

  const [
    manualDate,
    setManualDate,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10),
    );

  const [
    manualDescription,
    setManualDescription,
  ] =
    useState("");

  const [
    manualAmount,
    setManualAmount,
  ] =
    useState("");

  const [
    manualNotes,
    setManualNotes,
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

          const matchesMonth =
            !selectedMonth ||
            item.date.slice(
              0,
              7,
            ) ===
              selectedMonth;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesMonth
          );
        },
      );
    }, [
      items,
      search,
      type,
      status,
      selectedMonth,
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
        items.filter(
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
          items.length -
          reconciled,
      };
    }, [
      filtered,
      items,
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
              ) &&
              (
                !charge.bankAccountId ||
                charge.bankAccountId ===
                  accountId
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
              bankAccountDefined:
                !!charge.bankAccountId,
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
              ) &&
              (
                !expense.bankAccountId ||
                expense.bankAccountId ===
                  accountId
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
              bankAccountDefined:
                !!expense.bankAccountId,
            }),
          );
      }

      return [];
    }, [
      selected,
      reconciliationType,
      charges,
      expenses,
      accountId,
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

              bankAccountId:
                account?.id,

              bankAccountName:
                account
                  ? `${account.accountName} — ${account.bankName}`
                  : undefined,
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

              bankAccountId:
                account?.id,

              bankAccountName:
                account
                  ? `${account.accountName} — ${account.bankName}`
                  : undefined,
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

  function submitManualTransaction(
    event: FormEvent,
  ) {
    event.preventDefault();

    const parsed =
      Number(
        manualAmount
          .replace(/\./g, "")
          .replace(",", "."),
      );

    if (
      !Number.isFinite(parsed) ||
      parsed <= 0
    ) {
      window.alert(
        "Informe um valor válido.",
      );

      return;
    }

    try {
      createManualBankTransaction({
        accountId:
          accountId ?? "",
        date:
          manualDate,
        description:
          manualDescription.trim(),
        amount:
          manualType === "Entrada"
            ? Math.abs(parsed)
            : -Math.abs(parsed),
      });

      setShowManualForm(false);

      setManualType(
        "Entrada",
      );

      setManualDate(
        new Date()
          .toISOString()
          .slice(0, 10),
      );

      setManualDescription(
        "",
      );

      setManualAmount(
        "",
      );

      setManualNotes(
        "",
      );

      load();
    } catch (
      error
    ) {
      window.alert(
        error instanceof
          Error
          ? error.message
          : "Não foi possível salvar o lançamento.",
      );
    }
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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

          <button
            type="button"
            onClick={() =>
              setShowManualForm(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo lançamento
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            icon={
              Landmark
            }
            label="Saldo atual"
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
            value={money(
              summary.entries,
            )}
          />

          <Card
            icon={
              ArrowDownCircle
            }
            label="Saídas exibidas"
            value={money(
              summary.exits,
            )}
          />

          <Card
            icon={
              CheckCircle2
            }
            label="Não conciliadas"
            value={String(
              summary.pending,
            )}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <CalendarDays
                  size={20}
                />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Competência
                </p>

                <p className="text-base font-semibold text-slate-900">
                  {monthLabel(
                    selectedMonth,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedMonth(
                    changeMonth(
                      selectedMonth,
                      -1,
                    ),
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Mês anterior"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

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
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setSelectedMonth(
                    changeMonth(
                      selectedMonth,
                      1,
                    ),
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Próximo mês"
              >
                <ChevronRight
                  size={18}
                />
              </button>

              {selectedMonth !==
                getCurrentMonth() && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMonth(
                      getCurrentMonth(),
                    )
                  }
                  className="h-10 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Mês atual
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_200px_220px]">
              <label className="relative">
                <Search
                  size={18}
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
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
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
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
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
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
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
            </div>
          </div>
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
                        className="hover:bg-slate-50"
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
                      Nenhuma movimentação encontrada nesta competência.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showManualForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Novo lançamento bancário
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Registre uma entrada ou saída que não veio do extrato importado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowManualForm(false)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  submitManualTransaction
                }
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tipo *">
                    <select
                      value={
                        manualType
                      }
                      onChange={(
                        event,
                      ) =>
                        setManualType(
                          event.target
                            .value as
                            | "Entrada"
                            | "Saída",
                        )
                      }
                      className="input-reconciliation"
                    >
                      <option>
                        Entrada
                      </option>

                      <option>
                        Saída
                      </option>
                    </select>
                  </Field>

                  <Field label="Data *">
                    <input
                      required
                      type="date"
                      value={
                        manualDate
                      }
                      onChange={(
                        event,
                      ) =>
                        setManualDate(
                          event.target.value,
                        )
                      }
                      className="input-reconciliation"
                    />
                  </Field>
                </div>

                <Field label="Descrição *">
                  <input
                    required
                    value={
                      manualDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setManualDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: depósito em dinheiro, tarifa bancária..."
                    className="input-reconciliation"
                  />
                </Field>

                <Field label="Valor *">
                  <input
                    required
                    inputMode="decimal"
                    value={
                      manualAmount
                    }
                    onChange={(
                      event,
                    ) =>
                      setManualAmount(
                        event.target.value,
                      )
                    }
                    placeholder="0,00"
                    className="input-reconciliation"
                  />
                </Field>

                <Field label="Observação">
                  <textarea
                    rows={3}
                    value={
                      manualNotes
                    }
                    onChange={(
                      event,
                    ) =>
                      setManualNotes(
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
                      setShowManualForm(false)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar lançamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                              )}{" "}
                              —{" "}
                              {match.bankAccountDefined
                                ? "mesma conta"
                                : "conta ainda não definida"}
                            </option>
                          ),
                        )}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        O sistema mostra lançamentos pendentes com o mesmo valor e compatíveis com esta conta bancária. Lançamentos antigos sem conta definida também podem aparecer para você confirmar.
                      </p>

                      {financialMatches.length ===
                        0 && (
                        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          Nenhum lançamento pendente com esse valor e compatível com esta conta foi encontrado no Financeiro. Você pode salvar apenas a categorização.
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
}: {
  icon:
    typeof Landmark;
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
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

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
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