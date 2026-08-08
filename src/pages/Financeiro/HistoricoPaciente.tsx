import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  getPatientFinancialHistory,
  markChargeAsPaid,
  type FinancialCharge,
} from "./financeStorage";

import {
  formatCurrency,
} from "./financeRules";

export default function HistoricoPaciente() {
  const navigate =
    useNavigate();

  const {
    patientId,
  } =
    useParams();

  const numericPatientId =
    Number(
      patientId
    );

  const charges =
    getPatientFinancialHistory(
      numericPatientId
    );

  const patientName =
    charges[0]?.patient ??
    "Paciente";

  const validCharges =
    charges.filter(
      (charge) =>
        charge.status !==
        "Cancelado"
    );

  const total =
    validCharges.reduce(
      (
        sum,
        charge
      ) =>
        sum +
        charge.amount,
      0
    );

  const paid =
    charges
      .filter(
        (charge) =>
          charge.status ===
          "Pago"
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

  const pending =
    charges
      .filter(
        (charge) =>
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

  const particular =
    validCharges
      .filter(
        (charge) =>
          charge.billingType ===
          "Particular"
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

  const convenio =
    validCharges
      .filter(
        (charge) =>
          charge.billingType ===
          "Convênio"
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

  function handlePaid(
    chargeId: number
  ) {
    markChargeAsPaid(
      chargeId
    );

    window.location.reload();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/financeiro"
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para Financeiro
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Histórico Financeiro
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Consulte o histórico completo de cobranças e pagamentos do paciente.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  `/pacientes/${numericPatientId}`
                )
              }
            >
              <UserRound
                size={17}
              />

              Abrir prontuário
            </Button>
          </div>
        </div>

        <PageCard
          title="Paciente"
          description="Identificação do responsável financeiro."
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UserRound
                size={26}
              />
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                {patientName}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Paciente #
                {
                  numericPatientId
                }
              </p>
            </div>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Total faturado"
            value={
              formatCurrency(
                total
              )
            }
            description="Cobranças válidas"
            icon={
              <CircleDollarSign
                size={21}
              />
            }
          />

          <MetricCard
            title="Total pago"
            value={
              formatCurrency(
                paid
              )
            }
            description="Recebimentos confirmados"
            icon={
              <Banknote
                size={21}
              />
            }
          />

          <MetricCard
            title="Em aberto"
            value={
              formatCurrency(
                pending
              )
            }
            description="Cobranças pendentes"
            icon={
              <WalletCards
                size={21}
              />
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SummaryCard
            title="Particular"
            value={
              formatCurrency(
                particular
              )
            }
            description="Atendimentos particulares"
          />

          <SummaryCard
            title="Convênios"
            value={
              formatCurrency(
                convenio
              )
            }
            description="Produção por convênio"
          />
        </div>

        <PageCard
          title="Cobranças"
          description={`${charges.length} lançamento(s) financeiro(s).`}
        >
          {charges.length >
          0 ? (
            <div className="space-y-4">
              {charges.map(
                (
                  charge
                ) => (
                  <ChargeCard
                    key={
                      charge.id
                    }
                    charge={
                      charge
                    }
                    onPaid={() =>
                      handlePaid(
                        charge.id
                      )
                    }
                    onAppointment={() =>
                      navigate(
                        `/agenda/${charge.appointmentId}`
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <CircleDollarSign
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Nenhuma cobrança encontrada
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Este paciente ainda não possui movimentações financeiras.
              </p>
            </div>
          )}
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

interface ChargeCardProps {
  charge:
    FinancialCharge;

  onPaid:
    () => void;

  onAppointment:
    () => void;
}

function ChargeCard({
  charge,
  onPaid,
  onAppointment,
}: ChargeCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-slate-900">
              {
                charge.description
              }
            </h3>

            <ChargeStatusBadge
              status={
                charge.status
              }
            />

            <BillingBadge
              type={
                charge.billingType
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
            <Info
              icon={
                <CalendarDays
                  size={15}
                />
              }
              value={
                formatDate(
                  charge.date
                )
              }
            />

            <Info
              icon={
                <UserRound
                  size={15}
                />
              }
              value={
                charge.professional
              }
            />

            <Info
              icon={
                <CreditCard
                  size={15}
                />
              }
              value={
                charge.paymentMethod
              }
            />

            <Info
              icon={
                <Clock3
                  size={15}
                />
              }
              value={`Agendamento #${charge.appointmentId}`}
            />
          </div>

          {charge.convenio && (
            <p className="mt-3 text-sm text-slate-500">
              Convênio:{" "}
              <strong className="text-slate-700">
                {
                  charge.convenio
                }
              </strong>
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Valor
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {
                formatCurrency(
                  charge.amount
                )
              }
            </p>

            {charge.discount >
              0 && (
              <p className="mt-1 text-xs text-slate-400">
                Base:{" "}
                {
                  formatCurrency(
                    charge.originalAmount
                  )
                }
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                onAppointment
              }
            >
              Ver atendimento
            </Button>

            {charge.status ===
              "Pendente" && (
              <Button
                type="button"
                size="sm"
                onClick={
                  onPaid
                }
              >
                <CheckCircle2
                  size={16}
                />

                Receber
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  value,
}: {
  icon:
    React.ReactNode;

  value:
    string;
}) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {value}
    </span>
  );
}

interface MetricCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
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
      {status}
    </span>
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
      {type}
    </span>
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