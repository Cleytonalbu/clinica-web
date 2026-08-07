import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  TrendingDown,
  TrendingUp,
  UserX,
} from "lucide-react";

import { PageCard } from "@/components/ui";

const monthlyData = [
  {
    month: "Mar",
    appointments: 96,
  },
  {
    month: "Abr",
    appointments: 108,
  },
  {
    month: "Mai",
    appointments: 114,
  },
  {
    month: "Jun",
    appointments: 120,
  },
  {
    month: "Jul",
    appointments: 124,
  },
  {
    month: "Ago",
    appointments: 126,
  },
];

const specialties = [
  {
    label: "Sessões realizadas",
    value: 118,
    percentage: 94,
  },
  {
    label: "Evoluções registradas",
    value: 112,
    percentage: 89,
  },
  {
    label: "Faltas",
    value: 3,
    percentage: 2,
  },
  {
    label: "Cancelamentos",
    value: 5,
    percentage: 4,
  },
];

export function ProfessionalProduction() {
  const maxValue = Math.max(
    ...monthlyData.map(
      (item) => item.appointments
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Produção
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Acompanhe os principais indicadores de
          produtividade do profissional.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Atendimentos"
          value="126"
          description="Neste mês"
          icon={
            <CalendarCheck2 size={22} />
          }
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Realizados"
          value="118"
          description="94% da agenda"
          icon={
            <CheckCircle2 size={22} />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <MetricCard
          title="Evoluções"
          value="112"
          description="Registros clínicos"
          icon={
            <ClipboardList size={22} />
          }
          className="bg-violet-100 text-violet-600"
        />

        <MetricCard
          title="Faltas"
          value="3"
          description="2% dos horários"
          icon={<UserX size={22} />}
          className="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PageCard
            title="Atendimentos por mês"
            description="Evolução da produção nos últimos seis meses."
          >
            <div className="flex h-72 items-end gap-4 pt-8">
              {monthlyData.map(
                (item) => {
                  const height =
                    (item.appointments /
                      maxValue) *
                    100;

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 text-xs font-semibold text-slate-600">
                        {
                          item.appointments
                        }
                      </span>

                      <div className="flex h-full w-full items-end justify-center">
                        <div
                          className="w-full max-w-14 rounded-t-xl bg-indigo-500 transition hover:bg-indigo-600"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="mt-3 text-xs font-medium text-slate-500">
                        {item.month}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </PageCard>
        </div>

        <PageCard
          title="Desempenho"
          description="Comparativo com o mês anterior."
        >
          <div className="space-y-4">
            <PerformanceRow
              label="Atendimentos"
              value="+8%"
              positive
            />

            <PerformanceRow
              label="Comparecimento"
              value="+3%"
              positive
            />

            <PerformanceRow
              label="Evoluções"
              value="+12%"
              positive
            />

            <PerformanceRow
              label="Cancelamentos"
              value="-2%"
              positive
            />
          </div>
        </PageCard>
      </div>

      <PageCard
        title="Resumo da produção"
        description="Indicadores do período atual."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {specialties.map(
            (item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {item.label}
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-indigo-600">
                    {item.percentage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface PerformanceRowProps {
  label: string;
  value: string;
  positive?: boolean;
}

function PerformanceRow({
  label,
  value,
  positive = true,
}: PerformanceRowProps) {
  const Icon = positive
    ? TrendingUp
    : TrendingDown;

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span
        className={`flex items-center gap-1 text-sm font-semibold ${
          positive
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        <Icon size={15} />
        {value}
      </span>
    </div>
  );
}