import { api } from "./api";

export type ApiStatusObjetivo =
  | "EM_ANDAMENTO"
  | "ALCANCADO"
  | "PARCIALMENTE_ALCANCADO"
  | "NAO_TRABALHADO";

export interface ApiObjetivo {
  id: string;
  pacienteId: string;
  profissionalId: string;
  planoId: string | null;
  nome: string;
  descricao: string | null;
  categoria: string;
  status: ApiStatusObjetivo;
  progresso: number;
  nivelDesempenho: number | null;
  criadoEm: string;
  atualizadoEm: string;
  profissional?: {
    id: string;
    usuario: { id: string; nome: string };
  };
}

export async function listarObjetivos(
  pacienteId: string,
  filtros: { categoria?: string; status?: ApiStatusObjetivo } = {}
): Promise<{ dados: ApiObjetivo[] }> {
  const response = await api.get<{ dados: ApiObjetivo[] }>(
    `/pacientes/${pacienteId}/objetivos`,
    { params: filtros }
  );
  return response.data;
}

export async function buscarObjetivo(id: string): Promise<ApiObjetivo> {
  const response = await api.get<{ objetivo: ApiObjetivo }>(`/objetivos/${id}`);
  return response.data.objetivo;
}

export interface CriarObjetivoPayload {
  profissionalId: string;
  nome: string;
  descricao?: string;
  categoria: string;
  progresso?: number;
  nivelDesempenho?: number;
}

export async function criarObjetivo(
  pacienteId: string,
  dados: CriarObjetivoPayload
): Promise<ApiObjetivo> {
  const response = await api.post<{ objetivo: ApiObjetivo }>(
    `/pacientes/${pacienteId}/objetivos`,
    dados
  );
  return response.data.objetivo;
}

export async function atualizarObjetivo(
  id: string,
  dados: Partial<CriarObjetivoPayload>
): Promise<ApiObjetivo> {
  const response = await api.put<{ objetivo: ApiObjetivo }>(`/objetivos/${id}`, dados);
  return response.data.objetivo;
}

export async function alterarStatusObjetivo(
  id: string,
  status: ApiStatusObjetivo
): Promise<ApiObjetivo> {
  const response = await api.patch<{ objetivo: ApiObjetivo }>(`/objetivos/${id}/status`, {
    status,
  });
  return response.data.objetivo;
}

export async function atualizarProgressoObjetivo(
  id: string,
  progresso: number,
  nivelDesempenho?: number
): Promise<ApiObjetivo> {
  const response = await api.patch<{ objetivo: ApiObjetivo }>(`/objetivos/${id}/progresso`, {
    progresso,
    nivelDesempenho,
  });
  return response.data.objetivo;
}

export async function removerObjetivo(id: string): Promise<void> {
  await api.delete(`/objetivos/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────
// Mapeamento de status — front usa 3 rótulos, backend tem 4. NAO_TRABALHADO
// nunca é definido pela UI (só aparece se vier assim do backend).
// ─────────────────────────────────────────────────────────────────────────

export type FrontObjectiveStatus =
  | "Em evolução"
  | "Atingido"
  | "Com regressão"
  | "Não trabalhado";

export function statusObjetivoParaFront(status: ApiStatusObjetivo): FrontObjectiveStatus {
  switch (status) {
    case "EM_ANDAMENTO":
      return "Em evolução";
    case "ALCANCADO":
      return "Atingido";
    case "PARCIALMENTE_ALCANCADO":
      return "Com regressão";
    case "NAO_TRABALHADO":
      return "Não trabalhado";
  }
}

export function statusObjetivoParaApi(status: string): ApiStatusObjetivo {
  switch (status) {
    case "Atingido":
      return "ALCANCADO";
    case "Com regressão":
      return "PARCIALMENTE_ALCANCADO";
    case "Não trabalhado":
      return "NAO_TRABALHADO";
    default:
      return "EM_ANDAMENTO";
  }
}

// categoria do backend é um slug livre (ex.: "comunicacao"); o front hoje só
// coleta a especialidade do profissional — normalizamos pra um slug estável.
export function slugCategoria(especialidade: string) {
  return especialidade
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function unslugCategoria(categoria: string) {
  return categoria
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

// Formato "TherapeuticObjective" que src/pages/Pacientes/objectiveStorage.ts
// (mock) já define e que os componentes de exibição sabem renderizar —
// aqui com id/patientId como string (UUID real).
export interface RealObjective {
  id: string;
  patientId: string;
  generalObjective: string;
  title: string;
  specialty: string;
  professional: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: FrontObjectiveStatus;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

const PREFIXO_OBJETIVO_GERAL = "Objetivo geral: ";

export function paraTherapeuticObjective(dados: ApiObjetivo): RealObjective {
  let generalObjective = "";
  let observation = dados.descricao ?? "";

  if (observation.startsWith(PREFIXO_OBJETIVO_GERAL)) {
    generalObjective = observation.slice(PREFIXO_OBJETIVO_GERAL.length);
    observation = "";
  }

  return {
    id: dados.id,
    patientId: dados.pacienteId,
    generalObjective: generalObjective || "Objetivo terapêutico geral",
    title: dados.nome,
    specialty: unslugCategoria(dados.categoria),
    professional: dados.profissional?.usuario.nome ?? "",
    startDate: "",
    targetDate: "",
    progress: dados.progresso,
    status: statusObjetivoParaFront(dados.status),
    observation,
    createdAt: dados.criadoEm,
    updatedAt: dados.atualizadoEm,
  };
}
