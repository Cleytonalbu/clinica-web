import {
  useEffect,
  useState,
} from "react";

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
  AlertasGestao,
} from "../../components/indicadores/AlertasGestao";

import {
  ObjetivosPorProfissional,
} from "../../components/indicadores/ObjetivosPorProfissional";

import {
  FaltasPorMotivo,
} from "../../components/indicadores/FaltasPorMotivo";

import {
  buscarAlertasGestao,
  buscarIndicadoresGerais,
  type ApiAlertasGestao,
  type ApiIndicadoresGerais,
} from "@/services/indicadores";

function primeiroDiaDoMes() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Indicadores() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes());
  const [dataFim, setDataFim] = useState(hojeISO());

  const [dados, setDados] = useState<ApiIndicadoresGerais | null>(null);
  const [alertas, setAlertas] = useState<ApiAlertasGestao | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  function carregar() {
    setLoading(true);
    setErro(null);

    Promise.all([
      buscarIndicadoresGerais({ dataInicio, dataFim }),
      buscarAlertasGestao(),
    ])
      .then(([gerais, alertasGestao]) => {
        setDados(gerais);
        setAlertas(alertasGestao);
        setAtualizadoEm(new Date());
      })
      .catch(() => {
        setErro("Não foi possível carregar os indicadores.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        <IndicadoresFiltros
          dataInicio={dataInicio}
          dataFim={dataFim}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          onAtualizar={carregar}
          loading={loading}
        />

        {erro && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        {loading && !dados && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500">
            Carregando indicadores…
          </div>
        )}

        {dados && (
          <>
            <IndicadoresMetricCards contadores={dados.contadores} />

            <ObjetivosPorProfissional dados={dados.objetivosPorProfissional} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <CriancasPorEspecialidade dados={dados.criancasPorEspecialidade} />

              <CriancasPorProfissional dados={dados.criancasPorProfissional} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <EvolucaoPorEspecialidade dados={dados.evolucaoPorEspecialidade} />

              <EvolucaoPorPeriodo dados={dados.evolucaoPorPeriodo} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ComparecimentoFaltas dados={dados.comparecimento} />

              <FaltasPorMotivo dados={dados.faltasPorMotivo} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ResumoObjetivos dados={dados.resumoObjetivos} />

              <AlertasGestao dados={alertas} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-700 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Os indicadores são calculados a partir dos registros reais da clínica.
          </span>

          <span className="font-semibold">
            {atualizadoEm
              ? `Última atualização: ${atualizadoEm.toLocaleTimeString("pt-BR")}`
              : "Carregando…"}
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
