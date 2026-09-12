import {
  useState,
} from "react";

import {
  CheckCircle2,
  Save,
  Send,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import { EvolutionAttachmentsSection } from "@/components/pacientes/profile/evolutions/EvolutionAttachmentsSection";

import {
  createEvolution,
  createStoredAttachments,
  updateEvolution,
  type StoredEvolutionAttachment,
} from "@/pages/Pacientes/evolutionStorage";

import {
  createDefaultAbaSupervisionEvolutionData,
  type AbaSupervisionAttendance,
  type AbaSupervisionEvolutionData,
  type AbaSupervisionYesNo,
} from "./abaSupervision.types";

interface AbaSupervisionFormProps {
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
  initialData?: AbaSupervisionEvolutionData;
  initialAttachments?: StoredEvolutionAttachment[];
  onSaved?: () => void;
}

const attendanceOptions: Array<{
  value: Exclude<AbaSupervisionAttendance, "">;
  label: string;
}> = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
  {
    value: "JUSTIFICOU_AUSENCIA",
    label: "Justificou a ausência",
  },
];

const yesNoOptions: Array<{
  value: Exclude<AbaSupervisionYesNo, "">;
  label: string;
}> = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
];

function ChoiceGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | "";
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const selected =
          value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value)
            }
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              selected
                ? "border-violet-300 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                selected
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {selected && (
                <CheckCircle2 size={13} />
              )}
            </span>

            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AbaSupervisionForm({
  patientId,
  unitId,
  professional,
  specialty = "ABA",
  sessionDate = "",
  startTime = "",
  endTime = "",
  appointmentType = "Supervisão ABA",
  appointmentLocation = "Clinica",
  evolutionId,
  initialData,
  initialAttachments = [],
  onSaved,
}: AbaSupervisionFormProps) {
  const [data, setData] =
    useState<AbaSupervisionEvolutionData>(
      () =>
        initialData ??
        createDefaultAbaSupervisionEvolutionData()
    );

  const [date, setDate] =
    useState(
      sessionDate ||
        new Date()
          .toISOString()
          .slice(0, 10)
    );

  const [initialTime, setInitialTime] =
    useState(startTime);

  const [finalTime, setFinalTime] =
    useState(endTime);

  const [
    responsibleProfessional,
    setResponsibleProfessional,
  ] = useState(professional);

  const [attachments, setAttachments] =
    useState<File[]>([]);

  const [
    attachmentFolderIds,
    setAttachmentFolderIds,
  ] =
    useState<
      Array<
        string |
        null
      >
    >(
      []
    );

  const [
    existingAttachments,
    setExistingAttachments,
  ] =
    useState<StoredEvolutionAttachment[]>(
      initialAttachments
    );

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [feedbackType, setFeedbackType] =
    useState<"success" | "error" | null>(
      null
    );

  function clearFeedback() {
    setFeedback(null);
    setFeedbackType(null);
  }

  function updateField<
    K extends keyof AbaSupervisionEvolutionData
  >(
    field: K,
    value: AbaSupervisionEvolutionData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
    clearFeedback();
  }

  function showError(message: string) {
    setFeedback(message);
    setFeedbackType("error");
  }

  function validate(finalizing: boolean) {
    if (!date) {
      showError(
        "Informe a data da supervisão."
      );
      return false;
    }

    if (!responsibleProfessional.trim()) {
      showError(
        "Informe o profissional responsável."
      );
      return false;
    }

    if (!finalizing) {
      return true;
    }

    if (!data.conditionEntry.trim()) {
      showError(
        "Preencha a condição de entrada do paciente."
      );
      return false;
    }

    if (!data.companionAttendance) {
      showError(
        "Informe se o acompanhante compareceu à supervisão."
      );
      return false;
    }

    if (!data.allProgramsApplied) {
      showError(
        "Informe se todos os programas foram aplicados na semana."
      );
      return false;
    }

    if (!data.programNeedsModification) {
      showError(
        "Informe se algum programa precisa ser modificado."
      );
      return false;
    }

    if (!data.programEnded) {
      showError(
        "Informe se algum programa foi encerrado."
      );
      return false;
    }

    if (!data.helpLevelEvolution) {
      showError(
        "Informe se houve evolução no nível de ajuda."
      );
      return false;
    }

    if (!data.conclusion.trim()) {
      showError(
        "Preencha a conclusão da supervisão."
      );
      return false;
    }

    return true;
  }

  async function persist(
    status: "RASCUNHO" | "FINALIZADA"
  ) {
    if (!validate(status === "FINALIZADA")) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patientId,
        unitId,
        evolutionType:
          "SUPERVISAO_ABA" as const,
        abaSupervisionData:
          data,
        sessionDate:
          date,
        startTime:
          initialTime,
        endTime:
          finalTime,
        specialty:
          specialty || "ABA",
        appointmentType:
          appointmentType ||
          "Supervisão ABA",
        appointmentLocation,
        writtenEvolution:
          data.conclusion,
        attachments: [
          ...existingAttachments,
          ...(await createStoredAttachments(
            attachments
          )).map(
            (
              attachment,
              index
            ) => ({
              ...attachment,
              folderId:
                attachmentFolderIds[
                  index
                ] ||
                undefined,
            })
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
        setAttachmentFolderIds([]);
      }

      setFeedback(
        status === "FINALIZADA"
          ? "Supervisão ABA finalizada com sucesso."
          : "Rascunho da Supervisão ABA salvo com sucesso."
      );
      setFeedbackType("success");

      if (status === "FINALIZADA") {
        onSaved?.();
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a Supervisão ABA."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
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
        title="Dados da Supervisão"
        description="Informações básicas da Ficha de Evolução da Supervisão ABA."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Data da supervisão"
            required
          >
            <Input
              type="date"
              value={date}
              onChange={(event) => {
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
              value={initialTime}
              onChange={(event) => {
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
              value={finalTime}
              onChange={(event) => {
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
              onChange={(event) => {
                setResponsibleProfessional(
                  event.target.value
                );
                clearFeedback();
              }}
            />
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Condição de entrada do paciente"
        description="Registre como o paciente chegou para a supervisão."
      >
        <textarea
          value={data.conditionEntry}
          onChange={(event) =>
            updateField(
              "conditionEntry",
              event.target.value
            )
          }
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="Descreva a condição de entrada do paciente..."
        />
      </PageCard>

      <PageCard
        title="Acompanhante terapêutico"
        description="Informe o acompanhante terapêutico relacionado à supervisão."
      >
        <Input
          value={data.therapeuticCompanion}
          onChange={(event) =>
            updateField(
              "therapeuticCompanion",
              event.target.value
            )
          }
          placeholder="Nome do acompanhante terapêutico..."
        />
      </PageCard>

      <PageCard
        title="Acompanhante compareceu à supervisão?"
      >
        <ChoiceGroup
          value={data.companionAttendance}
          options={attendanceOptions}
          onChange={(value) =>
            updateField(
              "companionAttendance",
              value
            )
          }
        />
      </PageCard>

      <PageCard
        title="Todos os programas foram aplicados na semana?"
      >
        <ChoiceGroup
          value={data.allProgramsApplied}
          options={yesNoOptions}
          onChange={(value) =>
            updateField(
              "allProgramsApplied",
              value
            )
          }
        />
      </PageCard>

      <PageCard
        title="Algum programa precisa ser modificado?"
      >
        <ChoiceGroup
          value={
            data.programNeedsModification
          }
          options={yesNoOptions}
          onChange={(value) =>
            updateField(
              "programNeedsModification",
              value
            )
          }
        />
      </PageCard>

      <PageCard
        title="Qual programa a criança apresentou mais dificuldade?"
      >
        <Input
          value={data.hardestProgram}
          onChange={(event) =>
            updateField(
              "hardestProgram",
              event.target.value
            )
          }
          placeholder="Informe o programa..."
        />
      </PageCard>

      <PageCard
        title="Algum programa encerrado?"
      >
        <ChoiceGroup
          value={data.programEnded}
          options={yesNoOptions}
          onChange={(value) =>
            updateField(
              "programEnded",
              value
            )
          }
        />
      </PageCard>

      <PageCard
        title="Houve evolução no nível de ajuda?"
      >
        <ChoiceGroup
          value={data.helpLevelEvolution}
          options={yesNoOptions}
          onChange={(value) =>
            updateField(
              "helpLevelEvolution",
              value
            )
          }
        />
      </PageCard>

      <PageCard
        title="Demais observações sobre a supervisão"
      >
        <textarea
          value={
            data.additionalObservations
          }
          onChange={(event) =>
            updateField(
              "additionalObservations",
              event.target.value
            )
          }
          rows={5}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="Registre outras observações importantes..."
        />
      </PageCard>

      <PageCard
        title="Conclusão"
        description="Conclusão da Supervisão ABA."
      >
        <textarea
          value={data.conclusion}
          onChange={(event) =>
            updateField(
              "conclusion",
              event.target.value
            )
          }
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          placeholder="Descreva a conclusão da supervisão..."
        />
      </PageCard>

      <EvolutionAttachmentsSection
        patientId={
          patientId
        }
        professionalName={
          responsibleProfessional
        }
        files={
          attachments
        }
        folderIds={
          attachmentFolderIds
        }
        onChange={
          setAttachments
        }
        onFolderIdsChange={
          setAttachmentFolderIds
        }
      />

      {existingAttachments.length >
        0 && (
        <div className="-mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-500">
          {
            existingAttachments.length
          }{" "}
          anexo(s) já salvo(s) nesta supervisão.
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() =>
            persist("RASCUNHO")
          }
        >
          <Save size={16} />
          Salvar rascunho
        </Button>

        <Button
          type="button"
          disabled={saving}
          onClick={() =>
            persist("FINALIZADA")
          }
        >
          <Send size={16} />
          Finalizar Supervisão ABA
        </Button>
      </div>
    </div>
  );
}
