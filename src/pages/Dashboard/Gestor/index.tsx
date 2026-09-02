import {
  useEffect,
  useState,
} from "react";

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

import {
  buscarDashboardGestor,
  type ApiDashboardGestor,
} from "@/services/dashboardGestor";

/* =========================================
   DASHBOARD GESTOR
========================================= */

export default function DashboardGestor() {
  const [dados, setDados] = useState<ApiDashboardGestor | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    buscarDashboardGestor()
      .then((resposta) => {
        if (cancelado) return;
        setDados(resposta);
      })
      .catch(() => {
        if (cancelado) return;
        setErro("Não foi possível carregar os dados do painel.");
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {erro && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        {!dados && !erro && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500">
            Carregando painel…
          </div>
        )}

        {dados && (
          <>
            {/* ================================= */}
            {/* MÉTRICAS */}
            {/* ================================= */}

            <GestorMetricCards dados={dados} />

            {/* ================================= */}
            {/* VISÃO GERAL + PRÓXIMOS */}
            {/* ================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
              <GestorVisaoGeral atendimentosPorMes={dados.atendimentosPorMes} />

              <GestorProximosAtendimentos />
            </div>

            {/* ================================= */}
            {/* DESEMPENHO / FAIXA / PENDÊNCIAS */}
            {/* ================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <GestorDesempenho dados={dados.desempenhoPorEspecialidade} />

              <GestorFaixaEtaria dados={dados.faixaEtaria} />

              <GestorPendencias dados={dados.pendencias} />
            </div>

            {/* ================================= */}
            {/* SOLICITAÇÕES DE BLOQUEIO */}
            {/* ================================= */}

            <GestorSolicitacoesBloqueio />

            {/* ================================= */}
            {/* INSIGHTS */}
            {/* ================================= */}

            <GestorInsights dados={dados.insightSemana} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
