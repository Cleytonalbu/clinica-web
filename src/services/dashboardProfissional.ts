import { api } from "./api";
import type { ApiAgendamento } from "./agenda";

export interface ApiObjetivoMeu {
  id: string;
  pacienteId: string;
  profissionalId: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  status: string;
  progresso: number;
  nivelDesempenho: number | null;
  atualizadoEm: string;
  paciente: { id: string; nome: string; foto: string | null };
}

export interface ApiEvolucaoMinha {
  id: string;
  pacienteId: string;
  dataAtendimento: string;
  rascunho: boolean;
  assinadoEm: string | null;
  paciente: { id: string; nome: string };
}

export interface ApiMeusRepasses {
  total: number;
  recebido: number;
  pendente: number;
  quantidade: number;
  transacoes: {
    id: string;
    categoria: string;
    descricao: string;
    valor: string | number;
    status: string;
    dataVencimento: string | null;
    dataPagamento: string | null;
    criadoEm: string;
    paciente: { id: string; nome: string } | null;
  }[];
}

export async function listarMeusObjetivos(status?: string): Promise<ApiObjetivoMeu[]> {
  const response = await api.get<{ dados: ApiObjetivoMeu[] }>("/objetivos/meus", {
    params: status ? { status } : {},
  });
  return response.data.dados;
}

export async function listarMinhasEvolucoes(): Promise<ApiEvolucaoMinha[]> {
  const response = await api.get<{ dados: ApiEvolucaoMinha[] }>("/evolucoes/minhas");
  return response.data.dados;
}

export async function buscarMeusRepasses(): Promise<ApiMeusRepasses> {
  const response = await api.get<ApiMeusRepasses>("/financeiro/meus-repasses");
  return response.data;
}

export async function listarMeusAgendamentos(params: {
  profissionalId: string;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  porPagina?: number;
}): Promise<{ dados: ApiAgendamento[] }> {
  const response = await api.get<{ dados: ApiAgendamento[] }>("/agendamentos", { params });
  return response.data;
}
