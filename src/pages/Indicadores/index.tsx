import {
  DashboardLayout,
} from "../../layouts/DashboardLayout";

import {
  IndicadoresFiltros,
} from "../../components/indicadores/IndicadoresFiltros";

import {
  IndicadoresMetricCards,
} from "../../components/indicadores/IndicadoresMetricCards";

import {
  CriancasPorEspecialidade,
} from "../../components/indicadores/CriancasPorEspecialidade";

import {
  CriancasPorProfissional,
} from "../../components/indicadores/CriancasPorProfissional";

import {
  EvolucaoPorEspecialidade,
} from "../../components/indicadores/EvolucaoPorEspecialidade";

import {
  EvolucaoPorPeriodo,
} from "../../components/indicadores/EvolucaoPorPeriodo";

import {
  ComparecimentoFaltas,
} from "../../components/indicadores/ComparecimentoFaltas";

import {
  ResumoObjetivos,
} from "../../components/indicadores/ResumoObjetivos";

import {
  FaltasPorMotivo,
} from "../../components/indicadores/FaltasPorMotivo";

import {
  AlertasGestao,
} from "../../components/indicadores/AlertasGestao";

export default function Indicadores() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Indicadores da Clínica
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe os principais resultados e métricas da clínica em tempo real.
          </p>
        </div>

        <IndicadoresFiltros />

        <IndicadoresMetricCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CriancasPorEspecialidade />

          <CriancasPorProfissional />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <EvolucaoPorEspecialidade />

          <EvolucaoPorPeriodo />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
          <ComparecimentoFaltas />

          <div className="space-y-6">
            <ResumoObjetivos />

            <FaltasPorMotivo />
          </div>

          <AlertasGestao />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-700 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Os indicadores serão atualizados com base nos registros reais da clínica.
          </span>

          <span className="font-semibold">
            Última atualização: agora
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}