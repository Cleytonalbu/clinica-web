import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Lock,
  Plus,
  Search,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  useAuth,
} from "@/auth/AuthContext";

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
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  getSavedAppointments,
  type StoredAppointment,
} from "./appointmentStorage";

import {
  AppointmentRequestsPanel,
} from "./AppointmentRequestsPanel";

import {
  getAppointmentRequestsByUnit,
} from "./appointmentRequestStorage";

type CalendarView =
  | "day"
  | "professionals"
  | "requests"
  | "week"
  | "month";

const defaultAppointments: StoredAppointment[] = [
  { id: 1, patientId: 1, patient: "Maria Oliveira", professional: "Dra. Ana Paula", specialty: "Psicologia", date: "2026-08-07", time: "08:00", endTime: "08:50", room: "Sala 01", type: "Individual", status: "Realizado" },
  { id: 2, patientId: 2, patient: "João Miguel Silva", professional: "Dra. Camila Soares", specialty: "Fonoaudiologia", date: "2026-08-07", time: "08:00", endTime: "08:50", room: "Sala 02", type: "Individual", status: "Confirmado" },
  { id: 3, patientId: 3, patient: "Lucas Gabriel", professional: "Dra. Ana Paula", specialty: "Psicologia", date: "2026-08-07", time: "09:00", endTime: "09:50", room: "Sala 01", type: "Individual", status: "Confirmado" },
  { id: 4, patientId: 4, patient: "Ana Clara Rodrigues", professional: "Dra. Larissa Lima", specialty: "Terapia Ocupacional", date: "2026-08-07", time: "10:00", endTime: "10:50", room: "Sala 03", type: "Individual", status: "Agendado" },
  { id: 5, patientId: 5, patient: "Pedro Henrique", professional: "Dr. Rafael Costa", specialty: "Fisioterapia", date: "2026-08-07", time: "11:00", endTime: "11:50", room: "Sala 04", type: "Avaliação", status: "Cancelado" },
  { id: 6, patientId: 1, patient: "Maria Oliveira", professional: "Dra. Camila Soares", specialty: "Fonoaudiologia", date: "2026-08-07", time: "14:00", endTime: "14:50", room: "Sala 02", type: "Individual", status: "Agendado" },
  { id: 7, patientId: 3, patient: "Lucas Gabriel", professional: "Dra. Ana Paula", specialty: "Psicologia", date: "2026-08-08", time: "09:00", endTime: "09:50", room: "Sala 01", type: "Individual", status: "Agendado" },
  { id: 8, patientId: 1, patient: "Maria Oliveira", professional: "Dra. Ana Paula", specialty: "Psicologia", date: "2026-08-10", time: "10:30", endTime: "11:20", room: "Sala 01", type: "Individual", status: "Confirmado" },
];

const defaultScheduleBlocks: ScheduleBlock[] = [
  { id: 1, professional: "Dra. Ana Paula", date: "2026-08-07", startTime: "12:00", endTime: "13:00", type: "Almoço", reason: "Intervalo de almoço" },
  { id: 2, professional: "Dra. Camila Soares", date: "2026-08-07", startTime: "11:00", endTime: "12:00", type: "Reunião", reason: "Reunião da equipe clínica" },
  { id: 3, professional: "Dra. Larissa Lima", date: "2026-08-07", startTime: "14:00", endTime: "17:00", type: "Indisponível", reason: "Atividade externa" },
  { id: 4, professional: "Dr. Rafael Costa", date: "2026-08-08", startTime: "08:00", endTime: "17:00", type: "Férias", reason: "Período de férias" },
];

const professionals = ["Todos", "Dra. Ana Paula", "Dra. Camila Soares", "Dra. Larissa Lima", "Dr. Rafael Costa"];
const specialties = ["Todas", "Psicologia", "Fonoaudiologia", "Terapia Ocupacional", "Fisioterapia"];

