import {
  useEffect,
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
  checkScheduleConflict,
} from "./scheduleValidation";

import {
  atualizarAgendamento,
  buscarAgendamento,
  paraStoredAppointment,
  type RealAppointment,
} from "@/services/agenda";

import {
  listarProfissionais,
  listarSalas,
  type ApiProfissional,
  type ApiSala,
} from "@/services/referencias";

import {
  useUnit,
} from "@/providers/UnitContext";

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

  const { activeUnitId } = useUnit();

  /* =======================================
     REFERÊNCIAS (API)
  ======================================= */

  const [apiProfissionais, setApiProfissionais] = useState<ApiProfissional[]>([]);
  const [apiRooms, setApiRooms] = useState<ApiSala[]>([]);

  useEffect(() => {
    listarProfissionais().then(setApiProfissionais).catch(() => {});
    listarSalas().then((dados) => setApiRooms(dados.filter((r) => r.ativa))).catch(() => {});
  }, []);

  const activeProfessionals = useMemo(
    () =>
      apiProfissionais.map((p) => ({
        id: p.id,
        name: p.usuario.nome,
        specialty: p.especialidades[0]?.especialidade.nome ?? "",
        registration: p.registro ?? "",
      })),
    [apiProfissionais]
  );

  const activeRooms = useMemo(
    () => apiRooms.map((r) => ({ id: r.id, name: r.nome })),
    [apiRooms]
  );

  /* =======================================
     AGENDAMENTO
  ======================================= */

  const [appointment, setAppointment] = useState<RealAppointment | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) {
      setFetching(false);
      return;
    }

    let cancelado = false;

    buscarAgendamento(appointmentId)
      .then((dados) => {
        if (cancelado) return;
        const real = paraStoredAppointment(dados, activeUnitId);
        setAppointment(real);
        setDate(real.date);
        setStartTime(real.time);
        setEndTime(real.endTime);
        setProfessional(real.professional);
        setSpecialty(real.specialty);
        setRoom(real.room);
      })
      .catch(() => {
        if (cancelado) return;
        setFetchError("Agendamento não encontrado.");
      })
      .finally(() => {
        if (cancelado) return;
        setFetching(false);
      });

    return () => {
      cancelado = true;
    };
  }, [appointmentId, activeUnitId]);

  /* =======================================
     FORMULÁRIO
  ======================================= */

  const [
    date,
    setDate,
  ] =
    useState(
      ""
    );

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      ""
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      ""
    );

  const [
    professional,
    setProfessional,
  ] =
    useState(
      ""
    );

  const [
    specialty,
    setSpecialty,
  ] =
    useState(
      ""
    );

  const [
    room,
    setRoom,
  ] =
    useState(
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
             * Checagem client-side é só uma prévia (mock, advisory) — a
             * validação autoritativa de conflito acontece no PUT
             * /agendamentos/:id no backend. Por isso não há mais um
             * ignoreAppointmentId numérico correspondente ao UUID real.
             */
          }
        );
      },

      [
        professional,

        date,

        startTime,

        endTime,

        room,
      ]
    );

  /* =======================================
     CARREGANDO
  ======================================= */

  if (
    fetching
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Carregando agendamento…
        </div>
      </DashboardLayout>
    );
  }

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
            {fetchError ?? "O atendimento pode ter sido removido ou não existe."}
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

    setProfessional(
      value
    );

    setSpecialty(
      selected?.specialty ??
      ""
    );

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
      const professionalReal = activeProfessionals.find(
        (item) => item.name === professional
      );

      const roomReal = activeRooms.find((item) => item.name === room);

      if (!professionalReal || !appointmentId) {
        showError("Profissional inválido.");
        setSaving(false);
        return;
      }

      await atualizarAgendamento(appointmentId, {
        profissionalId: professionalReal.id,
        salaId: roomReal?.id,
        dataHora: `${date}T${startTime}:00`,
        dataFim: `${date}T${endTime}:00`,
      });

      // Motivo da remarcação ainda não tem um campo próprio na API —
      // registrado só localmente por enquanto (reason não é enviado).
      if (reason) {
        console.info("Motivo da remarcação (não persistido):", reason);
      }

      setFeedback(
        "Agendamento remarcado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            `/agenda/${appointmentId}`
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
                `/agenda/${appointmentId}`
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
                  `/agenda/${appointmentId}`
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