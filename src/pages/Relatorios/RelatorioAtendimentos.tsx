import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Printer,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

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
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

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

export default function RelatorioAtendimentos() {
  const appointments =
    useMemo(
      () => [
        ...defaultAppointments,
        ...getSavedAppointments(),
      ],
      []
    );

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      "2026-08-01"
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      "2026-08-31"
    );

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

  const filteredAppointments =
    useMemo(() => {
      return appointments
        .filter(
          (
            appointment
          ) => {
            const matchesStart =
              !startDate ||
              appointment.date >=
                startDate;

            const matchesEnd =
              !endDate ||
              appointment.date <=
                endDate;

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
              matchesStart &&
              matchesEnd &&
              matchesProfessional &&
              matchesSpecialty &&
              matchesStatus
            );
          }
        )
        .sort(
          (
            a,
            b
          ) => {
            const first =
              `${a.date} ${a.time}`;

            const second =
              `${b.date} ${b.time}`;

            return first.localeCompare(
              second
            );
          }
        );
    }, [
      appointments,
      startDate,
      endDate,
      professional,
      specialty,
      status,
    ]);

  const total =
    filteredAppointments.length;

  const scheduled =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Agendado"
    ).length;

  const confirmed =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Confirmado"
    ).length;

  const realized =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Realizado"
    ).length;

  const absent =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Faltou"
    ).length;

  const cancelled =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Cancelado"
    ).length;

  const attendanceRate =
    total > 0
      ? Math.round(
          (
            realized /
            total
          ) *
            100
        )
      : 0;

  function handleClearFilters() {
    setStartDate(
      "2026-08-01"
    );

    setEndDate(
      "2026-08-31"
    );

    setProfessional(
      "Todos"
    );

    setSpecialty(
      "Todas"
    );

    setStatus(
      "Todos"
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Relatório de Atendimentos
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Consulte a produção clínica por período, profissional e especialidade.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={
                handleClearFilters
              }
            >
              <Filter
                size={17}
              />

              Limpar filtros
            </Button>

            <Button
              type="button"
              onClick={
                handlePrint
              }
            >
              <Printer
                size={17}
              />

              Imprimir relatório
            </Button>
          </div>
        </div>

        <PageCard
          title="Filtros"
          description="Defina os critérios do relatório."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <FormField label="Data inicial">
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
            </FormField>

            <FormField label="Data final">
              <Input
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField label="Profissional">
              <Select
                value={
                  professional
                }
                onChange={(
                  event
                ) =>
                  setProfessional(
                    event.target.value
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
            </FormField>

            <FormField label="Especialidade">
              <Select
                value={
                  specialty
                }
                onChange={(
                  event
                ) =>
                  setSpecialty(
                    event.target.value
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
            </FormField>

            <FormField label="Status">
              <Select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos os status
                </option>

                <option value="Agendado">
                  Agendados
                </option>

                <option value="Confirmado">
                  Confirmados
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
            </FormField>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            title="Atendimentos"
            value={
              String(
                total
              )
            }
            icon={
              <CalendarDays
                size={21}
              />
            }
          />

          <MetricCard
            title="Agendados"
            value={
              String(
                scheduled
              )
            }
            icon={
              <Clock3
                size={21}
              />
            }
          />

          <MetricCard
            title="Confirmados"
            value={
              String(
                confirmed
              )
            }
            icon={
              <UserCheck
                size={21}
              />
            }
          />

          <MetricCard
            title="Realizados"
            value={
              String(
                realized
              )
            }
            icon={
              <CheckCircle2
                size={21}
              />
            }
          />

          <MetricCard
            title="Faltas"
            value={
              String(
                absent
              )
            }
            icon={
              <UserX
                size={21}
              />
            }
          />

          <MetricCard
            title="Cancelados"
            value={
              String(
                cancelled
              )
            }
            icon={
              <XCircle
                size={21}
              />
            }
          />
        </div>

        <PageCard
          title="Indicadores"
          description="Resumo da produção do período."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              label="Taxa de realização"
              value={`${attendanceRate}%`}
              description="Realizados sobre o total filtrado"
            />

            <SummaryCard
              label="Não realizados"
              value={String(
                absent +
                  cancelled
              )}
              description="Faltas e cancelamentos"
            />

            <SummaryCard
              label="Em aberto"
              value={String(
                scheduled +
                  confirmed
              )}
              description="Agendados e confirmados"
            />
          </div>
        </PageCard>

        <PageCard
          title="Detalhamento dos Atendimentos"
          description={`${filteredAppointments.length} registro(s) encontrado(s).`}
        >
          {filteredAppointments.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <TableHeader>
                      Data
                    </TableHeader>

                    <TableHeader>
                      Horário
                    </TableHeader>

                    <TableHeader>
                      Paciente
                    </TableHeader>

                    <TableHeader>
                      Profissional
                    </TableHeader>

                    <TableHeader>
                      Especialidade
                    </TableHeader>

                    <TableHeader>
                      Sala
                    </TableHeader>

                    <TableHeader>
                      Tipo
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map(
                    (
                      appointment
                    ) => (
                      <tr
                        key={
                          appointment.id
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell>
                          {
                            formatDate(
                              appointment.date
                            )
                          }
                        </TableCell>

                        <TableCell>
                          {
                            appointment.time
                          }{" "}
                          às{" "}
                          {
                            appointment.endTime
                          }
                        </TableCell>

                        <TableCell>
                          <p className="font-semibold text-slate-800">
                            {
                              appointment.patient
                            }
                          </p>
                        </TableCell>

                        <TableCell>
                          {
                            appointment.professional
                          }
                        </TableCell>

                        <TableCell>
                          {
                            appointment.specialty
                          }
                        </TableCell>

                        <TableCell>
                          {
                            appointment.room
                          }
                        </TableCell>

                        <TableCell>
                          {
                            appointment.type
                          }
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />
                        </TableCell>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <FileText
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Nenhum atendimento encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Altere os filtros para visualizar outros registros.
              </p>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title:
    string;

  value:
    string;

  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label:
    string;

  value:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    StoredAppointment["status"];
}) {
  const styles: Record<
    StoredAppointment["status"],
    string
  > = {
    Agendado:
      "bg-amber-100 text-amber-700",

    Confirmado:
      "bg-blue-100 text-blue-700",

    Realizado:
      "bg-emerald-100 text-emerald-700",

    Faltou:
      "bg-orange-100 text-orange-700",

    Cancelado:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}

function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  return `${day}/${month}/${year}`;
}