import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Lock,
  Send,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
  Textarea,
} from "@/components/ui";

import type {
  ScheduleBlock,
} from "./ScheduleBlocksView";

import {
  criarSolicitacaoBloqueio,
} from "@/services/solicitacoesBloqueio";

type BlockType =
  ScheduleBlock["type"];

interface BlockRequestFormData {
  date: string;
  startTime: string;
  endTime: string;
  type: BlockType;
  reason: string;
}

const initialValues: BlockRequestFormData = {
  date: "",
  startTime: "",
  endTime: "",
  type: "Indisponível",
  reason: "",
};

export default function SolicitarBloqueio() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const professionalName = useMemo(
    () => user?.professionalName ?? user?.name ?? "",
    [user]
  );

  const [formData, setFormData] =
    useState<BlockRequestFormData>(initialValues);

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [feedbackType, setFeedbackType] =
    useState<"success" | "error" | null>(null);

  function updateField<
    K extends keyof BlockRequestFormData
  >(
    field: K,
    value: BlockRequestFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
    setFeedbackType(null);
  }

  function showError(message: string) {
    setFeedback(message);
    setFeedbackType("error");
  }

  function validate() {
    if (!professionalName) {
      showError(
        "Não foi possível identificar o profissional logado."
      );
      return false;
    }

    if (!formData.date) {
      showError("Informe a data do bloqueio.");
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

    if (!formData.reason.trim()) {
      showError(
        "Informe o motivo da solicitação de bloqueio."
      );
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await criarSolicitacaoBloqueio({
        dataHora: `${formData.date}T${formData.startTime}:00`,
        dataFim: `${formData.date}T${formData.endTime}:00`,
        tipo: formData.type,
        motivo: formData.reason.trim(),
      });

      setFeedback(
        "Solicitação enviada ao gestor com sucesso."
      );
      setFeedbackType("success");

      setTimeout(() => {
        navigate("/agenda");
      }, 700);
    } catch (error: any) {
      showError(
        error?.response?.data?.mensagem ??
          "Não foi possível enviar a solicitação de bloqueio."
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
            onClick={() => navigate("/agenda")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para agenda
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Solicitar bloqueio da agenda
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Envie uma solicitação de indisponibilidade para aprovação do gestor.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
          </div>
        )}

        <PageCard
          title="Solicitação de bloqueio"
          description="O período somente será bloqueado após aprovação do gestor."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Profissional">
              <Input
                value={professionalName}
                disabled
                className="bg-slate-50"
              />
            </FormField>

            <FormField
              label="Tipo de bloqueio"
              required
            >
              <Select
                value={formData.type}
                onChange={(event) =>
                  updateField(
                    "type",
                    event.target.value as BlockType
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

            <FormField
              label="Data"
              required
            >
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(event) =>
                    updateField(
                      "date",
                      event.target.value
                    )
                  }
                  className="pl-11"
                />
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Início"
                required
              >
                <div className="relative">
                  <Clock3
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(event) =>
                      updateField(
                        "startTime",
                        event.target.value
                      )
                    }
                    className="pl-11"
                  />
                </div>
              </FormField>

              <FormField
                label="Fim"
                required
              >
                <div className="relative">
                  <Clock3
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(event) =>
                      updateField(
                        "endTime",
                        event.target.value
                      )
                    }
                    className="pl-11"
                  />
                </div>
              </FormField>
            </div>

            <FormField
              label="Motivo"
              required
              className="md:col-span-2"
            >
              <Textarea
                value={formData.reason}
                onChange={(event) =>
                  updateField(
                    "reason",
                    event.target.value
                  )
                }
                placeholder="Descreva o motivo da solicitação..."
              />
            </FormField>
          </div>
        </PageCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <Lock
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p>
              Sua agenda continuará disponível até que o gestor aprove esta solicitação.
            </p>
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/agenda")}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] hover:opacity-95"
            >
              {saving ? (
                <>
                  <CheckCircle2 size={17} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Enviar solicitação
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}