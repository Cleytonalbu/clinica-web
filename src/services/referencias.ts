import { api } from "./api";

// Dados de referência usados pelos formulários de Agenda (e futuramente
// outros módulos): profissionais, especialidades, serviços, salas e
// convênios — todos já existem na API, só não tinham client no front.

export interface ApiEspecialidade {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  categoria: string;
  icone: string | null;
  ativo: boolean;
}

export interface ApiServico {
  id: string;
  nome: string;
  duracaoMin: number;
  descricao: string | null;
  ativo: boolean;
}

export interface ApiConvenio {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface ApiSala {
  id: string;
  nome: string;
  descricao: string | null;
  ativa: boolean;
}

export type StatusProfissional = "ATIVO" | "INATIVO" | "FERIAS";

export interface ApiProfissional {
  id: string;
  usuarioId: string;
  registro: string | null;
  bio: string | null;
  cpf: string | null;
  rg: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  status: StatusProfissional;
  conselho: string | null;
  tipoVinculo: string | null;
  dataAdmissao: string | null;
  observacoes: string | null;
  usuario: { id: string; nome: string; email: string; foto: string | null; ativo: boolean; criadoEm?: string };
  especialidades: { especialidade: { id: string; nome: string; cor: string | null } }[];
  pacientes?: number;
  atendimentosHoje?: number;
}

export async function listarEspecialidades(): Promise<ApiEspecialidade[]> {
  const response = await api.get<{ dados: ApiEspecialidade[] }>("/especialidades");
  return response.data.dados;
}

export async function listarServicos(): Promise<ApiServico[]> {
  const response = await api.get<{ dados: ApiServico[] }>("/servicos");
  return response.data.dados;
}

export async function listarConvenios(): Promise<ApiConvenio[]> {
  const response = await api.get<{ dados: ApiConvenio[] }>("/convenios");
  return response.data.dados;
}

export async function listarSalas(): Promise<ApiSala[]> {
  const response = await api.get<{ dados: ApiSala[] }>("/salas");
  return response.data.dados;
}

export async function listarProfissionais(params: {
  especialidadeId?: string;
  busca?: string;
  // `undefined` aqui já cai em "ativo=true" por padrão — os seletores de
  // Agenda/Objetivos/Evoluções sempre chamaram sem esse parâmetro esperando
  // só profissionais ativos; passar `ativo: null` explicitamente pede todos
  // (usado pela tela administrativa de Profissionais).
  ativo?: boolean | null;
} = {}): Promise<ApiProfissional[]> {
  const { ativo, ...resto } = params;
  const response = await api.get<{ dados: ApiProfissional[] }>("/profissionais", {
    params: {
      ...resto,
      ...(ativo !== null && { ativo: ativo ?? true }),
    },
  });
  return response.data.dados;
}

export async function buscarProfissional(id: string): Promise<ApiProfissional> {
  const response = await api.get<{ profissional: ApiProfissional }>(`/profissionais/${id}`);
  return response.data.profissional;
}

export interface CriarProfissionalPayload {
  nome: string;
  email: string;
  senha: string;
  registro?: string;
  bio?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
  status?: StatusProfissional;
  conselho?: string;
  tipoVinculo?: string;
  dataAdmissao?: string;
  observacoes?: string;
  especialidadeIds?: string[];
}

export async function criarProfissional(dados: CriarProfissionalPayload): Promise<ApiProfissional> {
  const response = await api.post<{ profissional: ApiProfissional }>("/profissionais", dados);
  return response.data.profissional;
}

export type AtualizarProfissionalPayload = Partial<Omit<CriarProfissionalPayload, "senha">>;

export async function atualizarProfissional(
  id: string,
  dados: AtualizarProfissionalPayload
): Promise<ApiProfissional> {
  const response = await api.put<{ profissional: ApiProfissional }>(`/profissionais/${id}`, dados);
  return response.data.profissional;
}

export async function inativarProfissional(id: string): Promise<void> {
  await api.delete(`/profissionais/${id}`);
}

export async function horariosDisponiveis(profissionalId: string, data: string) {
  const response = await api.get<{
    slots: { horario: string; disponivel: boolean; dataHora: string }[];
  }>(`/profissionais/${profissionalId}/horarios-disponiveis`, { params: { data } });
  return response.data.slots;
}
