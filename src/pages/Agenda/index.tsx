import {
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Lock,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  addDays,
  formatLongDate,
  getMonthData,
  getWeekDays,
} from "./dateUtils";

import {
  ProfessionalColumnsView,
} from "./ProfessionalColumnsView";

import {
  ScheduleBlocksView,
  type ScheduleBlock,
} from "./ScheduleBlocksView";

import {
  getSavedBlocks,
} from "./blockStorage";

import {
  getSavedAppointments,
  type StoredAppointment,
} from "./appointmentStorage";

type CalendarView =
  | "day"
  | "professionals"
  | "week"
  | "month";

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

const defaultScheduleBlocks: ScheduleBlock[] = [
  {
    id: 1,
    professional:
      "Dra. Ana Paula",
    date:
      "2026-08-07",
    startTime:
      "12:00",
    endTime:
      "13:00",
    type:
      "Almoço",
    reason:
      "Intervalo de almoço",
  },

  {
    id: 2,
    professional:
      "Dra. Camila Soares",
    date:
      "2026-08-07",
    startTime:
      "11:00",
    endTime:
      "12:00",
    type:
      "Reunião",
    reason:
      "Reunião da equipe clínica",
  },

  {
    id: 3,
    professional:
      "Dra. Larissa Lima",
    date:
      "2026-08-07",
    startTime:
      "14:00",
    endTime:
      "17:00",
    type:
      "Indisponível",
    reason:
      "Atividade externa",
  },

  {
    id: 4,
    professional:
      "Dr. Rafael Costa",
    date:
      "2026-08-08",
    startTime:
      "08:00",
    endTime:
      "17:00",
    type:
      "Férias",
    reason:
      "Período de férias",
  },
];

const professionals = [
  "Todos",
  "Dra. Ana Paula",
  "Dra. Camila Soares",
  "Dra. Larissa Lima",
  "Dr. Rafael Costa",
];

const specialties = [
  "Todas",
  "Psicologia",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Fisioterapia",
];

