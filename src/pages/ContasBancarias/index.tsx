import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Landmark,
  Plus,
  Search,
  Upload,
  WalletCards,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  createBankAccount,
  getBankAccounts,
  setBankAccountStatus,
} from "./bankAccountStorage";

import type {
  BankAccount,
  BankAccountStatus,
  BankAccountType,
} from "./bankAccountStorage";

const accountTypes: BankAccountType[] = [
  "Conta corrente",
  "Conta poupança",
  "Conta pagamento",
  "Caixa",
  "Outro",
];

const emptyForm = {
  bankName: "",
  accountName: "",
  accountType: "Conta corrente" as BankAccountType,
  agency: "",
  accountNumber: "",
  initialBalance: "0,00",
  notes: "",
};

function currency(value: number) {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

function parseMoney(value: string) {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalized);
}

function statusClass(
  status: BankAccountStatus,
) {
  return status === "Ativa"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-500";
}

function ContasBancarias() {
  const navigate =
    useNavigate();

  const [accounts, setAccounts] =
    useState<BankAccount[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "Todas" | BankAccountStatus
    >("Todas");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  function load() {
    setAccounts(
      getBankAccounts(),
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener(
      "bank-accounts-changed",
      refresh,
    );

    return () =>
      window.removeEventListener(
        "bank-accounts-changed",
        refresh,
      );
  }, []);

  const filtered = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return accounts.filter((account) => {
      const matchesStatus =
        status === "Todas" ||
        account.status === status;

      const matchesSearch =
        !term ||
        account.bankName
          .toLowerCase()
          .includes(term) ||
        account.accountName
          .toLowerCase()
          .includes(term) ||
        account.accountType
          .toLowerCase()
          .includes(term) ||
        account.agency
          ?.toLowerCase()
          .includes(term) ||
        account.accountNumber
          ?.toLowerCase()
          .includes(term);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [accounts, search, status]);

  const summary = useMemo(() => {
    const active =
      accounts.filter(
        (account) =>
          account.status === "Ativa",
      );

    return {
      total: accounts.length,
      active: active.length,
      balance: active.reduce(
        (sum, account) =>
          sum +
          account.currentBalance,
        0,
      ),
    };
  }, [accounts]);

  function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!form.bankName.trim()) {
      window.alert(
        "Informe o banco ou instituição.",
      );
      return;
    }

    if (!form.accountName.trim()) {
      window.alert(
        "Informe um nome para identificar a conta.",
      );
      return;
    }

    const initialBalance =
      parseMoney(
        form.initialBalance,
      );

    if (
      !Number.isFinite(
        initialBalance,
      )
    ) {
      window.alert(
        "Informe um saldo inicial válido.",
      );
      return;
    }

    createBankAccount({
      bankName:
        form.bankName.trim(),
      accountName:
        form.accountName.trim(),
      accountType:
        form.accountType,
      agency:
        form.agency.trim(),
      accountNumber:
        form.accountNumber.trim(),
      initialBalance,
      status: "Ativa",
      notes:
        form.notes.trim(),
    });

    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Contas bancárias
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre as contas utilizadas pela clínica
              para organizar movimentações e importações de extrato.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/financeiro/importar-extrato",
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Upload size={18} />
              Importar extrato
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              Nova conta
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Contas cadastradas"
            value={String(
              summary.total,
            )}
            icon={Landmark}
          />

          <SummaryCard
            label="Contas ativas"
            value={String(
              summary.active,
            )}
            icon={WalletCards}
          />

          <SummaryCard
            label="Saldo atual"
            value={currency(
              summary.balance,
            )}
            icon={Landmark}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por banco, conta, agência ou número"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as typeof status,
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todas</option>
              <option>Ativa</option>
              <option>Inativa</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Conta",
                    "Banco",
                    "Tipo",
                    "Agência / Conta",
                    "Saldo inicial",
                    "Saldo atual",
                    "Situação",
                    "Ação",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map(
                  (account) => (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            account.accountName
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          Conta financeira
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {account.bankName}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {
                          account.accountType
                        }
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-700">
                          Agência:{" "}
                          {account.agency ||
                            "—"}
                        </div>

                        <div className="text-xs text-slate-500">
                          Conta:{" "}
                          {account.accountNumber ||
                            "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {currency(
                          account.initialBalance,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                        {currency(
                          account.currentBalance,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                            account.status,
                          )}`}
                        >
                          {account.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/contas-bancarias/${account.id}/movimentacoes`,
                            )
                          }
                          className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Eye size={15} />
                          Ver movimentações
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setBankAccountStatus(
                              account.id,
                              account.status ===
                                "Ativa"
                                ? "Inativa"
                                : "Ativa",
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          {account.status ===
                          "Ativa"
                            ? "Inativar"
                            : "Ativar"}
                        </button>
                      </td>
                    </tr>
                  ),
                )}

                {filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhuma conta bancária cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Nova conta bancária
                  </h2>

                  <p className="text-sm text-slate-500">
                    Cadastre uma conta usada nas movimentações financeiras da clínica.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submit}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Banco / Instituição *">
                    <input
                      required
                      value={
                        form.bankName
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          bankName:
                            event.target.value,
                        })
                      }
                      placeholder="Ex.: Banco do Brasil"
                      className="input-bank"
                    />
                  </Field>

                  <Field label="Nome da conta *">
                    <input
                      required
                      value={
                        form.accountName
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          accountName:
                            event.target.value,
                        })
                      }
                      placeholder="Ex.: Conta principal"
                      className="input-bank"
                    />
                  </Field>

                  <Field label="Tipo de conta">
                    <select
                      value={
                        form.accountType
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          accountType:
                            event.target
                              .value as BankAccountType,
                        })
                      }
                      className="input-bank"
                    >
                      {accountTypes.map(
                        (type) => (
                          <option
                            key={type}
                          >
                            {type}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field label="Agência">
                    <input
                      value={
                        form.agency
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          agency:
                            event.target.value,
                        })
                      }
                      className="input-bank"
                    />
                  </Field>

                  <Field label="Número da conta">
                    <input
                      value={
                        form.accountNumber
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          accountNumber:
                            event.target.value,
                        })
                      }
                      className="input-bank"
                    />
                  </Field>

                  <Field label="Saldo inicial">
                    <input
                      inputMode="decimal"
                      value={
                        form.initialBalance
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          initialBalance:
                            event.target.value,
                        })
                      }
                      placeholder="0,00"
                      className="input-bank"
                    />
                  </Field>
                </div>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={
                      form.notes
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes:
                          event.target.value,
                      })
                    }
                    className="input-bank resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-bank {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: .5rem;
            padding: .625rem .75rem;
            font-size: .875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-bank:focus {
            border-color: rgb(148 163 184);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Landmark;
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

export default ContasBancarias;