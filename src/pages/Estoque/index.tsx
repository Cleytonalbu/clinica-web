import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  createStockItem,
  getStockItems,
  getStockMovements,
  registerStockMovement,
} from "./stockStorage";

import type {
  StockItem,
  StockMovement,
  StockMovementType,
} from "./stockStorage";

const emptyItemForm = {
  name: "",
  category: "",
  unit: "un",
  quantity: "0",
  minimumQuantity: "0",
  location: "",
  notes: "",
};

const emptyMovementForm = {
  itemId: "",
  type: "Entrada" as StockMovementType,
  quantity: "",
  date: new Date().toISOString().slice(0, 10),
  reason: "",
  responsible: "",
  notes: "",
};

export default function Estoque() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [movementForm, setMovementForm] =
    useState(emptyMovementForm);

  function load() {
    setItems(getStockItems());
    setMovements(getStockMovements());
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener("stock-changed", refresh);

    return () =>
      window.removeEventListener(
        "stock-changed",
        refresh,
      );
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      if (!term) return true;

      return (
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  const summary = useMemo(() => {
    const lowStock = items.filter(
      (item) =>
        item.quantity > 0 &&
        item.quantity <= item.minimumQuantity,
    );

    const outOfStock = items.filter(
      (item) => item.quantity <= 0,
    );

    const totalUnits = items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      items: items.length,
      totalUnits,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    };
  }, [items]);

  function submitItem(event: FormEvent) {
    event.preventDefault();

    if (!itemForm.name.trim()) {
      window.alert("Informe o nome do item.");
      return;
    }

    const quantity = Number(itemForm.quantity);
    const minimumQuantity = Number(
      itemForm.minimumQuantity,
    );

    if (
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(minimumQuantity) ||
      minimumQuantity < 0
    ) {
      window.alert("Informe quantidades válidas.");
      return;
    }

    createStockItem({
      name: itemForm.name.trim(),
      category: itemForm.category.trim() || "Geral",
      unit: itemForm.unit.trim() || "un",
      quantity,
      minimumQuantity,
      location: itemForm.location.trim(),
      notes: itemForm.notes.trim(),
    });

    setItemForm(emptyItemForm);
    setShowItemForm(false);
    load();
  }

  function submitMovement(event: FormEvent) {
    event.preventDefault();

    const quantity = Number(movementForm.quantity);

    if (!movementForm.itemId) {
      window.alert("Selecione um item.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      window.alert("Informe uma quantidade válida.");
      return;
    }

    try {
      registerStockMovement({
        itemId: movementForm.itemId,
        type: movementForm.type,
        quantity,
        date: movementForm.date,
        reason:
          movementForm.reason.trim() ||
          (movementForm.type === "Entrada"
            ? "Entrada de estoque"
            : "Saída de estoque"),
        responsible: movementForm.responsible.trim(),
        notes: movementForm.notes.trim(),
      });

      setMovementForm({
        ...emptyMovementForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setShowMovementForm(false);
      load();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a movimentação.",
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Estoque
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Controle de materiais, quantidades, entradas,
              saídas e estoque mínimo da clínica.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowMovementForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowDownToLine size={18} />
              Movimentar estoque
            </button>

            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              Novo item
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Itens cadastrados"
            value={summary.items}
            icon={Package}
          />

          <SummaryCard
            label="Unidades em estoque"
            value={summary.totalUnits}
            icon={Boxes}
          />

          <SummaryCard
            label="Estoque baixo"
            value={summary.lowStock}
            icon={AlertTriangle}
          />

          <SummaryCard
            label="Sem estoque"
            value={summary.outOfStock}
            icon={ArrowUpFromLine}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por item, categoria ou localização"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Item",
                    "Categoria",
                    "Local",
                    "Quantidade",
                    "Mínimo",
                    "Situação",
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
                {filteredItems.map((item) => {
                  const outOfStock = item.quantity <= 0;
                  const lowStock =
                    !outOfStock &&
                    item.quantity <= item.minimumQuantity;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>

                        <div className="text-xs text-slate-500">
                          Unidade: {item.unit}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.category}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.location || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                        {item.quantity} {item.unit}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {item.minimumQuantity} {item.unit}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            outOfStock
                              ? "border-red-200 bg-red-50 text-red-700"
                              : lowStock
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {outOfStock
                            ? "Sem estoque"
                            : lowStock
                              ? "Estoque baixo"
                              : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhum item cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Últimas movimentações
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.slice(0, 8).map((movement) => (
              <div
                key={movement.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {movement.itemName}
                  </div>

                  <div className="text-sm text-slate-500">
                    {movement.reason}
                    {movement.responsible
                      ? ` • ${movement.responsible}`
                      : ""}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      movement.type === "Entrada"
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {movement.type === "Entrada" ? "+" : "-"}
                    {movement.quantity}
                  </span>

                  <span className="text-xs text-slate-500">
                    {new Date(
                      `${movement.date}T12:00:00`,
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}

            {movements.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                Nenhuma movimentação registrada.
              </div>
            )}
          </div>
        </div>

        {showItemForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Novo item de estoque
                  </h2>
                  <p className="text-sm text-slate-500">
                    Cadastre um material utilizado pela clínica.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submitItem}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Item *">
                    <input
                      required
                      value={itemForm.name}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          name: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Categoria">
                    <input
                      value={itemForm.category}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          category: event.target.value,
                        })
                      }
                      placeholder="Ex.: Material de escritório"
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Unidade">
                    <input
                      value={itemForm.unit}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          unit: event.target.value,
                        })
                      }
                      placeholder="un, cx, pct..."
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Localização">
                    <input
                      value={itemForm.location}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          location: event.target.value,
                        })
                      }
                      placeholder="Ex.: Almoxarifado"
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Quantidade inicial">
                    <input
                      type="number"
                      min="0"
                      value={itemForm.quantity}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          quantity: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Estoque mínimo">
                    <input
                      type="number"
                      min="0"
                      value={itemForm.minimumQuantity}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          minimumQuantity: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>
                </div>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={itemForm.notes}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        notes: event.target.value,
                      })
                    }
                    className="input-stock resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowItemForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMovementForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Movimentar estoque
                  </h2>

                  <p className="text-sm text-slate-500">
                    Registre entrada ou saída de material.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submitMovement}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Item *">
                    <select
                      required
                      value={movementForm.itemId}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          itemId: event.target.value,
                        })
                      }
                      className="input-stock"
                    >
                      <option value="">Selecione</option>

                      {items.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name} — saldo {item.quantity} {item.unit}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Tipo *">
                    <select
                      value={movementForm.type}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          type:
                            event.target.value as StockMovementType,
                        })
                      }
                      className="input-stock"
                    >
                      <option>Entrada</option>
                      <option>Saída</option>
                    </select>
                  </Field>

                  <Field label="Quantidade *">
                    <input
                      required
                      type="number"
                      min="1"
                      value={movementForm.quantity}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          quantity: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Data *">
                    <input
                      required
                      type="date"
                      value={movementForm.date}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          date: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Motivo">
                    <input
                      value={movementForm.reason}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          reason: event.target.value,
                        })
                      }
                      placeholder="Ex.: compra, uso interno..."
                      className="input-stock"
                    />
                  </Field>

                  <Field label="Responsável">
                    <input
                      value={movementForm.responsible}
                      onChange={(event) =>
                        setMovementForm({
                          ...movementForm,
                          responsible: event.target.value,
                        })
                      }
                      className="input-stock"
                    />
                  </Field>
                </div>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={movementForm.notes}
                    onChange={(event) =>
                      setMovementForm({
                        ...movementForm,
                        notes: event.target.value,
                      })
                    }
                    className="input-stock resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowMovementForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Registrar movimentação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-stock {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-stock:focus {
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
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
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