export default function Agenda() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    activeUnitId,
  } =
    useUnit();

  const defaultUnitId =
    getDefaultClinicUnitId();

  const isGestor = user?.profile === "Gestor";
  const isRecepcao = user?.profile === "Recepção";
  const isProfissional = user?.profile === "Profissional";

  const loggedProfessionalName = user?.professionalName ?? user?.name ?? "";
  const canManageSchedule = isGestor || isRecepcao;
  const canCreateBlock = isGestor || isRecepcao;

  const [view, setView] = useState<CalendarView>("day");
  const [selectedDate, setSelectedDate] = useState("2026-08-07");
  const [search, setSearch] = useState("");
  const [professional, setProfessional] = useState("Todos");
  const [specialty, setSpecialty] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [appointments, setAppointments] = useState<StoredAppointment[]>(() => [
    ...(
      activeUnitId ===
      defaultUnitId
        ? defaultAppointments
        : []
    ),
    ...getSavedAppointments().filter(
      (appointment) =>
        appointment.unitId ===
        activeUnitId
    ),
  ] as StoredAppointment[]);

  const [scheduleBlocks] = useState<ScheduleBlock[]>(() => [
    ...(
      activeUnitId ===
      defaultUnitId
        ? defaultScheduleBlocks.map(
            (block) => ({
              ...block,
              unitId:
                defaultUnitId,
            })
          )
        : []
    ),
    ...getSavedBlocks().filter(
      (block) =>
        block.unitId ===
        activeUnitId
    ),
  ]);

  const [
    pendingRequestCount,
    setPendingRequestCount,
  ] =
    useState(
      () =>
        getAppointmentRequestsByUnit(
          activeUnitId
        ).filter(
          (
            request
          ) =>
            request.status ===
            "Pendente"
        ).length
    );

  function handleAppointmentConfirmedFromApp(
    appointment:
      StoredAppointment
  ) {
    setAppointments(
      (
        current
      ) => [
        ...current,
        appointment,
      ]
    );

    setPendingRequestCount(
      getAppointmentRequestsByUnit(
        activeUnitId
      ).filter(
        (
          request
        ) =>
          request.status ===
          "Pendente"
      ).length
    );
  }

  const profileAppointments = useMemo(() => {
    if (!isProfissional) return appointments;
    return appointments.filter((appointment) => appointment.professional === loggedProfessionalName);
  }, [appointments, isProfissional, loggedProfessionalName]);

  const filteredAppointments = useMemo(() => {
    return profileAppointments.filter((appointment) => {
      const searchValue = search.toLowerCase();
      const matchesSearch = appointment.patient.toLowerCase().includes(searchValue) || appointment.professional.toLowerCase().includes(searchValue);
      const matchesProfessional = isProfissional || professional === "Todos" || appointment.professional === professional;
      const matchesSpecialty = specialty === "Todas" || appointment.specialty === specialty;
      const matchesStatus = status === "Todos" || appointment.status === status;
      return matchesSearch && matchesProfessional && matchesSpecialty && matchesStatus;
    });
  }, [profileAppointments, search, professional, specialty, status, isProfissional]);

  const filteredBlocks = useMemo(() => scheduleBlocks.filter((block) => {
    if (isProfissional) return block.professional === loggedProfessionalName;
    return professional === "Todos" || block.professional === professional;
  }), [professional, scheduleBlocks, isProfissional, loggedProfessionalName]);

  const dayAppointments = filteredAppointments.filter((appointment) => appointment.date === selectedDate);
  const dayBlocks = filteredBlocks.filter((block) => block.date === selectedDate);
  const dayStats = profileAppointments.filter((appointment) => appointment.date === selectedDate);

  const confirmedCount = dayStats.filter((item) => item.status === "Confirmado").length;
  const realizedCount = dayStats.filter((item) => item.status === "Realizado").length;
  const absentCount = dayStats.filter((item) => item.status === "Faltou").length;
  const cancelledCount = dayStats.filter((item) => item.status === "Cancelado").length;
  const scheduledCount = dayStats.filter((item) => item.status === "Agendado").length;

  function handlePrevious() {
    if (view === "day" || view === "professionals") {
      setSelectedDate(addDays(selectedDate, -1));
      return;
    }
    if (view === "week") {
      setSelectedDate(addDays(selectedDate, -7));
      return;
    }
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setMonth(date.getMonth() - 1);
    setSelectedDate(formatDateForInput(date));
  }

  function handleNext() {
    if (view === "day" || view === "professionals") {
      setSelectedDate(addDays(selectedDate, 1));
      return;
    }
    if (view === "week") {
      setSelectedDate(addDays(selectedDate, 7));
      return;
    }
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setMonth(date.getMonth() + 1);
    setSelectedDate(formatDateForInput(date));
  }

  function handleToday() {
    setSelectedDate(formatDateForInput(new Date()));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              {isProfissional ? "Minha Agenda" : "Agenda"}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-[#7d89a8]">
              {isProfissional ? "Visualize seus atendimentos, pacientes e horários programados." : "Visualize e gerencie os atendimentos de todos os profissionais da clínica."}
            </p>
          </div>

          {(canManageSchedule || isProfissional) && (
            <div className="flex flex-wrap gap-2">
              {isProfissional && (
                <Button type="button" variant="outline" onClick={() => navigate("/agenda/bloqueio/solicitar")} className="border-[#dfe3f2] bg-white text-[#263765] hover:bg-[#fafaff]">
                  <Lock size={17} /> Solicitar bloqueio
                </Button>
              )}
              {canManageSchedule && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPendingRequestCount(
                      getAppointmentRequestsByUnit(
                        activeUnitId
                      ).filter(
                        (request) =>
                          request.status === "Pendente"
                      ).length
                    );
                    setView("requests");
                  }}
                  className="border-[#dfe3f2] bg-white text-[#263765] hover:bg-[#fafaff]"
                >
                  <Inbox size={17} />
                  Solicitações
                  {pendingRequestCount > 0 && (
                    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#6847f5] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {pendingRequestCount}
                    </span>
                  )}
                </Button>
              )}

              {canCreateBlock && (
                <Button type="button" variant="outline" onClick={() => navigate("/agenda/bloqueio/novo")} className="border-[#dfe3f2] bg-white text-[#263765] hover:bg-[#fafaff]">
                  <Lock size={17} /> Novo bloqueio
                </Button>
              )}
              {canManageSchedule && (
                <Button type="button" onClick={() => navigate("/agenda/novo")} className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] shadow-[0_8px_20px_rgba(103,66,246,0.18)] hover:opacity-95">
                  <Plus size={18} /> Novo agendamento
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Atendimentos" value={String(dayStats.length)} description="Na data" icon={CalendarDays} iconStyle="bg-[#eeeaff] text-[#6847f5]" valueStyle="text-[#6847f5]" />
          <MetricCard title="Confirmados" value={String(confirmedCount)} description="Aguardando" icon={CheckCircle2} iconStyle="bg-[#eaf4ff] text-[#3988e8]" valueStyle="text-[#397fd5]" />
          <MetricCard title="Realizados" value={String(realizedCount)} description="Concluídos" icon={CheckCircle2} iconStyle="bg-[#e8faf4] text-[#2daf82]" valueStyle="text-[#269d75]" />
          <MetricCard title="Faltas" value={String(absentCount)} description="Não compareceu" icon={UserX} iconStyle="bg-[#fff4e7] text-[#ed982f]" valueStyle="text-[#dc8a27]" />
          <MetricCard title="Cancelados" value={String(cancelledCount)} description="Na data" icon={XCircle} iconStyle="bg-[#fff0f3] text-[#eb5771]" valueStyle="text-[#df4e67]" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <div className="border-b border-[#eef0f6] px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#10235f]">Agenda</h2>
            <p className="mt-1 text-sm font-medium text-[#8994b2]">Alterne a visualização e navegue pelo calendário.</p>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {!isProfissional && <ViewButton icon={UserRound} active={view === "professionals"} onClick={() => setView("professionals")}>Profissionais</ViewButton>}
              <ViewButton icon={CalendarDays} active={view === "day"} onClick={() => setView("day")}>Dia</ViewButton>
              <ViewButton icon={CalendarDays} active={view === "week"} onClick={() => setView("week")}>Semana</ViewButton>
              <ViewButton icon={CalendarDays} active={view === "month"} onClick={() => setView("month")}>Mês</ViewButton>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={handlePrevious} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfe3f2] bg-white text-[#65739c] transition hover:border-[#d3ccff] hover:bg-[#faf9ff] hover:text-[#6543ef]">
                <ChevronLeft size={18} />
              </button>
              <div className="relative">
                <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6543ef]" />
                <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-11 w-[190px] border-[#dfe3f2] bg-white pl-10 font-semibold text-[#263765]" />
              </div>
              <button type="button" onClick={handleNext} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfe3f2] bg-white text-[#65739c] transition hover:border-[#d3ccff] hover:bg-[#faf9ff] hover:text-[#6543ef]">
                <ChevronRight size={18} />
              </button>
              <Button type="button" variant="outline" onClick={handleToday} className="h-11 shrink-0 border-[#dfe3f2] bg-white px-4 text-[#263765] hover:bg-[#faf9ff]">
                <CalendarDays size={16} /> Hoje
              </Button>
            </div>
          </div>
        </section>

        {view !== "requests" && (
        <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
          <div className={`grid grid-cols-1 gap-3 ${isProfissional ? "xl:grid-cols-4" : "xl:grid-cols-5"}`}>
            <div className="relative xl:col-span-2">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792b3]" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isProfissional ? "Pesquisar paciente..." : "Pesquisar paciente ou profissional..."} className="border-[#e1e4f1] bg-[#fbfbfe] pl-11 focus:bg-white" />
            </div>

            {isProfissional ? (
              <div className="flex h-11 items-center rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-4 text-sm font-semibold text-[#5f6e93]">{loggedProfessionalName || "Profissional"}</div>
            ) : (
              <Select value={professional} onChange={(event) => setProfessional(event.target.value)} className="border-[#e1e4f1] bg-[#fbfbfe]">
                {professionals.map((item) => <option key={item} value={item}>{item === "Todos" ? "Todos os profissionais" : item}</option>)}
              </Select>
            )}

            <Select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="border-[#e1e4f1] bg-[#fbfbfe]">
              {specialties.map((item) => <option key={item} value={item}>{item === "Todas" ? "Todas as especialidades" : item}</option>)}
            </Select>

            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="border-[#e1e4f1] bg-[#fbfbfe]">
              <option value="Todos">Todos os status</option>
              <option value="Confirmado">Confirmados</option>
              <option value="Agendado">Agendados</option>
              <option value="Realizado">Realizados</option>
              <option value="Faltou">Faltas</option>
              <option value="Cancelado">Cancelados</option>
            </Select>
          </div>
        </section>
        )}

        {view === "requests" && canManageSchedule && (
          <AppointmentRequestsPanel
            unitId={activeUnitId}
            onAppointmentConfirmed={handleAppointmentConfirmedFromApp}
          />
        )}

        {view === "day" && (
          <>
            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
              <DayView appointments={dayAppointments} blocks={dayBlocks} selectedDate={selectedDate} canReschedule={canManageSchedule} onPatient={(patientId) => navigate(`/pacientes/${patientId}`)} onReschedule={(appointmentId) => navigate(`/agenda/${appointmentId}/remarcar`)} onDetails={(appointmentId) => navigate(`/agenda/${appointmentId}`)} />
              <div className="space-y-6">
                <MiniCalendar selectedDate={selectedDate} appointments={filteredAppointments} onSelectDate={setSelectedDate} onPrevious={handlePrevious} onNext={handleNext} />
                <DaySummary confirmed={confirmedCount} scheduled={scheduledCount} realized={realizedCount} cancelled={cancelledCount} blocks={dayBlocks.length} />
              </div>
            </div>

            <PageCard title="Bloqueios e indisponibilidades" description="Períodos reservados ou indisponíveis na data selecionada.">
              <ScheduleBlocksView blocks={filteredBlocks} selectedDate={selectedDate} />
            </PageCard>

            <div className="flex items-center gap-3 rounded-2xl border border-[#e9e3ff] bg-gradient-to-r from-[#f4f0ff] via-[#f8f5ff] to-[#fbf9ff] px-5 py-4 text-sm text-[#5d678c]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm"><Clock3 size={18} /></span>
              <p><strong className="text-[#6543ef]">Dica:</strong> clique em um agendamento para ver detalhes, remarcar ou acessar o paciente.</p>
            </div>
          </>
        )}

        {!isProfissional && view === "professionals" && (
          <ProfessionalColumnsView appointments={filteredAppointments} blocks={filteredBlocks} selectedDate={selectedDate} onPatient={(patientId: number) => navigate(`/pacientes/${patientId}`)} onDetails={(appointmentId: number) => navigate(`/agenda/${appointmentId}`)} />
        )}

        {view === "week" && <WeekView appointments={filteredAppointments} selectedDate={selectedDate} />}
        {view === "month" && <MonthView appointments={filteredAppointments} selectedDate={selectedDate} />}
      </div>
    </DashboardLayout>
  );
}

interface DayViewProps {
  appointments: StoredAppointment[];
  blocks: ScheduleBlock[];
  selectedDate: string;
  canReschedule: boolean;
  onPatient: (patientId: number) => void;
  onReschedule: (appointmentId: number) => void;
  onDetails: (appointmentId: number) => void;
}

function DayView({ appointments, blocks, selectedDate, canReschedule, onPatient, onReschedule, onDetails }: DayViewProps) {
  const items = [
    ...appointments.map((appointment) => ({ type: "appointment" as const, time: appointment.time, data: appointment })),
    ...blocks.map((block) => ({ type: "block" as const, time: block.startTime, data: block })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#eef0f6] px-5 py-4">
        <div>
          <h2 className="text-lg font-extrabold capitalize text-[#10235f]">{formatLongDate(selectedDate)}</h2>
          <p className="mt-1 text-xs font-medium text-[#8b95b2]">Agenda do dia</p>
        </div>
        <span className="rounded-full bg-[#f0ecff] px-3 py-1.5 text-[10px] font-extrabold text-[#6847f5]">Dia selecionado</span>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-[#f0f1f6]">
          {items.map((item) => item.type === "appointment" ? (
            <AppointmentTimelineRow key={`appointment-${item.data.id}`} appointment={item.data} canReschedule={canReschedule} onPatient={() => onPatient(item.data.patientId)} onReschedule={() => onReschedule(item.data.id)} onDetails={() => onDetails(item.data.id)} />
          ) : (
            <BlockTimelineRow key={`block-${item.data.id}`} block={item.data} />
          ))}
        </div>
      ) : <EmptyState />}
    </section>
  );
}

interface AppointmentRowProps {
  appointment: StoredAppointment;
  canReschedule: boolean;
  onPatient: () => void;
  onReschedule: () => void;
  onDetails: () => void;
}

function AppointmentTimelineRow({ appointment, canReschedule, onPatient, onReschedule, onDetails }: AppointmentRowProps) {
  const specialtyStyle = getSpecialtyStyle(appointment.specialty);

  return (
    <div className="group relative flex gap-4 px-4 py-4 transition hover:bg-[#fcfbff] sm:px-5">
      <div className="w-[58px] shrink-0 pt-1 text-right">
        <p className="text-sm font-extrabold text-[#46557f]">{appointment.time}</p>
        <p className="mt-1 text-[10px] text-[#a0a8bd]">{appointment.endTime}</p>
      </div>

      <div className={`relative min-w-0 flex-1 overflow-hidden rounded-xl border p-4 ${specialtyStyle.card}`}>
        <div className={`absolute bottom-0 left-0 top-0 w-1 ${specialtyStyle.line}`} />
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${specialtyStyle.icon}`}>{getInitials(appointment.patient)}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={onPatient} className="truncate text-left text-sm font-extrabold text-[#263765] transition hover:text-[#6543ef]">{appointment.patient}</button>
                <StatusBadge status={appointment.status} />
              </div>
              <p className="mt-1 text-xs font-semibold text-[#697699]">{appointment.professional} <span className="text-[#b0b6c7]">•</span> {appointment.specialty}</p>
              <p className="mt-1 text-[10px] font-medium text-[#929bb5]">{appointment.room} • {appointment.type}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {canReschedule && (
              <button type="button" disabled={appointment.status === "Realizado" || appointment.status === "Cancelado" || appointment.status === "Faltou"} onClick={onReschedule} className="rounded-lg border border-[#e1e4ef] bg-white px-3 py-2 text-[10px] font-bold text-[#68769a] transition hover:border-[#d4ceff] hover:text-[#6543ef] disabled:cursor-not-allowed disabled:opacity-40">Remarcar</button>
            )}
            <button type="button" onClick={onDetails} className="rounded-lg bg-[#6744ef] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#5938dc]">Detalhes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockTimelineRow({ block }: { block: ScheduleBlock }) {
  return (
    <div className="flex gap-4 bg-[#fcfcfe] px-4 py-4 sm:px-5">
      <div className="w-[58px] shrink-0 pt-1 text-right">
        <p className="text-sm font-extrabold text-[#66718e]">{block.startTime}</p>
        <p className="mt-1 text-[10px] text-[#a0a8bd]">{block.endTime}</p>
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-dashed border-[#dce0ea] bg-[#f7f8fb] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9ecf3] text-[#6d7895]"><Lock size={16} /></span>
          <div>
            <p className="text-xs font-extrabold text-[#4d5978]">Bloqueio — {block.type}</p>
            <p className="mt-1 text-[10px] font-medium text-[#8b94aa]">{block.professional} • {block.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCalendar({ selectedDate, appointments, onSelectDate, onPrevious, onNext }: { selectedDate: string; appointments: StoredAppointment[]; onSelectDate: (date: string) => void; onPrevious: () => void; onNext: () => void; }) {
  const { year, month, daysInMonth, firstWeekDay, title } = getMonthData(selectedDate);
  const today = formatDateForInput(new Date());
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <h3 className="text-base font-extrabold text-[#10235f]">Calendário</h3>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onPrevious} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e1e4ef] text-[#7180a3] hover:bg-[#faf9ff] hover:text-[#6543ef]"><ChevronLeft size={17} /></button>
        <p className="text-sm font-extrabold capitalize text-[#263765]">{title.charAt(0).toUpperCase() + title.slice(1)}</p>
        <button type="button" onClick={onNext} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e1e4ef] text-[#7180a3] hover:bg-[#faf9ff] hover:text-[#6543ef]"><ChevronRight size={17} /></button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-y-2 text-center">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <div key={day} className="pb-1 text-[9px] font-bold uppercase text-[#9ca5bb]">{day}</div>)}
        {Array.from({ length: firstWeekDay }).map((_, index) => <div key={`empty-${index}`} className="h-9" />)}
        {days.map((day) => {
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const selected = date === selectedDate;
          const isToday = date === today;
          const dayItems = appointments.filter((item) => item.date === date);
          return (
            <button key={date} type="button" onClick={() => onSelectDate(date)} className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${selected ? "bg-[#6847f5] text-white shadow-[0_6px_16px_rgba(104,71,245,0.28)]" : isToday ? "bg-[#f0ecff] text-[#6847f5]" : "text-[#526080] hover:bg-[#f7f5ff] hover:text-[#6847f5]"}`}>
              {day}
              {!selected && dayItems.length > 0 && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#6847f5]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#f0f1f6] pt-4">
        {[["bg-[#6847f5]", "Psicologia"], ["bg-[#3b91ed]", "Fonoaudiologia"], ["bg-[#2eb487]", "T. Ocupacional"], ["bg-[#ec9731]", "Fisioterapia"]].map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-[9px] font-semibold text-[#8690aa]"><i className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}</span>
        ))}
      </div>
    </section>
  );
}

