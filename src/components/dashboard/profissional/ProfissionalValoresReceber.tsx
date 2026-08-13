import {
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  getProfessionalPayoutSummary,
  type ProfessionalPayout,
} from "@/pages/Financeiro/professionalPayoutStorage";

/* =========================================
   VALORES A RECEBER DO PROFISSIONAL
========================================= */

export function ProfissionalValoresReceber() {
  const {
    user,
  } =
    useAuth();

  const professionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const summary =
    useMemo(
      () =>
        getProfessionalPayoutSummary(
          professionalName
        ),
      [
        professionalName,
      ]
    );

  const recentPayouts =
    summary.payouts.slice(
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
              Repasses dos atendimentos realizados no mês
            </p>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <WalletCards
              size={19}
            />
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#6543ef] to-[#7c50f5] p-4 text-white shadow-lg shadow-violet-200/60">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
            Total do mês
          </p>

          <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
            {formatCurrency(
              summary.total
            )}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-violet-100">
            <CalendarCheck2
              size={13}
            />

            {summary.appointments} atendimento(s) com repasse
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <ValueBox
            title="Recebido"
            value={
              formatCurrency(
                summary.received
              )
            }
            icon={
              <CheckCircle2
                size={16}
              />
            }
            className="border-emerald-100 bg-emerald-50/70 text-emerald-700"
          />

          <ValueBox
            title="Pendente"
            value={
              formatCurrency(
                summary.pending
              )
            }
            icon={
              <Clock3
                size={16}
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
                  payout
                ) => (
                  <PayoutRow
                    key={
                      payout.id
                    }
                    payout={
                      payout
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center">
              <Banknote
                size={22}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-xs font-semibold text-slate-600">
                Nenhum repasse lançado neste mês
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Quando um atendimento for marcado como realizado, o repasse configurado será lançado automaticamente aqui.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-3 text-[10px] leading-4 text-violet-700">
          O valor exibido é o <strong>repasse profissional</strong> configurado pelo Gestor, e não o valor total cobrado do paciente.
        </div>
      </div>
    </section>
  );
}

/* =========================================
   BOX DE VALOR
========================================= */

function ValueBox({
  title,
  value,
  icon,
  className,
}: {
  title:
    string;

  value:
    string;

  icon:
    React.ReactNode;

  className:
    string;
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

/* =========================================
   LINHA DE REPASSE
========================================= */

function PayoutRow({
  payout,
}: {
  payout:
    ProfessionalPayout;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/55 px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-700">
            {
              payout.patient
            }
          </p>

          <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
            {formatDate(
              payout.serviceDate
            )} • {payout.specialty}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-extrabold text-[#6543ef]">
            {formatCurrency(
              payout.amount
            )}
          </p>

          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
              payout.status ===
              "Pago"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {
              payout.status
            }
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   FORMATAÇÃO
========================================= */

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
  if (
    !value
  ) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}