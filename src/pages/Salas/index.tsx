import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Input,
  Select,
} from "@/components/ui";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getActiveRooms,
} from "@/pages/Configuracoes/settingsStorage";

import {
  roomWorksAtUnit,
} from "@/pages/Configuracoes/roomUnitStorage";

import {
  APPOINTMENTS_CHANGED_EVENT,
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

type RoomVisualStatus =
  | "Em uso"
  | "Reservada"
  | "Livre";

interface RoomViewData {
  id: number;
  name: string;
  status: RoomVisualStatus;
  currentAppointment:
    StoredAppointment |
    null;
  nextAppointment:
    StoredAppointment |
    null;
}

function formatDateForInput(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const now =
    new Date();

  return `${String(
    now.getHours()
  ).padStart(
    2,
    "0"
  )}:${String(
    now.getMinutes()
  ).padStart(
    2,
    "0"
  )}`;
}

function isAppointmentActive(
  appointment:
    StoredAppointment
) {
  return (
    appointment.status !==
      "Cancelado" &&
    appointment.status !==
      "Faltou"
  );
}

function isTimeInside(
  time: string,
  startTime: string,
  endTime: string
) {
  return (
    time >=
      startTime &&
    time <
      endTime
  );
}

export default function Salas() {
  const {
    activeUnit,
    activeUnitId,
  } =
    useUnit();

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      () =>
        formatDateForInput(
          new Date()
        )
    );

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState(
      () =>
        getCurrentTime()
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0
    );

  const today =
    formatDateForInput(
      new Date()
    );

  useEffect(
    () => {
      const interval =
        window.setInterval(
          () => {
            if (
              selectedDate ===
              formatDateForInput(
                new Date()
              )
            ) {
              setSelectedTime(
                getCurrentTime()
              );
            }

            setRefreshKey(
              (
                current
              ) =>
                current + 1
            );
          },
          60000
        );

      return () =>
        window.clearInterval(
          interval
        );
    },
    [
      selectedDate,
    ]
  );

  useEffect(
    () => {
      const refresh =
        () =>
          setRefreshKey(
            (
              current
            ) =>
              current + 1
          );

      window.addEventListener(
        APPOINTMENTS_CHANGED_EVENT,
        refresh
      );

      const handleStorage =
        (
          event:
            StorageEvent
        ) => {
          if (
            event.key ===
            "entre-afetos-appointments"
          ) {
            refresh();
          }
        };

      window.addEventListener(
        "storage",
        handleStorage
      );

      return () => {
        window.removeEventListener(
          APPOINTMENTS_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          "storage",
          handleStorage
        );
      };
    },
    []
  );

  const rooms =
    useMemo(
      () =>
        getActiveRooms()
          .filter(
            (
              room
            ) =>
              roomWorksAtUnit(
                room.id,
                activeUnitId
              )
          ),
      [
        activeUnitId,
      ]
    );

  const appointments =
    useMemo(
      () =>
        getSavedAppointments()
          .filter(
            (
              appointment
            ) =>
              appointment.unitId ===
                activeUnitId &&
              appointment.date ===
                selectedDate &&
              isAppointmentActive(
                appointment
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.time.localeCompare(
                b.time
              )
          ),
      [
        activeUnitId,
        selectedDate,
        refreshKey,
      ]
    );

  const roomData =
    useMemo<RoomViewData[]>(
      () =>
        rooms.map(
          (
            room
          ) => {
            const roomAppointments =
              appointments.filter(
                (
                  appointment
                ) =>
                  appointment.room ===
                  room.name
              );

            const currentAppointment =
              roomAppointments.find(
                (
                  appointment
                ) =>
                  isTimeInside(
                    selectedTime,
                    appointment.time,
                    appointment.endTime
                  )
              ) ??
              null;

            const nextAppointment =
              roomAppointments.find(
                (
                  appointment
                ) =>
                  appointment.time >
                  selectedTime
              ) ??
              null;

            let status:
              RoomVisualStatus =
                "Livre";

            if (
              currentAppointment
            ) {
              status =
                "Em uso";
            } else if (
              nextAppointment
            ) {
              status =
                "Reservada";
            }

            return {
              id:
                room.id,

              name:
                room.name,

              status,

              currentAppointment,

              nextAppointment,
            };
          }
        ),
      [
        rooms,
        appointments,
        selectedTime,
      ]
    );

  const filteredRooms =
    useMemo(
      () =>
        roomData.filter(
          (
            room
          ) => {
            const normalizedSearch =
              search
                .trim()
                .toLocaleLowerCase(
                  "pt-BR"
                );

            const matchesSearch =
              !normalizedSearch ||
              room.name
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              room.currentAppointment?.patient
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              room.currentAppointment?.professional
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              room.nextAppointment?.patient
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              room.nextAppointment?.professional
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                );

            const matchesStatus =
              statusFilter ===
                "Todos" ||
              room.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        ),
      [
        roomData,
        search,
        statusFilter,
      ]
    );

  const occupiedCount =
    roomData.filter(
      (
        room
      ) =>
        room.status ===
        "Em uso"
    ).length;

  const reservedCount =
    roomData.filter(
      (
        room
      ) =>
        room.status ===
        "Reservada"
    ).length;

  const freeCount =
    roomData.filter(
      (
        room
      ) =>
        room.status ===
        "Livre"
    ).length;

  function handleTodayNow() {
    setSelectedDate(
      formatDateForInput(
        new Date()
      )
    );

    setSelectedTime(
      getCurrentTime()
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              Salas
            </h1>

            <p className="mt-1.5 text-sm font-medium text-[#7d89a8]">
              Visualize quais salas estão livres, ocupadas ou reservadas na unidade selecionada.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleTodayNow
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe3f2] bg-white px-4 text-sm font-bold text-[#263765] transition hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef]"
          >
            <Clock3
              size={17}
            />
            Agora
          </button>
        </div>

        <section className="rounded-2xl border border-[#e8eaf3] bg-white px-5 py-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
                <DoorOpen
                  size={20}
                />
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#263765]">
                  {
                    activeUnit.name
                  }
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#8a94af]">
                  {
                    roomData.length
                  } sala(s) cadastrada(s) nesta unidade
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusSummary
                label="Em uso"
                value={
                  occupiedCount
                }
                style="border-rose-100 bg-rose-50 text-rose-700"
              />

              <StatusSummary
                label="Reservadas"
                value={
                  reservedCount
                }
                style="border-amber-100 bg-amber-50 text-amber-700"
              />

              <StatusSummary
                label="Livres"
                value={
                  freeCount
                }
                style="border-emerald-100 bg-emerald-50 text-emerald-700"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px_180px_180px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792b3]"
              />

              <Input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Pesquisar sala, paciente ou profissional..."
                className="border-[#e1e4f1] bg-[#fbfbfe] pl-11 focus:bg-white"
              />
            </div>

            <Select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="border-[#e1e4f1] bg-[#fbfbfe]"
            >
              <option value="Todos">
                Todos os status
              </option>

              <option value="Em uso">
                Em uso
              </option>

              <option value="Reservada">
                Reservadas
              </option>

              <option value="Livre">
                Livres
              </option>
            </Select>

            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6543ef]"
              />

              <Input
                type="date"
                value={
                  selectedDate
                }
                onChange={(
                  event
                ) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
                className="border-[#e1e4f1] bg-[#fbfbfe] pl-10"
              />
            </div>

            <div className="relative">
              <Clock3
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6543ef]"
              />

              <Input
                type="time"
                value={
                  selectedTime
                }
                onChange={(
                  event
                ) =>
                  setSelectedTime(
                    event.target.value
                  )
                }
                className="border-[#e1e4f1] bg-[#fbfbfe] pl-10"
              />
            </div>
          </div>

          {selectedDate !==
            today && (
            <p className="mt-3 text-xs font-semibold text-[#8994b2]">
              Você está visualizando a ocupação programada para uma data diferente de hoje.
            </p>
          )}
        </section>

        {filteredRooms.length >
        0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredRooms.map(
              (
                room
              ) => (
                <RoomCard
                  key={
                    room.id
                  }
                  room={
                    room
                  }
                  selectedDate={
                    selectedDate
                  }
                  selectedTime={
                    selectedTime
                  }
                />
              )
            )}
          </div>
        ) : (
          <section className="rounded-2xl border border-dashed border-[#dfe2ed] bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ecff] text-[#6847f5]">
              <DoorOpen
                size={24}
              />
            </span>

            <h2 className="mt-4 text-sm font-extrabold text-[#263765]">
              Nenhuma sala encontrada
            </h2>

            <p className="mt-1 text-xs font-medium text-[#8b95af]">
              Verifique os filtros ou o cadastro de salas desta unidade.
            </p>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

function RoomCard({
  room,
  selectedDate,
  selectedTime,
}: {
  room:
    RoomViewData;
  selectedDate:
    string;
  selectedTime:
    string;
}) {
  const statusStyle =
    room.status ===
    "Em uso"
      ? {
          badge:
            "bg-rose-50 text-rose-700",
          icon:
            "bg-rose-50 text-rose-600",
          border:
            "border-rose-100",
        }
      : room.status ===
          "Reservada"
        ? {
            badge:
              "bg-amber-50 text-amber-700",
            icon:
              "bg-amber-50 text-amber-600",
            border:
              "border-amber-100",
          }
        : {
            badge:
              "bg-emerald-50 text-emerald-700",
            icon:
              "bg-emerald-50 text-emerald-600",
            border:
              "border-emerald-100",
          };

  const mainAppointment =
    room.currentAppointment ??
    room.nextAppointment;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_5px_18px_rgba(51,65,120,0.04)] ${statusStyle.border}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#eef0f6] px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${statusStyle.icon}`}
          >
            <DoorOpen
              size={20}
            />
          </span>

          <div>
            <h2 className="text-sm font-extrabold text-[#263765]">
              {
                room.name
              }
            </h2>

            <p className="mt-1 text-[10px] font-semibold text-[#929bb5]">
              {
                selectedDate
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
                selectedTime
              }
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold ${statusStyle.badge}`}
        >
          {
            room.status
          }
        </span>
      </div>

      {mainAppointment ? (
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa3b9]">
              {room.currentAppointment
                ? "Atendimento atual"
                : "Próximo atendimento"}
            </p>

            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
                <UserRound
                  size={16}
                />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#263765]">
                  {
                    mainAppointment.patient
                  }
                </p>

                <p className="mt-1 text-xs font-semibold text-[#697699]">
                  {
                    mainAppointment.time
                  }{" "}
                  às{" "}
                  {
                    mainAppointment.endTime
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              icon={
                Stethoscope
              }
              label="Profissional"
              value={
                mainAppointment.professional
              }
            />

            <InfoBox
              icon={
                CalendarDays
              }
              label="Especialidade"
              value={
                mainAppointment.specialty
              }
            />
          </div>

          {room.currentAppointment &&
            room.nextAppointment && (
            <div className="rounded-xl border border-[#eceef5] bg-[#fbfbfe] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa3b9]">
                Próximo
              </p>

              <p className="mt-1 text-xs font-bold text-[#526080]">
                {
                  room.nextAppointment.time
                }{" "}
                —{" "}
                {
                  room.nextAppointment.patient
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2
              size={21}
            />
          </span>

          <p className="mt-4 text-sm font-extrabold text-[#263765]">
            Sala livre
          </p>

          <p className="mt-1 text-xs font-medium text-[#8a94af]">
            Nenhum atendimento reservado após este horário.
          </p>
        </div>
      )}
    </article>
  );
}

function StatusSummary({
  label,
  value,
  style,
}: {
  label:
    string;
  value:
    number;
  style:
    string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${style}`}
    >
      <strong className="text-sm">
        {
          value
        }
      </strong>

      {
        label
      }
    </span>
  );
}

function InfoBox({
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
    <div className="rounded-xl border border-[#eceef5] bg-[#fbfbfe] px-3 py-3">
      <div className="flex items-center gap-2 text-[#8792ad]">
        <Icon
          size={13}
        />

        <span className="text-[9px] font-bold uppercase tracking-wide">
          {
            label
          }
        </span>
      </div>

      <p className="mt-1.5 truncate text-[11px] font-bold text-[#526080]">
        {
          value
        }
      </p>
    </div>
  );
}