function DaySummary({ confirmed, scheduled, realized, cancelled, blocks }: { confirmed: number; scheduled: number; realized: number; cancelled: number; blocks: number; }) {
  const items = [
    { label: "Confirmados", value: confirmed, style: "bg-[#eaf4ff] text-[#3988e8]", icon: CheckCircle2 },
    { label: "Agendados", value: scheduled, style: "bg-[#eafbf5] text-[#2daf82]", icon: CalendarDays },
    { label: "Realizados", value: realized, style: "bg-[#eeeaff] text-[#6847f5]", icon: CheckCircle2 },
    { label: "Cancelados", value: cancelled, style: "bg-[#fff0f3] text-[#eb5771]", icon: XCircle },
    { label: "Bloqueios", value: blocks, style: "bg-[#eef0f5] text-[#69748f]", icon: Lock },
  ];

  return (
    <section className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <h3 className="text-base font-extrabold text-[#10235f]">Resumo do dia</h3>
      <div className="mt-4 divide-y divide-[#f0f1f6]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.style}`}><Icon size={15} /></span><span className="text-xs font-semibold text-[#526080]">{item.label}</span></div>
              <strong className="text-sm text-[#263765]">{item.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface WeekViewProps { appointments: StoredAppointment[]; selectedDate: string; }

function WeekView({ appointments, selectedDate }: WeekViewProps) {
  const days = getWeekDays(selectedDate);
  return (
    <PageCard title="Agenda Semanal" description={`Semana de ${formatLongDate(days[0].date)}`}>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-7">
        {days.map((day) => {
          const dayItems = appointments.filter((item) => item.date === day.date);
          return (
            <div key={day.date} className="rounded-2xl border border-[#e8eaf3] bg-[#fbfbfe] p-3">
              <div className="mb-3 border-b border-[#eceef5] pb-3"><p className="font-extrabold capitalize text-[#263765]">{day.label}</p><p className="mt-1 text-[10px] font-medium text-[#98a1b8]">{dayItems.length} atendimento(s)</p></div>
              <div className="space-y-2">
                {dayItems.map((item) => {
                  const style = getSpecialtyStyle(item.specialty);
                  return (
                    <div key={item.id} className={`rounded-xl border p-3 ${style.card}`}>
                      <p className={`text-xs font-extrabold ${style.text}`}>{item.time}</p>
                      <p className="mt-1 truncate text-xs font-bold text-[#263765]">{item.patient}</p>
                      <p className="mt-1 truncate text-[9px] font-medium text-[#8892ab]">{item.professional}</p>
                      <div className="mt-2"><StatusBadge status={item.status} /></div>
                    </div>
                  );
                })}
                {dayItems.length === 0 && <p className="py-6 text-center text-[10px] font-medium text-[#a3aabd]">Sem atendimentos</p>}
              </div>
            </div>
          );
        })}
      </div>
    </PageCard>
  );
}

interface MonthViewProps { appointments: StoredAppointment[]; selectedDate: string; }

function MonthView({ appointments, selectedDate }: MonthViewProps) {
  const { year, month, daysInMonth, firstWeekDay, title } = getMonthData(selectedDate);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const today = formatDateForInput(new Date());

  return (
    <PageCard title={title.charAt(0).toUpperCase() + title.slice(1)} description="Visão mensal dos atendimentos.">
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#9aa3ba]">{day}</div>)}
            {Array.from({ length: firstWeekDay }).map((_, index) => <div key={`empty-${index}`} className="min-h-28 rounded-xl bg-[#fafafd]" />)}
            {days.map((day) => {
              const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayItems = appointments.filter((item) => item.date === date);
              const selected = date === selectedDate;
              const isToday = date === today;
              return (
                <div key={day} className={`min-h-28 rounded-xl border p-2.5 transition ${selected ? "border-[#bdb0ff] bg-[#faf8ff] shadow-[0_5px_14px_rgba(104,71,245,0.08)]" : isToday ? "border-[#d9d2ff] bg-[#fdfcff]" : "border-[#e8eaf3] bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${selected ? "bg-[#6847f5] text-white" : isToday ? "bg-[#eeeaff] text-[#6847f5]" : "text-[#526080]"}`}>{day}</span>
                    {dayItems.length > 0 && <span className="rounded-full bg-[#eeeaff] px-2 py-0.5 text-[9px] font-extrabold text-[#6847f5]">{dayItems.length}</span>}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {dayItems.slice(0, 2).map((item) => {
                      const style = getSpecialtyStyle(item.specialty);
                      return <div key={item.id} className={`truncate rounded-md px-2 py-1.5 text-[9px] font-semibold ${style.chip}`}>{item.time} {item.patient}</div>;
                    })}
                    {dayItems.length > 2 && <p className="text-[9px] font-semibold text-[#9ba3b8]">+{dayItems.length - 2} mais</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageCard>
  );
}

interface MetricCardProps { title: string; value: string; description: string; icon: typeof CalendarDays; iconStyle: string; valueStyle: string; }
function MetricCard({ title, value, description, icon: Icon, iconStyle, valueStyle }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e9ebf4] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-semibold text-[#68769b]">{title}</p><p className={`mt-3 text-[27px] font-extrabold tracking-[-0.03em] ${valueStyle}`}>{value}</p><p className="mt-1.5 text-[10px] font-medium text-[#98a1ba]">{description}</p></div><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}><Icon size={20} /></span></div>
    </div>
  );
}

interface ViewButtonProps { active: boolean; children: React.ReactNode; onClick: () => void; icon: typeof CalendarDays; }
function ViewButton({ active, children, onClick, icon: Icon }: ViewButtonProps) {
  return <button type="button" onClick={onClick} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${active ? "bg-gradient-to-r from-[#5d3df5] to-[#773cf5] text-white shadow-[0_7px_18px_rgba(103,66,246,0.20)]" : "border border-[#e0e3ef] bg-white text-[#58678e] hover:border-[#d3ccff] hover:bg-[#faf9ff] hover:text-[#6543ef]"}`}><Icon size={16} />{children}</button>;
}

function EmptyState() {
  return <div className="m-5 rounded-xl border border-dashed border-[#dddfea] bg-[#fbfbfd] p-10 text-center"><Filter size={30} className="mx-auto text-[#c1c6d4]" /><p className="mt-4 font-extrabold text-[#526080]">Nenhum atendimento encontrado</p><p className="mt-1 text-sm text-[#929bb3]">Altere a data ou os filtros.</p></div>;
}

interface StatusBadgeProps { status: StoredAppointment["status"]; }
function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<StoredAppointment["status"], string> = {
    Confirmado: "bg-[#e8f2ff] text-[#3984dc]",
    Agendado: "bg-[#e9faf4] text-[#2aa67c]",
    Realizado: "bg-[#eeeaff] text-[#6847f5]",
    Cancelado: "bg-[#fff0f3] text-[#e64f69]",
    Faltou: "bg-[#fff3e6] text-[#e38c28]",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${styles[status]}`}>{status}</span>;
}

function getSpecialtyStyle(specialty: string) {
  if (specialty === "Psicologia") return { card: "border-[#ded7ff] bg-[#fbf9ff]", line: "bg-[#6847f5]", icon: "bg-[#eeeaff] text-[#6847f5]", text: "text-[#6847f5]", chip: "bg-[#eeeaff] text-[#6847f5]" };
  if (specialty === "Fonoaudiologia") return { card: "border-[#d7e9ff] bg-[#f8fbff]", line: "bg-[#3b91ed]", icon: "bg-[#e9f4ff] text-[#3b91ed]", text: "text-[#3482d3]", chip: "bg-[#e9f4ff] text-[#3482d3]" };
  if (specialty === "Terapia Ocupacional") return { card: "border-[#d3eee5] bg-[#f7fcfa]", line: "bg-[#2eb487]", icon: "bg-[#e8f8f2] text-[#2aa67c]", text: "text-[#2aa67c]", chip: "bg-[#e8f8f2] text-[#2aa67c]" };
  if (specialty === "Fisioterapia") return { card: "border-[#f3dfc4] bg-[#fffaf4]", line: "bg-[#ec9731]", icon: "bg-[#fff1df] text-[#e38c28]", text: "text-[#de8926]", chip: "bg-[#fff1df] text-[#de8926]" };
  return { card: "border-[#e2e5ee] bg-[#fafbfc]", line: "bg-[#7a849d]", icon: "bg-[#eef0f5] text-[#6d7894]", text: "text-[#66718c]", chip: "bg-[#eef0f5] text-[#66718c]" };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}