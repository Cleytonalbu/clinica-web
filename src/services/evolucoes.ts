import { api } from "./api";

export interface ApiEvolucao {
  id: string;
  pacienteId: string;
  profissionalId: string;
  agendamentoId: string | null;
  modeloEvolucaoId: string | null;
  dataAtendimento: string;
  horaInicio: string;
  horaFim: string;
  especialidade: string;
  tipoAtendimento: string;
  localAtendimento: string | null;
  evolucaoEscrita: string | null;
  resultadoGeral: string | null;
  impactos: string[];
  observacoes: string | null;
  respostas: unknown;
  rascunho: boolean;
  assinadoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  profissional?: { id: string; usuario: { id: string; nome: string; foto: string | null } };
  paciente?: { id: string; nome: string; foto: string | null };
  objetivosSessao?: {
    id: string;
    objetivoId: string;
    statusNaSessao: string;
    nivelDesempenho: number | null;
    objetivo?: { id: string; nome: string; categoria: string; progresso: number };
  }[];
  anexos?: ApiAnexo[];
  _count?: { objetivosSessao: number; anexos: number };
}

export interface ApiAnexo {
  id: string;
  evolucaoId: string;
  nomeArquivo: string;
  tipo: string;
  tamanhoBytes: number;
  criadoEm: string;
}

interface ListarEvolucoesParams {
  profissionalId?: string;
  dataInicio?: string;
  dataFim?: string;
  rascunho?: boolean;
}

export async function listarEvolucoes(
  pacienteId: string,
  params: ListarEvolucoesParams = {}
): Promise<{ dados: ApiEvolucao[] }> {
  const response = await api.get<{ dados: ApiEvolucao[] }>(
    `/pacientes/${pacienteId}/evolucoes`,
    { params }
  );
  return response.data;
}

export async function buscarEvolucao(id: string): Promise<ApiEvolucao> {
  const response = await api.get<{ evolucao: ApiEvolucao }>(`/evolucoes/${id}`);
  return response.data.evolucao;
}

export interface ObjetivoSessaoPayload {
  objetivoId: string;
  statusNaSessao: string;
  nivelDesempenho?: number;
}

export interface CriarEvolucaoPayload {
  pacienteId: string;
  profissionalId: string;
  agendamentoId?: string;
  dataAtendimento: string;
  horaInicio: string;
  horaFim: string;
  especialidade: string;
  tipoAtendimento: string;
  localAtendimento?: string;
  evolucaoEscrita?: string;
  resultadoGeral?: string;
  impactos?: string[];
  observacoes?: string;
  rascunho?: boolean;
  objetivosSessao?: ObjetivoSessaoPayload[];
}

export async function criarEvolucao(dados: CriarEvolucaoPayload): Promise<ApiEvolucao> {
  const response = await api.post<{ evolucao: ApiEvolucao }>("/evolucoes", dados);
  return response.data.evolucao;
}

export async function atualizarEvolucao(
  id: string,
  dados: Partial<CriarEvolucaoPayload>
): Promise<ApiEvolucao> {
  const response = await api.put<{ evolucao: ApiEvolucao }>(`/evolucoes/${id}`, dados);
  return response.data.evolucao;
}

export async function assinarEvolucao(id: string): Promise<ApiEvolucao> {
  const response = await api.post<{ evolucao: ApiEvolucao }>(`/evolucoes/${id}/assinar`);
  return response.data.evolucao;
}

export async function removerEvolucao(id: string): Promise<void> {
  await api.delete(`/evolucoes/${id}`);
}

// ── Anexos ──────────────────────────────────────────────
export async function listarAnexos(evolucaoId: string): Promise<ApiAnexo[]> {
  const response = await api.get<{ dados: ApiAnexo[] }>(`/evolucoes/${evolucaoId}/anexos`);
  return response.data.dados;
}

export async function enviarAnexo(evolucaoId: string, file: File): Promise<ApiAnexo> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<{ anexo: ApiAnexo }>(
    `/evolucoes/${evolucaoId}/anexos`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.anexo;
}

export async function baixarAnexo(
  anexoId: string
): Promise<{ url: string; nomeArquivo: string }> {
  const response = await api.get<{ url: string; nomeArquivo: string; expiraEmSegundos: number }>(
    `/anexos/${anexoId}/download`
  );
  return response.data;
}

