import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Save,
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

import {
  getSavedAppointments,
  updateSavedAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  checkScheduleConflict,
} from "./scheduleValidation";

const defaultAppointments: StoredAppointment[] = [
  {
    id: 1,
    patientId: 1,
    patient: "Maria Oliveira",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
    date: "2026-08-07",
    time: "08:00",
    endTime: "08:50",
    room: "Sala 01",
    type: "Individual",
    status: "Realizado",
  },
  {
    id: 2,
    patientId: 2,
    patient: "João Miguel Silva",
    professional: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
    date: "2026-08-07",
    time: "08:00",
    endTime: "08:50",
    room: "Sala 02",
    type: "Individual",
    status: "Confirmado",
  },
  {
    id: 3,
    patientId: 3,
    patient: "Lucas Gabriel",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
    date: "2026-08-07",
    time: "09:00",
    endTime: "09:50",
    room: "Sala 01",
    type: "Individual",
    status: "Confirmado",
  },
  {
    id: 4,
    patientId: 4,
    patient: "Ana Clara Rodrigues",
    professional: "Dra. Larissa Lima",
    specialty: "Terapia Ocupacional",
    date: "2026-08-07",
    time: "10:00",
    endTime: "10:50",
    room: "Sala 03",
    type: "Individual",
    status: "Agendado",
  },
  {
    id: 5,
    patientId: 5,
    patient: "Pedro Henrique",
    professional: "Dr. Rafael Costa",
    specialty: "Fisioterapia",
    date: "2026-08-07",
    time: "11:00",
    endTime: "11:50",
    room: "Sala 04",
    type: "Avaliação",
    status: "Cancelado",
  },
  {
    id: 6,
    patientId: 1,
    patient: "Maria Oliveira",
    professional: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
    date: "2026-08-07",
    time: "14:00",
    endTime: "14:50",
    room: "Sala 02",
    type: "Individual",
    status: "Agendado",
  },
  {
    id: 7,
    patientId: 3,
    patient: "Lucas Gabriel",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
    date: "2026-08-08",
    time: "09:00",
    endTime: "09:50",
    room: "Sala 01",
    type: "Individual",
    status: "Agendado",
  },
  {
    id: 8,
    patientId: 1,
    patient: "Maria Oliveira",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
    date: "2026-08-10",
    time: "10:30",
    endTime: "11:20",
    room: "Sala 01",
    type: "Individual",
    status: "Confirmado",
  },
];

const professionals = [
  {
    name: "Dra. Ana Paula",
    specialty: "Psicologia",
  },
  {
    name: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
  },
  {
    name: "Dra. Larissa Lima",
    specialty:
      "Terapia Ocupacional",
  },
  {
    name: "Dr. Rafael Costa",
    specialty: "Fisioterapia",
  },
];

const rooms = [
  "Sala 01",
  "Sala 02",
  "Sala 03",
  "Sala 04",
];

