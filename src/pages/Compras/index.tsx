import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  getSuppliers,
} from "@/pages/Fornecedores/supplierStorage";

import type {
  Supplier,
} from "@/pages/Fornecedores/supplierStorage";

import {
  createPurchaseRequest,
  getPurchaseRequests,
  updatePurchaseRequest,
} from "./purchaseStorage";

import type {
  PurchaseRequest,
  PurchaseStatus,
} from "./purchaseStorage";

const statuses: PurchaseStatus[] = [
  "Solicitado",
  "Aprovado",
  "Comprado",
  "Recebido",
  "Cancelado",
];

const emptyForm = {
  description: "",
  supplierId: "",
  quantity: "1",
  estimatedValue: "",
  requestDate: new Date().toISOString().slice(0, 10),
  expectedDate: "",
  requester: "",
  notes: "",
};

function currency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function statusClass(status: PurchaseStatus) {
  if (status === "Recebido") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Comprado") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "Aprovado") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (status === "Cancelado") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function Compras() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Todos" | PurchaseStatus>("Todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setRequests(getPurchaseRequests());

    setSuppliers(
      getSuppliers().filter(
        (supplier) => supplier.status === "Ativo",
      ),
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener("purchase-requests-changed", refresh);

    return () =>
      window.removeEventListener(
        "purchase-requests-changed",
        refresh,
      );
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        status === "Todos" || request.status === status;

      const matchesSearch =
        !term ||
        request.description.toLowerCase().includes(term) ||
        request.supplierName?.toLowerCase().includes(term) ||
        request.requester?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, status]);

  const summary = useMemo(() => {
    const active = requests.filter(
      (request) => request.status !== "Cancelado",
    );

    return {
      requested: active.filter(
        (request) => request.status === "Solicitado",
      ).length,
      approved: active.filter(
        (request) => request.status === "Aprovado",
      ).length,
      purchased: active.filter(
        (request) => request.status === "Comprado",
      ).length,
      total: active.reduce(
        (sum, request) => sum + request.estimatedValue,
        0,
      ),
    };
  }, [requests]);

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!form.description.trim()) {
      window.alert("Informe o item ou descrição da compra.");
      return;
    }

    const quantity = Number(form.quantity);
    const estimatedValue = Number(
      form.estimatedValue.replace(/\./g, "").replace(",", "."),
    );

    if (!Number.isFinite(quantity) || quantity <= 0) {
      window.alert("Informe uma quantidade válida.");
      return;
    }

    if (!Number.isFinite(estimatedValue) || estimatedValue < 0) {
      window.alert("Informe um valor previsto válido.");
      return;
    }

    const supplier = suppliers.find(
      (item) => item.id === form.supplierId,
    );

    createPurchaseRequest({
      description: form.description.trim(),
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      quantity,
      estimatedValue,
      requestDate: form.requestDate,
      expectedDate: form.expectedDate,
      status: "Solicitado",
      requester: form.requester.trim(),
      notes: form.notes.trim(),
    });

    setForm({
      ...emptyForm,
      requestDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
    load();
  }

  function nextStatus(request: PurchaseRequest) {
    if (request.status === "Solicitado") {
      updatePurchaseRequest(request.id, {
        status: "Aprovado",
      });
      return;
    }

    if (request.status === "Aprovado") {
      updatePurchaseRequest(request.id, {
        status: "Comprado",
      });
      return;
    }

    if (request.status === "Comprado") {
      updatePurchaseRequest(request.id, {
        status: "Recebido",
      });
    }
  }

  function nextStatusLabel(status: PurchaseStatus) {
    if (status === "Solicitado") return "Aprovar";
    if (status === "Aprovado") return "Marcar comprado";
    if (status === "Comprado") return "Marcar recebido";
    return "";
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Compras
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Controle de solicitações, aprovação, compra e recebimento
              de materiais e serviços da clínica.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Nova solicitação
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Solicitados"
            value={String(summary.requested)}
            icon={ShoppingCart}
          />

          <SummaryCard
            label="Aprovados"
            value={String(summary.approved)}
            icon={CheckCircle2}
          />

          <SummaryCard
            label="Comprados"
            value={String(summary.purchased)}
            icon={Truck}
          />

          <SummaryCard
            label="Valor previsto"
            value={currency(summary.total)}
            icon={CircleDollarSign}
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por item, fornecedor ou solicitante"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as typeof status)
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todos</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Item / Serviço",
                    "Fornecedor",
                    "Qtd.",
                    "Solicitação",
                    "Previsão",
                    "Valor",
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
                {filtered.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {request.description}
                      </div>

                      <div className="text-xs text-slate-500">
                        {request.requester
                          ? `Solicitado por ${request.requester}`
                          : "Solicitante não informado"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {request.supplierName || "Não definido"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {request.quantity}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {formatDate(request.requestDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {formatDate(request.expectedDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                      {currency(request.estimatedValue)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex gap-2">
                        {nextStatusLabel(request.status) && (
                          <button
                            type="button"
                            onClick={() => nextStatus(request)}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            {nextStatusLabel(request.status)}
                          </button>
                        )}

                        {![
                          "Recebido",
                          "Cancelado",
                        ].includes(request.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Deseja cancelar esta solicitação de compra?",
                                )
                              ) {
                                updatePurchaseRequest(request.id, {
                                  status: "Cancelado",
                                });
                              }
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhuma solicitação de compra encontrada.
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
                    Nova solicitação de compra
                  </h2>

                  <p className="text-sm text-slate-500">
                    Registre um material, produto ou serviço necessário.
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
                onSubmit={submit}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Item / Serviço *">
                    <input
                      required
                      value={form.description}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          description: event.target.value,
                        })
                      }
                      className="input-purchase"
                    />
                  </Field>

                  <Field label="Fornecedor">
                    <select
                      value={form.supplierId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          supplierId: event.target.value,
                        })
                      }
                      className="input-purchase"
                    >
                      <option value="">Não definido</option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={supplier.id}
                        >
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Quantidade *">
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          quantity: event.target.value,
                        })
                      }
                      className="input-purchase"
                    />
                  </Field>

                  <Field label="Valor previsto">
                    <input
                      inputMode="decimal"
                      placeholder="0,00"
                      value={form.estimatedValue}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          estimatedValue: event.target.value,
                        })
                      }
                      className="input-purchase"
                    />
                  </Field>

                  <Field label="Data da solicitação *">
                    <input
                      required
                      type="date"
                      value={form.requestDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          requestDate: event.target.value,
                        })
                      }
                      className="input-purchase"
                    />
                  </Field>

                  <Field label="Previsão de recebimento">
                    <input
                      type="date"
                      value={form.expectedDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          expectedDate: event.target.value,
                        })
                      }
                      className="input-purchase"
                    />
                  </Field>

                  <Field label="Solicitado por">
                    <input
                      value={form.requester}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          requester: event.target.value,
                        })
                      }
                      className="input-purchase"
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
                    className="input-purchase resize-none"
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
                    Salvar solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-purchase {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-purchase:focus {
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
  icon: typeof ShoppingCart;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
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