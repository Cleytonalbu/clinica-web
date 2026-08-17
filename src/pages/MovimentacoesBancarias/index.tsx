import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  CheckCircle2,
  Landmark,
  Search,
  Tags,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  getBankAccounts,
  type BankAccount,
} from "@/pages/ContasBancarias/bankAccountStorage";
import {
  getBankTransactions,
  type BankTransaction,
} from "@/pages/ImportarExtrato/bankTransactionStorage";
import {
  getBankReconciliations,
  reconcileBankTransaction,
  removeBankReconciliation,
  type BankReconciliation,
  type ReconciliationType,
} from "./bankReconciliationStorage";

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function date(value: string) {
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
    : "—";
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

export default function MovimentacoesBancarias() {
  const navigate = useNavigate();
  const { accountId } = useParams();

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [items, setItems] = useState<BankTransaction[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"Todos" | "Entradas" | "Saídas">("Todos");
  const [status, setStatus] = useState<"Todos" | "Conciliados" | "Não conciliados">("Todos");

  const [selected, setSelected] = useState<BankTransaction | null>(null);
  const [reconciliationType, setReconciliationType] =
    useState<ReconciliationType>("Receita");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  function load() {
    setAccount(
      getBankAccounts().find((x) => x.id === accountId) ?? null
    );

    setItems(
      getBankTransactions()
        .filter((x) => x.accountId === accountId)
        .sort((a, b) => b.date.localeCompare(a.date))
    );

    setReconciliations(
      getBankReconciliations()
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener("bank-transactions-changed", refresh);
    window.addEventListener("bank-accounts-changed", refresh);
    window.addEventListener("bank-reconciliations-changed", refresh);

    return () => {
      window.removeEventListener("bank-transactions-changed", refresh);
      window.removeEventListener("bank-accounts-changed", refresh);
      window.removeEventListener("bank-reconciliations-changed", refresh);
    };
  }, [accountId]);

  const reconciliationMap = useMemo(
    () =>
      new Map(
        reconciliations.map((item) => [
          item.transactionId,
          item,
        ])
      ),
    [reconciliations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const reconciliation =
        reconciliationMap.get(item.id);

      const okSearch =
        !q ||
        item.description
          .toLowerCase()
          .includes(q) ||
        reconciliation?.category
          .toLowerCase()
          .includes(q);

      const okType =
        type === "Todos" ||
        (type === "Entradas" && item.amount > 0) ||
        (type === "Saídas" && item.amount < 0);

      const okStatus =
        status === "Todos" ||
        (status === "Conciliados" && !!reconciliation) ||
        (status === "Não conciliados" && !reconciliation);

      return okSearch && okType && okStatus;
    });
  }, [items, search, type, status, reconciliationMap]);

  const summary = useMemo(() => {
    const entries = filtered
      .filter((x) => x.amount > 0)
      .reduce((s, x) => s + x.amount, 0);

    const exits = filtered
      .filter((x) => x.amount < 0)
      .reduce((s, x) => s + Math.abs(x.amount), 0);

    const reconciled = items.filter(
      (item) => reconciliationMap.has(item.id)
    ).length;

    return {
      entries,
      exits,
      reconciled,
      pending: items.length - reconciled,
    };
  }, [filtered, items, reconciliationMap]);

  function openReconciliation(item: BankTransaction) {
    const existing =
      reconciliationMap.get(item.id);

    setSelected(item);

    if (existing) {
      setReconciliationType(existing.type);
      setCategory(existing.category);
      setNotes(existing.notes ?? "");
      return;
    }

    const defaultType: ReconciliationType =
      item.amount >= 0 ? "Receita" : "Despesa";

    setReconciliationType(defaultType);
    setCategory("");
    setNotes("");
  }

  function submitReconciliation(event: FormEvent) {
    event.preventDefault();

    if (!selected) return;

    if (!category.trim()) {
      window.alert("Informe a categoria.");
      return;
    }

    reconcileBankTransaction({
      transactionId: selected.id,
      type: reconciliationType,
      category: category.trim(),
      notes: notes.trim(),
      reconciledAt: new Date().toISOString(),
    });

    setSelected(null);
  }

  const availableCategories =
    reconciliationType === "Receita"
      ? revenueCategories
      : reconciliationType === "Despesa"
        ? expenseCategories
        : ["Transferência", "Ajuste", "Outro"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/contas-bancarias")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={17} />
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            icon={Landmark}
            label="Saldo atual"
            value={money(account?.currentBalance ?? 0)}
          />

          <Card
            icon={ArrowUpCircle}
            label="Entradas exibidas"
            value={money(summary.entries)}
          />

          <Card
            icon={ArrowDownCircle}
            label="Saídas exibidas"
            value={money(summary.exits)}
          />

          <Card
            icon={CheckCircle2}
            label="Não conciliadas"
            value={String(summary.pending)}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_220px]">
            <label className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar movimentação ou categoria"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as typeof type)
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              <option>Entradas</option>
              <option>Saídas</option>
            </select>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as typeof status)
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              <option>Conciliados</option>
              <option>Não conciliados</option>
            </select>
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
                    "Origem",
                    "Entrada",
                    "Saída",
                    "Categoria",
                    "Situação",
                    "Ação",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const reconciliation =
                    reconciliationMap.get(item.id);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {date(item.date)}
                      </td>

                      <td className="min-w-[280px] px-4 py-4 text-sm font-medium text-slate-900">
                        {item.description}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {item.source}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-emerald-700">
                        {item.amount > 0
                          ? money(item.amount)
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-rose-700">
                        {item.amount < 0
                          ? money(Math.abs(item.amount))
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {reconciliation ? (
                          <>
                            <div className="text-sm font-medium text-slate-800">
                              {reconciliation.category}
                            </div>

                            <div className="text-xs text-slate-500">
                              {reconciliation.type}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Não categorizado
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
                            onClick={() => openReconciliation(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            <Tags size={14} />
                            {reconciliation ? "Editar" : "Conciliar"}
                          </button>

                          {reconciliation && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Deseja remover a conciliação desta movimentação?"
                                  )
                                ) {
                                  removeBankReconciliation(item.id);
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
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Conciliar movimentação
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selected.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submitReconciliation}
                className="space-y-5 p-6"
              >
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Data
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {date(selected.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Valor
                      </p>

                      <p
                        className={`mt-1 font-semibold ${
                          selected.amount >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {money(selected.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <Field label="Tipo *">
                  <select
                    value={reconciliationType}
                    onChange={(e) => {
                      setReconciliationType(
                        e.target.value as ReconciliationType
                      );
                      setCategory("");
                    }}
                    className="input-reconciliation"
                  >
                    <option>Receita</option>
                    <option>Despesa</option>
                    <option>Outro</option>
                  </select>
                </Field>

                <Field label="Categoria *">
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-reconciliation"
                  >
                    <option value="">Selecione</option>

                    {availableCategories.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-reconciliation resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
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
  icon: typeof Landmark;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}