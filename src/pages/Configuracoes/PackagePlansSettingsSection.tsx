import {
  useMemo,
  useState,
} from "react";

import {
  BadgePercent,
  Check,
  Edit3,
  PackagePlus,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getActiveSpecialties,
} from "./settingsStorage";

import {
  calculatePackageFinalValue,
  createPackagePlan,
  deletePackagePlan,
  getPackagePlansByUnit,
  savePackagePlan,
  setPackagePlanStatus,
  type PackageDiscountType,
  type PackagePlan,
  type PackagePlanItem,
} from "./packagePlanStorage";

interface PackagePlansSettingsSectionProps {
  onFeedback?: (
    message: string
  ) => void;
}

interface PackageFormState {
  name: string;
  items: PackagePlanItem[];
  originalValue: string;
  discountType: PackageDiscountType;
  discountValue: string;
  validityDays: string;
  allowInstallments: boolean;
  maxInstallments: string;
  observation: string;
}

const createInitialForm = ():
  PackageFormState => ({
    name: "",
    items: [
      {
        id: Date.now(),
        specialty: "",
        sessions: 1,
      },
    ],
    originalValue: "",
    discountType:
      "percentage",
    discountValue: "",
    validityDays: "30",
    allowInstallments:
      false,
    maxInstallments: "1",
    observation: "",
  });

function parseMoney(
  value: string
) {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? Math.max(parsed, 0)
    : 0;
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}

function getTotalSessions(
  items: PackagePlanItem[]
) {
  return items.reduce(
    (sum, item) =>
      sum +
      Math.max(
        Number(item.sessions) || 0,
        0
      ),
    0
  );
}

