import {
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  WalletCards,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getPayoutsByProfessional,
  type ProfessionalPayout,
} from "@/pages/Financeiro/professionalPayoutStorage";

export function ProfissionalValoresReceber() {
  const {
    user,
  } =
    useAuth();

  const {
    activeUnitId,
  } =
    useUnit();

  const professionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const visibilityKey =
    `entre-afetos-professional-values-hidden:${professionalName}`;

  const [valuesHidden, setValuesHidden] =
    useState(() =>
      localStorage.getItem(visibilityKey) === "1"
    );

  function toggleValuesVisibility() {
    const next = !valuesHidden;
    setValuesHidden(next);
    localStorage.setItem(visibilityKey, next ? "1" : "0");
  }

  function displayCurrency(value: number) {
    return valuesHidden ? "R$ •••••" : formatCurrency(value);
  }

  const now =
    new Date();

  const payouts =
    getPayoutsByProfessional(
      professionalName
    ).filter(
      (
        payout
      ) => {
        if (
          payout.unitId !==
          activeUnitId
        ) {
          return false;
        }

        const [
          year,
          month,
        ] =
          payout.serviceDate
            .split(
              "-"
            )
            .map(
              Number
            );

        return (
          year ===
            now.getFullYear() &&
          month ===
            now.getMonth() +
              1
        );
      }
    );

  const received =
    payouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pago"
      )
      .reduce(
        (
          total,
          payout
        ) =>
          total +
          payout.amount,
        0
      );

  const pending =
    payouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      )
      .reduce(
        (
          total,
          payout
        ) =>
          total +
          payout.amount,
        0
      );

  const total =
    received +
    pending;

  const recentPayouts =
    [
      ...payouts,
    ]
      .sort(
        (
          a,
          b
        ) =>
          b.serviceDate.localeCompare(
            a.serviceDate
          )
      )
      .slice(
        0,
        4
      );

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-[#10235f]">
              Valores a receber
            </p>

            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Repasses desta unidade no mês
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleValuesVisibility}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-white text-violet-600 transition hover:bg-violet-50"
              title={valuesHidden ? "Mostrar valores" : "Ocultar valores"}
              aria-label={valuesHidden ? "Mostrar valores" : "Ocultar valores"}
            >
              {valuesHidden ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <WalletCards size={19} />
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#6543ef] to-[#7c50f5] p-4 text-white shadow-lg shadow-violet-200/60">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
            Total do mês
          </p>

          <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
            {
              displayCurrency(
                total
              )
            }
          </p>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-violet-100">
            <CalendarCheck2
              size={
                13
              }
            />

            {payouts.length} atendimento(s) com repasse
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <ValueBox
            title="Recebido"
            value={
              displayCurrency(
                received
              )
            }
            icon={
              <CheckCircle2
                size={
                  16
                }
              />
            }
            className="border-emerald-100 bg-emerald-50/70 text-emerald-700"
          />

          <ValueBox
            title="Pendente"
            value={
              displayCurrency(
                pending
              )
            }
            icon={
              <Clock3
                size={
                  16
                }
              />
            }
            className="border-amber-100 bg-amber-50/80 text-amber-700"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-extrabold text-slate-700">
              Repasses recentes
            </p>

            <span className="text-[10px] font-semibold text-slate-400">
              Atendimento realizado
            </span>
          </div>

          {recentPayouts.length >
          0 ? (
            <div className="space-y-2.5">
              {recentPayouts.map(
                (
                  item
                ) => (
                  <PayoutRow
                    key={
                      item.id
                    }
                    payout={
                      item
                    }
                    valuesHidden={
                      valuesHidden
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center">
              <Banknote
                size={
                  22
                }
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-xs font-semibold text-slate-600">
                Nenhum repasse lançado neste mês
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Quando um atendimento desta unidade for marcado como realizado, o repasse aparecerá aqui.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-3 text-[10px] leading-4 text-violet-700">
          O valor exibido é o <strong>repasse profissional</strong> configurado pelo Gestor para os atendimentos desta unidade.
        </div>
      </div>
    </section>
  );
}

function ValueBox({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string;
  icon:
    React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        {
          icon
        }

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {
            title
          }
        </span>
      </div>

      <p className="mt-2 text-sm font-extrabold">
        {
          value
        }
      </p>
    </div>
  );
}

function PayoutRow({
  payout,
  valuesHidden,
}: {
  payout:
    ProfessionalPayout;
  valuesHidden: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-700">
          {
            payout.patient
          }
        </p>

        <p className="mt-1 truncate text-[10px] text-slate-400">
          {formatDate(
            payout.serviceDate
          )}{" "}
          •{" "}
          {
            payout.specialty
          }
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-extrabold text-slate-800">
          {
            valuesHidden
              ? "R$ •••••"
              : formatCurrency(
                  payout.amount
                )
          }
        </p>

        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
            payout.status ===
            "Pago"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {
            payout.status
          }
        </span>
      </div>
    </div>
  );
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",
      currency:
        "BRL",
    }
  ).format(
    value
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
    value.split(
      "-"
    );

  return `${day}/${month}/${year}`;
}
