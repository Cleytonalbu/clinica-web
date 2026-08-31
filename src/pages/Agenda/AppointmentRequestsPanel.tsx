import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  calculateChargeAmount,
  getDefaultPaymentMethod,
} from "@/pages/Financeiro/financeRules";

import {
  createChargeFromAppointment,
} from "@/pages/Financeiro/financeStorage";

import {
  saveAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  findFirstAvailableRoom,
  isAppointmentSlotAvailable,
} from "./appointmentAvailability";

import {
  APPOINTMENT_REQUESTS_CHANGED_EVENT,
  getAppointmentRequestsByUnit,
  markAppointmentRequestAsScheduled,
  rejectAppointmentRequest,
  type AppointmentRequest,
} from "./appointmentRequestStorage";

interface AppointmentRequestsPanelProps {
  unitId: number;

  onAppointmentConfirmed?: (
    appointment:
      StoredAppointment
  ) => void;
}

export function AppointmentRequestsPanel({
  unitId,
  onAppointmentConfirmed,
}: AppointmentRequestsPanelProps) {
  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      | {
          type:
            | "success"
            | "error";
          text: string;
        }
      | null
    >(
      null
    );

  const [
    processingId,
    setProcessingId,
  ] =
    useState<
      number |
      null
    >(
      null
    );

  useEffect(
    () => {
      function handleRequestsChanged() {
        setRefreshKey(
          (
            current
          ) =>
            current + 1
        );
      }

      window.addEventListener(
        APPOINTMENT_REQUESTS_CHANGED_EVENT,
        handleRequestsChanged
      );

      return () =>
        window.removeEventListener(
          APPOINTMENT_REQUESTS_CHANGED_EVENT,
          handleRequestsChanged
        );
    },
    []
  );

  const requests =
    useMemo(
      () =>
        getAppointmentRequestsByUnit(
          unitId
        ),

      [
        unitId,
        refreshKey,
      ]
    );

  const pending =
    requests.filter(
      (
        request
      ) =>
        request.status ===
        "Pendente"
    );

  const history =
    requests.filter(
      (
        request
      ) =>
        request.status !==
        "Pendente"
    );

  function refresh() {
    setRefreshKey(
      (
        current
      ) =>
        current + 1
    );
  }

  function confirmRequest(
    request:
      AppointmentRequest
  ) {
    setFeedback(
      null
    );

    setProcessingId(
      request.id
    );

    try {
      /*
       * SEGUNDA VALIDAÇÃO OBRIGATÓRIA:
       * mesmo que o app só tenha exibido horários livres,
       * verificamos novamente no instante da confirmação.
       */
      const availability =
        isAppointmentSlotAvailable(
          {
            unitId:
              request.unitId,

            professional:
              request.professional,

            date:
              request.date,

            startTime:
              request.time,

            endTime:
              request.endTime,
          }
        );

      if (
        !availability.available
      ) {
        setFeedback(
          {
            type:
              "error",

            text:
              `Não foi possível confirmar: ${availability.reason}`,
          }
        );

        return;
      }

      const room =
        findFirstAvailableRoom(
          {
            unitId:
              request.unitId,

            professional:
              request.professional,

            date:
              request.date,

            startTime:
              request.time,

            endTime:
              request.endTime,
          }
        );

      if (
        !room
      ) {
        setFeedback(
          {
            type:
              "error",

            text:
              "O profissional continua disponível, mas não há sala livre para este horário.",
          }
        );

        return;
      }

      /*
       * Checagem final imediatamente antes da gravação.
       * Em produção, esta validação deve ocorrer no backend
       * dentro da mesma transação que cria o agendamento.
       */
      const finalAvailability =
        isAppointmentSlotAvailable(
          {
            unitId:
              request.unitId,

            professional:
              request.professional,

            date:
              request.date,

            startTime:
              request.time,

            endTime:
              request.endTime,
          }
        );

      if (
        !finalAvailability.available
      ) {
        setFeedback(
          {
            type:
              "error",

            text:
              `O horário acabou de ficar indisponível: ${finalAvailability.reason}`,
          }
        );

        return;
      }

      const appointmentId =
        Date.now();

      const billingType =
        request.billingType ??
        "Particular";

      const serviceValue =
        calculateChargeAmount(
          {
            professional:
              request.professional,

            specialty:
              request.specialty,

            billingType,

            convenio:
              request.convenio,

            unitId:
              request.unitId,
          }
        );

      const appointment:
        StoredAppointment = {
        id:
          appointmentId,

        patientId:
          request.patientId,

        unitId:
          request.unitId,

        patient:
          request.patient,

        professionalId:
          request.professionalId,

        professional:
          request.professional,

        specialty:
          request.specialty,

        date:
          request.date,

        time:
          request.time,

        endTime:
          request.endTime,

        room:
          room.name,

        type:
          request.appointmentType,

        status:
          "Agendado",

        observations:
          request.observations
            ? `${request.observations}\n\nSolicitado pelo app.`
            : "Solicitado pelo app.",

        billingType,

        convenioId:
          request.convenioId,

        convenio:
          request.convenio,

        paymentMethod:
          request.paymentMethod ??
          getDefaultPaymentMethod(
            billingType
          ),

        serviceValue,
      };

      saveAppointment(
        appointment
      );

      if (
        billingType !==
        "Convênio"
      ) {
        createChargeFromAppointment(
          {
            unitId:
              request.unitId,

            appointmentId,

            patientId:
              request.patientId,

            patient:
              request.patient,

            professionalId:
              request.professionalId,

            professional:
              request.professional,

            specialty:
              request.specialty,

            date:
              request.date,

            billingType,

            convenioId:
              request.convenioId,

            convenio:
              request.convenio,

            paymentMethod:
              appointment.paymentMethod,

            amount:
              serviceValue,
          }
        );
      }

      markAppointmentRequestAsScheduled(
        request.id,
        appointmentId,
        room.name
      );

      onAppointmentConfirmed?.(
        appointment
      );

      refresh();

      setFeedback(
        {
          type:
            "success",

          text:
            `Agendamento confirmado com sucesso para ${request.date.split("-").reverse().join("/")} às ${request.time}. Sala definida: ${room.name}.`,
        }
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  function rejectRequest(
    request:
      AppointmentRequest
  ) {
    const confirmed =
      window.confirm(
        `Recusar a solicitação de ${request.patient} para ${request.date.split("-").reverse().join("/")} às ${request.time}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    rejectAppointmentRequest(
      request.id,
      "Solicitação recusada pela recepção."
    );

    refresh();

    setFeedback(
      {
        type:
          "success",

        text:
          "Solicitação recusada.",
      }
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            feedback.type ===
            "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.type ===
          "success" ? (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />
          )}

          <span>
            {
              feedback.text
            }
          </span>
        </div>
      )}

      <PageCard
        title={`Solicitações do App (${pending.length})`}
        description="Solicitações enviadas pelos pais e responsáveis. O app exibe apenas horários livres, e o sistema valida novamente antes de confirmar."
      >
        {pending.length >
        0 ? (
          <div className="space-y-4">
            {pending.map(
              (
                request
              ) => (
                <RequestCard
                  key={
                    request.id
                  }
                  request={
                    request
                  }
                  processing={
                    processingId ===
                    request.id
                  }
                  onConfirm={() =>
                    confirmRequest(
                      request
                    )
                  }
                  onReject={() =>
                    rejectRequest(
                      request
                    )
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedff0] bg-[#fbfbfe] px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ecff] text-[#6847f5]">
              <Inbox
                size={25}
              />
            </span>

            <h3 className="mt-4 text-sm font-extrabold text-[#263765]">
              Nenhuma solicitação pendente
            </h3>

            <p className="mt-1 max-w-md text-xs font-medium text-[#8a94af]">
              Novas solicitações feitas pelo app aparecerão automaticamente aqui.
            </p>
          </div>
        )}
      </PageCard>

      {history.length >
        0 && (
        <PageCard
          title="Histórico de solicitações"
          description="Solicitações já processadas pela recepção."
        >
          <div className="divide-y divide-[#eef0f6]">
            {history.map(
              (
                request
              ) => (
                <div
                  key={
                    request.id
                  }
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-[#263765]">
                        {
                          request.patient
                        }
                      </strong>

                      <RequestStatusBadge
                        status={
                          request.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-xs font-medium text-[#7e89a7]">
                      {
                        request.professional
                      }{" "}
                      •{" "}
                      {
                        request.specialty
                      }{" "}
                      •{" "}
                      {
                        request.date
                          .split(
                            "-"
                          )
                          .reverse()
                          .join(
                            "/"
                          )
                      }{" "}
                      às{" "}
                      {
                        request.time
                      }
                    </p>
                  </div>

                  {request.confirmedRoom && (
                    <span className="text-xs font-semibold text-[#68769a]">
                      {
                        request.confirmedRoom
                      }
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </PageCard>
      )}
    </div>
  );
}

function RequestCard({
  request,
  processing,
  onConfirm,
  onReject,
}: {
  request:
    AppointmentRequest;
  processing:
    boolean;
  onConfirm:
    () => void;
  onReject:
    () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_5px_18px_rgba(51,65,120,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#eef0f6] bg-gradient-to-r from-[#faf9ff] to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
            <UserRound
              size={19}
            />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#263765]">
                {
                  request.patient
                }
              </h3>

              <RequestStatusBadge
                status={
                  request.status
                }
              />

              <span className="rounded-full bg-[#eaf4ff] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#3988e8]">
                App
              </span>
            </div>

            <p className="mt-1 text-[11px] font-medium text-[#8993ad]">
              Solicitação recebida em{" "}
              {
                new Date(
                  request.createdAt
                ).toLocaleString(
                  "pt-BR"
                )
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={
              processing
            }
            onClick={
              onReject
            }
            className="border-[#f0dfe4] bg-white text-[#d04f68] hover:bg-[#fff7f8]"
          >
            <XCircle
              size={16}
            />
            Recusar
          </Button>

          <Button
            type="button"
            disabled={
              processing
            }
            onClick={
              onConfirm
            }
            className="bg-[#6847f5] text-white hover:bg-[#5938dc]"
          >
            <CheckCircle2
              size={16}
            />
            {processing
              ? "Validando..."
              : "Confirmar agendamento"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          icon={
            CalendarDays
          }
          label="Data"
          value={
            request.date
              .split(
                "-"
              )
              .reverse()
              .join(
                "/"
              )
          }
        />

        <InfoItem
          icon={
            Clock3
          }
          label="Horário"
          value={`${request.time} às ${request.endTime}`}
        />

        <InfoItem
          icon={
            Stethoscope
          }
          label="Profissional"
          value={
            request.professional
          }
        />

        <InfoItem
          icon={
            MapPin
          }
          label="Especialidade"
          value={
            request.specialty
          }
        />
      </div>

      <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2
          size={15}
          className="mt-0.5 shrink-0"
        />

        <span>
          Este horário estava disponível quando a solicitação foi enviada. Ao confirmar, o sistema verifica novamente profissional, bloqueios e sala.
        </span>
      </div>
    </article>
  );
}

function InfoItem({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof CalendarDays;
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="rounded-xl border border-[#eceef5] bg-[#fbfbfe] px-4 py-3">
      <div className="flex items-center gap-2 text-[#7f8aa8]">
        <Icon
          size={14}
        />

        <span className="text-[9px] font-bold uppercase tracking-wide">
          {
            label
          }
        </span>
      </div>

      <p className="mt-2 text-xs font-extrabold text-[#33436e]">
        {
          value
        }
      </p>
    </div>
  );
}

function RequestStatusBadge({
  status,
}: {
  status:
    AppointmentRequest["status"];
}) {
  const style =
    status ===
    "Pendente"
      ? "bg-amber-50 text-amber-700"
      : status ===
          "Agendado"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${style}`}
    >
      {
        status
      }
    </span>
  );
}
