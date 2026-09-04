import {
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CalendarDays,
  CircleDollarSign,
  Download,
  Eye,
  FileWarning,
  HeartPulse,
  ReceiptText,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  Button,
  Input,
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
  getFinancialExpenses,
} from "@/pages/Financeiro/expenseStorage";




import {
  getGuiasConvenios,
  getLotesConvenios,
  type GuiaConvenio,
  type LoteConvenio,
} from "@/pages/GuiasConvenios/guideBillingStorage";

type AuditTab =
  | "visao"
  | "agenda"
  | "financeiro"
  | "especialidades"
  | "convenios"
  | "divergencias";

type PeriodMode =
  | "dia"
  | "semana"
  | "mes"
  | "personalizado";

type ReportSection =
  | "resumo"
  | "atendimentos"
  | "especialidades"
  | "convenios"
  | "movimentacoes"
  | "divergencias";

type ReportFormat =
  | "pdf"
  | "excel";

function isoDate(
  date:
    Date
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

function periodBounds(
  mode:
    PeriodMode,
  reference:
    string,
  customStart:
    string,
  customEnd:
    string
) {
  if (
    mode ===
    "personalizado"
  ) {
    return {
      start:
        customStart ||
        reference,
      end:
        customEnd ||
        customStart ||
        reference,
    };
  }

  const date =
    new Date(
      `${reference}T12:00:00`
    );

  if (
    mode ===
    "dia"
  ) {
    return {
      start:
        reference,
      end:
        reference,
    };
  }

  if (
    mode ===
    "semana"
  ) {
    const day =
      date.getDay();

    const mondayOffset =
      day === 0
        ? -6
        : 1 - day;

    const start =
      new Date(
        date
      );

    start.setDate(
      date.getDate() +
        mondayOffset
    );

    const end =
      new Date(
        start
      );

    end.setDate(
      start.getDate() +
        6
    );

    return {
      start:
        isoDate(
          start
        ),
      end:
        isoDate(
          end
        ),
    };
  }

  const start =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );

  const end =
    new Date(
      date.getFullYear(),
      date.getMonth() +
        1,
      0
    );

  return {
    start:
      isoDate(
        start
      ),
    end:
      isoDate(
        end
      ),
  };
}

function money(
  value:
    number
) {
  return value.toLocaleString(
    "pt-BR",
    {
      style:
        "currency",
      currency:
        "BRL",
    }
  );
}

function dateBR(
  value:
    string
) {
  if (
    !value
  ) {
    return "—";
  }

  return new Date(
    `${value.slice(0, 10)}T12:00:00`
  ).toLocaleDateString(
    "pt-BR"
  );
}

function inPeriod(
  value:
    string | undefined,
  start:
    string,
  end:
    string
) {
  if (
    !value
  ) {
    return false;
  }

  const normalized =
    value.slice(
      0,
      10
    );

  return (
    normalized >=
      start &&
    normalized <=
      end
  );
}

function numberValue(
  value:
    unknown
) {
  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}


