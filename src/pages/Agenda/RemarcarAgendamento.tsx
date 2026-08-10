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
  getSavedAppointments,
  updateSavedAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  checkScheduleConflict,
} from "./scheduleValidation";

import {
  getActiveProfessionals,
  getActiveRooms,
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   ATENDIMENTOS DE DEMONSTRAÇÃO
========================================= */

const defaultAppointments: StoredAppointment[] = [
  {
    id: 1,

    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-07",

    time:
      "08:00",

    endTime:
      "08:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Realizado",
  },

  {
    id: 2,

    patientId: 2,

    patient:
      "João Miguel Silva",

    professional:
      "Dra. Camila Soares",

    specialty:
      "Fonoaudiologia",

    date:
      "2026-08-07",

    time:
      "08:00",

    endTime:
      "08:50",

    room:
      "Sala 02",

    type:
      "Individual",

    status:
      "Confirmado",
  },

  {
    id: 3,

    patientId: 3,

    patient:
      "Lucas Gabriel",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-07",

    time:
      "09:00",

    endTime:
      "09:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Confirmado",
  },

  {
    id: 4,

    patientId: 4,

    patient:
      "Ana Clara Rodrigues",

    professional:
      "Dra. Larissa Lima",

    specialty:
      "Terapia Ocupacional",

    date:
      "2026-08-07",

    time:
      "10:00",

    endTime:
      "10:50",

    room:
      "Sala 03",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 5,

    patientId: 5,

    patient:
      "Pedro Henrique",

    professional:
      "Dr. Rafael Costa",

    specialty:
      "Fisioterapia",

    date:
      "2026-08-07",

    time:
      "11:00",

    endTime:
      "11:50",

    room:
      "Sala 04",

    type:
      "Avaliação",

    status:
      "Cancelado",
  },

  {
    id: 6,

    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Camila Soares",

    specialty:
      "Fonoaudiologia",

    date:
      "2026-08-07",

    time:
      "14:00",

    endTime:
      "14:50",

    room:
      "Sala 02",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 7,

    patientId: 3,

    patient:
      "Lucas Gabriel",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-08",

    time:
      "09:00",

    endTime:
      "09:50",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Agendado",
  },

  {
    id: 8,

    patientId: 1,

    patient:
      "Maria Oliveira",

    professional:
      "Dra. Ana Paula",

    specialty:
      "Psicologia",

    date:
      "2026-08-10",

    time:
      "10:30",

    endTime:
      "11:20",

    room:
      "Sala 01",

    type:
      "Individual",

    status:
      "Confirmado",
  },
];

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export default function RemarcarAgendamento() {
  const navigate =
    useNavigate();

  const {
    appointmentId,
  } =
    useParams();

  const numericId =
    Number(
      appointmentId
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

  /* =======================================
     AGENDAMENTO
  ======================================= */

  const savedAppointments =
    getSavedAppointments();

  const appointment =
    [
      ...defaultAppointments,

      ...savedAppointments,
    ].find(
      (
        item
      ) =>
        item.id ===
        numericId
    );

  const isSavedAppointment =
    savedAppointments.some(
      (
        item
      ) =>
        item.id ===
        numericId
    );

  /* =======================================
     FORMULÁRIO
  ======================================= */

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
    useState(
      ""
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
            professional
        ),

      [
        activeProfessionals,

        professional,
      ]
    );

  /* =======================================
     VALIDAÇÃO DE CONFLITO
  ======================================= */

  const conflict =
    useMemo(
      () => {
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

            room:
              room ||
              undefined,

            /*
             * Muito importante:
             *
             * ignora o próprio atendimento
             * durante a remarcação.
             */
            ignoreAppointmentId:
              numericId,
          }
        );
      },

      [
        professional,

        date,

        startTime,

        endTime,

        room,

        numericId,
      ]
    );

  /* =======================================
     NÃO ENCONTRADO
  ======================================= */

  if (
    !appointment
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Agendamento não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O atendimento pode ter sido removido ou não existe.
          </p>

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

  /* =======================================
     TROCA DO PROFISSIONAL
  ======================================= */

  function handleProfessionalChange(
    value: string
  ) {
    const selected =
      activeProfessionals.find(
        (
          item
        ) =>
          item.name ===
          value
      );

    const selectedSpecialty =
      selected?.specialty ??
      "";

    const specialtyAvailable =
      activeSpecialties.some(
        (
          item
        ) =>
          item.name ===
          selectedSpecialty
      );

    setProfessional(
      value
    );

    if (
      selected &&
      specialtyAvailable
    ) {
      setSpecialty(
        selected.specialty
      );
    } else {
      setSpecialty(
        ""
      );
    }

    if (
      selected &&
      !specialtyAvailable
    ) {
      showError(
        `A especialidade ${selected.specialty} está inativa.`
      );

      return;
    }

    clearFeedback();
  }

  /* =======================================
     VALIDAR
  ======================================= */

  function validate() {
    if (
      !date
    ) {
      showError(
        "Informe a nova data."
      );

      return false;
    }

    if (
      !startTime ||
      !endTime
    ) {
      showError(
        "Informe os horários de início e fim."
      );

      return false;
    }

    if (
      startTime >=
      endTime
    ) {
      showError(
        "O horário final deve ser posterior ao horário inicial."
      );

      return false;
    }

    if (
      !professional
    ) {
      showError(
        "Selecione o profissional."
      );

      return false;
    }

    if (
      !specialty
    ) {
      showError(
        "Selecione um profissional com especialidade ativa."
      );

      return false;
    }

    if (
      !room
    ) {
      showError(
        "Selecione a sala."
      );

      return false;
    }

    if (
      conflict
    ) {
      showError(
        conflict.description
      );

      return false;
    }

    if (
      !isSavedAppointment
    ) {
      showError(
        "Os atendimentos de exemplo ainda não podem ser alterados permanentemente. Crie um novo agendamento para testar a remarcação persistente."
      );

      return false;
    }

    return true;
  }

  /* =======================================
     SALVAR REMARCAÇÃO
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

      /*
       * Enquanto ainda não temos API,
       * registramos o motivo apenas no
       * console.
       *
       * Posteriormente teremos um
       * histórico real de remarcações.
       */

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

      setTimeout(
        () => {
          navigate(
            `/agenda/${numericId}`
          );
        },

        700
      );
    } catch {
      showError(
        "Não foi possível remarcar o atendimento."
      );
    } finally {
      setSaving(
        false
      );
    }
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
                `/agenda/${numericId}`
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={
                17
              }
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
        {/* AVISO DEMONSTRAÇÃO */}
        {/* ================================= */}

        {!isSavedAppointment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Este é um atendimento de demonstração. Por enquanto, apenas os novos agendamentos criados pelo sistema podem ser salvos após a remarcação.
          </div>
        )}

        {/* ================================= */}
        {/* ATENDIMENTO ORIGINAL */}
        {/* ================================= */}

        <PageCard
          title="Atendimento"
          description={`Agendamento #${appointment.id}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <Summary
              label="Sala atual"
              value={
                appointment.room
              }
            />
          </div>
        </PageCard>

        {/* ================================= */}
        {/* NOVO HORÁRIO */}
        {/* ================================= */}

        <PageCard
          title="Novo Horário"
          description="Defina a nova data e horário."
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
                  date
                }
                onChange={(
                  event
                ) => {
                  setDate(
                    event.target.value
                  );

                  clearFeedback();
                }}
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
                  startTime
                }
                onChange={(
                  event
                ) => {
                  setStartTime(
                    event.target.value
                  );

                  clearFeedback();
                }}
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
                  endTime
                }
                onChange={(
                  event
                ) => {
                  setEndTime(
                    event.target.value
                  );

                  clearFeedback();
                }}
              />
            </FormField>
          </div>

          {/* =============================== */}
          {/* VERIFICAÇÃO */}
          {/* =============================== */}

          <div className="mt-5">
            {!professional ||
            !date ||
            !startTime ||
            !endTime ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <CalendarDays
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Verificação de disponibilidade
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Informe profissional, data e horário para validar a remarcação.
                  </p>
                </div>
              </div>
            ) : conflict ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={
                    20
                  }
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
                  size={
                    20
                  }
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Horário disponível
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Nenhum conflito de profissional, bloqueio ou sala encontrado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </PageCard>

        {/* ================================= */}
        {/* PROFISSIONAL E SALA */}
        {/* ================================= */}

        <PageCard
          title="Profissional e Sala"
          description="Altere o responsável ou o local do atendimento."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* ============================= */}
            {/* PROFISSIONAL */}
            {/* ============================= */}

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
                    event.target.value
                  )
                }
              >
                {activeProfessionals.length ===
                  0 && (
                  <option value="">
                    Nenhum profissional ativo
                  </option>
                )}

                {activeProfessionals.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.name
                      }
                    >
                      {
                        item.name
                      }{" "}
                      -{" "}
                      {
                        item.specialty
                      }
                    </option>
                  )
                )}
              </Select>

              {activeProfessionals.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Nenhum profissional ativo nas Configurações.
                </p>
              )}
            </FormField>

            {/* ============================= */}
            {/* ESPECIALIDADE */}
            {/* ============================= */}

            <FormField
              label="Especialidade"
            >
              <Input
                value={
                  specialty
                }
                readOnly
              />

              {selectedProfessional &&
                selectedProfessional.registration && (
                  <p className="mt-2 text-xs text-slate-500">
                    {
                      selectedProfessional.registration
                    }
                  </p>
                )}
            </FormField>

            {/* ============================= */}
            {/* SALA */}
            {/* ============================= */}

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
                    event.target.value
                  );

                  clearFeedback();
                }}
              >
                {activeRooms.length ===
                  0 && (
                  <option value="">
                    Nenhuma sala ativa
                  </option>
                )}

                {activeRooms.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
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

              {activeRooms.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Nenhuma sala ativa nas Configurações.
                </p>
              )}
            </FormField>
          </div>
        </PageCard>

        {/* ================================= */}
        {/* MOTIVO */}
        {/* ================================= */}

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
                event.target.value
              )
            }
            maxLength={
              300
            }
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

        {/* ================================= */}
        {/* BARRA INFERIOR */}
        {/* ================================= */}

        <div className="sticky bottom-0 z-20 flex flex-col gap-4 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays
              size={
                17
              }
              className="text-indigo-500"
            />

            Profissional, bloqueios e sala serão validados antes de salvar.
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
                !isSavedAppointment ||
                activeProfessionals.length ===
                  0 ||
                activeRooms.length ===
                  0 ||
                !professional ||
                !specialty ||
                !room
              }
              onClick={
                handleSave
              }
            >
              <Save
                size={
                  17
                }
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

/* =========================================
   RESUMO
========================================= */

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
        {
          label
        }
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {
          value
        }
      </p>
    </div>
  );
}