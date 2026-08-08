import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

export default function Relatorios() {
  const navigate =
    useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Relatórios
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulte indicadores e informações gerenciais da clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportCard
            title="Atendimentos"
            description="Produção clínica, realizados, faltas e cancelamentos."
            icon={
              <CalendarDays
                size={24}
              />
            }
            onClick={() =>
              navigate(
                "/relatorios/atendimentos"
              )
            }
          />

          <ReportCard
            title="Financeiro"
            description="Faturamento, recebimentos, despesas e resultado líquido."
            icon={
              <CircleDollarSign
                size={24}
              />
            }
            onClick={() =>
              navigate(
                "/relatorios/financeiro"
              )
            }
          />

          <ReportCard
            title="Pacientes"
            description="Atendimentos, faltas, equipe envolvida e situação financeira."
            icon={
              <UsersRound
                size={24}
              />
            }
            onClick={() =>
              navigate(
                "/relatorios/pacientes"
              )
            }
          />

          <ReportCard
            title="Profissionais"
            description="Produção individual, pacientes atendidos e faturamento."
            icon={
              <Stethoscope
                size={24}
              />
            }
            onClick={() =>
              navigate(
                "/relatorios/profissionais"
              )
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReportCard({
  title,
  description,
  icon,
  onClick,
}: {
  title:
    string;

  description:
    string;

  icon:
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
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {
            icon
          }
        </div>

        <ChevronRight
          size={20}
          className="text-slate-400"
        />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        {
          title
        }
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>
    </button>
  );
}