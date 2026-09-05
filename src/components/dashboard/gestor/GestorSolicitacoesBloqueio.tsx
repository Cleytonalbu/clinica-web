import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  FileClock,
  Lock,
  X,
} from "lucide-react";

import {
  getBlockRequests,
  updateBlockRequestStatus,
  type BlockRequest,
} from "@/pages/Agenda/blockRequestStorage";

import {
  saveBlock,
} from "@/pages/Agenda/blockStorage";

import {
  checkScheduleConflict,
} from "@/pages/Agenda/scheduleValidation";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getEvolutionLaterRequestsByUnit,
  updateEvolutionLaterRequestStatus,
  type EvolutionLaterRequest,
} from "@/pages/Pacientes/evolutionLaterRequestStorage";

import {
  createWebNotification,
} from "@/components/common/webNotificationStorage";

export function GestorSolicitacoesBloqueio() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [requests, setRequests] =
    useState<BlockRequest[]>(() =>
      getBlockRequests()
    );

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [
    evolutionRequests,
    setEvolutionRequests,
  ] =
    useState<
      EvolutionLaterRequest[]
    >(
      () =>
        getEvolutionLaterRequestsByUnit(
          activeUnitId
        )
    );

  const [
    evolutionFeedback,
    setEvolutionFeedback,
  ] =
    useState<
      string |
      null
    >(null);

  const pendingRequests = useMemo(
    () =>
      requests
        .filter(
          (request) =>
            request.status === "Pendente"
        )
        .sort(
          (a, b) =>
            b.createdAt.localeCompare(
              a.createdAt
            )
        ),
    [requests]
  );

  function refreshRequests() {
    setRequests(getBlockRequests());
  }

  function handleApprove(
    request: BlockRequest
  ) {
    const conflict = checkScheduleConflict({
      professional: request.professional,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
    });

    if (conflict) {
      setFeedback(
        `Não foi possível aprovar: ${conflict.description}`
      );
      return;
    }

    saveBlock({
      id: Date.now(),
      professional: request.professional,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      type: request.type,
      reason: request.reason,
    });

    updateBlockRequestStatus(
      request.id,
      "Aprovado"
    );

    setFeedback(
      `Bloqueio de ${request.professional} aprovado com sucesso.`
    );

    refreshRequests();
  }

  function handleReject(
    request: BlockRequest
  ) {
    updateBlockRequestStatus(
      request.id,
      "Recusado"
    );

    setFeedback(
      `Solicitação de ${request.professional} recusada.`
    );

    refreshRequests();
  }

  const pendingEvolutionRequests =
    useMemo(
      () =>
        evolutionRequests
          .filter(
            (
              request
            ) =>
              request.status ===
              "Pendente"
          )
          .sort(
            (
              a,
              b
            ) =>
              b.createdAt.localeCompare(
                a.createdAt
              )
          ),
      [
        evolutionRequests,
      ]
    );

  function refreshEvolutionRequests() {
    setEvolutionRequests(
      getEvolutionLaterRequestsByUnit(
        activeUnitId
      )
    );
  }

  function handleApproveEvolution(
    request:
      EvolutionLaterRequest
  ) {
    updateEvolutionLaterRequestStatus(
      request.id,
      "Aprovado"
    );

    createWebNotification(
      {
        recipientProfile:
          "Profissional",

        recipientName:
          request.professional,

        title:
          "Solicitação de evolução aprovada",

        description:
          `Sua solicitação para concluir depois a evolução de ${request.patientName}, referente ao atendimento de ${formatDate(request.sessionDate)} às ${request.startTime}, foi aprovada pelo gestor.`,

        route:
          `/pacientes/${request.patientId}?tab=evolucoes`,

        sourceType:
          "evolution-later-request",

        sourceReference:
          String(
            request.id
          ),
      }
    );

    setEvolutionFeedback(
      `Solicitação de ${request.professional} aprovada.`
    );

    refreshEvolutionRequests();
  }

  function handleRejectEvolution(
    request:
      EvolutionLaterRequest
  ) {
    updateEvolutionLaterRequestStatus(
      request.id,
      "Recusado"
    );

    createWebNotification(
      {
        recipientProfile:
          "Profissional",

        recipientName:
          request.professional,

        title:
          "Solicitação de evolução recusada",

        description:
          `Sua solicitação para concluir depois a evolução de ${request.patientName}, referente ao atendimento de ${formatDate(request.sessionDate)} às ${request.startTime}, foi recusada pelo gestor.`,

        route:
          `/pacientes/${request.patientId}?tab=evolucoes`,

        sourceType:
          "evolution-later-request",

        sourceReference:
          String(
            request.id
          ),
      }
    );

    setEvolutionFeedback(
      `Solicitação de ${request.professional} recusada.`
    );

    refreshEvolutionRequests();
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-[#e3e7f2] bg-white shadow-[0_8px_30px_rgba(42,55,105,0.06)]">
      <div className="flex flex-col gap-3 border-b border-[#edf0f7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
              <Lock size={18} />
            </span>

            <div>
              <h2 className="text-base font-bold text-[#15255c]">
                Solicitações de bloqueio
              </h2>
              <p className="mt-0.5 text-xs font-medium text-[#8993ad]">
                Aprovação de indisponibilidades solicitadas pelos profissionais.
              </p>
            </div>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-[#f2efff] px-3 py-1 text-xs font-bold text-[#6847f5]">
          {pendingRequests.length} pendente{pendingRequests.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="p-5">
        {feedback && (
          <div className="mb-4 rounded-xl border border-[#e3defe] bg-[#f8f6ff] px-4 py-3 text-sm font-medium text-[#5d45c7]">
            {feedback}
          </div>
        )}

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfe4f0] bg-[#fbfcff] px-5 py-8 text-center">
            <Lock
              size={28}
              className="mx-auto text-[#bdc5d8]"
            />
            <p className="mt-3 text-sm font-bold text-[#4e5d82]">
              Nenhuma solicitação pendente
            </p>
            <p className="mt-1 text-xs font-medium text-[#929bb2]">
              Novas solicitações dos profissionais aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-[#e6e9f2] bg-white p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[#1e2f67]">
                        {request.professional}
                      </p>

                      <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[11px] font-bold text-[#b97a11]">
                        Pendente
                      </span>

                      <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-bold text-[#6847f5]">
                        {request.type}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#6f7b9d]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={15} />
                        {formatDate(request.date)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} />
                        {request.startTime} às {request.endTime}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#5d6888]">
                      <strong className="font-bold text-[#39496f]">
                        Motivo:
                      </strong>{" "}
                      {request.reason}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleReject(request)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#f0cfd5] bg-white px-4 text-sm font-bold text-[#d44e67] transition hover:bg-[#fff7f8]"
                    >
                      <X size={16} />
                      Recusar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(request)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(103,66,246,0.18)] transition hover:opacity-95"
                    >
                      <Check size={16} />
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e3e7f2] bg-white shadow-[0_8px_30px_rgba(42,55,105,0.06)]">
        <div className="flex flex-col gap-3 border-b border-[#edf0f7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#4d6fe8]">
              <FileClock size={18} />
            </span>

            <div>
              <h2 className="text-base font-bold text-[#15255c]">
                Solicitações para evolução posterior
              </h2>

              <p className="mt-0.5 text-xs font-medium text-[#8993ad]">
                Pedidos dos profissionais para concluir uma evolução após o atendimento.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#4d6fe8]">
            {pendingEvolutionRequests.length} pendente{pendingEvolutionRequests.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-5">
          {evolutionFeedback && (
            <div className="mb-4 rounded-xl border border-[#dbe4ff] bg-[#f6f8ff] px-4 py-3 text-sm font-medium text-[#4963c7]">
              {evolutionFeedback}
            </div>
          )}

          {pendingEvolutionRequests.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-[#dfe4f0] bg-[#fbfcff] px-5 py-8 text-center">
              <FileClock
                size={28}
                className="mx-auto text-[#bdc5d8]"
              />

              <p className="mt-3 text-sm font-bold text-[#4e5d82]">
                Nenhuma solicitação de evolução pendente
              </p>

              <p className="mt-1 text-xs font-medium text-[#929bb2]">
                Novos pedidos dos profissionais aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvolutionRequests.map(
                (
                  request
                ) => (
                  <div
                    key={
                      request.id
                    }
                    className="rounded-2xl border border-[#e6e9f2] bg-white p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-[#1e2f67]">
                            {request.professional}
                          </p>

                          <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[11px] font-bold text-[#b97a11]">
                            Pendente
                          </span>

                          <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#4d6fe8]">
                            Evolução posterior
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-bold text-[#39496f]">
                          Paciente:{" "}
                          {request.patientName}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#6f7b9d]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {formatDate(
                              request.sessionDate
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} />
                            {request.startTime} às{" "}
                            {request.endTime ||
                              "--:--"}
                          </span>

                          <span>
                            {request.specialty}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-[#5d6888]">
                          <strong className="font-bold text-[#39496f]">
                            Motivo:
                          </strong>{" "}
                          {request.reason}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleRejectEvolution(
                              request
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#f0cfd5] bg-white px-4 text-sm font-bold text-[#d44e67] transition hover:bg-[#fff7f8]"
                        >
                          <X size={16} />
                          Recusar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleApproveEvolution(
                              request
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(103,66,246,0.18)] transition hover:opacity-95"
                        >
                          <Check size={16} />
                          Aprovar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(date);
}
