import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  GestorMetricCards,
} from "../../../components/dashboard/gestor/GestorMetricCards";

import {
  GestorVisaoGeral,
} from "../../../components/dashboard/gestor/GestorVisaoGeral";

import {
  GestorProximosAtendimentos,
} from "../../../components/dashboard/gestor/GestorProximosAtendimentos";

import {
  GestorDesempenho,
} from "../../../components/dashboard/gestor/GestorDesempenho";

import {
  GestorFaixaEtaria,
} from "../../../components/dashboard/gestor/GestorFaixaEtaria";

import {
  GestorPendencias,
} from "../../../components/dashboard/gestor/GestorPendencias";

import {
  GestorInsights,
} from "../../../components/dashboard/gestor/GestorInsights";

import {
  GestorSolicitacoesBloqueio,
} from "../../../components/dashboard/gestor/GestorSolicitacoesBloqueio";

/* =========================================
   DASHBOARD GESTOR
========================================= */

export default function DashboardGestor() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* MÉTRICAS */}
        {/* ================================= */}

        <GestorMetricCards />

        {/* ================================= */}
        {/* VISÃO GERAL + PRÓXIMOS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
          <GestorVisaoGeral />

          <GestorProximosAtendimentos />
        </div>

        {/* ================================= */}
        {/* DESEMPENHO / FAIXA / PENDÊNCIAS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <GestorDesempenho />

          <GestorFaixaEtaria />

          <GestorPendencias />
        </div>

        {/* ================================= */}
        {/* SOLICITAÇÕES DE BLOQUEIO */}
        {/* ================================= */}

        <GestorSolicitacoesBloqueio />

        {/* ================================= */}
        {/* INSIGHTS */}
        {/* ================================= */}

        <GestorInsights />
      </div>
    </DashboardLayout>
  );
}