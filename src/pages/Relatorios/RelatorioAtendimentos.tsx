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
  useSearchParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

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

import {
  AppointmentReportDocument,
  APPOINTMENT_REPORT_DOCUMENT_STYLES,
} from "@/components/relatorios/AppointmentReportDocument";

function getProfessionalOptions(appointments: StoredAppointment[]) {
  return [
    "Todos",
    ...Array.from(
      new Set(
        appointments.map(
          (appointment) =>
            appointment.professional
        )
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR")),
  ];
}

function getSpecialtyOptions(appointments: StoredAppointment[]) {
  return [
    "Todas",
    ...Array.from(
      new Set(
        appointments.map(
          (appointment) =>
            appointment.specialty
        )
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR")),
  ];
}


const REPORT_PRINT_STYLES = `
  .report-print-footer {
    display: none;
  }

  @media print {
    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    html,
    body {
      background: #ffffff !important;
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
    }

    body * {
      visibility: hidden !important;
    }

    .report-print-area,
    .report-print-area * {
      visibility: visible !important;
    }

    .report-print-area {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      overflow: visible !important;
    }

    .report-print-area .print\\:hidden,
    .report-print-area button,
    .report-print-area [data-print-hide="true"] {
      display: none !important;
    }

    .report-print-area table {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
      font-size: 8pt !important;
    }

    .report-print-area thead {
      display: table-header-group !important;
    }

    .report-print-area tr,
    .report-print-area td,
    .report-print-area th {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .report-print-area section,
    .report-print-area article,
    .report-print-area .rounded-2xl {
      break-inside: avoid;
      page-break-inside: avoid;
      box-shadow: none !important;
    }

    .report-print-area .overflow-x-auto,
    .report-print-area .overflow-hidden {
      overflow: visible !important;
    }

    .report-print-area [class*="min-w-"] {
      min-width: 0 !important;
    }

    .report-print-area [class*="max-w-"] {
      max-width: none !important;
    }

    .report-print-area {
      font-size: 9pt !important;
    }

    .report-print-area h1 {
      font-size: 20pt !important;
      line-height: 1.15 !important;
      margin-bottom: 4px !important;
    }

    .report-print-area h2 {
      font-size: 14pt !important;
    }

    .report-print-area h3 {
      font-size: 11pt !important;
    }

    .report-print-footer {
      display: flex !important;
      justify-content: space-between;
      gap: 16px;
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #dbe2ef;
      font-size: 7.5pt;
      color: #64748b;
    }

    .report-print-footer strong {
      color: #10235f;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

export default function RelatorioAtendimentos() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [
    searchParams,
  ] =
    useSearchParams();

  const initialStartDate =
    searchParams.get(
      "startDate"
    ) ??
    "2026-08-01";

  const initialEndDate =
    searchParams.get(
      "endDate"
    ) ??
    "2026-08-31";

  const initialProfessional =
    searchParams.get(
      "professional"
    ) ??
    "Todos";

  const initialPatient =
    searchParams.get(
      "patient"
    ) ??
    "Todos";

  const appointments =
    useMemo(
      () =>
        getSavedAppointments().filter(
          (
            appointment
          ) =>
            appointment.unitId ===
            activeUnitId
        ),
      [
        activeUnitId,
      ]
    );

  const professionals =
    useMemo(
      () =>
        getProfessionalOptions(
          appointments
        ),
      [appointments]
    );

  const specialties =
    useMemo(
      () =>
        getSpecialtyOptions(
          appointments
        ),
      [appointments]
    );

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      initialStartDate
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      initialEndDate
    );

  const [
    professional,
    setProfessional,
  ] =
    useState(
      initialProfessional
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

            const matchesPatient =
              initialPatient ===
                "Todos" ||
              appointment.patient ===
                initialPatient;

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
              matchesPatient &&
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
      initialPatient,
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
      <style>
        {
          `${REPORT_PRINT_STYLES}
${APPOINTMENT_REPORT_DOCUMENT_STYLES}`
        }
      </style>
      <div className="space-y-6 print:space-y-4">
        <AppointmentReportDocument
          startDate={
            startDate
          }
          endDate={
            endDate
          }
          professionalFilter={
            professional
          }
          specialtyFilter={
            specialty
          }
          statusFilter={
            status
          }
          appointments={
            filteredAppointments
          }
          total={
            total
          }
          scheduled={
            scheduled
          }
          confirmed={
            confirmed
          }
          realized={
            realized
          }
          absent={
            absent
          }
          cancelled={
            cancelled
          }
          attendanceRate={
            attendanceRate
          }
        />

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

        <div className="hidden print:block">
          <p className="text-xs text-slate-500">
            Período: {formatDate(startDate)} a {formatDate(endDate)} • Profissional: {professional} • Especialidade: {specialty} • Status: {status}
          </p>
        </div>

        <div className="print:hidden">
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
        </div>

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
        <div className="report-print-footer">
          <span>
            <strong>Clínica Integrada Entre Afetos</strong> • Relatório de Atendimentos
          </span>

          <span>
            AC Software • Documento gerado pelo sistema
          </span>
        </div>
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