import {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
  Crown,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import {
  createClinicUnit,
  getClinicUnits,
  removeClinicUnit,
  setClinicUnitActive,
  setMainClinicUnit,
  updateClinicUnit,
  type ClinicUnit,
} from "./clinicUnitStorage";

import {
  useUnit,
} from "@/providers/UnitContext";

interface UnitFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

const emptyForm: UnitFormData = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "PB",
  phone: "",
};

export default function ClinicUnitsSettingsSection({
  onFeedback,
}: {
  onFeedback:
    (
      message: string
    ) => void;
}) {
  const {
    activeUnitId,
    refreshUnits,
  } =
    useUnit();

  const [
    unitsVersion,
    setUnitsVersion,
  ] =
    useState(
      0
    );

  const [
    editingUnitId,
    setEditingUnitId,
  ] =
    useState<
      number |
      null
    >(
      null
    );

  const [
    formData,
    setFormData,
  ] =
    useState<UnitFormData>(
      emptyForm
    );

  const units =
    useMemo(
      () =>
        getClinicUnits(),
      [
        unitsVersion,
      ]
    );

  function refresh() {
    setUnitsVersion(
      (
        current
      ) =>
        current +
        1
    );

    refreshUnits();
  }

  function updateField<
    K extends keyof UnitFormData
  >(
    field: K,
    value: UnitFormData[K]
  ) {
    setFormData(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }

  function resetForm() {
    setEditingUnitId(
      null
    );

    setFormData(
      emptyForm
    );
  }

  function handleEdit(
    unit: ClinicUnit
  ) {
    setEditingUnitId(
      unit.id
    );

    setFormData({
      name:
        unit.name,
      code:
        unit.code,
      address:
        unit.address,
      city:
        unit.city,
      state:
        unit.state,
      phone:
        unit.phone,
    });

    window.scrollTo({
      top:
        0,
      behavior:
        "smooth",
    });
  }

  function handleSaveUnit() {
    try {
      if (
        editingUnitId !==
        null
      ) {
        updateClinicUnit(
          editingUnitId,
          {
            name:
              formData.name,
            code:
              formData.code,
            address:
              formData.address,
            city:
              formData.city,
            state:
              formData.state,
            phone:
              formData.phone,
          }
        );

        onFeedback(
          "Unidade atualizada com sucesso."
        );
      } else {
        createClinicUnit({
          name:
            formData.name,
          code:
            formData.code,
          address:
            formData.address,
          city:
            formData.city,
          state:
            formData.state,
          phone:
            formData.phone,
          active:
            true,
        });

        onFeedback(
          "Unidade cadastrada com sucesso."
        );
      }

      resetForm();
      refresh();
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível salvar a unidade."
      );
    }
  }

  function handleToggle(
    unit: ClinicUnit
  ) {
    try {
      setClinicUnitActive(
        unit.id,
        !unit.active
      );

      onFeedback(
        unit.active
          ? "Unidade desativada."
          : "Unidade ativada."
      );

      refresh();
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível alterar o status da unidade."
      );
    }
  }

  function handleSetMain(
    unit: ClinicUnit
  ) {
    try {
      setMainClinicUnit(
        unit.id
      );

      onFeedback(
        `${unit.name} definida como Unidade Principal.`
      );

      refresh();
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível definir a unidade principal."
      );
    }
  }

  function handleRemove(
    unit: ClinicUnit
  ) {
    if (
      unit.isMain
    ) {
      onFeedback(
        "A Unidade Principal não pode ser removida."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente remover a unidade "${unit.name}"?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      removeClinicUnit(
        unit.id
      );

      if (
        editingUnitId ===
        unit.id
      ) {
        resetForm();
      }

      onFeedback(
        "Unidade removida com sucesso."
      );

      refresh();
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível remover a unidade."
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageCard
        title={
          editingUnitId !==
          null
            ? "Editar Unidade"
            : "Nova Unidade"
        }
        description="Cadastre as unidades da clínica. As unidades ativas ficam disponíveis no seletor superior do sistema."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Nome da unidade"
            required
          >
            <Input
              value={
                formData.name
              }
              onChange={(
                event
              ) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Ex.: Unidade Centro"
            />
          </FormField>

          <FormField
            label="Código"
          >
            <Input
              value={
                formData.code
              }
              onChange={(
                event
              ) =>
                updateField(
                  "code",
                  event.target.value
                )
              }
              placeholder="Ex.: UNIDADE-CENTRO"
            />
          </FormField>

          <FormField
            label="Endereço"
          >
            <Input
              value={
                formData.address
              }
              onChange={(
                event
              ) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
              placeholder="Rua, número, bairro"
            />
          </FormField>

          <FormField
            label="Cidade"
          >
            <Input
              value={
                formData.city
              }
              onChange={(
                event
              ) =>
                updateField(
                  "city",
                  event.target.value
                )
              }
              placeholder="Cidade"
            />
          </FormField>

          <FormField
            label="Estado"
          >
            <Input
              value={
                formData.state
              }
              onChange={(
                event
              ) =>
                updateField(
                  "state",
                  event.target.value
                    .toUpperCase()
                    .slice(
                      0,
                      2
                    )
                )
              }
              placeholder="PB"
            />
          </FormField>

          <FormField
            label="Telefone"
          >
            <Input
              value={
                formData.phone
              }
              onChange={(
                event
              ) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
              placeholder="(83) 99999-9999"
            />
          </FormField>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {editingUnitId !==
            null && (
            <Button
              type="button"
              variant="outline"
              onClick={
                resetForm
              }
            >
              <X
                size={
                  17
                }
              />

              Cancelar edição
            </Button>
          )}

          <Button
            type="button"
            onClick={
              handleSaveUnit
            }
            disabled={
              !formData.name.trim()
            }
          >
            {editingUnitId !==
            null ? (
              <Pencil
                size={
                  17
                }
              />
            ) : (
              <Plus
                size={
                  17
                }
              />
            )}

            {editingUnitId !==
            null
              ? "Salvar unidade"
              : "Adicionar unidade"}
          </Button>
        </div>
      </PageCard>

      <PageCard
        title="Unidades Cadastradas"
        description="Gerencie as unidades que podem ser utilizadas no sistema."
      >
        <div className="space-y-4">
          {units.map(
            (
              unit
            ) => (
              <div
                key={
                  unit.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        unit.active
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Building2
                        size={
                          22
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {
                            unit.name
                          }
                        </p>

                        {unit.isMain && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <Crown
                              size={
                                13
                              }
                            />

                            Principal
                          </span>
                        )}

                        {unit.id ===
                          activeUnitId && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2
                              size={
                                13
                              }
                            />

                            Unidade atual
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            unit.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {
                            unit.active
                              ? "Ativa"
                              : "Inativa"
                          }
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Código:{" "}
                        <span className="font-medium text-slate-700">
                          {
                            unit.code
                          }
                        </span>
                      </p>

                      {(unit.address ||
                        unit.city ||
                        unit.state) && (
                        <p className="mt-1 text-sm text-slate-500">
                          {[
                            unit.address,
                            unit.city,
                            unit.state,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              " • "
                            )}
                        </p>
                      )}

                      {unit.phone && (
                        <p className="mt-1 text-sm text-slate-500">
                          {
                            unit.phone
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        () =>
                          handleEdit(
                            unit
                          )
                      }
                    >
                      <Pencil
                        size={
                          16
                        }
                      />

                      Editar
                    </Button>

                    {!unit.isMain &&
                      unit.active && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={
                          () =>
                            handleSetMain(
                              unit
                            )
                        }
                      >
                        <Crown
                          size={
                            16
                          }
                        />

                        Tornar principal
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        () =>
                          handleToggle(
                            unit
                          )
                      }
                    >
                      <Power
                        size={
                          16
                        }
                      />

                      {unit.active
                        ? "Desativar"
                        : "Ativar"}
                    </Button>

                    {!unit.isMain && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={
                          () =>
                            handleRemove(
                              unit
                            )
                        }
                      >
                        <Trash2
                          size={
                            16
                          }
                        />

                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>
    </div>
  );
}