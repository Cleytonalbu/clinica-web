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
  FileWarning,
  HandCoins,
  HeartPulse,
  ReceiptText,
  Search,
  ShieldCheck,
  Stethoscope,
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
  syncProfessionalPayoutsFromAppointments,
} from "@/pages/Financeiro/professionalPayoutStorage";

type AuditTab =
  | "visao"
  | "agenda"
  | "financeiro"
  | "especialidades"
  | "convenios"
  | "repasses"
  | "divergencias";

type PeriodMode =
  | "dia"
  | "semana"
  | "mes"
  | "personalizado";

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

  const payouts =
    useMemo(
      () =>
        syncProfessionalPayoutsFromAppointments()
          .filter(
            (
              payout
            ) =>
              selectedUnitIds.includes(
                payout.unitId
              ) &&
              inPeriod(
                payout.serviceDate,
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

  const charges =
    useMemo(
      () =>
        getFinancialCharges()
          .filter(
            (
              charge
            ) =>
              selectedUnitIds.includes(
                charge.unitId
              ) &&
              inPeriod(
                (
                  charge as any
                ).paymentDate ||
                  charge.date,
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

  const expenses =
    useMemo(
      () =>
        getFinancialExpenses()
          .filter(
            (
              expense
            ) =>
              selectedUnitIds.includes(
                (
                  expense as any
                ).unitId
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
        selectedUnitIds,
        bounds.start,
        bounds.end,
      ]
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

  const payoutByAppointment =
    useMemo(
      () =>
        new Map(
          payouts.map(
            (
              payout
            ) => [
              payout.appointmentId,
              payout,
            ]
          )
        ),
      [
        payouts,
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
            (
              charge as any
            ).paidAmount ??
              (
                charge as any
              ).amount
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

  const totalPayout =
    payouts.reduce(
      (
        sum,
        payout
      ) =>
        sum +
        payout.amount,
      0
    );

  const specialtyRows =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              specialty:
                string;
              appointments:
                number;
              particular:
                number;
              convenio:
                number;
              produced:
                number;
              payout:
                number;
            }
          >();

        realized.forEach(
          (
            item
          ) => {
            const current =
              map.get(
                item.specialty
              ) ?? {
                specialty:
                  item.specialty,
                appointments:
                  0,
                particular:
                  0,
                convenio:
                  0,
                produced:
                  0,
                payout:
                  0,
              };

            current.appointments +=
              1;

            if (
              item.billingType ===
                "Convênio" ||
              item.convenio
            ) {
              current.convenio +=
                1;
            } else {
              current.particular +=
                1;
            }

            const charge =
              chargeByAppointment.get(
                item.id
              );

            current.produced +=
              numberValue(
                (
                  charge as any
                )?.amount ??
                  item.serviceValue
              );

            current.payout +=
              payoutByAppointment.get(
                item.id
              )?.amount ??
              0;

            map.set(
              item.specialty,
              current
            );
          }
        );

        return Array.from(
          map.values()
        ).sort(
          (
            a,
            b
          ) =>
            b.appointments -
            a.appointments
        );
      },
      [
        realized,
        chargeByAppointment,
        payoutByAppointment,
      ]
    );

  const convenioRows =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              convenio:
                string;
              appointments:
                number;
              produced:
                number;
            }
          >();

        convenioAppointments.forEach(
          (
            item
          ) => {
            const name =
              item.convenio ||
              "Convênio não identificado";

            const current =
              map.get(
                name
              ) ?? {
                convenio:
                  name,
                appointments:
                  0,
                produced:
                  0,
              };

            current.appointments +=
              1;

            current.produced +=
              numberValue(
                item.serviceValue
              );

            map.set(
              name,
              current
            );
          }
        );

        return Array.from(
          map.values()
        ).sort(
          (
            a,
            b
          ) =>
            b.appointments -
            a.appointments
        );
      },
      [
        convenioAppointments,
      ]
    );

  const divergences =
    useMemo(
      () => {
        const rows:
          Array<{
            title:
              string;
            detail:
              string;
            level:
              "Alerta" |
              "Atenção";
          }> = [];

        realized.forEach(
          (
            item
          ) => {
            const payout =
              payoutByAppointment.get(
                item.id
              );

            if (
              !payout
            ) {
              rows.push(
                {
                  title:
                    "Atendimento realizado sem repasse",
                  detail:
                    `${item.patient} • ${item.professional} • ${dateBR(item.date)}`,
                  level:
                    "Alerta",
                }
              );
            }

            if (
              item.billingType ===
                "Particular" &&
              !item.patientPackageId &&
              !chargeByAppointment.has(
                item.id
              )
            ) {
              rows.push(
                {
                  title:
                    "Atendimento particular sem cobrança vinculada",
                  detail:
                    `${item.patient} • ${item.specialty} • ${dateBR(item.date)}`,
                  level:
                    "Alerta",
                }
              );
            }

            if (
              item.billingType ===
                "Convênio" &&
              !item.convenio
            ) {
              rows.push(
                {
                  title:
                    "Atendimento de convênio sem convênio identificado",
                  detail:
                    `${item.patient} • ${item.professional} • ${dateBR(item.date)}`,
                  level:
                    "Atenção",
                }
              );
            }
          }
        );

        return rows;
      },
      [
        realized,
        payoutByAppointment,
        chargeByAppointment,
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
      "Repasse",
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

          const payout =
            payoutByAppointment.get(
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
            payout?.amount ??
              0,
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
          "repasses",
        label:
          "Repasses",
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

          <Button
            type="button"
            onClick={
              exportCsv
            }
            className="gap-2"
          >
            <Download
              size={17}
            />

            Baixar relatório
          </Button>
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
                icon={
                  Activity
                }
                label="Atendimentos realizados"
                value={
                  String(
                    realized.length
                  )
                }
                detail={`${filteredAppointments.length} registros no período`}
              />

              <AuditMetric
                icon={
                  ShieldCheck
                }
                label="Atendimentos de convênio"
                value={
                  String(
                    convenioAppointments.length
                  )
                }
                detail={`${convenioRows.length} convênio(s) identificado(s)`}
              />

              <AuditMetric
                icon={
                  BanknoteArrowUp
                }
                label="Entradas de caixa"
                value={
                  money(
                    totalEntries
                  )
                }
                detail="Cobranças registradas como pagas"
              />

              <AuditMetric
                icon={
                  BanknoteArrowDown
                }
                label="Saídas de caixa"
                value={
                  money(
                    totalExpenses
                  )
                }
                detail="Despesas registradas como pagas"
              />

              <AuditMetric
                icon={
                  HandCoins
                }
                label="Repasses"
                value={
                  money(
                    totalPayout
                  )
                }
                detail={`${payouts.length} lançamento(s)`}
              />

              <AuditMetric
                icon={
                  CircleDollarSign
                }
                label="Resultado de caixa"
                value={
                  money(
                    totalEntries -
                      totalExpenses
                  )
                }
                detail="Entradas menos saídas"
              />

              <AuditMetric
                icon={
                  Stethoscope
                }
                label="Especialidades"
                value={
                  String(
                    specialtyRows.length
                  )
                }
                detail="Com atendimento realizado"
              />

              <AuditMetric
                icon={
                  FileWarning
                }
                label="Divergências"
                value={
                  String(
                    divergences.length
                  )
                }
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
            payoutByAppointment={
              payoutByAppointment
            }
          />
        )}

        {tab ===
          "financeiro" && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BanknoteArrowUp
                  size={18}
                  className="text-emerald-600"
                />

                <h2 className="text-sm font-extrabold text-[#263765]">
                  Entradas
                </h2>
              </div>

              <p className="mt-3 text-3xl font-extrabold text-[#102a78]">
                {
                  money(
                    totalEntries
                  )
                }
              </p>

              <p className="mt-1 text-xs font-semibold text-[#8a94ad]">
                {
                  charges.filter(
                    (
                      charge
                    ) =>
                      (
                        charge as any
                      ).status ===
                      "Pago"
                  ).length
                } recebimento(s)
              </p>
            </section>

            <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BanknoteArrowDown
                  size={18}
                  className="text-red-500"
                />

                <h2 className="text-sm font-extrabold text-[#263765]">
                  Saídas
                </h2>
              </div>

              <p className="mt-3 text-3xl font-extrabold text-[#102a78]">
                {
                  money(
                    totalExpenses
                  )
                }
              </p>

              <p className="mt-1 text-xs font-semibold text-[#8a94ad]">
                {
                  expenses.filter(
                    (
                      expense
                    ) =>
                      expense.status ===
                      "Pago"
                  ).length
                } pagamento(s)
              </p>
            </section>
          </div>
        )}

        {tab ===
          "especialidades" && (
          <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#263765]">
              Auditoria por especialidade
            </h2>

            <SpecialtyTable
              rows={
                specialtyRows
              }
            />
          </section>
        )}

        {tab ===
          "convenios" && (
          <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#263765]">
              Atendimentos por convênio
            </h2>

            <ConvenioTable
              rows={
                convenioRows
              }
            />
          </section>
        )}

        {tab ===
          "repasses" && (
          <section className="overflow-hidden rounded-2xl border border-[#e7e9f2] bg-white shadow-sm">
            <div className="border-b border-[#edf0f5] px-5 py-4">
              <h2 className="text-sm font-extrabold text-[#263765]">
                Repasses profissionais
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[#f8f9fc] text-[#7e89a4]">
                  <tr>
                    <th className="px-4 py-3">
                      Data
                    </th>
                    <th className="px-4 py-3">
                      Profissional
                    </th>
                    <th className="px-4 py-3">
                      Especialidade
                    </th>
                    <th className="px-4 py-3">
                      Paciente
                    </th>
                    <th className="px-4 py-3">
                      Repasse
                    </th>
                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payouts.map(
                    (
                      payout
                    ) => (
                      <tr
                        key={
                          payout.id
                        }
                        className="border-t border-[#eef0f5]"
                      >
                        <td className="px-4 py-3 font-semibold text-[#64708a]">
                          {
                            dateBR(
                              payout.serviceDate
                            )
                          }
                        </td>
                        <td className="px-4 py-3 font-bold text-[#263765]">
                          {
                            payout.professional
                          }
                        </td>
                        <td className="px-4 py-3">
                          {
                            payout.specialty
                          }
                        </td>
                        <td className="px-4 py-3">
                          {
                            payout.patient
                          }
                        </td>
                        <td className="px-4 py-3 font-extrabold text-[#102a78]">
                          {
                            money(
                              payout.amount
                            )
                          }
                        </td>
                        <td className="px-4 py-3">
                          {
                            payout.status
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab ===
          "divergencias" && (
          <section className="rounded-2xl border border-[#e7e9f2] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#263765]">
              Alertas da auditoria
            </h2>

            <div className="mt-4 space-y-2">
              {divergences.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                  >
                    <p className="text-xs font-extrabold text-amber-800">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-amber-700">
                      {
                        item.detail
                      }
                    </p>
                  </div>
                )
              )}

              {divergences.length ===
                0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center text-xs font-bold text-emerald-700">
                  Nenhuma divergência automática encontrada neste período.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
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
  payoutByAppointment,
}: {
  appointments:
    StoredAppointment[];
  chargeByAppointment:
    Map<
      number,
      any
    >;
  payoutByAppointment:
    Map<
      number,
      any
    >;
}) {
  return (
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
        <table className="min-w-[1250px] w-full text-left text-xs">
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
                Repasse
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

                const payout =
                  payoutByAppointment.get(
                    item.id
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
                    <td className="px-4 py-3 font-extrabold text-[#6f46c7]">
                      {
                        money(
                          payout?.amount ??
                            0
                        )
                      }
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
                    10
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
  );
}

function SpecialtyTable({
  rows,
}: {
  rows:
    Array<{
      specialty:
        string;
      appointments:
        number;
      particular:
        number;
      convenio:
        number;
      produced:
        number;
      payout:
        number;
    }>;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className="text-[#7e89a4]">
          <tr>
            <th className="pb-2">
              Especialidade
            </th>
            <th className="pb-2 text-right">
              Atend.
            </th>
            <th className="pb-2 text-right">
              Valor
            </th>
            <th className="pb-2 text-right">
              Repasse
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (
              row
            ) => (
              <tr
                key={
                  row.specialty
                }
                className="border-t border-[#eef0f5]"
              >
                <td className="py-3 font-bold text-[#263765]">
                  {
                    row.specialty
                  }
                </td>
                <td className="py-3 text-right font-bold">
                  {
                    row.appointments
                  }
                </td>
                <td className="py-3 text-right font-extrabold text-[#102a78]">
                  {
                    money(
                      row.produced
                    )
                  }
                </td>
                <td className="py-3 text-right font-extrabold text-[#6f46c7]">
                  {
                    money(
                      row.payout
                    )
                  }
                </td>
              </tr>
            )
          )}

          {rows.length ===
            0 && (
            <tr>
              <td
                colSpan={
                  4
                }
                className="py-8 text-center text-[#8a94ad]"
              >
                Sem dados no período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConvenioTable({
  rows,
}: {
  rows:
    Array<{
      convenio:
        string;
      appointments:
        number;
      produced:
        number;
    }>;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <thead className="text-[#7e89a4]">
          <tr>
            <th className="pb-2">
              Convênio
            </th>
            <th className="pb-2 text-right">
              Atendimentos
            </th>
            <th className="pb-2 text-right">
              Produção
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (
              row
            ) => (
              <tr
                key={
                  row.convenio
                }
                className="border-t border-[#eef0f5]"
              >
                <td className="py-3 font-bold text-[#263765]">
                  {
                    row.convenio
                  }
                </td>
                <td className="py-3 text-right font-bold">
                  {
                    row.appointments
                  }
                </td>
                <td className="py-3 text-right font-extrabold text-[#102a78]">
                  {
                    money(
                      row.produced
                    )
                  }
                </td>
              </tr>
            )
          )}

          {rows.length ===
            0 && (
            <tr>
              <td
                colSpan={
                  3
                }
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
