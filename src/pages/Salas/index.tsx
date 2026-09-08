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
  UsersRound,
  X,
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

import {
  MEETING_ROOMS_CHANGED_EVENT,
  cancelMeetingRoomBooking,
  createMeetingRoomBooking,
  getMeetingRoomBookingsByUnit,
  type MeetingRoomBooking,
} from "./meetingRoomStorage";

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

interface MeetingRoomViewData {
  status: RoomVisualStatus;
  currentMeeting: MeetingRoomBooking | null;
  nextMeeting: MeetingRoomBooking | null;
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

  const [
    meetingModalOpen,
    setMeetingModalOpen,
  ] = useState(false);

  const [
    meetingTitle,
    setMeetingTitle,
  ] = useState("");

  const [
    meetingRoomName,
    setMeetingRoomName,
  ] = useState("Sala de Reunião");

  const [
    meetingDate,
    setMeetingDate,
  ] = useState(() =>
    formatDateForInput(new Date())
  );

  const [
    meetingStartTime,
    setMeetingStartTime,
  ] = useState("");

  const [
    meetingEndTime,
    setMeetingEndTime,
  ] = useState("");

  const [
    meetingOrganizer,
    setMeetingOrganizer,
  ] = useState("");

  const [
    meetingParticipants,
    setMeetingParticipants,
  ] = useState("");

  const [
    meetingNotes,
    setMeetingNotes,
  ] = useState("");

  const [
    meetingError,
    setMeetingError,
  ] = useState("");

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

      window.addEventListener(
        MEETING_ROOMS_CHANGED_EVENT,
        refresh
      );

