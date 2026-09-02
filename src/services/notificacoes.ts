import { api } from "./api";

export type TipoNotificacao =
  | "lembrete_consulta"
  | "confirmacao_consulta"
  | "faltas_ausencias"
  | "novos_objetivos"
  | "relatorios_prontos"
  | "novo_agendamento"
  | "pagamento_recebido"
  | "encaminhamento"
  | "geral";

export interface ApiNotificacao {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacao;
  texto: string;
  lida: boolean;
  criadoEm: string;
}

interface ListarNotificacoesResponse {
  notificacoes: ApiNotificacao[];
  totalNaoLidas: number;
}

export async function listarNotificacoes(params: {
  lida?: boolean;
  tipo?: TipoNotificacao;
} = {}): Promise<ListarNotificacoesResponse> {
  const response = await api.get<ListarNotificacoesResponse>("/notificacoes", { params });
  return response.data;
}

export async function marcarNotificacaoLida(id: string): Promise<void> {
  await api.patch(`/notificacoes/${id}/lida`);
}

export async function marcarTodasNotificacoesLidas(): Promise<void> {
  await api.patch("/notificacoes/todas/lidas");
}

export async function removerNotificacao(id: string): Promise<void> {
  await api.delete(`/notificacoes/${id}`);
}
