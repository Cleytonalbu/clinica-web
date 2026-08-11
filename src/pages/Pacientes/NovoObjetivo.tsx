import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  Target,
} from "lucide-react";

import {
  useNavigate,
  useParams,
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

import {
  getPatientById,
} from "./patientStorage";

import {
  createObjective,
  type ObjectiveStatus,
} from "./objectiveStorage";

import {
  getActiveProfessionals,
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

interface ObjectiveFormData {
  title: string;

  professional: string;

  specialty: string;

  startDate: string;

  targetDate: string;

  progress: string;

  status:
    ObjectiveStatus;

  observation: string;
}

/* =========================================
   VALORES INICIAIS
========================================= */

const initialValues:
  ObjectiveFormData = {
  title:
    "",

  professional:
    "",

  specialty:
    "",

  startDate:
    new Date()
      .toISOString()
      .slice(
        0,
        10
      ),

  targetDate:
    "",

  progress:
    "0",

  status:
    "Em evolução",

  observation:
    "",
};

/* =========================================
   COMPONENTE
========================================= */

export default function NovoObjetivo() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  const patient =
    getPatientById(
      patientId
    );

  /* =======================================
     CONFIGURAÇÕES
  ======================================= */

  const activeProfessionals =
    useMemo(
      () =>
        getActiveProfessionals(),

      []
    );

  const activeSpecialties =
    useMemo(
      () =>
        getActiveSpecialties(),

      []
    );

  /* =======================================
     FORMULÁRIO
  ======================================= */

  const [
    formData,
    setFormData,
  ] =
    useState<ObjectiveFormData>(
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
     ATUALIZAR CAMPO
  ======================================= */

  function updateField<
    K extends keyof ObjectiveFormData
  >(
    field: K,

    value:
      ObjectiveFormData[K]
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
     PROFISSIONAL
  ======================================= */

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

    setFormData(
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
      showError(
        `A especialidade ${specialty} está inativa.`
      );

      return;
    }

    clearFeedback();
  }

  /* =======================================
     VALIDAÇÃO
  ======================================= */

  function validate() {
    if (
      !formData.title.trim()
    ) {
      showError(
        "Informe o objetivo terapêutico."
      );

      return false;
    }

    if (
      !formData.professional
    ) {
      showError(
        "Selecione o profissional."
      );

      return false;
    }

    if (
      !formData.specialty
    ) {
      showError(
        "Selecione uma especialidade válida."
      );

      return false;
    }

    if (
      !formData.startDate
    ) {
      showError(
        "Informe a data de início."
      );

      return false;
    }

    if (
      !formData.targetDate
    ) {
      showError(
        "Informe a previsão de conclusão."
      );

      return false;
    }

    if (
      formData.targetDate <
      formData.startDate
    ) {
      showError(
        "A previsão deve ser posterior à data de início."
      );

      return false;
    }

    const progress =
      Number(
        formData.progress
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
      showError(
        "O progresso deve estar entre 0 e 100."
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

    if (
      !patient
    ) {
      showError(
        "Paciente não encontrado."
      );

      return;
    }

    setSaving(
      true
    );

    try {
      createObjective(
        {
          patientId:
            patient.id,

          title:
            formData.title,

          specialty:
            formData.specialty,

          professional:
            formData.professional,

          startDate:
            formData.startDate,

          targetDate:
            formData.targetDate,

          progress:
            Number(
              formData.progress
            ),

          status:
            formData.status,

          observation:
            formData.observation,
        }
      );

      setFeedback(
        "Objetivo terapêutico criado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            `/pacientes/${patient.id}`
          );
        },
        700
      );
    } catch {
      showError(
        "Não foi possível criar o objetivo."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /* =======================================
     PACIENTE NÃO ENCONTRADO
  ======================================= */

  if (
    !patient
  ) {
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
              navigate(
                "/pacientes"
              )
            }
          >
            Voltar para pacientes
          </Button>
        </div>
      </DashboardLayout>
    );
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
            onClick={() =>
              navigate(
                `/pacientes/${patient.id}`
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para o paciente
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Novo Objetivo Terapêutico
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Defina um novo objetivo para{" "}
            <strong className="font-semibold text-slate-700">
              {
                patient.nome
              }
            </strong>
            .
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
        {/* OBJETIVO */}
        {/* ================================= */}

        <PageCard
          title="Objetivo Terapêutico"
          description="Defina o resultado terapêutico que será acompanhado."
        >
          <div className="space-y-5">
            <FormField
              label="Objetivo"
              required
            >
              <Input
                value={
                  formData.title
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "title",

                    event.target.value
                  )
                }
                placeholder="Ex.: Melhorar comunicação verbal"
              />
            </FormField>

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
              >
                <Input
                  value={
                    formData.specialty
                  }
                  readOnly
                />
              </FormField>
            </div>

            {selectedProfessional && (
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <Target
                    size={20}
                    className="mt-0.5 text-violet-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-violet-800">
                      Profissional responsável
                    </p>

                    <p className="mt-1 text-sm font-medium text-violet-700">
                      {
                        selectedProfessional.name
                      }
                    </p>

                    <p className="mt-1 text-xs text-violet-600">
                      {
                        selectedProfessional.specialty
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        {/* ================================= */}
        {/* PERÍODO */}
        {/* ================================= */}

        <PageCard
          title="Período e Progresso"
          description="Defina datas e situação inicial do objetivo."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Data de início"
              required
            >
              <Input
                type="date"
                value={
                  formData.startDate
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "startDate",

                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Previsão"
              required
            >
              <Input
                type="date"
                value={
                  formData.targetDate
                }
                onChange={(
                  event
                ) =>
                  updateField(
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
                  formData.progress
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "progress",

                    event.target.value
                  )
                }
              />

              <p className="mt-2 text-xs text-slate-400">
                Valor entre 0 e 100%.
              </p>
            </FormField>

            <FormField
              label="Status"
            >
              <Select
                value={
                  formData.status
                }
                onChange={(
                  event
                ) =>
                  updateField(
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
        </PageCard>

        {/* ================================= */}
        {/* OBSERVAÇÃO */}
        {/* ================================= */}

        <PageCard
          title="Observações"
          description="Informações complementares sobre o objetivo."
        >
          <textarea
            value={
              formData.observation
            }
            onChange={(
              event
            ) =>
              updateField(
                "observation",

                event.target.value
              )
            }
            maxLength={500}
            placeholder="Ex.: trabalhar comunicação espontânea durante as sessões..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              formData.observation.length
            }
            /500
          </div>
        </PageCard>

        {/* ================================= */}
        {/* BARRA INFERIOR */}
        {/* ================================= */}

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Target
                size={18}
                className="text-violet-500"
              />

              O objetivo ficará vinculado a este paciente.
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={
                  saving
                }
                onClick={() =>
                  navigate(
                    `/pacientes/${patient.id}`
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={
                  saving ||
                  activeProfessionals.length ===
                    0
                }
                onClick={
                  handleSave
                }
              >
                <Save
                  size={17}
                />

                {saving
                  ? "Salvando..."
                  : "Salvar objetivo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}