export default function Agenda() {
  const navigate =
    useNavigate();

  const [
    view,
    setView,
  ] =
    useState<CalendarView>(
      "day"
    );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      "2026-08-07"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    professional,
    setProfessional,
  ] =
    useState(
      "Todos"
    );

  const [
    specialty,
    setSpecialty,
  ] =
    useState(
      "Todas"
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "Todos"
    );

  const [
    appointments,
  ] =
    useState<
      StoredAppointment[]
    >(() => [
      ...defaultAppointments,
      ...getSavedAppointments(),
    ]);

  const [
    scheduleBlocks,
  ] =
    useState<
      ScheduleBlock[]
    >(() => [
      ...defaultScheduleBlocks,
      ...getSavedBlocks(),
    ]);

  const filteredAppointments =
    useMemo(() => {
      return appointments.filter(
        (
          appointment
        ) => {
          const searchValue =
            search.toLowerCase();

          const matchesSearch =
            appointment.patient
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            appointment.professional
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesProfessional =
            professional ===
              "Todos" ||
            appointment.professional ===
              professional;

          const matchesSpecialty =
            specialty ===
              "Todas" ||
            appointment.specialty ===
              specialty;

          const matchesStatus =
            status ===
              "Todos" ||
            appointment.status ===
              status;

          return (
            matchesSearch &&
            matchesProfessional &&
            matchesSpecialty &&
            matchesStatus
          );
        }
      );
    }, [
      appointments,
      search,
      professional,
      specialty,
      status,
    ]);

  const filteredBlocks =
    useMemo(
      () =>
        scheduleBlocks.filter(
          (block) =>
            professional ===
              "Todos" ||
            block.professional ===
              professional
        ),
      [
        professional,
        scheduleBlocks,
      ]
    );

  const dayAppointments =
    filteredAppointments.filter(
      (appointment) =>
        appointment.date ===
        selectedDate
    );

  const dayStats =
    appointments.filter(
      (appointment) =>
        appointment.date ===
        selectedDate
    );

  const confirmedCount =
    dayStats.filter(
      (item) =>
        item.status ===
        "Confirmado"
    ).length;

  const realizedCount =
    dayStats.filter(
      (item) =>
        item.status ===
        "Realizado"
    ).length;

  const absentCount =
    dayStats.filter(
      (item) =>
        item.status ===
        "Faltou"
    ).length;

  const cancelledCount =
    dayStats.filter(
      (item) =>
        item.status ===
        "Cancelado"
    ).length;

  function handlePrevious() {
    if (
      view ===
        "day" ||
      view ===
        "professionals"
    ) {
      setSelectedDate(
        addDays(
          selectedDate,
          -1
        )
      );

      return;
    }

    if (
      view ===
      "week"
    ) {
      setSelectedDate(
        addDays(
          selectedDate,
          -7
        )
      );

      return;
    }

    const date =
      new Date(
        `${selectedDate}T12:00:00`
      );

    date.setMonth(
      date.getMonth() -
        1
    );

    setSelectedDate(
      formatDateForInput(
        date
      )
    );
  }

  function handleNext() {
    if (
      view ===
        "day" ||
      view ===
        "professionals"
    ) {
      setSelectedDate(
        addDays(
          selectedDate,
          1
        )
      );

      return;
    }

    if (
      view ===
      "week"
    ) {
      setSelectedDate(
        addDays(
          selectedDate,
          7
        )
      );

      return;
    }

    const date =
      new Date(
        `${selectedDate}T12:00:00`
      );

    date.setMonth(
      date.getMonth() +
        1
    );

    setSelectedDate(
      formatDateForInput(
        date
      )
    );
  }

  function handleToday() {
    setSelectedDate(
      formatDateForInput(
        new Date()
      )
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Agenda
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Visualize e gerencie os atendimentos de todos os profissionais da clínica.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  "/agenda/bloqueio/novo"
                )
              }
            >
              <Lock
                size={17}
              />

              Novo bloqueio
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/agenda/novo"
                )
              }
            >
              <Plus
                size={18}
              />

              Novo agendamento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <MetricCard
            title="Atendimentos"
            value={String(
              dayStats.length
            )}
            description="Na data"
          />

          <MetricCard
            title="Confirmados"
            value={String(
              confirmedCount
            )}
            description="Aguardando"
          />

          <MetricCard
            title="Realizados"
            value={String(
              realizedCount
            )}
            description="Concluídos"
          />

          <MetricCard
            title="Faltas"
            value={String(
              absentCount
            )}
            description="Não compareceu"
          />

          <MetricCard
            title="Cancelados"
            value={String(
              cancelledCount
            )}
            description="Na data"
          />
        </div>

        <PageCard
          title="Agenda"
          description="Alterne a visualização e navegue pelo calendário."
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <ViewButton
                active={
                  view ===
                  "day"
                }
                onClick={() =>
                  setView(
                    "day"
                  )
                }
              >
                Dia
              </ViewButton>

              <ViewButton
                active={
                  view ===
                  "professionals"
                }
                onClick={() =>
                  setView(
                    "professionals"
                  )
                }
              >
                Profissionais
              </ViewButton>

              <ViewButton
                active={
                  view ===
                  "week"
                }
                onClick={() =>
                  setView(
                    "week"
                  )
                }
              >
                Semana
              </ViewButton>

              <ViewButton
                active={
                  view ===
                  "month"
                }
                onClick={() =>
                  setView(
                    "month"
                  )
                }
              >
                Mês
              </ViewButton>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={
                  handlePrevious
                }
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <Input
                type="date"
                value={
                  selectedDate
                }
                onChange={(
                  event
                ) =>
                  setSelectedDate(
                    event.target
                      .value
                  )
                }
                className="w-44"
              />

              <button
                type="button"
                onClick={
                  handleNext
                }
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <ChevronRight
                  size={18}
                />
              </button>

              <Button
                type="button"
                variant="outline"
                onClick={
                  handleToday
                }
              >
                Hoje
              </Button>
            </div>
          </div>
        </PageCard>

        <PageCard
          title="Filtros"
          description="Refine a visualização da agenda."
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Pesquisar paciente ou profissional..."
                className="pl-11"
              />
            </div>

            <Select
              value={
                professional
              }
              onChange={(
                event
              ) =>
                setProfessional(
                  event.target
                    .value
                )
              }
            >
              {professionals.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {item ===
                    "Todos"
                      ? "Todos os profissionais"
                      : item}
                  </option>
                )
              )}
            </Select>

            <Select
              value={
                specialty
              }
              onChange={(
                event
              ) =>
                setSpecialty(
                  event.target
                    .value
                )
              }
            >
              {specialties.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {item ===
                    "Todas"
                      ? "Todas as especialidades"
                      : item}
                  </option>
                )
              )}
            </Select>

            <Select
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event.target
                    .value
                )
              }
            >
              <option value="Todos">
                Todos os status
              </option>

              <option value="Confirmado">
                Confirmados
              </option>

              <option value="Agendado">
                Agendados
              </option>

              <option value="Realizado">
                Realizados
              </option>

              <option value="Faltou">
                Faltas
              </option>

              <option value="Cancelado">
                Cancelados
              </option>
            </Select>
          </div>
        </PageCard>

        {view ===
          "day" && (
          <>
            <DayView
              appointments={
                dayAppointments
              }
              selectedDate={
                selectedDate
              }
              onPatient={(
                patientId
              ) =>
                navigate(
                  `/pacientes/${patientId}`
                )
              }
              onReschedule={(
                appointmentId
              ) =>
                navigate(
                  `/agenda/${appointmentId}/remarcar`
                )
              }
              onDetails={(
                appointmentId
              ) =>
                navigate(
                  `/agenda/${appointmentId}`
                )
              }
            />

            <PageCard
              title="Bloqueios e indisponibilidades"
              description="Períodos reservados ou indisponíveis na data selecionada."
            >
              <ScheduleBlocksView
                blocks={
                  filteredBlocks
                }
                selectedDate={
                  selectedDate
                }
              />
            </PageCard>
          </>
        )}

        {view ===
          "professionals" && (
          <ProfessionalColumnsView
            appointments={
              filteredAppointments
            }
            blocks={
              filteredBlocks
            }
            selectedDate={
              selectedDate
            }
            onPatient={(
              patientId: number
            ) =>
              navigate(
                `/pacientes/${patientId}`
              )
            }
            onDetails={(
              appointmentId: number
            ) =>
              navigate(
                `/agenda/${appointmentId}`
              )
            }
          />
        )}

        {view ===
          "week" && (
          <WeekView
            appointments={
              filteredAppointments
            }
            selectedDate={
              selectedDate
            }
          />
        )}

        {view ===
          "month" && (
          <MonthView
            appointments={
              filteredAppointments
            }
            selectedDate={
              selectedDate
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

interface DayViewProps {
  appointments:
    StoredAppointment[];

  selectedDate:
    string;

  onPatient: (
    patientId: number
  ) => void;

  onReschedule: (
    appointmentId: number
  ) => void;

  onDetails: (
    appointmentId: number
  ) => void;
}

function DayView({
  appointments,
  selectedDate,
  onPatient,
  onReschedule,
  onDetails,
}: DayViewProps) {
  return (
    <PageCard
      title="Agenda do Dia"
      description={formatLongDate(
        selectedDate
      )}
    >
      <div className="space-y-3">
        {appointments.map(
          (
            appointment
          ) => (
            <AppointmentRow
              key={
                appointment.id
              }
              appointment={
                appointment
              }
              onPatient={() =>
                onPatient(
                  appointment.patientId
                )
              }
              onReschedule={() =>
                onReschedule(
                  appointment.id
                )
              }
              onDetails={() =>
                onDetails(
                  appointment.id
                )
              }
            />
          )
        )}

        {appointments.length ===
          0 && (
          <EmptyState />
        )}
      </div>
    </PageCard>
  );
}

interface WeekViewProps {
  appointments:
    StoredAppointment[];

  selectedDate:
    string;
}

function WeekView({
  appointments,
  selectedDate,
}: WeekViewProps) {
  const days =
    getWeekDays(
      selectedDate
    );

  return (
    <PageCard
      title="Agenda Semanal"
      description={`Semana de ${formatLongDate(
        days[0].date
      )}`}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        {days.map(
          (day) => {
            const dayItems =
              appointments.filter(
                (
                  item
                ) =>
                  item.date ===
                  day.date
              );

            return (
              <div
                key={
                  day.date
                }
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="mb-3 border-b border-slate-200 pb-3">
                  <p className="font-semibold capitalize text-slate-800">
                    {
                      day.label
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      dayItems.length
                    }{" "}
                    atendimento(s)
                  </p>
                </div>

                <div className="space-y-2">
                  {dayItems.map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <p className="text-sm font-bold text-indigo-600">
                          {
                            item.time
                          }
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {
                            item.patient
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {
                            item.professional
                          }
                        </p>

                        <div className="mt-2">
                          <StatusBadge
                            status={
                              item.status
                            }
                          />
                        </div>
                      </div>
                    )
                  )}

                  {dayItems.length ===
                    0 && (
                    <p className="py-6 text-center text-xs text-slate-400">
                      Sem atendimentos
                    </p>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </PageCard>
  );
}

interface MonthViewProps {
  appointments:
    StoredAppointment[];

  selectedDate:
    string;
}

function MonthView({
  appointments,
  selectedDate,
}: MonthViewProps) {
  const {
    year,
    month,
    daysInMonth,
    firstWeekDay,
    title,
  } =
    getMonthData(
      selectedDate
    );

  const days =
    Array.from(
      {
        length:
          daysInMonth,
      },
      (
        _,
        index
      ) =>
        index + 1
    );

  return (
    <PageCard
      title={
        title
          .charAt(0)
          .toUpperCase() +
        title.slice(1)
      }
      description="Visão mensal dos atendimentos."
    >
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-7 gap-2">
            {[
              "Dom",
              "Seg",
              "Ter",
              "Qua",
              "Qui",
              "Sex",
              "Sáb",
            ].map(
              (
                day
              ) => (
                <div
                  key={
                    day
                  }
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {
                    day
                  }
                </div>
              )
            )}

            {Array.from({
              length:
                firstWeekDay,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-28 rounded-xl bg-slate-50/40"
                />
              )
            )}

            {days.map(
              (
                day
              ) => {
                const date = `${year}-${String(
                  month + 1
                ).padStart(
                  2,
                  "0"
                )}-${String(
                  day
                ).padStart(
                  2,
                  "0"
                )}`;

                const dayItems =
                  appointments.filter(
                    (
                      item
                    ) =>
                      item.date ===
                      date
                  );

                return (
                  <div
                    key={
                      day
                    }
                    className="min-h-28 rounded-xl border border-slate-200 bg-white p-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {
                          day
                        }
                      </span>

                      {dayItems.length >
                        0 && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                          {
                            dayItems.length
                          }
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayItems
                        .slice(
                          0,
                          2
                        )
                        .map(
                          (
                            item
                          ) => (
                            <div
                              key={
                                item.id
                              }
                              className="truncate rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                            >
                              {
                                item.time
                              }{" "}
                              {
                                item.patient
                              }
                            </div>
                          )
                        )}

                      {dayItems.length >
                        2 && (
                        <p className="text-xs font-medium text-slate-400">
                          +
                          {dayItems.length -
                            2}{" "}
                          mais
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </PageCard>
  );
}

interface AppointmentRowProps {
  appointment:
    StoredAppointment;

  onPatient:
    () => void;

  onReschedule:
    () => void;

  onDetails:
    () => void;
}

function AppointmentRow({
  appointment,
  onPatient,
  onReschedule,
  onDetails,
}: AppointmentRowProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex min-w-20 flex-col items-center justify-center rounded-xl bg-indigo-50 px-3 py-3 text-indigo-700">
            <span className="text-lg font-bold">
              {
                appointment.time
              }
            </span>

            <span className="mt-1 text-xs">
              {
                appointment.endTime
              }
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-slate-900">
                {
                  appointment.patient
                }
              </h3>

              <StatusBadge
                status={
                  appointment.status
                }
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <UserRound
                  size={15}
                />

                {
                  appointment.professional
                }
              </span>

              <span>
                {
                  appointment.specialty
                }
              </span>

              <span>
                {
                  appointment.room
                }
              </span>

              <span>
                {
                  appointment.type
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={
              onPatient
            }
          >
            Paciente
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={
              appointment.status ===
                "Realizado" ||
              appointment.status ===
                "Cancelado" ||
              appointment.status ===
                "Faltou"
            }
            onClick={
              onReschedule
            }
          >
            Remarcar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={
              onDetails
            }
          >
            <Clock3
              size={16}
            />

            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title:
    string;

  value:
    string;

  description:
    string;
}

function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {
          value
        }
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {
          description
        }
      </p>
    </div>
  );
}

interface ViewButtonProps {
  active:
    boolean;

  children:
    React.ReactNode;

  onClick:
    () => void;
}

function ViewButton({
  active,
  children,
  onClick,
}: ViewButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
      <Filter
        size={32}
        className="mx-auto text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        Nenhum atendimento encontrado
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Altere a data ou os filtros.
      </p>
    </div>
  );
}

interface StatusBadgeProps {
  status:
    StoredAppointment["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<
    StoredAppointment["status"],
    string
  > = {
    Confirmado:
      "bg-blue-100 text-blue-700",

    Agendado:
      "bg-amber-100 text-amber-700",

    Realizado:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",

    Faltou:
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        status
      }
    </span>
  );
}

function formatDateForInput(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
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