export default function RemarcarAgendamento() {
  const navigate =
    useNavigate();

  const {
    appointmentId,
  } = useParams();

  const numericId =
    Number(
      appointmentId
    );

  const savedAppointments =
    getSavedAppointments();

  const appointment =
    [
      ...defaultAppointments,
      ...savedAppointments,
    ].find(
      (item) =>
        item.id ===
        numericId
    );

  const isSavedAppointment =
    savedAppointments.some(
      (item) =>
        item.id ===
        numericId
    );

  const [
    date,
    setDate,
  ] =
    useState(
      appointment?.date ??
        ""
    );

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      appointment?.time ??
        ""
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      appointment?.endTime ??
        ""
    );

  const [
    professional,
    setProfessional,
  ] =
    useState(
      appointment?.professional ??
        ""
    );

  const [
    specialty,
    setSpecialty,
  ] =
    useState(
      appointment?.specialty ??
        ""
    );

  const [
    room,
    setRoom,
  ] =
    useState(
      appointment?.room ??
        ""
    );

  const [
    reason,
    setReason,
  ] =
    useState("");

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

  const conflict =
    useMemo(() => {
      if (
        !professional ||
        !date ||
        !startTime ||
        !endTime
      ) {
        return null;
      }

      return checkScheduleConflict(
        {
          professional,
          date,
          startTime,
          endTime,

          ignoreAppointmentId:
            numericId,
        }
      );
    }, [
      professional,
      date,
      startTime,
      endTime,
      numericId,
    ]);

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Agendamento não encontrado
          </h1>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/agenda"
              )
            }
          >
            Voltar para agenda
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  function handleProfessionalChange(
    value: string
  ) {
    const selected =
      professionals.find(
        (item) =>
          item.name ===
          value
      );

    setProfessional(
      value
    );

    setSpecialty(
      selected?.specialty ??
        ""
    );

    clearFeedback();
  }

  async function handleSave() {
    if (
      !date ||
      !startTime ||
      !endTime ||
      !professional ||
      !room
    ) {
      showError(
        "Preencha os campos obrigatórios."
      );

      return;
    }

    if (
      startTime >=
      endTime
    ) {
      showError(
        "O horário final deve ser posterior ao horário inicial."
      );

      return;
    }

    if (conflict) {
      showError(
        conflict.description
      );

      return;
    }

    if (
      !isSavedAppointment
    ) {
      showError(
        "Os atendimentos de exemplo ainda não podem ser alterados permanentemente. Crie um novo agendamento para testar a remarcação persistente."
      );

      return;
    }

    setSaving(true);

    try {
      updateSavedAppointment(
        numericId,
        {
          date,
          time:
            startTime,
          endTime,
          professional,
          specialty,
          room,
        }
      );

      console.log(
        "Agendamento remarcado:",
        {
          appointmentId:
            numericId,
          date,
          startTime,
          endTime,
          professional,
          specialty,
          room,
          reason,
        }
      );

      setFeedback(
        "Agendamento remarcado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(() => {
        navigate(
          `/agenda/${numericId}`
        );
      }, 700);
    } catch {
      showError(
        "Não foi possível remarcar o atendimento."
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

  function clearFeedback() {
    setFeedback(null);
    setFeedbackType(null);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/agenda/${numericId}`
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para detalhes
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Remarcar Atendimento
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Altere a data, horário, profissional ou sala.
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

        {!isSavedAppointment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Este é um atendimento de demonstração. Por enquanto, apenas os novos agendamentos criados pelo sistema podem ser salvos após a remarcação.
          </div>
        )}

        <PageCard
          title="Atendimento"
          description={`Agendamento #${appointment.id}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Summary
              label="Paciente"
              value={
                appointment.patient
              }
            />

            <Summary
              label="Profissional atual"
              value={
                appointment.professional
              }
            />

            <Summary
              label="Especialidade"
              value={
                appointment.specialty
              }
            />
          </div>
        </PageCard>

        <PageCard
          title="Novo Horário"
          description="Defina a nova data e horário."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField
              label="Data"
              required
            >
              <Input
                type="date"
                value={
                  date
                }
                onChange={(
                  event
                ) => {
                  setDate(
                    event.target
                      .value
                  );

                  clearFeedback();
                }}
              />
            </FormField>

            <FormField
              label="Hora início"
              required
            >
              <Input
                type="time"
                value={
                  startTime
                }
                onChange={(
                  event
                ) => {
                  setStartTime(
                    event.target
                      .value
                  );

                  clearFeedback();
                }}
              />
            </FormField>

            <FormField
              label="Hora fim"
              required
            >
              <Input
                type="time"
                value={
                  endTime
                }
                onChange={(
                  event
                ) => {
                  setEndTime(
                    event.target
                      .value
                  );

                  clearFeedback();
                }}
              />
            </FormField>
          </div>

          <div className="mt-5">
            {conflict ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {
                      conflict.title
                    }
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      conflict.description
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
                    Nenhum conflito encontrado para este período.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        <PageCard
          title="Profissional e Sala"
          description="Altere o responsável ou o local do atendimento."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField
              label="Profissional"
              required
            >
              <Select
                value={
                  professional
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
                {professionals.map(
                  (item) => (
                    <option
                      key={
                        item.name
                      }
                      value={
                        item.name
                      }
                    >
                      {
                        item.name
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
                  specialty
                }
                readOnly
              />
            </FormField>

            <FormField
              label="Sala"
              required
            >
              <Select
                value={
                  room
                }
                onChange={(
                  event
                ) => {
                  setRoom(
                    event.target
                      .value
                  );

                  clearFeedback();
                }}
              >
                {rooms.map(
                  (item) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </Select>
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Motivo da Remarcação"
          description="Informe o motivo para manter o histórico."
        >
          <textarea
            value={
              reason
            }
            onChange={(
              event
            ) =>
              setReason(
                event.target
                  .value
              )
            }
            maxLength={300}
            placeholder="Ex.: solicitação do responsável, indisponibilidade do profissional..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-400">
            {
              reason.length
            }
            /300
          </div>
        </PageCard>

        <div className="sticky bottom-0 z-20 flex flex-col gap-4 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays
              size={17}
              className="text-indigo-500"
            />

            O novo horário será validado antes de salvar.
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  `/agenda/${numericId}`
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={
                saving ||
                Boolean(
                  conflict
                ) ||
                !isSavedAppointment
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
                : "Confirmar remarcação"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface SummaryProps {
  label:
    string;

  value:
    string;
}

function Summary({
  label,
  value,
}: SummaryProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}