import {
  BarChart3,
  CalendarCheck2,
  Download,
  FileText,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Button,
  PageCard,
  Select,
} from "@/components/ui";

const reports = [
  {
    id: 1,
    title: "Relatório de Evolução Clínica",
    description:
      "Resumo das evoluções registradas no período selecionado.",
    icon: TrendingUp,
    updatedAt: "07/08/2026",
  },
  {
    id: 2,
    title: "Relatório de Objetivos Terapêuticos",
    description:
      "Acompanhamento do progresso dos objetivos do plano terapêutico.",
    icon: Target,
    updatedAt: "07/08/2026",
  },
  {
    id: 3,
    title: "Relatório de Frequência",
    description:
      "Presenças, faltas, cancelamentos e taxa de comparecimento.",
    icon: CalendarCheck2,
    updatedAt: "06/08/2026",
  },
  {
    id: 4,
    title: "Relatório Financeiro",
    description:
      "Histórico de cobranças, pagamentos e pendências do paciente.",
    icon: WalletCards,
    updatedAt: "05/08/2026",
  },
];

export function PatientReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Relatórios
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Gere e consulte relatórios consolidados do acompanhamento do paciente.
          </p>
        </div>

        <Button type="button">
          <FileText size={18} />
          Gerar relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Evoluções"
          value="128"
          icon={<TrendingUp size={22} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Objetivos"
          value="6"
          icon={<Target size={22} />}
          className="bg-violet-100 text-violet-600"
        />

        <MetricCard
          title="Presenças"
          value="92%"
          icon={<CalendarCheck2 size={22} />}
          className="bg-emerald-100 text-emerald-600"
        />

        <MetricCard
          title="Relatórios"
          value="12"
          icon={<BarChart3 size={22} />}
          className="bg-amber-100 text-amber-600"
        />
      </div>

      <PageCard
        title="Filtros do relatório"
        description="Selecione o período e o tipo de informação."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Período
            </label>

            <Select defaultValue="ultimos90">
              <option value="ultimos30">
                Últimos 30 dias
              </option>

              <option value="ultimos60">
                Últimos 60 dias
              </option>

              <option value="ultimos90">
                Últimos 90 dias
              </option>

              <option value="ano">
                Ano atual
              </option>

              <option value="personalizado">
                Período personalizado
              </option>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Especialidade
            </label>

            <Select defaultValue="todas">
              <option value="todas">
                Todas
              </option>

              <option value="psicologia">
                Psicologia
              </option>

              <option value="fono">
                Fonoaudiologia
              </option>

              <option value="to">
                Terapia Ocupacional
              </option>

              <option value="fisio">
                Fisioterapia
              </option>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Formato
            </label>

            <Select defaultValue="pdf">
              <option value="pdf">
                PDF
              </option>

              <option value="visualizacao">
                Visualização na tela
              </option>
            </Select>
          </div>
        </div>
      </PageCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {report.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {report.description}
                  </p>

                  <p className="mt-4 text-xs text-slate-400">
                    Atualizado em {report.updatedAt}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                >
                  Visualizar
                </Button>

                <Button
                  type="button"
                  size="sm"
                >
                  <Download size={16} />
                  Gerar PDF
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}

function MetricCard({
  title,
  value,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
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