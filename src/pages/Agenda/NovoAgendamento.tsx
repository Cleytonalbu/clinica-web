import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Save,
  Stethoscope,
  UserPlus,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
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
  addMinutesToTime,
  checkScheduleConflict,
} from "./scheduleValidation";

import {
  saveAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  calculateChargeAmount,
  formatCurrency,
  getDefaultPaymentMethod,
  type BillingType,
  type PaymentMethod,
} from "@/pages/Financeiro/financeRules";

import {
  getActiveConvenios,
  getActiveProfessionals,
  getActiveRooms,
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

interface AppointmentFormData {
  patientId: string;

  patient: string;

  professional: string;

  specialty: string;

  date: string;

  startTime: string;

  endTime: string;

  room: string;

  appointmentType:
    | "Individual"
    | "Grupo"
    | "Avaliação"
    | "Retorno";

  status:
    | "Agendado"
    | "Confirmado";

  observations: string;

  billingType:
    BillingType;

  convenio: string;

  paymentMethod:
    PaymentMethod;
}

/* =========================================
   VALORES INICIAIS
========================================= */

const initialValues: AppointmentFormData = {
  patientId:
    "",

  patient:
    "",

  professional:
    "",

  specialty:
    "",

  date:
    "",

  startTime:
    "",

  endTime:
    "",

  room:
    "",

  appointmentType:
    "Individual",

  status:
    "Agendado",

  observations:
    "",

  billingType:
    "Particular",

  convenio:
    "",

  paymentMethod:
    "Pix",
};

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export default function NovoAgendamento() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  /* =======================================
     PACIENTES
  ======================================= */

  const patients =
    useMemo(
      () =>
        getPatients()
          .filter(
            (
              patient
            ) =>
              patient.status ===
              "Ativo"
          )
          .sort(
            (
              a,
              b
            ) =>
              a.nome.localeCompare(
                b.nome,
                "pt-BR"
              )
          ),

      []
    );

  const patientIdFromUrl =
    searchParams.get(
      "patientId"
    ) ??
    "";

  const patientFromUrl =
    useMemo(
      () =>
        patients.find(
          (
            patient
          ) =>
            String(
              patient.id
            ) ===
            patientIdFromUrl
        ),

      [
        patients,
        patientIdFromUrl,
      ]
    );

  /* =======================================
     CONFIGURAÇÕES
  ======================================= */

  const activeRooms =
    useMemo(
      () =>
        getActiveRooms(),

      []
    );

  const activeSpecialties =
    useMemo(
      () =>
        getActiveSpecialties(),

      []
    );

  const activeProfessionals =
    useMemo(
      () =>
        getActiveProfessionals(),

      []
    );

  const activeConvenios =
    useMemo(
      () =>
        getActiveConvenios(),

      []
    );

  /* =======================================
     FORMULÁRIO
  ======================================= */

  const [
    formData,
    setFormData,
  ] =
    useState<AppointmentFormData>(
      () => ({
        ...initialValues,

        patientId:
          patientFromUrl
            ? String(
                patientFromUrl.id
              )
            : "",

        patient:
          patientFromUrl?.nome ??
          "",
      })
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
            item
          ) =>
            item.name ===
            formData.professional
        ),

      [
        activeProfessionals,

        formData.professional,
      ]
    );

  /* =======================================
     CONVÊNIO SELECIONADO
  ======================================= */

  const selectedConvenio =
    useMemo(
      () =>
        activeConvenios.find(
          (
            item
          ) =>
            item.name ===
            formData.convenio
        ),

      [
        activeConvenios,

        formData.convenio,
      ]
    );

  /* =======================================
     VALOR DO SERVIÇO
  ======================================= */

  const serviceValue =
    useMemo(
      () => {
        if (
          !formData.professional ||
          !formData.specialty
        ) {
          return 0;
        }

        if (
          formData.billingType ===
            "Convênio" &&
          !formData.convenio
        ) {
          return 0;
        }

        return calculateChargeAmount(
          {
            professional:
              formData.professional,

            specialty:
              formData.specialty,

            billingType:
              formData.billingType,

            convenio:
              formData.convenio ||
              undefined,
          }
        );
      },

      [
        formData.professional,

        formData.specialty,

        formData.billingType,

        formData.convenio,
      ]
    );

  /* =======================================
     CONFLITO DA AGENDA
  ======================================= */

  const scheduleConflict =
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

            room:
              formData.room ||
              undefined,
          }
        );
      },

      [
        formData.professional,

        formData.date,

        formData.startTime,

        formData.endTime,

        formData.room,
      ]
    );

  /* =======================================
     ATUALIZAR CAMPO
  ======================================= */

  function updateField<
    K extends keyof AppointmentFormData
  >(
    field: K,

    value:
      AppointmentFormData[K]
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
     TROCA DE PACIENTE
  ======================================= */

  function handlePatientChange(
    patientId: string
  ) {
    const selected =
      patients.find(
        (
          patient
        ) =>
          String(
            patient.id
          ) ===
          patientId
      );

    setFormData(
      (
        current
      ) => ({
        ...current,

        patientId,

        patient:
          selected?.nome ??
          "",
      })
    );

    clearFeedback();
  }

  /* =======================================
     NOVO PACIENTE
  ======================================= */

  function handleNewPatient() {
    const returnTo =
      patientIdFromUrl
        ? `/agenda/novo?patientId=${patientIdFromUrl}`
        : "/agenda/novo";

    navigate(
      `/pacientes/novo?returnTo=${encodeURIComponent(
        returnTo
      )}`
    );
  }

  /* =======================================
     TROCA DE PROFISSIONAL
  ======================================= */

  function handleProfessionalChange(
    professionalName: string
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
     TROCA DO HORÁRIO INICIAL
  ======================================= */

  function handleStartTimeChange(
    startTime: string
  ) {
    setFormData(
      (
        current
      ) => ({
        ...current,

        startTime,

        endTime:
          startTime
            ? addMinutesToTime(
                startTime,

                50
              )
            : "",
      })
    );

    clearFeedback();
  }

  /* =======================================
     TIPO DE COBRANÇA
  ======================================= */

  function handleBillingTypeChange(
    billingType:
      BillingType
  ) {
    setFormData(
      (
        current
      ) => ({
        ...current,

        billingType,

        convenio:
          "",

        paymentMethod:
          getDefaultPaymentMethod(
            billingType
          ),
      })
    );

    clearFeedback();
  }

  /* =======================================
     VALIDAÇÃO
  ======================================= */

  function validate() {
    if (
      !formData.patientId ||
      !formData.patient
    ) {
      showError(
        "Selecione o paciente."
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
      !formData.date
    ) {
      showError(
        "Informe a data do atendimento."
      );

      return false;
    }

    if (
      !formData.startTime ||
      !formData.endTime
    ) {
      showError(
        "Informe os horários de início e fim."
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
      !formData.room
    ) {
      showError(
        "Selecione a sala."
      );

      return false;
    }

    if (
      formData.billingType ===
        "Convênio" &&
      !formData.convenio
    ) {
      showError(
        "Selecione o convênio."
      );

      return false;
    }

    if (
      scheduleConflict
    ) {
      showError(
        scheduleConflict.description
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
      const selectedPatient =
        patients.find(
          (
            patient
          ) =>
            String(
              patient.id
            ) ===
            formData.patientId
        );

      if (
        !selectedPatient
      ) {
        showError(
          "Paciente não encontrado."
        );

        setSaving(
          false
        );

        return;
      }

      const appointment:
        StoredAppointment = {
        id:
          Date.now(),

        patientId:
          selectedPatient.id,

        patient:
          selectedPatient.nome,

        professional:
          formData.professional,

        specialty:
          formData.specialty,

        date:
          formData.date,

        time:
          formData.startTime,

        endTime:
          formData.endTime,

        room:
          formData.room,

        type:
          formData.appointmentType,

        status:
          formData.status,

        observations:
          formData.observations,

        billingType:
          formData.billingType,

        convenio:
          formData.billingType ===
          "Convênio"
            ? formData.convenio
            : undefined,

        paymentMethod:
          formData.paymentMethod,

        serviceValue,
      };

      saveAppointment(
        appointment
      );

      setFeedback(
        "Agendamento criado com sucesso."
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
        "Não foi possível criar o agendamento."
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
            onClick={() =>
              navigate(
                "/agenda"
              )
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
            Novo Agendamento
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre o atendimento, horário e informações financeiras.
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
        {/* PACIENTE E PROFISSIONAL */}
        {/* ================================= */}

        <PageCard
          title="Paciente e Profissional"
          description="Selecione quem será atendido e o profissional responsável."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ============================= */}
            {/* PACIENTE */}
            {/* ============================= */}

            <FormField
              label="Paciente"
              required
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <Select
                    value={
                      formData.patientId
                    }
                    onChange={(
                      event
                    ) =>
                      handlePatientChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione o paciente
                    </option>

                    {patients.map(
                      (
                        patient
                      ) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            String(
                              patient.id
                            )
                          }
                        >
                          {
                            patient.nome
                          }
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleNewPatient
                  }
                  className="shrink-0"
                >
                  <UserPlus
                    size={17}
                  />

                  Novo paciente
                </Button>
              </div>

              {patients.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  Nenhum paciente ativo cadastrado. Cadastre um paciente para continuar.
                </p>
              )}
            </FormField>

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

            {/* ============================= */}
            {/* ESPECIALIDADE */}
            {/* ============================= */}

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

            {/* ============================= */}
            {/* PROFISSIONAL SELECIONADO */}
            {/* ============================= */}

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex items-start gap-3">
                  <Stethoscope
                    size={
                      20
                    }
                    className="mt-0.5 text-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-indigo-800">
                      Profissional selecionado
                    </p>

                    <p className="mt-1 text-sm font-medium text-indigo-700">
                      {selectedProfessional?.name ??
                        "Selecione um profissional"}
                    </p>

                    {selectedProfessional && (
                      <>
                        <p className="mt-1 text-xs text-indigo-600">
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageCard>

        {/* ================================= */}
        {/* DATA E HORÁRIO */}
        {/* ================================= */}

        <PageCard
          title="Data e Horário"
          description="O sistema verifica automaticamente conflitos do profissional, bloqueios e ocupação da sala."
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
                  handleStartTimeChange(
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
          {/* VERIFICAÇÃO */}
          {/* =============================== */}

          <div className="mt-5">
            {!formData.professional ||
            !formData.date ||
            !formData.startTime ||
            !formData.endTime ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Clock3
                  size={
                    19
                  }
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Verificação de horário
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Informe profissional, data e horário.
                  </p>
                </div>
              </div>
            ) : scheduleConflict ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={
                    20
                  }
                  className="mt-0.5 text-red-600"
                />

                <div>
                  <p className="font-semibold text-red-800">
                    {
                      scheduleConflict.title
                    }
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      scheduleConflict.description
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
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="font-semibold text-emerald-800">
                    Horário disponível
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Nenhum conflito encontrado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        {/* ================================= */}
        {/* DETALHES */}
        {/* ================================= */}

        <PageCard
          title="Detalhes do Atendimento"
          description="Sala, tipo e situação."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ============================= */}
            {/* SALA */}
            {/* ============================= */}

            <FormField
              label="Sala"
              required
            >
              <Select
                value={
                  formData.room
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "room",

                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione a sala
                </option>

                {activeRooms.map(
                  (
                    room
                  ) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.name
                      }
                    >
                      {
                        room.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

            {/* ============================= */}
            {/* TIPO */}
            {/* ============================= */}

            <FormField
              label="Tipo"
            >
              <Select
                value={
                  formData.appointmentType
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "appointmentType",

                    event.target
                      .value as AppointmentFormData["appointmentType"]
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

                <option value="Retorno">
                  Retorno
                </option>
              </Select>
            </FormField>

            {/* ============================= */}
            {/* STATUS */}
            {/* ============================= */}

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
                      .value as AppointmentFormData["status"]
                  )
                }
              >
                <option value="Agendado">
                  Agendado
                </option>

                <option value="Confirmado">
                  Confirmado
                </option>
              </Select>
            </FormField>
          </div>
        </PageCard>

        {/* ================================= */}
        {/* FINANCEIRO */}
        {/* ================================= */}

        <PageCard
          title="Financeiro"
          description="Defina como este atendimento será cobrado."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* ============================= */}
            {/* TIPO DE COBRANÇA */}
            {/* ============================= */}

            <FormField
              label="Tipo de atendimento"
              required
            >
              <Select
                value={
                  formData.billingType
                }
                onChange={(
                  event
                ) =>
                  handleBillingTypeChange(
                    event.target
                      .value as BillingType
                  )
                }
              >
                <option value="Particular">
                  Particular
                </option>

                <option value="Convênio">
                  Convênio
                </option>
              </Select>
            </FormField>

            {/* ============================= */}
            {/* CONVÊNIO */}
            {/* ============================= */}

            {formData.billingType ===
              "Convênio" && (
              <FormField
                label="Convênio"
                required
              >
                <Select
                  value={
                    formData.convenio
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "convenio",

                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione o convênio
                  </option>

                  {activeConvenios.map(
                    (
                      convenio
                    ) => (
                      <option
                        key={
                          convenio.id
                        }
                        value={
                          convenio.name
                        }
                      >
                        {
                          convenio.name
                        }
                      </option>
                    )
                  )}
                </Select>

                {activeConvenios.length ===
                  0 && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Nenhum convênio ativo nas Configurações.
                  </p>
                )}
              </FormField>
            )}

            {/* ============================= */}
            {/* PAGAMENTO */}
            {/* ============================= */}

            <FormField
              label="Forma de pagamento"
            >
              <Select
                value={
                  formData.paymentMethod
                }
                disabled={
                  formData.billingType ===
                  "Convênio"
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "paymentMethod",

                    event.target
                      .value as PaymentMethod
                  )
                }
              >
                <option value="Pix">
                  Pix
                </option>

                <option value="Dinheiro">
                  Dinheiro
                </option>

                <option value="Cartão de débito">
                  Cartão de débito
                </option>

                <option value="Cartão de crédito">
                  Cartão de crédito
                </option>

                <option value="Transferência">
                  Transferência
                </option>

                <option value="Convênio">
                  Convênio
                </option>
              </Select>
            </FormField>

            {/* ============================= */}
            {/* VALOR */}
            {/* ============================= */}

            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <CreditCard
                  size={
                    18
                  }
                />

                <span className="text-sm font-semibold">
                  Valor previsto
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-indigo-900">
                {
                  formatCurrency(
                    serviceValue
                  )
                }
              </p>

              {formData.billingType ===
              "Particular" ? (
                <p className="mt-1 text-xs text-indigo-600">
                  {selectedProfessional?.customValue
                    ? "Valor específico do profissional"
                    : "Valor padrão da especialidade"}
                </p>
              ) : selectedConvenio ? (
                <p className="mt-1 text-xs text-indigo-600">
                  {selectedConvenio
                    .specialtyValues[
                    formData.specialty
                  ]
                    ? "Valor específico do convênio"
                    : `Regra padrão: ${selectedConvenio.discountPercent}% de desconto`}
                </p>
              ) : (
                <p className="mt-1 text-xs text-indigo-600">
                  Selecione o convênio
                </p>
              )}
            </div>
          </div>
        </PageCard>

        {/* ================================= */}
        {/* OBSERVAÇÕES */}
        {/* ================================= */}

        <PageCard
          title="Observações"
          description="Informações adicionais."
        >
          <textarea
            value={
              formData.observations
            }
            onChange={(
              event
            ) =>
              updateField(
                "observations",

                event.target.value
              )
            }
            maxLength={
              500
            }
            placeholder="Observações sobre o atendimento..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </PageCard>

        {/* ================================= */}
        {/* BARRA INFERIOR */}
        {/* ================================= */}

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays
                size={
                  18
                }
                className="text-indigo-500"
              />

              Profissional, sala e convênios são validados automaticamente.
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(
                    "/agenda"
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving ||
                  Boolean(
                    scheduleConflict
                  ) ||
                  patients.length ===
                    0 ||
                  activeProfessionals.length ===
                    0 ||
                  activeRooms.length ===
                    0 ||
                  (
                    formData.billingType ===
                      "Convênio" &&
                    activeConvenios.length ===
                      0
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
                  : "Salvar agendamento"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}