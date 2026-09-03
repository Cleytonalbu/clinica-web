import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  Filter,
  Grid3X3,
  Lock,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Search,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
  Input,
  Select,
} from "@/components/ui";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  APPOINTMENTS_CHANGED_EVENT,
  getSavedAppointments,
  saveAppointment,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  getSavedBlocks,
  SCHEDULE_BLOCKS_CHANGED_EVENT,
} from "./blockStorage";

import type {
  ScheduleBlock,
} from "./ScheduleBlocksView";

import {
  FIXED_SCHEDULES_CHANGED_EVENT,
  FIXED_SCHEDULE_EXCEPTIONS_CHANGED_EVENT,
  createFixedSchedule,
  getFixedScheduleOccurrences,
  getFixedSchedulesByUnit,
  removeFixedSchedule,
  removeFixedScheduleException,
  setFixedScheduleException,
  updateFixedSchedule,
  type FixedSchedule,
  type FixedScheduleExceptionStatus,
  type FixedScheduleOccurrence,
  type FixedScheduleWeekDay,
} from "./fixedScheduleStorage";

import {
  SPECIALTY_AGENDA_COLORS_CHANGED_EVENT,
  getProfessionalAgendaTone,
  getProfessionalAgendaTonesBySpecialty,
  getSpecialtyAgendaColor,
  setSpecialtyAgendaColor,
} from "@/pages/Configuracoes/specialtyAgendaColorStorage";

import {
  getActiveConvenios,
  getActiveProfessionals,
  getActiveRooms,
  getActiveSpecialties,
  getAgendaSettings,
  shouldCreateChargeOnAppointmentCreation,
  type ProfessionalSetting,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getActivePackagePlansByUnit,
} from "@/pages/Configuracoes/packagePlanStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  specialtyWorksAtUnit,
} from "@/pages/Configuracoes/specialtyUnitStorage";

import {
  roomWorksAtUnit,
} from "@/pages/Configuracoes/roomUnitStorage";

import {
  convenioWorksAtUnit,
} from "@/pages/Configuracoes/convenioUnitStorage";

import {
  getProfessionalScheduleDays,
} from "@/pages/Profissionais/professionalScheduleStorage";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  getActiveProceduresBySpecialty,
  getActiveProceduresByUnit,
  PROCEDURES_CHANGED_EVENT,
} from "@/pages/Configuracoes/procedureStorage";

import {
  calculateChargeAmount,
  getDefaultPaymentMethod,
} from "@/pages/Financeiro/financeRules";

import {
  createChargeFromAppointment,
} from "@/pages/Financeiro/financeStorage";

type ReceptionAgendaView =
  | "day"
  | "week"
  | "month";

type OperationalStatus =
  | "Agendado"
  | "Confirmado"
  | "Realizado"
  | "Cancelado"
  | "Faltou"
  | "Horário fixo"
  | "Cancelado pelo paciente"
  | "Cancelado pela clínica"
  | "Falta do profissional"
  | "Bloqueado";

interface AgendaOperationalItem {
  key: string;

  source:
    | "appointment"
    | "fixed"
    | "block";

  date: string;

  startTime: string;
  endTime: string;

  patientId?: number;
  patient: string;

  professionalId?: number;
  professional: string;

  specialty: string;

  procedure: string;

  room: string;

  status:
    OperationalStatus;

  appointmentId?: number;

  fixedScheduleId?: string;

  cancelledMakesSlotAvailable:
    boolean;
}

interface VacantSlot {
  key: string;

  date: string;

  startTime: string;
  endTime: string;

  professionalId: number;
  professional: string;

  specialty: string;
}

const WEEK_DAY_LABELS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

const PROFESSIONAL_SCHEDULE_DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

function formatDate(
  date:
    Date
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() +
      1
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}

function parseDate(
  value:
    string
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split(
        "-"
      )
      .map(
        Number
      );

  return new Date(
    year,
    month -
      1,
    day,
    12,
    0,
    0,
    0
  );
}

function addDays(
  value:
    string,

  days:
    number
) {
  const date =
    parseDate(
      value
    );

  date.setDate(
    date.getDate() +
      days
  );

  return formatDate(
    date
  );
}

function getWeekStart(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  const day =
    date.getDay();

  /*
   * A clínica trabalha visualmente com a semana
   * começando na segunda-feira.
   */
  const diff =
    day ===
      0
      ? -6
      : 1 -
        day;

  date.setDate(
    date.getDate() +
      diff
  );

  return formatDate(
    date
  );
}

function getWeekDates(
  selectedDate:
    string
) {
  const start =
    getWeekStart(
      selectedDate
    );

  return Array.from(
    {
      length:
        6,
    },
    (
      _,
      index
    ) =>
      addDays(
        start,
        index
      )
  );
}

function formatShortDate(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  return `${WEEK_DAY_LABELS[
    date.getDay()
  ]}, ${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}/${String(
    date.getMonth() +
      1
  ).padStart(
    2,
    "0"
  )}`;
}

function formatWeekTitle(
  dates:
    string[]
) {
  if (
    dates.length ===
    0
  ) {
    return "";
  }

  const first =
    parseDate(
      dates[0]
    );

  const last =
    parseDate(
      dates[
        dates.length -
          1
      ]
    );

  const monthNames = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "mai.",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];

  if (
    first.getMonth() ===
      last.getMonth() &&
    first.getFullYear() ===
      last.getFullYear()
  ) {
    return `${first.getDate()} – ${last.getDate()} de ${monthNames[
      first.getMonth()
    ]} de ${first.getFullYear()}`;
  }

  return `${first.getDate()} de ${monthNames[
    first.getMonth()
  ]} – ${last.getDate()} de ${monthNames[
    last.getMonth()
  ]} de ${last.getFullYear()}`;
}

function formatFullDayTitle(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday:
        "long",
      day:
        "2-digit",
      month:
        "long",
      year:
        "numeric",
    }
  )
    .format(
      date
    )
    .replace(
      /^./,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}

function formatMonthTitle(
  value:
    string
) {
  const date =
    parseDate(
      value
    );

  const title =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month:
          "long",
        year:
          "numeric",
      }
    ).format(
      date
    );

  return title
    .charAt(
      0
    )
    .toUpperCase() +
    title.slice(
      1
    );
}

function timeToMinutes(
  value:
    string
) {
  const [
    hours,
    minutes,
  ] =
    value
      .split(
        ":"
      )
      .map(
        Number
      );

  return (
    hours *
      60 +
    minutes
  );
}

function minutesToTime(
  value:
    number
) {
  return `${String(
    Math.floor(
      value /
        60
    )
  ).padStart(
    2,
    "0"
  )}:${String(
    value %
      60
  ).padStart(
    2,
    "0"
  )}`;
}

function periodsOverlap(
  startA:
    string,
  endA:
    string,
  startB:
    string,
  endB:
    string
) {
  return (
    timeToMinutes(
      startA
    ) <
      timeToMinutes(
        endB
      ) &&
    timeToMinutes(
      endA
    ) >
      timeToMinutes(
        startB
      )
  );
}

function isCancelledStatus(
  status:
    OperationalStatus
) {
  return (
    status ===
      "Cancelado" ||
    status ===
      "Cancelado pelo paciente" ||
    status ===
      "Cancelado pela clínica" ||
    status ===
      "Faltou" ||
    status ===
      "Falta do profissional"
  );
}

function getStatusLabel(
  status:
    OperationalStatus
) {
  return status;
}

function getStatusSolidColor(
  status:
    OperationalStatus
) {
  const colors:
    Record<
      OperationalStatus,
      string
    > = {
    Agendado:
      "#38BDF8",

    Confirmado:
      "#16A34A",

    Realizado:
      "#A855F7",

    Cancelado:
      "#EF4444",

    Faltou:
      "#F97316",

    "Horário fixo":
      "#2563EB",

    "Cancelado pelo paciente":
      "#EF4444",

    "Cancelado pela clínica":
      "#52525B",

    "Falta do profissional":
      "#B91C1C",

    Bloqueado:
      "#475569",
  };

  return colors[
    status
  ];
}

function getTextColor(
  background:
    string
) {
  const clean =
    background
      .replace(
        "#",
        ""
      );

  const r =
    parseInt(
      clean.slice(
        0,
        2
      ),
      16
    );

  const g =
    parseInt(
      clean.slice(
        2,
        4
      ),
      16
    );

  const b =
    parseInt(
      clean.slice(
        4,
        6
      ),
      16
    );

  const luminance =
    (
      0.299 *
        r +
      0.587 *
        g +
      0.114 *
        b
    ) /
    255;

  return luminance >
    0.67
    ? "#263765"
    : "#FFFFFF";
}

function mixWithWhite(
  hex:
    string,

  ratio:
    number
) {
  const clean =
    hex.replace(
      "#",
      ""
    );

  const r =
    parseInt(
      clean.slice(
        0,
        2
      ),
      16
    );

  const g =
    parseInt(
      clean.slice(
        2,
        4
      ),
      16
    );

  const b =
    parseInt(
      clean.slice(
        4,
        6
      ),
      16
    );

  const mix =
    (
      value:
        number
    ) =>
      Math.round(
        value +
          (
            255 -
            value
          ) *
            ratio
      )
        .toString(
          16
        )
        .padStart(
          2,
          "0"
        );

  return `#${mix(r)}${mix(g)}${mix(b)}`
    .toUpperCase();
}

function appointmentToItem(
  appointment:
    StoredAppointment
):
  AgendaOperationalItem {
  return {
    key:
      `appointment-${appointment.id}`,

    source:
      "appointment",

    date:
      appointment.date,

    startTime:
      appointment.time,

    endTime:
      appointment.endTime,

    patientId:
      appointment.patientId,

    patient:
      appointment.patient,

    professionalId:
      appointment.professionalId,

    professional:
      appointment.professional,

    specialty:
      appointment.specialty,

    procedure:
      appointment.type ||
      "Atendimento",

    room:
      appointment.room ||
      "Sem sala",

    status:
      appointment.status,

    appointmentId:
      appointment.id,

    cancelledMakesSlotAvailable:
      appointment.status ===
        "Cancelado" ||
      appointment.status ===
        "Faltou",
  };
}

function fixedOccurrenceToItem(
  occurrence:
    FixedScheduleOccurrence
):
  AgendaOperationalItem {
  const exceptionStatus =
    occurrence.exception?.status;

  let status:
    OperationalStatus =
      "Horário fixo";

  if (
    exceptionStatus ===
      "Confirmado"
  ) {
    status =
      "Confirmado";
  } else if (
    exceptionStatus ===
      "Cancelado pelo paciente" ||
    exceptionStatus ===
      "Cancelado pela clínica" ||
    exceptionStatus ===
      "Falta do profissional" ||
    exceptionStatus ===
      "Bloqueado"
  ) {
    status =
      exceptionStatus;
  } else if (
    exceptionStatus ===
      "Falta"
  ) {
    status =
      "Faltou";
  }

  const remapped =
    occurrence.exception?.status ===
      "Remarcado";

  return {
    key:
      `fixed-${occurrence.fixedScheduleId}-${occurrence.date}`,

    source:
      "fixed",

    date:
      remapped
        ? occurrence.exception?.replacementDate ??
          occurrence.date
        : occurrence.date,

    startTime:
      remapped
        ? occurrence.exception?.replacementStartTime ??
          occurrence.startTime
        : occurrence.startTime,

    endTime:
      remapped
        ? occurrence.exception?.replacementEndTime ??
          occurrence.endTime
        : occurrence.endTime,

    patientId:
      occurrence.patientId,

    patient:
      occurrence.patientName,

    professionalId:
      remapped
        ? occurrence.exception?.replacementProfessionalId ??
          occurrence.professionalId
        : occurrence.professionalId,

    professional:
      remapped
        ? occurrence.exception?.replacementProfessionalName ??
          occurrence.professionalName
        : occurrence.professionalName,

    specialty:
      occurrence.specialty,

    procedure:
      occurrence.procedure ||
      "Atendimento",

    room:
      remapped
        ? (
            occurrence.exception?.replacementRoomName ??
            occurrence.roomName ??
            "Sem sala"
          )
        : (
            occurrence.roomName ??
            "Sem sala"
          ),

    status,

    fixedScheduleId:
      occurrence.fixedScheduleId,

    cancelledMakesSlotAvailable:
      status ===
        "Cancelado pelo paciente" ||
      status ===
        "Cancelado pela clínica" ||
      status ===
        "Faltou" ||
      status ===
        "Falta do profissional",
  };
}

