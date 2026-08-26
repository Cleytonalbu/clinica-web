import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import type {
  AdministrativeCollaborator,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import {
  cancelAdministrativePayment,
  createAdministrativePayment,
  getAdministrativePayments,
  markAdministrativePaymentAsPaid,
} from "./administrativePaymentStorage";

import type {
  AdministrativePayment,
  AdministrativePaymentStatus,
  AdministrativePaymentType,
} from "./administrativePaymentStorage";

const paymentTypes: AdministrativePaymentType[] = [
  "Salário",
  "Pró-labore",
  "Prestação de serviço",
  "Diária",
  "Benefício",
  "Outro",
];

const paymentMethods = [
  "PIX",
  "Transferência",
  "Dinheiro",
  "Boleto",
  "Outro",
];

function currentCompetence() {
  const now = new Date();
  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

const emptyForm = {
  collaboratorId: "",
  competence: currentCompetence(),
  type: "Salário" as AdministrativePaymentType,
  description: "",
  amount: "",
  dueDate: "",
  notes: "",
};

function currency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function displayDate(value?: string) {
  if (!value) return "—";

  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "pt-BR",
  );
}

function isOverdue(payment: AdministrativePayment) {
  if (payment.status !== "Pendente") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${payment.dueDate}T12:00:00`);
  return dueDate.getTime() < today.getTime();
}

function statusLabel(payment: AdministrativePayment) {
  if (isOverdue(payment)) return "Vencido";
  return payment.status;
}

function statusClass(payment: AdministrativePayment) {
  const label = statusLabel(payment);

  if (label === "Pago") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (label === "Vencido") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (label === "Cancelado") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function PagamentosAdministrativos() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [payments, setPayments] = useState<
    AdministrativePayment[]
  >([]);
  const [collaborators, setCollaborators] = useState<
    AdministrativeCollaborator[]
  >([]);

  const [search, setSearch] = useState("");
  const [competence, setCompetence] = useState(
    currentCompetence(),
  );
  const [status, setStatus] = useState<
    "Todos" | "Pendente" | "Pago" | "Vencido" | "Cancelado"
  >("Todos");

  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] =
    useState<AdministrativePayment | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [paymentMethod, setPaymentMethod] =
    useState("PIX");

  function load() {
    setPayments(
      getAdministrativePayments().filter(
        (payment) =>
          payment.unitId ===
          activeUnitId,
      ),
    );

    setCollaborators(
      getAdministrativeCollaborators().filter(
        (item) =>
          item.status === "Ativo" &&
          item.unitId ===
            activeUnitId,
      ),
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener(
      "administrative-payments-changed",
      refresh,
    );

    window.addEventListener(
      "administrative-collaborators-changed",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "administrative-payments-changed",
        refresh,
      );

      window.removeEventListener(
        "administrative-collaborators-changed",
        refresh,
      );
    };
  }, [
    activeUnitId,
  ]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesCompetence =
        !competence || payment.competence === competence;

      const currentStatus = statusLabel(payment);

      const matchesStatus =
        status === "Todos" || currentStatus === status;

      const matchesSearch =
        !term ||
        payment.collaboratorName
          .toLowerCase()
          .includes(term) ||
        payment.collaboratorRole
          .toLowerCase()
          .includes(term) ||
        payment.description.toLowerCase().includes(term) ||
        payment.type.toLowerCase().includes(term);

      return (
        matchesCompetence &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [payments, competence, status, search]);

  const summary = useMemo(() => {
    const base = payments.filter(
      (payment) =>
        !competence || payment.competence === competence,
    );

    const valid = base.filter(
      (payment) => payment.status !== "Cancelado",
    );

    return {
      total: valid.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      ),
      paid: valid
        .filter((payment) => payment.status === "Pago")
        .reduce((sum, payment) => sum + payment.amount, 0),
      pending: valid
        .filter((payment) => payment.status === "Pendente")
        .reduce((sum, payment) => sum + payment.amount, 0),
      overdue: valid
        .filter((payment) => isOverdue(payment))
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  }, [payments, competence]);

  function submitNewPayment(event: FormEvent) {
    event.preventDefault();

    const collaborator = collaborators.find(
      (item) => item.id === form.collaboratorId,
    );

    if (!collaborator) {
      window.alert("Selecione um colaborador ativo.");
      return;
    }

    const amount = Number(
      form.amount.replace(/\./g, "").replace(",", "."),
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Informe um valor válido.");
      return;
    }

    if (!form.dueDate) {
      window.alert("Informe o vencimento.");
      return;
    }

    createAdministrativePayment({
      unitId:
        activeUnitId,
      collaboratorId: collaborator.id,
      collaboratorName: collaborator.name,
      collaboratorRole: collaborator.role,
      competence: form.competence,
      type: form.type,
      description:
        form.description.trim() ||
        `${form.type} - ${collaborator.name}`,
      amount,
      dueDate: form.dueDate,
      status: "Pendente",
      notes: form.notes.trim(),
    });

    setForm({
      ...emptyForm,
      competence,
    });
    setShowForm(false);
    load();
  }

  function confirmPayment(event: FormEvent) {
    event.preventDefault();

    if (!showPayment) return;

    markAdministrativePaymentAsPaid(
      showPayment.id,
      paymentDate,
      paymentMethod,
    );

    setShowPayment(null);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Pagamentos administrativos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Controle de salários, prestações de serviço,
              diárias e demais pagamentos dos colaboradores.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setForm({
                ...emptyForm,
                competence,
              });
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo pagamento
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total da competência"
            value={currency(summary.total)}
            icon={CircleDollarSign}
          />
          <SummaryCard
            label="Pago"
            value={currency(summary.paid)}
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Pendente"
            value={currency(summary.pending)}
            icon={Clock3}
          />
          <SummaryCard
            label="Vencido"
            value={currency(summary.overdue)}
            icon={CalendarDays}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por colaborador, função ou descrição"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <input
              type="month"
              value={competence}
              onChange={(event) =>
                setCompetence(event.target.value)
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as typeof status,
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todos</option>
              <option>Pendente</option>
              <option>Vencido</option>
              <option>Pago</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Colaborador",
                    "Tipo",
                    "Competência",
                    "Vencimento",
                    "Valor",
                    "Situação",
                    "Pagamento",
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
                {filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {payment.collaboratorName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {payment.collaboratorRole}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700">
                        {payment.type}
                      </div>
                      <div className="max-w-[220px] truncate text-xs text-slate-500">
                        {payment.description}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {payment.competence
                        .split("-")
                        .reverse()
                        .join("/")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {displayDate(payment.dueDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                      {currency(payment.amount)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                          payment,
                        )}`}
                      >
                        {statusLabel(payment)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {payment.status === "Pago" ? (
                        <>
                          <div className="text-sm text-slate-700">
                            {displayDate(
                              payment.paymentDate,
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {payment.paymentMethod || "—"}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {payment.status === "Pendente" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentDate(
                                new Date()
                                  .toISOString()
                                  .slice(0, 10),
                              );
                              setPaymentMethod("PIX");
                              setShowPayment(payment);
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Pagar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Deseja cancelar este pagamento?",
                                )
                              ) {
                                cancelAdministrativePayment(
                                  payment.id,
                                );
                              }
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhum pagamento encontrado para os
                      filtros selecionados.
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
                    Novo pagamento
                  </h2>
                  <p className="text-sm text-slate-500">
                    Lance um pagamento para um colaborador
                    administrativo ativo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submitNewPayment}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Colaborador *">
                    <select
                      required
                      value={form.collaboratorId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          collaboratorId:
                            event.target.value,
                        })
                      }
                      className="input-payment"
                    >
                      <option value="">
                        Selecione
                      </option>
                      {collaborators.map(
                        (collaborator) => (
                          <option
                            key={collaborator.id}
                            value={collaborator.id}
                          >
                            {collaborator.name} —{" "}
                            {collaborator.role}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field label="Competência *">
                    <input
                      required
                      type="month"
                      value={form.competence}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          competence:
                            event.target.value,
                        })
                      }
                      className="input-payment"
                    />
                  </Field>

                  <Field label="Tipo de pagamento *">
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          type: event.target
                            .value as AdministrativePaymentType,
                        })
                      }
                      className="input-payment"
                    >
                      {paymentTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Valor *">
                    <input
                      required
                      inputMode="decimal"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          amount: event.target.value,
                        })
                      }
                      className="input-payment"
                    />
                  </Field>

                  <Field label="Vencimento *">
                    <input
                      required
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          dueDate: event.target.value,
                        })
                      }
                      className="input-payment"
                    />
                  </Field>

                  <Field label="Descrição">
                    <input
                      value={form.description}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          description:
                            event.target.value,
                        })
                      }
                      placeholder="Ex.: Salário agosto"
                      className="input-payment"
                    />
                  </Field>
                </div>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    className="input-payment resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar pagamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Confirmar pagamento
                  </h2>
                  <p className="text-sm text-slate-500">
                    {showPayment.collaboratorName} —{" "}
                    {currency(showPayment.amount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPayment(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={confirmPayment}
                className="space-y-4 p-6"
              >
                <Field label="Data do pagamento *">
                  <input
                    required
                    type="date"
                    value={paymentDate}
                    onChange={(event) =>
                      setPaymentDate(event.target.value)
                    }
                    className="input-payment"
                  />
                </Field>

                <Field label="Forma de pagamento *">
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value,
                      )
                    }
                    className="input-payment"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowPayment(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Confirmar pagamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-payment {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-payment:focus {
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
  icon: typeof BadgeDollarSign;
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