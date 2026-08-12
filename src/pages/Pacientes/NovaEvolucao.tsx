import { useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  PackageOpen,
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

import type {
  EvolutionFormData,
  EvolutionMaterialFormData,
  EvolutionObjectiveStatus,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  getObjectivesByPatientId,
} from "@/pages/Pacientes/objectiveStorage";

import {
  createEvolution,
  createStoredAttachments,
  getLastEvolutionByPatientId,
  updateEvolution as updateStoredEvolution,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

type ValidationErrors = Partial<
  Record<keyof EvolutionFormData, string>
>;

export default function NovaEvolucao() {
  const navigate = useNavigate();
  const { id } = useParams();

  const patientIdNumber = Number(id);
  const patientId = id ?? "";

  const patient =
    getPatientById(patientIdNumber);

  const therapeuticPlanObjectives =
    useMemo(
      () =>
        Number.isFinite(patientIdNumber) &&
        patientIdNumber > 0
          ? getObjectivesByPatientId(
              patientIdNumber
            ).filter(
              (objective) =>
                objective.status !==
                "Atingido"
            )
          : [],
      [patientIdNumber]
    );

  const activeSpecialties =
    useMemo(
      () =>
        getActiveSpecialties(),
      []
    );

  const lastEvolution =
    useMemo(
      () =>
        Number.isFinite(patientIdNumber) &&
        patientIdNumber > 0
          ? getLastEvolutionByPatientId(
              patientIdNumber
            )
          : undefined,
      [patientIdNumber]
    );

  const [formData, setFormData] =
    useState<EvolutionFormData>(() =>
      createEvolutionDefaultValues(patientId)
    );

  const [savedEvolutionId, setSavedEvolutionId] =
    useState<number | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [feedbackType, setFeedbackType] =
    useState<"success" | "error" | null>(null);

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  function handleCancel() {
    navigate(`/pacientes/${patientId}?tab=evolucoes`);
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
          name: selectedObjective.title,
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

  /* =======================================
     MATERIAIS UTILIZADOS
  ======================================= */

  function addMaterial() {
    setFormData((current) => {
      const nextId =
        current.materials.length > 0
          ? Math.max(
              ...current.materials.map(
                (material) => material.id
              )
            ) + 1
          : 1;

      return {
        ...current,
        materials: [
          ...current.materials,
          {
            id: nextId,
            name: "",
            quantity: "",
            observation: "",
          },
        ],
      };
    });

    setFeedback(null);
    setFeedbackType(null);
  }

  function updateMaterial(
    materialId: number,
    field:
      | "name"
      | "quantity"
      | "observation",
    value: string
  ) {
    setFormData((current) => ({
      ...current,
      materials: current.materials.map(
        (material) =>
          material.id === materialId
            ? {
                ...material,
                [field]: value,
              }
            : material
      ),
    }));

    setFeedback(null);
    setFeedbackType(null);
  }

  function removeMaterial(
    materialId: number
  ) {
    setFormData((current) => ({
      ...current,
      materials: current.materials.filter(
        (material) =>
          material.id !== materialId
      ),
    }));

    setFeedback(null);
    setFeedbackType(null);
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
    if (
      !patient ||
      !Number.isFinite(patientIdNumber) ||
      patientIdNumber <= 0
    ) {
      setFeedback(
        "Paciente não encontrado."
      );
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    setFeedback(null);
    setFeedbackType(null);

    try {
      const draft: EvolutionFormData = {
        ...formData,
        status: "RASCUNHO",
      };

      const payload = {
        patientId: patientIdNumber,
        sessionDate: draft.sessionDate,
        startTime: draft.startTime,
        endTime: draft.endTime,
        specialty: draft.specialty,
        appointmentType:
          draft.appointmentType,
        appointmentLocation:
          draft.appointmentLocation,
        objectives: draft.objectives,
        materials: draft.materials,
        writtenEvolution:
          draft.writtenEvolution,
        referralSpecialty:
          draft.referralSpecialty,
        referralProfessional:
          draft.referralProfessional,
        referralReason:
          draft.referralReason,
        referralPriority:
          draft.referralPriority,
        referralObservation:
          draft.referralObservation,
        notifyProfessional:
          draft.notifyProfessional,
        addProfessionalAgenda:
          draft.addProfessionalAgenda,
        notifyManager:
          draft.notifyManager,
        observedImpacts:
          draft.observedImpacts,
        sessionResult:
          draft.sessionResult,
        sessionResultObservation:
          draft.sessionResultObservation,
        attachments:
          createStoredAttachments(
            draft.attachments
          ),
        professional:
          draft.professional,
        status:
          "RASCUNHO" as const,
      };

      const stored =
        savedEvolutionId
          ? updateStoredEvolution(
              savedEvolutionId,
              payload
            )
          : createEvolution(
              payload
            );

      if (
        stored &&
        !savedEvolutionId
      ) {
        setSavedEvolutionId(
          stored.id
        );
      }

      setFormData(draft);

      setFeedback(
        "Rascunho salvo com sucesso."
      );

      setFeedbackType("success");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o rascunho."
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

    if (
      !patient ||
      !Number.isFinite(patientIdNumber) ||
      patientIdNumber <= 0
    ) {
      setFeedback(
        "Paciente não encontrado."
      );
      setFeedbackType("error");
      return;
    }

    setSaving(true);

    try {
      const evolution: EvolutionFormData = {
        ...formData,
        status: "FINALIZADA",
      };

      const payload = {
        patientId: patientIdNumber,
        sessionDate:
          evolution.sessionDate,
        startTime:
          evolution.startTime,
        endTime:
          evolution.endTime,
        specialty:
          evolution.specialty,
        appointmentType:
          evolution.appointmentType,
        appointmentLocation:
          evolution.appointmentLocation,
        objectives:
          evolution.objectives,
        materials:
          evolution.materials,
        writtenEvolution:
          evolution.writtenEvolution,
        referralSpecialty:
          evolution.referralSpecialty,
        referralProfessional:
          evolution.referralProfessional,
        referralReason:
          evolution.referralReason,
        referralPriority:
          evolution.referralPriority,
        referralObservation:
          evolution.referralObservation,
        notifyProfessional:
          evolution.notifyProfessional,
        addProfessionalAgenda:
          evolution.addProfessionalAgenda,
        notifyManager:
          evolution.notifyManager,
        observedImpacts:
          evolution.observedImpacts,
        sessionResult:
          evolution.sessionResult,
        sessionResultObservation:
          evolution.sessionResultObservation,
        attachments:
          createStoredAttachments(
            evolution.attachments
          ),
        professional:
          evolution.professional,
        status:
          "FINALIZADA" as const,
      };

      const stored =
        savedEvolutionId
          ? updateStoredEvolution(
              savedEvolutionId,
              payload
            )
          : createEvolution(
              payload
            );

      if (
        stored &&
        !savedEvolutionId
      ) {
        setSavedEvolutionId(
          stored.id
        );
      }

      setFormData(evolution);

      setFeedback(
        "Evolução finalizada com sucesso."
      );

      setFeedbackType("success");

      setTimeout(() => {
        navigate(
          `/pacientes/${patientId}?tab=evolucoes`
        );
      }, 900);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a evolução."
      );

      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Paciente não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O paciente pode ter sido removido ou o cadastro não existe.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate("/pacientes")
            }
          >
            Voltar para pacientes
          </Button>
        </div>
      </DashboardLayout>
    );
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
                    {patient.nome}
                  </h2>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {patient.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {calculateAge(
                    patient.nascimento
                  )} anos •{" "}
                  {patient.sexo ||
                    "Não informado"}
                </p>
              </div>
            </div>

            <PatientInfo
              icon={<ClipboardList size={20} />}
              label="Objetivos terapêuticos"
              value={`${therapeuticPlanObjectives.length} ativo${
                therapeuticPlanObjectives.length ===
                1
                  ? ""
                  : "s"
              }`}
            />

            <PatientInfo
              icon={<FileText size={20} />}
              label="Plano Terapêutico"
              value={
                therapeuticPlanObjectives.length >
                0
                  ? "Com objetivos ativos"
                  : "Sem objetivos ativos"
              }
            />

            <PatientInfo
              icon={<CalendarDays size={20} />}
              label="Última evolução"
              value={
                lastEvolution
                  ? formatDate(
                      lastEvolution.sessionDate
                    )
                  : "-"
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <SessionDataSection
            formData={formData}
            errors={errors}
            updateField={updateField}
            activeSpecialties={
              activeSpecialties
            }
          />

          <SessionObjectivesSection
            formData={formData}
            updateObjective={updateObjective}
            addObjective={addObjective}
            removeObjective={removeObjective}
            therapeuticPlanObjectives={
              therapeuticPlanObjectives
            }
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

        <MaterialsUsedSection
          materials={formData.materials}
          onAdd={addMaterial}
          onUpdate={updateMaterial}
          onRemove={removeMaterial}
        />

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

  activeSpecialties: Array<{
    id: number;
    name: string;
  }>;

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
  activeSpecialties,
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
            <option value="">
              Selecione a especialidade
            </option>

            {activeSpecialties.map(
              (specialty) => (
                <option
                  key={specialty.id}
                  value={specialty.name}
                >
                  {specialty.name}
                </option>
              )
            )}
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

  therapeuticPlanObjectives: Array<{
    id: number;
    title: string;
    specialty: string;
  }>;

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
  therapeuticPlanObjectives,
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
                    {objective.title} —{" "}
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

/* =========================================
   MATERIAIS UTILIZADOS
========================================= */

interface MaterialsUsedSectionProps {
  materials:
    EvolutionMaterialFormData[];

  onAdd:
    () => void;

  onUpdate:
    (
      materialId: number,
      field:
        | "name"
        | "quantity"
        | "observation",
      value: string
    ) => void;

  onRemove:
    (
      materialId: number
    ) => void;
}

function MaterialsUsedSection({
  materials,
  onAdd,
  onUpdate,
  onRemove,
}: MaterialsUsedSectionProps) {
  return (
    <PageCard
      title="Materiais utilizados"
      description="Registre os recursos e materiais utilizados durante o atendimento."
    >
      <div className="space-y-4">
        {materials.length > 0 && (
          <div className="hidden grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1.5fr)_42px] gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid">
            <span>
              Material
            </span>

            <span>
              Quantidade
            </span>

            <span>
              Observação
            </span>

            <span />
          </div>
        )}

        {materials.map(
          (
            material,
            index
          ) => (
            <div
              key={
                material.id
              }
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4 lg:grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1.5fr)_42px] lg:items-center"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 lg:hidden">
                  Material
                </label>

                <Input
                  value={
                    material.name
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      material.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Cartões de emoções"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 lg:hidden">
                  Quantidade
                </label>

                <Input
                  value={
                    material.quantity
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      material.id,
                      "quantity",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: 1 conjunto"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 lg:hidden">
                  Observação
                </label>

                <Input
                  value={
                    material.observation
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      material.id,
                      "observation",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Utilizado para identificação emocional"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onRemove(
                    material.id
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title={`Remover material ${index + 1}`}
              >
                <Trash2
                  size={17}
                />
              </button>
            </div>
          )
        )}

        {materials.length === 0 && (
          <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/30 px-5 py-7 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              <PackageOpen
                size={20}
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Nenhum material registrado
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Adicione os recursos utilizados nesta consulta.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={
              onAdd
            }
          >
            <Plus
              size={17}
            />

            Adicionar material
          </Button>
        </div>
      </div>
    </PageCard>
  );
}

function calculateAge(
  birthDate: string
) {
  if (!birthDate) {
    return 0;
  }

  const birth =
    new Date(
      `${birthDate}T12:00:00`
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return 0;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return Math.max(
    age,
    0
  );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "-";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
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