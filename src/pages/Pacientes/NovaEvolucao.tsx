import { useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import { EvolutionWrittenSection } from "@/components/pacientes/profile/evolutions/EvolutionWrittenSection";
import { ReferralSection } from "@/components/pacientes/profile/evolutions/ReferralSection";
import { ObservedImpactsSection } from "@/components/pacientes/profile/evolutions/ObservedImpactsSection";
import { SessionResultSection } from "@/components/pacientes/profile/evolutions/SessionResultSection";
import { EvolutionAttachmentsSection } from "@/components/pacientes/profile/evolutions/EvolutionAttachmentsSection";
import { ProfessionalSignatureSection } from "@/components/pacientes/profile/evolutions/ProfessionalSignatureSection";

import { createEvolutionDefaultValues } from "@/components/pacientes/profile/evolutions/evolutionForm.defaults";

import { therapeuticPlanObjectives } from "@/components/pacientes/profile/evolutions/therapeuticPlan.mock";

import type {
  EvolutionFormData,
  EvolutionObjectiveStatus,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

type ValidationErrors = Partial<
  Record<keyof EvolutionFormData, string>
>;

export default function NovaEvolucao() {
  const navigate = useNavigate();
  const { id } = useParams();

  const patientId = id ?? "";

  const [formData, setFormData] =
    useState<EvolutionFormData>(() =>
      createEvolutionDefaultValues(patientId)
    );

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [feedbackType, setFeedbackType] =
    useState<"success" | "error" | null>(null);

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  function handleCancel() {
    navigate(`/pacientes/${patientId}`);
  }

  function updateField<
    K extends keyof EvolutionFormData
  >(
    field: K,
    value: EvolutionFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setFeedback(null);
    setFeedbackType(null);
  }

  function updateObjective(
    objectiveId: number,
    field: "status" | "performance",
    value: EvolutionObjectiveStatus | number
  ) {
    setFormData((current) => ({
      ...current,
      objectives: current.objectives.map((objective) =>
        objective.id === objectiveId
          ? {
              ...objective,
              [field]: value,
            }
          : objective
      ),
    }));

    setFeedback(null);
    setFeedbackType(null);
  }

  function addObjective(objectiveId: number) {
    const selectedObjective =
      therapeuticPlanObjectives.find(
        (objective) => objective.id === objectiveId
      );

    if (!selectedObjective) {
      return;
    }

    const alreadyAdded = formData.objectives.some(
      (objective) => objective.id === selectedObjective.id
    );

    if (alreadyAdded) {
      setFeedback(
        "Este objetivo já foi adicionado à sessão."
      );
      setFeedbackType("error");
      return;
    }

    setFormData((current) => ({
      ...current,
      objectives: [
        ...current.objectives,
        {
          id: selectedObjective.id,
          name: selectedObjective.name,
          status: "Em evolução",
          performance: 3,
        },
      ],
    }));

    setFeedback(
      "Objetivo adicionado à sessão."
    );
    setFeedbackType("success");
  }

  function removeObjective(objectiveId: number) {
    setFormData((current) => ({
      ...current,
      objectives: current.objectives.filter(
        (objective) => objective.id !== objectiveId
      ),
    }));
  }

  function validateForFinalization() {
    const nextErrors: ValidationErrors = {};

    if (!formData.sessionDate) {
      nextErrors.sessionDate =
        "Informe a data do atendimento.";
    }

    if (!formData.startTime) {
      nextErrors.startTime =
        "Informe o horário de início.";
    }

    if (!formData.specialty) {
      nextErrors.specialty =
        "Selecione a especialidade.";
    }

    if (!formData.appointmentType) {
      nextErrors.appointmentType =
        "Selecione o tipo de atendimento.";
    }

    if (!formData.writtenEvolution.trim()) {
      nextErrors.writtenEvolution =
        "A evolução escrita é obrigatória.";
    }

    if (!formData.professional) {
      nextErrors.professional =
        "Selecione o profissional responsável.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setFeedback(null);
    setFeedbackType(null);

    try {
      const draft: EvolutionFormData = {
        ...formData,
        status: "RASCUNHO",
      };

      console.log(
        "Rascunho da evolução:",
        draft
      );

      setFormData(draft);

      setFeedback(
        "Rascunho salvo com sucesso."
      );

      setFeedbackType("success");
    } catch {
      setFeedback(
        "Não foi possível salvar o rascunho."
      );

      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    setFeedback(null);
    setFeedbackType(null);

    const valid =
      validateForFinalization();

    if (!valid) {
      setFeedback(
        "Preencha os campos obrigatórios antes de finalizar a evolução."
      );

      setFeedbackType("error");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setSaving(true);

    try {
      const evolution: EvolutionFormData = {
        ...formData,
        status: "FINALIZADA",
      };

      console.log(
        "Evolução finalizada:",
        evolution
      );

      setFormData(evolution);

      setFeedback(
        "Evolução finalizada com sucesso."
      );

      setFeedbackType("success");

      setTimeout(() => {
        navigate(
          `/pacientes/${patientId}`
        );
      }, 900);
    } catch {
      setFeedback(
        "Não foi possível finalizar a evolução."
      );

      setFeedbackType("error");
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
            <ArrowLeft size={17} />
            Voltar para evoluções
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Nova Evolução
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Registre os detalhes da sessão e os indicadores utilizados no acompanhamento do paciente.
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound size={30} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Maria Oliveira
                  </h2>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Ativo
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  8 anos • Feminino
                </p>
              </div>
            </div>

            <PatientInfo
              icon={<ClipboardList size={20} />}
              label="Diagnóstico"
              value="TEA - Nível 1 de Suporte"
            />

            <PatientInfo
              icon={<FileText size={20} />}
              label="Plano Terapêutico"
              value="Plano ativo"
            />

            <PatientInfo
              icon={<CalendarDays size={20} />}
              label="Última evolução"
              value="05/08/2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <SessionDataSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />

          <SessionObjectivesSection
            formData={formData}
            updateObjective={updateObjective}
            addObjective={addObjective}
            removeObjective={removeObjective}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <div>
            <EvolutionWrittenSection
              value={formData.writtenEvolution}
              onChange={(value) =>
                updateField(
                  "writtenEvolution",
                  value
                )
              }
            />

            {errors.writtenEvolution && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {errors.writtenEvolution}
              </p>
            )}
          </div>

          <ReferralSection
            formData={formData}
            updateField={updateField}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <ObservedImpactsSection
            value={formData.observedImpacts}
            onChange={(value) =>
              updateField(
                "observedImpacts",
                value
              )
            }
          />

          <SessionResultSection
            value={formData.sessionResult}
            observation={
              formData.sessionResultObservation
            }
            onChange={(value) =>
              updateField(
                "sessionResult",
                value
              )
            }
            onObservationChange={(value) =>
              updateField(
                "sessionResultObservation",
                value
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <EvolutionAttachmentsSection
            files={formData.attachments}
            onChange={(files) =>
              updateField(
                "attachments",
                files
              )
            }
          />

          <div>
            <ProfessionalSignatureSection
              professional={
                formData.professional
              }
              onChange={(value) =>
                updateField(
                  "professional",
                  value
                )
              }
            />

            {errors.professional && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {errors.professional}
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-slate-500">
              Rascunhos podem ser salvos mesmo com campos incompletos.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={handleCancel}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={handleSaveDraft}
              >
                {saving
                  ? "Salvando..."
                  : "Salvar rascunho"}
              </Button>

              <Button
                type="button"
                disabled={saving}
                onClick={handleFinalize}
              >
                {saving
                  ? "Finalizando..."
                  : "Salvar e Finalizar Evolução"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface SessionDataSectionProps {
  formData: EvolutionFormData;
  errors: ValidationErrors;

  updateField: <
    K extends keyof EvolutionFormData
  >(
    field: K,
    value: EvolutionFormData[K]
  ) => void;
}

function SessionDataSection({
  formData,
  errors,
  updateField,
}: SessionDataSectionProps) {
  return (
    <PageCard
      title="1. Dados da Sessão"
      description="Informações do atendimento realizado."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FormField
          label="Data do atendimento"
          required
          error={errors.sessionDate}
        >
          <Input
            type="date"
            value={formData.sessionDate}
            onChange={(event) =>
              updateField(
                "sessionDate",
                event.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Hora início"
          required
          error={errors.startTime}
        >
          <Input
            type="time"
            value={formData.startTime}
            onChange={(event) =>
              updateField(
                "startTime",
                event.target.value
              )
            }
          />
        </FormField>

        <FormField label="Hora fim">
          <Input
            type="time"
            value={formData.endTime}
            onChange={(event) =>
              updateField(
                "endTime",
                event.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Especialidade"
          required
          error={errors.specialty}
        >
          <Select
            value={formData.specialty}
            onChange={(event) =>
              updateField(
                "specialty",
                event.target.value
              )
            }
          >
            <option value="Psicologia">
              Psicologia
            </option>

            <option value="Fonoaudiologia">
              Fonoaudiologia
            </option>

            <option value="Terapia Ocupacional">
              Terapia Ocupacional
            </option>

            <option value="Fisioterapia">
              Fisioterapia
            </option>

            <option value="Psicopedagogia">
              Psicopedagogia
            </option>

            <option value="Nutrição">
              Nutrição
            </option>
          </Select>
        </FormField>

        <FormField
          label="Tipo de atendimento"
          required
          error={errors.appointmentType}
        >
          <Select
            value={formData.appointmentType}
            onChange={(event) =>
              updateField(
                "appointmentType",
                event.target.value
              )
            }
          >
            <option value="Individual">
              Individual
            </option>

            <option value="Grupo">
              Grupo
            </option>

            <option value="Avaliação">
              Avaliação
            </option>
          </Select>
        </FormField>

        <FormField label="Local do atendimento">
          <Select
            value={formData.appointmentLocation}
            onChange={(event) =>
              updateField(
                "appointmentLocation",
                event.target.value
              )
            }
          >
            <option value="Clinica">
              Clínica
            </option>

            <option value="Domiciliar">
              Domiciliar
            </option>

            <option value="Online">
              Online
            </option>
          </Select>
        </FormField>
      </div>
    </PageCard>
  );
}

interface SessionObjectivesSectionProps {
  formData: EvolutionFormData;

  updateObjective: (
    objectiveId: number,
    field: "status" | "performance",
    value: EvolutionObjectiveStatus | number
  ) => void;

  addObjective: (objectiveId: number) => void;

  removeObjective: (objectiveId: number) => void;
}

function SessionObjectivesSection({
  formData,
  updateObjective,
  addObjective,
  removeObjective,
}: SessionObjectivesSectionProps) {
  const [selectedObjectiveId, setSelectedObjectiveId] =
    useState("");

  const availableObjectives = useMemo(
    () =>
      therapeuticPlanObjectives.filter(
        (objective) =>
          !formData.objectives.some(
            (sessionObjective) =>
              sessionObjective.id === objective.id
          )
      ),
    [formData.objectives]
  );

  function handleAddObjective() {
    if (!selectedObjectiveId) {
      return;
    }

    addObjective(
      Number(selectedObjectiveId)
    );

    setSelectedObjectiveId("");
  }

  return (
    <PageCard
      title="2. Indicadores da Sessão"
      description="Objetivos terapêuticos trabalhados no atendimento."
    >
      <div className="space-y-4">
        <div className="hidden grid-cols-[1fr_190px_150px_42px] gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Objetivo</span>
          <span>Status na sessão</span>
          <span>Desempenho</span>
          <span />
        </div>

        {formData.objectives.map((objective) => (
          <div
            key={objective.id}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-3 md:grid-cols-[1fr_190px_150px_42px] md:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-indigo-500" />

              <span className="text-sm font-medium text-slate-800">
                {objective.name}
              </span>
            </div>

            <Select
              value={objective.status}
              onChange={(event) =>
                updateObjective(
                  objective.id,
                  "status",
                  event.target
                    .value as EvolutionObjectiveStatus
                )
              }
            >
              <option value="Em evolução">
                Em evolução
              </option>

              <option value="Alcançado">
                Alcançado
              </option>

              <option value="Parcialmente alcançado">
                Parcialmente alcançado
              </option>

              <option value="Regressão">
                Regressão
              </option>
            </Select>

            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-amber-500">
                {"★".repeat(objective.performance)}

                <span className="text-slate-200">
                  {"★".repeat(
                    5 - objective.performance
                  )}
                </span>
              </span>

              <Select
                value={String(objective.performance)}
                onChange={(event) =>
                  updateObjective(
                    objective.id,
                    "performance",
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-16"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Select>
            </div>

            <button
              type="button"
              onClick={() =>
                removeObjective(objective.id)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              title="Remover objetivo"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}

        {formData.objectives.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Nenhum objetivo selecionado para esta sessão.
          </div>
        )}

        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Adicionar objetivo do plano terapêutico
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={selectedObjectiveId}
              onChange={(event) =>
                setSelectedObjectiveId(
                  event.target.value
                )
              }
              className="flex-1"
            >
              <option value="">
                Selecione um objetivo
              </option>

              {availableObjectives.map(
                (objective) => (
                  <option
                    key={objective.id}
                    value={objective.id}
                  >
                    {objective.name} —{" "}
                    {objective.specialty}
                  </option>
                )
              )}
            </Select>

            <Button
              type="button"
              onClick={handleAddObjective}
              disabled={!selectedObjectiveId}
            >
              <Plus size={17} />
              Adicionar
            </Button>
          </div>

          {availableObjectives.length === 0 && (
            <p className="mt-3 text-xs text-emerald-600">
              Todos os objetivos do plano terapêutico já estão nesta sessão.
            </p>
          )}
        </div>
      </div>
    </PageCard>
  );
}

interface PatientInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PatientInfo({
  icon,
  label,
  value,
}: PatientInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}