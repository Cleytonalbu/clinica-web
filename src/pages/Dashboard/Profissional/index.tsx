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

/* =========================================
   DASHBOARD PROFISSIONAL
========================================= */

export default function DashboardProfissional() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        {/* ================================= */}
        {/* MÉTRICAS */}
        {/* ================================= */}

        <ProfissionalMetricCards />

        {/* ================================= */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          {/* COLUNA PRINCIPAL */}

          <div className="space-y-5">
            {/* AGENDA DE HOJE */}

            <ProfissionalAgendaHoje />

            {/* OCUPAÇÃO + PRÓXIMAS CONSULTAS */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <ProfissionalOcupacao />

              <ProfissionalProximasConsultas />
            </div>

            {/* EVOLUÇÕES + AVISOS */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <ProfissionalEvolucoesStatus />

              <ProfissionalAvisos />
            </div>

            {/* OBJETIVOS */}

            <ProfissionalObjetivos />
          </div>

          {/* COLUNA LATERAL */}

          <div className="space-y-5">
            <ProfissionalAcessoRapido />

            <ProfissionalValoresReceber />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}