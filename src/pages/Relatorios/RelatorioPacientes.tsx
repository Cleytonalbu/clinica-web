import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Filter,
  Printer,
  Search,
  UserRound,
  UserX,
} from "lucide-react";

import {
  useNavigate,
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
  getFinancialCharges,
} from "@/pages/Financeiro/financeStorage";

import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

import {
  getObjectives,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getEvolutions,
} from "@/pages/Pacientes/evolutionStorage";

import {
  PatientReportDocument,
  PATIENT_REPORT_DOCUMENT_STYLES,
} from "@/components/relatorios/PatientReportDocument";

interface PatientReport {
  patientId: number;

  patient: string;

  appointments: number;

  realized: number;

  absent: number;

  cancelled: number;

  scheduled: number;

  professionals: string[];

  specialties: string[];

  billed: number;

  paid: number;

  pending: number;

  objectives: number;

  achievedObjectives: number;

  evolutions: number;
}

function formatReportDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
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

export default function RelatorioPacientes() {
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

  const initialPatient =
    searchParams.get(
      "patient"
    ) ??
    "";

  const navigate =
    useNavigate();

  const appointments =
    useMemo(
      () =>
        getSavedAppointments().filter(
          (appointment) =>
            appointment.unitId ===
            activeUnitId
        ),
      [activeUnitId]
    );

  const charges =
    useMemo(
      () =>
        getFinancialCharges().filter(
          (charge) =>
            charge.unitId ===
            activeUnitId
        ),
      [activeUnitId]
    );

  const objectives =
    useMemo(
      () =>
        getObjectives(),
      []
    );

  const evolutions =
    useMemo(
      () =>
        getEvolutions(),
      []
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
    search,
    setSearch,
  ] =
    useState(
      initialPatient === "Todos"
        ? ""
        : initialPatient
    );

  const [
    situation,
    setSituation,
  ] =
    useState(
      "Todos"
    );

  const patientReports =
    useMemo(() => {
      const periodAppointments =
        appointments.filter(
          (
            appointment
          ) =>
            (
              !startDate ||
              appointment.date >=
                startDate
            ) &&
            (
              !endDate ||
              appointment.date <=
                endDate
            )
        );

      const patientMap =
        new Map<
          number,
          PatientReport
        >();

      periodAppointments.forEach(
        (
          appointment
        ) => {
          const existing =
            patientMap.get(
              appointment.patientId
            );

          if (!existing) {
            patientMap.set(
              appointment.patientId,
              {
                patientId:
                  appointment.patientId,

                patient:
                  appointment.patient,

                appointments:
                  0,

                realized:
                  0,

                absent:
                  0,

                cancelled:
                  0,

                scheduled:
                  0,

                professionals:
                  [],

                specialties:
                  [],

                billed:
                  0,

                paid:
                  0,

                pending:
                  0,

                objectives:
                  0,

                achievedObjectives:
                  0,

                evolutions:
                  0,
              }
            );
          }

          const patient =
            patientMap.get(
              appointment.patientId
            )!;

          patient.appointments +=
            1;

          if (
            appointment.status ===
            "Realizado"
          ) {
            patient.realized +=
              1;
          }

          if (
            appointment.status ===
            "Faltou"
          ) {
            patient.absent +=
              1;
          }

          if (
            appointment.status ===
            "Cancelado"
          ) {
            patient.cancelled +=
              1;
          }

          if (
            appointment.status ===
              "Agendado" ||
            appointment.status ===
              "Confirmado"
          ) {
            patient.scheduled +=
              1;
          }

          if (
            !patient.professionals.includes(
              appointment.professional
            )
          ) {
            patient.professionals.push(
              appointment.professional
            );
          }

          if (
            !patient.specialties.includes(
              appointment.specialty
            )
          ) {
            patient.specialties.push(
              appointment.specialty
            );
          }
        }
      );

      charges.forEach(
        (
          charge
        ) => {
          const patient =
            patientMap.get(
              charge.patientId
            );

          if (!patient) {
            return;
          }

          const referenceDate =
            charge.paymentDate ??
            charge.date;

          if (
            (
              startDate &&
              referenceDate <
                startDate
            ) ||
            (
              endDate &&
              referenceDate >
                endDate
            )
          ) {
            return;
          }

          if (
            charge.status !==
            "Cancelado"
          ) {
            patient.billed +=
              charge.amount;
          }

          if (
            charge.status ===
            "Pago"
          ) {
            patient.paid +=
              charge.receivedAmount ??
              charge.amount;
          }

          if (
            charge.status ===
            "Pendente"
          ) {
            patient.pending +=
              charge.amount;
          }
        }
      );

      objectives.forEach(
        (objective) => {
          const patient =
            patientMap.get(
              objective.patientId
            );

          if (!patient) return;

          if (
            (startDate && objective.startDate < startDate) ||
            (endDate && objective.startDate > endDate)
          ) {
            return;
          }

          patient.objectives += 1;

          if (objective.status === "Atingido") {
            patient.achievedObjectives += 1;
          }
        }
      );

      evolutions.forEach(
        (evolution) => {
          const patient =
            patientMap.get(
              evolution.patientId
            );

          if (!patient || evolution.status !== "FINALIZADA") return;

          if (
            (startDate && evolution.sessionDate < startDate) ||
            (endDate && evolution.sessionDate > endDate)
          ) {
            return;
          }

          patient.evolutions += 1;
        }
      );

      return Array.from(
        patientMap.values()
      );
    }, [
      appointments,
      charges,
      objectives,
      evolutions,
      startDate,
      endDate,
    ]);

  const filteredPatients =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return patientReports
        .filter(
          (
            patient
          ) => {
            const matchesSearch =
              !term ||
              patient.patient
                .toLowerCase()
                .includes(
                  term
                ) ||
              patient.professionals.some(
                (
                  professional
                ) =>
                  professional
                    .toLowerCase()
                    .includes(
                      term
                    )
              ) ||
              patient.specialties.some(
                (
                  specialty
                ) =>
                  specialty
                    .toLowerCase()
                    .includes(
                      term
                    )
              );

            const matchesSituation =
              situation ===
                "Todos" ||
              (
                situation ===
                  "Com pendência" &&
                patient.pending >
                  0
              ) ||
              (
                situation ===
                  "Sem pendência" &&
                patient.pending ===
                  0
              ) ||
              (
                situation ===
                  "Com faltas" &&
                patient.absent >
                  0
              );

            return (
              matchesSearch &&
              matchesSituation
            );
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            a.patient.localeCompare(
              b.patient
            )
        );
    }, [
      patientReports,
      search,
      situation,
    ]);

  const totalPatients =
    filteredPatients.length;

  const totalAppointments =
    filteredPatients.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.appointments,
      0
    );

  const totalRealized =
    filteredPatients.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.realized,
      0
    );

  const totalAbsences =
    filteredPatients.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.absent,
      0
    );

  const totalPending =
    filteredPatients.reduce(
      (
        total,
        patient
      ) =>
        total +
        patient.pending,
      0
    );

  const averageAppointments =
    totalPatients >
    0
      ? (
          totalAppointments /
          totalPatients
        ).toFixed(
          1
        )
      : "0";

  function handleClearFilters() {
    setStartDate(
      "2026-08-01"
    );

    setEndDate(
      "2026-08-31"
    );

    setSearch(
      ""
    );

    setSituation(
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
${PATIENT_REPORT_DOCUMENT_STYLES}`
        }
      </style>
      <div className="space-y-6 print:space-y-4">
        <PatientReportDocument
          startDate={
            startDate
          }
          endDate={
            endDate
          }
          searchFilter={
            search ||
            "Todos"
          }
          situationFilter={
            situation
          }
          report={
            filteredPatients
          }
          totalPatients={
            totalPatients
          }
          totalAppointments={
            totalAppointments
          }
          totalRealized={
            totalRealized
          }
          totalAbsences={
            totalAbsences
          }
          totalPending={
            totalPending
          }
          averageAppointments={
            averageAppointments
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Relatório de Pacientes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Analise atendimentos, faltas, profissionais envolvidos e situação financeira dos pacientes.
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
            Período: {formatReportDate(startDate)} a {formatReportDate(endDate)} • Pesquisa: {search || "Todos"} • Situação: {situation}
          </p>
        </div>

        <div className="print:hidden">
        <PageCard
          title="Filtros"
          description="Defina o período e os critérios de pesquisa."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Data inicial"
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
            </FormField>

            <FormField
              label="Data final"
            >
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

            <FormField
              label="Situação"
            >
              <Select
                value={
                  situation
                }
                onChange={(
                  event
                ) =>
                  setSituation(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos os pacientes
                </option>

                <option value="Com pendência">
                  Com pendência financeira
                </option>

                <option value="Sem pendência">
                  Sem pendência financeira
                </option>

                <option value="Com faltas">
                  Com faltas
                </option>
              </Select>
            </FormField>

            <FormField
              label="Pesquisar"
            >
              <div className="relative">
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
                      event.target.value
                    )
                  }
                  placeholder="Paciente, profissional ou especialidade..."
                  className="pl-11"
                />
              </div>
            </FormField>
          </div>
        </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Pacientes"
            value={
              String(
                totalPatients
              )
            }
            description="No período filtrado"
            icon={
              <UserRound
                size={21}
              />
            }
          />

          <MetricCard
            title="Atendimentos"
            value={
              String(
                totalAppointments
              )
            }
            description="Total registrado"
            icon={
              <CalendarDays
                size={21}
              />
            }
          />

          <MetricCard
            title="Realizados"
            value={
              String(
                totalRealized
              )
            }
            description="Atendimentos concluídos"
            icon={
              <CalendarDays
                size={21}
              />
            }
          />

          <MetricCard
            title="Faltas"
            value={
              String(
                totalAbsences
              )
            }
            description="Ausências registradas"
            icon={
              <UserX
                size={21}
              />
            }
          />

          <MetricCard
            title="Em aberto"
            value={
              formatCurrency(
                totalPending
              )
            }
            description="Pendências financeiras"
            icon={
              <CircleDollarSign
                size={21}
              />
            }
          />
        </div>

        <PageCard
          title="Indicadores"
          description="Visão geral dos pacientes no período."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              title="Média por paciente"
              value={
                averageAppointments
              }
              description="Atendimentos por paciente"
            />

            <SummaryCard
              title="Taxa de realização"
              value={
                totalAppointments >
                0
                  ? `${Math.round(
                      (
                        totalRealized /
                        totalAppointments
                      ) *
                        100
                    )}%`
                  : "0%"
              }
              description="Atendimentos realizados"
            />

            <SummaryCard
              title="Pacientes com pendência"
              value={
                String(
                  filteredPatients.filter(
                    (
                      patient
                    ) =>
                      patient.pending >
                      0
                  ).length
                )
              }
              description="Possuem cobrança em aberto"
            />
          </div>
        </PageCard>

        <PageCard
          title="Detalhamento por Paciente"
          description={`${filteredPatients.length} paciente(s) encontrado(s).`}
        >
          {filteredPatients.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1480px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <TableHeader>
                      Paciente
                    </TableHeader>

                    <TableHeader>
                      Atendimentos
                    </TableHeader>

                    <TableHeader>
                      Realizados
                    </TableHeader>

                    <TableHeader>
                      Faltas
                    </TableHeader>

                    <TableHeader>
                      Cancelados
                    </TableHeader>

                    <TableHeader>
                      Em aberto
                    </TableHeader>

                    <TableHeader>
                      Profissionais
                    </TableHeader>

                    <TableHeader>
                      Especialidades
                    </TableHeader>

                    <TableHeader>
                      Clínico
                    </TableHeader>

                    <TableHeader>
                      Financeiro
                    </TableHeader>

                    <TableHeader>
                      Ações
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map(
                    (
                      patient
                    ) => (
                      <tr
                        key={
                          patient.patientId
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                patient.patient
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Paciente #
                              {
                                patient.patientId
                              }
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <CountBadge
                            value={
                              patient.appointments
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-emerald-600">
                            {
                              patient.realized
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={
                              patient.absent >
                              0
                                ? "font-semibold text-orange-600"
                                : "text-slate-500"
                            }
                          >
                            {
                              patient.absent
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={
                              patient.cancelled >
                              0
                                ? "font-semibold text-red-600"
                                : "text-slate-500"
                            }
                          >
                            {
                              patient.cancelled
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          {
                            patient.scheduled
                          }
                        </TableCell>

                        <TableCell>
                          <div className="max-w-60">
                            {
                              patient.professionals.join(
                                ", "
                              )
                            }
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex max-w-72 flex-wrap gap-1">
                            {patient.specialties.map(
                              (
                                specialty
                              ) => (
                                <span
                                  key={
                                    specialty
                                  }
                                  className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                                >
                                  {
                                    specialty
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-600">
                              Objetivos: <strong>{patient.objectives}</strong>
                            </p>

                            <p className="text-emerald-600">
                              Atingidos: <strong>{patient.achievedObjectives}</strong>
                            </p>

                            <p className="text-violet-600">
                              Evoluções: <strong>{patient.evolutions}</strong>
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-500">
                              Faturado:{" "}
                              <strong className="text-slate-800">
                                {
                                  formatCurrency(
                                    patient.billed
                                  )
                                }
                              </strong>
                            </p>

                            <p className="text-emerald-600">
                              Pago:{" "}
                              <strong>
                                {
                                  formatCurrency(
                                    patient.paid
                                  )
                                }
                              </strong>
                            </p>

                            <p
                              className={
                                patient.pending >
                                0
                                  ? "text-red-600"
                                  : "text-slate-400"
                              }
                            >
                              Pendente:{" "}
                              <strong>
                                {
                                  formatCurrency(
                                    patient.pending
                                  )
                                }
                              </strong>
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2 print:hidden">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/pacientes/${patient.patientId}`
                                )
                              }
                            >
                              Prontuário
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/financeiro/paciente/${patient.patientId}`
                                )
                              }
                            >
                              Financeiro
                            </Button>
                          </div>
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
                Nenhum paciente encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Altere os filtros para visualizar outros pacientes.
              </p>
            </div>
          )}
        </PageCard>
        <div className="report-print-footer">
          <span>
            <strong>Clínica Integrada Entre Afetos</strong> • Relatório de Pacientes
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
  description,
  icon,
}: {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {
              title
            }
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
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

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title:
    string;

  value:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
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

function CountBadge({
  value,
}: {
  value:
    number;
}) {
  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
      {
        value
      }
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
      {
        children
      }
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
    <td className="px-4 py-4 align-top text-sm text-slate-600">
      {
        children
      }
    </td>
  );
}