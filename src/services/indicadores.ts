import { api } from "./api";

export interface ApiIndicadoresGerais {
  periodo: { dataInicio: string; dataFim: string };
  contadores: {
    criancasCadastradas: number;
    profissionaisAtivos: number;
    objetivosAtivos: number;
    objetivosAlcancados: number;
    objetivosEmEvolucao: number;
    faltasRegistradas: number;
  };
  criancasPorEspecialidade: {
    especialidadeId: string;
    nome: string;
    cor: string | null;
    total: number;
  }[];
  criancasPorProfissional: {
    profissionalId: string;
    nome: string;
    foto: string | null;
    total: number;
  }[];
  comparecimento: {
    comparecimentos: number;
    faltas: number;
    agendados: number;
    emAtendimento: number;
    total: number;
    taxaComparecimento: number;
  };
  faltasPorMotivo: {
    motivo: string;
    total: number;
    percentual: number;
  }[];
  resumoObjetivos: {
    total: number;
    porStatus: { status: string; total: number; percentual: number }[];
  };
  objetivosPorProfissional: {
    profissionalId: string;
    nome: string;
    especialidade: string | null;
    pacientesComObjetivos: number;
    totalObjetivos: number;
    ultimoCriadoEm: string | null;
  }[];
  evolucaoPorEspecialidade: {
    categoria: string;
    mediaEvolucao: number;
    totalObjetivos: number;
  }[];
  evolucaoPorPeriodo: {
    mes: string;
    sessoes: number;
    mediaDesempenho: number;
  }[];
}

export interface ApiAlertasGestao {
  criancasSemAtendimento: {
    total: number;
    detalhes: { id: string; nome: string; ultimoAtendimento: string | null }[];
  };
  objetivosDesatualizados: { total: number };
  profissionaisOciosos: {
    total: number;
    detalhes: { id: string; nome: string; agendamentosProximos: number }[];
  };
}

export async function buscarIndicadoresGerais(params: {
  dataInicio?: string;
  dataFim?: string;
} = {}): Promise<ApiIndicadoresGerais> {
  const response = await api.get<ApiIndicadoresGerais>("/indicadores", { params });
  return response.data;
}

export async function buscarAlertasGestao(): Promise<ApiAlertasGestao> {
  const response = await api.get<ApiAlertasGestao>("/indicadores/alertas");
  return response.data;
}