export default function Auditoria() {
  const {
    selectedUnitIds,
    isAllUnits,
    availableUnits,
    activeUnitId,
  } =
    useUnit();

  const today =
    isoDate(
      new Date()
    );

  const [
    tab,
    setTab,
  ] =
    useState<AuditTab>(
      "visao"
    );

  const [
    periodMode,
    setPeriodMode,
  ] =
    useState<PeriodMode>(
      "dia"
    );

  const [
    referenceDate,
    setReferenceDate,
  ] =
    useState(
      today
    );

  const [
    customStart,
    setCustomStart,
  ] =
    useState(
      today
    );

  const [
    customEnd,
    setCustomEnd,
  ] =
    useState(
      today
    );

  const [
    specialtyFilter,
    setSpecialtyFilter,
  ] =
    useState(
      "Todas"
    );

  const [
    professionalFilter,
    setProfessionalFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    convenioFilter,
    setConvenioFilter,
  ] =
    useState(
      "Todos"
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const [
    selectedSpecialtyAudit,
    setSelectedSpecialtyAudit,
  ] =
    useState<string | null>(
      null
    );

  const [
    reportOpen,
    setReportOpen,
  ] =
    useState(false);

  const [
    reportFormat,
    setReportFormat,
  ] =
    useState<ReportFormat>(
      "pdf"
    );

  const [
    reportPreview,
    setReportPreview,
  ] =
    useState(false);

  const [
    reportSections,
    setReportSections,
  ] =
    useState<Record<ReportSection, boolean>>({
      resumo: true,
      atendimentos: true,
      especialidades: true,
      convenios: true,
      movimentacoes: true,
      divergencias: true,
    });

  const bounds =
    useMemo(
      () =>
        periodBounds(
          periodMode,
          referenceDate,
          customStart,
          customEnd
        ),
      [
        periodMode,
        referenceDate,
        customStart,
        customEnd,
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
              selectedUnitIds.includes(
                appointment.unitId
              ) &&
              inPeriod(
                appointment.date,
                bounds.start,
                bounds.end
              )
          ),
      [
        selectedUnitIds,
        bounds.start,
        bounds.end,
      ]
    );

  const allCharges =
    useMemo(
      () => getFinancialCharges(),
      []
    );

  const charges =
    useMemo(
      () =>
        allCharges.filter(
          (charge) =>
            selectedUnitIds.includes(
              charge.unitId
            ) &&
            inPeriod(
              charge.paymentDate ||
                charge.paidAt ||
                charge.date,
              bounds.start,
              bounds.end
            )
        ),
      [
        allCharges,
        selectedUnitIds,
        bounds.start,
        bounds.end,
      ]
    );

  const allExpenses =
    useMemo(
      () => getFinancialExpenses(),
      []
    );

  const expenses =
    useMemo(
      () =>
        allExpenses.filter(
          (expense) =>
            selectedUnitIds.includes(
              expense.unitId
            ) &&
            expense.status !==
              "Cancelado" &&
            inPeriod(
              expense.paymentDate ||
                expense.dueDate,
              bounds.start,
              bounds.end
            )
        ),
      [
        allExpenses,
        selectedUnitIds,
        bounds.start,
        bounds.end,
      ]
    );

  const guides =
    useMemo(
      () =>
        getGuiasConvenios()
          .filter(
            (
              guide
            ) =>
              selectedUnitIds.includes(
                guide.unitId
              ) &&
              inPeriod(
                guide.dataAtendimento,
                bounds.start,
                bounds.end
              )
          ),
      [
        selectedUnitIds,
        bounds.start,
        bounds.end,
      ]
    );

  const lots =
    useMemo(
      () =>
        getLotesConvenios()
          .filter(
            (
              lot
            ) =>
              selectedUnitIds.includes(
                lot.unitId
              ) &&
              (
                lot.guiaIds.some(
                  (guideId) =>
                    guides.some(
                      (guide) =>
                        guide.id === guideId
                    )
                ) ||
                lot.competencia >= bounds.start.slice(0, 7) &&
                lot.competencia <= bounds.end.slice(0, 7)
              )
          ),
      [
        selectedUnitIds,
        guides,
        bounds.start,
        bounds.end,
      ]
    );

  const guideByAppointment =
    useMemo(
      () =>
        new Map<
          number,
          GuiaConvenio
        >(
          guides
            .filter(
              (guide) =>
                guide.appointmentId !== undefined
            )
            .map(
              (guide) => [
                Number(guide.appointmentId),
                guide,
              ]
            )
        ),
      [guides]
    );

  const lotById =
    useMemo(
      () =>
        new Map<
          string,
          LoteConvenio
        >(
          lots.map(
            (lot) => [
              lot.id,
              lot,
            ]
          )
        ),
      [lots]
    );

  const specialties =
    useMemo(
      () =>
        Array.from(
          new Set(
            appointments
              .map(
                (
                  item
                ) =>
                  item.specialty
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "pt-BR"
            )
        ),
      [
        appointments,
      ]
    );

  const professionals =
    useMemo(
      () =>
        Array.from(
          new Set(
            appointments
              .map(
                (
                  item
                ) =>
                  item.professional
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "pt-BR"
            )
        ),
      [
        appointments,
      ]
    );

  const convenios =
    useMemo(
      () =>
        Array.from(
          new Set(
            appointments
              .map(
                (
                  item
                ) =>
                  item.convenio
              )
              .filter(
                (
                  value
                ):
                  value is string =>
                    Boolean(
                      value
                    )
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "pt-BR"
            )
        ),
      [
        appointments,
      ]
    );

  const filteredAppointments =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return appointments
          .filter(
            (
              item
            ) =>
              specialtyFilter ===
                "Todas" ||
              item.specialty ===
                specialtyFilter
          )
          .filter(
            (
              item
            ) =>
              professionalFilter ===
                "Todos" ||
              item.professional ===
                professionalFilter
          )
          .filter(
            (
              item
            ) =>
              convenioFilter ===
                "Todos" ||
              (
                convenioFilter ===
                  "Particular" &&
                !item.convenio
              ) ||
              item.convenio ===
                convenioFilter
          )
          .filter(
            (
              item
            ) =>
              !query ||
              [
                item.patient,
                item.professional,
                item.specialty,
                item.type,
                item.room,
                item.convenio,
                item.status,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  query
                )
          )
          .sort(
            (
              a,
              b
            ) =>
              `${b.date} ${b.time}`.localeCompare(
                `${a.date} ${a.time}`
              )
          );
      },
      [
        appointments,
        specialtyFilter,
        professionalFilter,
        convenioFilter,
        search,
      ]
    );

  const chargeByAppointment =
    useMemo(
      () =>
        new Map(
          charges
            .filter(
              (
                charge
              ) =>
                (
                  charge as any
                ).appointmentId !==
                undefined
            )
            .map(
              (
                charge
              ) => [
                (
                  charge as any
                ).appointmentId,
                charge,
              ]
            )
        ),
      [
        charges,
      ]
    );

  const realized =
    filteredAppointments.filter(
      (
        item
      ) =>
        item.status ===
        "Realizado"
    );

  const convenioAppointments =
    realized.filter(
      (
        item
      ) =>
        item.billingType ===
          "Convênio" ||
        Boolean(
          item.convenio
        )
    );

  const particularAppointments =
    realized.filter(
      (item) =>
        item.billingType === "Particular" &&
        !item.patientPackageId
    );

  const particularProduced =
    particularAppointments.reduce(
      (sum, item) => {
        const charge =
          chargeByAppointment.get(item.id);

        return (
          sum +
          numberValue(
            charge?.amount ??
              item.serviceValue
          )
        );
      },
      0
    );

  const convenioProduced =
    convenioAppointments.reduce(
      (sum, item) => {
        const charge =
          chargeByAppointment.get(item.id);

        return (
          sum +
          numberValue(
            charge?.amount ??
              item.serviceValue
          )
        );
      },
      0
    );

  const missedAppointments =
    filteredAppointments.filter(
      (item) => item.status === "Faltou"
    );

  const cancelledAppointments =
    filteredAppointments.filter(
      (item) => item.status === "Cancelado"
    );

  const appointmentBase =
    filteredAppointments.length;

  const missedPercentage =
    appointmentBase > 0
      ? (missedAppointments.length /
          appointmentBase) *
        100
      : 0;

  const cancelledPercentage =
    appointmentBase > 0
      ? (cancelledAppointments.length /
          appointmentBase) *
        100
      : 0;

  const totalEntries =
    charges
      .filter(
        (
          charge
        ) =>
          (
            charge as any
          ).status ===
            "Pago"
      )
      .reduce(
        (
          sum,
          charge
        ) =>
          sum +
          numberValue(
            charge.receivedAmount ??
              charge.amount
          ),
        0
      );

  const totalExpenses =
    expenses
      .filter(
        (
          expense
        ) =>
          expense.status ===
            "Pago"
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          numberValue(
            expense.paidAmount ??
              expense.amount
          ),
        0
      );

  const paidCharges =
    charges.filter(
      (charge) =>
        charge.status === "Pago"
    );

  const pendingCharges =
    charges.filter(
      (charge) =>
        charge.status === "Pendente"
    );

  const amountToReceive =
    pendingCharges.reduce(
      (sum, charge) =>
        sum + numberValue(charge.amount),
      0
    );

  const particularEntries =
    paidCharges
      .filter((charge) =>
        charge.billingType === "Particular"
      )
      .reduce(
        (sum, charge) =>
          sum + numberValue(
            charge.receivedAmount ?? charge.amount
          ),
        0
      );

  const convenioEntries =
    paidCharges
      .filter((charge) =>
        charge.billingType === "Convênio"
      )
      .reduce(
        (sum, charge) =>
          sum + numberValue(
            charge.receivedAmount ?? charge.amount
          ),
        0
      );

  const otherEntries =
    Math.max(
      totalEntries - particularEntries - convenioEntries,
      0
    );

  const cashResult =
    totalEntries - totalExpenses;


  const specialtyRows =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              specialty: string;
              appointments: number;
              particular: number;
              convenio: number;
              charged: number;
              received: number;
            }
          >();

        realized.forEach(
          (item) => {
            const current =
              map.get(
                item.specialty
              ) ?? {
                specialty:
                  item.specialty,
                appointments: 0,
                particular: 0,
                convenio: 0,
                charged: 0,
                received: 0,
              };

            current.appointments += 1;

            if (
              item.billingType === "Convênio" ||
              item.convenio
            ) {
              current.convenio += 1;
            } else {
              current.particular += 1;
            }

            const charge =
              chargeByAppointment.get(
                item.id
              );

            current.charged +=
              numberValue(
                (charge as any)?.amount ??
                  item.serviceValue
              );

            if ((charge as any)?.status === "Pago") {
              current.received +=
                numberValue(
                  (charge as any)?.receivedAmount ??
                    (charge as any)?.amount ??
                    item.serviceValue
                );
            }

            map.set(
              item.specialty,
              current
            );
          }
        );

        return Array.from(
          map.values()
        ).sort(
          (a, b) =>
            b.appointments - a.appointments
        );
      },
      [
        realized,
        chargeByAppointment,
      ]
    );


  const specialtyProfessionalRows =
    useMemo(
      () => {
        if (!selectedSpecialtyAudit) {
          return [];
        }

        const map =
          new Map<
            string,
            {
              professional: string;
              appointments: number;
              particular: number;
              convenio: number;
              charged: number;
              received: number;
            }
          >();

        realized
          .filter(
            (item) =>
              item.specialty === selectedSpecialtyAudit
          )
          .forEach(
            (item) => {
              const current =
                map.get(item.professional) ?? {
                  professional: item.professional,
                  appointments: 0,
                  particular: 0,
                  convenio: 0,
                  charged: 0,
                  received: 0,
                };

              current.appointments += 1;

              if (
                item.billingType === "Convênio" ||
                item.convenio
              ) {
                current.convenio += 1;
              } else {
                current.particular += 1;
              }

              const charge =
                chargeByAppointment.get(item.id);

              current.charged +=
                numberValue(
                  (charge as any)?.amount ??
                    item.serviceValue
                );

              if ((charge as any)?.status === "Pago") {
                current.received +=
                  numberValue(
                    (charge as any)?.receivedAmount ??
                      (charge as any)?.amount ??
                      item.serviceValue
                  );
              }

              map.set(item.professional, current);
            }
          );

        return Array.from(map.values()).sort(
          (a, b) => b.appointments - a.appointments
        );
      },
      [
        selectedSpecialtyAudit,
        realized,
        chargeByAppointment,
      ]
    );

  const convenioRows =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              convenio: string;
              appointments: number;
              produced: number;
              guides: number;
              inLot: number;
              sent: number;
              glosado: number;
              received: number;
              pending: number;
            }
          >();

        convenioAppointments.forEach(
          (item) => {
            const name =
              item.convenio ||
              "Convênio não identificado";

            const current =
              map.get(name) ?? {
                convenio: name,
                appointments: 0,
                produced: 0,
                guides: 0,
                inLot: 0,
                sent: 0,
                glosado: 0,
                received: 0,
                pending: 0,
              };

            current.appointments += 1;
            current.produced +=
              numberValue(item.serviceValue);

            map.set(name, current);
          }
        );

        guides.forEach(
          (guide) => {
            const name =
              guide.convenio ||
              "Convênio não identificado";

            const current =
              map.get(name) ?? {
                convenio: name,
                appointments: 0,
                produced: 0,
                guides: 0,
                inLot: 0,
                sent: 0,
                glosado: 0,
                received: 0,
                pending: 0,
              };

            current.guides += 1;

            if (guide.loteId) {
              current.inLot += 1;
            }

            if (
              guide.status === "Enviado" ||
              guide.status === "Aprovado" ||
              guide.status === "Glosado" ||
              guide.status === "Em recurso" ||
              guide.status === "Recurso aprovado" ||
              guide.status === "Recurso negado" ||
              guide.status === "Pago"
            ) {
              current.sent += 1;
            }

            current.glosado +=
              numberValue(guide.valorGlosado);

            if (guide.status === "Pago") {
              current.received +=
                numberValue(
                  guide.valorAprovado ??
                    guide.valorTotal
                );
            }

            if (guide.status !== "Pago") {
              current.pending +=
                Math.max(
                  0,
                  numberValue(
                    guide.valorAprovado ??
                      guide.valorTotal
                  ) -
                    numberValue(guide.valorGlosado)
                );
            }

            map.set(name, current);
          }
        );

        return Array.from(
          map.values()
        ).sort(
          (a, b) =>
            b.appointments -
            a.appointments
        );
      },
      [
        convenioAppointments,
        guides,
      ]
    );

  const divergences =
    useMemo(
      () => {
        const rows:
          Array<{
            title: string;
            detail: string;
            level: "Alerta" | "Atenção";
            appointmentId?: number;
            searchTerm?: string;
          }> = [];

        realized.forEach(
          (item) => {
            const guide =
              guideByAppointment.get(item.id);

            if (
              item.billingType === "Particular" &&
              !item.patientPackageId &&
              !chargeByAppointment.has(item.id)
            ) {
              rows.push({
                title:
                  "Atendimento particular sem cobrança vinculada",
                detail:
                  `${item.patient} • ${item.specialty} • ${dateBR(item.date)}`,
                level: "Alerta",
                appointmentId: item.id,
                searchTerm: item.patient,
              });
            }

            const linkedCharge =
              chargeByAppointment.get(item.id);

            if (linkedCharge) {
              if (
                linkedCharge.status === "Pago" &&
                linkedCharge.receivedAmount !== undefined &&
                Math.abs(
                  numberValue(linkedCharge.receivedAmount) -
                    numberValue(linkedCharge.amount)
                ) > 0.01
              ) {
                rows.push({
                  title:
                    "Valor recebido diferente do valor previsto",
                  detail:
                    `${item.patient} • previsto ${money(linkedCharge.amount)} • recebido ${money(linkedCharge.receivedAmount)} • ${dateBR(item.date)}`,
                  level: "Alerta",
                  appointmentId: item.id,
                  searchTerm: item.patient,
                });
              }

              if (
                linkedCharge.status === "Pago" &&
                !linkedCharge.paymentDate &&
                !linkedCharge.paidAt
              ) {
                rows.push({
                  title:
                    "Cobrança marcada como paga sem data de recebimento",
                  detail:
                    `${item.patient} • ${money(linkedCharge.receivedAmount ?? linkedCharge.amount)} • ${dateBR(item.date)}`,
                  level: "Atenção",
                  appointmentId: item.id,
                  searchTerm: item.patient,
                });
              }
            }

            if (
              item.billingType === "Convênio" &&
              !item.convenio
            ) {
              rows.push({
                title:
                  "Atendimento de convênio sem convênio identificado",
                detail:
                  `${item.patient} • ${item.professional} • ${dateBR(item.date)}`,
                level: "Atenção",
              });
            }

            if (
              (item.billingType === "Convênio" ||
                Boolean(item.convenio)) &&
              !guide
            ) {
              rows.push({
                title:
                  "Atendimento de convênio realizado sem guia",
                detail:
                  `${item.patient} • ${item.convenio || "Convênio não identificado"} • ${dateBR(item.date)}`,
                level: "Alerta",
                appointmentId: item.id,
                searchTerm: item.patient,
              });
            }
          }
        );

        guides.forEach(
          (guide) => {
            if (
              guide.appointmentId !== undefined &&
              !appointments.some(
                (item) =>
                  item.id === guide.appointmentId
              )
            ) {
              rows.push({
                title:
                  "Guia sem atendimento correspondente",
                detail:
                  `${guide.paciente} • ${guide.convenio} • Guia ${guide.numeroGuia || guide.id}`,
                level: "Alerta",
              });
            }

            if (
              guide.status === "Pendente de envio" &&
              !guide.loteId
            ) {
              rows.push({
                title:
                  "Produção de convênio ainda não incluída em lote",
                detail:
                  `${guide.paciente} • ${guide.convenio} • ${dateBR(guide.dataAtendimento)}`,
                level: "Atenção",
              });
            }

            if (
              guide.loteId &&
              !lotById.has(guide.loteId)
            ) {
              rows.push({
                title:
                  "Guia vinculada a lote não localizado",
                detail:
                  `${guide.paciente} • ${guide.convenio} • Lote ${guide.loteId}`,
                level: "Alerta",
              });
            }
          }
        );

        allExpenses.forEach(
          (expense) => {
            const movementDate =
              expense.paymentDate || expense.dueDate;

            if (
              !inPeriod(
                movementDate,
                bounds.start,
                bounds.end
              )
            ) {
              return;
            }

            if (
              isAllUnits &&
              !numberValue(expense.unitId)
            ) {
              rows.push({
                title:
                  "Movimentação financeira sem unidade",
                detail:
                  `${expense.description} • ${money(expense.paidAmount ?? expense.amount)} • ${dateBR(movementDate)}`,
                level: "Alerta",
              });
            }

            if (
              !expense.category ||
              !String(expense.category).trim()
            ) {
              rows.push({
                title:
                  "Despesa sem categoria",
                detail:
                  `${expense.description} • ${money(expense.paidAmount ?? expense.amount)} • ${dateBR(movementDate)}`,
                level: "Atenção",
              });
            }
          }
        );

        allCharges.forEach(
          (charge) => {
            const movementDate =
              charge.paymentDate || charge.paidAt || charge.date;

            if (
              !inPeriod(
                movementDate,
                bounds.start,
                bounds.end
              )
            ) {
              return;
            }

            if (
              isAllUnits &&
              !numberValue(charge.unitId)
            ) {
              rows.push({
                title:
                  "Cobrança sem unidade",
                detail:
                  `${charge.patient} • ${money(charge.amount)} • ${dateBR(movementDate)}`,
                level: "Alerta",
              });
            }
          }
        );

        return rows.map(
          (row, index) => {
            const title =
              row.title.toLowerCase();

            const origin =
              title.includes("guia") ||
              title.includes("convênio") ||
              title.includes("lote") ||
              title.includes("produção")
                ? "Convênios"
                : title.includes("cobrança") ||
                      title.includes("recebido") ||
                      title.includes("despesa") ||
                      title.includes("movimentação")
                    ? "Financeiro"
                    : "Agenda";

            const priority =
              row.level === "Alerta"
                ? "Alta"
                : "Média";

            return {
              ...row,
              id: `${origin}-${index}-${row.title}`,
              origin,
              priority,
            };
          }
        );
      },
      [
        realized,
        appointments,
        guides,
        chargeByAppointment,
        guideByAppointment,
        lotById,
        allExpenses,
        allCharges,
        bounds.start,
        bounds.end,
        isAllUnits,
      ]
    );

  const unitLabel =
    isAllUnits
      ? "Todas as unidades"
      : availableUnits.find(
          (
            unit
          ) =>
            unit.id ===
            activeUnitId
        )?.name ??
        "Unidade";

  function openDivergence(
    item: (typeof divergences)[number]
  ) {
    if (item.appointmentId) {
      if (item.searchTerm) {
        setSearch(
          item.searchTerm
        );
      }

      setTab(
        "agenda"
      );
      return;
    }

    if (item.origin === "Convênios") {
      setTab(
        "convenios"
      );
      return;
    }

    if (item.origin === "Financeiro") {
      setTab(
        "financeiro"
      );
      return;
    }

    setTab(
      "agenda"
    );
  }

  const reportSectionOptions: Array<{ id: ReportSection; label: string }> = [
    { id: "resumo", label: "Resumo financeiro" },
    { id: "atendimentos", label: "Atendimentos" },
    { id: "especialidades", label: "Especialidades" },
    { id: "convenios", label: "Convênios" },
    { id: "movimentacoes", label: "Entradas e saídas" },
    { id: "divergencias", label: "Divergências" },
  ];

  function toggleReportSection(section: ReportSection) {
    setReportSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function setCompleteReport(checked: boolean) {
    setReportSections({
      resumo: checked,
      atendimentos: checked,
      especialidades: checked,
      convenios: checked,
      movimentacoes: checked,
      divergencias: checked,
    });
  }

  const selectedReportSections = reportSectionOptions.filter(
    (option) => reportSections[option.id]
  );

  function reportTables() {
    const filteredIds = new Set(filteredAppointments.map((item) => item.id));

    const reportCharges = charges.filter((charge) => {
      const appointmentId = (charge as any).appointmentId as number | undefined;
      return appointmentId === undefined || filteredIds.has(appointmentId);
    });


    const reportGuides = guides.filter((guide) =>
      guide.appointmentId === undefined || filteredIds.has(guide.appointmentId)
    );

    const tables: Array<{
      id: ReportSection;
      title: string;
      headers: string[];
      rows: Array<Array<string | number>>;
    }> = [];

    if (reportSections.resumo) {
      tables.push({
        id: "resumo",
        title: "Resumo financeiro",
        headers: ["Indicador", "Valor"],
        rows: [
          ["Unidade", unitLabel],
          ["Período", `${dateBR(bounds.start)} a ${dateBR(bounds.end)}`],
          ["Atendimentos realizados", realized.length],
          ["Entradas recebidas", money(totalEntries)],
          ["Saídas pagas", money(totalExpenses)],
          ["Resultado do caixa", money(cashResult)],
          ["Divergências", divergences.length],
        ],
      });
    }

    if (reportSections.atendimentos) {
      tables.push({
        id: "atendimentos",
        title: "Atendimentos",
        headers: [
          "Data", "Horário", "Paciente", "Profissional", "Especialidade",
          "Procedimento", "Sala", "Status", "Tipo", "Convênio",
          "Valor", "Recebido",
        ],
        rows: filteredAppointments.map((item) => {
          const charge = chargeByAppointment.get(item.id) as any;
          return [
            dateBR(item.date), item.time, item.patient, item.professional,
            item.specialty, item.type, item.room, item.status,
            item.billingType || "—", item.convenio || "—",
            money(numberValue(charge?.amount ?? item.serviceValue)),
            money(charge?.status === "Pago" ? numberValue(charge?.receivedAmount ?? charge?.amount) : 0),
          ];
        }),
      });
    }

    if (reportSections.especialidades) {
      tables.push({
        id: "especialidades",
        title: "Especialidades",
        headers: [
          "Especialidade", "Atendimentos", "Particular", "Convênio",
          "Valor cobrado", "Recebido",
        ],
        rows: specialtyRows.map((row) => [
          row.specialty, row.appointments, row.particular, row.convenio,
          money(row.charged), money(row.received),
        ]),
      });
    }

    if (reportSections.convenios) {
      tables.push({
        id: "convenios",
        title: "Convênios",
        headers: [
          "Convênio", "Atendimentos", "Produção", "Guias", "Em lote",
          "Enviado", "Glosado", "Recebido", "Pendente",
        ],
        rows: convenioRows.map((row) => [
          row.convenio, row.appointments, money(row.produced), row.guides,
          row.inLot, row.sent, money(row.glosado), money(row.received), money(row.pending),
        ]),
      });

      tables.push({
        id: "convenios",
        title: "Guias de convênios",
        headers: ["Data", "Paciente", "Convênio", "Guia", "Lote", "Status", "Valor"],
        rows: reportGuides.map((guide) => [
          dateBR(guide.dataAtendimento), guide.paciente, guide.convenio,
          guide.numeroGuia || guide.id, guide.loteId || "—", guide.status,
          money(numberValue(guide.valorTotal)),
        ]),
      });
    }

    if (reportSections.movimentacoes) {
      tables.push({
        id: "movimentacoes",
        title: "Entradas / cobranças",
        headers: ["Data", "Descrição", "Status", "Previsto", "Recebido", "Unidade"],
        rows: reportCharges.map((charge: any) => [
          dateBR(charge.paymentDate || charge.paidAt || charge.date),
          charge.description || charge.patientName || charge.patient || "Cobrança",
          charge.status || "—", money(numberValue(charge.amount)),
          money(charge.status === "Pago" ? numberValue(charge.receivedAmount ?? charge.amount) : 0),
          charge.unitId || "—",
        ]),
      });

      tables.push({
        id: "movimentacoes",
        title: "Saídas / despesas",
        headers: ["Data", "Descrição", "Categoria", "Status", "Valor", "Pago", "Unidade"],
        rows: expenses.map((expense: any) => [
          dateBR(expense.paymentDate || expense.dueDate),
          expense.description || expense.name || "Despesa",
          expense.category || "Sem categoria", expense.status || "—",
          money(numberValue(expense.amount)), money(numberValue(expense.paidAmount ?? 0)),
          expense.unitId || "—",
        ]),
      });
    }

    if (reportSections.divergencias) {
      tables.push({
        id: "divergencias",
        title: "Divergências",
        headers: ["Prioridade", "Origem", "Divergência", "Detalhes"],
        rows: divergences.map((item) => [
          item.priority, item.origin, item.title, item.detail,
        ]),
      });
    }

    return { tables };
  }

  function escapeHtml(value: unknown) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pdfEscapeText(value: unknown) {
    const normalized = String(value ?? "")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/…/g, "...")
      .replace(/•/g, "-");

    let result = "";
    for (const character of normalized) {
      const code = character.charCodeAt(0);
      if (character === "\\" || character === "(" || character === ")") {
        result += `\\${character}`;
      } else if (code >= 32 && code <= 126) {
        result += character;
      } else if (code <= 255) {
        result += `\\${code.toString(8).padStart(3, "0")}`;
      } else {
        result += "?";
      }
    }
    return result;
  }

  function wrapPdfText(value: unknown, maxLength = 145) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!text) return [""];
    if (text.length <= maxLength) return [text];

    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    words.forEach((word) => {
      if (!current) {
        current = word;
        return;
      }
      if (`${current} ${word}`.length <= maxLength) {
        current += ` ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) lines.push(current);
    return lines;
  }

  function generatePdfReport() {
    const { tables } = reportTables();
    const pageWidth = 842;
    const pageHeight = 595;
    const marginX = 32;
    const contentWidth = pageWidth - marginX * 2;
    const bottomY = 38;

    const purple = "0.38 0.21 0.67";
    const darkPurple = "0.16 0.12 0.35";
    const softPurple = "0.96 0.94 1";
    const verySoftPurple = "0.985 0.98 1";
    const lineGray = "0.90 0.91 0.94";
    const textGray = "0.35 0.39 0.48";
    const softGray = "0.97 0.975 0.985";
    const white = "1 1 1";

    const pages: string[][] = [];
    let commands: string[] = [];
    let y = 0;

    const safeText = (value: unknown, max = 80) => {
      const text = String(value ?? "").replace(/\s+/g, " ").trim();
      return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 3))}...`;
    };

    const drawText = (
      text: unknown,
      x: number,
      yy: number,
      size = 8,
      bold = false,
      rgb = darkPurple,
    ) => {
      commands.push(
        `${rgb} rg BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${yy.toFixed(2)} Tm (${pdfEscapeText(text)}) Tj ET`,
      );
    };

    const rect = (x: number, yy: number, w: number, h: number, fill: string, stroke?: string) => {
      commands.push(`${fill} rg ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
      if (stroke) {
        commands.push(`${stroke} RG 0.6 w ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
      }
    };

    const line = (x1: number, y1: number, x2: number, y2: number, rgb = lineGray) => {
      commands.push(`${rgb} RG 0.5 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    };

    const startPage = () => {
      commands = [];
      rect(0, 0, pageWidth, pageHeight, white);
      rect(0, pageHeight - 88, pageWidth, 88, purple);
      drawText("CLÍNICA INTEGRADA ENTRE AFETOS", marginX, pageHeight - 34, 15, true, white);
      drawText("RELATÓRIO DE AUDITORIA", marginX, pageHeight - 54, 9, true, "0.91 0.86 1");
      drawText(
        `${dateBR(bounds.start)} a ${dateBR(bounds.end)}  •  ${unitLabel}`,
        marginX,
        pageHeight - 72,
        7.5,
        false,
        white,
      );
      y = pageHeight - 112;
    };

    const finishPage = () => {
      line(marginX, 24, pageWidth - marginX, 24);
      drawText("Auditoria • modo somente leitura", marginX, 12, 6.5, false, textGray);
      pages.push(commands);
      commands = [];
    };

    const ensureSpace = (height: number) => {
      if (y - height < bottomY) {
        finishPage();
        startPage();
      }
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(32);
      rect(marginX, y - 22, contentWidth, 22, softPurple, lineGray);
      rect(marginX, y - 22, 5, 22, purple);
      drawText(title.toUpperCase(), marginX + 14, y - 15, 8.5, true, darkPurple);
      y -= 30;
    };

    const drawSummary = (table: (typeof tables)[number]) => {
      drawSectionTitle(table.title);
      const cardGap = 10;
      const cols = 3;
      const cardWidth = (contentWidth - cardGap * (cols - 1)) / cols;
      const cardHeight = 48;

      table.rows.forEach((row, index) => {
        const col = index % cols;
        if (col === 0) ensureSpace(cardHeight + 10);
        const x = marginX + col * (cardWidth + cardGap);
        const yy = y - cardHeight;
        rect(x, yy, cardWidth, cardHeight, index % 2 === 0 ? verySoftPurple : softGray, lineGray);
        drawText(safeText(row[0], 34), x + 10, yy + 29, 6.8, true, textGray);
        drawText(safeText(row[1], 38), x + 10, yy + 12, 10, true, darkPurple);
        if (col === cols - 1 || index === table.rows.length - 1) y -= cardHeight + 10;
      });
      y -= 4;
    };

    const drawTable = (table: (typeof tables)[number]) => {
      drawSectionTitle(table.title);
      if (table.rows.length === 0) {
        rect(marginX, y - 34, contentWidth, 34, softGray, lineGray);
        drawText("Nenhum registro encontrado no período selecionado.", marginX + 12, y - 21, 7.5, false, textGray);
        y -= 44;
        return;
      }

      const colCount = Math.max(1, table.headers.length);
      const cellWidth = contentWidth / colCount;
      const fontSize = colCount >= 11 ? 4.8 : colCount >= 8 ? 5.5 : colCount >= 5 ? 6.2 : 7;
      const headerHeight = 26;
      const rowHeight = 22;
      const maxChars = Math.max(7, Math.floor((cellWidth / fontSize) * 1.65));

      const drawHeader = () => {
        ensureSpace(headerHeight + rowHeight);
        rect(marginX, y - headerHeight, contentWidth, headerHeight, darkPurple);
        table.headers.forEach((header, index) => {
          const x = marginX + index * cellWidth;
          if (index > 0) line(x, y - headerHeight, x, y, "0.35 0.29 0.55");
          drawText(safeText(header, maxChars), x + 4, y - 16, fontSize, true, white);
        });
        y -= headerHeight;
      };

      drawHeader();

      table.rows.forEach((row, rowIndex) => {
        if (y - rowHeight < bottomY) {
          finishPage();
          startPage();
          drawSectionTitle(`${table.title} — continuação`);
          drawHeader();
        }
        rect(marginX, y - rowHeight, contentWidth, rowHeight, rowIndex % 2 === 0 ? white : softGray);
        row.forEach((cell, index) => {
          const x = marginX + index * cellWidth;
          if (index > 0) line(x, y - rowHeight, x, y);
          drawText(safeText(cell, maxChars), x + 4, y - 14, fontSize, false, textGray);
        });
        line(marginX, y - rowHeight, marginX + contentWidth, y - rowHeight);
        y -= rowHeight;
      });
      y -= 12;
    };

    startPage();

    // Faixa de filtros para contextualizar a auditoria sem poluir o relatório.
    rect(marginX, y - 42, contentWidth, 42, verySoftPurple, lineGray);
    drawText("FILTROS APLICADOS", marginX + 12, y - 14, 6.5, true, purple);
    drawText(
      safeText(
        `Profissional: ${professionalFilter}  •  Especialidade: ${specialtyFilter}  •  Convênio: ${convenioFilter}${search.trim() ? `  •  Busca: ${search.trim()}` : ""}`,
        170,
      ),
      marginX + 12,
      y - 30,
      7,
      false,
      textGray,
    );
    y -= 56;

    tables.forEach((table) => {
      if (table.id === "resumo" && table.title === "Resumo financeiro") drawSummary(table);
      else drawTable(table);
    });

    if (commands.length > 0) finishPage();

    const objects: string[] = [];
    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

    const pageObjectNumbers: number[] = [];
    pages.forEach((pageCommands, index) => {
      const pageObject = 5 + index * 2;
      const contentObject = pageObject + 1;
      pageObjectNumbers.push(pageObject);
      const pageContent = pageCommands.join("\n");
      objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`;
      const contentLength = new TextEncoder().encode(pageContent).length;
      objects[contentObject] = `<< /Length ${contentLength} >>\nstream\n${pageContent}\nendstream`;
    });

    objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

    let pdf = "%PDF-1.4\n%AUDITORIA\n";
    const offsets: number[] = [0];
    for (let index = 1; index < objects.length; index += 1) {
      offsets[index] = new TextEncoder().encode(pdf).length;
      pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
    }

    const xrefOffset = new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${objects.length}\n`;
    pdf += "0000000000 65535 f \n";
    for (let index = 1; index < objects.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-${bounds.start}-${bounds.end}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function excelCell(value: unknown) {
    const text = String(value ?? "");
    const numeric = typeof value === "number" && Number.isFinite(value);
    return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${escapeHtml(text)}</Data></Cell>`;
  }

  function generateExcelReport() {
    const { tables } = reportTables();
    const grouped = new Map<string, typeof tables>();

    tables.forEach((table) => {
      const key = table.id;
      grouped.set(key, [...(grouped.get(key) ?? []), table]);
    });

    const worksheets = Array.from(grouped.entries()).map(([id, sectionTables]) => {
      const option = reportSectionOptions.find((item) => item.id === id);
      const name = (option?.label || id).slice(0, 31).replace(/[\\/?*\[\]:]/g, "-");
      const rows = sectionTables.map((table) => `
        <Row><Cell ss:StyleID="Section"><Data ss:Type="String">${escapeHtml(table.title)}</Data></Cell></Row>
        <Row>${table.headers.map((header) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeHtml(header)}</Data></Cell>`).join("")}</Row>
        ${table.rows.map((row) => `<Row>${row.map(excelCell).join("")}</Row>`).join("")}
        <Row></Row>
      `).join("");
      return `<Worksheet ss:Name="${escapeHtml(name)}"><Table>${rows}</Table></Worksheet>`;
    }).join("");

    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Styles>
          <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E9EEFF" ss:Pattern="Solid"/></Style>
          <Style ss:ID="Section"><Font ss:Bold="1" ss:Size="12" ss:Color="#102A78"/></Style>
        </Styles>
        ${worksheets}
      </Workbook>`;

    const blob = new Blob(["\ufeff", xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-${bounds.start}-${bounds.end}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function generateSelectedReport() {
    if (selectedReportSections.length === 0) return;
    if (reportFormat === "excel") {
      generateExcelReport();
      return;
    }
    generatePdfReport();
  }

  function exportCsv() {
    const headers = [
      "Data",
      "Horario",
      "Paciente",
      "Profissional",
      "Especialidade",
      "Procedimento",
      "Sala",
      "Status",
      "Tipo",
      "Convenio",
      "Valor",
    ];

    const rows =
      filteredAppointments.map(
        (
          item
        ) => {
          const charge =
            chargeByAppointment.get(
              item.id
            );


          return [
            item.date,
            item.time,
            item.patient,
            item.professional,
            item.specialty,
            item.type,
            item.room,
            item.status,
            item.billingType ||
              "",
            item.convenio ||
              "",
            numberValue(
              (
                charge as any
              )?.amount ??
                item.serviceValue
            ),
          ];
        }
      );

    const escape =
      (
        value:
          unknown
      ) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          (
            row
          ) =>
            row
              .map(
                escape
              )
              .join(
                ";"
              )
        )
        .join(
          "\n"
        );

    const blob =
      new Blob(
        [
          "\ufeff",
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      `auditoria-${bounds.start}-${bounds.end}.csv`;

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  const tabs:
    Array<{
      id:
        AuditTab;
      label:
        string;
    }> = [
      {
        id:
          "visao",
        label:
          "Visão geral",
      },
      {
        id:
          "agenda",
        label:
          "Agenda",
      },
      {
        id:
          "financeiro",
        label:
          "Financeiro",
      },
      {
        id:
          "especialidades",
        label:
          "Especialidades",
      },
      {
        id:
          "convenios",
        label:
          "Convênios",
      },
      {
        id:
          "divergencias",
        label:
          "Divergências",
      },
    ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8a94ad]">
              Administrativo
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-[#102a78]">
              Auditoria
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Conferência operacional e financeira dos atendimentos da clínica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={exportCsv}
              className="gap-2"
            >
              <Download size={17} />
              CSV rápido
            </Button>

            <Button
              type="button"
              onClick={() => setReportOpen(true)}
              className="gap-2"
            >
              <Download size={17} />
              Gerar relatório
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e9f2] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                Período
              </label>

              <Select
                value={
                  periodMode
                }
                onChange={(
                  event
                ) =>
                  setPeriodMode(
                    event.target.value as PeriodMode
                  )
                }
              >
                <option value="dia">
                  Dia
                </option>
                <option value="semana">
                  Semana
                </option>
                <option value="mes">
                  Mês
                </option>
                <option value="personalizado">
                  Personalizado
                </option>
              </Select>
            </div>

            {periodMode !==
              "personalizado" ? (
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                  Data de referência
                </label>

                <Input
                  type="date"
                  value={
                    referenceDate
                  }
                  onChange={(
                    event
                  ) =>
                    setReferenceDate(
                      event.target.value
                    )
                  }
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                    Data inicial
                  </label>

                  <Input
                    type="date"
                    value={
                      customStart
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomStart(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                    Data final
                  </label>

                  <Input
                    type="date"
                    value={
                      customEnd
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomEnd(
                        event.target.value
                      )
                    }
                  />
                </div>
              </>
            )}

            <div className="rounded-xl border border-[#e7e9f2] bg-[#f8f9fd] px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8a94ad]">
                Unidade auditada
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#263765]">
                {
                  unitLabel
                }
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-[#8a94ad]">
                {dateBR(bounds.start)} até {dateBR(bounds.end)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                      specialty
                    }
                    value={
                      specialty
                    }
                  >
                    {
                      specialty
                    }
                  </option>
                )
              )}
            </Select>

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
                      professional
                    }
                    value={
                      professional
                    }
                  >
                    {
                      professional
                    }
                  </option>
                )
              )}
            </Select>

            <Select
              value={
                convenioFilter
              }
              onChange={(
                event
              ) =>
                setConvenioFilter(
                  event.target.value
                )
              }
            >
              <option value="Todos">
                Todos os convênios
              </option>

              <option value="Particular">
                Particular / sem convênio
              </option>

              {convenios.map(
                (
                  convenio
                ) => (
                  <option
                    key={
                      convenio
                    }
                    value={
                      convenio
                    }
                  >
                    {
                      convenio
                    }
                  </option>
                )
              )}
            </Select>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3b7]"
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
                placeholder="Paciente, profissional, procedimento..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#e7e9f2] bg-white p-2 shadow-sm">
          {tabs.map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                onClick={() =>
                  setTab(
                    item.id
                  )
                }
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                  tab ===
                  item.id
                    ? "bg-[#102a78] text-white shadow-sm"
                    : "text-[#68748f] hover:bg-[#f5f6fa]"
                }`}
              >
                {
                  item.label
                }
              </button>
            )
          )}
        </div>

        {tab ===
          "visao" && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AuditMetric
                icon={Activity}
                label="Atendimentos realizados"
                value={String(realized.length)}
                detail={`${filteredAppointments.length} registros no período`}
              />

              <AuditMetric
                icon={ReceiptText}
                label="Particular"
                value={String(particularAppointments.length)}
                detail={`${money(particularProduced)} em produção`}
              />

              <AuditMetric
                icon={ShieldCheck}
                label="Convênios"
                value={String(convenioAppointments.length)}
                detail={`${money(convenioProduced)} em produção`}
              />

              <AuditMetric
                icon={BanknoteArrowUp}
                label="Entradas de caixa"
                value={money(totalEntries)}
                detail="Cobranças registradas como pagas"
              />

              <AuditMetric
                icon={BanknoteArrowDown}
                label="Saídas de caixa"
                value={money(totalExpenses)}
                detail="Despesas registradas como pagas"
              />

              <AuditMetric
                icon={CircleDollarSign}
                label="Resultado do caixa"
                value={money(cashResult)}
                detail="Entradas menos saídas"
              />

              <AuditMetric
                icon={CalendarDays}
                label="Faltas"
                value={String(missedAppointments.length)}
                detail={`${missedPercentage.toFixed(1)}% dos agendamentos`}
              />

              <AuditMetric
                icon={X}
                label="Cancelamentos"
                value={String(cancelledAppointments.length)}
                detail={`${cancelledPercentage.toFixed(1)}% dos agendamentos`}
              />

              <AuditMetric
                icon={Stethoscope}
                label="Especialidades"
                value={String(specialtyRows.length)}
                detail="Com atendimento realizado"
              />

              <AuditMetric
                icon={FileWarning}
                label="Divergências"
                value={String(divergences.length)}
                detail="Pontos para conferência"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope
                    size={18}
                    className="text-[#102a78]"
                  />

                  <h2 className="text-sm font-extrabold text-[#263765]">
                    Produção por especialidade
                  </h2>
                </div>

                <SpecialtyTable
                  rows={
                    specialtyRows.slice(
                      0,
                      8
                    )
                  }
                />
              </section>

              <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className="text-[#102a78]"
                  />

                  <h2 className="text-sm font-extrabold text-[#263765]">
                    Produção de convênios
                  </h2>
                </div>

                <ConvenioTable
                  rows={
                    convenioRows.slice(
                      0,
                      8
                    )
                  }
                />
              </section>
            </div>
          </>
        )}

        {tab ===
          "agenda" && (
          <AgendaAuditTable
            appointments={
              filteredAppointments
            }
            chargeByAppointment={
              chargeByAppointment
            }
            guideByAppointment={
              guideByAppointment
            }
            lotById={
              lotById
            }
          />
        )}

        {tab ===
          "financeiro" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FinancialSummaryCard
                title="Entradas recebidas"
                value={totalEntries}
                detail={`${paidCharges.length} recebimento(s)`}
                icon={<BanknoteArrowUp size={18} className="text-emerald-600" />}
              />

              <FinancialSummaryCard
                title="Saídas pagas"
                value={totalExpenses}
                detail={`${expenses.filter((expense) => expense.status === "Pago").length} pagamento(s)`}
                icon={<BanknoteArrowDown size={18} className="text-red-500" />}
              />

              <FinancialSummaryCard
                title="Resultado do caixa"
                value={cashResult}
                detail="Entradas menos despesas pagas"
                icon={<CircleDollarSign size={18} className="text-[#6f46c7]" />}
              />

            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#263765]">Composição das entradas</h2>
                <div className="mt-4 space-y-3 text-xs font-semibold text-[#53617f]">
                  <FinancialLine label="Particular" value={particularEntries} />
                  <FinancialLine label="Convênios" value={convenioEntries} />
                  <FinancialLine label="Planos / outros" value={otherEntries} />
                </div>
              </section>

              <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#263765]">Contas a receber</h2>
                <p className="mt-3 text-2xl font-extrabold text-[#102a78]">{money(amountToReceive)}</p>
                <p className="mt-1 text-xs font-semibold text-[#8a94ad]">{pendingCharges.length} cobrança(s) pendente(s)</p>
              </section>

            </div>

            <FinancialAuditTables
              charges={charges}
              expenses={expenses}
            />
          </div>
        )}

        {tab ===
          "especialidades" && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#263765]">
                Auditoria por especialidade
              </h2>

              <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
                Clique em uma especialidade para conferir o detalhamento por profissional. Os dados são somente leitura.
              </p>

              <SpecialtyTable
                rows={specialtyRows}
                onSelect={setSelectedSpecialtyAudit}
                selectedSpecialty={selectedSpecialtyAudit}
              />
            </section>

            {selectedSpecialtyAudit && (
              <SpecialtyProfessionalDetail
                specialty={selectedSpecialtyAudit}
                rows={specialtyProfessionalRows}
                onClose={() => setSelectedSpecialtyAudit(null)}
              />
            )}
          </div>
        )}

        {tab ===
          "convenios" && (
          <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#263765]">
              Conferência de convênios
            </h2>

            <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
              Cruzamento somente leitura entre atendimento, guia, lote, envio, glosa e recebimento.
            </p>

            <ConvenioTable
              rows={
                convenioRows
              }
            />
          </section>
        )}

        {tab ===
          "divergencias" && (
          <div className="space-y-4">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AuditMetric
                icon={FileWarning}
                label="Total de divergências"
                value={String(divergences.length)}
                detail="Ocorrências identificadas pelos cruzamentos da auditoria"
              />

              <AuditMetric
                icon={FileWarning}
                label="Prioridade alta"
                value={String(divergences.filter((item) => item.priority === "Alta").length)}
                detail="Situações que exigem conferência prioritária"
              />

              <AuditMetric
                icon={ReceiptText}
                label="Financeiro"
                value={String(divergences.filter((item) => item.origin === "Financeiro").length)}
                detail="Cobranças, recebimentos e despesas"
              />

              <AuditMetric
                icon={ShieldCheck}
                label="Operacional"
                value={String(divergences.filter((item) => item.origin !== "Financeiro").length)}
                detail="Agenda, convênios e guias"
              />
            </section>

            <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-[#263765]">
                    Central de divergências
                  </h2>

                  <p className="mt-1 text-[11px] font-semibold text-[#8a94ad]">
                    Conferência somente leitura. Nenhuma ação desta tela altera os registros originais.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-[#f0f3ff] px-3 py-1.5 text-[10px] font-extrabold text-[#102a78]">
                  {divergences.length} ocorrência{divergences.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#edf0f6] text-[10px] font-extrabold uppercase tracking-wide text-[#8a94ad]">
                      <th className="px-3 py-3">Prioridade</th>
                      <th className="px-3 py-3">Origem</th>
                      <th className="px-3 py-3">Divergência</th>
                      <th className="px-3 py-3">Detalhes</th>
                      <th className="px-3 py-3 text-right">Conferência</th>
                    </tr>
                  </thead>

                  <tbody>
                    {divergences.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#f1f3f8] last:border-0"
                        >
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                                item.priority === "Alta"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex rounded-full bg-[#f0f3ff] px-2.5 py-1 text-[10px] font-extrabold text-[#102a78]">
                              {item.origin}
                            </span>
                          </td>

                          <td className="px-3 py-3 font-extrabold text-[#263765]">
                            {item.title}
                          </td>

                          <td className="px-3 py-3 font-semibold text-[#68738f]">
                            {item.detail}
                          </td>

                          <td className="px-3 py-3 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 gap-1.5 px-3 text-[10px] font-extrabold"
                              onClick={() =>
                                openDivergence(
                                  item
                                )
                              }
                            >
                              <Eye size={14} />
                              {item.appointmentId
                                ? "Ver atendimento"
                                : "Conferir origem"}
                            </Button>
                          </td>
                        </tr>
                      )
                    )}

                    {divergences.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-xs font-bold text-emerald-700"
                        >
                          Nenhuma divergência automática encontrada neste período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4">
          <div className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl border border-[#ddd4f5] bg-white shadow-2xl ${reportPreview ? "max-w-6xl" : "max-w-2xl"}`}>
            <div className="flex items-start justify-between gap-4 border-b border-[#edf0f5] px-5 py-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a73c8]">
                  Auditoria
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-[#102a78]">
                  {reportPreview ? "Visualização do relatório" : "Gerar relatório"}
                </h2>
                <p className="mt-1 text-xs font-semibold text-[#7e89a4]">
                  {reportPreview
                    ? "Confira o relatório antes de fazer o download."
                    : "Escolha o conteúdo e visualize o documento antes de baixar."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReportPreview(false);
                  setReportOpen(false);
                }}
                className="rounded-lg border border-[#e5e8f0] p-2 text-[#77829a] hover:bg-[#f7f8fb]"
                aria-label="Fechar"
              >
                <X size={17} />
              </button>
            </div>

            {!reportPreview ? (
              <>
                <div className="space-y-5 overflow-y-auto p-5">
                  <div>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                      Conteúdo do relatório
                    </p>

                    <label className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl border border-[#dcd5f4] bg-[#f8f6ff] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedReportSections.length === reportSectionOptions.length}
                        onChange={(event) => setCompleteReport(event.target.checked)}
                        className="h-4 w-4 accent-[#6f46c7]"
                      />
                      <span className="text-xs font-extrabold text-[#5c3cad]">Relatório completo</span>
                    </label>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {reportSectionOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e7e9f2] px-4 py-3 hover:bg-[#fafaff]"
                        >
                          <input
                            type="checkbox"
                            checked={reportSections[option.id]}
                            onChange={() => toggleReportSection(option.id)}
                            className="h-4 w-4 accent-[#6f46c7]"
                          />
                          <span className="text-xs font-bold text-[#374666]">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#7e89a4]">
                      Formato para download
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReportFormat("pdf")}
                        className={`rounded-xl border px-4 py-3 text-left ${
                          reportFormat === "pdf"
                            ? "border-[#8f72d7] bg-[#f7f4ff]"
                            : "border-[#e5e8f0] bg-white"
                        }`}
                      >
                        <p className="text-xs font-extrabold text-[#263765]">PDF</p>
                        <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
                          Relatório diagramado, pronto para salvar e compartilhar.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportFormat("excel")}
                        className={`rounded-xl border px-4 py-3 text-left ${
                          reportFormat === "excel"
                            ? "border-[#8f72d7] bg-[#f7f4ff]"
                            : "border-[#e5e8f0] bg-white"
                        }`}
                      >
                        <p className="text-xs font-extrabold text-[#263765]">Excel</p>
                        <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
                          Pasta de trabalho com as seções organizadas em abas.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#edf0f5] bg-[#fbfbfe] px-4 py-3 text-[10px] font-semibold text-[#68738f]">
                    <strong className="text-[#263765]">Filtros:</strong> {unitLabel} • {dateBR(bounds.start)} a {dateBR(bounds.end)} • Profissional: {professionalFilter} • Especialidade: {specialtyFilter} • Convênio: {convenioFilter}
                    {search.trim() ? ` • Busca: ${search.trim()}` : ""}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f5] bg-[#fbfbfe] px-5 py-4">
                  <p className="text-[10px] font-semibold text-[#8a94ad]">
                    {selectedReportSections.length} seção(ões) selecionada(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReportPreview(false);
                        setReportOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setReportPreview(true)}
                      disabled={selectedReportSections.length === 0}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      Visualizar relatório
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto bg-[#eef0f6] p-4 sm:p-6">
                  <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[22px] bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-[#4f2c91] via-[#6740ad] to-[#805bc4] px-7 py-7 text-white sm:px-10">
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/75">
                            Clínica Integrada Entre Afetos
                          </p>
                          <h3 className="mt-2 text-2xl font-black">Relatório de Auditoria</h3>
                          <p className="mt-2 text-xs font-semibold text-white/80">
                            Conferência operacional e financeira • Somente leitura
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-right backdrop-blur-sm">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider text-white/65">Período</p>
                          <p className="mt-1 text-sm font-extrabold">{dateBR(bounds.start)} a {dateBR(bounds.end)}</p>
                          <p className="mt-1 text-[10px] font-semibold text-white/75">{unitLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-[#eceaf4] bg-[#fbfaff] px-7 py-4 sm:px-10">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7e6aa9]">Filtros aplicados</p>
                      <p className="mt-1 text-[11px] font-semibold leading-5 text-[#67728c]">
                        Profissional: <strong className="text-[#31405f]">{professionalFilter}</strong> • Especialidade: <strong className="text-[#31405f]">{specialtyFilter}</strong> • Convênio: <strong className="text-[#31405f]">{convenioFilter}</strong>
                        {search.trim() ? <> • Busca: <strong className="text-[#31405f]">{search.trim()}</strong></> : null}
                      </p>
                    </div>

                    <div className="space-y-8 px-5 py-7 sm:px-10 sm:py-9">
                      {reportTables().tables.map((table, tableIndex) => (
                        <section key={`${table.id}-${table.title}-${tableIndex}`}>
                          <div className="mb-4 flex items-center gap-3">
                            <span className="h-7 w-1.5 rounded-full bg-[#6f46c7]" />
                            <div>
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9a88c1]">Auditoria</p>
                              <h4 className="text-sm font-black text-[#263765]">{table.title}</h4>
                            </div>
                          </div>

                          {table.id === "resumo" && table.title === "Resumo financeiro" ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {table.rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="rounded-2xl border border-[#ebe7f5] bg-gradient-to-br from-white to-[#faf8ff] px-4 py-4 shadow-sm">
                                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#8c94aa]">{row[0]}</p>
                                  <p className="mt-2 break-words text-base font-black text-[#34235f]">{row[1]}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-2xl border border-[#e7e8ef]">
                              <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-left">
                                  <thead className="bg-[#302052] text-white">
                                    <tr>
                                      {table.headers.map((header) => (
                                        <th key={header} className="whitespace-nowrap border-r border-white/10 px-3 py-3 text-[9px] font-extrabold uppercase tracking-wide last:border-r-0">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.rows.length > 0 ? table.rows.map((row, rowIndex) => (
                                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#faf9fd]"}>
                                        {row.map((cell, cellIndex) => (
                                          <td key={cellIndex} className="whitespace-nowrap border-t border-[#ececf2] px-3 py-3 text-[10px] font-semibold text-[#526078]">
                                            {String(cell ?? "")}
                                          </td>
                                        ))}
                                      </tr>
                                    )) : (
                                      <tr>
                                        <td colSpan={table.headers.length} className="px-4 py-8 text-center text-xs font-bold text-[#8b94a8]">
                                          Nenhum registro encontrado no período selecionado.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </section>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceaf4] bg-[#faf9fd] px-7 py-4 sm:px-10">
                      <p className="text-[9px] font-bold text-[#8b94a8]">Relatório gerado pela Auditoria • modo somente leitura</p>
                      <p className="text-[9px] font-extrabold text-[#6f46c7]">Clínica Integrada Entre Afetos</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f5] bg-white px-5 py-4">
                  <Button type="button" variant="outline" onClick={() => setReportPreview(false)}>
                    Voltar
                  </Button>
                  <div className="flex items-center gap-3">
                    <p className="hidden text-[10px] font-semibold text-[#8a94ad] sm:block">
                      Visualização aprovada? Baixe o arquivo.
                    </p>
                    <Button type="button" onClick={generateSelectedReport} className="gap-2">
                      <Download size={16} />
                      Baixar {reportFormat === "pdf" ? "PDF" : "Excel"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function AuditMetric({
  icon:
    Icon,
  label,
  value,
  detail,
}: {
  icon:
    typeof Activity;
  label:
    string;
  value:
    string;
  detail:
    string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9f2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f3ff] text-[#102a78]">
          <Icon
            size={19}
          />
        </div>

        <ReceiptText
          size={16}
          className="text-[#c0c6d4]"
        />
      </div>

      <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wide text-[#8a94ad]">
        {
          label
        }
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#102a78]">
        {
          value
        }
      </p>

      <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
        {
          detail
        }
      </p>
    </div>
  );
}

function AgendaAuditTable({
  appointments,
  chargeByAppointment,
  guideByAppointment,
  lotById,
}: {
  appointments:
    StoredAppointment[];
  chargeByAppointment:
    Map<
      number,
      any
    >;
  guideByAppointment:
    Map<
      number,
      GuiaConvenio
    >;
  lotById:
    Map<
      string,
      LoteConvenio
    >;
}) {
  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = useState<StoredAppointment | null>(
    null
  );

  const selectedCharge =
    selectedAppointment
      ? chargeByAppointment.get(
          selectedAppointment.id
        )
      : undefined;


  const selectedGuide =
    selectedAppointment
      ? guideByAppointment.get(
          selectedAppointment.id
        )
      : undefined;

  const selectedLot =
    selectedGuide?.loteId
      ? lotById.get(
          selectedGuide.loteId
        )
      : undefined;

  function auditSituation(
    item: StoredAppointment
  ) {
    const charge =
      chargeByAppointment.get(
        item.id
      );


    const guide =
      guideByAppointment.get(
        item.id
      );

    if (
      item.status ===
      "Realizado"
    ) {
      if (
        item.billingType ===
          "Particular" &&
        !item.patientPackageId &&
        !charge
      ) {
        return {
          label:
            "Cobrança pendente",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };
      }

      if (
        (item.billingType === "Convênio" || item.convenio) &&
        !guide
      ) {
        return {
          label:
            "Guia pendente",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };
      }

    }

    if (
      charge?.status ===
        "Pago"
    ) {
      return {
        label:
          "Conferido",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    return {
      label:
        "Em conferência",
      className:
        "bg-[#f0f3ff] text-[#41558f] border-[#dfe5fb]",
    };
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[#e7e9f2] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#edf0f5] px-5 py-4">
          <CalendarDays
            size={18}
            className="text-[#102a78]"
          />

          <div>
            <h2 className="text-sm font-extrabold text-[#263765]">
              Conferência da agenda
            </h2>

            <p className="mt-0.5 text-[10px] font-semibold text-[#8a94ad]">
              Somente leitura. A Agenda da Recepção continua sendo a agenda operacional.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1370px] w-full text-left text-xs">
            <thead className="bg-[#f8f9fc] text-[#7e89a4]">
              <tr>
                <th className="px-4 py-3">
                  Data / horário
                </th>
                <th className="px-4 py-3">
                  Paciente
                </th>
                <th className="px-4 py-3">
                  Profissional
                </th>
                <th className="px-4 py-3">
                  Especialidade
                </th>
                <th className="px-4 py-3">
                  Procedimento
                </th>
                <th className="px-4 py-3">
                  Sala
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3">
                  Convênio
                </th>
                <th className="px-4 py-3">
                  Valor
                </th>
                <th className="px-4 py-3">
                  Conferência
                </th>
                <th className="px-4 py-3 text-right">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody>
              {appointments.map(
                (
                  item
                ) => {
                  const charge =
                    chargeByAppointment.get(
                      item.id
                    );


                  const situation =
                    auditSituation(
                      item
                    );

                  return (
                    <tr
                      key={
                        item.id
                      }
                      className="border-t border-[#eef0f5] hover:bg-[#fafbfe]"
                    >
                      <td className="px-4 py-3 font-bold text-[#263765]">
                        {
                          dateBR(
                            item.date
                          )
                        }
                        <span className="ml-2 text-[#8a94ad]">
                          {
                            item.time
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#263765]">
                        {
                          item.patient
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          item.professional
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          item.specialty
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          item.type
                        }
                      </td>
                      <td className="px-4 py-3">
                        {
                          item.room ||
                          "—"
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#f0f3ff] px-2.5 py-1 text-[10px] font-extrabold text-[#41558f]">
                          {
                            item.status
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {
                          item.convenio ||
                          (
                            item.patientPackageId
                              ? "Plano"
                              : "Particular"
                          )
                        }
                      </td>
                      <td className="px-4 py-3 font-extrabold text-[#102a78]">
                        {
                          money(
                            numberValue(
                              charge?.amount ??
                                item.serviceValue
                            )
                          )
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${situation.className}`}
                        >
                          {
                            situation.label
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAppointment(
                              item
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe4f0] bg-white px-3 py-2 text-[10px] font-extrabold text-[#102a78] transition hover:bg-[#f5f7ff]"
                        >
                          <Eye
                            size={14}
                          />
                          Conferir
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}

              {appointments.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      11
                    }
                    className="px-4 py-10 text-center text-xs font-semibold text-[#8a94ad]"
                  >
                    Nenhum atendimento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedAppointment && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#edf0f5] bg-white px-5 py-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8a94ad]">
                  Auditoria do atendimento
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-[#102a78]">
                  {selectedAppointment.patient}
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#7e89a4]">
                  {dateBR(selectedAppointment.date)} • {selectedAppointment.time} • {selectedAppointment.professional}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2e6ef] text-[#68748f] transition hover:bg-[#f6f7fa]"
                aria-label="Fechar conferência"
              >
                <X
                  size={17}
                />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <AuditTrailCard
                  step="1"
                  title="Agenda"
                  status={
                    selectedAppointment.status
                  }
                  detail={`${selectedAppointment.specialty} • ${selectedAppointment.type}`}
                  ok={
                    Boolean(
                      selectedAppointment.id
                    )
                  }
                />

                <AuditTrailCard
                  step="2"
                  title="Cobrança / pagamento"
                  status={
                    selectedAppointment.patientPackageId
                      ? "Sessão de plano/pacote"
                      : selectedCharge
                        ? selectedCharge.status
                        : selectedAppointment.billingType === "Convênio"
                          ? "Produção de convênio"
                          : "Sem cobrança vinculada"
                  }
                  detail={
                    selectedCharge
                      ? `${money(numberValue(selectedCharge.amount))}${selectedCharge.paymentMethod ? ` • ${selectedCharge.paymentMethod}` : ""}`
                      : selectedAppointment.patientPackageId
                        ? selectedAppointment.patientPackageName || "Plano/pacote do paciente"
                        : selectedAppointment.billingType === "Convênio"
                          ? selectedAppointment.convenio || "Convênio não identificado"
                          : "Conferir lançamento financeiro"
                  }
                  ok={
                    Boolean(
                      selectedCharge ||
                      selectedAppointment.patientPackageId ||
                      selectedAppointment.billingType === "Convênio"
                    )
                  }
                />

                <AuditTrailCard
                  step="3"
                  title="Convênio / guia / lote"
                  status={
                    selectedAppointment.billingType === "Convênio" ||
                    selectedAppointment.convenio
                      ? selectedGuide
                        ? selectedGuide.status
                        : "Sem guia vinculada"
                      : "Não se aplica"
                  }
                  detail={
                    selectedAppointment.billingType === "Convênio" ||
                    selectedAppointment.convenio
                      ? selectedGuide
                        ? `${selectedGuide.convenio} • Guia ${selectedGuide.numeroGuia || "sem número"}${selectedLot ? ` • Lote ${selectedLot.competencia}` : selectedGuide.loteId ? " • Lote não localizado" : " • Fora de lote"}`
                        : selectedAppointment.convenio || "Convênio não identificado"
                      : "Atendimento particular ou plano/pacote"
                  }
                  ok={
                    selectedAppointment.billingType === "Convênio" ||
                    selectedAppointment.convenio
                      ? Boolean(selectedGuide) &&
                        (!selectedGuide?.loteId || Boolean(selectedLot))
                      : true
                  }
                />

              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#e7e9f2] bg-[#fbfcff] p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#102a78]">
                    Dados do atendimento
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <AuditDetail label="Paciente" value={selectedAppointment.patient} />
                    <AuditDetail label="Profissional" value={selectedAppointment.professional} />
                    <AuditDetail label="Especialidade" value={selectedAppointment.specialty} />
                    <AuditDetail label="Procedimento" value={selectedAppointment.type} />
                    <AuditDetail label="Sala" value={selectedAppointment.room || "—"} />
                    <AuditDetail label="Status da agenda" value={selectedAppointment.status} />
                    <AuditDetail label="Tipo de cobrança" value={selectedAppointment.billingType || (selectedAppointment.patientPackageId ? "Plano/Pacote" : "Particular")} />
                    <AuditDetail label="Convênio" value={selectedAppointment.convenio || "—"} />
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e7e9f2] bg-[#fbfcff] p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#102a78]">
                    Conferência financeira
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <AuditDetail
                      label="Valor previsto"
                      value={money(
                        numberValue(
                          selectedCharge?.amount ??
                            selectedAppointment.serviceValue
                        )
                      )}
                    />
                    <AuditDetail
                      label="Valor recebido"
                      value={
                        selectedCharge?.status === "Pago"
                          ? money(
                              numberValue(
                                selectedCharge.receivedAmount ??
                                selectedCharge.amount
                              )
                            )
                          : "—"
                      }
                    />
                    <AuditDetail label="Situação da cobrança" value={selectedCharge?.status || (selectedAppointment.patientPackageId ? "Plano/Pacote" : "Sem cobrança")} />
                    <AuditDetail label="Forma de pagamento" value={selectedCharge?.paymentMethod || selectedAppointment.paymentMethod || "—"} />
                    <AuditDetail label="Data do pagamento" value={selectedCharge?.paymentDate ? dateBR(selectedCharge.paymentDate) : "—"} />
                    <AuditDetail label="Conta bancária" value={selectedCharge?.bankAccountName || "—"} />
                  </div>
                </section>
              </div>

              {(
                selectedAppointment.billingType === "Convênio" ||
                selectedAppointment.convenio
              ) && (
                <section className="rounded-2xl border border-[#e7e9f2] bg-[#fbfcff] p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#102a78]">
                    Conferência do convênio
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs md:grid-cols-4">
                    <AuditDetail label="Convênio" value={selectedAppointment.convenio || selectedGuide?.convenio || "—"} />
                    <AuditDetail label="Guia" value={selectedGuide?.numeroGuia || (selectedGuide ? "Sem número" : "Não gerada")} />
                    <AuditDetail label="Status da guia" value={selectedGuide?.status || "—"} />
                    <AuditDetail label="Valor produzido" value={selectedGuide ? money(numberValue(selectedGuide.valorTotal)) : money(numberValue(selectedAppointment.serviceValue))} />
                    <AuditDetail label="Lote" value={selectedLot ? `${selectedLot.competencia} • ${selectedLot.status}` : selectedGuide?.loteId ? "Lote não localizado" : "Fora de lote"} />
                    <AuditDetail label="Data de envio" value={selectedGuide?.dataEnvio ? dateBR(selectedGuide.dataEnvio) : selectedLot?.dataEnvio ? dateBR(selectedLot.dataEnvio) : "—"} />
                    <AuditDetail label="Valor glosado" value={selectedGuide ? money(numberValue(selectedGuide.valorGlosado)) : "—"} />
                    <AuditDetail label="Data de pagamento" value={selectedGuide?.dataPagamento ? dateBR(selectedGuide.dataPagamento) : "—"} />
                  </div>
                </section>
              )}

              <div className="rounded-2xl border border-[#e7e9f2] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#102a78]">
                      Resultado da conferência
                    </h4>
                    <p className="mt-1 text-[11px] font-semibold text-[#8a94ad]">
                      Esta tela é apenas de leitura e não altera Agenda, Financeiro ou Convênios.
                    </p>
                  </div>

                  {(() => {
                    const situation =
                      auditSituation(
                        selectedAppointment
                      );

                    return (
                      <span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${situation.className}`}>
                        {situation.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AuditTrailCard({
  step,
  title,
  status,
  detail,
  ok,
}: {
  step: string;
  title: string;
  status: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold ${ok ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
          {step}
        </span>
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#68748f]">
          {title}
        </p>
      </div>

      <p className={`mt-3 text-sm font-extrabold ${ok ? "text-emerald-800" : "text-amber-800"}`}>
        {status}
      </p>
      <p className={`mt-1 text-[10px] font-semibold ${ok ? "text-emerald-700" : "text-amber-700"}`}>
        {detail}
      </p>
    </div>
  );
}

function AuditDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#9aa3b7]">
        {label}
      </p>
      <p className="mt-1 font-bold text-[#263765]">
        {value}
      </p>
    </div>
  );
}

function FinancialSummaryCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-extrabold text-[#263765]">{title}</h2>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-[#102a78]">{money(value)}</p>
      <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">{detail}</p>
    </section>
  );
}

function FinancialLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#eef0f5] pb-2 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <strong className="text-[#102a78]">{money(value)}</strong>
    </div>
  );
}

function FinancialAuditTables({
  charges,
  expenses,
}: {
  charges: ReturnType<typeof getFinancialCharges>;
  expenses: ReturnType<typeof getFinancialExpenses>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ReceiptText size={18} className="text-[#6f46c7]" />
          <div>
            <h2 className="text-sm font-extrabold text-[#263765]">Cobranças e recebimentos</h2>
            <p className="text-[10px] font-semibold text-[#8a94ad]">Registros financeiros já existentes no sistema.</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-[11px]">
            <thead className="text-[#7e89a4]">
              <tr>
                <th className="pb-2">Data</th>
                <th className="pb-2">Paciente</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2 text-right">Previsto</th>
                <th className="pb-2 text-right">Recebido</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => {
                const received = charge.status === "Pago"
                  ? numberValue(charge.receivedAmount ?? charge.amount)
                  : 0;
                const divergent = charge.status === "Pago" &&
                  Math.abs(received - numberValue(charge.amount)) > 0.01;

                return (
                  <tr key={charge.id} className="border-t border-[#eef0f5]">
                    <td className="py-3 font-semibold text-[#53617f]">{dateBR(charge.paymentDate || charge.paidAt || charge.date)}</td>
                    <td className="py-3 font-bold text-[#263765]">{charge.patient}</td>
                    <td className="py-3 font-semibold text-[#53617f]">{charge.billingType}</td>
                    <td className="py-3 text-right font-bold">{money(charge.amount)}</td>
                    <td className={`py-3 text-right font-extrabold ${divergent ? "text-red-600" : "text-emerald-700"}`}>{money(received)}</td>
                    <td className="py-3 text-right font-bold">{divergent ? "Divergente" : charge.status}</td>
                  </tr>
                );
              })}
              {charges.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-[#8a94ad]">Sem cobranças no período.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BanknoteArrowDown size={18} className="text-red-500" />
          <div>
            <h2 className="text-sm font-extrabold text-[#263765]">Saídas / despesas</h2>
            <p className="text-[10px] font-semibold text-[#8a94ad]">Conferência das despesas já lançadas no Financeiro.</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-[11px]">
            <thead className="text-[#7e89a4]">
              <tr>
                <th className="pb-2">Data</th>
                <th className="pb-2">Descrição</th>
                <th className="pb-2">Categoria</th>
                <th className="pb-2 text-right">Valor</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-[#eef0f5]">
                  <td className="py-3 font-semibold text-[#53617f]">{dateBR(expense.paymentDate || expense.dueDate)}</td>
                  <td className="py-3 font-bold text-[#263765]">{expense.description}</td>
                  <td className="py-3 font-semibold text-[#53617f]">{expense.category || "Sem categoria"}</td>
                  <td className="py-3 text-right font-extrabold text-[#102a78]">{money(expense.status === "Pago" ? (expense.paidAmount ?? expense.amount) : expense.amount)}</td>
                  <td className="py-3 text-right font-bold">{expense.status}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-[#8a94ad]">Sem despesas no período.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SpecialtyTable({
  rows,
  onSelect,
  selectedSpecialty,
}: {
  rows: Array<{
    specialty: string;
    appointments: number;
    particular: number;
    convenio: number;
    charged: number;
    received: number;
  }>;
  onSelect: (specialty: string) => void;
  selectedSpecialty: string | null;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className="text-[#7e89a4]">
          <tr>
            <th className="pb-2">Especialidade</th>
            <th className="pb-2 text-right">Atend.</th>
            <th className="pb-2 text-right">Particular</th>
            <th className="pb-2 text-right">Convênio</th>
            <th className="pb-2 text-right">Valor cobrado</th>
            <th className="pb-2 text-right">Recebido</th>
            <th className="pb-2 text-right">Detalhes</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.specialty}
              className={`border-t border-[#eef0f5] ${
                selectedSpecialty === row.specialty
                  ? "bg-[#faf8ff]"
                  : ""
              }`}
            >
              <td className="py-3 font-bold text-[#263765]">{row.specialty}</td>
              <td className="py-3 text-right font-bold">{row.appointments}</td>
              <td className="py-3 text-right font-bold text-[#53617f]">{row.particular}</td>
              <td className="py-3 text-right font-bold text-[#53617f]">{row.convenio}</td>
              <td className="py-3 text-right font-extrabold text-[#102a78]">{money(row.charged)}</td>
              <td className="py-3 text-right font-extrabold text-emerald-700">{money(row.received)}</td>
              <td className="py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(row.specialty)}
                  className="rounded-lg border border-[#ded7f5] bg-white px-3 py-1.5 text-[10px] font-extrabold text-[#6f46c7] transition hover:bg-[#f8f5ff]"
                >
                  Conferir
                </button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-[#8a94ad]">
                Sem dados no período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SpecialtyProfessionalDetail({
  specialty,
  rows,
  onClose,
}: {
  specialty: string;
  rows: Array<{
    professional: string;
    appointments: number;
    particular: number;
    convenio: number;
    charged: number;
    received: number;
  }>;
  onClose: () => void;
}) {
  const totals = rows.reduce(
    (acc, row) => ({
      appointments: acc.appointments + row.appointments,
      particular: acc.particular + row.particular,
      convenio: acc.convenio + row.convenio,
      charged: acc.charged + row.charged,
      received: acc.received + row.received,
    }),
    {
      appointments: 0,
      particular: 0,
      convenio: 0,
      charged: 0,
      received: 0,
    }
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#ddd4f5] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f5] px-5 py-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a73c8]">
            Detalhamento por profissional
          </p>
          <h2 className="mt-1 text-sm font-extrabold text-[#263765]">{specialty}</h2>
          <p className="mt-1 text-[10px] font-semibold text-[#8a94ad]">
            Conferência consolidada dos profissionais que atenderam nesta especialidade no período filtrado.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#e2e5ee] bg-white px-3 py-2 text-[10px] font-extrabold text-[#64708a] hover:bg-[#f8f9fc]"
        >
          Fechar detalhes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-[#edf0f5] bg-[#fbfbfe] p-4 md:grid-cols-4 xl:grid-cols-5">
        <SpecialtyMiniCard label="Atendimentos" value={String(totals.appointments)} />
        <SpecialtyMiniCard label="Particular" value={String(totals.particular)} />
        <SpecialtyMiniCard label="Convênio" value={String(totals.convenio)} />
        <SpecialtyMiniCard label="Cobrado" value={money(totals.charged)} />
        <SpecialtyMiniCard label="Recebido" value={money(totals.received)} />
      </div>

      <div className="overflow-x-auto p-5">
        <table className="min-w-full text-left text-xs">
          <thead className="text-[#7e89a4]">
            <tr>
              <th className="pb-2">Profissional</th>
              <th className="pb-2 text-right">Atend.</th>
              <th className="pb-2 text-right">Particular</th>
              <th className="pb-2 text-right">Convênio</th>
              <th className="pb-2 text-right">Valor cobrado</th>
              <th className="pb-2 text-right">Recebido</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.professional} className="border-t border-[#eef0f5]">
                <td className="py-3 font-bold text-[#263765]">{row.professional}</td>
                <td className="py-3 text-right font-bold">{row.appointments}</td>
                <td className="py-3 text-right font-bold text-[#53617f]">{row.particular}</td>
                <td className="py-3 text-right font-bold text-[#53617f]">{row.convenio}</td>
                <td className="py-3 text-right font-extrabold text-[#102a78]">{money(row.charged)}</td>
                <td className="py-3 text-right font-extrabold text-emerald-700">{money(row.received)}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8a94ad]">
                  Nenhum profissional encontrado para esta especialidade no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SpecialtyMiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#eceef4] bg-white px-3 py-3">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8a94ad]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#263765]">{value}</p>
    </div>
  );
}

function ConvenioTable({
  rows,
}: {
  rows:
    Array<{
      convenio: string;
      appointments: number;
      produced: number;
      guides: number;
      inLot: number;
      sent: number;
      glosado: number;
      received: number;
      pending: number;
    }>;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className="text-[#7e89a4]">
          <tr>
            <th className="pb-2">Convênio</th>
            <th className="pb-2 text-right">Atend.</th>
            <th className="pb-2 text-right">Produção</th>
            <th className="pb-2 text-right">Guias</th>
            <th className="pb-2 text-right">Em lote</th>
            <th className="pb-2 text-right">Enviado</th>
            <th className="pb-2 text-right">Glosado</th>
            <th className="pb-2 text-right">Recebido</th>
            <th className="pb-2 text-right">Pendente</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.convenio}
              className="border-t border-[#eef0f5]"
            >
              <td className="py-3 font-bold text-[#263765]">
                {row.convenio}
              </td>
              <td className="py-3 text-right font-bold">
                {row.appointments}
              </td>
              <td className="py-3 text-right font-extrabold text-[#102a78]">
                {money(row.produced)}
              </td>
              <td className="py-3 text-right font-bold">
                {row.guides}
              </td>
              <td className="py-3 text-right font-bold">
                {row.inLot}
              </td>
              <td className="py-3 text-right font-bold">
                {row.sent}
              </td>
              <td className="py-3 text-right font-extrabold text-amber-700">
                {money(row.glosado)}
              </td>
              <td className="py-3 text-right font-extrabold text-emerald-700">
                {money(row.received)}
              </td>
              <td className="py-3 text-right font-extrabold text-[#6f46c7]">
                {money(row.pending)}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="py-8 text-center text-[#8a94ad]"
              >
                Sem atendimentos de convênio no período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
