import { api } from "./api";

export type StatusSolicitacaoBloqueio = "PENDENTE" | "APROVADA" | "RECUSADA";

export interface ApiSolicitacaoBloqueio {
  id: string;
  profissionalId: string;
  dataHora: string;
  dataFim: string;
  tipo: string;
  motivo: string;
  status: StatusSolicitacaoBloqueio;
  agendamentoId: string | null;
  criadoEm: string;
  revisadoEm: string | null;
  profissional: {
    id: string;
    usuario: { nome: string; foto: string | null };
  };
}

export interface CriarSolicitacaoBloqueioPayload {
  dataHora: string;
  dataFim: string;
  tipo: string;
  motivo: string;
}

export async function listarSolicitacoesBloqueio(
  status?: StatusSolicitacaoBloqueio
): Promise<ApiSolicitacaoBloqueio[]> {
  const response = await api.get<{ dados: ApiSolicitacaoBloqueio[] }>(
    "/solicitacoes-bloqueio",
    { params: status ? { status } : {} }
  );
  return response.data.dados;
}

export async function criarSolicitacaoBloqueio(
  dados: CriarSolicitacaoBloqueioPayload
): Promise<ApiSolicitacaoBloqueio> {
  const response = await api.post<{ solicitacao: ApiSolicitacaoBloqueio }>(
    "/solicitacoes-bloqueio",
    dados
  );
  return response.data.solicitacao;
}

export async function aprovarSolicitacaoBloqueio(id: string): Promise<ApiSolicitacaoBloqueio> {
  const response = await api.patch<{ solicitacao: ApiSolicitacaoBloqueio }>(
    `/solicitacoes-bloqueio/${id}/aprovar`
  );
  return response.data.solicitacao;
}

export async function recusarSolicitacaoBloqueio(id: string): Promise<ApiSolicitacaoBloqueio> {
  const response = await api.patch<{ solicitacao: ApiSolicitacaoBloqueio }>(
    `/solicitacoes-bloqueio/${id}/recusar`
  );
  return response.data.solicitacao;
}

// Adaptador para o formato que a tela do Gestor já sabe renderizar
// (BlockRequest do antigo mock).
export function paraBlockRequest(dados: ApiSolicitacaoBloqueio) {
  const inicio = new Date(dados.dataHora);
  const fim = new Date(dados.dataFim);
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    id: dados.id,
    professional: dados.profissional.usuario.nome,
    date: `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())}`,
    startTime: `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}`,
    endTime: `${pad(fim.getHours())}:${pad(fim.getMinutes())}`,
    type: dados.tipo,
    reason: dados.motivo,
    status: dados.status === "PENDENTE" ? "Pendente" as const
      : dados.status === "APROVADA" ? "Aprovado" as const
      : "Recusado" as const,
    createdAt: dados.criadoEm,
  };
}
