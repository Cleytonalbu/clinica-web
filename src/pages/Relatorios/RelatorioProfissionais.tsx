import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Filter,
  Printer,
  Search,
  Stethoscope,
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
  syncProfessionalPayoutsFromAppointments,
} from "@/pages/Financeiro/professionalPayoutStorage";

import {
  ProfessionalReportDocument,
  PROFESSIONAL_REPORT_DOCUMENT_STYLES,
} from "@/components/relatorios/ProfessionalReportDocument";

interface ProfessionalReport {
  professional: string;

  specialty: string;

  appointments: number;

  realized: number;

  absent: number;

  cancelled: number;

  scheduled: number;

  patients: number[];

  billed: number;

  received: number;

  pending: number;

  payoutTotal: number;

  payoutPaid: number;

  payoutPending: number;
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

export default function RelatorioProfissionais() {
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

  const payouts =
    useMemo(
      () =>
        syncProfessionalPayoutsFromAppointments().filter(
          (payout) =>
            payout.unitId ===
            activeUnitId
        ),
      [activeUnitId]
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
      initialProfessional === "Todos"
        ? ""
        : initialProfessional
    );

  const [
    specialty,
    setSpecialty,
  ] =
    useState(
      "Todas"
    );

  const report =
    useMemo(() => {
      const map =
        new Map<
          string,
          ProfessionalReport
        >();

      appointments
        .filter(
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
        )
        .forEach(
          (
            appointment
          ) => {
            if (
              !map.has(
                appointment.professional
              )
            ) {
              map.set(
                appointment.professional,
                {
                  professional:
                    appointment.professional,

                  specialty:
                    appointment.specialty,

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

                  patients:
                    [],

                  billed:
                    0,

                  received:
                    0,

                  pending:
                    0,

                  payoutTotal:
                    0,

                  payoutPaid:
                    0,

                  payoutPending:
                    0,
                }
              );
            }

            const item =
              map.get(
                appointment.professional
              )!;

            item.appointments +=
              1;

            if (
              appointment.status ===
              "Realizado"
            ) {
              item.realized +=
                1;
            }

            if (
              appointment.status ===
              "Faltou"
            ) {
              item.absent +=
                1;
            }

            if (
              appointment.status ===
              "Cancelado"
            ) {
              item.cancelled +=
                1;
            }

            if (
              appointment.status ===
                "Agendado" ||
              appointment.status ===
                "Confirmado"
            ) {
              item.scheduled +=
                1;
            }

            if (
              !item.patients.includes(
                appointment.patientId
              )
            ) {
              item.patients.push(
                appointment.patientId
              );
            }
          }
        );

      charges.forEach(
        (
          charge
        ) => {
          const item =
            map.get(
              charge.professional
            );

          if (!item) {
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
            item.billed +=
              charge.amount;
          }

          if (
            charge.status ===
            "Pago"
          ) {
            item.received +=
              charge.receivedAmount ??
              charge.amount;
          }

          if (
            charge.status ===
            "Pendente"
          ) {
            item.pending +=
              charge.amount;
          }
        }
      );

      payouts.forEach(
        (payout) => {
          const item =
            map.get(
              payout.professional
            );

          if (!item) return;

          if (
            (startDate && payout.serviceDate < startDate) ||
            (endDate && payout.serviceDate > endDate)
          ) {
            return;
          }

          item.payoutTotal += payout.amount;

          if (payout.status === "Pago") {
            item.payoutPaid += payout.amount;
          } else {
            item.payoutPending += payout.amount;
          }
        }
      );

      return Array.from(
        map.values()
      );
    }, [
      appointments,
      charges,
      payouts,
      startDate,
      endDate,
    ]);

  const specialties =
    useMemo(
      () => [
        "Todas",
        ...Array.from(
          new Set(
            report.map(
              (
                item
              ) =>
                item.specialty
            )
          )
        ),
      ],
      [
        report,
      ]
    );

  const filteredReport =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return report
        .filter(
          (
            item
          ) => {
            const matchesSearch =
              !term ||
              item.professional
                .toLowerCase()
                .includes(
                  term
                ) ||
              item.specialty
                .toLowerCase()
                .includes(
                  term
                );

            const matchesSpecialty =
              specialty ===
                "Todas" ||
              item.specialty ===
                specialty;

            return (
              matchesSearch &&
              matchesSpecialty
            );
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            b.realized -
              a.realized ||
            a.professional.localeCompare(
              b.professional
            )
        );
    }, [
      report,
      search,
      specialty,
    ]);

