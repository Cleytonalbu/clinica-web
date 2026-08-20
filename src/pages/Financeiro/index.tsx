import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BarChart3,
  CircleDollarSign,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  HandCoins,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getFinancialCharges,
  receiveFinancialCharge,
  type FinancialCharge,
} from "./financeStorage";

import {
  getFinancialExpenses,
  type FinancialExpense,
} from "./expenseStorage";

import {
  formatCurrency,
} from "./financeRules";

import {
  getActivePackagePlansByUnit,
  type PackagePlan,
} from "@/pages/Configuracoes/packagePlanStorage";

import {
  getPatientPackageRemainingSessions,
  getPatientPackageTotalSessions,
  getPatientPackagesByPatient,
  purchasePatientPackage,
  type PatientPackage,
} from "./patientPackageStorage";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  markProfessionalPayoutAsPaid,
  markProfessionalPayoutAsPending,
  syncProfessionalPayoutsFromAppointments,
  type ProfessionalPayout,
} from "./professionalPayoutStorage";

type FinanceView =
  | "receivables"
  | "expenses"
  | "professionalPayouts";


type ReceptionMovementType =
  | "Recebimento"
  | "Saída";

type ReceptionPaymentMethod =
  | "Dinheiro"
  | "Pix"
  | "Cartão de Débito"
  | "Cartão de Crédito"
  | "Transferência"
  | "Outro";

interface ReceptionCashMovement {
  id: number;
  unitId: number;
  type: ReceptionMovementType;
  patientId: number;
  patient: string;
  description: string;
  paymentMethod: ReceptionPaymentMethod;
  amount: number;
  date: string;
  time: string;
  observation?: string;
  chargeId?: number;
  packagePlanId?: number;
  patientPackageId?: number;
  createdAt: string;
}

const RECEPTION_CASH_STORAGE_KEY =
  "entre-afetos-reception-cash-movements";

