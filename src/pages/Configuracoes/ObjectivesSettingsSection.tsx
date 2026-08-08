import {
  Plus,
  Target,
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
  SpecialtySetting,
  TherapeuticObjectiveSetting,
} from "./settingsStorage";

interface Props {
  objectives:
    TherapeuticObjectiveSetting[];

  specialties:
    SpecialtySetting[];

  objectiveName:
    string;

  objectiveCategory:
    string;

  objectiveSpecialty:
    string;

  objectiveDescription:
    string;

  onObjectiveNameChange:
    (
      value: string
    ) => void;

  onObjectiveCategoryChange:
    (
      value: string
    ) => void;

  onObjectiveSpecialtyChange:
    (
      value: string
    ) => void;

  onObjectiveDescriptionChange:
    (
      value: string
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id: number,
      data:
        Partial<TherapeuticObjectiveSetting>
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

export default function ObjectivesSettingsSection({
  objectives,
  specialties,

  objectiveName,
  objectiveCategory,
  objectiveSpecialty,
  objectiveDescription,

  onObjectiveNameChange,
  onObjectiveCategoryChange,
  onObjectiveSpecialtyChange,
  onObjectiveDescriptionChange,

  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: Props) {
  const activeCount =
    objectives.filter(
      (objective) =>
        objective.active
    ).length;

  const inactiveCount =
    objectives.length -
    activeCount;

  const categoriesCount =
    new Set(
      objectives
        .map(
          (objective) =>
            objective.category.trim()
        )
        .filter(Boolean)
    ).size;

  const activeSpecialties =
    specialties.filter(
      (specialty) =>
        specialty.active
    );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Objetivos cadastrados"
          value={String(
            objectives.length
          )}
        />

        <SummaryCard
          title="Objetivos ativos"
          value={String(
            activeCount
          )}
        />

        <SummaryCard
          title="Categorias"
          value={String(
            categoriesCount
          )}
        />

        <SummaryCard
          title="Inativos"
          value={String(
            inactiveCount
          )}
        />
      </div>

      <PageCard
        title="Objetivos Terapêuticos"
        description="Crie modelos de objetivos que poderão ser utilizados pelos profissionais nos planos terapêuticos."
      >
        {objectives.length >
        0 ? (
          <div className="space-y-4">
            {objectives.map(
              (
                objective
              ) => {
                const specialty =
                  specialties.find(
                    (item) =>
                      item.name ===
                      objective.specialty
                  );

                return (
                  <div
                    key={
                      objective.id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
                  >
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr_140px_auto]">
                      <FormField label="Objetivo">
                        <Input
                          value={
                            objective.name
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdate(
                              objective.id,
                              {
                                name:
                                  event.target.value,
                              }
                            )
                          }
                        />
                      </FormField>

                      <FormField label="Categoria">
                        <Input
                          value={
                            objective.category
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdate(
                              objective.id,
                              {
                                category:
                                  event.target.value,
                              }
                            )
                          }
                          placeholder="Ex.: Comunicação"
                        />
                      </FormField>

                      <FormField label="Especialidade">
                        <Select
                          value={
                            objective.specialty
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdate(
                              objective.id,
                              {
                                specialty:
                                  event.target.value,
                              }
                            )
                          }
                        >
                          {specialties.map(
                            (
                              item
                            ) => (
                              <option
                                key={
                                  item.id
                                }
                                value={
                                  item.name
                                }
                              >
                                {
                                  item.name
                                }

                                {!item.active
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
                              objective.id
                            )
                          }
                          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            objective.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {objective.active
                            ? "Ativo"
                            : "Inativo"}
                        </button>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            onRemove(
                              objective.id
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                          title="Excluir objetivo"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <FormField label="Descrição">
                        <textarea
                          value={
                            objective.description
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdate(
                              objective.id,
                              {
                                description:
                                  event.target.value,
                              }
                            )
                          }
                          maxLength={500}
                          className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </FormField>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {
                          objective.specialty
                        }
                      </span>

                      {objective.category && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {
                            objective.category
                          }
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          objective.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {objective.active
                          ? "Disponível para profissionais"
                          : "Indisponível"}
                      </span>

                      {specialty &&
                        !specialty.active && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Especialidade inativa
                          </span>
                        )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <Target
              size={36}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-700">
              Nenhum objetivo terapêutico cadastrado
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Utilize o formulário abaixo para criar o primeiro modelo.
            </p>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Novo Objetivo Terapêutico"
        description="Cadastre um modelo que ficará disponível para os profissionais."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            label="Nome do objetivo"
            required
          >
            <Input
              value={
                objectiveName
              }
              onChange={(
                event
              ) =>
                onObjectiveNameChange(
                  event.target.value
                )
              }
              placeholder="Ex.: Comunicação funcional"
            />
          </FormField>

          <FormField
            label="Categoria"
            required
          >
            <Input
              value={
                objectiveCategory
              }
              onChange={(
                event
              ) =>
                onObjectiveCategoryChange(
                  event.target.value
                )
              }
              placeholder="Ex.: Comunicação"
            />
          </FormField>

          <FormField
            label="Especialidade"
            required
          >
            <Select
              value={
                objectiveSpecialty
              }
              onChange={(
                event
              ) =>
                onObjectiveSpecialtyChange(
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
          <FormField label="Descrição">
            <textarea
              value={
                objectiveDescription
              }
              onChange={(
                event
              ) =>
                onObjectiveDescriptionChange(
                  event.target.value
                )
              }
              maxLength={500}
              placeholder="Descreva de forma resumida o objetivo terapêutico..."
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {
                objectiveDescription.length
              }
              /500
            </p>
          </FormField>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={
              onAdd
            }
          >
            <Plus
              size={17}
            />

            Adicionar objetivo
          </Button>
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <Target
            size={21}
            className="mt-0.5 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Biblioteca de objetivos
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Os objetivos ativos ficarão disponíveis para os profissionais selecionarem durante a criação do Plano Terapêutico. Posteriormente eles também serão utilizados na Nova Evolução para registrar o desempenho do paciente.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;

  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}