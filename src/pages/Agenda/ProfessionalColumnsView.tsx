import {
  Coffee,
  Lock,
  Palmtree,
  Users,
} from "lucide-react";

import type {
  ScheduleBlock,
} from "./ScheduleBlocksView";

import type {
  StoredAppointment,
} from "./appointmentStorage";

interface AgendaProfessionalColumn {
  id:
    number;

  name:
    string;

  specialty:
    string;
}

interface ProfessionalColumnsViewProps {
  appointments:
    StoredAppointment[];

  professionals:
    AgendaProfessionalColumn[];

  blocks:
    ScheduleBlock[];

  selectedDate:
    string;

  onPatient: (
    patientId: number
  ) => void;

  onDetails: (
    appointmentId: number
  ) => void;
}

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function ProfessionalColumnsView({
  appointments,
  professionals,
  blocks,
  selectedDate,
  onPatient,
  onDetails,
}: ProfessionalColumnsViewProps) {
  const dayAppointments =
    appointments.filter(
      (appointment) =>
        appointment.date ===
        selectedDate
    );

  const dayBlocks =
    blocks.filter(
      (block) =>
        block.date ===
        selectedDate
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="min-w-[900px]"
        style={{
          minWidth:
            `${Math.max(
              900,
              90 +
                professionals.length *
                  220
            )}px`,
        }}
      >
        <div
          className="grid border-b border-slate-200 bg-slate-50"
          style={{
            gridTemplateColumns:
              `90px repeat(${Math.max(
                professionals.length,
                1
              )}, minmax(220px, 1fr))`,
          }}
        >
          <div className="border-r border-slate-200 p-4" />

          {professionals.map(
            (
              professional
            ) => (
              <div
                key={
                  professional.name
                }
                className="border-r border-slate-200 p-4 last:border-r-0"
              >
                <p className="font-semibold text-slate-900">
                  {
                    professional.name
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {
                    professional.specialty
                  }
                </p>
              </div>
            )
          )}
        </div>

        {professionals.length ===
          0 && (
          <div className="flex min-h-48 items-center justify-center px-6 text-center text-sm font-medium text-slate-400">
            Nenhum profissional ativo está vinculado a esta unidade.
          </div>
        )}

        {professionals.length >
          0 &&
          timeSlots.map(
          (time) => (
            <div
              key={
                time
              }
              className="grid border-b border-slate-100 last:border-b-0"
              style={{
                gridTemplateColumns:
                  `90px repeat(${Math.max(
                    professionals.length,
                    1
                  )}, minmax(220px, 1fr))`,
              }}
            >
              <div className="border-r border-slate-200 bg-slate-50/60 p-4 text-center text-sm font-semibold text-slate-500">
                {
                  time
                }
              </div>

              {professionals.map(
                (
                  professional
                ) => {
                  const appointment =
                    dayAppointments.find(
                      (
                        item
                      ) =>
                        item.professional ===
                          professional.name &&
                        item.time ===
                          time
                    );

                  const block =
                    dayBlocks.find(
                      (
                        item
                      ) =>
                        item.professional ===
                          professional.name &&
                        isTimeInsideBlock(
                          time,
                          item.startTime,
                          item.endTime
                        )
                    );

                  return (
                    <div
                      key={`${professional.name}-${time}`}
                      className="min-h-28 border-r border-slate-100 p-2 last:border-r-0"
                    >
                      {appointment ? (
                        <AppointmentBlock
                          appointment={
                            appointment
                          }
                          onPatient={() =>
                            onPatient(
                              appointment.patientId
                            )
                          }
                          onDetails={() =>
                            onDetails(
                              appointment.id
                            )
                          }
                        />
                      ) : block ? (
                        <ScheduleBlockCard
                          block={
                            block
                          }
                        />
                      ) : (
                        <div className="flex h-full min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-100 text-xs text-slate-300">
                          Livre
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface AppointmentBlockProps {
  appointment:
    StoredAppointment;

  onPatient:
    () => void;

  onDetails:
    () => void;
}

function AppointmentBlock({
  appointment,
  onPatient,
  onDetails,
}: AppointmentBlockProps) {
  return (
    <div
      className={`h-full rounded-xl border p-3 ${getStatusStyle(
        appointment.status
      )}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">
          {
            appointment.time
          }
        </p>

        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {
            appointment.status
          }
        </span>
      </div>

      <button
        type="button"
        onClick={
          onPatient
        }
        className="mt-2 block w-full text-left text-sm font-semibold transition hover:underline"
      >
        {
          appointment.patient
        }
      </button>

      <p className="mt-1 text-xs opacity-80">
        {
          appointment.room
        }{" "}
        •{" "}
        {
          appointment.type
        }
      </p>

      <button
        type="button"
        onClick={
          onDetails
        }
        className="mt-3 text-xs font-semibold underline-offset-2 hover:underline"
      >
        Ver detalhes
      </button>
    </div>
  );
}

function ScheduleBlockCard({
  block,
}: {
  block:
    ScheduleBlock;
}) {
  const config =
    getBlockConfig(
      block.type
    );

  const Icon =
    config.icon;

  return (
    <div
      className={`h-full rounded-xl border p-3 ${config.className}`}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={16}
        />

        <span className="text-xs font-bold uppercase tracking-wide">
          {
            block.type
          }
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold">
        {
          block.startTime
        }{" "}
        às{" "}
        {
          block.endTime
        }
      </p>

      <p className="mt-1 text-xs opacity-80">
        {
          block.reason
        }
      </p>
    </div>
  );
}

function getBlockConfig(
  type:
    ScheduleBlock["type"]
) {
  switch (type) {
    case "Almoço":
      return {
        icon:
          Coffee,

        className:
          "border-amber-200 bg-amber-50 text-amber-800",
      };

    case "Reunião":
      return {
        icon:
          Users,

        className:
          "border-blue-200 bg-blue-50 text-blue-800",
      };

    case "Férias":
      return {
        icon:
          Palmtree,

        className:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
      };

    default:
      return {
        icon:
          Lock,

        className:
          "border-slate-200 bg-slate-100 text-slate-700",
      };
  }
}

function isTimeInsideBlock(
  time: string,
  startTime: string,
  endTime: string
) {
  const current =
    toMinutes(
      time
    );

  const start =
    toMinutes(
      startTime
    );

  const end =
    toMinutes(
      endTime
    );

  return (
    current >=
      start &&
    current <
      end
  );
}

function toMinutes(
  value: string
) {
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function getStatusStyle(
  status:
    StoredAppointment["status"]
) {
  const styles: Record<
    StoredAppointment["status"],
    string
  > = {
    Confirmado:
      "border-blue-200 bg-blue-50 text-blue-700",

    Agendado:
      "border-amber-200 bg-amber-50 text-amber-700",

    Realizado:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Cancelado:
      "border-red-200 bg-red-50 text-red-700",

    Faltou:
      "border-orange-200 bg-orange-50 text-orange-700",
  };

  return styles[
    status
  ];
}