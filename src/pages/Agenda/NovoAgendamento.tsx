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
  Save,
  Stethoscope,
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

import {
  addMinutesToTime,
  checkScheduleConflict,
} from "./scheduleValidation";

import {
  saveAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

interface AppointmentFormData {
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
}

const initialValues: AppointmentFormData = {
  patient: "",
  professional: "",
  specialty: "",

  date: "",

  startTime: "",
  endTime: "",

  room: "",

  appointmentType:
    "Individual",

  status:
    "Agendado",

  observations: "",
};

const patients = [
  {
    id: 1,
    name:
      "Maria Oliveira",
  },

  {
    id: 2,
    name:
      "João Miguel Silva",
  },

  {
    id: 3,
    name:
      "Lucas Gabriel",
  },

  {
    id: 4,
    name:
      "Ana Clara Rodrigues",
  },

  {
    id: 5,
    name:
      "Pedro Henrique",
  },
];

const professionals = [
  {
    id: 1,

    name:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",
  },

  {
    id: 2,

    name:
      "Dra. Camila Soares",

    specialty:
      "Fonoaudiologia",
  },

  {
    id: 3,

    name:
      "Dra. Larissa Lima",

    specialty:
      "Terapia Ocupacional",
  },

  {
    id: 4,

    name:
      "Dr. Rafael Costa",

    specialty:
      "Fisioterapia",
  },
];

const rooms = [
  "Sala 01",
  "Sala 02",
  "Sala 03",
  "Sala 04",
];

export default function NovoAgendamento() {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] =
    useState<AppointmentFormData>(
      initialValues
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string | null
    >(null);

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      | "success"
      | "error"
      | null
    >(null);

  const selectedProfessional =
    useMemo(
      () =>
        professionals.find(
          (item) =>
            item.name ===
            formData.professional
        ),
      [
        formData.professional,
      ]
    );

  const scheduleConflict =
    useMemo(() => {
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
    }, [
      formData.professional,
      formData.date,
      formData.startTime,
      formData.endTime,
    ]);

  function updateField<
    K extends keyof AppointmentFormData
  >(
    field: K,
    value: AppointmentFormData[K]
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

  function handleProfessionalChange(
    professionalName: string
  ) {
    const selected =
      professionals.find(
        (item) =>
          item.name ===
          professionalName
      );

    setFormData(
      (current) => ({
        ...current,

        professional:
          professionalName,

        specialty:
          selected?.specialty ??
          "",
      })
    );

    setFeedback(null);
    setFeedbackType(null);
  }

  function handleStartTimeChange(
    startTime: string
  ) {
    setFormData(
      (current) => ({
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

    setFeedback(null);
    setFeedbackType(null);
  }

  function handleCancel() {
    navigate(
      "/agenda"
    );
  }

  function validate() {
    if (
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
      scheduleConflict
    ) {
      showError(
        scheduleConflict.description
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
      const selectedPatient =
        patients.find(
          (patient) =>
            patient.name ===
            formData.patient
        );

      const appointment: StoredAppointment = {
        id:
          Date.now(),

        patientId:
          selectedPatient?.id ??
          0,

        patient:
          formData.patient,

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
      };

      saveAppointment(
        appointment
      );

      console.log(
        "Novo agendamento:",
        appointment
      );

      setFeedback(
        "Agendamento criado com sucesso."
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
      showError(
        "Não foi possível criar o agendamento."
      );
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={
              handleCancel
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para agenda
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Novo Agendamento
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre um atendimento respeitando a disponibilidade do profissional.
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
          title="Paciente e Profissional"
          description="Selecione quem será atendido e o profissional responsável."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Paciente"
              required
            >
              <Select
                value={
                  formData.patient
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "patient",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Selecione o paciente
                </option>

                {patients.map(
                  (patient) => (
                    <option
                      key={
                        patient.id
                      }
                      value={
                        patient.name
                      }
                    >
                      {
                        patient.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

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
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Selecione o profissional
                </option>

                {professionals.map(
                  (professional) => (
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
                placeholder="Preenchida automaticamente"
              />
            </FormField>

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex items-start gap-3">
                  <Stethoscope
                    size={20}
                    className="mt-0.5 text-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-indigo-800">
                      Especialidade selecionada
                    </p>

                    <p className="mt-1 text-sm text-indigo-700">
                      {selectedProfessional?.specialty ??
                        "Selecione um profissional"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageCard>

        <PageCard
          title="Data e Horário"
          description="O sistema verifica automaticamente conflitos de agenda."
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
                  handleStartTimeChange(
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

          <div className="mt-5">
            {!formData.professional ||
            !formData.date ||
            !formData.startTime ||
            !formData.endTime ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Clock3
                  size={19}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Verificação de horário
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecione profissional, data e horário para verificar a disponibilidade.
                  </p>
                </div>
              </div>
            ) : scheduleConflict ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {
                      scheduleConflict.title
                    }
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {
                      scheduleConflict.description
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Horário disponível
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Nenhum atendimento ou bloqueio foi encontrado neste período.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        <PageCard
          title="Detalhes do Atendimento"
          description="Configure sala, tipo e situação do agendamento."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Selecione a sala
                </option>

                {rooms.map(
                  (room) => (
                    <option
                      key={
                        room
                      }
                      value={
                        room
                      }
                    >
                      {room}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField
              label="Tipo de atendimento"
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

        <PageCard
          title="Observações"
          description="Informações adicionais sobre o atendimento."
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
                event.target
                  .value
              )
            }
            maxLength={500}
            placeholder="Ex.: responsável solicitou primeiro horário, paciente levará laudo atualizado..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              formData.observations
                .length
            }
            /500
          </div>
        </PageCard>

        <div className="sticky bottom-0 z-20 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays
                size={18}
                className="text-indigo-500"
              />

              O sistema bloqueia horários com conflito.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={
                  handleCancel
                }
                disabled={
                  saving
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
                  )
                }
              >
                <Save
                  size={17}
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