export async function removerAnexo(anexoId: string): Promise<void> {
  await api.delete(`/anexos/${anexoId}`);
}

// ─────────────────────────────────────────────────────────────────────────
// Adaptador para o formato StoredEvolution que os componentes já existentes
// sabem renderizar. Campos de encaminhamento (referralXxx) não existem no
// model Evolucao — são persistidos como um Encaminhamento separado (ver
// criarEncaminhamentoDaEvolucao) e não voltam nesse adaptador (somente
// leitura best-effort, sempre vazios ao carregar uma evolução salva).
// ─────────────────────────────────────────────────────────────────────────

export interface RealEvolutionObjective {
  id: string;
  name: string;
  status: string;
  performance: number;
  markerScore: number | null;
}

export interface RealEvolution {
  id: string;
  patientId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  specialty: string;
  appointmentType: string;
  appointmentLocation: string;
  objectives: RealEvolutionObjective[];
  // Nem sempre `objectives` vem populado: a listagem (GET
  // /pacientes/:id/evolucoes) só traz `_count.objetivosSessao`, não o
  // array completo (só o detalhe, GET /evolucoes/:id, traz). Este campo
  // reflete a contagem real em ambos os casos — usar para exibir "N
  // trabalhado(s)" em telas de lista.
  objectivesWorkedCount: number;
  writtenEvolution: string;
  referralSpecialty: string;
  referralProfessional: string;
  referralReason: string;
  referralPriority: "Baixa" | "Média" | "Alta" | "Urgente";
  referralObservation: string;
  notifyProfessional: boolean;
  addProfessionalAgenda: boolean;
  notifyManager: boolean;
  observedImpacts: string[];
  sessionResult: string;
  sessionResultObservation: string;
  attachments: { id: string; name: string; size: number }[];
  professional: string;
  status: "RASCUNHO" | "FINALIZADA";
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

function paraHoraLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const RESULTADO_GERAL_PARA_FRONT: Record<string, string> = {
  abaixo_esperado: "Abaixo do esperado",
  dentro_esperado: "Dentro do esperado",
  acima_esperado: "Acima do esperado",
};

export function resultadoParaApi(sessionResult: string): string {
  const entrada = Object.entries(RESULTADO_GERAL_PARA_FRONT).find(
    ([, front]) => front === sessionResult
  );
  return entrada?.[0] ?? "dentro_esperado";
}

export function paraStoredEvolution(dados: ApiEvolucao): RealEvolution {
  return {
    id: dados.id,
    patientId: dados.pacienteId,
    sessionDate: dados.dataAtendimento.slice(0, 10),
    startTime: paraHoraLocal(dados.horaInicio),
    endTime: paraHoraLocal(dados.horaFim),
    specialty: dados.especialidade,
    appointmentType: dados.tipoAtendimento,
    appointmentLocation: dados.localAtendimento ?? "",
    objectives: (dados.objetivosSessao ?? []).map((os) => ({
      id: os.objetivoId,
      name: os.objetivo?.nome ?? "",
      status: os.statusNaSessao,
      performance: os.nivelDesempenho ?? 0,
      markerScore: null,
    })),
    objectivesWorkedCount: dados.objetivosSessao?.length ?? dados._count?.objetivosSessao ?? 0,
    writtenEvolution: dados.evolucaoEscrita ?? "",
    referralSpecialty: "",
    referralProfessional: "",
    referralReason: "",
    referralPriority: "Média",
    referralObservation: "",
    notifyProfessional: false,
    addProfessionalAgenda: false,
    notifyManager: false,
    observedImpacts: dados.impactos ?? [],
    sessionResult: dados.resultadoGeral
      ? (RESULTADO_GERAL_PARA_FRONT[dados.resultadoGeral] ?? dados.resultadoGeral)
      : "Dentro do esperado",
    sessionResultObservation: dados.observacoes ?? "",
    attachments: (dados.anexos ?? []).map((a) => ({
      id: a.id,
      name: a.nomeArquivo,
      size: a.tamanhoBytes,
    })),
    professional: dados.profissional?.usuario.nome ?? "",
    status: dados.rascunho ? "RASCUNHO" : "FINALIZADA",
    createdAt: dados.criadoEm,
    updatedAt: dados.atualizadoEm,
    finalizedAt: dados.assinadoEm ?? undefined,
  };
}
