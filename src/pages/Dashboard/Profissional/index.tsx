import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  ProfissionalMetricCards,
} from "../../../components/dashboard/profissional/ProfissionalMetricCards";

import {
  ProfissionalOcupacao,
} from "../../../components/dashboard/profissional/ProfissionalOcupacao";

import {
  ProfissionalProximasConsultas,
} from "../../../components/dashboard/profissional/ProfissionalProximasConsultas";

import {
  ProfissionalAvisos,
} from "../../../components/dashboard/profissional/ProfissionalAvisos";

import {
  ProfissionalEvolucoesStatus,
} from "../../../components/dashboard/profissional/ProfissionalEvolucoesStatus";

import {
  ProfissionalObjetivos,
} from "../../../components/dashboard/profissional/ProfissionalObjetivos";

import {
  ProfissionalAcessoRapido,
} from "../../../components/dashboard/profissional/ProfissionalAcessoRapido";

import {
  ProfissionalAgendaHoje,
} from "../../../components/dashboard/profissional/ProfissionalAgendaHoje";

import {
  ProfissionalValoresReceber,
} from "../../../components/dashboard/profissional/ProfissionalValoresReceber";

export default function DashboardProfissional() {
  const {
    user,
  } = useAuth();

  const firstName =
    user?.name
      ?.trim()
      .replace(
        /^Dra?\.\s*/i,
        ""
      )
      .split(/\s+/)[0] ??
    "Profissional";

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olá, {firstName}! 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Aqui está o resumo dos seus atendimentos de hoje.
          </p>
        </div>

        <ProfissionalMetricCards />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <div className="space-y-5">
            <ProfissionalAgendaHoje />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <ProfissionalOcupacao />

              <ProfissionalProximasConsultas />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <ProfissionalEvolucoesStatus />

              <ProfissionalAvisos />
            </div>

            <ProfissionalObjetivos />
          </div>

          <div className="space-y-5">
            <ProfissionalAcessoRapido />

            <ProfissionalValoresReceber />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}