export default function PackagePlansSettingsSection({
  onFeedback,
}: PackagePlansSettingsSectionProps) {
  const {
    activeUnit,
    activeUnitId,
  } = useUnit();

  const [
    plans,
    setPlans,
  ] = useState<PackagePlan[]>(
    () =>
      getPackagePlansByUnit(
        activeUnitId
      )
  );

  const [
    form,
    setForm,
  ] = useState<PackageFormState>(
    createInitialForm
  );

  const [
    editingId,
    setEditingId,
  ] = useState<number | null>(
    null
  );

  const specialties =
    useMemo(
      () =>
        getActiveSpecialties()
          .map(
            (item) =>
              item.name
          )
          .sort(
            (a, b) =>
              a.localeCompare(
                b,
                "pt-BR"
              )
          ),
      []
    );

  const originalValue =
    parseMoney(
      form.originalValue
    );

  const discountValue =
    parseMoney(
      form.discountValue
    );

  const finalValue =
    calculatePackageFinalValue(
      originalValue,
      form.discountType,
      discountValue
    );

  const totalSessions =
    getTotalSessions(
      form.items
    );

  function refresh() {
    setPlans(
      getPackagePlansByUnit(
        activeUnitId
      )
    );
  }

  function feedback(
    message: string
  ) {
    if (onFeedback) {
      onFeedback(message);
      return;
    }

    window.alert(message);
  }

  function updateForm<
    K extends keyof PackageFormState
  >(
    field: K,
    value: PackageFormState[K]
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function updateItem(
    itemId: number,
    field:
      | "specialty"
      | "sessions",
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        items:
          current.items.map(
            (item) =>
              item.id ===
              itemId
                ? {
                    ...item,
                    [field]:
                      field ===
                      "sessions"
                        ? Math.max(
                            Math.trunc(
                              Number(value) ||
                                1
                            ),
                            1
                          )
                        : value,
                  }
                : item
          ),
      })
    );
  }

  function addItem() {
    setForm(
      (current) => ({
        ...current,
        items: [
          ...current.items,
          {
            id:
              Date.now(),
            specialty: "",
            sessions: 1,
          },
        ],
      })
    );
  }

  function removeItem(
    itemId: number
  ) {
    setForm(
      (current) => ({
        ...current,
        items:
          current.items.length <=
          1
            ? current.items
            : current.items.filter(
                (item) =>
                  item.id !==
                  itemId
              ),
      })
    );
  }

  function resetForm() {
    setEditingId(null);
    setForm(
      createInitialForm()
    );
  }

  function handleSave() {
    const name =
      form.name.trim();

    const validItems =
      form.items.filter(
        (item) =>
          item.specialty.trim() &&
          item.sessions > 0
      );

    if (!name) {
      feedback(
        "Informe o nome do plano."
      );
      return;
    }

    if (
      validItems.length ===
      0
    ) {
      feedback(
        "Adicione pelo menos uma especialidade ao plano."
      );
      return;
    }

    if (
      originalValue <= 0
    ) {
      feedback(
        "Informe o valor original do pacote."
      );
      return;
    }

    if (
      form.discountType ===
        "percentage" &&
      discountValue > 100
    ) {
      feedback(
        "O desconto percentual não pode ser maior que 100%."
      );
      return;
    }

    const validityDays =
      Math.max(
        Math.trunc(
          Number(
            form.validityDays
          ) || 30
        ),
        1
      );

    const maxInstallments =
      form.allowInstallments
        ? Math.max(
            Math.trunc(
              Number(
                form.maxInstallments
              ) || 1
            ),
            1
          )
        : 1;

    if (editingId) {
      const existing =
        plans.find(
          (plan) =>
            plan.id ===
            editingId
        );

      if (!existing) {
        feedback(
          "Plano não encontrado."
        );
        return;
      }

      savePackagePlan({
        ...existing,
        name,
        items: validItems,
        originalValue,
        discountType:
          form.discountType,
        discountValue,
        finalValue,
        validityDays,
        allowInstallments:
          form.allowInstallments,
        maxInstallments,
        observation:
          form.observation.trim(),
      });

      feedback(
        "Plano atualizado com sucesso."
      );
    } else {
      createPackagePlan({
        unitId:
          activeUnitId,
        name,
        items: validItems,
        originalValue,
        discountType:
          form.discountType,
        discountValue,
        validityDays,
        allowInstallments:
          form.allowInstallments,
        maxInstallments,
        active: true,
        observation:
          form.observation.trim(),
      });

      feedback(
        "Plano criado com sucesso."
      );
    }

    refresh();
    resetForm();
  }

  function handleEdit(
    plan: PackagePlan
  ) {
    setEditingId(
      plan.id
    );

    setForm({
      name:
        plan.name,
      items:
        plan.items.map(
          (item) => ({
            ...item,
          })
        ),
      originalValue:
        plan.originalValue
          .toFixed(2)
          .replace(".", ","),
      discountType:
        plan.discountType,
      discountValue:
        plan.discountValue
          .toFixed(2)
          .replace(".", ","),
      validityDays:
        String(
          plan.validityDays
        ),
      allowInstallments:
        plan.allowInstallments,
      maxInstallments:
        String(
          plan.maxInstallments
        ),
      observation:
        plan.observation ??
        "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleToggle(
    plan: PackagePlan
  ) {
    setPackagePlanStatus(
      plan.id,
      !plan.active
    );

    refresh();

    feedback(
      plan.active
        ? "Plano inativado."
        : "Plano ativado."
    );
  }

  function handleDelete(
    plan: PackagePlan
  ) {
    const confirmed =
      window.confirm(
        `Deseja excluir o plano ${plan.name}?`
      );

    if (!confirmed) {
      return;
    }

    deletePackagePlan(
      plan.id
    );

    refresh();

    if (
      editingId ===
      plan.id
    ) {
      resetForm();
    }

    feedback(
      "Plano excluído."
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BadgePercent
                  size={20}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Planos e pacotes de atendimento
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure combos de consultas com desconto para a unidade {activeUnit.name}.
                </p>
              </div>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={
                resetForm
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X
                size={16}
              />
              Cancelar edição
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field
            label="Nome do plano *"
          >
            <input
              value={
                form.name
              }
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="Ex.: Pacote Psicologia - 8 sessões"
              className="package-input"
            />
          </Field>

          <Field
            label="Validade do plano *"
          >
            <div className="relative">
              <input
                type="number"
                min={1}
                value={
                  form.validityDays
                }
                onChange={(event) =>
                  updateForm(
                    "validityDays",
                    event.target.value
                  )
                }
                className="package-input pr-16"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                dias
              </span>
            </div>
          </Field>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Consultas incluídas
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Você pode montar pacotes com uma ou mais especialidades.
              </p>
            </div>

            <button
              type="button"
              onClick={
                addItem
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 text-xs font-bold text-violet-600 hover:bg-violet-50"
            >
              <Plus
                size={14}
              />
              Especialidade
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {form.items.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_150px_42px]"
                >
                  <select
                    value={
                      item.specialty
                    }
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        "specialty",
                        event.target.value
                      )
                    }
                    className="package-input"
                  >
                    <option value="">
                      Selecione a especialidade...
                    </option>

                    {specialties.map(
                      (specialty) => (
                        <option
                          key={
                            specialty
                          }
                          value={
                            specialty
                          }
                        >
                          {specialty}
                        </option>
                      )
                    )}
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={
                        item.sessions
                      }
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "sessions",
                          event.target.value
                        )
                      }
                      className="package-input pr-16"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                      sessões
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        item.id
                      )
                    }
                    disabled={
                      form.items.length <=
                      1
                    }
                    className="flex h-10 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remover especialidade"
                  >
                    <Trash2
                      size={15}
                    />
                  </button>
                </div>
              )
            )}
          </div>

          <div className="mt-3 text-right text-xs font-semibold text-slate-500">
            Total: {totalSessions} sessão(ões)
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Valor original *"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                R$
              </span>

              <input
                value={
                  form.originalValue
                }
                onChange={(event) =>
                  updateForm(
                    "originalValue",
                    event.target.value
                  )
                }
                placeholder="0,00"
                className="package-input pl-10"
              />
            </div>
          </Field>

          <Field
            label="Tipo de desconto"
          >
            <select
              value={
                form.discountType
              }
              onChange={(event) =>
                updateForm(
                  "discountType",
                  event.target.value as PackageDiscountType
                )
              }
              className="package-input"
            >
              <option value="percentage">
                Percentual (%)
              </option>

              <option value="fixed">
                Valor fixo (R$)
              </option>
            </select>
          </Field>

          <Field
            label="Desconto"
          >
            <div className="relative">
              {form.discountType ===
              "fixed" ? (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
              ) : null}

              <input
                value={
                  form.discountValue
                }
                onChange={(event) =>
                  updateForm(
                    "discountValue",
                    event.target.value
                  )
                }
                placeholder="0"
                className={`package-input ${
                  form.discountType ===
                  "fixed"
                    ? "pl-10 pr-3"
                    : "pr-9"
                }`}
              />

              {form.discountType ===
              "percentage" ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              ) : null}
            </div>
          </Field>

          <Field
            label="Valor final"
          >
            <div className="flex h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-extrabold text-emerald-700">
              {formatCurrency(
                finalValue
              )}
            </div>
          </Field>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={
                  form.allowInstallments
                }
                onChange={(event) =>
                  updateForm(
                    "allowInstallments",
                    event.target.checked
                  )
                }
                className="mt-0.5 h-4 w-4 accent-violet-600"
              />

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Permitir parcelamento
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  A recepção poderá parcelar a compra do pacote.
                </p>
              </div>
            </label>

            {form.allowInstallments && (
              <div className="mt-4">
                <Field
                  label="Máximo de parcelas"
                >
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={
                      form.maxInstallments
                    }
                    onChange={(event) =>
                      updateForm(
                        "maxInstallments",
                        event.target.value
                      )
                    }
                    className="package-input"
                  />
                </Field>
              </div>
            )}
          </div>

          <Field
            label="Observação"
          >
            <textarea
              value={
                form.observation
              }
              onChange={(event) =>
                updateForm(
                  "observation",
                  event.target.value
                )
              }
              rows={4}
              placeholder="Ex.: válido somente para atendimentos particulares."
              className="package-input min-h-[104px] resize-none py-3"
            />
          </Field>
        </div>

        <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary
              label="Sessões"
              value={
                String(
                  totalSessions
                )
              }
            />

            <Summary
              label="Valor normal"
              value={
                formatCurrency(
                  originalValue
                )
              }
            />

            <Summary
              label="Desconto"
              value={
                form.discountType ===
                "percentage"
                  ? `${discountValue}%`
                  : formatCurrency(
                      discountValue
                    )
              }
            />

            <Summary
              label="Valor do pacote"
              value={
                formatCurrency(
                  finalValue
                )
              }
              highlight
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={
              handleSave
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
          >
            {editingId ? (
              <Check
                size={17}
              />
            ) : (
              <PackagePlus
                size={17}
              />
            )}

            {editingId
              ? "Salvar alterações"
              : "Criar plano"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Planos cadastrados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Apenas planos ativos serão disponibilizados para a Recepção.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <BadgePercent
              size={34}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-bold text-slate-700">
              Nenhum plano cadastrado
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Crie o primeiro pacote de consultas usando o formulário acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {plans.map(
              (plan) => {
                const sessions =
                  getTotalSessions(
                    plan.items
                  );

                return (
                  <div
                    key={
                      plan.id
                    }
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {plan.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              plan.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {plan.active
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {plan.items
                            .map(
                              (item) =>
                                `${item.sessions}x ${item.specialty}`
                            )
                            .join(" • ")}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                          <span className="text-slate-500">
                            <strong className="text-slate-700">
                              {sessions}
                            </strong>{" "}
                            sessões
                          </span>

                          <span className="text-slate-500">
                            Normal:{" "}
                            <strong className="text-slate-700">
                              {formatCurrency(
                                plan.originalValue
                              )}
                            </strong>
                          </span>

                          <span className="text-slate-500">
                            Pacote:{" "}
                            <strong className="text-violet-700">
                              {formatCurrency(
                                plan.finalValue
                              )}
                            </strong>
                          </span>

                          <span className="text-slate-500">
                            Validade:{" "}
                            <strong className="text-slate-700">
                              {plan.validityDays} dias
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              plan
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit3
                            size={14}
                          />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(
                              plan
                            )
                          }
                          className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold ${
                            plan.active
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <Power
                            size={14}
                          />
                          {plan.active
                            ? "Inativar"
                            : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              plan
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2
                            size={14}
                          />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      <style>{`
        .package-input {
          width: 100%;
          min-height: 40px;
          border: 1px solid #dfe3ec;
          border-radius: 12px;
          background: #ffffff;
          padding-left: 12px;
          padding-right: 12px;
          color: #334155;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .package-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
        }
      `}</style>
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
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function Summary({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-violet-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}