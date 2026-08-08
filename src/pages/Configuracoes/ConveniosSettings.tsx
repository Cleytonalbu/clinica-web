import {
  useState,
} from "react";

import {
  Building2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  Select,
} from "@/components/ui";

import type {
  ConvenioSetting,
  SpecialtySetting,
} from "./settingsStorage";

interface Props {
  convenios: ConvenioSetting[];

  specialties: SpecialtySetting[];

  onChange: (
    convenios: ConvenioSetting[]
  ) => void;
}

export default function ConveniosSettings({
  convenios,
  specialties,
  onChange,
}: Props) {
  const [
    newName,
    setNewName,
  ] =
    useState("");

  const [
    newDiscount,
    setNewDiscount,
  ] =
    useState("20");

  function addConvenio() {
    const name =
      newName.trim();

    if (!name) {
      return;
    }

    const exists =
      convenios.some(
        (
          item
        ) =>
          item.name
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (
      exists
    ) {
      return;
    }

    onChange([
      ...convenios,

      {
        id:
          Date.now(),

        name,

        active:
          true,

        discountPercent:
          Number(
            newDiscount
          ) || 0,

        specialtyValues:
          {},
      },
    ]);

    setNewName(
      ""
    );

    setNewDiscount(
      "20"
    );
  }

  function updateConvenio(
    id: number,
    data: Partial<ConvenioSetting>
  ) {
    onChange(
      convenios.map(
        (
          convenio
        ) =>
          convenio.id ===
          id
            ? {
                ...convenio,
                ...data,
              }
            : convenio
      )
    );
  }

  function updateSpecialtyValue(
    convenioId: number,
    specialtyName: string,
    value: string
  ) {
    const numericValue =
      Number(
        value
      );

    onChange(
      convenios.map(
        (
          convenio
        ) => {
          if (
            convenio.id !==
            convenioId
          ) {
            return convenio;
          }

          const nextValues = {
            ...convenio.specialtyValues,
          };

          if (
            !value ||
            numericValue <=
              0
          ) {
            delete nextValues[
              specialtyName
            ];
          } else {
            nextValues[
              specialtyName
            ] =
              numericValue;
          }

          return {
            ...convenio,

            specialtyValues:
              nextValues,
          };
        }
      )
    );
  }

  function removeConvenio(
    id: number
  ) {
    onChange(
      convenios.filter(
        (
          convenio
        ) =>
          convenio.id !==
          id
      )
    );
  }

  return (
    <div className="space-y-4">
      {convenios.map(
        (
          convenio
        ) => (
          <div
            key={
              convenio.id
            }
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
              <FormField label="Convênio">
                <Input
                  value={
                    convenio.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateConvenio(
                      convenio.id,
                      {
                        name:
                          event.target.value,
                      }
                    )
                  }
                />
              </FormField>

              <FormField label="Desconto padrão (%)">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    convenio.discountPercent
                  }
                  onChange={(
                    event
                  ) =>
                    updateConvenio(
                      convenio.id,
                      {
                        discountPercent:
                          Number(
                            event.target.value
                          ) || 0,
                      }
                    )
                  }
                />
              </FormField>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateConvenio(
                      convenio.id,
                      {
                        active:
                          !convenio.active,
                      }
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    convenio.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {convenio.active
                    ? "Ativo"
                    : "Inativo"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeConvenio(
                      convenio.id
                    )
                  }
                  className="rounded-xl border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2
                    size={17}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm font-semibold text-slate-800">
                Valores específicos por especialidade
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Se deixar vazio, será aplicado o desconto padrão acima.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {specialties.map(
                  (
                    specialty
                  ) => (
                    <FormField
                      key={
                        specialty.id
                      }
                      label={
                        specialty.name
                      }
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          convenio
                            .specialtyValues[
                            specialty.name
                          ] ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateSpecialtyValue(
                            convenio.id,
                            specialty.name,
                            event.target.value
                          )
                        }
                        placeholder={`Padrão: ${convenio.discountPercent}% desc.`}
                      />
                    </FormField>
                  )
                )}
              </div>
            </div>
          </div>
        )
      )}

      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5">
        <div className="mb-4 flex items-center gap-2 text-indigo-700">
          <Building2
            size={18}
          />

          <p className="font-semibold">
            Novo convênio
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
          <FormField label="Nome">
            <Input
              value={
                newName
              }
              onChange={(
                event
              ) =>
                setNewName(
                  event.target.value
                )
              }
              placeholder="Ex.: Cassi"
            />
          </FormField>

          <FormField label="Desconto padrão (%)">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={
                newDiscount
              }
              onChange={(
                event
              ) =>
                setNewDiscount(
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={
                addConvenio
              }
            >
              <Plus
                size={17}
              />

              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}