function blockToItem(
  block:
    ScheduleBlock,

  professionals:
    ProfessionalSetting[]
):
  AgendaOperationalItem {
  const professional =
    professionals.find(
      (
        item
      ) =>
        item.name ===
        block.professional
    );

  return {
    key:
      `block-${block.id}`,

    source:
      "block",

    date:
      block.date,

    startTime:
      block.startTime,

    endTime:
      block.endTime,

    patient:
      "",

    professionalId:
      professional?.id,

    professional:
      block.professional,

    specialty:
      professional?.specialty ??
      "",

    procedure:
      block.type,

    room:
      "",

    status:
      block.type ===
        "Férias"
        ? "Falta do profissional"
        : "Bloqueado",

    cancelledMakesSlotAvailable:
      false,
  };
}

export default function ReceptionWeeklyAgenda() {
  const navigate =
    useNavigate();

  const {
    activeUnitId,
  } =
    useUnit();

  const [
    view,
    setView,
  ] =
    useState<ReceptionAgendaView>(
      "week"
    );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      () =>
        formatDate(
          new Date()
        )
    );

  const [
    professionalFilter,
    setProfessionalFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    specialtyFilter,
    setSpecialtyFilter,
  ] =
    useState(
      "Todas"
    );

  const [
    procedureFilter,
    setProcedureFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    patientFilter,
    setPatientFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    roomFilter,
    setRoomFilter,
  ] =
    useState(
      "Todas"
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const [
    showExtraFilters,
    setShowExtraFilters,
  ] =
    useState(
      false
    );

  const [
    showFixedScheduleManager,
    setShowFixedScheduleManager,
  ] =
    useState(
      false
    );

  const [
    selectedFixedOccurrence,
    setSelectedFixedOccurrence,
  ] =
    useState<
      AgendaOperationalItem |
      null
    >(
      null
    );

  const [
    showAgendaColorSettings,
    setShowAgendaColorSettings,
  ] =
    useState(
      false
    );

  const [
    selectedEncaixeSlot,
    setSelectedEncaixeSlot,
  ] =
    useState<
      VacantSlot |
      null
    >(
      null
    );

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0
    );

  const weekDates =
    useMemo(
      () =>
        getWeekDates(
          selectedDate
        ),
      [
        selectedDate,
      ]
    );

  const weekStart =
    weekDates[0];

  const weekEnd =
    weekDates[
      weekDates.length -
        1
    ];

  const professionals =
    useMemo(
      () =>
        getActiveProfessionals()
          .filter(
            (
              item
            ) =>
              professionalWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const specialties =
    useMemo(
      () =>
        getActiveSpecialties()
          .filter(
            (
              item
            ) =>
              specialtyWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const rooms =
    useMemo(
      () =>
        getActiveRooms()
          .filter(
            (
              item
            ) =>
              roomWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const convenios =
    useMemo(
      () =>
        getActiveConvenios()
          .filter(
            (
              item
            ) =>
              convenioWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const packagePlans =
    useMemo(
      () =>
        getActivePackagePlansByUnit(
          activeUnitId
        ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const patients =
    useMemo(
      () =>
        getPatients()
          .filter(
            (
              item
            ) =>
              item.status ===
              "Ativo"
          )
          .sort(
            (
              a,
              b
            ) =>
              a.nome.localeCompare(
                b.nome,
                "pt-BR"
              )
          ),
      [
        refreshKey,
      ]
    );

  const rawItems =
    useMemo(
      () => {
        if (
          !weekStart ||
          !weekEnd
        ) {
          return [];
        }

        const appointments =
          getSavedAppointments()
            .filter(
              (
                appointment
              ) =>
                appointment.unitId ===
                  activeUnitId &&
                appointment.date >=
                  weekStart &&
                appointment.date <=
                  weekEnd
            );

        const appointmentKeys =
          new Set(
            appointments.map(
              (
                appointment
              ) =>
                `${appointment.patientId}|${appointment.professionalId ?? appointment.professional}|${appointment.date}|${appointment.time}`
            )
          );

        /*
         * Se já existe um agendamento real para aquela ocorrência
         * do horário fixo, ele tem prioridade. Assim a recepção
         * não vê o mesmo paciente duas vezes.
         */
        const fixedOccurrences =
          getFixedScheduleOccurrences(
            activeUnitId,
            weekStart,
            weekEnd
          )
            .filter(
              (
                occurrence
              ) =>
                !appointmentKeys.has(
                  `${occurrence.patientId}|${occurrence.professionalId}|${occurrence.date}|${occurrence.startTime}`
                )
            );

        const blocks =
          getSavedBlocks()
            .filter(
              (
                block
              ) =>
                block.unitId ===
                  activeUnitId &&
                block.date >=
                  weekStart &&
                block.date <=
                  weekEnd
            );

        return [
          ...appointments.map(
            appointmentToItem
          ),

          ...fixedOccurrences.map(
            fixedOccurrenceToItem
          ),

          ...blocks.map(
            (
              block
            ) =>
              blockToItem(
                block,
                professionals
              )
          ),
        ]
          .sort(
            (
              a,
              b
            ) =>
              `${a.date} ${a.startTime}`
                .localeCompare(
                  `${b.date} ${b.startTime}`
                )
          );
      },
      [
        activeUnitId,
        professionals,
        refreshKey,
        weekEnd,
        weekStart,
      ]
    );

  const procedureCatalog =
    useMemo(
      () =>
        getActiveProceduresByUnit(
          activeUnitId
        ),
      [
        activeUnitId,
        refreshKey,
      ]
    );

  const procedures =
    useMemo(
      () =>
        procedureCatalog
          .filter(
            (
              item
            ) =>
              specialtyFilter ===
                "Todas" ||
              item.specialtyName ===
                specialtyFilter
          )
          .map(
            (
              item
            ) =>
              item.name
          ),
      [
        procedureCatalog,
        specialtyFilter,
      ]
    );

  const filteredItems =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return rawItems.filter(
          (
            item
          ) => {
            const matchesProfessional =
              professionalFilter ===
                "Todos" ||
              String(
                item.professionalId ??
                item.professional
              ) ===
                professionalFilter;

            const matchesSpecialty =
              specialtyFilter ===
                "Todas" ||
              item.specialty ===
                specialtyFilter;

            const matchesProcedure =
              procedureFilter ===
                "Todos" ||
              item.procedure ===
                procedureFilter;

            const matchesStatus =
              statusFilter ===
                "Todos" ||
              item.status ===
                statusFilter;

            const matchesPatient =
              patientFilter ===
                "Todos" ||
              String(
                item.patientId ??
                item.patient
              ) ===
                patientFilter;

            const matchesRoom =
              roomFilter ===
                "Todas" ||
              item.room ===
                roomFilter;

            const matchesSearch =
              !term ||
              [
                item.patient,
                item.professional,
                item.specialty,
                item.procedure,
                item.room,
                item.status,
              ]
                .join(
                  " "
                )
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  term
                );

            return (
              matchesProfessional &&
              matchesSpecialty &&
              matchesProcedure &&
              matchesStatus &&
              matchesPatient &&
              matchesRoom &&
              matchesSearch
            );
          }
        );
      },
      [
        patientFilter,
        professionalFilter,
        procedureFilter,
        rawItems,
        roomFilter,
        search,
        specialtyFilter,
        statusFilter,
      ]
    );

  const allVacantSlots =
    useMemo(
      () => {
        const settings =
          getAgendaSettings();

        const duration =
          Math.max(
            settings.defaultSessionDuration,
            10
          );

        const step =
          Math.max(
            duration +
              settings.intervalBetweenAppointments,
            10
          );

        const selectedProfessionals =
          professionals;

        const slots:
          VacantSlot[] = [];

        weekDates.forEach(
          (
            date
          ) => {
            const dayName =
              PROFESSIONAL_SCHEDULE_DAY_NAMES[
                parseDate(
                  date
                ).getDay()
              ];

            selectedProfessionals.forEach(
              (
                professional
              ) => {
                const day =
                  getProfessionalScheduleDays(
                    professional.id,
                    activeUnitId
                  )
                    .find(
                      (
                        item
                      ) =>
                        item.day ===
                        dayName
                    );

                if (
                  !day ||
                  !day.enabled ||
                  !day.start ||
                  !day.end
                ) {
                  return;
                }

                const occupied =
                  rawItems.filter(
                    (
                      item
                    ) =>
                      item.date ===
                        date &&
                      (
                        item.professionalId !==
                          undefined
                          ? item.professionalId ===
                            professional.id
                          : item.professional ===
                            professional.name
                      ) &&
                      !item.cancelledMakesSlotAvailable
                  );

                let cursor =
                  timeToMinutes(
                    day.start
                  );

                const end =
                  timeToMinutes(
                    day.end
                  );

                while (
                  cursor +
                    duration <=
                  end
                ) {
                  const startTime =
                    minutesToTime(
                      cursor
                    );

                  const endTime =
                    minutesToTime(
                      cursor +
                        duration
                    );

                  const insideBreak =
                    day.breakStart &&
                    day.breakEnd &&
                    periodsOverlap(
                      startTime,
                      endTime,
                      day.breakStart,
                      day.breakEnd
                    );

                  const hasConflict =
                    occupied.some(
                      (
                        item
                      ) =>
                        periodsOverlap(
                          startTime,
                          endTime,
                          item.startTime,
                          item.endTime
                        )
                    );

                  if (
                    !insideBreak &&
                    !hasConflict
                  ) {
                    slots.push(
                      {
                        key:
                          `vacant-${professional.id}-${date}-${startTime}`,

                        date,

                        startTime,

                        endTime,

                        professionalId:
                          professional.id,

                        professional:
                          professional.name,

                        specialty:
                          professional.specialty,
                      }
                    );
                  }

                  cursor +=
                    step;
                }
              }
            );
          }
        );

        return slots;
      },
      [
        activeUnitId,
        professionals,
        rawItems,
        weekDates,
      ]
    );

  const vacantSlots =
    useMemo(
      () =>
        allVacantSlots.filter(
          (
            slot
          ) => {
            const matchesProfessional =
              professionalFilter ===
                "Todos" ||
              String(
                slot.professionalId
              ) ===
                professionalFilter;

            const matchesSpecialty =
              specialtyFilter ===
                "Todas" ||
              slot.specialty ===
                specialtyFilter;

            return (
              matchesProfessional &&
              matchesSpecialty
            );
          }
        ),
      [
        allVacantSlots,
        professionalFilter,
        specialtyFilter,
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
              current +
              1
          );

      window.addEventListener(
        APPOINTMENTS_CHANGED_EVENT,
        refresh
      );

      window.addEventListener(
        SCHEDULE_BLOCKS_CHANGED_EVENT,
        refresh
      );

      window.addEventListener(
        FIXED_SCHEDULES_CHANGED_EVENT,
        refresh
      );

      window.addEventListener(
        FIXED_SCHEDULE_EXCEPTIONS_CHANGED_EVENT,
        refresh
      );

      window.addEventListener(
        SPECIALTY_AGENDA_COLORS_CHANGED_EVENT,
        refresh
      );

      window.addEventListener(
        PROCEDURES_CHANGED_EVENT,
        refresh
      );

      return () => {
        window.removeEventListener(
          APPOINTMENTS_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          SCHEDULE_BLOCKS_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          FIXED_SCHEDULES_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          FIXED_SCHEDULE_EXCEPTIONS_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          SPECIALTY_AGENDA_COLORS_CHANGED_EVENT,
          refresh
        );

        window.removeEventListener(
          PROCEDURES_CHANGED_EVENT,
          refresh
        );
      };
    },
    []
  );

  function clearFilters() {
    setProfessionalFilter(
      "Todos"
    );

    setSpecialtyFilter(
      "Todas"
    );

    setProcedureFilter(
      "Todos"
    );

    setStatusFilter(
      "Todos"
    );

    setPatientFilter(
      "Todos"
    );

    setRoomFilter(
      "Todas"
    );

    setSearch(
      ""
    );
  }

  function movePeriod(
    direction:
      -1 |
      1
  ) {
    if (
      view ===
      "day"
    ) {
      setSelectedDate(
        addDays(
          selectedDate,
          direction
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
          direction *
            7
        )
      );

      return;
    }

    const date =
      parseDate(
        selectedDate
      );

    date.setMonth(
      date.getMonth() +
        direction
    );

    setSelectedDate(
      formatDate(
        date
      )
    );
  }

  function goToday() {
    setSelectedDate(
      formatDate(
        new Date()
      )
    );
  }

  function applyFixedOccurrenceQuickStatus(
    item:
      AgendaOperationalItem,

    status:
      FixedScheduleExceptionStatus
  ) {
    if (
      !item.fixedScheduleId
    ) {
      return;
    }

    setFixedScheduleException(
      {
        fixedScheduleId:
          item.fixedScheduleId,

        unitId:
          activeUnitId,

        date:
          item.date,

        status,

        source:
          "recepcao",
      }
    );

    setRefreshKey(
      (
        current
      ) =>
        current +
        1
    );
  }

  function handleVacantSlot(
    slot:
      VacantSlot
  ) {
    setSelectedEncaixeSlot(
      slot
    );
  }

  const totalAppointments =
    filteredItems.filter(
      (
        item
      ) =>
        item.source !==
          "block" &&
        !isCancelledStatus(
          item.status
        )
    ).length;

  const totalCancelled =
    filteredItems.filter(
      (
        item
      ) =>
        isCancelledStatus(
          item.status
        )
    ).length;

  const totalBlocks =
    filteredItems.filter(
      (
        item
      ) =>
        item.source ===
        "block"
    ).length;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-5">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
            Agenda
          </h1>

          <p className="mt-1.5 max-w-3xl text-sm font-medium text-[#7d89a8]">
            Visão operacional da recepção com horários fixos, salas, procedimentos, cancelamentos, bloqueios e oportunidades de encaixe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-[#e2e5ef] bg-white p-1">
            <AgendaViewButton
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
            </AgendaViewButton>

            <AgendaViewButton
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
            </AgendaViewButton>

            <AgendaViewButton
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
            </AgendaViewButton>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={
              goToday
            }
          >
            <CalendarDays
              size={16}
            />

            Hoje
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setShowFixedScheduleManager(
                (
                  current
                ) =>
                  !current
              )
            }
          >
            <Settings2
              size={16}
            />

            Agendar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setShowAgendaColorSettings(
                true
              )
            }
          >
            <Palette
              size={16}
            />

            Cores da agenda
          </Button>


        </div>
      </div>

      {showFixedScheduleManager && (
        <FixedScheduleManager
          activeUnitId={
            activeUnitId
          }
          professionals={
            professionals
          }
          rooms={
            rooms
          }
          patients={
            patients
          }
          procedures={
            procedureCatalog
          }
          convenios={
            convenios
          }
          packagePlans={
            packagePlans
          }
          onChanged={() =>
            setRefreshKey(
              (
                current
              ) =>
                current +
                1
            )
          }
          onClose={() =>
            setShowFixedScheduleManager(
              false
            )
          }
        />
      )}

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label="Atendimentos"
          value={
            totalAppointments
          }
          icon={
            CalendarDays
          }
          className="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          label="Encaixes visíveis"
          value={
            vacantSlots.length
          }
          icon={
            Clock3
          }
          className="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          label="Cancelamentos/Faltas"
          value={
            totalCancelled
          }
          icon={
            XCircle
          }
          className="bg-rose-50 text-rose-700"
        />

        <SummaryCard
          label="Bloqueios"
          value={
            totalBlocks
          }
          icon={
            Lock
          }
          className="bg-slate-100 text-slate-700"
        />
      </div>

      {/* FILTROS */}
      <section className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <FilterField
            label="Profissional"
          >
            <Select
              value={
                professionalFilter
              }
              onChange={(
                event
              ) =>
                setProfessionalFilter(
                  event.target.value
                )
              }
            >
              <option value="Todos">
                Todos os profissionais
              </option>

              {professionals.map(
                (
                  professional
                ) => (
                  <option
                    key={
                      professional.id
                    }
                    value={
                      String(
                        professional.id
                      )
                    }
                  >
                    {
                      professional.name
                    }
                  </option>
                )
              )}
            </Select>
          </FilterField>

          <FilterField
            label="Status"
          >
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
            >
              <option value="Todos">
                Todos os status
              </option>

              {[
                "Agendado",
                "Confirmado",
                "Realizado",
                "Cancelado",
                "Cancelado pelo paciente",
                "Cancelado pela clínica",
                "Faltou",
                "Falta do profissional",
                "Bloqueado",
              ].map(
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
                    {
                      item
                    }
                  </option>
                )
              )}
            </Select>
          </FilterField>

          <FilterField
            label="Procedimento"
          >
            <Select
              value={
                procedureFilter
              }
              onChange={(
                event
              ) =>
                setProcedureFilter(
                  event.target.value
                )
              }
            >
              <option value="Todos">
                Todos os procedimentos
              </option>

              {procedures.map(
                (
                  procedure
                ) => (
                  <option
                    key={
                      procedure
                    }
                    value={
                      procedure
                    }
                  >
                    {
                      procedure
                    }
                  </option>
                )
              )}
            </Select>
          </FilterField>

          <FilterField
            label="Paciente"
          >
            <Select
              value={
                patientFilter
              }
              onChange={(
                event
              ) =>
                setPatientFilter(
                  event.target.value
                )
              }
            >
              <option value="Todos">
                Todos os pacientes
              </option>

              {patients.map(
                (
                  patient
                ) => (
                  <option
                    key={
                      patient.id
                    }
                    value={
                      String(
                        patient.id
                      )
                    }
                  >
                    {
                      patient.nome
                    }
                  </option>
                )
              )}
            </Select>
          </FilterField>

          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setShowExtraFilters(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >
              <SlidersHorizontal
                size={16}
              />

              Mais filtros
            </Button>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="h-11 px-2 text-xs font-bold text-[#6847f5] hover:text-[#5434db]"
            >
              Limpar
            </button>
          </div>
        </div>

        {showExtraFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#f0f1f6] pt-4 md:grid-cols-3">
            <FilterField
              label="Especialidade"
            >
              <Select
                value={
                  specialtyFilter
                }
                onChange={(
                  event
                ) =>
                  setSpecialtyFilter(
                    event.target.value
                  )
                }
              >
                <option value="Todas">
                  Todas as especialidades
                </option>

                {specialties.map(
                  (
                    specialty
                  ) => (
                    <option
                      key={
                        specialty.id
                      }
                      value={
                        specialty.name
                      }
                    >
                      {
                        specialty.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <FilterField
              label="Sala"
            >
              <Select
                value={
                  roomFilter
                }
                onChange={(
                  event
                ) =>
                  setRoomFilter(
                    event.target.value
                  )
                }
              >
                <option value="Todas">
                  Todas as salas
                </option>

                {rooms.map(
                  (
                    room
                  ) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.name
                      }
                    >
                      {
                        room.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <FilterField
              label="Busca rápida"
            >
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3b8]"
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
                  placeholder="Paciente, profissional, sala..."
                  className="pl-9"
                />
              </div>
            </FilterField>
          </div>
        )}
      </section>

      {/* NAVEGAÇÃO DA SEMANA */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[#e8eaf3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(51,65,120,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => movePeriod(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e5ef] text-[#667397] transition hover:bg-[#faf9ff] hover:text-[#6847f5]"
            title="Semana anterior"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <button
            type="button"
            onClick={() => movePeriod(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e5ef] text-[#667397] transition hover:bg-[#faf9ff] hover:text-[#6847f5]"
            title="Próxima semana"
          >
            <ChevronRight
              size={18}
            />
          </button>
        </div>

        <div className="text-center">
          <p className="text-base font-extrabold text-[#263765]">
            {
              view ===
                "day"
                ? formatFullDayTitle(
                    selectedDate
                  )
                : view ===
                    "week"
                  ? formatWeekTitle(
                      weekDates
                    )
                  : formatMonthTitle(
                      selectedDate
                    )
            }
          </p>

          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9aa3b8]">
            {
              view ===
                "day"
                ? "Visão diária por horários"
                : view ===
                    "week"
                  ? "Visão semanal operacional"
                  : "Visão mensal da agenda"
            }
          </p>
        </div>

        <div className="hidden w-[82px] sm:block" />
      </section>

      {/* LEGENDA DE ESPECIALIDADES */}
      <section className="rounded-2xl border border-[#e8eaf3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <span className="mr-1 text-[10px] font-extrabold uppercase tracking-wide text-[#8993aa]">
            Especialidades
          </span>

          {specialties.map(
            (
              specialty
            ) => (
              <span
                key={
                  specialty.id
                }
                className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#63708f]"
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      getSpecialtyAgendaColor(
                        activeUnitId,
                        specialty.id
                      ),
                  }}
                />

                {
                  specialty.name
                }
              </span>
            )
          )}
        </div>
      </section>

      {/* LEGENDA DE STATUS */}
      <section className="rounded-2xl border border-[#e8eaf3] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <span className="mr-1 text-[10px] font-extrabold uppercase tracking-wide text-[#8993aa]">
            Status
          </span>

          {[
            "Agendado",
            "Confirmado",
            "Realizado",
            "Cancelado",
            "Faltou",
            "Cancelado pelo paciente",
            "Cancelado pela clínica",
            "Falta do profissional",
            "Bloqueado",
          ].map(
            (
              status
            ) => (
              <span
                key={
                  status
                }
                className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#63708f]"
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      getStatusSolidColor(
                        status as OperationalStatus
                      ),
                  }}
                />

                {
                  status
                }
              </span>
            )
          )}

          <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#63708f]">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            Livre para encaixe
          </span>
        </div>
      </section>

      {showAgendaColorSettings && (
        <AgendaColorSettingsModal
          activeUnitId={
            activeUnitId
          }
          specialties={
            specialties
          }
          professionals={
            professionals
          }
          onClose={() =>
            setShowAgendaColorSettings(
              false
            )
          }
        />
      )}

      {selectedEncaixeSlot && (
        <EncaixeRapidoModal
          baseSlot={
            selectedEncaixeSlot
          }
          allVacantSlots={
            allVacantSlots
          }
          patients={
            patients
          }
          professionals={
            professionals
          }
          rooms={
            rooms
          }
          procedures={
            procedureCatalog
          }
          packagePlans={
            packagePlans
          }
          convenios={
            convenios
          }
          rawItems={
            rawItems
          }
          activeUnitId={
            activeUnitId
          }
          onClose={() =>
            setSelectedEncaixeSlot(
              null
            )
          }
          onSaved={() => {
            setSelectedEncaixeSlot(
              null
            );

            setRefreshKey(
              (
                current
              ) =>
                current +
                1
            );
          }}
        />
      )}

      {selectedFixedOccurrence && (
        <FixedScheduleOccurrenceManager
          item={
            selectedFixedOccurrence
          }
          professionals={
            professionals
          }
          rooms={
            rooms
          }
          activeUnitId={
            activeUnitId
          }
          onClose={() =>
            setSelectedFixedOccurrence(
              null
            )
          }
          onChanged={() => {
            setRefreshKey(
              (
                current
              ) =>
                current +
                1
            );

            setSelectedFixedOccurrence(
              null
            );
          }}
        />
      )}

      {/* VISUALIZAÇÕES */}
      {view ===
        "day" && (
        <DailyOperationalView
          date={
            selectedDate
          }
          items={
            filteredItems.filter(
              (
                item
              ) =>
                item.date ===
                selectedDate
            )
          }
          vacantSlots={
            vacantSlots.filter(
              (
                slot
              ) =>
                slot.date ===
                selectedDate
            )
          }
          professionals={
            professionals
          }
          activeUnitId={
            activeUnitId
          }
          onAppointment={(
            appointmentId
          ) =>
            navigate(
              `/agenda/${appointmentId}`
            )
          }
          onVacant={
            handleVacantSlot
          }
          onFixedOccurrence={
            setSelectedFixedOccurrence
          }
          onFixedQuickStatus={
            applyFixedOccurrenceQuickStatus
          }
        />
      )}

      {view ===
        "week" && (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1320px] grid-cols-6 gap-3">
            {weekDates.map(
              (
                date
              ) => {
                const dayItems =
                  filteredItems
                    .filter(
                      (
                        item
                      ) =>
                        item.date ===
                        date
                    );

                const dayVacant =
                  vacantSlots
                    .filter(
                      (
                        slot
                      ) =>
                        slot.date ===
                        date
                    );

                const visibleVacant =
                  professionalFilter ===
                    "Todos"
                    ? dayVacant.slice(
                        0,
                        4
                      )
                    : dayVacant;

                return (
                  <DayColumn
                    key={
                      date
                    }
                    date={
                      date
                    }
                    items={
                      dayItems
                    }
                    vacantSlots={
                      visibleVacant
                    }
                    hiddenVacantCount={
                      Math.max(
                        dayVacant.length -
                          visibleVacant.length,
                        0
                      )
                    }
                    professionals={
                      professionals
                    }
                    activeUnitId={
                      activeUnitId
                    }
                    onAppointment={(
                      appointmentId
                    ) =>
                      navigate(
                        `/agenda/${appointmentId}`
                      )
                    }
                    onVacant={
                      handleVacantSlot
                    }
                    onFixedOccurrence={
                      setSelectedFixedOccurrence
                    }
                    onFixedQuickStatus={
                      applyFixedOccurrenceQuickStatus
                    }
                  />
                );
              }
            )}
          </div>
        </div>
      )}

      {view ===
        "month" && (
        <ReceptionMonthView
          selectedDate={
            selectedDate
          }
          activeUnitId={
            activeUnitId
          }
          professionals={
            professionals
          }
          professionalFilter={
            professionalFilter
          }
          specialtyFilter={
            specialtyFilter
          }
          statusFilter={
            statusFilter
          }
          procedureFilter={
            procedureFilter
          }
          roomFilter={
            roomFilter
          }
          patientFilter={
            patientFilter
          }
          search={
            search
          }
          refreshKey={
            refreshKey
          }
          onSelectDate={(
            date
          ) => {
            setSelectedDate(
              date
            );

            setView(
              "day"
            );
          }}
        />
      )}
    </div>
  );
}

function AgendaColorSettingsModal({
  activeUnitId,
  specialties,
  professionals,
  onClose,
}: {
  activeUnitId:
    number;

  specialties:
    Array<{
      id: number;
      name: string;
    }>;

  professionals:
    ProfessionalSetting[];

  onClose:
    () => void;
}) {
  const [
    version,
    setVersion,
  ] =
    useState(
      0
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

  void version;

  function updateColor(
    specialtyId:
      number,

    color:
      string
  ) {
    try {
      setSpecialtyAgendaColor(
        activeUnitId,
        specialtyId,
        color
      );

      setVersion(
        (
          current
        ) =>
          current +
          1
      );

      setFeedback(
        "Cor atualizada. Os tons dos profissionais foram recalculados automaticamente."
      );
    } catch (
      error
    ) {
      setFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível atualizar a cor."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Cores da agenda
            </h2>

            <p className="mt-1 max-w-2xl text-xs font-medium text-[#7d89a8]">
              A Recepção escolhe a cor principal de cada especialidade. Os profissionais vinculados a ela recebem automaticamente tons diferentes da mesma cor.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            title="Fechar"
          >
            <X
              size={19}
            />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {specialties.map(
            (
              specialty
            ) => {
              const baseColor =
                getSpecialtyAgendaColor(
                  activeUnitId,
                  specialty.id
                );

              const tones =
                getProfessionalAgendaTonesBySpecialty(
                  activeUnitId,
                  specialty.id
                );

              const specialtyProfessionals =
                professionals.filter(
                  (
                    professional
                  ) =>
                    professional.specialty ===
                    specialty.name
                );

              return (
                <section
                  key={
                    specialty.id
                  }
                  className="rounded-2xl border border-[#e7e9f2] bg-white p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-5 w-5 shrink-0 rounded-md border border-black/5"
                          style={{
                            backgroundColor:
                              baseColor,
                          }}
                        />

                        <div>
                          <h3 className="text-sm font-extrabold text-[#263765]">
                            {
                              specialty.name
                            }
                          </h3>

                          <p className="mt-0.5 text-[10px] font-medium text-[#8d96ad]">
                            {
                              specialtyProfessionals.length
                            } profissional(is) nesta especialidade
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-[#e3e6ef] bg-[#fbfbfe] px-3 py-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#78839f]">
                        Cor principal
                      </span>

                      <input
                        type="color"
                        value={
                          baseColor
                        }
                        onChange={(
                          event
                        ) =>
                          updateColor(
                            specialty.id,
                            event.target.value
                          )
                        }
                        className="h-8 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        title={`Escolher cor de ${specialty.name}`}
                      />

                      <span className="min-w-[72px] text-xs font-bold text-[#536180]">
                        {
                          baseColor
                        }
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 border-t border-[#eef0f5] pt-4">
                    <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-[#8993aa]">
                      Tons dos profissionais
                    </p>

                    {tones.length >
                      0 ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {tones.map(
                          (
                            tone
                          ) => (
                            <div
                              key={
                                tone.professionalId
                              }
                              className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e8eaf3] bg-[#fbfbfe] px-3 py-2.5"
                            >
                              <span
                                className="h-8 w-8 shrink-0 rounded-lg border border-black/5"
                                style={{
                                  backgroundColor:
                                    tone.toneColor,
                                }}
                              />

                              <div className="min-w-0">
                                <p className="truncate text-xs font-extrabold text-[#263765]">
                                  {
                                    tone.professionalName
                                  }
                                </p>

                                <p className="mt-0.5 text-[9px] font-semibold text-[#8d96ad]">
                                  {
                                    tone.toneColor
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#dfe2ed] bg-[#fafbfc] px-4 py-5 text-center text-[10px] font-semibold text-[#8d96ad]">
                        Nenhum profissional ativo desta especialidade está vinculado à unidade atual.
                      </div>
                    )}
                  </div>
                </section>
              );
            }
          )}

          {specialties.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-[#dfe2ed] bg-[#fafbfc] px-4 py-10 text-center text-xs font-semibold text-[#8d96ad]">
              Nenhuma especialidade ativa disponível nesta unidade.
            </div>
          )}

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
              {
                feedback
              }
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            onClick={
              onClose
            }
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}

function EncaixeRapidoModal({
  baseSlot,
  allVacantSlots,
  patients,
  professionals,
  rooms,
  procedures,
  packagePlans,
  convenios,
  rawItems,
  activeUnitId,
  onClose,
  onSaved,
}: {
  baseSlot:
    VacantSlot;

  allVacantSlots:
    VacantSlot[];

  patients:
    Array<{
      id: number;
      nome: string;
    }>;

  professionals:
    ProfessionalSetting[];

  rooms:
    Array<{
      id: number;
      name: string;
    }>;

  procedures:
    Array<{
      id: number;
      name: string;
      specialtyName: string;
    }>;

  packagePlans:
    Array<{
      id: number;
      name: string;
      finalValue: number;
      active: boolean;
    }>;

  convenios:
    Array<{
      id: number;
      name: string;
    }>;

  rawItems:
    AgendaOperationalItem[];

  activeUnitId:
    number;

  onClose:
    () => void;

  onSaved:
    () => void;
}) {
  const [
    patientId,
    setPatientId,
  ] =
    useState(
      ""
    );

  const [
    professionalId,
    setProfessionalId,
  ] =
    useState(
      String(
        baseSlot.professionalId
      )
    );

  const [
    procedure,
    setProcedure,
  ] =
    useState(
      ""
    );

  const [
    roomName,
    setRoomName,
  ] =
    useState(
      ""
    );

  const [
    attendanceMode,
    setAttendanceMode,
  ] =
    useState<
      "Avulso" |
      "Plano"
    >(
      "Avulso"
    );

  const [
    packagePlanId,
    setPackagePlanId,
  ] =
    useState(
      ""
    );

  const [
    convenioId,
    setConvenioId,
  ] =
    useState(
      ""
    );

  const [
    observations,
    setObservations,
  ] =
    useState(
      ""
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

  const availableProfessionalSlots =
    useMemo(
      () => {
        const byProfessional =
          new Map<
            number,
            VacantSlot
          >();

        allVacantSlots
          .filter(
            (
              slot
            ) =>
              slot.date ===
                baseSlot.date &&
              slot.startTime ===
                baseSlot.startTime &&
              slot.endTime ===
                baseSlot.endTime
          )
          .forEach(
            (
              slot
            ) =>
              byProfessional.set(
                slot.professionalId,
                slot
              )
          );

        return Array.from(
          byProfessional.values()
        )
          .sort(
            (
              a,
              b
            ) =>
              a.professional.localeCompare(
                b.professional,
                "pt-BR"
              )
          );
      },
      [
        allVacantSlots,
        baseSlot.date,
        baseSlot.endTime,
        baseSlot.startTime,
      ]
    );

  const selectedPatient =
    patients.find(
      (
        item
      ) =>
        item.id ===
        Number(
          patientId
        )
    );

  const selectedProfessional =
    professionals.find(
      (
        item
      ) =>
        item.id ===
        Number(
          professionalId
        )
    );

  const selectedPackagePlan =
    packagePlans.find(
      (
        item
      ) =>
        item.id ===
        Number(
          packagePlanId
        )
    );

  const selectedConvenio =
    convenios.find(
      (
        item
      ) =>
        item.id ===
        Number(
          convenioId
        )
    );

  const availableProcedures =
    selectedProfessional
      ? procedures.filter(
          (
            item
          ) =>
            item.specialtyName ===
            selectedProfessional.specialty
        )
      : [];

  const availableRooms =
    useMemo(
      () =>
        rooms.filter(
          (
            room
          ) =>
            !rawItems.some(
              (
                item
              ) =>
                item.date ===
                  baseSlot.date &&
                item.room ===
                  room.name &&
                !item.cancelledMakesSlotAvailable &&
                periodsOverlap(
                  baseSlot.startTime,
                  baseSlot.endTime,
                  item.startTime,
                  item.endTime
                )
            )
        ),
      [
        baseSlot.date,
        baseSlot.endTime,
        baseSlot.startTime,
        rawItems,
        rooms,
      ]
    );

  function saveEncaixe() {
    if (
      !selectedPatient
    ) {
      setFeedback(
        "Selecione o paciente."
      );

      return;
    }

    if (
      !selectedProfessional
    ) {
      setFeedback(
        "Selecione um profissional disponível."
      );

      return;
    }

    const stillAvailable =
      availableProfessionalSlots.some(
        (
          slot
        ) =>
          slot.professionalId ===
          selectedProfessional.id
      );

    if (
      !stillAvailable
    ) {
      setFeedback(
        "Este profissional não está mais livre neste horário."
      );

      return;
    }

    if (
      !procedure
    ) {
      setFeedback(
        "Selecione o procedimento."
      );

      return;
    }

    if (
      !roomName
    ) {
      setFeedback(
        "Selecione uma sala disponível."
      );

      return;
    }

    if (
      attendanceMode ===
        "Plano" &&
      !selectedPackagePlan
    ) {
      setFeedback(
        "Selecione o plano."
      );

      return;
    }

    const billingType =
      selectedConvenio
        ? "Convênio" as const
        : "Particular" as const;

    const serviceValue =
      attendanceMode ===
        "Plano"
        ? 0
        : calculateChargeAmount(
            {
              professional:
                selectedProfessional.name,

              specialty:
                selectedProfessional.specialty,

              billingType,

              convenio:
                selectedConvenio?.name,
            }
          );

    const paymentMethod =
      getDefaultPaymentMethod(
        billingType
      );

    const appointment:
      StoredAppointment = {
      id:
        Date.now(),

      patientId:
        selectedPatient.id,

      unitId:
        activeUnitId,

      patient:
        selectedPatient.nome,

      professionalId:
        selectedProfessional.id,

      professional:
        selectedProfessional.name,

      specialty:
        selectedProfessional.specialty,

      date:
        baseSlot.date,

      time:
        baseSlot.startTime,

      endTime:
        baseSlot.endTime,

      room:
        roomName,

      type:
        procedure,

      status:
        "Agendado",

      observations:
        [
          "Encaixe avulso",
          observations.trim(),
        ]
          .filter(
            Boolean
          )
          .join(
            " | "
          ),

      billingType,

      convenioId:
        selectedConvenio?.id,

      convenio:
        selectedConvenio?.name,

      paymentMethod,

      serviceValue,

      patientPackageId:
        attendanceMode ===
          "Plano"
          ? selectedPackagePlan?.id
          : undefined,

      patientPackageName:
        attendanceMode ===
          "Plano"
          ? selectedPackagePlan?.name
          : undefined,
    };

    saveAppointment(
      appointment
    );

    if (
      shouldCreateChargeOnAppointmentCreation(
        {
          billingType,

          hasPatientPackage:
            attendanceMode ===
            "Plano",
        }
      )
    ) {
      createChargeFromAppointment(
        {
          unitId:
            activeUnitId,

          appointmentId:
            appointment.id,

          patientId:
            selectedPatient.id,

          patient:
            selectedPatient.nome,

          professionalId:
            selectedProfessional.id,

          professional:
            selectedProfessional.name,

          specialty:
            selectedProfessional.specialty,

          date:
            baseSlot.date,

          billingType,

          convenioId:
            selectedConvenio?.id,

          convenio:
            selectedConvenio?.name,

          paymentMethod,

          amount:
            serviceValue,
        }
      );
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Encaixe rápido
            </h2>

            <p className="mt-1 text-xs font-medium text-[#7d89a8]">
              {
                formatShortDate(
                  baseSlot.date
                )
              } • {
                baseSlot.startTime
              } – {
                baseSlot.endTime
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            title="Fechar"
          >
            <X
              size={19}
            />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FilterField
              label="Paciente"
            >
              <Select
                value={
                  patientId
                }
                onChange={(
                  event
                ) =>
                  setPatientId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione o paciente
                </option>

                {patients.map(
                  (
                    patient
                  ) => (
                    <option
                      key={
                        patient.id
                      }
                      value={
                        patient.id
                      }
                    >
                      {
                        patient.nome
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <FilterField
              label="Profissional disponível"
            >
              <Select
                value={
                  professionalId
                }
                onChange={(
                  event
                ) => {
                  setProfessionalId(
                    event.target.value
                  );

                  setProcedure(
                    ""
                  );
                }}
              >
                {availableProfessionalSlots.map(
                  (
                    slot
                  ) => (
                    <option
                      key={
                        slot.professionalId
                      }
                      value={
                        slot.professionalId
                      }
                    >
                      {
                        slot.professional
                      } — {
                        slot.specialty
                      }
                    </option>
                  )
                )}
              </Select>

              <p className="mt-1.5 text-[10px] font-semibold text-emerald-700">
                {
                  availableProfessionalSlots.length
                } profissional(is) livre(s) neste horário.
              </p>
            </FilterField>

            <FilterField
              label="Procedimento"
            >
              <Select
                value={
                  procedure
                }
                disabled={
                  !selectedProfessional
                }
                onChange={(
                  event
                ) =>
                  setProcedure(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione o procedimento
                </option>

                {availableProcedures.map(
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
            </FilterField>

            <FilterField
              label="Sala disponível"
            >
              <Select
                value={
                  roomName
                }
                onChange={(
                  event
                ) =>
                  setRoomName(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione a sala
                </option>

                {availableRooms.map(
                  (
                    room
                  ) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.name
                      }
                    >
                      {
                        room.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-[#536180]">
              Forma do atendimento
            </p>

            <div className="flex flex-wrap gap-5 rounded-xl border border-slate-200 px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                <input
                  type="radio"
                  checked={
                    attendanceMode ===
                    "Avulso"
                  }
                  onChange={() => {
                    setAttendanceMode(
                      "Avulso"
                    );

                    setPackagePlanId(
                      ""
                    );
                  }}
                />

                Sessão avulsa
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                <input
                  type="radio"
                  checked={
                    attendanceMode ===
                    "Plano"
                  }
                  onChange={() =>
                    setAttendanceMode(
                      "Plano"
                    )
                  }
                />

                Plano
              </label>
            </div>
          </div>

          {attendanceMode ===
            "Plano" && (
            <FilterField
              label="Plano"
            >
              <Select
                value={
                  packagePlanId
                }
                onChange={(
                  event
                ) =>
                  setPackagePlanId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione o plano
                </option>

                {packagePlans.map(
                  (
                    plan
                  ) => (
                    <option
                      key={
                        plan.id
                      }
                      value={
                        plan.id
                      }
                    >
                      {
                        plan.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>
          )}

          <FilterField
            label="Convênio"
          >
            <Select
              value={
                convenioId
              }
              onChange={(
                event
              ) =>
                setConvenioId(
                  event.target.value
                )
              }
            >
              <option value="">
                Sem convênio
              </option>

              {convenios.map(
                (
                  convenio
                ) => (
                  <option
                    key={
                      convenio.id
                    }
                    value={
                      convenio.id
                    }
                  >
                    {
                      convenio.name
                    }
                  </option>
                )
              )}
            </Select>
          </FilterField>

          <FilterField
            label="Observações"
          >
            <Input
              value={
                observations
              }
              onChange={(
                event
              ) =>
                setObservations(
                  event.target.value
                )
              }
              placeholder="Opcional"
            />
          </FilterField>

          {feedback && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {
                feedback
              }
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={
              onClose
            }
          >
            Fechar
          </Button>

          <Button
            type="button"
            onClick={
              saveEncaixe
            }
          >
            <Save
              size={15}
            />

            Salvar encaixe
          </Button>
        </div>
      </div>
    </div>
  );
}

function FixedScheduleManager({
  activeUnitId,
  professionals,
  rooms,
  patients,
  procedures,
  convenios,
  packagePlans,
  onChanged,
  onClose,
}: {
  activeUnitId:
    number;

  professionals:
    ProfessionalSetting[];

  rooms:
    Array<{
      id: number;
      name: string;
    }>;

  patients:
    Array<{
      id: number;
      nome: string;
      telefone?: string;
      celular?: string;
    }>;

  procedures:
    Array<{
      id: number;
      name: string;
      specialtyName: string;
    }>;

  convenios:
    Array<{
      id: number;
      name: string;
    }>;

  packagePlans:
    Array<{
      id: number;
      name: string;
      finalValue: number;
      active: boolean;
    }>;

  onChanged:
    () => void;

  onClose:
    () => void;
}) {
  const [
    patientId,
    setPatientId,
  ] =
    useState(
      ""
    );

  const [
    professionalId,
    setProfessionalId,
  ] =
    useState(
      ""
    );

  const [
    roomId,
    setRoomId,
  ] =
    useState(
      ""
    );

  const [
    procedure,
    setProcedure,
  ] =
    useState(
      ""
    );

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      () =>
        formatDate(
          new Date()
        )
    );

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      "08:00"
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      "08:50"
    );

  const [
    recurrence,
    setRecurrence,
  ] =
    useState(
      "Semanalmente"
    );

  const [
    billingMode,
    setBillingMode,
  ] =
    useState<
      "Avulso" |
      "Plano"
    >(
      "Avulso"
    );

  const [
    packagePlanId,
    setPackagePlanId,
  ] =
    useState(
      ""
    );

  const [
    convenioId,
    setConvenioId,
  ] =
    useState(
      ""
    );

  const [
    authorization,
    setAuthorization,
  ] =
    useState(
      ""
    );

  const [
    observations,
    setObservations,
  ] =
    useState(
      ""
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

  const selectedPatient =
    patients.find(
      (
        item
      ) =>
        item.id ===
        Number(
          patientId
        )
    );

  const selectedProfessional =
    professionals.find(
      (
        item
      ) =>
        item.id ===
        Number(
          professionalId
        )
    );

  const selectedRoom =
    rooms.find(
      (
        item
      ) =>
        item.id ===
        Number(
          roomId
        )
    );

  const selectedPackagePlan =
    packagePlans.find(
      (
        item
      ) =>
        item.id ===
        Number(
          packagePlanId
        )
    );

  const selectedConvenio =
    convenios.find(
      (
        item
      ) =>
        item.id ===
        Number(
          convenioId
        )
    );

  const availableProcedures =
    selectedProfessional
      ? procedures.filter(
          (
            item
          ) =>
            item.specialtyName ===
            selectedProfessional.specialty
        )
      : [];

  function save() {
    if (
      !selectedPatient
    ) {
      setFeedback(
        "Selecione o paciente."
      );

      return;
    }

    if (
      !selectedProfessional
    ) {
      setFeedback(
        "Selecione o profissional."
      );

      return;
    }

    if (
      !selectedRoom
    ) {
      setFeedback(
        "Selecione a sala."
      );

      return;
    }

    if (
      !procedure
    ) {
      setFeedback(
        "Selecione o procedimento."
      );

      return;
    }

    if (
      billingMode ===
        "Plano" &&
      !selectedPackagePlan
    ) {
      setFeedback(
        "Selecione o plano."
      );

      return;
    }

    if (
      !startDate ||
      !startTime ||
      !endTime
    ) {
      setFeedback(
        "Informe data e horário."
      );

      return;
    }

    try {
      const weekDay =
        parseDate(
          startDate
        ).getDay() as
          FixedScheduleWeekDay;

      createFixedSchedule(
        {
          unitId:
            activeUnitId,

          patientId:
            selectedPatient.id,

          patientName:
            selectedPatient.nome,

          professionalId:
            selectedProfessional.id,

          professionalName:
            selectedProfessional.name,

          specialty:
            selectedProfessional.specialty,

          procedure,

          roomId:
            selectedRoom.id,

          roomName:
            selectedRoom.name,

          weekDay,

          startTime,

          endTime,

          startDate,

          billingType:
            selectedConvenio
              ? "Convênio"
              : billingMode ===
                  "Plano"
                ? "Pacote"
                : "Particular",

          patientPackageId:
            billingMode ===
              "Plano"
              ? selectedPackagePlan?.id
              : undefined,

          patientPackageName:
            billingMode ===
              "Plano"
              ? selectedPackagePlan?.name
              : undefined,

          convenioId:
            selectedConvenio?.id,

          convenioName:
            selectedConvenio?.name,

          observations:
            [
              observations.trim(),

              `Recorrência: ${recurrence}`,

              selectedConvenio &&
              authorization
                ? `Autorização: ${authorization}`
                : "",
            ]
              .filter(
                Boolean
              )
              .join(
                " | "
              ) ||
            undefined,
        }
      );

      onChanged();

      onClose();
    } catch (
      error
    ) {
      setFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível salvar o agendamento."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[94vh] w-full max-w-[1450px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-700">
              Agendamento
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Cadastre a rotina do paciente uma única vez.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            title="Fechar"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="p-7">
          <div className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
            <FilterField
              label="Profissional"
            >
              <Select
                value={
                  professionalId
                }
                onChange={(
                  event
                ) => {
                  setProfessionalId(
                    event.target.value
                  );

                  setProcedure(
                    ""
                  );
                }}
              >
                <option value="">
                  Selecione o profissional
                </option>

                {professionals.map(
                  (
                    professional
                  ) => (
                    <option
                      key={
                        professional.id
                      }
                      value={
                        professional.id
                      }
                    >
                      {
                        professional.name
                      } — {
                        professional.specialty
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <FilterField
              label="Sala"
            >
              <Select
                value={
                  roomId
                }
                onChange={(
                  event
                ) =>
                  setRoomId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione a sala
                </option>

                {rooms.map(
                  (
                    room
                  ) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.id
                      }
                    >
                      {
                        room.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <div className="xl:col-span-2">
              <FilterField
                label="Paciente"
              >
                <Select
                  value={
                    patientId
                  }
                  onChange={(
                    event
                  ) =>
                    setPatientId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione o paciente
                  </option>

                  {patients.map(
                    (
                      patient
                    ) => (
                      <option
                        key={
                          patient.id
                        }
                        value={
                          patient.id
                        }
                      >
                        {
                          patient.nome
                        }
                      </option>
                    )
                  )}
                </Select>
              </FilterField>
            </div>

            <FilterField
              label="Data"
            >
              <Input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </FilterField>

            <div>
              <p className="mb-2 block text-xs font-bold text-[#536180]">
                Horário
              </p>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <Input
                  type="time"
                  value={
                    startTime
                  }
                  onChange={(
                    event
                  ) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                />

                <span className="text-xs font-semibold text-slate-400">
                  às
                </span>

                <Input
                  type="time"
                  value={
                    endTime
                  }
                  onChange={(
                    event
                  ) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <FilterField
              label="Recorrência"
            >
              <Select
                value={
                  recurrence
                }
                onChange={(
                  event
                ) =>
                  setRecurrence(
                    event.target.value
                  )
                }
              >
                <option value="Semanalmente">
                  Semanalmente
                </option>

                <option value="Diariamente">
                  Diariamente
                </option>

                <option value="A cada duas semanas">
                  A cada duas semanas
                </option>

                <option value="A cada três semanas">
                  A cada três semanas
                </option>

                <option value="Mensalmente">
                  Mensalmente
                </option>
              </Select>
            </FilterField>

            <FilterField
              label="Telefone"
            >
              <Input
                value={
                  selectedPatient?.telefone ??
                  ""
                }
                disabled
                placeholder="Telefone do cadastro"
              />
            </FilterField>

            <FilterField
              label="Celular"
            >
              <Input
                value={
                  selectedPatient?.celular ??
                  ""
                }
                disabled
                placeholder="Celular do cadastro"
              />
            </FilterField>

            <div className="xl:col-span-2">
              <p className="mb-2 block text-xs font-bold text-[#536180]">
                Forma do atendimento
              </p>

              <div className="flex h-11 items-center gap-6 rounded-xl border border-slate-200 bg-white px-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="radio"
                    checked={
                      billingMode ===
                      "Avulso"
                    }
                    onChange={() => {
                      setBillingMode(
                        "Avulso"
                      );

                      setPackagePlanId(
                        ""
                      );
                    }}
                  />

                  Sessão avulsa
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="radio"
                    checked={
                      billingMode ===
                      "Plano"
                    }
                    onChange={() =>
                      setBillingMode(
                        "Plano"
                      )
                    }
                  />

                  Plano
                </label>
              </div>
            </div>

            {billingMode ===
              "Plano" && (
              <FilterField
                label="Plano"
              >
                <Select
                  value={
                    packagePlanId
                  }
                  onChange={(
                    event
                  ) =>
                    setPackagePlanId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione o plano
                  </option>

                  {packagePlans.map(
                    (
                      plan
                    ) => (
                      <option
                        key={
                          plan.id
                        }
                        value={
                          plan.id
                        }
                      >
                        {
                          plan.name
                        }
                      </option>
                    )
                  )}
                </Select>
              </FilterField>
            )}

            <FilterField
              label="Procedimento"
            >
              <Select
                value={
                  procedure
                }
                disabled={
                  !selectedProfessional
                }
                onChange={(
                  event
                ) =>
                  setProcedure(
                    event.target.value
                  )
                }
              >
                <option value="">
                  {
                    selectedProfessional
                      ? "Selecione o procedimento"
                      : "Selecione primeiro o profissional"
                  }
                </option>

                {availableProcedures.map(
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
            </FilterField>

            <FilterField
              label="Convênio"
            >
              <Select
                value={
                  convenioId
                }
                onChange={(
                  event
                ) => {
                  setConvenioId(
                    event.target.value
                  );

                  if (
                    !event.target.value
                  ) {
                    setAuthorization(
                      ""
                    );
                  }
                }}
              >
                <option value="">
                  Sem convênio
                </option>

                {convenios.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FilterField>

            <FilterField
              label="Senha / Autorização / Guia"
            >
              <Input
                value={
                  authorization
                }
                disabled={
                  !selectedConvenio
                }
                onChange={(
                  event
                ) =>
                  setAuthorization(
                    event.target.value
                  )
                }
                placeholder="Autorização do convênio"
              />
            </FilterField>

            <div className="md:col-span-2 xl:col-span-4">
              <FilterField
                label="Observações"
              >
                <Input
                  value={
                    observations
                  }
                  onChange={(
                    event
                  ) =>
                    setObservations(
                      event.target.value
                    )
                  }
                  placeholder="Observações do agendamento"
                />
              </FilterField>
            </div>
          </div>

          {feedback && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {
                feedback
              }
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-7 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={
              onClose
            }
          >
            Fechar
          </Button>

          <Button
            type="button"
            onClick={
              save
            }
          >
            <Save
              size={15}
            />

            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function FixedScheduleOccurrenceManager({
  item,
  professionals,
  rooms,
  activeUnitId,
  onClose,
  onChanged,
}: {
  item:
    AgendaOperationalItem;

  professionals:
    ProfessionalSetting[];

  rooms:
    Array<{
      id: number;
      name: string;
    }>;

  activeUnitId:
    number;

  onClose:
    () => void;

  onChanged:
    () => void;
}) {
  const [
    status,
    setStatus,
  ] =
    useState<
      FixedScheduleExceptionStatus |
      ""
    >(
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
    replacementDate,
    setReplacementDate,
  ] =
    useState(
      item.date
    );

  const [
    replacementStartTime,
    setReplacementStartTime,
  ] =
    useState(
      item.startTime
    );

  const [
    replacementEndTime,
    setReplacementEndTime,
  ] =
    useState(
      item.endTime
    );

  const [
    replacementProfessionalId,
    setReplacementProfessionalId,
  ] =
    useState(
      item.professionalId
        ? String(
            item.professionalId
          )
        : ""
    );

  const [
    replacementRoomName,
    setReplacementRoomName,
  ] =
    useState(
      item.room ===
        "Sem sala"
        ? ""
        : item.room
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

  if (
    !item.fixedScheduleId
  ) {
    return null;
  }

  const selectedReplacementProfessional =
    professionals.find(
      (
        professional
      ) =>
        professional.id ===
        Number(
          replacementProfessionalId
        )
    );

  const selectedReplacementRoom =
    rooms.find(
      (
        room
      ) =>
        room.name ===
        replacementRoomName
    );

  function saveException() {
    if (
      !status
    ) {
      setFeedback(
        "Selecione uma ação para esta sessão."
      );

      return;
    }

    if (
      status ===
        "Remarcado"
    ) {
      if (
        !replacementDate ||
        !replacementStartTime ||
        !replacementEndTime ||
        !selectedReplacementProfessional ||
        !selectedReplacementRoom
      ) {
        setFeedback(
          "Preencha data, horário, profissional e sala da remarcação."
        );

        return;
      }
    }

    setFixedScheduleException(
      {
        fixedScheduleId:
          item.fixedScheduleId,

        unitId:
          activeUnitId,

        date:
          item.date,

        status,

        reason:
          reason.trim() ||
          undefined,

        replacementDate:
          status ===
            "Remarcado"
            ? replacementDate
            : undefined,

        replacementStartTime:
          status ===
            "Remarcado"
            ? replacementStartTime
            : undefined,

        replacementEndTime:
          status ===
            "Remarcado"
            ? replacementEndTime
            : undefined,

        replacementProfessionalId:
          status ===
            "Remarcado"
            ? selectedReplacementProfessional?.id
            : undefined,

        replacementProfessionalName:
          status ===
            "Remarcado"
            ? selectedReplacementProfessional?.name
            : undefined,

        replacementRoomId:
          status ===
            "Remarcado"
            ? selectedReplacementRoom?.id
            : undefined,

        replacementRoomName:
          status ===
            "Remarcado"
            ? selectedReplacementRoom?.name
            : undefined,
      }
    );

    onChanged();
  }

  function restoreSession() {
    removeFixedScheduleException(
      item.fixedScheduleId!,
      item.date
    );

    onChanged();
  }

  const actions:
    Array<{
      value:
        FixedScheduleExceptionStatus;
      label:
        string;
      description:
        string;
    }> = [
    {
      value:
        "Cancelado pela clínica",
      label:
        "Cancelado pela clínica",
      description:
        "Cancela apenas esta sessão e preserva a rotina.",
    },
    {
      value:
        "Falta do profissional",
      label:
        "Falta do profissional",
      description:
        "Libera esta ocorrência para remanejamento/encaixe.",
    },
    {
      value:
        "Bloqueado",
      label:
        "Bloquear esta sessão",
      description:
        "Impede uso deste horário nesta data.",
    },
    {
      value:
        "Remarcado",
      label:
        "Remarcar somente esta sessão",
      description:
        "Move apenas esta ocorrência; a rotina semanal continua igual.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#ddd8ff] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#ece9ff] bg-[#faf9ff] px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Mais opções da sessão
            </h2>

            <p className="mt-1 text-xs font-medium text-[#7d89a8]">
              A alteração vale somente para {
                formatShortDate(
                  item.date
                )
              }. A rotina semanal do paciente não será apagada.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e5ef] text-[#667397]"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#e8eaf3] bg-[#fbfbfe] p-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9aa3b8]">
                Paciente
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#263765]">
                {
                  item.patient
                }
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-[#9aa3b8]">
                Profissional
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#263765]">
                {
                  item.professional
                }
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-[#9aa3b8]">
                Horário
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#263765]">
                {
                  item.startTime
                } – {
                  item.endTime
                }
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-[#9aa3b8]">
                Procedimento / sala
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#263765]">
                {
                  item.procedure
                } • {
                  item.room
                }
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-extrabold text-[#526080]">
              O que aconteceu nesta sessão?
            </p>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {actions.map(
                (
                  action
                ) => (
                  <button
                    key={
                      action.value
                    }
                    type="button"
                    onClick={() =>
                      setStatus(
                        action.value
                      )
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      status ===
                        action.value
                        ? "border-[#9b87ff] bg-[#f6f3ff]"
                        : "border-[#e5e7ef] bg-white hover:bg-[#fbfbfe]"
                    }`}
                  >
                    <p className="text-xs font-extrabold text-[#263765]">
                      {
                        action.label
                      }
                    </p>

                    <p className="mt-1 text-[10px] font-medium leading-4 text-[#8a95b4]">
                      {
                        action.description
                      }
                    </p>
                  </button>
                )
              )}
            </div>
          </div>

          {status ===
            "Remarcado" && (
            <div className="mt-5 rounded-2xl border border-[#ddd8ff] bg-[#faf9ff] p-4">
              <h3 className="text-sm font-extrabold text-[#263765]">
                Novo horário desta sessão
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FilterField label="Nova data">
                  <Input
                    type="date"
                    value={
                      replacementDate
                    }
                    onChange={(
                      event
                    ) =>
                      setReplacementDate(
                        event.target.value
                      )
                    }
                  />
                </FilterField>

                <FilterField label="Profissional">
                  <Select
                    value={
                      replacementProfessionalId
                    }
                    onChange={(
                      event
                    ) =>
                      setReplacementProfessionalId(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {professionals.map(
                      (
                        professional
                      ) => (
                        <option
                          key={
                            professional.id
                          }
                          value={
                            professional.id
                          }
                        >
                          {
                            professional.name
                          } — {
                            professional.specialty
                          }
                        </option>
                      )
                    )}
                  </Select>
                </FilterField>

                <div className="grid grid-cols-2 gap-3">
                  <FilterField label="Início">
                    <Input
                      type="time"
                      value={
                        replacementStartTime
                      }
                      onChange={(
                        event
                      ) =>
                        setReplacementStartTime(
                          event.target.value
                        )
                      }
                    />
                  </FilterField>

                  <FilterField label="Fim">
                    <Input
                      type="time"
                      value={
                        replacementEndTime
                      }
                      onChange={(
                        event
                      ) =>
                        setReplacementEndTime(
                          event.target.value
                        )
                      }
                    />
                  </FilterField>
                </div>

                <FilterField label="Sala">
                  <Select
                    value={
                      replacementRoomName
                    }
                    onChange={(
                      event
                    ) =>
                      setReplacementRoomName(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {rooms.map(
                      (
                        room
                      ) => (
                        <option
                          key={
                            room.id
                          }
                          value={
                            room.name
                          }
                        >
                          {
                            room.name
                          }
                        </option>
                      )
                    )}
                  </Select>
                </FilterField>
              </div>
            </div>
          )}

          <div className="mt-5">
            <FilterField label="Motivo / observação">
              <Input
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
                placeholder="Opcional"
              />
            </FilterField>
          </div>

          {feedback && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {
                feedback
              }
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-[#eceef5] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={
                restoreSession
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e5ef] px-4 py-2.5 text-xs font-bold text-[#667397] hover:bg-[#f8f9fc]"
            >
              <RotateCcw
                size={15}
              />

              Restaurar sessão normal
            </button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={
                  onClose
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={
                  saveException
                }
              >
                <Save
                  size={15}
                />

                Salvar exceção
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaViewButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
        active
          ? "bg-[#6847f5] text-white shadow-sm"
          : "text-[#667397] hover:bg-[#f5f3ff] hover:text-[#6847f5]"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function DailyOperationalView({
  date,
  items,
  vacantSlots,
  professionals,
  activeUnitId,
  onAppointment,
  onVacant,
  onFixedOccurrence,
  onFixedQuickStatus,
}: {
  date:
    string;

  items:
    AgendaOperationalItem[];

  vacantSlots:
    VacantSlot[];

  professionals:
    ProfessionalSetting[];

  activeUnitId:
    number;

  onAppointment:
    (
      appointmentId:
        number
    ) => void;

  onVacant:
    (
      slot:
        VacantSlot
    ) => void;

  onFixedOccurrence:
    (
      item:
        AgendaOperationalItem
    ) => void;

  onFixedQuickStatus:
    (
      item:
        AgendaOperationalItem,

      status:
        FixedScheduleExceptionStatus
    ) => void;
}) {
  const times =
    Array.from(
      new Set(
        [
          ...items.map(
            (
              item
            ) =>
              item.startTime
          ),

          ...vacantSlots.map(
            (
              slot
            ) =>
              slot.startTime
          ),
        ]
      )
    )
      .sort(
        (
          a,
          b
        ) =>
          a.localeCompare(
            b
          )
      );

  if (
    times.length ===
    0
  ) {
    return (
      <section className="rounded-2xl border border-[#e8eaf3] bg-white p-10 text-center shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <CalendarDays
          size={28}
          className="mx-auto text-[#c1c6d4]"
        />

        <p className="mt-3 font-extrabold text-[#526080]">
          Nenhum horário disponível neste dia
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="border-b border-[#eceef5] bg-[#fbfbfe] px-5 py-4">
        <h2 className="text-base font-extrabold text-[#10235f]">
          Agenda detalhada do dia
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8a95b4]">
          Cada faixa de horário mostra simultaneamente todos os profissionais atendendo, bloqueados ou disponíveis para encaixe.
        </p>
      </div>

      <div className="divide-y divide-[#eef0f5]">
        {times.map(
          (
            time
          ) => {
            const timeItems =
              items.filter(
                (
                  item
                ) =>
                  item.startTime ===
                  time
              );

            const timeVacant =
              vacantSlots.filter(
                (
                  slot
                ) =>
                  slot.startTime ===
                  time
              );

            return (
              <div
                key={
                  time
                }
                className="grid grid-cols-[78px_minmax(0,1fr)]"
              >
                <div className="border-r border-[#eef0f5] bg-[#fafbfe] px-3 py-4">
                  <p className="text-sm font-extrabold text-[#263765]">
                    {
                      time
                    }
                  </p>

                  <p className="mt-1 text-[9px] font-semibold uppercase text-[#a1a9bc]">
                    horário
                  </p>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {timeItems.map(
                      (
                        item
                      ) => (
                        <OperationalCard
                          key={
                            item.key
                          }
                          item={
                            item
                          }
                          professionals={
                            professionals
                          }
                          activeUnitId={
                            activeUnitId
                          }
                          onAppointment={
                            onAppointment
                          }
                          onFixedOccurrence={
                            onFixedOccurrence
                          }
                          onFixedQuickStatus={
                            onFixedQuickStatus
                          }
                        />
                      )
                    )}

                    {timeVacant.map(
                      (
                        slot
                      ) => (
                        <VacantCard
                          key={
                            slot.key
                          }
                          slot={
                            slot
                          }
                          activeUnitId={
                            activeUnitId
                          }
                          onClick={() =>
                            onVacant(
                              slot
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function ReceptionMonthView({
  selectedDate,
  activeUnitId,
  professionals,
  professionalFilter,
  specialtyFilter,
  statusFilter,
  procedureFilter,
  roomFilter,
  patientFilter,
  search,
  refreshKey,
  onSelectDate,
}: {
  selectedDate:
    string;

  activeUnitId:
    number;

  professionals:
    ProfessionalSetting[];

  professionalFilter:
    string;

  specialtyFilter:
    string;

  statusFilter:
    string;

  procedureFilter:
    string;

  roomFilter:
    string;

  patientFilter:
    string;

  search:
    string;

  refreshKey:
    number;

  onSelectDate:
    (
      date:
        string
    ) => void;
}) {
  void refreshKey;

  const date =
    parseDate(
      selectedDate
    );

  const year =
    date.getFullYear();

  const month =
    date.getMonth();

  const firstDate =
    `${year}-${String(
      month +
        1
    ).padStart(
      2,
      "0"
    )}-01`;

  const lastDay =
    new Date(
      year,
      month +
        1,
      0
    ).getDate();

  const lastDate =
    `${year}-${String(
      month +
        1
    ).padStart(
      2,
      "0"
    )}-${String(
      lastDay
    ).padStart(
      2,
      "0"
    )}`;

  const appointments =
    getSavedAppointments()
      .filter(
        (
          appointment
        ) =>
          appointment.unitId ===
            activeUnitId &&
          appointment.date >=
            firstDate &&
          appointment.date <=
            lastDate
      )
      .map(
        appointmentToItem
      );

  const appointmentKeys =
    new Set(
      appointments.map(
        (
          item
        ) =>
          `${item.patientId}|${item.professionalId ?? item.professional}|${item.date}|${item.startTime}`
      )
    );

  const fixed =
    getFixedScheduleOccurrences(
      activeUnitId,
      firstDate,
      lastDate
    )
      .filter(
        (
          occurrence
        ) =>
          !appointmentKeys.has(
            `${occurrence.patientId}|${occurrence.professionalId}|${occurrence.date}|${occurrence.startTime}`
          )
      )
      .map(
        fixedOccurrenceToItem
      );

  const blocks =
    getSavedBlocks()
      .filter(
        (
          block
        ) =>
          block.unitId ===
            activeUnitId &&
          block.date >=
            firstDate &&
          block.date <=
            lastDate
      )
      .map(
        (
          block
        ) =>
          blockToItem(
            block,
            professionals
          )
      );

  const term =
    search
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  const items = [
    ...appointments,
    ...fixed,
    ...blocks,
  ]
    .filter(
      (
        item
      ) => {
        const professionalMatch =
          professionalFilter ===
            "Todos" ||
          String(
            item.professionalId ??
              item.professional
          ) ===
            professionalFilter;

        const specialtyMatch =
          specialtyFilter ===
            "Todas" ||
          item.specialty ===
            specialtyFilter;

        const statusMatch =
          statusFilter ===
            "Todos" ||
          item.status ===
            statusFilter;

        const procedureMatch =
          procedureFilter ===
            "Todos" ||
          item.procedure ===
            procedureFilter;

        const roomMatch =
          roomFilter ===
            "Todas" ||
          item.room ===
            roomFilter;

        const patientMatch =
          patientFilter ===
            "Todos" ||
          String(
            item.patientId ??
              item.patient
          ) ===
            patientFilter;

        const searchMatch =
          !term ||
          [
            item.patient,
            item.professional,
            item.procedure,
            item.room,
          ]
            .join(
              " "
            )
            .toLocaleLowerCase(
              "pt-BR"
            )
            .includes(
              term
            );

        return (
          professionalMatch &&
          specialtyMatch &&
          statusMatch &&
          procedureMatch &&
          roomMatch &&
          patientMatch &&
          searchMatch
        );
      }
    );

  const firstWeekDay =
    new Date(
      year,
      month,
      1,
      12
    ).getDay();

  /*
   * Ajusta para calendário iniciado na segunda.
   */
  const mondayBasedOffset =
    firstWeekDay ===
      0
      ? 6
      : firstWeekDay -
        1;

  const days =
    Array.from(
      {
        length:
          lastDay,
      },
      (
        _,
        index
      ) =>
        index +
        1
    );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="grid grid-cols-7 border-b border-[#e8eaf3] bg-[#fbfbfe]">
        {[
          "Seg",
          "Ter",
          "Qua",
          "Qui",
          "Sex",
          "Sáb",
          "Dom",
        ].map(
          (
            label
          ) => (
            <div
              key={
                label
              }
              className="border-r border-[#eef0f5] px-3 py-3 text-center text-[10px] font-extrabold uppercase tracking-wide text-[#7d89a8] last:border-r-0"
            >
              {
                label
              }
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-7">
        {Array.from(
          {
            length:
              mondayBasedOffset,
          },
          (
            _,
            index
          ) => (
            <div
              key={
                `empty-${index}`
              }
              className="min-h-[135px] border-b border-r border-[#eef0f5] bg-[#fafbfc]"
            />
          )
        )}

        {days.map(
          (
            day
          ) => {
            const currentDate =
              `${year}-${String(
                month +
                  1
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
              items.filter(
                (
                  item
                ) =>
                  item.date ===
                  currentDate
              );

            const isToday =
              currentDate ===
              formatDate(
                new Date()
              );

            return (
              <button
                key={
                  currentDate
                }
                type="button"
                onClick={() =>
                  onSelectDate(
                    currentDate
                  )
                }
                className={`min-h-[135px] border-b border-r border-[#eef0f5] p-2.5 text-left transition hover:bg-[#faf9ff] ${
                  isToday
                    ? "bg-[#faf8ff]"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                    isToday
                      ? "bg-[#6847f5] text-white"
                      : "text-[#526080]"
                  }`}>
                    {
                      day
                    }
                  </span>

                  {dayItems.length >
                    0 && (
                    <span className="rounded-full bg-[#eeeaff] px-2 py-0.5 text-[9px] font-extrabold text-[#6847f5]">
                      {
                        dayItems.length
                      }
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {dayItems
                    .filter(
                      (
                        item
                      ) =>
                        item.source !==
                        "block"
                    )
                    .slice(
                      0,
                      3
                    )
                    .map(
                      (
                        item
                      ) => {
                        const procedureColor =
                          getProcedureColor(
                            item.procedure
                          );

                        return (
                          <div
                            key={
                              item.key
                            }
                            className="flex items-center gap-1.5 truncate rounded-md bg-[#f7f8fc] px-2 py-1 text-[8px] font-semibold text-[#667397]"
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  procedureColor,
                              }}
                            />

                            <span className="truncate">
                              {
                                item.startTime
                              } {
                                item.patient
                              }
                            </span>
                          </div>
                        );
                      }
                    )}

                  {dayItems.length >
                    3 && (
                    <p className="px-1 text-[8px] font-bold text-[#8e98b0]">
                      +{
                        dayItems.length -
                        3
                      } mais
                    </p>
                  )}
                </div>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[#536180]">
        {
          label
        }
      </span>

      {
        children
      }
    </label>
  );
}

function SummaryCard({
  label,
  value,
  icon:
    Icon,
  className,
}: {
  label:
    string;

  value:
    number;

  icon:
    typeof CalendarDays;

  className:
    string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8eaf3] bg-white p-4 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#929bb3]">
            {
              label
            }
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[#263765]">
            {
              value
            }
          </p>
        </div>

        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}>
          <Icon
            size={18}
          />
        </span>
      </div>
    </div>
  );
}

function DayColumn({
  date,
  items,
  vacantSlots,
  hiddenVacantCount,
  professionals,
  activeUnitId,
  onAppointment,
  onVacant,
  onFixedOccurrence,
  onFixedQuickStatus,
}: {
  date:
    string;

  items:
    AgendaOperationalItem[];

  vacantSlots:
    VacantSlot[];

  hiddenVacantCount:
    number;

  professionals:
    ProfessionalSetting[];

  activeUnitId:
    number;

  onAppointment:
    (
      appointmentId:
        number
    ) => void;

  onVacant:
    (
      slot:
        VacantSlot
    ) => void;

  onFixedOccurrence:
    (
      item:
        AgendaOperationalItem
    ) => void;

  onFixedQuickStatus:
    (
      item:
        AgendaOperationalItem,

      status:
        FixedScheduleExceptionStatus
    ) => void;
}) {
  const today =
    formatDate(
      new Date()
    );

  const isToday =
    date ===
    today;

  const timeline = [
    ...items.map(
      (
        item
      ) => ({
        kind:
          "item" as const,

        time:
          item.startTime,

        item,
      })
    ),

    ...vacantSlots.map(
      (
        slot
      ) => ({
        kind:
          "vacant" as const,

        time:
          slot.startTime,

        slot,
      })
    ),
  ]
    .sort(
      (
        a,
        b
      ) =>
        a.time.localeCompare(
          b.time
        )
    );

  return (
    <section className={`overflow-hidden rounded-2xl border bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)] ${
      isToday
        ? "border-[#bdb0ff] ring-2 ring-[#eeeaff]"
        : "border-[#e8eaf3]"
    }`}>
      <div className={`border-b px-4 py-3 ${
        isToday
          ? "border-[#ded8ff] bg-[#faf8ff]"
          : "border-[#eef0f5] bg-[#fbfbfe]"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className={`text-sm font-extrabold ${
              isToday
                ? "text-[#6847f5]"
                : "text-[#263765]"
            }`}>
              {
                formatShortDate(
                  date
                )
              }
            </p>

            <p className="mt-0.5 text-[9px] font-semibold text-[#9aa3b8]">
              {
                items.filter(
                  (
                    item
                  ) =>
                    item.source !==
                    "block"
                ).length
              } atendimento(s)
            </p>
          </div>

          {isToday && (
            <span className="rounded-full bg-[#6847f5] px-2 py-1 text-[8px] font-extrabold uppercase text-white">
              Hoje
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[760px] space-y-2 overflow-y-auto p-2.5">
        {timeline.map(
          (
            entry
          ) =>
            entry.kind ===
              "item"
              ? (
                <OperationalCard
                  key={
                    entry.item.key
                  }
                  item={
                    entry.item
                  }
                  professionals={
                    professionals
                  }
                  activeUnitId={
                    activeUnitId
                  }
                  onAppointment={
                    onAppointment
                  }
                  onFixedOccurrence={
                    onFixedOccurrence
                  }
                  onFixedQuickStatus={
                    onFixedQuickStatus
                  }
                />
              )
              : (
                <VacantCard
                  key={
                    entry.slot.key
                  }
                  slot={
                    entry.slot
                  }
                  activeUnitId={
                    activeUnitId
                  }
                  onClick={() =>
                    onVacant(
                      entry.slot
                    )
                  }
                />
              )
        )}

        {hiddenVacantCount >
          0 && (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-3 py-2 text-center text-[10px] font-bold text-emerald-700">
            +{
              hiddenVacantCount
            } horários livres. Filtre um profissional para visualizar todos.
          </div>
        )}

        {timeline.length ===
          0 && (
          <div className="rounded-xl border border-dashed border-[#e1e4ef] bg-[#fbfbfd] px-3 py-10 text-center">
            <Filter
              size={22}
              className="mx-auto text-[#c1c6d4]"
            />

            <p className="mt-2 text-[10px] font-semibold text-[#98a1b8]">
              Sem registros para os filtros atuais.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function getSpecialtyCardColor(
  activeUnitId:
    number,

  specialtyName:
    string
) {
  const specialty =
    getActiveSpecialties()
      .find(
        (
          item
        ) =>
          item.name ===
          specialtyName
      );

  if (
    !specialty
  ) {
    return "#64748B";
  }

  return getSpecialtyAgendaColor(
    activeUnitId,
    specialty.id
  );
}

const PROCEDURE_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#059669",
  "#D97706",
  "#0891B2",
  "#DC2626",
  "#4F46E5",
  "#65A30D",
  "#C026D3",
];

function getProcedureColor(
  procedure:
    string
) {
  const normalized =
    procedure
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  if (
    !normalized
  ) {
    return "#64748B";
  }

  /*
   * A cor é derivada do nome do procedimento.
   * O mesmo procedimento sempre recebe a mesma cor,
   * sem depender do profissional.
   */
  let hash =
    0;

  for (
    let index =
      0;
    index <
      normalized.length;
    index +=
      1
  ) {
    hash =
      (
        hash *
          31 +
        normalized.charCodeAt(
          index
        )
      ) >>>
      0;
  }

  return PROCEDURE_COLORS[
    hash %
      PROCEDURE_COLORS.length
  ];
}

function OperationalCard({
  item,
  professionals,
  activeUnitId,
  onAppointment,
  onFixedOccurrence,
  onFixedQuickStatus,
}: {
  item:
    AgendaOperationalItem;

  professionals:
    ProfessionalSetting[];

  activeUnitId:
    number;

  onAppointment:
    (
      appointmentId:
        number
    ) => void;

  onFixedOccurrence:
    (
      item:
        AgendaOperationalItem
    ) => void;

  onFixedQuickStatus:
    (
      item:
        AgendaOperationalItem,

      status:
        FixedScheduleExceptionStatus
    ) => void;
}) {
  /*
   * COR PRINCIPAL DO CARD:
   * a especialidade define a cor-base e cada profissional
   * recebe automaticamente um tom dessa mesma família.
   *
   * STATUS:
   * continua visível na faixa lateral e no selo.
   *
   * PROCEDIMENTO:
   * continua identificado pela bolinha.
   */
  const professional =
    item.professionalId !==
      undefined
      ? professionals.find(
          (
            current
          ) =>
            current.id ===
            item.professionalId
        )
      : professionals.find(
          (
            current
          ) =>
            current.name ===
            item.professional
        );

  const professionalTone =
    professional
      ? getProfessionalAgendaTone(
          activeUnitId,
          professional.id
        )
      : undefined;

  const specialtyColor =
    professionalTone?.toneColor ??
    getSpecialtyCardColor(
      activeUnitId,
      item.specialty
    );

  const statusColor =
    getStatusSolidColor(
      item.status
    );

  const procedureColor =
    getProcedureColor(
      item.procedure
    );

  const cardBackground =
    mixWithWhite(
      specialtyColor,
      0.86
    );

  const borderColor =
    mixWithWhite(
      specialtyColor,
      0.55
    );

  const cancelled =
    isCancelledStatus(
      item.status
    );

  const block =
    item.source ===
    "block";

  const clickable =
    item.appointmentId !==
    undefined;

  return (
    <div
      role={
        clickable
          ? "button"
          : undefined
      }
      tabIndex={
        clickable
          ? 0
          : undefined
      }
      onClick={() => {
        if (
          item.appointmentId !==
          undefined
        ) {
          onAppointment(
            item.appointmentId
          );
        }
      }}
      onKeyDown={(
        event
      ) => {
        if (
          clickable &&
          (
            event.key ===
              "Enter" ||
            event.key ===
              " "
          ) &&
          item.appointmentId !==
            undefined
        ) {
          event.preventDefault();

          onAppointment(
            item.appointmentId
          );
        }
      }}
      className={`relative w-full overflow-hidden rounded-xl border p-3 text-left transition ${
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-default"
      } ${
        cancelled
          ? "opacity-80"
          : ""
      }`}
      style={{
        backgroundColor:
          block
            ? "#F8FAFC"
            : cardBackground,

        borderColor:
          block
            ? "#CBD5E1"
            : borderColor,
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{
          backgroundColor:
            statusColor,
        }}
        title={`Status: ${getStatusLabel(
          item.status
        )}`}
      />

      <div className="flex items-start justify-between gap-2 pl-1">
        <div className="min-w-0">
          <p
            className="text-[11px] font-extrabold"
            style={{
              color:
                block
                  ? "#475569"
                  : specialtyColor,
            }}
          >
            {
              item.startTime
            } – {
              item.endTime
            }
          </p>

          {!block && (
            <p className={`mt-1 truncate text-[11px] font-extrabold ${
              cancelled
                ? "line-through text-[#7c879f]"
                : "text-[#263765]"
            }`}>
              {
                item.patient ||
                "Sem paciente"
              }
            </p>
          )}

          {block && (
            <p className="mt-1 truncate text-[11px] font-extrabold text-[#475569]">
              {
                item.procedure
              }
            </p>
          )}
        </div>

        {item.status !==
          "Horário fixo" && (
          <span
            className="shrink-0 rounded-full border bg-white/80 px-2 py-0.5 text-[8px] font-extrabold"
            style={{
              borderColor:
                mixWithWhite(
                  statusColor,
                  0.55
                ),

              color:
                statusColor,
            }}
          >
            {
              getStatusLabel(
                item.status
              )
            }
          </span>
        )}
      </div>

      <div className="mt-2.5 space-y-1.5 pl-1">
        <InfoLine
          icon={
            UserRound
          }
          value={
            item.professional
          }
        />

        {item.procedure && (
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
              style={{
                backgroundColor:
                  procedureColor,
              }}
              title={`Procedimento: ${item.procedure}`}
            />

            <Stethoscope
              size={11}
              className="shrink-0 text-[#8e98b0]"
            />

            <p className="truncate text-[9px] font-semibold text-[#6f7c9b]">
              {
                item.procedure
              }
            </p>
          </div>
        )}

        {item.room && (
          <InfoLine
            icon={
              DoorOpen
            }
            value={
              item.room
            }
          />
        )}
      </div>

      {item.source ===
        "fixed" && (
        <div
          className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-black/5 pt-2"
          onClick={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            onClick={() =>
              onFixedQuickStatus(
                item,
                "Confirmado"
              )
            }
            className={`rounded-md border px-2 py-1 text-[8px] font-extrabold transition ${
              item.status ===
                "Confirmado"
                ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                : "border-emerald-200 bg-white/80 text-emerald-700 hover:bg-emerald-50"
            }`}
            title="Confirmar esta sessão"
          >
            ✓ Confirmou
          </button>

          <button
            type="button"
            onClick={() =>
              onFixedQuickStatus(
                item,
                "Falta"
              )
            }
            className={`rounded-md border px-2 py-1 text-[8px] font-extrabold transition ${
              item.status ===
                "Faltou"
                ? "border-orange-500 bg-orange-100 text-orange-800"
                : "border-orange-200 bg-white/80 text-orange-700 hover:bg-orange-50"
            }`}
            title="Registrar falta do paciente"
          >
            Faltou
          </button>

          <button
            type="button"
            onClick={() =>
              onFixedQuickStatus(
                item,
                "Cancelado pelo paciente"
              )
            }
            className={`rounded-md border px-2 py-1 text-[8px] font-extrabold transition ${
              item.status ===
                "Cancelado pelo paciente"
                ? "border-red-500 bg-red-100 text-red-700"
                : "border-red-200 bg-white/80 text-red-600 hover:bg-red-50"
            }`}
            title="Cancelar somente esta sessão"
          >
            Cancelou
          </button>

          <button
            type="button"
            onClick={() =>
              onFixedOccurrence(
                item
              )
            }
            className="flex h-6 w-7 items-center justify-center rounded-md border border-[#ddd8ff] bg-white/80 text-[#6847f5] transition hover:bg-white"
            title="Mais opções"
          >
            <MoreHorizontal
              size={13}
            />
          </button>
        </div>
      )}

      {item.cancelledMakesSlotAvailable && (
        <div className="mt-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-[9px] font-extrabold text-emerald-700">
          Horário liberado para encaixe
        </div>
      )}
    </div>
  );
}

function VacantCard({
  slot,
  activeUnitId,
  onClick,
}: {
  slot:
    VacantSlot;

  activeUnitId:
    number;

  onClick:
    () => void;
}) {
  void activeUnitId;

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="w-full rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-extrabold text-emerald-700">
          {
            slot.startTime
          } – {
            slot.endTime
          }
        </p>

        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-extrabold text-emerald-700">
          LIVRE
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <UserRound
          size={11}
          className="shrink-0 text-emerald-700"
        />

        <p className="truncate text-[10px] font-semibold text-[#667397]">
          {
            slot.professional
          }
        </p>
      </div>

      <p className="mt-2 text-[9px] font-extrabold text-emerald-700">
        Clique para encaixar
      </p>
    </button>
  );
}

function InfoLine({
  icon:
    Icon,
  value,
}: {
  icon:
    typeof UserRound;

  value:
    string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Icon
        size={11}
        className="shrink-0 text-[#8e98b0]"
      />

      <p className="truncate text-[9px] font-semibold text-[#6f7c9b]">
        {
          value
        }
      </p>
    </div>
  );
}
