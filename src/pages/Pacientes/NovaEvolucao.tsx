import { useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  PackageOpen,
  Plus,
  Save,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

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
  getEvolutionObjectiveMarkerScore,
  hasEvolutionObjectiveMarkerScore,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  createObjective,
  getObjectivesByPatientId,
  type ObjectiveStatus,
} from "@/pages/Pacientes/objectiveStorage";

import {
  createEvolution,
  createStoredAttachments,
  getLastEvolutionByPatientId,
  updateEvolution as updateStoredEvolution,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getActiveProfessionals,
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

  const {
    user,
  } =
    useAuth();

  const isProfissional =
    user?.profile ===
    "Profissional";

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const [
    objectiveRefreshKey,
    setObjectiveRefreshKey,
  ] = useState(0);

  const allActiveProfessionals =
    useMemo(
      () =>
        getActiveProfessionals(),
      []
    );

  const loggedProfessional =
    useMemo(
      () =>
        allActiveProfessionals.find(
          (
            professional
          ) =>
            professional.name ===
            loggedProfessionalName
        ),
      [
        allActiveProfessionals,
        loggedProfessionalName,
      ]
    );

  const professionalSpecialty =
    loggedProfessional?.specialty ??
    "";

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
                  "Atingido" &&
                (
                  !isProfissional ||
                  (
                    objective.professional ===
                      loggedProfessionalName &&
                    (
                      !professionalSpecialty ||
                      objective.specialty ===
                        professionalSpecialty
                    )
                  )
                )
            )
          : [],
      [
        patientIdNumber,
        objectiveRefreshKey,
        isProfissional,
        loggedProfessionalName,
        professionalSpecialty,
      ]
    );

  const activeProfessionals =
    useMemo(
      () =>
        isProfissional
          ? allActiveProfessionals.filter(
              (
                professional
              ) =>
                professional.name ===
                loggedProfessionalName
            )
          : allActiveProfessionals,
      [
        allActiveProfessionals,
        isProfissional,
        loggedProfessionalName,
      ]
    );

  const activeSpecialties =
    useMemo(
      () => {
        const specialties =
          getActiveSpecialties();

        if (
          !isProfissional
        ) {
          return specialties;
        }

        return specialties.filter(
          (
            specialty
          ) =>
            specialty.name ===
            professionalSpecialty
        );
      },
      [
        isProfissional,
        professionalSpecialty,
      ]
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

      objectives: current.objectives.map(
        (
          objective
        ) => {
          if (
            objective.id !==
            objectiveId
          ) {
            return objective;
          }

          if (
            field ===
            "status"
          ) {
            const nextStatus =
              value as EvolutionObjectiveStatus;

            return {
              ...objective,

              status:
                nextStatus,

              markerScore:
                getEvolutionObjectiveMarkerScore(
                  nextStatus
                ),
            };
          }

          return {
            ...objective,

            performance:
              Number(
                value
              ),
          };
        }
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
          markerScore: 2,
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

  function handleObjectiveCreated(
    objective: {
      id: number;
      title: string;
      specialty: string;
    }
  ) {
    setObjectiveRefreshKey(
      (current) =>
        current + 1
    );

    setFormData(
      (current) => {
        const alreadyAdded =
          current.objectives.some(
            (item) =>
              item.id ===
              objective.id
          );

        if (
          alreadyAdded
        ) {
          return current;
        }

        return {
          ...current,

          objectives: [
            ...current.objectives,
            {
              id:
                objective.id,

              name:
                objective.title,

              status:
                "Em evolução",

              performance:
                3,

              markerScore:
                2,
            },
          ],
        };
      }
    );

    setFeedback(
      "Objetivo terapêutico criado e adicionado à sessão."
    );

    setFeedbackType(
      "success"
    );
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

          <p className="mt-2 text-sm font-medium text-[#7180a8]">
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
      <div className="-m-2 min-h-full rounded-[30px] bg-gradient-to-br from-violet-50/80 via-sky-50/50 to-emerald-50/60 p-2 sm:-m-3 sm:p-3">
        <div className="space-y-6">
        <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-violet-700"
          >
            <ArrowLeft size={17} />
            Voltar para evoluções
          </button>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#10235f]">
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

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/70 to-cyan-50/70 p-5 shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-200/70">
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

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2 [&>div]:shadow-[0_10px_30px_rgba(58,72,140,0.06)] [&>div:first-child]:border-blue-100 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white [&>div:first-child]:to-blue-50/50 [&>div:last-child]:border-violet-100 [&>div:last-child]:bg-gradient-to-br [&>div:last-child]:from-white [&>div:last-child]:to-violet-50/55">
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
            patientId={
              patientIdNumber
            }
            activeProfessionals={
              activeProfessionals
            }
            activeSpecialties={
              activeSpecialties
            }
            onObjectiveCreated={
              handleObjectiveCreated
            }
          />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 2xl:grid-cols-2">
          <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-white to-fuchsia-50/40 shadow-[0_10px_30px_rgba(168,85,247,0.06)] [&>div>div]:border-fuchsia-100">
            <div className="flex-1 [&>*]:h-full">
              <EvolutionWrittenSection
                value={formData.writtenEvolution}
                onChange={(value) =>
                  updateField(
                    "writtenEvolution",
                    value
                  )
                }
              />
            </div>

            {errors.writtenEvolution && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {errors.writtenEvolution}
              </p>
            )}
          </div>

          <div className="h-full rounded-2xl bg-gradient-to-br from-white to-orange-50/45 shadow-[0_10px_30px_rgba(249,115,22,0.06)] [&>*]:h-full [&>div]:border-orange-100">
            <ReferralSection
              formData={formData}
              updateField={updateField}
            />
          </div>
        </div>

        <MaterialsUsedSection
          materials={formData.materials}
          onAdd={addMaterial}
          onUpdate={updateMaterial}
          onRemove={removeMaterial}
        />

        <div className="grid grid-cols-1 gap-6 rounded-3xl bg-gradient-to-r from-emerald-50/45 via-white/30 to-sky-50/55 p-1 2xl:grid-cols-2 [&>div]:shadow-[0_10px_30px_rgba(15,118,110,0.05)]">
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

        <div className="grid grid-cols-1 gap-6 rounded-3xl bg-gradient-to-r from-sky-50/50 via-white/30 to-indigo-50/55 p-1 2xl:grid-cols-2 [&>div]:shadow-[0_10px_30px_rgba(59,130,246,0.05)]">
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

        <div className="sticky bottom-0 z-20 rounded-2xl border border-indigo-100 bg-white/90 px-5 py-4 shadow-[0_16px_40px_rgba(79,70,229,0.14)] backdrop-blur-xl">
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
      <div className="grid grid-cols-1 gap-5 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/35 p-1 md:grid-cols-3">
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

  patientId: number;

  activeProfessionals: Array<{
    id: number | string;
    name: string;
    specialty: string;
  }>;

  activeSpecialties: Array<{
    id: number | string;
    name: string;
  }>;

  updateObjective: (
    objectiveId: number,
    field: "status" | "performance",
    value: EvolutionObjectiveStatus | number
  ) => void;

  addObjective:
    (objectiveId: number) => void;

  removeObjective:
    (objectiveId: number) => void;

  onObjectiveCreated:
    (
      objective: {
        id: number;
        title: string;
        specialty: string;
      }
    ) => void;
}

function SessionObjectivesSection({
  formData,
  therapeuticPlanObjectives,
  patientId,
  activeProfessionals,
  activeSpecialties,
  updateObjective,
  addObjective,
  removeObjective,
  onObjectiveCreated,
}: SessionObjectivesSectionProps) {
  const [
    selectedObjectiveId,
    setSelectedObjectiveId,
  ] =
    useState("");

  const [
    newObjectiveOpen,
    setNewObjectiveOpen,
  ] =
    useState(false);

  const availableObjectives =
    useMemo(
      () =>
        therapeuticPlanObjectives.filter(
          (objective) =>
            !formData.objectives.some(
              (
                sessionObjective
              ) =>
                sessionObjective.id ===
                objective.id
            )
        ),
      [
        therapeuticPlanObjectives,
        formData.objectives,
      ]
    );

  function handleAddObjective() {
    if (
      !selectedObjectiveId
    ) {
      return;
    }

    addObjective(
      Number(
        selectedObjectiveId
      )
    );

    setSelectedObjectiveId(
      ""
    );
  }

  return (
    <>
      <PageCard
        title="2. Indicadores da Sessão"
        description="Objetivos terapêuticos trabalhados no atendimento."
      >
        <div className="space-y-4">
          <div className="hidden grid-cols-[1fr_190px_150px_42px] gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <span>
              Objetivo
            </span>

            <span>
              Status na sessão
            </span>

            <span>
              Desempenho
            </span>

            <span />
          </div>

          {formData.objectives.map(
            (
              objective
            ) => (
              <div
                key={
                  objective.id
                }
                className="grid grid-cols-1 gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/55 to-white p-3 shadow-sm md:grid-cols-[1fr_190px_150px_42px] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-200" />

                  <span className="text-sm font-medium text-slate-800">
                    {
                      objective.name
                    }
                  </span>
                </div>

                <Select
                  value={
                    objective.status
                  }
                  onChange={(
                    event
                  ) =>
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

                  <option value="Mantido/sem alteração">
                    Mantido/sem alteração
                  </option>

                  <option value="Regressão">
                    Regressão
                  </option>

                  <option value="Alcançado">
                    Alcançado
                  </option>

                  <option value="Falta da criança">
                    Falta da criança
                  </option>

                  <option value="Não trabalhado">
                    Não trabalhado
                  </option>
                </Select>

                <div className="flex items-center gap-2">
                  {hasEvolutionObjectiveMarkerScore(
                    objective.status
                  ) ? (
                    <>
                      <span className="whitespace-nowrap text-amber-500">
                        {
                          "★".repeat(
                            objective.performance
                          )
                        }

                        <span className="text-slate-200">
                          {
                            "★".repeat(
                              5 -
                                objective.performance
                            )
                          }
                        </span>
                      </span>

                      <Select
                        value={
                          String(
                            objective.performance
                          )
                        }
                        onChange={(
                          event
                        ) =>
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
                        <option value="1">
                          1
                        </option>

                        <option value="2">
                          2
                        </option>

                        <option value="3">
                          3
                        </option>

                        <option value="4">
                          4
                        </option>

                        <option value="5">
                          5
                        </option>
                      </Select>
                    </>
                  ) : (
                    <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                      Sem pontuação
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeObjective(
                      objective.id
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remover objetivo"
                >
                  <Trash2
                    size={17}
                  />
                </button>
              </div>
            )
          )}

          {formData.objectives.length >
            0 && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-[11px] font-semibold text-slate-500 sm:grid-cols-3 lg:grid-cols-6">
              <span>
                Regressão: -1
              </span>

              <span>
                Mantido: 1
              </span>

              <span>
                Em evolução: 2
              </span>

              <span>
                Alcançado: 3
              </span>

              <span>
                Falta: sem ponto
              </span>

              <span>
                Não trabalhado: sem ponto
              </span>
            </div>
          )}

          {formData.objectives.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/35 p-6 text-center text-sm text-violet-500">
              Nenhum objetivo selecionado para esta sessão.
            </div>
          )}

          <div className="rounded-xl border border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50/55 to-violet-50/35 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Adicionar objetivo do plano terapêutico
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Se o objetivo ainda não existir, crie sem sair da evolução.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setNewObjectiveOpen(
                    true
                  )
                }
              >
                <Target
                  size={16}
                />

                Novo objetivo
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={
                  selectedObjectiveId
                }
                onChange={(
                  event
                ) =>
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
                  (
                    objective
                  ) => (
                    <option
                      key={
                        objective.id
                      }
                      value={
                        objective.id
                      }
                    >
                      {
                        objective.title
                      }{" "}
                      —{" "}
                      {
                        objective.specialty
                      }
                    </option>
                  )
                )}
              </Select>

              <Button
                type="button"
                onClick={
                  handleAddObjective
                }
                disabled={
                  !selectedObjectiveId
                }
              >
                <Plus
                  size={17}
                />

                Adicionar
              </Button>
            </div>

            {availableObjectives.length ===
              0 &&
              therapeuticPlanObjectives.length >
                0 && (
                <p className="mt-3 text-xs font-medium text-emerald-600">
                  Todos os objetivos disponíveis já foram adicionados à sessão.
                </p>
              )}

            {therapeuticPlanObjectives.length ===
              0 && (
              <p className="mt-3 text-xs font-medium text-amber-600">
                O paciente ainda não possui objetivos terapêuticos ativos. Use “Novo objetivo” para cadastrar agora.
              </p>
            )}
          </div>
        </div>
      </PageCard>

      {newObjectiveOpen && (
        <QuickObjectiveModal
          patientId={
            patientId
          }
          currentSpecialty={
            formData.specialty
          }
          activeProfessionals={
            activeProfessionals
          }
          activeSpecialties={
            activeSpecialties
          }
          onClose={() =>
            setNewObjectiveOpen(
              false
            )
          }
          onCreated={(
            objective
          ) => {
            onObjectiveCreated(
              objective
            );

            setNewObjectiveOpen(
              false
            );
          }}
        />
      )}
    </>
  );
}

/* =========================================
   MODAL - NOVO OBJETIVO
========================================= */

interface QuickObjectiveModalProps {
  patientId:
    number;

  currentSpecialty:
    string;

  activeProfessionals: Array<{
    id: number | string;
    name: string;
    specialty: string;
  }>;

  activeSpecialties: Array<{
    id: number | string;
    name: string;
  }>;

  onClose:
    () => void;

  onCreated:
    (
      objective: {
        id: number;
        title: string;
        specialty: string;
      }
    ) => void;
}

interface QuickObjectiveFormData {
  generalObjective:
    string;

  title:
    string;

  professional:
    string;

  specialty:
    string;

  startDate:
    string;

  targetDate:
    string;

  progress:
    string;

  status:
    ObjectiveStatus;

  observation:
    string;
}

function QuickObjectiveModal({
  patientId,
  currentSpecialty,
  activeProfessionals,
  activeSpecialties,
  onClose,
  onCreated,
}: QuickObjectiveModalProps) {
  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  const initialProfessional =
    activeProfessionals.find(
      (
        professional
      ) =>
        professional.specialty ===
        currentSpecialty
    );

  const [
    objectiveData,
    setObjectiveData,
  ] =
    useState<QuickObjectiveFormData>(
      {
        generalObjective:
          "",

        title:
          "",

        professional:
          initialProfessional?.name ??
          "",

        specialty:
          initialProfessional?.specialty ??
          currentSpecialty ??
          "",

        startDate:
          today,

        targetDate:
          "",

        progress:
          "0",

        status:
          "Em evolução",

        observation:
          "",
      }
    );

  const [
    savingObjective,
    setSavingObjective,
  ] =
    useState(false);

  const [
    objectiveError,
    setObjectiveError,
  ] =
    useState<string | null>(
      null
    );

  function updateObjectiveField<
    K extends keyof QuickObjectiveFormData
  >(
    field:
      K,

    value:
      QuickObjectiveFormData[K]
  ) {
    setObjectiveData(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );

    setObjectiveError(
      null
    );
  }

  function handleProfessionalChange(
    professionalName:
      string
  ) {
    const selected =
      activeProfessionals.find(
        (
          professional
        ) =>
          professional.name ===
          professionalName
      );

    const specialty =
      selected?.specialty ??
      "";

    const specialtyAvailable =
      activeSpecialties.some(
        (
          item
        ) =>
          item.name ===
          specialty
      );

    setObjectiveData(
      (
        current
      ) => ({
        ...current,

        professional:
          professionalName,

        specialty:
          specialtyAvailable
            ? specialty
            : "",
      })
    );

    if (
      selected &&
      !specialtyAvailable
    ) {
      setObjectiveError(
        `A especialidade ${specialty} está inativa.`
      );

      return;
    }

    setObjectiveError(
      null
    );
  }

  function validateObjective() {
    if (
      !objectiveData.generalObjective.trim()
    ) {
      return "Informe o objetivo geral.";
    }

    if (
      !objectiveData.title.trim()
    ) {
      return "Informe o objetivo terapêutico.";
    }

    if (
      !objectiveData.professional
    ) {
      return "Selecione o profissional.";
    }

    if (
      !objectiveData.specialty
    ) {
      return "Selecione uma especialidade válida.";
    }

    if (
      !objectiveData.startDate
    ) {
      return "Informe a data de início.";
    }

    if (
      !objectiveData.targetDate
    ) {
      return "Informe a previsão de conclusão.";
    }

    if (
      objectiveData.targetDate <
      objectiveData.startDate
    ) {
      return "A previsão deve ser posterior à data de início.";
    }

    const progress =
      Number(
        objectiveData.progress
      );

    if (
      !Number.isFinite(
        progress
      ) ||
      progress <
        0 ||
      progress >
        100
    ) {
      return "O progresso deve estar entre 0 e 100.";
    }

    return null;
  }

  async function handleCreateObjective() {
    const validationError =
      validateObjective();

    if (
      validationError
    ) {
      setObjectiveError(
        validationError
      );

      return;
    }

    if (
      !Number.isFinite(
        patientId
      ) ||
      patientId <=
        0
    ) {
      setObjectiveError(
        "Paciente inválido."
      );

      return;
    }

    setSavingObjective(
      true
    );

    setObjectiveError(
      null
    );

    try {
      createObjective(
        {
          patientId,

          generalObjective:
            objectiveData.generalObjective,

          title:
            objectiveData.title,

          specialty:
            objectiveData.specialty,

          professional:
            objectiveData.professional,

          startDate:
            objectiveData.startDate,

          targetDate:
            objectiveData.targetDate,

          progress:
            Number(
              objectiveData.progress
            ),

          status:
            objectiveData.status,

          observation:
            objectiveData.observation,
        }
      );

      const createdObjective =
        getObjectivesByPatientId(
          patientId
        )
          .filter(
            (
              objective
            ) =>
              objective.title
                .trim()
                .toLocaleLowerCase(
                  "pt-BR"
                ) ===
                objectiveData.title
                  .trim()
                  .toLocaleLowerCase(
                    "pt-BR"
                  ) &&
              objective.professional ===
                objectiveData.professional
          )
          .sort(
            (
              a,
              b
            ) =>
              b.id -
              a.id
          )[0];

      if (
        !createdObjective
      ) {
        throw new Error(
          "Objetivo criado, mas não foi possível localizá-lo."
        );
      }

      onCreated(
        {
          id:
            createdObjective.id,

          title:
            createdObjective.title,

          specialty:
            createdObjective.specialty,
        }
      );
    } catch {
      setObjectiveError(
        "Não foi possível criar o objetivo terapêutico."
      );
    } finally {
      setSavingObjective(
        false
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-violet-100 bg-white shadow-[0_30px_90px_rgba(30,41,59,0.22)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <Target
                size={21}
              />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#10235f]">
                Novo objetivo terapêutico
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre o objetivo sem sair do atendimento. Ao salvar, ele será adicionado automaticamente à sessão.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              savingObjective
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
            title="Fechar"
          >
            <X
              size={19}
            />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {objectiveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {
                objectiveError
              }
            </div>
          )}

          <div className="rounded-2xl border border-violet-100 bg-violet-50/35 p-5">
            <div className="space-y-5">
              <FormField
                label="Objetivo geral"
                required
              >
                <Input
                  value={
                    objectiveData.generalObjective
                  }
                  onChange={(
                    event
                  ) =>
                    updateObjectiveField(
                      "generalObjective",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Desenvolver autonomia nas atividades de vida diária"
                />
              </FormField>

              <FormField
                label="Objetivo específico"
                required
              >
              <Input
                value={
                  objectiveData.title
                }
                onChange={(
                  event
                ) =>
                  updateObjectiveField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Ex.: Vestir camiseta com apoio verbal"
              />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Profissional"
              required
            >
              <Select
                value={
                  objectiveData.professional
                }
                onChange={(
                  event
                ) =>
                  handleProfessionalChange(
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
            </FormField>

            <FormField
              label="Especialidade"
              required
            >
              <Input
                value={
                  objectiveData.specialty
                }
                readOnly
                placeholder="Definida pelo profissional"
              />
            </FormField>

            <FormField
              label="Data de início"
              required
            >
              <Input
                type="date"
                value={
                  objectiveData.startDate
                }
                onChange={(
                  event
                ) =>
                  updateObjectiveField(
                    "startDate",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Previsão de conclusão"
              required
            >
              <Input
                type="date"
                value={
                  objectiveData.targetDate
                }
                onChange={(
                  event
                ) =>
                  updateObjectiveField(
                    "targetDate",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Progresso inicial"
            >
              <Input
                type="number"
                min="0"
                max="100"
                value={
                  objectiveData.progress
                }
                onChange={(
                  event
                ) =>
                  updateObjectiveField(
                    "progress",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Status"
            >
              <Select
                value={
                  objectiveData.status
                }
                onChange={(
                  event
                ) =>
                  updateObjectiveField(
                    "status",
                    event.target
                      .value as ObjectiveStatus
                  )
                }
              >
                <option value="Em evolução">
                  Em evolução
                </option>

                <option value="Atingido">
                  Atingido
                </option>

                <option value="Com regressão">
                  Com regressão
                </option>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Observações"
          >
            <textarea
              value={
                objectiveData.observation
              }
              onChange={(
                event
              ) =>
                updateObjectiveField(
                  "observation",
                  event.target.value
                )
              }
              maxLength={
                500
              }
              placeholder="Ex.: trabalhar comunicação espontânea durante as sessões..."
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

            <div className="mt-2 text-right text-xs text-slate-400">
              {
                objectiveData
                  .observation
                  .length
              }
              /500
            </div>
          </FormField>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={
              savingObjective
            }
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={
              savingObjective ||
              activeProfessionals.length ===
                0
            }
            onClick={
              handleCreateObjective
            }
          >
            <Save
              size={17}
            />

            {savingObjective
              ? "Criando..."
              : "Criar e adicionar à sessão"}
          </Button>
        </div>
      </div>
    </div>
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
      title="5. Materiais utilizados"
      description="Registre os recursos e materiais utilizados durante o atendimento."
    >
      <div className="-m-1 space-y-4 rounded-2xl bg-gradient-to-br from-amber-50/55 via-white to-orange-50/45 p-1">
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
              className="grid grid-cols-1 gap-3 rounded-xl border border-amber-100 bg-white/90 p-4 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1.5fr)_42px] lg:items-center"
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
    <div className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/65 p-2.5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
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