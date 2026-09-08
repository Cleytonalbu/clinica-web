import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  Paperclip,
  Save,
  Send,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import {
  createEvolution,
  createStoredAttachments,
  updateEvolution,
  type StoredEvolutionAttachment,
} from "@/pages/Pacientes/evolutionStorage";

import {
  createDefaultAbaEvolutionData,
  type AbaEvolutionData,
  type AbaProgramsExecution,
  type AbaSupportLevel,
} from "./abaEvolution.types";

interface AbaEvolutionFormProps {
  patientId: number;
  unitId: number;
  professional: string;
  specialty?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  appointmentType?: string;
  appointmentLocation?: string;
  evolutionId?: number;
  initialData?: AbaEvolutionData;
  initialAttachments?: StoredEvolutionAttachment[];
  onSaved?: () => void;
}

const supportOptions: Array<{
  value: Exclude<
    AbaSupportLevel,
    ""
  >;
  label: string;
}> = [
  {
    value: "APOIO_TOTAL",
    label: "Apoio total",
  },
  {
    value: "APOIO_PARCIAL",
    label: "Apoio parcial",
  },
  {
    value: "INDEPENDENCIA",
    label: "Independência",
  },
];

const executionOptions: Array<{
  value: Exclude<
    AbaProgramsExecution,
    ""
  >;
  label: string;
}> = [
  {
    value:
      "TOTALMENTE_REALIZADOS",
    label:
      "Totalmente realizados",
  },
  {
    value:
      "PARCIALMENTE_REALIZADOS",
    label:
      "Parcialmente realizados",
  },
  {
    value:
      "NAO_REALIZADOS",
    label:
      "Não realizados",
  },
];

