import { api } from "./api";

export interface ApiDashboardGestor {
  contadores: {
    criancasCadastradas: number;
    profissionaisAtivos: number;
    objetivosAtivos: number;
    objetivosAlcancados: number;
    objetivosEmEvolucao: number;
    faltasRegistradas: number;
  };
  atendimentosPorMes: {
    mes: number;
    realizados: number;
    agendados: number;
    cancelados: number;
    total: number;
  }[];
  desempenhoPorEspecialidade: {
    especialidadeId: string;
    nome: string;
    percentual: number;
    total: number;
  }[];
  faixaEtaria: {
    total: number;
    faixas: { label: string; total: number; percentual: number }[];
  };
  pendencias: {
    evolucoesPendentes: number;
    cadastrosIncompletos: number;
    pagamentosEmAberto: number;
  };
  insightSemana: {
    atendimentosSemanaAtual: number;
    atendimentosSemanaAnterior: number;
    variacaoPercentual: number;
    especialidadeDestaque: string | null;
  };
  novosPacientesMes: number;
  cancelamentosMes: number;
  faturamentoMes: number;
  faturamentoMesAnterior: number;
}

export async function buscarDashboardGestor(): Promise<ApiDashboardGestor> {
  const response = await api.get<ApiDashboardGestor>("/indicadores/dashboard-gestor");
  return response.data;
}
