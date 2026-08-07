import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Lock,
  Save,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { ScheduleBlock } from "./ScheduleBlocksView";

import { saveBlock } from "./blockStorage";

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

const initialValues: BlockFormData = {
  professional: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "Indisponível",
  reason: "",
};

const professionals = [
  "Dra. Ana Paula",
  "Dra. Camila Soares",
  "Dra. Larissa Lima",
  "Dr. Rafael Costa",
];

export default function NovoBloqueio() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<BlockFormData>(
      initialValues
    );

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(
      null
    );

  const [feedbackType, setFeedbackType] =
    useState<
      "success" | "error" | null
    >(null);

  function updateField<
    K extends keyof BlockFormData
  >(
    field: K,
    value: BlockFormData[K]
  ) {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setFeedback(null);
    setFeedbackType(null);
  }

  function handleCancel() {
    navigate("/agenda");
  }

  function validate() {
    if (
      !formData.professional ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setFeedback(
        "Preencha profissional, data, horário inicial e horário final."
      );

      setFeedbackType(
        "error"
      );

      return false;
    }

    if (
      formData.startTime >=
      formData.endTime
    ) {
      setFeedback(
        "O horário final deve ser posterior ao horário inicial."
      );

      setFeedbackType(
        "error"
      );

      return false;
    }

    return true;
  }

  async function handleSave() {
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const block: ScheduleBlock = {
        id: Date.now(),

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
          formData.reason.trim() ||
          getDefaultReason(
            formData.type
          ),
      };

      saveBlock(block);

      console.log(
        "Novo bloqueio:",
        block
      );

      setFeedback(
        "Bloqueio criado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(() => {
        navigate(
          "/agenda"
        );
      }, 700);
    } catch {
      setFeedback(
        "Não foi possível criar o bloqueio."
      );

      setFeedbackType(
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
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

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType ===
              "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
          </div>
        )}

        <PageCard
          title="Profissional"
          description="Selecione a agenda que será bloqueada."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Selecione o profissional
                </option>

                {professionals.map(
                  (
                    professional
                  ) => (
                    <option
                      key={
                        professional
                      }
                      value={
                        professional
                      }
                    >
                      {
                        professional
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

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
        </PageCard>

        <PageCard
          title="Data e Horário"
          description="Defina o período em que a agenda ficará indisponível."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                    event.target
                      .value
                  )
                }
              />
            </FormField>

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
                    event.target
                      .value
                  )
                }
              />
            </FormField>

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
                    event.target
                      .value
                  )
                }
              />
            </FormField>
          </div>
        </PageCard>

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
                event.target
                  .value
              )
            }
            maxLength={300}
            placeholder="Ex.: reunião da equipe clínica, atendimento externo, horário de almoço..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              formData.reason
                .length
            }
            /300
          </div>
        </PageCard>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
              <Lock
                size={18}
              />
            </div>

            <div>
              <p className="font-semibold text-indigo-900">
                Como funciona o bloqueio?
              </p>

              <p className="mt-1 text-sm leading-6 text-indigo-700">
                Durante o período informado, a agenda do profissional será exibida como indisponível e futuramente o sistema impedirá novos agendamentos nesse horário.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays
                size={17}
                className="text-indigo-500"
              />

              O bloqueio ficará visível na agenda por profissional.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={
                  handleCancel
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={saving}
                onClick={
                  handleSave
                }
              >
                <Save
                  size={17}
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

function getDefaultReason(
  type: BlockType
) {
  switch (type) {
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