import {
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  EvolutionModelFields,
  EvolutionModelSetting,
  SpecialtySetting,
} from "./settingsStorage";

interface Props {
  models:
    EvolutionModelSetting[];

  specialties:
    SpecialtySetting[];

  modelName:
    string;

  modelSpecialty:
    string;

  modelDescription:
    string;

  modelFields:
    EvolutionModelFields;

  onModelNameChange:
    (
      value: string
    ) => void;

  onModelSpecialtyChange:
    (
      value: string
    ) => void;

  onModelDescriptionChange:
    (
      value: string
    ) => void;

  onModelFieldsChange:
    (
      fields: EvolutionModelFields
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id: number,
      data:
        Partial<EvolutionModelSetting>
    ) => void;

  onToggle:
    (
      id: number
    ) => void;

  onRemove:
    (
      id: number
    ) => void;
}

const fieldLabels: {
  key:
    keyof EvolutionModelFields;

  title:
    string;

  description:
    string;
}[] = [
  {
    key:
      "writtenEvolution",

    title:
      "Evolução escrita",

    description:
      "Campo principal para descrição clínica da sessão.",
  },

  {
    key:
      "therapeuticObjectives",

    title:
      "Objetivos trabalhados",

    description:
      "Permite selecionar objetivos do plano terapêutico.",
  },

  {
    key:
      "activitiesPerformed",

    title:
      "Atividades realizadas",

    description:
      "Registra técnicas, tarefas ou atividades executadas.",
  },

  {
    key:
      "patientResponse",

    title:
      "Resposta do paciente",

    description:
      "Registra participação e resposta durante a sessão.",
  },

  {
    key:
      "observedImpacts",

    title:
      "Impactos observados",

    description:
      "Permite registrar efeitos ou mudanças observadas.",
  },

  {
    key:
      "generalResult",

    title:
      "Resultado geral",

    description:
      "Classificação geral do resultado da sessão.",
  },

  {
    key:
      "clinicalObservation",

    title:
      "Observação clínica",

    description:
      "Campo adicional para observações profissionais.",
  },

  {
    key:
      "guidanceToFamily",

    title:
      "Orientações à família",

    description:
      "Permite registrar orientações aos responsáveis.",
  },

  {
    key:
      "referrals",

    title:
      "Encaminhamentos",

    description:
      "Permite encaminhar o paciente para outro profissional.",
  },

  {
    key:
      "attachments",

    title:
      "Anexos",

    description:
      "Permite adicionar arquivos ou documentos à evolução.",
  },

  {
    key:
      "nextSessionPlan",

    title:
      "Plano para próxima sessão",

    description:
      "Campo para planejamento da próxima intervenção.",
  },
];

