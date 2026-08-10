import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Lock,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  ScheduleBlock,
} from "./ScheduleBlocksView";

import {
  saveBlock,
} from "./blockStorage";

import {
  checkScheduleConflict,
} from "./scheduleValidation";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

type BlockType =
  ScheduleBlock["type"];

interface BlockFormData {
  professional: string;

  date: string;

  startTime: string;

  endTime: string;

  type: BlockType;

  reason: string;
}

/* =========================================
   VALORES INICIAIS
========================================= */

const initialValues: BlockFormData = {
  professional:
    "",

  date:
    "",

  startTime:
    "",

  endTime:
    "",

  type:
    "Indisponível",

  reason:
    "",
};

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export default function NovoBloqueio() {
  const navigate =
    useNavigate();

  /* =======================================
     PROFISSIONAIS ATIVOS
  ======================================= */

  const activeProfessionals =
    useMemo(
      () =>
        getActiveProfessionals(),

      []
    );

  /* =======================================
     FORMULÁRIO
  ======================================= */

  const [
    formData,
    setFormData,
  ] =
    useState<BlockFormData>(
      initialValues
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
      | "success"
      | "error"
      | null
    >(
      null
    );

  /* =======================================
     PROFISSIONAL SELECIONADO
  ======================================= */

  const selectedProfessional =
    useMemo(
      () =>
        activeProfessionals.find(
          (
            professional
          ) =>
            professional.name ===
            formData.professional
        ),

      [
        activeProfessionals,

        formData.professional,
      ]
    );

  /* =======================================
     CONFLITO
  ======================================= */

  const conflict =
    useMemo(
      () => {
        if (
          !formData.professional ||
          !formData.date ||
          !formData.startTime ||
          !formData.endTime
        ) {
          return null;
        }

        return checkScheduleConflict(
          {
            professional:
              formData.professional,

            date:
              formData.date,

            startTime:
              formData.startTime,

            endTime:
              formData.endTime,
          }
        );
      },

      [
        formData.professional,

        formData.date,

        formData.startTime,

        formData.endTime,
      ]
    );

  /* =======================================
     ATUALIZAR CAMPO
  ======================================= */

  function updateField<
    K extends keyof BlockFormData
  >(
    field: K,

    value:
      BlockFormData[K]
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

    clearFeedback();
  }

  /* =======================================
     LIMPAR FEEDBACK
  ======================================= */

  function clearFeedback() {
    setFeedback(
      null
    );

    setFeedbackType(
      null
    );
  }

  /* =======================================
     ERRO
  ======================================= */

  function showError(
    message: string
  ) {
    setFeedback(
      message
    );

    setFeedbackType(
      "error"
    );
  }

  /* =======================================
     CANCELAR
  ======================================= */

  function handleCancel() {
    navigate(
      "/agenda"
    );
  }

  /* =======================================
     VALIDAR
  ======================================= */

  function validate() {
    if (
      !formData.professional
    ) {
      showError(
        "Selecione o profissional."
      );

      return false;
    }

    if (
      !formData.date
    ) {
      showError(
        "Informe a data do bloqueio."
      );

      return false;
    }

    if (
      !formData.startTime ||
      !formData.endTime
    ) {
      showError(
        "Informe o horário inicial e o horário final."
      );

      return false;
    }

    if (
      formData.startTime >=
      formData.endTime
    ) {
      showError(
        "O horário final deve ser posterior ao horário inicial."
      );

      return false;
    }

    if (
      conflict
    ) {
      showError(
        conflict.description
      );

      return false;
    }

    return true;
  }

  /* =======================================
     SALVAR
  ======================================= */

  async function handleSave() {
    if (
      !validate()
    ) {
      return;
    }

    setSaving(
      true
    );

    try {
      const block:
        ScheduleBlock = {
        id:
          Date.now(),

        professional:
          formData.professional,

        date:
          formData.date,

        startTime:
          formData.startTime,

        endTime:
          formData.endTime,

        type:
          formData.type,

        reason:
          formData.reason
            .trim() ||
          getDefaultReason(
            formData.type
          ),
      };

      saveBlock(
        block
      );

      setFeedback(
        "Bloqueio criado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            "/agenda"
          );
        },

        700
      );
    } catch {
      showError(
        "Não foi possível criar o bloqueio."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <div>
          <button
            type="button"
            onClick={
              handleCancel
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={
                17
              }
            />

            Voltar para agenda
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Novo Bloqueio
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Reserve um período da agenda para almoço, reunião, férias ou indisponibilidade.
          </p>
        </div>

        {/* ================================= */}
        {/* FEEDBACK */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* PROFISSIONAL */}
        {/* ================================= */}

        <PageCard
          title="Profissional"
          description="Selecione a agenda que será bloqueada."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ============================= */}
            {/* PROFISSIONAL */}
            {/* ============================= */}

            <FormField
              label="Profissional"
              required
            >
              <Select
                value={
                  formData.professional
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "professional",

                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione o profissional
                </option>

                {activeProfessionals.map(
                  (
                    professional
                  ) => (
                    <option
                      key={
                        professional.id
                      }
                      value={
                        professional.name
                      }
                    >
                      {
                        professional.name
                      }{" "}
                      -{" "}
                      {
                        professional.specialty
                      }
                    </option>
                  )
                )}
              </Select>

              {activeProfessionals.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Nenhum profissional ativo nas Configurações.
                </p>
              )}
            </FormField>

            {/* ============================= */}
            {/* TIPO */}
            {/* ============================= */}

            <FormField
              label="Tipo de bloqueio"
              required
            >
              <Select
                value={
                  formData.type
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "type",

                    event.target
                      .value as BlockType
                  )
                }
              >
                <option value="Indisponível">
                  Indisponível
                </option>

                <option value="Almoço">
                  Almoço
                </option>

                <option value="Reunião">
                  Reunião
                </option>

                <option value="Férias">
                  Férias
                </option>
              </Select>
            </FormField>
          </div>

          {/* =============================== */}
          {/* PROFISSIONAL SELECIONADO */}
          {/* =============================== */}

          {selectedProfessional && (
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Agenda selecionada
              </p>

              <p className="mt-2 font-semibold text-indigo-900">
                {
                  selectedProfessional.name
                }
              </p>

              <p className="mt-1 text-sm text-indigo-700">
                {
                  selectedProfessional.specialty
                }
              </p>

              {selectedProfessional.registration && (
                <p className="mt-1 text-xs text-indigo-600">
                  {
                    selectedProfessional.registration
                  }
                </p>
              )}
            </div>
          )}
        </PageCard>

        {/* ================================= */}
        {/* DATA E HORÁRIO */}
        {/* ================================= */}

        <PageCard
          title="Data e Horário"
          description="O sistema verifica se já existem atendimentos ou outros bloqueios no período."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ============================= */}
            {/* DATA */}
            {/* ============================= */}

            <FormField
              label="Data"
              required
            >
              <Input
                type="date"
                value={
                  formData.date
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "date",

                    event.target.value
                  )
                }
              />
            </FormField>

            {/* ============================= */}
            {/* INÍCIO */}
            {/* ============================= */}

            <FormField
              label="Hora início"
              required
            >
              <Input
                type="time"
                value={
                  formData.startTime
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "startTime",

                    event.target.value
                  )
                }
              />
            </FormField>

            {/* ============================= */}
            {/* FIM */}
            {/* ============================= */}

            <FormField
              label="Hora fim"
              required
            >
              <Input
                type="time"
                value={
                  formData.endTime
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "endTime",

                    event.target.value
                  )
                }
              />
            </FormField>
          </div>

          {/* =============================== */}
          {/* VALIDAÇÃO EM TEMPO REAL */}
          {/* =============================== */}

          <div className="mt-5">
            {!formData.professional ||
            !formData.date ||
            !formData.startTime ||
            !formData.endTime ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <CalendarDays
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Verificação do período
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecione profissional, data e horário para verificar a disponibilidade.
                  </p>
                </div>
              </div>
            ) : formData.startTime >=
              formData.endTime ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Horário inválido
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    O horário final deve ser posterior ao horário inicial.
                  </p>
                </div>
              </div>
            ) : conflict ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {
                      conflict.title
                    }
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      conflict.description
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Período disponível
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Nenhum atendimento ou bloqueio foi encontrado neste período.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        {/* ================================= */}
        {/* MOTIVO */}
        {/* ================================= */}

        <PageCard
          title="Motivo"
          description="Registre uma observação sobre o bloqueio."
        >
          <textarea
            value={
              formData.reason
            }
            onChange={(
              event
            ) =>
              updateField(
                "reason",

                event.target.value
              )
            }
            maxLength={
              300
            }
            placeholder="Ex.: reunião da equipe clínica, atendimento externo, horário de almoço..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Se não informar um motivo, o sistema utilizará uma descrição padrão.
            </p>

            <p className="shrink-0 text-xs text-slate-400">
              {
                formData.reason.length
              }
              /300
            </p>
          </div>
        </PageCard>

        {/* ================================= */}
        {/* EXPLICAÇÃO */}
        {/* ================================= */}

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
              <Lock
                size={
                  18
                }
              />
            </div>

            <div>
              <p className="font-semibold text-indigo-900">
                Como funciona o bloqueio?
              </p>

              <p className="mt-1 text-sm leading-6 text-indigo-700">
                Durante o período informado, a agenda do profissional ficará indisponível. O sistema também impedirá novos agendamentos que coincidam com esse horário.
              </p>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* BARRA INFERIOR */}
        {/* ================================= */}

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays
                size={
                  17
                }
                className="text-indigo-500"
              />

              Atendimentos e outros bloqueios serão validados antes de salvar.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={
                  saving
                }
                onClick={
                  handleCancel
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={
                  saving ||
                  Boolean(
                    conflict
                  ) ||
                  activeProfessionals.length ===
                    0 ||
                  !formData.professional ||
                  !formData.date ||
                  !formData.startTime ||
                  !formData.endTime ||
                  formData.startTime >=
                    formData.endTime
                }
                onClick={
                  handleSave
                }
              >
                <Save
                  size={
                    17
                  }
                />

                {saving
                  ? "Salvando..."
                  : "Salvar bloqueio"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   MOTIVO PADRÃO
========================================= */

function getDefaultReason(
  type: BlockType
) {
  switch (
    type
  ) {
    case "Almoço":
      return "Intervalo de almoço";

    case "Reunião":
      return "Reunião";

    case "Férias":
      return "Período de férias";

    default:
      return "Profissional indisponível";
  }
}