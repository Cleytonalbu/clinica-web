import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
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
  EvolutionObjectiveStatus,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

export default function NovaEvolucao() {
  const navigate = useNavigate();
  const { id } = useParams();

  const patientId = id ?? "";

  const [formData, setFormData] =
    useState<EvolutionFormData>(() =>
      createEvolutionDefaultValues(patientId)
    );

  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  function handleCancel() {
    navigate(`/pacientes/${patientId}`);
  }

  function updateField<K extends keyof EvolutionFormData>(
    field: K,
    value: EvolutionFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateObjective(
    objectiveId: number,
    field: "status" | "performance",
    value: EvolutionObjectiveStatus | number
  ) {
    setFormData((current) => ({
      ...current,

      objectives: current.objectives.map(
        (objective) =>
          objective.id === objectiveId
            ? {
                ...objective,
                [field]: value,
              }
            : objective
      ),
    }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    setFeedback(null);

    try {
      const draft: EvolutionFormData = {
        ...formData,
        status: "RASCUNHO",
      };

      console.log(
        "Rascunho da evolução:",
        draft
      );

      // Integração futura:
      // await evolutionService.createDraft(draft);

      setFormData(draft);

      setFeedback(
        "Rascunho salvo com sucesso."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    setSaving(true);
    setFeedback(null);

    try {
      const evolution: EvolutionFormData = {
        ...formData,
        status: "FINALIZADA",
      };

      console.log(
        "Evolução finalizada:",
        evolution
      );

      // Integração futura:
      // await evolutionService.finalize(evolution);

      setFormData(evolution);

      setFeedback(
        "Evolução finalizada com sucesso."
      );

      setTimeout(() => {
        navigate(
          `/pacientes/${patientId}`
        );
      }, 800);
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
            Registre os detalhes da sessão e os
            indicadores utilizados no acompanhamento
            do paciente.
          </p>
        </div>

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
              icon={
                <ClipboardList size={20} />
              }
              label="Diagnóstico"
              value="TEA - Nível 1 de Suporte"
            />

            <PatientInfo
              icon={<FileText size={20} />}
              label="Plano Terapêutico"
              value="Plano ativo"
            />

            <PatientInfo
              icon={
                <CalendarDays size={20} />
              }
              label="Última evolução"
              value="05/08/2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <SessionDataSection
            formData={formData}
            updateField={updateField}
          />

          <SessionObjectivesSection
            formData={formData}
            updateObjective={updateObjective}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <EvolutionWrittenSection />

          <ReferralSection />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <ObservedImpactsSection />

          <SessionResultSection />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <EvolutionAttachmentsSection />

          <ProfessionalSignatureSection />
        </div>

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {feedback ? (
                <p className="text-sm font-medium text-emerald-600">
                  {feedback}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Você pode salvar como rascunho e
                  continuar depois.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : "Salvar rascunho"}
              </Button>

              <Button
                type="button"
                onClick={handleFinalize}
                disabled={saving}
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

  updateField: <
    K extends keyof EvolutionFormData
  >(
    field: K,
    value: EvolutionFormData[K]
  ) => void;
}

function SessionDataSection({
  formData,
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
        >
          <Select
            value={
              formData.appointmentType
            }
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
            value={
              formData.appointmentLocation
            }
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
}

function SessionObjectivesSection({
  formData,
  updateObjective,
}: SessionObjectivesSectionProps) {
  return (
    <PageCard
      title="2. Indicadores da Sessão"
      description="Objetivos terapêuticos trabalhados no atendimento."
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[1fr_190px_150px] gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Objetivo</span>

          <span>Status na sessão</span>

          <span>Desempenho</span>
        </div>

        {formData.objectives.map(
          (objective) => (
            <div
              key={objective.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-3 md:grid-cols-[1fr_190px_150px] md:items-center"
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
                  {"★".repeat(
                    objective.performance
                  )}

                  <span className="text-slate-200">
                    {"★".repeat(
                      5 -
                        objective.performance
                    )}
                  </span>
                </span>

                <Select
                  value={String(
                    objective.performance
                  )}
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
            </div>
          )
        )}

        <button
          type="button"
          className="mt-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          + Adicionar objetivo à sessão
        </button>
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