export function AbaEvolutionForm({
  patientId,
  unitId,
  professional,
  specialty = "ABA",
  sessionDate = "",
  startTime = "",
  endTime = "",
  appointmentType = "Individual",
  appointmentLocation = "Clinica",
  evolutionId,
  initialData,
  initialAttachments = [],
  onSaved,
}: AbaEvolutionFormProps) {
  const [
    data,
    setData,
  ] =
    useState<AbaEvolutionData>(
      () =>
        initialData ??
        createDefaultAbaEvolutionData()
    );

  const [
    date,
    setDate,
  ] =
    useState(
      sessionDate ||
        new Date()
          .toISOString()
          .slice(
            0,
            10
          )
    );

  const [
    initialTime,
    setInitialTime,
  ] =
    useState(
      startTime
    );

  const [
    finalTime,
    setFinalTime,
  ] =
    useState(
      endTime
    );

  const [
    responsibleProfessional,
    setResponsibleProfessional,
  ] =
    useState(
      professional
    );

  const [
    attachments,
    setAttachments,
  ] =
    useState<File[]>(
      []
    );

  const [
    existingAttachments,
    setExistingAttachments,
  ] =
    useState<StoredEvolutionAttachment[]>(
      initialAttachments
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      "success" |
      "error" |
      null
    >(
      null
    );

  const completedPrograms =
    useMemo(
      () =>
        data.programs.filter(
          (
            program
          ) =>
            Boolean(
              program.program.trim()
            )
        ).length,
      [
        data.programs,
      ]
    );

  function updateProgram(
    index: number,
    field:
      | "program"
      | "response",
    value: string
  ) {
    setData(
      (
        current
      ) => ({
        ...current,
        programs:
          current.programs.map(
            (
              item
            ) =>
              item.index ===
              index
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item
          ),
      })
    );

    clearFeedback();
  }

  function clearFeedback() {
    setFeedback(
      null
    );
    setFeedbackType(
      null
    );
  }

  function showError(
    message: string
  ) {
    setFeedback(
      message
    );
    setFeedbackType(
      "error"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validate(
    finalizing: boolean
  ) {
    if (
      !Number.isFinite(
        patientId
      ) ||
      patientId <=
        0
    ) {
      showError(
        "Paciente inválido."
      );
      return false;
    }

    if (
      !date
    ) {
      showError(
        "Informe a data da sessão."
      );
      return false;
    }

    if (
      !responsibleProfessional.trim()
    ) {
      showError(
        "Informe o profissional responsável."
      );
      return false;
    }

    if (
      !finalizing
    ) {
      return true;
    }

    if (
      !data.conditionEntry.trim()
    ) {
      showError(
        "Preencha a condição de entrada."
      );
      return false;
    }

    const filledPrograms =
      data.programs.filter(
        (
          program
        ) =>
          program.program.trim()
      );

    if (
      filledPrograms.length ===
      0
    ) {
      showError(
        "Preencha pelo menos um programa."
      );
      return false;
    }

    const withoutResponse =
      filledPrograms.find(
        (
          program
        ) =>
          !program.response
      );

    if (
      withoutResponse
    ) {
      showError(
        `Selecione a resposta do Programa ${withoutResponse.index}.`
      );
      return false;
    }

    if (
      !data.programsExecution
    ) {
      showError(
        "Informe como ocorreu a execução dos programas."
      );
      return false;
    }

    if (
      !data.conclusion.trim()
    ) {
      showError(
        "Preencha a conclusão da evolução."
      );
      return false;
    }

    return true;
  }

  async function persist(
    status:
      | "RASCUNHO"
      | "FINALIZADA"
  ) {
    if (
      !validate(
        status ===
          "FINALIZADA"
      )
    ) {
      return;
    }

    setSaving(
      true
    );

    try {
      const payload = {
        patientId,
        unitId,
        evolutionType:
          "ABA" as const,
        abaData:
          data,
        sessionDate:
          date,
        startTime:
          initialTime,
        endTime:
          finalTime,
        specialty:
          specialty ||
          "ABA",
        appointmentType,
        appointmentLocation,
        writtenEvolution:
          data.conclusion,
        attachments: [
          ...existingAttachments,
          ...createStoredAttachments(
            attachments
          ),
        ],
        professional:
          responsibleProfessional,
        status,
      };

      const stored =
        evolutionId
          ? updateEvolution(
              evolutionId,
              payload
            )
          : createEvolution(
              payload
            );

      if (stored) {
        setExistingAttachments(
          stored.attachments
        );
        setAttachments([]);
      }

      setFeedback(
        status ===
          "FINALIZADA"
          ? "Evolução Diária - ABA finalizada com sucesso."
          : "Rascunho da Evolução Diária - ABA salvo com sucesso."
      );

      setFeedbackType(
        "success"
      );

      if (
        status ===
        "FINALIZADA"
      ) {
        onSaved?.();
      }
    } catch (
      error
    ) {
      showError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível salvar a Evolução Diária - ABA."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedbackType ===
            "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {
            feedback
          }
        </div>
      )}

      <PageCard
        title="Dados da Sessão"
        description="Informações básicas do atendimento referente à Evolução Diária - ABA."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Data da sessão"
            required
          >
            <Input
              type="date"
              value={
                date
              }
              onChange={(
                event
              ) => {
                setDate(
                  event.target.value
                );
                clearFeedback();
              }}
            />
          </FormField>

          <FormField label="Horário inicial">
            <Input
              type="time"
              value={
                initialTime
              }
              onChange={(
                event
              ) => {
                setInitialTime(
                  event.target.value
                );
                clearFeedback();
              }}
            />
          </FormField>

          <FormField label="Horário final">
            <Input
              type="time"
              value={
                finalTime
              }
              onChange={(
                event
              ) => {
                setFinalTime(
                  event.target.value
                );
                clearFeedback();
              }}
            />
          </FormField>

          <FormField
            label="Profissional responsável"
            required
          >
            <Input
              value={
                responsibleProfessional
              }
              onChange={(
                event
              ) => {
                setResponsibleProfessional(
                  event.target.value
                );
                clearFeedback();
              }}
              placeholder="Nome do profissional"
            />
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Condição de Entrada"
        description="Estado emocional, comportamento, disposição e interação no início da sessão."
      >
        <textarea
          value={
            data.conditionEntry
          }
          onChange={(
            event
          ) => {
            setData(
              (
                current
              ) => ({
                ...current,
                conditionEntry:
                  event.target.value,
              })
            );
            clearFeedback();
          }}
          placeholder="Descreva a condição de entrada do paciente..."
          className="min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </PageCard>

      <PageCard
        title="Programas"
        description={`${completedPrograms} de 9 programas preenchidos. Em cada programa, escolha apenas um nível de apoio.`}
      >
        <div className="space-y-5">
          {data.programs.map(
            (
              item
            ) => (
              <div
                key={
                  item.index
                }
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <FormField
                  label={`Programa ${item.index}`}
                >
                  <Input
                    value={
                      item.program
                    }
                    onChange={(
                      event
                    ) =>
                      updateProgram(
                        item.index,
                        "program",
                        event.target.value
                      )
                    }
                    placeholder={`Descrição do programa ${item.index}`}
                  />
                </FormField>

                <div className="mt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Resposta {item.index}
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {supportOptions.map(
                      (
                        option
                      ) => {
                        const selected =
                          item.response ===
                          option.value;

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={
                              () =>
                                updateProgram(
                                  item.index,
                                  "response",
                                  option.value
                                )
                            }
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                              selected
                                ? "border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && (
                                <CheckCircle2
                                  size={
                                    13
                                  }
                                />
                              )}
                            </span>

                            {
                              option.label
                            }
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Execução dos Programas"
        description="Informe o resultado geral da execução dos programas trabalhados na sessão."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {executionOptions.map(
            (
              option
            ) => {
              const selected =
                data.programsExecution ===
                option.value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={
                    () => {
                      setData(
                        (
                          current
                        ) => ({
                          ...current,
                          programsExecution:
                            option.value,
                        })
                      );
                      clearFeedback();
                    }
                  }
                  className={`rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    selected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                  }`}
                >
                  {
                    option.label
                  }
                </button>
              );
            }
          )}
        </div>
      </PageCard>

      <PageCard
        title="Observações Adicionais"
        description="Registre informações importantes do atendimento que não se encaixam nos campos anteriores."
      >
        <textarea
          value={
            data.additionalObservations
          }
          onChange={(
            event
          ) => {
            setData(
              (
                current
              ) => ({
                ...current,
                additionalObservations:
                  event.target.value,
              })
            );
            clearFeedback();
          }}
          placeholder="Observações adicionais..."
          className="min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </PageCard>

      <PageCard
        title="Conclusão"
        description="Como a sessão terminou e qual foi o resultado geral do atendimento."
      >
        <textarea
          value={
            data.conclusion
          }
          onChange={(
            event
          ) => {
            setData(
              (
                current
              ) => ({
                ...current,
                conclusion:
                  event.target.value,
              })
            );
            clearFeedback();
          }}
          placeholder="Descreva a conclusão da sessão..."
          className="min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </PageCard>

      <PageCard
        title="Anexos"
        description="Anexe documentos, imagens ou outros arquivos relacionados à evolução."
      >
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
          <Paperclip
            size={
              24
            }
            className="text-indigo-500"
          />

          <span className="mt-2 text-sm font-semibold text-slate-700">
            Selecionar arquivos
          </span>

          <span className="mt-1 text-xs text-slate-500">
            É possível selecionar mais de um arquivo.
          </span>

          <input
            type="file"
            multiple
            className="hidden"
            onChange={(
              event
            ) => {
              setAttachments(
                Array.from(
                  event.target.files ??
                  []
                )
              );
              clearFeedback();
            }}
          />
        </label>

        {existingAttachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Anexos já salvos
            </p>

            {existingAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <FileText size={17} className="text-indigo-500" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                  {attachment.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {attachments.length >
          0 && (
          <div className="mt-4 space-y-2">
            {attachments.map(
              (
                file,
                index
              ) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <FileText
                    size={
                      17
                    }
                    className="text-indigo-500"
                  />

                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {
                      file.name
                    }
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </PageCard>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Evolução Diária - ABA
          </p>

          <p className="mt-1 text-xs text-slate-500">
            O rascunho pode ser salvo antes da finalização.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={
              saving
            }
            onClick={
              () =>
                persist(
                  "RASCUNHO"
                )
            }
          >
            <Save
              size={
                17
              }
            />

            {saving
              ? "Salvando..."
              : "Salvar rascunho"}
          </Button>

          <Button
            type="button"
            disabled={
              saving
            }
            onClick={
              () =>
                persist(
                  "FINALIZADA"
                )
            }
          >
            <Send
              size={
                17
              }
            />

            {saving
              ? "Finalizando..."
              : "Finalizar evolução"}
          </Button>
        </div>
      </div>
    </div>
  );
}