  const totalPayoutPaid =
    filteredReport.reduce(
      (total, item) =>
        total + item.payoutPaid,
      0
    );

  const totalPayoutPending =
    filteredReport.reduce(
      (total, item) =>
        total + item.payoutPending,
      0
    );

  const totalProfessionals =
    filteredReport.length;

  const totalAppointments =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.appointments,
      0
    );

  const totalRealized =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.realized,
      0
    );

  const totalAbsences =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.absent,
      0
    );

  const totalPatients =
    new Set(
      filteredReport.flatMap(
        (
          item
        ) =>
          item.patients
      )
    ).size;

  const totalBilled =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.billed,
      0
    );

  const totalReceived =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.received,
      0
    );

  const totalPending =
    filteredReport.reduce(
      (
        total,
        item
      ) =>
        total +
        item.pending,
      0
    );

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

    setSpecialty(
      "Todas"
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
${PROFESSIONAL_REPORT_DOCUMENT_STYLES}`
        }
      </style>
      <div className="space-y-6 print:space-y-4">
        <ProfessionalReportDocument
          startDate={
            startDate
          }
          endDate={
            endDate
          }
          professionalFilter={
            search ||
            "Todos"
          }
          specialtyFilter={
            specialty
          }
          report={
            filteredReport
          }
          totalProfessionals={
            totalProfessionals
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
          totalPatients={
            totalPatients
          }
          totalBilled={
            totalBilled
          }
          totalReceived={
            totalReceived
          }
          totalPending={
            totalPending
          }
          totalPayoutPaid={
            totalPayoutPaid
          }
          totalPayoutPending={
            totalPayoutPending
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Relatório de Profissionais
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Analise produção clínica, pacientes atendidos e faturamento por profissional.
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
            Período: {formatReportDate(startDate)} a {formatReportDate(endDate)} • Profissional: {search || "Todos"} • Especialidade: {specialty}
          </p>
        </div>

        <div className="print:hidden">
        <PageCard
          title="Filtros"
          description="Defina o período, profissional ou especialidade."
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
              label="Especialidade"
            >
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
                      {
                        item ===
                        "Todas"
                          ? "Todas as especialidades"
                          : item
                      }
                    </option>
                  )
                )}
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
                  placeholder="Profissional ou especialidade..."
                  className="pl-11"
                />
              </div>
            </FormField>
          </div>
        </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            title="Profissionais"
            value={
              String(
                totalProfessionals
              )
            }
            description="Com produção"
            icon={
              <Stethoscope
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
            description="Concluídos"
            icon={
              <CheckCircle2
                size={21}
              />
            }
          />

          <MetricCard
            title="Pacientes"
            value={
              String(
                totalPatients
              )
            }
            description="Pacientes únicos"
            icon={
              <UserRound
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
            description="Ausências"
            icon={
              <UserX
                size={21}
              />
            }
          />

          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                totalBilled
              )
            }
            description="Produção financeira"
            icon={
              <CircleDollarSign
                size={21}
              />
            }
          />
        </div>

        <PageCard
          title="Indicadores Gerais"
          description="Resumo da produção da equipe."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
              description="Realizados sobre o total"
            />

            <SummaryCard
              title="Repasses pagos"
              value={
                formatCurrency(
                  totalPayoutPaid
                )
              }
              description="Valores pagos aos profissionais"
            />

            <SummaryCard
              title="Repasses pendentes"
              value={
                formatCurrency(
                  totalPayoutPending
                )
              }
              description="Valores ainda a repassar"
            />

            <SummaryCard
              title="Média por profissional"
              value={
                totalProfessionals >
                0
                  ? (
                      totalRealized /
                      totalProfessionals
                    ).toFixed(
                      1
                    )
                  : "0"
              }
              description="Atendimentos realizados"
            />
          </div>
        </PageCard>

        <PageCard
          title="Produção por Profissional"
          description={`${filteredReport.length} profissional(is) encontrado(s).`}
        >
          {filteredReport.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1580px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <TableHeader>
                      Profissional
                    </TableHeader>

                    <TableHeader>
                      Especialidade
                    </TableHeader>

                    <TableHeader>
                      Atendimentos
                    </TableHeader>

                    <TableHeader>
                      Realizados
                    </TableHeader>

                    <TableHeader>
                      Em aberto
                    </TableHeader>

                    <TableHeader>
                      Faltas
                    </TableHeader>

                    <TableHeader>
                      Cancelados
                    </TableHeader>

                    <TableHeader>
                      Pacientes
                    </TableHeader>

                    <TableHeader>
                      Faturado
                    </TableHeader>

                    <TableHeader>
                      Recebido
                    </TableHeader>

                    <TableHeader>
                      Pendente
                    </TableHeader>

                    <TableHeader>
                      Repasse
                    </TableHeader>

                    <TableHeader>
                      Ações
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredReport.map(
                    (
                      item
                    ) => {
                      const performance =
                        item.appointments >
                        0
                          ? Math.round(
                              (
                                item.realized /
                                item.appointments
                              ) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            item.professional
                          }
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {
                                  item.professional
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  performance
                                }
                                % de realização
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                              {
                                item.specialty
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <CountBadge
                              value={
                                item.appointments
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <span className="font-bold text-emerald-600">
                              {
                                item.realized
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            {
                              item.scheduled
                            }
                          </TableCell>

                          <TableCell>
                            <span
                              className={
                                item.absent >
                                0
                                  ? "font-bold text-orange-600"
                                  : "text-slate-500"
                              }
                            >
                              {
                                item.absent
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={
                                item.cancelled >
                                0
                                  ? "font-bold text-red-600"
                                  : "text-slate-500"
                              }
                            >
                              {
                                item.cancelled
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            {
                              item.patients.length
                            }
                          </TableCell>

                          <TableCell>
                            <strong className="text-slate-800">
                              {
                                formatCurrency(
                                  item.billed
                                )
                              }
                            </strong>
                          </TableCell>

                          <TableCell>
                            <strong className="text-emerald-600">
                              {
                                formatCurrency(
                                  item.received
                                )
                              }
                            </strong>
                          </TableCell>

                          <TableCell>
                            <strong
                              className={
                                item.pending >
                                0
                                  ? "text-amber-600"
                                  : "text-slate-400"
                              }
                            >
                              {
                                formatCurrency(
                                  item.pending
                                )
                              }
                            </strong>
                          </TableCell>

                          <TableCell>
                            <div className="print:hidden">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const professionalId =
                                    getProfessionalId(
                                      item.professional
                                    );

                                  if (
                                    professionalId
                                  ) {
                                    navigate(
                                      `/profissionais/${professionalId}`
                                    );
                                  }
                                }}
                              >
                                Ver perfil
                              </Button>
                            </div>
                          </TableCell>
                        </tr>
                      );
                    }
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
                Nenhum profissional encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Altere o período ou os filtros.
              </p>
            </div>
          )}
        </PageCard>
        <div className="report-print-footer">
          <span>
            <strong>Clínica Integrada Entre Afetos</strong> • Relatório de Profissionais
          </span>

          <span>
            AC Software • Documento gerado pelo sistema
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}

function getProfessionalId(
  name: string
) {
  const professionals: Record<
    string,
    number
  > = {
    "Dra. Ana Paula": 1,
    "Dra. Camila Soares": 2,
    "Dra. Larissa Lima": 3,
    "Dr. Rafael Costa": 4,
  };

  return (
    professionals[
      name
    ] ??
    null
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