function getReceptionCashMovements():
  ReceptionCashMovement[] {
  try {
    const raw =
      localStorage.getItem(
        RECEPTION_CASH_STORAGE_KEY
      );

    if (
      !raw
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveReceptionCashMovement(
  movement:
    ReceptionCashMovement
) {
  const current =
    getReceptionCashMovements();

  const next =
    [
      movement,
      ...current,
    ];

  localStorage.setItem(
    RECEPTION_CASH_STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

function deleteReceptionCashMovement(
  id:
    number
) {
  const next =
    getReceptionCashMovements().filter(
      (
        movement
      ) =>
        movement.id !==
        id
    );

  localStorage.setItem(
    RECEPTION_CASH_STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

function getTodayIso() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );
}

function getCurrentTime() {
  return new Date()
    .toLocaleTimeString(
      "pt-BR",
      {
        hour:
          "2-digit",
        minute:
          "2-digit",
      }
    );
}

function parseCurrencyInput(
  value:
    string
) {
  const normalized =
    value
      .replace(
        /\./g,
        ""
      )
      .replace(
        ",",
        "."
      )
      .replace(
        /[^\d.-]/g,
        ""
      );

  const parsed =
    Number(
      normalized
    );

  return Number.isFinite(
    parsed
  )
    ? Math.max(
        parsed,
        0
      )
    : 0;
}

export default function Financeiro() {
  const {
    user,
  } =
    useAuth();

  if (
    user?.profile ===
    "Recepção"
  ) {
    return (
      <FinanceiroRecepcao />
    );
  }

  return (
    <GestorFinanceiro />
  );
}

function FinanceiroRecepcao() {
  const navigate =
    useNavigate();

  const {
    activeUnitId,
  } =
    useUnit();

  const today =
    getTodayIso();

  const packagePlans =
    useMemo(
      () =>
        getActivePackagePlansByUnit(
          activeUnitId
        ),
      [
        activeUnitId,
      ]
    );

  const [
    patientPackages,
    setPatientPackages,
  ] =
    useState<
      PatientPackage[]
    >(
      () =>
        getPatientPackagesByPatient(
          0,
          activeUnitId
        )
    );

  const patients =
    useMemo(
      () =>
        getPatients()
          .filter(
            (
              patient
            ) =>
              patient.status ===
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
      []
    );

  const [
    charges,
    setCharges,
  ] =
    useState<
      FinancialCharge[]
    >(
      () =>
        getFinancialCharges()
    );

  const [
    movements,
    setMovements,
  ] =
    useState<
      ReceptionCashMovement[]
    >(
      () =>
        getReceptionCashMovements()
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      | "novo"
      | "consultar"
    >(
      "novo"
    );

  const [
    movementFilter,
    setMovementFilter,
  ] =
    useState<
      | "Todos"
      | "Recebimentos"
      | "Saídas"
    >(
      "Todos"
    );

  const [
    type,
    setType,
  ] =
    useState<
      ReceptionMovementType
    >(
      "Recebimento"
    );

  const [
    patientId,
    setPatientId,
  ] =
    useState(
      ""
    );

  const [
    chargeId,
    setChargeId,
  ] =
    useState(
      ""
    );

  const [
    packagePlanId,
    setPackagePlanId,
  ] =
    useState(
      ""
    );

  const [
    installments,
    setInstallments,
  ] =
    useState(
      "1"
    );

  const [
    date,
    setDate,
  ] =
    useState(
      today
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      ""
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<
      ReceptionPaymentMethod
    >(
      "Pix"
    );

  const [
    amount,
    setAmount,
  ] =
    useState(
      ""
    );

  const [
    observation,
    setObservation,
  ] =
    useState(
      ""
    );

  const [
    printReceipt,
    setPrintReceipt,
  ] =
    useState(
      true
    );

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (
            patient
          ) =>
            String(
              patient.id
            ) ===
            patientId
        ),
      [
        patients,
        patientId,
      ]
    );

  const unitCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            charge.unitId ===
            activeUnitId
        ),
      [
        charges,
        activeUnitId,
      ]
    );

  const patientPendingCharges =
    useMemo(
      () => {
        if (
          !patientId
        ) {
          return [];
        }

        return unitCharges.filter(
          (
            charge
          ) =>
            charge.patientId ===
              Number(
                patientId
              ) &&
            charge.status ===
              "Pendente"
        );
      },
      [
        patientId,
        unitCharges,
      ]
    );

  const selectedCharge =
    useMemo(
      () =>
        patientPendingCharges.find(
          (
            charge
          ) =>
            String(
              charge.id
            ) ===
            chargeId
        ),
      [
        patientPendingCharges,
        chargeId,
      ]
    );

  const selectedPackagePlan =
    useMemo(
      () =>
        packagePlans.find(
          (
            plan
          ) =>
            String(
              plan.id
            ) ===
            packagePlanId
        ),
      [
        packagePlans,
        packagePlanId,
      ]
    );

  const selectedPatientPackages =
    useMemo(
      () => {
        if (
          !patientId
        ) {
          return [];
        }

        return getPatientPackagesByPatient(
          Number(
            patientId
          ),
          activeUnitId
        );
      },
      [
        patientId,
        activeUnitId,
        patientPackages,
      ]
    );

  useEffect(
    () => {
      setChargeId(
        ""
      );

      setPackagePlanId(
        ""
      );

      setInstallments(
        "1"
      );

      setPatientPackages(
        patientId
          ? getPatientPackagesByPatient(
              Number(
                patientId
              ),
              activeUnitId
            )
          : []
      );

      if (
        type ===
        "Recebimento"
      ) {
        setDescription(
          ""
        );

        setAmount(
          ""
        );
      }
    },
    [
      patientId,
      type,
      activeUnitId,
    ]
  );

  useEffect(
    () => {
      if (
        !selectedCharge ||
        selectedPackagePlan
      ) {
        return;
      }

      setDescription(
        selectedCharge.description ||
          `Atendimento - ${selectedCharge.specialty}`
      );

      setAmount(
        selectedCharge.amount
          .toFixed(
            2
          )
          .replace(
            ".",
            ","
          )
      );

      const method =
        selectedCharge.paymentMethod;

      if (
        method ===
          "Dinheiro" ||
        method ===
          "Pix" ||
        method ===
          "Cartão de Débito" ||
        method ===
          "Cartão de Crédito" ||
        method ===
          "Transferência"
      ) {
        setPaymentMethod(
          method
        );
      }
    },
    [
      selectedCharge,
      selectedPackagePlan,
    ]
  );

  useEffect(
    () => {
      if (
        !selectedPackagePlan
      ) {
        return;
      }

      setChargeId(
        ""
      );

      setDescription(
        `Pacote - ${selectedPackagePlan.name}`
      );

      setAmount(
        selectedPackagePlan.finalValue
          .toFixed(
            2
          )
          .replace(
            ".",
            ","
          )
      );

      setInstallments(
        "1"
      );
    },
    [
      selectedPackagePlan,
    ]
  );

  const unitMovements =
    useMemo(
      () =>
        movements.filter(
          (
            movement
          ) =>
            movement.unitId ===
            activeUnitId
        ),
      [
        movements,
        activeUnitId,
      ]
    );

  const todayMovements =
    useMemo(
      () =>
        unitMovements
          .filter(
            (
              movement
            ) =>
              movement.date ===
              today
          )
          .sort(
            (
              a,
              b
            ) =>
              b.time.localeCompare(
                a.time
              )
          ),
      [
        unitMovements,
        today,
      ]
    );

  const filteredTodayMovements =
    useMemo(
      () =>
        todayMovements.filter(
          (
            movement
          ) => {
            if (
              movementFilter ===
              "Todos"
            ) {
              return true;
            }

            if (
              movementFilter ===
              "Recebimentos"
            ) {
              return (
                movement.type ===
                "Recebimento"
              );
            }

            return (
              movement.type ===
              "Saída"
            );
          }
        ),
      [
        todayMovements,
        movementFilter,
      ]
    );

  const todayEntries =
    todayMovements
      .filter(
        (
          movement
        ) =>
          movement.type ===
          "Recebimento"
      )
      .reduce(
        (
          sum,
          movement
        ) =>
          sum +
          movement.amount,
        0
      );

  const todayOutputs =
    todayMovements
      .filter(
        (
          movement
        ) =>
          movement.type ===
          "Saída"
      )
      .reduce(
        (
          sum,
          movement
        ) =>
          sum +
          movement.amount,
        0
      );

  const todayBalance =
    todayEntries -
    todayOutputs;

  const paymentMethodSummary =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            number
          >();

        todayMovements
          .filter(
            (
              movement
            ) =>
              movement.type ===
              "Recebimento"
          )
          .forEach(
            (
              movement
            ) => {
              grouped.set(
                movement.paymentMethod,
                (
                  grouped.get(
                    movement.paymentMethod
                  ) ??
                  0
                ) +
                  movement.amount
              );
            }
          );

        return Array.from(
          grouped.entries()
        )
          .map(
            (
              [
                method,
                value,
              ]
            ) => ({
              method,
              value,
              percentage:
                todayEntries >
                0
                  ? Math.round(
                      (
                        value /
                        todayEntries
                      ) *
                        100
                    )
                  : 0,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.value -
              a.value
          );
      },
      [
        todayMovements,
        todayEntries,
      ]
    );

  function clearForm() {
    setType(
      "Recebimento"
    );
    setPatientId(
      ""
    );
    setChargeId(
      ""
    );
    setPackagePlanId(
      ""
    );
    setInstallments(
      "1"
    );
    setDate(
      today
    );
    setDescription(
      ""
    );
    setPaymentMethod(
      "Pix"
    );
    setAmount(
      ""
    );
    setObservation(
      ""
    );
    setPrintReceipt(
      true
    );
  }

  function handleSaveMovement() {
    if (
      !selectedPatient
    ) {
      window.alert(
        "Selecione o paciente."
      );

      return;
    }

    const numericAmount =
      parseCurrencyInput(
        amount
      );

    if (
      !description.trim()
    ) {
      window.alert(
        "Informe a descrição do lançamento."
      );

      return;
    }

    if (
      numericAmount <=
      0
    ) {
      window.alert(
        "Informe um valor válido."
      );

      return;
    }

    let purchasedPatientPackageId:
      number |
      undefined;

    if (
      type ===
        "Recebimento" &&
      !selectedCharge &&
      !selectedPackagePlan
    ) {
      window.alert(
        "Selecione uma cobrança avulsa ou um plano/pacote."
      );

      return;
    }

    if (
      type ===
        "Recebimento" &&
      selectedPackagePlan
    ) {
      const installmentCount =
        Math.max(
          Math.trunc(
            Number(
              installments
            ) ||
              1
          ),
          1
        );

      if (
        !selectedPackagePlan.allowInstallments &&
        installmentCount >
          1
      ) {
        window.alert(
          "Este plano não permite parcelamento."
        );

        return;
      }

      if (
        selectedPackagePlan.allowInstallments &&
        installmentCount >
          selectedPackagePlan.maxInstallments
      ) {
        window.alert(
          `Este plano permite no máximo ${selectedPackagePlan.maxInstallments} parcela(s).`
        );

        return;
      }

      const purchasedPackage =
        purchasePatientPackage({
          plan:
            selectedPackagePlan,
        patientId:
          selectedPatient.id,
        patient:
          selectedPatient.nome,
        unitId:
          activeUnitId,
        purchaseDate:
          date,
        paymentMethod,
          installments:
            installmentCount,
        });

      purchasedPatientPackageId =
        purchasedPackage.id;

      setPatientPackages(
        getPatientPackagesByPatient(
          selectedPatient.id,
          activeUnitId
        )
      );
    } else if (
      type ===
        "Recebimento" &&
      selectedCharge
    ) {
      receiveFinancialCharge(
        selectedCharge.id,
        {
          paymentMethod:
            paymentMethod as any,
          receivedAmount:
            numericAmount,
          discount:
            selectedCharge.discount ??
            0,
          surcharge:
            selectedCharge.surcharge ??
            0,
          paymentDate:
            date,
          observation:
            observation.trim(),
        }
      );

      setCharges(
        getFinancialCharges()
      );
    }

    const movement:
      ReceptionCashMovement = {
        id:
          Date.now(),
        unitId:
          activeUnitId,
        type,
        patientId:
          selectedPatient.id,
        patient:
          selectedPatient.nome,
        description:
          description.trim(),
        paymentMethod,
        amount:
          numericAmount,
        date,
        time:
          getCurrentTime(),
        observation:
          observation.trim(),
        chargeId:
          selectedCharge?.id,
        packagePlanId:
          selectedPackagePlan?.id,
        patientPackageId:
          purchasedPatientPackageId,
        createdAt:
          new Date().toISOString(),
      };

    saveReceptionCashMovement(
      movement
    );

    setMovements(
      getReceptionCashMovements()
    );

    if (
      printReceipt &&
      type ===
        "Recebimento"
    ) {
      window.setTimeout(
        () => {
          window.print();
        },
        120
      );
    }

    window.alert(
      type ===
        "Recebimento"
        ? selectedPackagePlan
          ? "Pacote adquirido e recebimento registrado com sucesso."
          : "Recebimento registrado com sucesso."
        : "Saída registrada com sucesso."
    );

    clearForm();
  }

  function handleDeleteMovement(
    movement:
      ReceptionCashMovement
  ) {
    if (
      !window.confirm(
        `Deseja remover o lançamento "${movement.description}" do caixa da recepção?`
      )
    ) {
      return;
    }

    if (
      movement.type ===
        "Recebimento" &&
      movement.chargeId
    ) {
      window.alert(
        "Este recebimento está vinculado à cobrança do paciente e não pode ser excluído pelo caixa. Utilize o histórico financeiro do paciente para ajustes."
      );

      return;
    }

    deleteReceptionCashMovement(
      movement.id
    );

    setMovements(
      getReceptionCashMovements()
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8">
        {/* ========================================= */}
        {/* TÍTULO */}
        {/* ========================================= */}

        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#10235f]">
            Caixa da Clínica
          </h1>

          <p className="mt-1 text-sm font-medium text-[#7d89a8]">
            Registre recebimentos e saídas vinculados aos pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.65fr)_minmax(350px,0.75fr)]">
          {/* ======================================= */}
          {/* COLUNA PRINCIPAL */}
          {/* ======================================= */}

          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#e5e7f1] bg-white shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              {/* ABAS */}

              <div className="flex items-center gap-7 border-b border-[#eceef5] px-5 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "novo"
                    )
                  }
                  className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${
                    activeTab ===
                    "novo"
                      ? "border-[#6744ef] text-[#6744ef]"
                      : "border-transparent text-[#75809d]"
                  }`}
                >
                  Novo lançamento
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "consultar"
                    )
                  }
                  className={`border-b-2 px-1 pb-3 text-sm font-bold transition ${
                    activeTab ===
                    "consultar"
                      ? "border-[#6744ef] text-[#6744ef]"
                      : "border-transparent text-[#75809d]"
                  }`}
                >
                  Consultar lançamentos
                </button>
              </div>

              {activeTab ===
              "novo" ? (
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 xl:grid-cols-2">
                    {/* PACIENTE */}

                    <ReceptionField
                      label="Paciente *"
                    >
                      <select
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
                        className="reception-input"
                      >
                        <option value="">
                          Selecione o paciente...
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
                      </select>
                    </ReceptionField>

                    {/* TIPO */}

                    <ReceptionField
                      label="Tipo de lançamento *"
                    >
                      <select
                        value={
                          type
                        }
                        onChange={(
                          event
                        ) =>
                          setType(
                            event.target.value as ReceptionMovementType
                          )
                        }
                        className="reception-input"
                      >
                        <option value="Recebimento">
                          Recebimento
                        </option>

                        <option value="Saída">
                          Saída do paciente
                        </option>
                      </select>
                    </ReceptionField>

                    {/* PLANO / PACOTE */}

                    {type ===
                      "Recebimento" && (
                      <ReceptionField
                        label="Plano / Pacote"
                      >
                        <select
                          value={
                            packagePlanId
                          }
                          onChange={(
                            event
                          ) => {
                            setPackagePlanId(
                              event.target.value
                            );

                            if (
                              event.target.value
                            ) {
                              setChargeId(
                                ""
                              );
                            }
                          }}
                          disabled={
                            !patientId ||
                            Boolean(
                              selectedPackagePlan
                            )
                          }
                          className="reception-input disabled:cursor-not-allowed disabled:bg-[#f6f7fb]"
                        >
                          <option value="">
                            Avulso — sem pacote
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
                                {plan.name} —{" "}
                                {formatCurrency(
                                  plan.finalValue
                                )}
                              </option>
                            )
                          )}
                        </select>
                      </ReceptionField>
                    )}

                    {/* COBRANÇA */}

                    <ReceptionField
                      label={
                        type ===
                        "Recebimento"
                          ? "Atendimento / cobrança *"
                          : "Atendimento / referência"
                      }
                    >
                      {type ===
                      "Recebimento" ? (
                        <select
                          value={
                            chargeId
                          }
                          onChange={(
                            event
                          ) =>
                            setChargeId(
                              event.target.value
                            )
                          }
                          disabled={
                            !patientId
                          }
                          className="reception-input disabled:cursor-not-allowed disabled:bg-[#f6f7fb]"
                        >
                          <option value="">
                            {selectedPackagePlan
                              ? "Cobrança avulsa desativada pelo pacote"
                              : patientId
                                ? "Selecione a cobrança..."
                                : "Selecione primeiro o paciente..."}
                          </option>

                          {patientPendingCharges.map(
                            (
                              charge
                            ) => (
                              <option
                                key={
                                  charge.id
                                }
                                value={
                                  charge.id
                                }
                              >
                                {charge.specialty} —{" "}
                                {formatDate(
                                  charge.date
                                )} —{" "}
                                {formatCurrency(
                                  charge.amount
                                )}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          value={
                            description
                          }
                          onChange={(
                            event
                          ) =>
                            setDescription(
                              event.target.value
                            )
                          }
                          placeholder="Ex.: Estorno, devolução..."
                          className="reception-input"
                        />
                      )}
                    </ReceptionField>

                    {/* DATA */}

                    <ReceptionField
                      label="Data do lançamento *"
                    >
                      <input
                        type="date"
                        value={
                          date
                        }
                        onChange={(
                          event
                        ) =>
                          setDate(
                            event.target.value
                          )
                        }
                        className="reception-input"
                      />
                    </ReceptionField>

                    {/* DESCRIÇÃO */}

                    <ReceptionField
                      label="Descrição *"
                    >
                      <input
                        value={
                          description
                        }
                        onChange={(
                          event
                        ) =>
                          setDescription(
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Consulta - Psicologia"
                        readOnly={
                          Boolean(
                            selectedPackagePlan
                          )
                        }
                        className={`reception-input ${
                          selectedPackagePlan
                            ? "bg-[#f7f6ff] font-semibold text-[#6744ef]"
                            : ""
                        }`}
                      />
                    </ReceptionField>

                    {/* PAGAMENTO */}

                    <ReceptionField
                      label="Forma de pagamento *"
                    >
                      <select
                        value={
                          paymentMethod
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentMethod(
                            event.target.value as ReceptionPaymentMethod
                          )
                        }
                        className="reception-input"
                      >
                        <option value="Pix">
                          PIX
                        </option>

                        <option value="Dinheiro">
                          Dinheiro
                        </option>

                        <option value="Cartão de Débito">
                          Cartão de Débito
                        </option>

                        <option value="Cartão de Crédito">
                          Cartão de Crédito
                        </option>

                        <option value="Transferência">
                          Transferência
                        </option>

                        <option value="Outro">
                          Outro
                        </option>
                      </select>
                    </ReceptionField>

                    {/* VALOR */}

                    <ReceptionField
                      label="Valor *"
                    >
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8791aa]">
                          R$
                        </span>

                        <input
                          value={
                            amount
                          }
                          onChange={(
                            event
                          ) =>
                            setAmount(
                              event.target.value
                            )
                          }
                          placeholder="0,00"
                          readOnly={
                            Boolean(
                              selectedPackagePlan
                            )
                          }
                          className={`reception-input pl-10 ${
                            selectedPackagePlan
                              ? "bg-[#f7f6ff] font-bold text-[#6744ef]"
                              : ""
                          }`}
                        />
                      </div>
                    </ReceptionField>

                    {/* RESUMO DO PACOTE */}

                    {type ===
                      "Recebimento" &&
                      selectedPackagePlan && (
                        <div className="xl:col-span-2 rounded-xl border border-[#e3dcff] bg-[#faf8ff] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7d6ad1]">
                                Pacote selecionado
                              </p>

                              <h3 className="mt-1 text-sm font-extrabold text-[#38277c]">
                                {
                                  selectedPackagePlan.name
                                }
                              </h3>

                              <p className="mt-2 text-[11px] text-[#7a7395]">
                                {selectedPackagePlan.items
                                  .map(
                                    (
                                      item
                                    ) =>
                                      `${item.sessions}x ${item.specialty}`
                                  )
                                  .join(
                                    " • "
                                  )}
                              </p>
                            </div>

                            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#6744ef] shadow-sm">
                              {selectedPackagePlan.items.reduce(
                                (
                                  total,
                                  item
                                ) =>
                                  total +
                                  item.sessions,
                                0
                              )}{" "}
                              sessões
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                            <PackageSummaryValue
                              label="Valor normal"
                              value={
                                formatCurrency(
                                  selectedPackagePlan.originalValue
                                )
                              }
                            />

                            <PackageSummaryValue
                              label="Desconto"
                              value={
                                formatCurrency(
                                  Math.max(
                                    selectedPackagePlan.originalValue -
                                      selectedPackagePlan.finalValue,
                                    0
                                  )
                                )
                              }
                            />

                            <PackageSummaryValue
                              label="Valor do pacote"
                              value={
                                formatCurrency(
                                  selectedPackagePlan.finalValue
                                )
                              }
                              highlight
                            />

                            <PackageSummaryValue
                              label="Validade"
                              value={`${selectedPackagePlan.validityDays} dias`}
                            />
                          </div>

                          {selectedPackagePlan.allowInstallments && (
                            <div className="mt-4 max-w-[230px]">
                              <ReceptionField
                                label={`Parcelamento — até ${selectedPackagePlan.maxInstallments}x`}
                              >
                                <select
                                  value={
                                    installments
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setInstallments(
                                      event.target.value
                                    )
                                  }
                                  className="reception-input"
                                >
                                  {Array.from(
                                    {
                                      length:
                                        selectedPackagePlan.maxInstallments,
                                    },
                                    (
                                      _,
                                      index
                                    ) =>
                                      index +
                                      1
                                  ).map(
                                    (
                                      quantity
                                    ) => (
                                      <option
                                        key={
                                          quantity
                                        }
                                        value={
                                          quantity
                                        }
                                      >
                                        {quantity}x de{" "}
                                        {formatCurrency(
                                          selectedPackagePlan.finalValue /
                                            quantity
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>
                              </ReceptionField>
                            </div>
                          )}
                        </div>
                      )}

                    {/* OBSERVAÇÃO */}

                    <ReceptionField
                      label="Observação"
                    >
                      <textarea
                        value={
                          observation
                        }
                        onChange={(
                          event
                        ) =>
                          setObservation(
                            event.target.value
                          )
                        }
                        placeholder="Observação (opcional)..."
                        rows={
                          3
                        }
                        className="reception-input min-h-[82px] resize-none py-3"
                      />
                    </ReceptionField>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 border-t border-[#eef0f5] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#66718f]">
                      <input
                        type="checkbox"
                        checked={
                          printReceipt
                        }
                        onChange={(
                          event
                        ) =>
                          setPrintReceipt(
                            event.target.checked
                          )
                        }
                        disabled={
                          type ===
                          "Saída"
                        }
                        className="h-4 w-4 accent-[#6744ef]"
                      />

                      Imprimir recibo
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={
                          clearForm
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dfe3ed] bg-white px-4 text-xs font-bold text-[#65708e] hover:bg-[#f8f8fb]"
                      >
                        <RotateCcw
                          size={15}
                        />

                        Limpar
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSaveMovement
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-4 text-xs font-bold text-white shadow-[0_7px_18px_rgba(103,66,246,0.20)]"
                      >
                        <Save
                          size={15}
                        />

                        Salvar lançamento
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ReceptionMovementsTable
                  movements={
                    unitMovements
                  }
                  onDelete={
                    handleDeleteMovement
                  }
                  showDate
                />
              )}
            </section>

            {/* MOVIMENTAÇÕES DO DIA */}

            <section className="overflow-hidden rounded-2xl border border-[#e5e7f1] bg-white shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              <div className="flex flex-col gap-3 border-b border-[#eceef5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-extrabold text-[#172756]">
                    Movimentações do dia
                  </h2>

                  <div className="mt-3 flex gap-5">
                    {(
                      [
                        "Todos",
                        "Recebimentos",
                        "Saídas",
                      ] as const
                    ).map(
                      (
                        item
                      ) => (
                        <button
                          key={
                            item
                          }
                          type="button"
                          onClick={() =>
                            setMovementFilter(
                              item
                            )
                          }
                          className={`border-b-2 pb-2 text-[11px] font-bold ${
                            movementFilter ===
                            item
                              ? "border-[#6744ef] text-[#6744ef]"
                              : "border-transparent text-[#7e88a4]"
                          }`}
                        >
                          {
                            item
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <ReceptionMovementsTable
                movements={
                  filteredTodayMovements
                }
                onDelete={
                  handleDeleteMovement
                }
              />
            </section>

            {/* RESUMO DO CAIXA */}

            <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              <h2 className="text-[15px] font-extrabold text-[#172756]">
                Resumo do caixa
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <CashSummaryBox
                  title="Entradas do dia"
                  value={
                    formatCurrency(
                      todayEntries
                    )
                  }
                  tone="green"
                />

                <CashSummaryBox
                  title="Saídas do dia"
                  value={
                    formatCurrency(
                      todayOutputs
                    )
                  }
                  tone="red"
                />

                <CashSummaryBox
                  title="Saldo do dia"
                  value={
                    formatCurrency(
                      todayBalance
                    )
                  }
                  tone="purple"
                />
              </div>
            </section>
          </div>

          {/* ======================================= */}
          {/* LATERAL */}
          {/* ======================================= */}

          <aside className="space-y-4">
            {/* CAIXA DO DIA */}

            <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-[#6041e8]"
                />

                <h2 className="text-[15px] font-extrabold text-[#172756]">
                  Caixa do dia
                </h2>
              </div>

              <p className="mt-2 text-[11px] font-medium text-[#818ca6]">
                Data:{" "}
                {formatDate(
                  today
                )}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <SideCashValue
                  label="Entradas"
                  value={
                    formatCurrency(
                      todayEntries
                    )
                  }
                  tone="green"
                />

                <SideCashValue
                  label="Saídas"
                  value={
                    formatCurrency(
                      todayOutputs
                    )
                  }
                  tone="red"
                />

                <SideCashValue
                  label="Total do dia"
                  value={
                    formatCurrency(
                      todayBalance
                    )
                  }
                  tone="purple"
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#dcd4ff] bg-[#faf8ff] py-2.5 text-[11px] font-bold text-[#6744ef]">
                <CheckCircle2
                  size={14}
                />

                Caixa em acompanhamento
              </div>
            </section>

            {/* PACOTES DO PACIENTE */}

            {patientId && (
              <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-extrabold text-[#172756]">
                      Pacotes do paciente
                    </h2>

                    <p className="mt-1 text-[10px] text-[#8f98ae]">
                      Sessões contratadas e disponíveis
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-extrabold text-[#6744ef]">
                    {
                      selectedPatientPackages.filter(
                        (
                          item
                        ) =>
                          item.status ===
                          "Ativo"
                      ).length
                    }{" "}
                    ativo(s)
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {selectedPatientPackages.length >
                  0 ? (
                    selectedPatientPackages.map(
                      (
                        item
                      ) => {
                        const total =
                          getPatientPackageTotalSessions(
                            item
                          );

                        const remaining =
                          getPatientPackageRemainingSessions(
                            item
                          );

                        const used =
                          Math.max(
                            total -
                              remaining,
                            0
                          );

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="rounded-xl border border-[#ece9f8] bg-[#fcfbff] p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-extrabold text-[#495576]">
                                  {
                                    item.planName
                                  }
                                </p>

                                <p className="mt-1 text-[9px] text-[#969eb2]">
                                  Válido até{" "}
                                  {formatDate(
                                    item.validUntil
                                  )}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                                  item.status ===
                                  "Ativo"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : item.status ===
                                        "Finalizado"
                                      ? "bg-violet-50 text-violet-700"
                                      : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {
                                  item.status
                                }
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <PackageMiniValue
                                label="Contratadas"
                                value={
                                  total
                                }
                              />

                              <PackageMiniValue
                                label="Utilizadas"
                                value={
                                  used
                                }
                              />

                              <PackageMiniValue
                                label="Disponíveis"
                                value={
                                  remaining
                                }
                                highlight
                              />
                            </div>

                            <div className="mt-3 space-y-1.5">
                              {item.items.map(
                                (
                                  packageItem
                                ) => (
                                  <div
                                    key={
                                      packageItem.specialty
                                    }
                                    className="flex items-center justify-between gap-3 text-[9px]"
                                  >
                                    <span className="truncate font-semibold text-[#78829b]">
                                      {
                                        packageItem.specialty
                                      }
                                    </span>

                                    <span className="shrink-0 font-bold text-[#55617f]">
                                      {Math.max(
                                        packageItem.totalSessions -
                                          packageItem.usedSessions,
                                        0
                                      )}
                                      /
                                      {
                                        packageItem.totalSessions
                                      }
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="py-5 text-center text-xs text-[#9aa3b8]">
                      Este paciente ainda não possui pacotes.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* FORMAS DE PAGAMENTO */}

            <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              <div className="flex items-center gap-2">
                <CreditCard
                  size={17}
                  className="text-[#6041e8]"
                />

                <h2 className="text-[15px] font-extrabold text-[#172756]">
                  Formas de pagamento
                </h2>
              </div>

              <div className="mt-3 divide-y divide-[#eef0f5]">
                {paymentMethodSummary.length >
                0 ? (
                  paymentMethodSummary.map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.method
                        }
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-[#56617f]">
                            {
                              item.method
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <span className="text-[11px] font-extrabold text-[#344266]">
                            {formatCurrency(
                              item.value
                            )}
                          </span>

                          <span className="rounded-full bg-[#eaf9f2] px-2 py-1 text-[9px] font-bold text-[#1e9b6e]">
                            {
                              item.percentage
                            }
                            %
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="py-6 text-center text-xs text-[#9aa3b8]">
                    Nenhum recebimento hoje.
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-[#eef0f5] pt-3 text-xs">
                <span className="font-bold text-[#596581]">
                  Total de entradas
                </span>

                <span className="font-extrabold text-[#172756]">
                  {formatCurrency(
                    todayEntries
                  )}
                </span>
              </div>
            </section>

            {/* ÚLTIMOS LANÇAMENTOS */}

            <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
              <div className="flex items-center gap-2">
                <Clock3
                  size={17}
                  className="text-[#6041e8]"
                />

                <h2 className="text-[15px] font-extrabold text-[#172756]">
                  Últimos lançamentos
                </h2>
              </div>

              <div className="mt-3 divide-y divide-[#eef0f5]">
                {unitMovements
                  .slice(
                    0,
                    6
                  )
                  .map(
                    (
                      movement
                    ) => (
                      <div
                        key={
                          movement.id
                        }
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-[#455174]">
                            {
                              movement.description
                            }
                          </p>

                          <p className="mt-1 truncate text-[9px] text-[#9aa3b8]">
                            {
                              movement.patient
                            }{" "}
                            •{" "}
                            {
                              movement.time
                            }
                          </p>
                        </div>

                        <span
                          className={`shrink-0 text-[11px] font-extrabold ${
                            movement.type ===
                            "Recebimento"
                              ? "text-[#1aa171]"
                              : "text-[#e55367]"
                          }`}
                        >
                          {movement.type ===
                          "Recebimento"
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            movement.amount
                          )}
                        </span>
                      </div>
                    )
                  )}

                {unitMovements.length ===
                  0 && (
                  <p className="py-6 text-center text-xs text-[#9aa3b8]">
                    Nenhum lançamento registrado.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "consultar"
                  )
                }
                className="mt-3 text-[11px] font-bold text-[#6744ef]"
              >
                Ver todos os lançamentos
              </button>
            </section>
          </aside>
        </div>

        <style>{`
          .reception-input {
            width: 100%;
            min-height: 42px;
            border: 1px solid #e0e4ee;
            border-radius: 9px;
            background: #ffffff;
            padding: 0 12px;
            color: #3f4c70;
            font-size: 12px;
            font-weight: 500;
            outline: none;
            transition:
              border-color 0.15s ease,
              box-shadow 0.15s ease;
          }

          .reception-input:focus {
            border-color: #8066ee;
            box-shadow: 0 0 0 3px rgba(103, 68, 239, 0.08);
          }

          @media print {
            aside,
            nav,
            header,
            button,
            input[type="checkbox"] {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function ReceptionField({
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
      <span className="mb-1.5 block text-[11px] font-bold text-[#62708f]">
        {label}
      </span>

      {children}
    </label>
  );
}

function ReceptionMovementsTable({
  movements,
  onDelete,
  showDate = false,
}: {
  movements:
    ReceptionCashMovement[];
  onDelete:
    (
      movement:
        ReceptionCashMovement
    ) => void;
  showDate?:
    boolean;
}) {
  if (
    movements.length ===
    0
  ) {
    return (
      <div className="px-5 py-10 text-center">
        <ReceiptText
          size={30}
          className="mx-auto text-[#d4d8e5]"
        />

        <p className="mt-3 text-sm font-bold text-[#687493]">
          Nenhum lançamento encontrado
        </p>

        <p className="mt-1 text-xs text-[#9aa3b8]">
          Os recebimentos e saídas registrados aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px]">
        <thead>
          <tr className="border-b border-[#e9ecf4] bg-[#fbfbfe] text-left">
            <TableHeader>
              Hora
            </TableHeader>

            {showDate && (
              <TableHeader>
                Data
              </TableHeader>
            )}

            <TableHeader>
              Tipo
            </TableHeader>

            <TableHeader>
              Descrição
            </TableHeader>

            <TableHeader>
              Paciente
            </TableHeader>

            <TableHeader>
              Forma pgto.
            </TableHeader>

            <TableHeader>
              Valor
            </TableHeader>

            <TableHeader>
              Ações
            </TableHeader>
          </tr>
        </thead>

        <tbody>
          {movements.map(
            (
              movement
            ) => (
              <tr
                key={
                  movement.id
                }
                className="border-b border-[#eef0f5] last:border-b-0 hover:bg-[#fcfbff]"
              >
                <TableCell>
                  {
                    movement.time
                  }
                </TableCell>

                {showDate && (
                  <TableCell>
                    {formatDate(
                      movement.date
                    )}
                  </TableCell>
                )}

                <TableCell>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      movement.type ===
                      "Recebimento"
                        ? "bg-[#eaf9f2] text-[#1d9e70]"
                        : "bg-[#fff0f2] text-[#e14e63]"
                    }`}
                  >
                    {
                      movement.type
                    }
                  </span>
                </TableCell>

                <TableCell>
                  <p className="font-semibold text-[#455174]">
                    {
                      movement.description
                    }
                  </p>
                </TableCell>

                <TableCell>
                  {
                    movement.patient
                  }
                </TableCell>

                <TableCell>
                  <span className="rounded-md bg-[#f1efff] px-2 py-1 text-[10px] font-bold text-[#6744ef]">
                    {
                      movement.paymentMethod
                    }
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    className={`font-extrabold ${
                      movement.type ===
                      "Recebimento"
                        ? "text-[#1aa171]"
                        : "text-[#e55367]"
                    }`}
                  >
                    {movement.type ===
                    "Recebimento"
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      movement.amount
                    )}
                  </span>
                </TableCell>

                <TableCell>
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        movement
                      )
                    }
                    className="text-[10px] font-bold text-[#8a93aa] hover:text-red-500"
                  >
                    Remover
                  </button>
                </TableCell>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function PackageSummaryValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e8e3fa] bg-white px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#9a93b3]">
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-extrabold ${
          highlight
            ? "text-[#6744ef]"
            : "text-[#4f5976]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PackageMiniValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white px-2 py-2 text-center">
      <p className="text-[8px] font-bold text-[#a0a7b8]">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-extrabold ${
          highlight
            ? "text-[#6744ef]"
            : "text-[#55617f]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CashSummaryBox({
  title,
  value,
  tone,
}: {
  title:
    string;
  value:
    string;
  tone:
    | "green"
    | "red"
    | "purple";
}) {
  const styles = {
    green:
      "border-[#d9f2e7] bg-[#f7fdfa] text-[#19996c]",
    red:
      "border-[#fde1e5] bg-[#fffafb] text-[#df4f65]",
    purple:
      "border-[#e8e1ff] bg-[#fbf9ff] text-[#6744ef]",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[tone]}`}
    >
      <p className="text-[10px] font-bold opacity-70">
        {title}
      </p>

      <p className="mt-2 text-lg font-extrabold">
        {value}
      </p>
    </div>
  );
}

function SideCashValue({
  label,
  value,
  tone,
}: {
  label:
    string;
  value:
    string;
  tone:
    | "green"
    | "red"
    | "purple";
}) {
  const styles = {
    green:
      "text-[#19996c]",
    red:
      "text-[#df4f65]",
    purple:
      "text-[#6744ef]",
  };

  return (
    <div className="rounded-xl border border-[#e7e9f2] bg-[#fdfdff] px-2 py-3 text-center">
      <p className="text-[9px] font-bold text-[#8f98ae]">
        {label}
      </p>

      <p
        className={`mt-2 text-[12px] font-extrabold ${styles[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

function GestorFinanceiro() {
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
    useState<FinanceView>(
      "receivables"
    );

  const [
    charges,
  ] =
    useState<
      FinancialCharge[]
    >(
      () =>
        getFinancialCharges()
    );

  const [
    expenses,
  ] =
    useState<
      FinancialExpense[]
    >(
      () =>
        getFinancialExpenses()
    );

  const [
    payouts,
    setPayouts,
  ] =
    useState<
      ProfessionalPayout[]
    >(
      () =>
        syncProfessionalPayoutsFromAppointments()
    );

  const unitCharges =
    useMemo(
      () =>
        charges.filter(
          (
            charge
          ) =>
            charge.unitId ===
            activeUnitId
        ),
      [
        charges,
        activeUnitId,
      ]
    );

  const unitExpenses =
    useMemo(
      () =>
        expenses.filter(
          (
            expense
          ) =>
            expense.unitId ===
            activeUnitId
        ),
      [
        expenses,
        activeUnitId,
      ]
    );

  const unitPayouts =
    useMemo(
      () =>
        payouts.filter(
          (
            payout
          ) =>
            payout.unitId ===
            activeUnitId
        ),
      [
        payouts,
        activeUnitId,
      ]
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState(
      "Todos"
    );

  const [
    billingType,
    setBillingType,
  ] =
    useState(
      "Todos"
    );

  const filteredCharges =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return unitCharges.filter(
          (
            charge
          ) => {
            const matchesSearch =
              !term ||
              charge.patient
                .toLowerCase()
                .includes(
                  term
                ) ||
              charge.professional
                .toLowerCase()
                .includes(
                  term
                ) ||
              charge.specialty
                .toLowerCase()
                .includes(
                  term
                );

            const matchesStatus =
              status ===
                "Todos" ||
              charge.status ===
                status;

            const matchesBilling =
              billingType ===
                "Todos" ||
              charge.billingType ===
                billingType;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesBilling
            );
          }
        );
      },
      [
        unitCharges,
        search,
        status,
        billingType,
      ]
    );

  const filteredExpenses =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return unitExpenses.filter(
          (
            expense
          ) => {
            const matchesSearch =
              !term ||
              expense.description
                .toLowerCase()
                .includes(
                  term
                ) ||
              expense.supplier
                .toLowerCase()
                .includes(
                  term
                ) ||
              expense.category
                .toLowerCase()
                .includes(
                  term
                );

            const matchesStatus =
              status ===
                "Todos" ||
              expense.status ===
                status;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        unitExpenses,
        search,
        status,
      ]
    );

  const filteredPayouts =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return unitPayouts.filter(
          (
            payout
          ) => {
            const matchesSearch =
              !term ||
              payout.professional
                .toLowerCase()
                .includes(
                  term
                ) ||
              payout.patient
                .toLowerCase()
                .includes(
                  term
                ) ||
              payout.specialty
                .toLowerCase()
                .includes(
                  term
                );

            const matchesStatus =
              status ===
                "Todos" ||
              payout.status ===
                status;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        unitPayouts,
        search,
        status,
      ]
    );

  const payoutGroups =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            {
              professional: string;
              specialty: string;
              appointments: number;
              total: number;
              paid: number;
              pending: number;
            }
          >();

        unitPayouts.forEach(
          (
            payout
          ) => {
            const key =
              `${payout.professional}__${payout.specialty}`;

            const current =
              grouped.get(
                key
              ) ?? {
                professional:
                  payout.professional,
                specialty:
                  payout.specialty,
                appointments:
                  0,
                total:
                  0,
                paid:
                  0,
                pending:
                  0,
              };

            current.appointments += 1;
            current.total += payout.amount;

            if (
              payout.status ===
              "Pago"
            ) {
              current.paid += payout.amount;
            } else {
              current.pending += payout.amount;
            }

            grouped.set(
              key,
              current
            );
          }
        );

        return Array.from(
          grouped.values()
        ).sort(
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
        unitPayouts,
      ]
    );

  const totalPayouts =
    unitPayouts.reduce(
      (
        sum,
        payout
      ) =>
        sum +
        payout.amount,
      0
    );

  const paidPayouts =
    unitPayouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pago"
      )
      .reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

  const pendingPayouts =
    unitPayouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      )
      .reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

  const validCharges =
    unitCharges.filter(
      (
        charge
      ) =>
        charge.status !==
        "Cancelado"
    );

  const totalRevenue =
    validCharges.reduce(
      (
        sum,
        charge
      ) =>
        sum +
        charge.amount,
      0
    );

  const pendingRevenue =
    unitCharges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pendente"
      )
      .reduce(
        (
          sum,
          charge
        ) =>
          sum +
          charge.amount,
        0
      );

  const receivedRevenue =
    unitCharges
      .filter(
        (
          charge
        ) =>
          charge.status ===
          "Pago"
      )
      .reduce(
        (
          sum,
          charge
        ) =>
          sum +
          (
            charge.receivedAmount ??
            charge.amount
          ),
        0
      );

  const validExpenses =
    unitExpenses.filter(
      (
        expense
      ) =>
        expense.status !==
        "Cancelado"
    );

  const totalExpenses =
    validExpenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        expense.amount,
      0
    );

  const pendingExpenses =
    unitExpenses
      .filter(
        (
          expense
        ) =>
          expense.status ===
          "Pendente"
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          expense.amount,
        0
      );

  const paidExpenses =
    unitExpenses
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
          (
            expense.paidAmount ??
            expense.amount
          ),
        0
      );

  const netResult =
    receivedRevenue -
    paidExpenses -
    paidPayouts;

  function handleViewChange(
    nextView:
      FinanceView
  ) {
    setView(
      nextView
    );

    setSearch(
      ""
    );

    setStatus(
      "Todos"
    );

    setBillingType(
      "Todos"
    );
  }

  function handlePayPayout(
    payoutId:
      string
  ) {
    const confirmed =
      window.confirm(
        "Confirmar pagamento deste repasse ao profissional?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    markProfessionalPayoutAsPaid(
      payoutId
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function handleReopenPayout(
    payoutId:
      string
  ) {
    const confirmed =
      window.confirm(
        "Deseja voltar este repasse para pendente?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    markProfessionalPayoutAsPending(
      payoutId
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }

  function handlePayAllProfessionalPayouts(
    professional:
      string,
    specialty:
      string
  ) {
    const pending =
      payouts.filter(
        (
          payout
        ) =>
          payout.professional ===
            professional &&
          payout.specialty ===
            specialty &&
          payout.status ===
            "Pendente"
      );

    if (
      pending.length ===
      0
    ) {
      return;
    }

    const total =
      pending.reduce(
        (
          sum,
          payout
        ) =>
          sum +
          payout.amount,
        0
      );

    const confirmed =
      window.confirm(
        `Confirmar pagamento de ${formatCurrency(total)} para ${professional}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    pending.forEach(
      (
        payout
      ) =>
        markProfessionalPayoutAsPaid(
          payout.id
        )
    );

    setPayouts(
      syncProfessionalPayoutsFromAppointments()
    );
  }


  const expenseCategoryData =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            number
          >();

        unitExpenses
          .filter(
            (expense) =>
              expense.status !==
              "Cancelado"
          )
          .forEach(
            (expense) => {
              grouped.set(
                expense.category,
                (
                  grouped.get(
                    expense.category
                  ) ?? 0
                ) +
                  expense.amount
              );
            }
          );

        const palette = [
          "#6d48f5",
          "#3b82f6",
          "#20b983",
          "#f4a62a",
          "#9aa4b7",
          "#ec5b72",
        ];

        return Array.from(
          grouped.entries()
        )
          .sort(
            (
              a,
              b
            ) =>
              b[1] -
              a[1]
          )
          .slice(
            0,
            6
          )
          .map(
            (
              [
                name,
                value,
              ],
              index
            ) => ({
              name,
              value,
              color:
                palette[
                  index %
                    palette.length
                ],
            })
          );
      },
      [
        unitExpenses,
      ]
    );

  const expenseCategoryTotal =
    expenseCategoryData.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.value,
      0
    );

  const expenseDonutBackground =
    expenseCategoryTotal >
    0
      ? (() => {
          let current =
            0;

          const segments =
            expenseCategoryData.map(
              (
                item
              ) => {
                const start =
                  current;

                const portion =
                  (
                    item.value /
                    expenseCategoryTotal
                  ) *
                  100;

                current +=
                  portion;

                return `${item.color} ${start}% ${current}%`;
              }
            );

          return `conic-gradient(${segments.join(
            ", "
          )})`;
        })()
      : "conic-gradient(#eef0f6 0% 100%)";

  const recentExpenses =
    useMemo(
      () =>
        [
          ...unitExpenses,
        ]
          .filter(
            (expense) =>
              expense.status !==
              "Cancelado"
          )
          .sort(
            (
              a,
              b
            ) =>
              a.dueDate.localeCompare(
                b.dueDate
              )
          )
          .slice(
            0,
            5
          ),
      [
        unitExpenses,
      ]
    );

  const monthlyFinancialData =
    useMemo(
      () => {
        const now =
          new Date();

        return Array.from(
          {
            length:
              6,
          },
          (
            _,
            reverseIndex
          ) => {
            const offset =
              5 -
              reverseIndex;

            const date =
              new Date(
                now.getFullYear(),
                now.getMonth() -
                  offset,
                1
              );

            const year =
              date.getFullYear();

            const month =
              date.getMonth();

            const revenue =
              unitCharges
                .filter(
                  (charge) => {
                    if (
                      charge.status !==
                      "Pago"
                    ) {
                      return false;
                    }

                    const value =
                      new Date(
                        `${charge.date}T12:00:00`
                      );

                    return (
                      value.getFullYear() ===
                        year &&
                      value.getMonth() ===
                        month
                    );
                  }
                )
                .reduce(
                  (
                    sum,
                    charge
                  ) =>
                    sum +
                    (
                      charge.receivedAmount ??
                      charge.amount
                    ),
                  0
                );

            const expense =
              unitExpenses
                .filter(
                  (item) => {
                    if (
                      item.status !==
                      "Pago"
                    ) {
                      return false;
                    }

                    const sourceDate =
                      item.paymentDate ??
                      item.dueDate;

                    const value =
                      new Date(
                        `${sourceDate}T12:00:00`
                      );

                    return (
                      value.getFullYear() ===
                        year &&
                      value.getMonth() ===
                        month
                    );
                  }
                )
                .reduce(
                  (
                    sum,
                    item
                  ) =>
                    sum +
                    (
                      item.paidAmount ??
                      item.amount
                    ),
                  0
                );

            const label =
              new Intl.DateTimeFormat(
                "pt-BR",
                {
                  month:
                    "short",
                }
              )
                .format(
                  date
                )
                .replace(
                  ".",
                  ""
                );

            return {
              label:
                label
                  .charAt(
                    0
                  )
                  .toUpperCase() +
                label.slice(
                  1
                ),
              revenue,
              expense,
              result:
                revenue -
                expense,
            };
          }
        );
      },
      [
        unitCharges,
        unitExpenses,
      ]
    );

  const monthlyChartMax =
    Math.max(
      ...monthlyFinancialData.flatMap(
        (item) => [
          item.revenue,
          item.expense,
          Math.abs(
            item.result
          ),
        ]
      ),
      1
    );

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8">
        {/* ========================================= */}
        {/* TOPO */}
        {/* ========================================= */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#10235f]">
              Financeiro
            </h1>

            <p className="mt-1 text-sm font-medium text-[#7d89a8]">
              Controle receitas, despesas e o resultado financeiro da clínica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  "/financeiro/dashboard"
                )
              }
              className="border-[#dfe3f2] bg-white text-[#263765] hover:bg-[#faf9ff]"
            >
              <BarChart3
                size={17}
              />

              Dashboard financeiro
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/financeiro/despesas/nova"
                )
              }
              className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] shadow-[0_8px_20px_rgba(103,66,246,0.18)] hover:opacity-95"
            >
              <Plus
                size={17}
              />

              Nova despesa
            </Button>
          </div>
        </div>

        {/* ========================================= */}
        {/* INDICADORES */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Faturado"
            value={
              formatCurrency(
                totalRevenue
              )
            }
            description="Receitas geradas"
            tone="purple"
            percentLabel={
              totalRevenue >
              0
                ? `${validCharges.length} lançamento(s)`
                : "Sem lançamentos"
            }
            icon={
              <CircleDollarSign
                size={20}
              />
            }
          />

          <MetricCard
            title="Recebido"
            value={
              formatCurrency(
                receivedRevenue
              )
            }
            description="Entradas confirmadas"
            tone="green"
            percentLabel={`${unitCharges.filter(
              (charge) =>
                charge.status ===
                "Pago"
            ).length} recebimento(s)`}
            icon={
              <ArrowUpCircle
                size={20}
              />
            }
          />

          <MetricCard
            title="Despesas"
            value={
              formatCurrency(
                totalExpenses
              )
            }
            description="Contas cadastradas"
            tone="red"
            percentLabel={`${validExpenses.length} despesa(s)`}
            icon={
              <ArrowDownCircle
                size={20}
              />
            }
          />

          <MetricCard
            title="A pagar"
            value={
              formatCurrency(
                pendingExpenses
              )
            }
            description="Despesas pendentes"
            tone="blue"
            percentLabel={`${unitExpenses.filter(
              (expense) =>
                expense.status ===
                "Pendente"
            ).length} pendência(s)`}
            icon={
              <WalletCards
                size={20}
              />
            }
          />

          <MetricCard
            title="Resultado líquido"
            value={
              formatCurrency(
                netResult
              )
            }
            description="Recebido − despesas − repasses"
            tone={
              netResult >=
              0
                ? "purple"
                : "red"
            }
            percentLabel={
              netResult >=
              0
                ? "Resultado positivo"
                : "Resultado negativo"
            }
            icon={
              <Banknote
                size={20}
              />
            }
          />
        </div>

        {/* ========================================= */}
        {/* MOVIMENTAÇÕES FINANCEIRAS */}
        {/* ========================================= */}

        <section className="overflow-hidden rounded-2xl border border-[#e5e7f1] bg-white shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
          <div className="border-b border-[#eceef5] px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#152555]">
                  Movimentações financeiras
                </h2>

                <p className="mt-1 text-xs font-medium text-[#8b95af]">
                  Acompanhe cobranças, despesas e repasses da clínica.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <ViewButton
                  active={
                    view ===
                    "receivables"
                  }
                  onClick={() =>
                    handleViewChange(
                      "receivables"
                    )
                  }
                >
                  Contas a receber
                </ViewButton>

                <ViewButton
                  active={
                    view ===
                    "expenses"
                  }
                  onClick={() =>
                    handleViewChange(
                      "expenses"
                    )
                  }
                >
                  Contas a pagar
                </ViewButton>

                <ViewButton
                  active={
                    view ===
                    "professionalPayouts"
                  }
                  onClick={() =>
                    handleViewChange(
                      "professionalPayouts"
                    )
                  }
                >
                  Repasses aos profissionais
                </ViewButton>
              </div>
            </div>
          </div>

          {/* FILTROS INTEGRADOS */}

          <div className="border-b border-[#eceef5] bg-[#fcfcfe] px-5 py-3.5">
            <div
              className={
                view ===
                "receivables"
                  ? "grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_180px]"
                  : "grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px]"
              }
            >
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a1b7]"
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
                  placeholder={
                    view ===
                    "receivables"
                      ? "Paciente, profissional ou especialidade..."
                      : view ===
                        "expenses"
                        ? "Descrição, fornecedor ou categoria..."
                        : "Profissional, paciente ou especialidade..."
                  }
                  className="h-10 border-[#e2e5ef] bg-white pl-10 text-sm"
                />
              </div>

              {view ===
                "receivables" && (
                <Select
                  value={
                    billingType
                  }
                  onChange={(
                    event
                  ) =>
                    setBillingType(
                      event.target.value
                    )
                  }
                  className="h-10 border-[#e2e5ef] bg-white text-sm"
                >
                  <option value="Todos">
                    Particular e Convênio
                  </option>

                  <option value="Particular">
                    Particular
                  </option>

                  <option value="Convênio">
                    Convênio
                  </option>
                </Select>
              )}

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
                className="h-10 border-[#e2e5ef] bg-white text-sm"
              >
                <option value="Todos">
                  Todos os status
                </option>

                <option value="Pendente">
                  Pendentes
                </option>

                <option value="Pago">
                  Pagos
                </option>

                {view !==
                  "professionalPayouts" && (
                  <option value="Cancelado">
                    Cancelados
                  </option>
                )}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.65fr)_minmax(350px,0.9fr)]">
            {/* ===================================== */}
            {/* ÁREA PRINCIPAL */}
            {/* ===================================== */}

            <div className="min-w-0 border-b border-[#eceef5] xl:border-b-0 xl:border-r">
              {view ===
              "receivables" ? (
                <CompactReceivablesTable
                  items={
                    filteredCharges
                  }
                  navigate={
                    navigate
                  }
                />
              ) : view ===
                "expenses" ? (
                <CompactExpensesTable
                  items={
                    filteredExpenses
                  }
                  navigate={
                    navigate
                  }
                />
              ) : (
                <CompactPayoutsTable
                  groups={
                    payoutGroups
                  }
                  onPayAll={
                    handlePayAllProfessionalPayouts
                  }
                />
              )}
            </div>

            {/* ===================================== */}
            {/* LATERAL VISUAL */}
            {/* ===================================== */}

            <div className="min-w-0 space-y-4 bg-[#fdfdff] p-4">
              {view ===
              "professionalPayouts" ? (
                <>
                  <MiniFinancialCard
                    title="Repasses gerados"
                    value={
                      formatCurrency(
                        totalPayouts
                      )
                    }
                    helper="Total dos atendimentos realizados"
                    tone="purple"
                  />

                  <MiniFinancialCard
                    title="Repasses pagos"
                    value={
                      formatCurrency(
                        paidPayouts
                      )
                    }
                    helper="Valores já confirmados"
                    tone="green"
                  />

                  <MiniFinancialCard
                    title="Repasses pendentes"
                    value={
                      formatCurrency(
                        pendingPayouts
                      )
                    }
                    helper="Valores ainda a pagar"
                    tone="orange"
                  />
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[#e7e9f2] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#1f2f5d]">
                          Contas a pagar
                        </h3>

                        <p className="mt-1 text-[11px] text-[#909ab2]">
                          Próximos vencimentos
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewChange(
                            "expenses"
                          )
                        }
                        className="text-[11px] font-bold text-[#6543ef] hover:text-[#5535db]"
                      >
                        Ver todas
                      </button>
                    </div>

                    <div className="mt-3 divide-y divide-[#eef0f5]">
                      {recentExpenses.length >
                      0 ? (
                        recentExpenses.map(
                          (
                            expense
                          ) => (
                            <div
                              key={
                                expense.id
                              }
                              className="grid grid-cols-[1fr_auto] gap-3 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#3d4a70]">
                                  {
                                    expense.description
                                  }
                                </p>

                                <p className="mt-1 text-[10px] text-[#98a1b7]">
                                  {formatDate(
                                    expense.dueDate
                                  )}{" "}
                                  •{" "}
                                  {
                                    expense.category
                                  }
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-extrabold text-[#384568]">
                                  {formatCurrency(
                                    expense.amount
                                  )}
                                </p>

                                <div className="mt-1">
                                  <ExpenseStatusBadge
                                    status={
                                      expense.status
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="py-6 text-center text-xs text-[#9aa3b8]">
                          Nenhuma despesa cadastrada.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e7e9f2] bg-white p-4">
                    <h3 className="text-sm font-extrabold text-[#1f2f5d]">
                      Despesas por categoria
                    </h3>

                    <div className="mt-4 flex items-center gap-5">
                      <div
                        className="relative h-[112px] w-[112px] shrink-0 rounded-full"
                        style={{
                          background:
                            expenseDonutBackground,
                        }}
                      >
                        <div className="absolute inset-[24px] flex items-center justify-center rounded-full bg-white">
                          <span className="text-[11px] font-extrabold text-[#465276]">
                            {unitExpenses.length}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        {expenseCategoryData.length >
                        0 ? (
                          expenseCategoryData.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.name
                                }
                                className="flex items-center justify-between gap-2 text-[10px]"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor:
                                        item.color,
                                    }}
                                  />

                                  <span className="truncate font-semibold text-[#66718f]">
                                    {
                                      item.name
                                    }
                                  </span>
                                </div>

                                <span className="shrink-0 font-extrabold text-[#465276]">
                                  {expenseCategoryTotal >
                                  0
                                    ? Math.round(
                                        (
                                          item.value /
                                          expenseCategoryTotal
                                        ) *
                                          100
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <span className="text-xs text-[#9aa3b8]">
                            Sem despesas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e7e9f2] bg-white p-4">
                    <h3 className="text-sm font-extrabold text-[#1f2f5d]">
                      Resumo financeiro
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <MiniValue
                        label="A receber"
                        value={
                          formatCurrency(
                            pendingRevenue
                          )
                        }
                        tone="purple"
                      />

                      <MiniValue
                        label="Despesas pagas"
                        value={
                          formatCurrency(
                            paidExpenses
                          )
                        }
                        tone="red"
                      />

                      <MiniValue
                        label="Repasses pagos"
                        value={
                          formatCurrency(
                            paidPayouts
                          )
                        }
                        tone="orange"
                      />

                      <MiniValue
                        label="Resultado"
                        value={
                          formatCurrency(
                            netResult
                          )
                        }
                        tone={
                          netResult >=
                          0
                            ? "green"
                            : "red"
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* EVOLUÇÃO FINANCEIRA */}
        {/* ========================================= */}

        <section className="rounded-2xl border border-[#e5e7f1] bg-white p-5 shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#152555]">
                Evolução financeira
              </h2>

              <p className="mt-1 text-xs font-medium text-[#8b95af]">
                Comparativo dos últimos seis meses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#75809d]">
              <LegendDot
                color="#20b983"
                label="Receitas"
              />

              <LegendDot
                color="#f45b69"
                label="Despesas"
              />

              <LegendDot
                color="#6d48f5"
                label="Resultado"
              />
            </div>
          </div>

          <div className="mt-6 grid h-[190px] grid-cols-6 items-end gap-3 border-b border-[#edf0f5] px-2">
            {monthlyFinancialData.map(
              (
                item
              ) => (
                <div
                  key={
                    item.label
                  }
                  className="flex h-full min-w-0 flex-col justify-end"
                >
                  <div className="flex h-[145px] items-end justify-center gap-1.5">
                    <ChartBar
                      height={
                        (
                          item.revenue /
                          monthlyChartMax
                        ) *
                        100
                      }
                      color="#20b983"
                      title={`Receitas: ${formatCurrency(
                        item.revenue
                      )}`}
                    />

                    <ChartBar
                      height={
                        (
                          item.expense /
                          monthlyChartMax
                        ) *
                        100
                      }
                      color="#f45b69"
                      title={`Despesas: ${formatCurrency(
                        item.expense
                      )}`}
                    />

                    <ChartBar
                      height={
                        (
                          Math.abs(
                            item.result
                          ) /
                          monthlyChartMax
                        ) *
                        100
                      }
                      color="#6d48f5"
                      title={`Resultado: ${formatCurrency(
                        item.result
                      )}`}
                    />
                  </div>

                  <p className="mt-3 truncate text-center text-[10px] font-bold text-[#7f89a3]">
                    {
                      item.label
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* ========================================= */}
        {/* REPASSES - DETALHAMENTO PRESERVADO */}
        {/* ========================================= */}

        {view ===
          "professionalPayouts" && (
          <section className="overflow-hidden rounded-2xl border border-[#e5e7f1] bg-white shadow-[0_5px_18px_rgba(40,52,100,0.045)]">
            <div className="border-b border-[#eceef5] px-5 py-4">
              <h2 className="text-[15px] font-extrabold text-[#152555]">
                Detalhamento dos repasses
              </h2>

              <p className="mt-1 text-xs text-[#8b95af]">
                {filteredPayouts.length} lançamento(s) encontrado(s).
              </p>
            </div>

            {filteredPayouts.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-[#e8eaf3] bg-[#fbfbfe] text-left">
                      <TableHeader>
                        Profissional
                      </TableHeader>

                      <TableHeader>
                        Paciente
                      </TableHeader>

                      <TableHeader>
                        Especialidade
                      </TableHeader>

                      <TableHeader>
                        Data
                      </TableHeader>

                      <TableHeader>
                        Repasse
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader>
                        Ação
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayouts.map(
                      (
                        payout
                      ) => (
                        <tr
                          key={
                            payout.id
                          }
                          className="border-b border-[#eef0f5] transition last:border-b-0 hover:bg-[#fcfbff]"
                        >
                          <TableCell>
                            <p className="font-semibold text-slate-800">
                              {
                                payout.professional
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            <p className="font-medium text-slate-700">
                              {
                                payout.patient
                              }
                            </p>
                          </TableCell>

                          <TableCell>
                            {
                              payout.specialty
                            }
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              payout.serviceDate
                            )}
                          </TableCell>

                          <TableCell>
                            <p className="font-bold text-violet-700">
                              {formatCurrency(
                                payout.amount
                              )}
                            </p>
                          </TableCell>

                          <TableCell>
                            <PayoutStatusBadge
                              status={
                                payout.status
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {payout.status ===
                            "Pendente" ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  handlePayPayout(
                                    payout.id
                                  )
                                }
                              >
                                Confirmar pagamento
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleReopenPayout(
                                    payout.id
                                  )
                                }
                              >
                                Voltar para pendente
                              </Button>
                            )}
                          </TableCell>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Nenhum repasse encontrado"
                description="Ajuste a busca ou o filtro de status."
              />
            )}
          </section>
        )}

        <div className="flex items-center justify-center gap-2 py-1 text-[10px] font-medium text-[#8f98ae]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Dados financeiros apresentados com base nos lançamentos registrados no sistema.
        </div>
      </div>
    </DashboardLayout>
  );
}

type MetricTone =
  | "purple"
  | "green"
  | "red"
  | "blue"
  | "orange";

const metricToneStyles: Record<
  MetricTone,
  {
    icon: string;
    line: string;
    text: string;
  }
> = {
  purple: {
    icon:
      "bg-[#f0ebff] text-[#6945ef]",
    line:
      "from-[#8864ff] via-[#7047f4] to-[#9b7bff]",
    text:
      "text-[#6543ef]",
  },

  green: {
    icon:
      "bg-[#eaf9f2] text-[#20a974]",
    line:
      "from-[#20b983] via-[#49c99b] to-[#93dfc1]",
    text:
      "text-[#18986a]",
  },

  red: {
    icon:
      "bg-[#fff0f2] text-[#ef5569]",
    line:
      "from-[#f45b69] via-[#ff7784] to-[#ffadb5]",
    text:
      "text-[#e14a60]",
  },

  blue: {
    icon:
      "bg-[#eef4ff] text-[#3976ef]",
    line:
      "from-[#3976ef] via-[#5c91f5] to-[#9bbcfb]",
    text:
      "text-[#3976ef]",
  },

  orange: {
    icon:
      "bg-[#fff6e8] text-[#ed9b23]",
    line:
      "from-[#ed9b23] via-[#f5b34d] to-[#fbd28e]",
    text:
      "text-[#dd8b16]",
  },
};

interface NewMetricCardProps {
  title: string;
  value: string;
  description: string;
  percentLabel: string;
  tone: MetricTone;
  icon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  description,
  percentLabel,
  tone,
  icon,
}: NewMetricCardProps) {
  const style =
    metricToneStyles[
      tone
    ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e6e8f1] bg-white p-4 shadow-[0_5px_16px_rgba(47,56,104,0.045)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#5f6c8d]">
            {title}
          </p>

          <p className="mt-2 truncate text-[21px] font-extrabold tracking-[-0.025em] text-[#132352]">
            {value}
          </p>

          <p className="mt-1 truncate text-[10px] font-medium text-[#9aa2b7]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span
          className={`truncate text-[10px] font-bold ${style.text}`}
        >
          {percentLabel}
        </span>

        <div className="flex h-7 w-[76px] items-end gap-1">
          {[35, 55, 44, 72, 58, 86, 68].map(
            (
              height,
              index
            ) => (
              <span
                key={
                  index
                }
                className={`w-full rounded-sm bg-gradient-to-t ${style.line}`}
                style={{
                  height:
                    `${height}%`,
                  opacity:
                    index ===
                    6
                      ? 1
                      : 0.6,
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function CompactReceivablesTable({
  items,
  navigate,
}: {
  items:
    FinancialCharge[];
  navigate:
    ReturnType<
      typeof useNavigate
    >;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#28375f]">
            Contas a receber
          </h3>

          <p className="mt-1 text-[10px] text-[#9aa2b7]">
            {items.length} cobrança(s) encontrada(s).
          </p>
        </div>
      </div>

      {items.length >
      0 ? (
        <div className="max-h-[430px] overflow-auto">
          <table className="w-full min-w-[760px]">
            <thead className="sticky top-0 z-10 bg-[#fbfbfe]">
              <tr className="border-y border-[#eceef5] text-left">
                <TableHeader>
                  Paciente
                </TableHeader>

                <TableHeader>
                  Atendimento
                </TableHeader>

                <TableHeader>
                  Data
                </TableHeader>

                <TableHeader>
                  Valor
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

                <TableHeader>
                  Ações
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (
                  charge
                ) => (
                  <tr
                    key={
                      charge.id
                    }
                    className="border-b border-[#eef0f5] transition last:border-b-0 hover:bg-[#fcfbff]"
                  >
                    <TableCell>
                      <p className="font-bold text-[#445174]">
                        {
                          charge.patient
                        }
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-[#65708d]">
                        {
                          charge.specialty
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-[#a0a8bb]">
                        {
                          charge.professional
                        }
                      </p>
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        charge.date
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-extrabold text-[#3e4b70]">
                        {formatCurrency(
                          charge.amount
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      <ChargeStatusBadge
                        status={
                          charge.status
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/financeiro/paciente/${charge.patientId}`
                            )
                          }
                          className="rounded-lg border border-[#e4e6ef] px-2 py-1.5 text-[10px] font-bold text-[#687494] hover:bg-[#f7f5ff] hover:text-[#6543ef]"
                        >
                          Histórico
                        </button>

                        {charge.status ===
                          "Pendente" && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/financeiro/receber/${charge.id}`
                              )
                            }
                            className="rounded-lg bg-[#6744ef] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#5a37df]"
                          >
                            Receber
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma cobrança encontrada"
          description="As cobranças aparecerão quando os atendimentos forem realizados."
        />
      )}
    </div>
  );
}

function CompactExpensesTable({
  items,
  navigate,
}: {
  items:
    FinancialExpense[];
  navigate:
    ReturnType<
      typeof useNavigate
    >;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#28375f]">
            Contas a pagar
          </h3>

          <p className="mt-1 text-[10px] text-[#9aa2b7]">
            {items.length} despesa(s) encontrada(s).
          </p>
        </div>
      </div>

      {items.length >
      0 ? (
        <div className="max-h-[430px] overflow-auto">
          <table className="w-full min-w-[720px]">
            <thead className="sticky top-0 z-10 bg-[#fbfbfe]">
              <tr className="border-y border-[#eceef5] text-left">
                <TableHeader>
                  Descrição
                </TableHeader>

                <TableHeader>
                  Vencimento
                </TableHeader>

                <TableHeader>
                  Valor
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

                <TableHeader>
                  Ação
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (
                  expense
                ) => (
                  <tr
                    key={
                      expense.id
                    }
                    className="border-b border-[#eef0f5] transition last:border-b-0 hover:bg-[#fcfbff]"
                  >
                    <TableCell>
                      <p className="font-bold text-[#445174]">
                        {
                          expense.description
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-[#a0a8bb]">
                        {expense.category} •{" "}
                        {expense.supplier}
                      </p>
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        expense.dueDate
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="font-extrabold text-[#3e4b70]">
                        {formatCurrency(
                          expense.amount
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      <ExpenseStatusBadge
                        status={
                          expense.status
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {expense.status ===
                        "Pendente" ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/financeiro/despesas/${expense.id}/pagar`
                            )
                          }
                          className="rounded-lg bg-[#6744ef] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#5a37df]"
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#929bb1]">
                          {
                            expense.status
                          }
                        </span>
                      )}
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma despesa encontrada"
          description="Cadastre contas como aluguel, energia, internet ou materiais."
        />
      )}
    </div>
  );
}

function CompactPayoutsTable({
  groups,
  onPayAll,
}: {
  groups:
    {
      professional:
        string;
      specialty:
        string;
      appointments:
        number;
      total:
        number;
      paid:
        number;
      pending:
        number;
    }[];
  onPayAll:
    (
      professional:
        string,
      specialty:
        string
    ) => void;
}) {
  return (
    <div>
      <div className="px-5 py-3">
        <h3 className="text-sm font-extrabold text-[#28375f]">
          Resumo por profissional
        </h3>

        <p className="mt-1 text-[10px] text-[#9aa2b7]">
          {groups.length} profissional(is) com repasses.
        </p>
      </div>

      {groups.length >
      0 ? (
        <div className="max-h-[430px] overflow-auto">
          <table className="w-full min-w-[720px]">
            <thead className="sticky top-0 z-10 bg-[#fbfbfe]">
              <tr className="border-y border-[#eceef5] text-left">
                <TableHeader>
                  Profissional
                </TableHeader>

                <TableHeader>
                  Atend.
                </TableHeader>

                <TableHeader>
                  Total
                </TableHeader>

                <TableHeader>
                  Pendente
                </TableHeader>

                <TableHeader>
                  Ação
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {groups.map(
                (
                  group
                ) => (
                  <tr
                    key={`${group.professional}-${group.specialty}`}
                    className="border-b border-[#eef0f5] last:border-b-0"
                  >
                    <TableCell>
                      <p className="font-bold text-[#445174]">
                        {
                          group.professional
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-[#a0a8bb]">
                        {
                          group.specialty
                        }
                      </p>
                    </TableCell>

                    <TableCell>
                      {
                        group.appointments
                      }
                    </TableCell>

                    <TableCell>
                      <p className="font-extrabold text-[#3e4b70]">
                        {formatCurrency(
                          group.total
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="font-extrabold text-[#dd8b16]">
                        {formatCurrency(
                          group.pending
                        )}
                      </p>
                    </TableCell>

                    <TableCell>
                      {group.pending >
                      0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            onPayAll(
                              group.professional,
                              group.specialty
                            )
                          }
                          className="rounded-lg bg-[#6744ef] px-2.5 py-1.5 text-[10px] font-bold text-white"
                        >
                          Pagar pendentes
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Quitado
                        </span>
                      )}
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhum repasse gerado"
          description="Os repasses aparecerão após atendimentos realizados."
        />
      )}
    </div>
  );
}

function MiniFinancialCard({
  title,
  value,
  helper,
  tone,
}: {
  title:
    string;
  value:
    string;
  helper:
    string;
  tone:
    MetricTone;
}) {
  const style =
    metricToneStyles[
      tone
    ];

  return (
    <div className="rounded-xl border border-[#e7e9f2] bg-white p-4">
      <p className="text-xs font-bold text-[#66718f]">
        {title}
      </p>

      <p className="mt-2 text-lg font-extrabold text-[#172756]">
        {value}
      </p>

      <p
        className={`mt-1 text-[10px] font-semibold ${style.text}`}
      >
        {helper}
      </p>
    </div>
  );
}

function MiniValue({
  label,
  value,
  tone,
}: {
  label:
    string;
  value:
    string;
  tone:
    MetricTone;
}) {
  const style =
    metricToneStyles[
      tone
    ];

  return (
    <div className="rounded-lg border border-[#eceef4] bg-[#fcfcfe] px-3 py-2.5">
      <p className="text-[9px] font-bold text-[#939cb1]">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-extrabold ${style.text}`}
      >
        {value}
      </p>
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color:
    string;
  label:
    string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor:
            color,
        }}
      />

      {label}
    </span>
  );
}

function ChartBar({
  height,
  color,
  title,
}: {
  height:
    number;
  color:
    string;
  title:
    string;
}) {
  return (
    <div
      title={
        title
      }
      className="w-[9px] min-w-[6px] rounded-t-sm transition-all hover:opacity-75 sm:w-[12px]"
      style={{
        height:
          `${Math.max(
            height,
            height >
            0
              ? 5
              : 1
          )}%`,
        backgroundColor:
          color,
        opacity:
          height >
          0
            ? 1
            : 0.18,
      }}
    />
  );
}


function BillingBadge({
  type,
}: {
  type:
    FinancialCharge["billingType"];
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        type ===
        "Particular"
          ? "bg-indigo-100 text-indigo-700"
          : "bg-cyan-100 text-cyan-700"
      }`}
    >
      {
        type
      }
    </span>
  );
}

function ChargeStatusBadge({
  status,
}: {
  status:
    FinancialCharge["status"];
}) {
  const styles: Record<
    FinancialCharge["status"],
    string
  > = {
    Pendente:
      "bg-amber-100 text-amber-700",

    Pago:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
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

function ExpenseStatusBadge({
  status,
}: {
  status:
    FinancialExpense["status"];
}) {
  const styles: Record<
    FinancialExpense["status"],
    string
  > = {
    Pendente:
      "bg-amber-100 text-amber-700",

    Pago:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",
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

function PayoutStatusBadge({
  status,
}: {
  status:
    ProfessionalPayout["status"];
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        status ===
        "Pago"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {
        status
      }
    </span>
  );
}

function ViewButton({
  active,
  children,
  onClick,
}: {
  active:
    boolean;
  children:
    React.ReactNode;
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${
        active
          ? "bg-gradient-to-r from-[#5d3df5] to-[#7840f5] text-white shadow-[0_5px_12px_rgba(103,67,239,0.18)]"
          : "border border-[#e2e5ee] bg-white text-[#66718f] hover:border-[#d9d2ff] hover:text-[#6543ef]"
      }`}
    >
      {children}
    </button>
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
    <td className="px-4 py-4 text-sm text-slate-600">
      {
        children
      }
    </td>
  );
}

function EmptyState({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
      <CircleDollarSign
        size={34}
        className="mx-auto text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        {
          title
        }
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {
          description
        }
      </p>
    </div>
  );
}

function SmallSummary({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {
          value
        }
      </p>
    </div>
  );
}

function formatDate(
  value:
    string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  return `${day}/${month}/${year}`;
}