export default function EvolutionModelsSettingsSection({
  models,
  specialties,

  modelName,
  modelSpecialty,
  modelDescription,
  modelFields,

  onModelNameChange,
  onModelSpecialtyChange,
  onModelDescriptionChange,
  onModelFieldsChange,

  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: Props) {
  const activeModels =
    models.filter(
      (
        model
      ) =>
        model.active
    ).length;

  const inactiveModels =
    models.length -
    activeModels;

  const activeSpecialties =
    specialties.filter(
      (
        specialty
      ) =>
        specialty.active
    );

  const specialtiesWithModel =
    new Set(
      models
        .filter(
          (
            model
          ) =>
            model.active
        )
        .map(
          (
            model
          ) =>
            model.specialty
        )
    ).size;

  function updateNewField(
    field:
      keyof EvolutionModelFields
  ) {
    onModelFieldsChange({
      ...modelFields,

      [field]:
        !modelFields[
          field
        ],
    });
  }

  function updateExistingField(
    model:
      EvolutionModelSetting,
    field:
      keyof EvolutionModelFields
  ) {
    onUpdate(
      model.id,
      {
        fields: {
          ...model.fields,

          [field]:
            !model.fields[
              field
            ],
        },
      }
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Modelos cadastrados"
          value={String(
            models.length
          )}
        />

        <SummaryCard
          title="Modelos ativos"
          value={String(
            activeModels
          )}
        />

        <SummaryCard
          title="Especialidades cobertas"
          value={String(
            specialtiesWithModel
          )}
        />

        <SummaryCard
          title="Inativos"
          value={String(
            inactiveModels
          )}
        />
      </div>

      <PageCard
        title="Modelos de Evolução"
        description="Configure quais campos estarão disponíveis durante o registro das evoluções clínicas."
      >
        {models.length >
        0 ? (
          <div className="space-y-5">
            {models.map(
              (
                model
              ) => (
                <div
                  key={
                    model.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
                >
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr_150px_auto]">
                    <FormField
                      label="Nome do modelo"
                    >
                      <Input
                        value={
                          model.name
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdate(
                            model.id,
                            {
                              name:
                                event.target.value,
                            }
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Especialidade"
                    >
                      <Select
                        value={
                          model.specialty
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdate(
                            model.id,
                            {
                              specialty:
                                event.target.value,
                            }
                          )
                        }
                      >
                        {specialties.map(
                          (
                            specialty
                          ) => (
                            <option
                              key={
                                specialty.id
                              }
                              value={
                                specialty.name
                              }
                            >
                              {
                                specialty.name
                              }

                              {!specialty.active
                                ? " - inativa"
                                : ""}
                            </option>
                          )
                        )}
                      </Select>
                    </FormField>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Status
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          onToggle(
                            model.id
                          )
                        }
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                          model.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {model.active
                          ? "Ativo"
                          : "Inativo"}
                      </button>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          onRemove(
                            model.id
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                        title="Excluir modelo"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <FormField
                      label="Descrição"
                    >
                      <textarea
                        value={
                          model.description
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdate(
                            model.id,
                            {
                              description:
                                event.target.value,
                            }
                          )
                        }
                        className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </FormField>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Campos do modelo
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Ative somente os blocos necessários para esta especialidade.
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {fieldLabels.map(
                        (
                          field
                        ) => (
                          <FieldToggle
                            key={
                              field.key
                            }

                            title={
                              field.title
                            }

                            description={
                              field.description
                            }

                            checked={
                              model.fields[
                                field.key
                              ]
                            }

                            onChange={() =>
                              updateExistingField(
                                model,
                                field.key
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <ClipboardList
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-700">
              Nenhum modelo de evolução cadastrado
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Crie o primeiro modelo abaixo.
            </p>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Novo Modelo de Evolução"
        description="Crie um modelo específico para uma especialidade."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Nome do modelo"
            required
          >
            <Input
              value={
                modelName
              }
              onChange={(
                event
              ) =>
                onModelNameChange(
                  event.target.value
                )
              }
              placeholder="Ex.: Evolução Padrão - Psicologia"
            />
          </FormField>

          <FormField
            label="Especialidade"
            required
          >
            <Select
              value={
                modelSpecialty
              }
              onChange={(
                event
              ) =>
                onModelSpecialtyChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione
              </option>

              {activeSpecialties.map(
                (
                  specialty
                ) => (
                  <option
                    key={
                      specialty.id
                    }
                    value={
                      specialty.name
                    }
                  >
                    {
                      specialty.name
                    }
                  </option>
                )
              )}
            </Select>
          </FormField>
        </div>

        <div className="mt-5">
          <FormField
            label="Descrição"
          >
            <textarea
              value={
                modelDescription
              }
              onChange={(
                event
              ) =>
                onModelDescriptionChange(
                  event.target.value
                )
              }
              maxLength={500}
              placeholder="Descreva quando este modelo deverá ser utilizado..."
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </FormField>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-slate-900">
            Campos da Evolução
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Escolha quais blocos estarão disponíveis quando este modelo for utilizado.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fieldLabels.map(
              (
                field
              ) => (
                <FieldToggle
                  key={
                    field.key
                  }

                  title={
                    field.title
                  }

                  description={
                    field.description
                  }

                  checked={
                    modelFields[
                      field.key
                    ]
                  }

                  onChange={() =>
                    updateNewField(
                      field.key
                    )
                  }
                />
              )
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={
              onAdd
            }
          >
            <Plus
              size={17}
            />

            Adicionar modelo
          </Button>
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <ClipboardList
            size={21}
            className="mt-0.5 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Integração com Evoluções
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Posteriormente, ao iniciar uma evolução, o sistema poderá identificar a especialidade do profissional e carregar automaticamente o modelo correspondente.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function FieldToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onChange
      }
      className={`flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition ${
        checked
          ? "border-indigo-200 bg-indigo-50/60"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            checked
              ? "text-indigo-800"
              : "text-slate-800"
          }`}
        >
          {
            title
          }
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {
            description
          }
        </p>
      </div>

      <span
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {
          value
        }
      </p>
    </div>
  );
}