      const handleStorage =
        (
          event:
            StorageEvent
        ) => {
          if (
            event.key ===
              "entre-afetos-appointments" ||
            event.key ===
              "entre-afetos-meeting-room-bookings"
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
          MEETING_ROOMS_CHANGED_EVENT,
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

  const meetingBookings =
    useMemo(
      () =>
        getMeetingRoomBookingsByUnit(
          activeUnitId,
          selectedDate
        ),
      [
        activeUnitId,
        selectedDate,
        refreshKey,
      ]
    );

  const meetingRoomData =
    useMemo<MeetingRoomViewData>(
      () => {
        const currentMeeting =
          meetingBookings.find(
            (meeting) =>
              isTimeInside(
                selectedTime,
                meeting.startTime,
                meeting.endTime
              )
          ) ?? null;

        const nextMeeting =
          meetingBookings.find(
            (meeting) =>
              meeting.startTime >
              selectedTime
          ) ?? null;

        return {
          status: currentMeeting
            ? "Em uso"
            : nextMeeting
              ? "Reservada"
              : "Livre",
          currentMeeting,
          nextMeeting,
        };
      },
      [meetingBookings, selectedTime]
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
    ).length +
    (meetingRoomData.status ===
    "Em uso"
      ? 1
      : 0);

  const reservedCount =
    roomData.filter(
      (
        room
      ) =>
        room.status ===
        "Reservada"
    ).length +
    (meetingRoomData.status ===
    "Reservada"
      ? 1
      : 0);

  const freeCount =
    roomData.filter(
      (
        room
      ) =>
        room.status ===
        "Livre"
    ).length +
    (meetingRoomData.status ===
    "Livre"
      ? 1
      : 0);

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

  function openMeetingModal() {
    setMeetingError("");
    setMeetingTitle("");
    setMeetingRoomName("Sala de Reunião");
    setMeetingDate(selectedDate);
    setMeetingStartTime(selectedTime);
    setMeetingEndTime("");
    setMeetingOrganizer("");
    setMeetingParticipants("");
    setMeetingNotes("");
    setMeetingModalOpen(true);
  }

  function handleSaveMeeting() {
    try {
      createMeetingRoomBooking({
        unitId: activeUnitId,
        roomName: meetingRoomName,
        title: meetingTitle,
        date: meetingDate,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        organizer: meetingOrganizer,
        participants: meetingParticipants,
        notes: meetingNotes,
      });

      setSelectedDate(meetingDate);
      setSelectedTime(meetingStartTime);
      setMeetingModalOpen(false);
      setMeetingError("");
      setRefreshKey((current) =>
        current + 1
      );
    } catch (error) {
      setMeetingError(
        error instanceof Error
          ? error.message
          : "Não foi possível agendar a reunião."
      );
    }
  }

  function handleCancelMeeting(
    meetingId: number
  ) {
    if (
      !window.confirm(
        "Deseja cancelar esta reserva da sala de reunião?"
      )
    ) {
      return;
    }

    cancelMeetingRoomBooking(
      meetingId
    );

    setRefreshKey((current) =>
      current + 1
    );
  }

  const normalizedSearch =
    search
      .trim()
      .toLocaleLowerCase("pt-BR");

  const meetingMatchesSearch =
    !normalizedSearch ||
    "sala de reunião".includes(
      normalizedSearch
    ) ||
    meetingRoomData.currentMeeting?.title
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedSearch) ||
    meetingRoomData.nextMeeting?.title
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedSearch) ||
    meetingRoomData.currentMeeting?.organizer
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedSearch) ||
    meetingRoomData.nextMeeting?.organizer
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedSearch);

  const meetingMatchesStatus =
    statusFilter === "Todos" ||
    meetingRoomData.status ===
      statusFilter;

  const showMeetingRoom =
    meetingMatchesSearch &&
    meetingMatchesStatus;

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={
                openMeetingModal
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6847f5] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#5b3de1]"
            >
              <UsersRound
                size={17}
              />
              Agendar reunião
            </button>

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
                    roomData.length + 1
                  } sala(s) nesta unidade, incluindo a sala de reunião
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
          0 || showMeetingRoom ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {showMeetingRoom && (
              <MeetingRoomCard
                room={
                  meetingRoomData
                }
                selectedDate={
                  selectedDate
                }
                selectedTime={
                  selectedTime
                }
                onCancelMeeting={
                  handleCancelMeeting
                }
              />
            )}

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

        {meetingModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setMeetingModalOpen(false);
              }
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e7e9f3] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#eceef5] px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
                    <UsersRound size={20} />
                  </span>

                  <div>
                    <h2 className="text-lg font-extrabold text-[#10235f]">
                      Agendar reunião
                    </h2>
                    <p className="mt-1 text-xs font-medium text-[#8792ad]">
                      Reserve a única sala de reunião da {activeUnit.name}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMeetingModalOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7884a3] transition hover:bg-[#f4f2ff] hover:text-[#6847f5]"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                {meetingError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                    {meetingError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                    Assunto da reunião *
                  </label>
                  <Input
                    value={meetingTitle}
                    onChange={(event) =>
                      setMeetingTitle(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Reunião da equipe clínica"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                    Sala *
                  </label>
                  <Select
                    value={meetingRoomName}
                    onChange={(event) =>
                      setMeetingRoomName(
                        event.target.value
                      )
                    }
                  >
                    <option value="Sala de Reunião">
                      Sala de Reunião
                    </option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                      Data *
                    </label>
                    <Input
                      type="date"
                      value={meetingDate}
                      onChange={(event) =>
                        setMeetingDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                      Início *
                    </label>
                    <Input
                      type="time"
                      value={meetingStartTime}
                      onChange={(event) =>
                        setMeetingStartTime(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                      Fim *
                    </label>
                    <Input
                      type="time"
                      value={meetingEndTime}
                      onChange={(event) =>
                        setMeetingEndTime(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                      Responsável / organizador
                    </label>
                    <Input
                      value={meetingOrganizer}
                      onChange={(event) =>
                        setMeetingOrganizer(
                          event.target.value
                        )
                      }
                      placeholder="Quem está organizando"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                      Participantes
                    </label>
                    <Input
                      value={meetingParticipants}
                      onChange={(event) =>
                        setMeetingParticipants(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Recepção, equipe clínica"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#526080]">
                    Observações
                  </label>
                  <textarea
                    value={meetingNotes}
                    onChange={(event) =>
                      setMeetingNotes(
                        event.target.value
                      )
                    }
                    placeholder="Informações adicionais da reunião"
                    className="min-h-24 w-full resize-none rounded-xl border border-[#e1e4f1] bg-white px-4 py-3 text-sm text-[#33415c] outline-none transition focus:border-[#8d73ff] focus:ring-4 focus:ring-[#eeeaff]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#eceef5] bg-[#fbfbfe] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setMeetingModalOpen(false)
                  }
                  className="h-10 rounded-xl border border-[#dde1ef] bg-white px-4 text-sm font-bold text-[#526080] transition hover:bg-[#f7f7fb]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveMeeting}
                  className="h-10 rounded-xl bg-[#6847f5] px-5 text-sm font-bold text-white transition hover:bg-[#5b3de1]"
                >
                  Salvar reunião
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MeetingRoomCard({
  room,
  selectedDate,
  selectedTime,
  onCancelMeeting,
}: {
  room: MeetingRoomViewData;
  selectedDate: string;
  selectedTime: string;
  onCancelMeeting: (
    meetingId: number
  ) => void;
}) {
  const statusStyle =
    room.status === "Em uso"
      ? {
          badge: "bg-rose-50 text-rose-700",
          icon: "bg-rose-50 text-rose-600",
          border: "border-rose-100",
        }
      : room.status === "Reservada"
        ? {
            badge: "bg-amber-50 text-amber-700",
            icon: "bg-amber-50 text-amber-600",
            border: "border-amber-100",
          }
        : {
            badge: "bg-emerald-50 text-emerald-700",
            icon: "bg-emerald-50 text-emerald-600",
            border: "border-emerald-100",
          };

  const mainMeeting =
    room.currentMeeting ??
    room.nextMeeting;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_5px_18px_rgba(51,65,120,0.04)] ${statusStyle.border}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#eef0f6] px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${statusStyle.icon}`}
          >
            <UsersRound size={20} />
          </span>

          <div>
            <h2 className="text-sm font-extrabold text-[#263765]">
              Sala de Reunião
            </h2>
            <p className="mt-1 text-[10px] font-semibold text-[#929bb5]">
              {selectedDate
                .split("-")
                .reverse()
                .join("/")} às {selectedTime}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold ${statusStyle.badge}`}
        >
          {room.status}
        </span>
      </div>

      {mainMeeting ? (
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa3b9]">
              {room.currentMeeting
                ? "Reunião atual"
                : "Próxima reunião"}
            </p>

            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
                <UsersRound size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-[#263765]">
                  {mainMeeting.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#697699]">
                  {mainMeeting.startTime} às {mainMeeting.endTime}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              icon={UserRound}
              label="Organizador"
              value={
                mainMeeting.organizer ||
                "Não informado"
              }
            />

            <InfoBox
              icon={UsersRound}
              label="Participantes"
              value={
                mainMeeting.participants ||
                "Não informado"
              }
            />
          </div>

          {mainMeeting.notes && (
            <div className="rounded-xl border border-[#eceef5] bg-[#fbfbfe] px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa3b9]">
                Observações
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#526080]">
                {mainMeeting.notes}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              onCancelMeeting(
                mainMeeting.id
              )
            }
            className="w-full rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
          >
            Cancelar reunião
          </button>
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={21} />
          </span>
          <p className="mt-4 text-sm font-extrabold text-[#263765]">
            Sala de reunião livre
          </p>
          <p className="mt-1 text-xs font-medium text-[#8a94af]">
            Nenhuma reunião reservada após este horário.
          </p>
        </div>
      )}
    </article>
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
