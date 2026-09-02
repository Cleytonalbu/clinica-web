import { api } from "./api";

// Espelha o enum Papel do backend (prisma/schema.prisma).
export type PapelUsuario =
  | "GESTOR"
  | "RECEPCIONISTA"
  | "PROFISSIONAL"
  | "ADMINISTRATIVO";

export interface ApiUsuarioResumo {
  id: string;
  nome: string;
  foto: string | null;
  papel: PapelUsuario;
}

export interface ApiMensagem {
  id: string;
  texto: string;
  lida: boolean;
  criadoEm: string;
  remetente: ApiUsuarioResumo;
  destinatario: ApiUsuarioResumo;
}

export async function listarMensagens(
  params: { com?: string } = {}
): Promise<ApiMensagem[]> {
  const response = await api.get<{ mensagens: ApiMensagem[] }>("/mensagens", {
    params,
  });
  return response.data.mensagens;
}

export async function buscarMensagem(id: string): Promise<ApiMensagem> {
  const response = await api.get<{ mensagem: ApiMensagem }>(`/mensagens/${id}`);
  return response.data.mensagem;
}

export async function enviarMensagem(dados: {
  destinatarioId: string;
  texto: string;
}): Promise<ApiMensagem> {
  const response = await api.post<{ mensagem: ApiMensagem }>("/mensagens", dados);
  return response.data.mensagem;
}

export async function marcarMensagemLida(id: string): Promise<void> {
  await api.patch(`/mensagens/${id}/lida`);
}

export async function marcarTodasMensagensLidas(
  params: { com?: string } = {}
): Promise<void> {
  // Sem corpo: passar `null` explicitamente faz o axios enviar
  // Content-Type: application/json com body "null", que o Fastify rejeita
  // com 415 (a rota não espera nem lê nenhum body).
  await api.patch("/mensagens/todas/lidas", undefined, { params });
}

export async function removerMensagem(id: string): Promise<void> {
  await api.delete(`/mensagens/${id}`);
}

export async function contarMensagensNaoLidas(): Promise<number> {
  const response = await api.get<{ total: number }>(
    "/mensagens/nao-lidas/contagem"
  );
  return response.data.total;
}

// Colegas da clínica disponíveis para iniciar uma conversa (qualquer papel,
// exceto o próprio usuário) — ver GET /usuarios/contatos no backend.
export async function listarContatos(
  params: { busca?: string } = {}
): Promise<ApiUsuarioResumo[]> {
  const response = await api.get<{ dados: ApiUsuarioResumo[] }>(
    "/usuarios/contatos",
    { params }
  );
  return response.data.dados;
}
