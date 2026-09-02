import { api } from "./api";

// ─────────────────────────────────────────────────────────────────────────
// Mapeamento de status: back-end (StatusAgendamento) x front (StoredAppointmentStatus)
//
// Backend:  AGENDADO | AGUARDANDO | EM_ATENDIMENTO | CONCLUIDO | CANCELADO | FALTOU
// Front:    Agendado | Confirmado |      —         | Realizado | Cancelado | Faltou
//
// EM_ATENDIMENTO (sessão em andamento, controlado pelo profissional) não
// tem tela própria no front ainda, então nunca é setado por aqui — é
// exibido como "Confirmado" (o mais próximo).
// ─────────────────────────────────────────────────────────────────────────

export type ApiStatusAgendamento =
  | "AGENDADO"
  | "AGUARDANDO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "FALTOU";

export type FrontStatus =
  | "Agendado"
  | "Confirmado"
  | "Realizado"
  | "Cancelado"
  | "Faltou";

export function statusParaFront(status: ApiStatusAgendamento): FrontStatus {
  switch (status) {
    case "AGENDADO":
      return "Agendado";
    case "AGUARDANDO":
    case "EM_ATENDIMENTO":
      return "Confirmado";
    case "CONCLUIDO":
      return "Realizado";
    case "CANCELADO":
      return "Cancelado";
    case "FALTOU":
      return "Faltou";
  }
}

export function statusParaApi(status: FrontStatus): ApiStatusAgendamento {
  switch (status) {
    case "Agendado":
      return "AGENDADO";
    case "Confirmado":
      return "AGUARDANDO";
    case "Realizado":
      return "CONCLUIDO";
    case "Cancelado":
      return "CANCELADO";
    case "Faltou":
      return "FALTOU";
  }
}

export interface ApiAgendamento {
  id: string;
  tipo: "ATENDIMENTO" | "BLOQUEIO";
  dataHora: string;
  dataFim: string | null;
  status: ApiStatusAgendamento;
  motivo: string | null;
  horaChegada: string | null;
  observacoes: string | null;
  rascunho: boolean;
  criadoEm: string;
  paciente: {
    id: string;
    nome: string;
    foto: string | null;
    dataNascimento: string;
    diagnostico: string | null;
    tags: string[];
    responsavel: string | null;
  } | null;
  profissional: {
    id: string;
    usuario: { nome: string; foto: string | null };
    especialidades: { especialidade: { nome: string } }[];
  } | null;
  servico: { id: string; nome: string; duracaoMin: number } | null;
  especialidade: { id: string; nome: string; cor: string | null } | null;
  convenio: { id: string; nome: string } | null;
  sala: { id: string; nome: string } | null;
}

interface ListarAgendamentosParams {
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  profissionalId?: string;
  pacienteId?: string;
  status?: ApiStatusAgendamento;
  pagina?: number;
  porPagina?: number;
}

interface ListarAgendamentosResponse {
  dados: ApiAgendamento[];
  meta: { total: number; pagina: number; porPagina: number; totalPaginas: number };
}

export async function listarAgendamentos(
  params: ListarAgendamentosParams = {}
): Promise<ListarAgendamentosResponse> {
  const response = await api.get<ListarAgendamentosResponse>("/agendamentos", { params });
  return response.data;
}

export async function buscarAgendamento(id: string): Promise<ApiAgendamento> {
  const response = await api.get<{ agendamento: ApiAgendamento }>(`/agendamentos/${id}`);
  return response.data.agendamento;
}

export interface CriarAgendamentoPayload {
  pacienteId: string;
  profissionalId: string;
  servicoId: string;
  especialidadeId?: string;
  convenioId?: string;
  salaId?: string;
  dataHora: string;
  dataFim?: string;
  observacoes?: string;
  rascunho?: boolean;
}

export async function criarAgendamento(dados: CriarAgendamentoPayload): Promise<ApiAgendamento> {
  const response = await api.post<{ agendamento: ApiAgendamento }>("/agendamentos", dados);
  return response.data.agendamento;
}

export async function atualizarAgendamento(
  id: string,
  dados: Partial<CriarAgendamentoPayload>
): Promise<ApiAgendamento> {
  const response = await api.put<{ agendamento: ApiAgendamento }>(`/agendamentos/${id}`, dados);
  return response.data.agendamento;
}

// Motivo registrado quando o status é alterado para "Faltou" — usado nos
// indicadores de "Faltas por motivo". Opcional: nem toda falta precisa ter
// motivo informado.
export type MotivoFalta =
  | "PROBLEMAS_SAUDE"
  | "COMPROMISSOS_PESSOAIS"
  | "ESQUECIMENTO"
  | "OUTROS";

export const LABELS_MOTIVO_FALTA: Record<MotivoFalta, string> = {
  PROBLEMAS_SAUDE: "Problemas de saúde",
  COMPROMISSOS_PESSOAIS: "Compromissos pessoais",
  ESQUECIMENTO: "Esquecimento",
  OUTROS: "Outros",
};

export async function alterarStatusAgendamento(
  id: string,
  status: FrontStatus,
  motivoFalta?: MotivoFalta
): Promise<ApiAgendamento> {
  const response = await api.patch<{ agendamento: ApiAgendamento }>(
    `/agendamentos/${id}/status`,
    { status: statusParaApi(status), motivoFalta }
  );
  return response.data.agendamento;
}

// DELETE /agendamentos/:id cancela (soft) — igual ao restante da API.
export async function cancelarAgendamento(id: string): Promise<void> {
  await api.delete(`/agendamentos/${id}`);
}

// Check-in da recepção: marca a chegada e move o agendamento para a fila
// (status AGUARDANDO). Só funciona enquanto o status ainda é AGENDADO.
export async function registrarChegadaAgendamento(id: string): Promise<ApiAgendamento> {
  const response = await api.patch<{ agendamento: ApiAgendamento }>(
    `/agendamentos/${id}/chegada`
  );
  return response.data.agendamento;
}

export interface CriarBloqueioPayload {
  profissionalId: string;
  dataHora: string;
  dataFim: string;
  motivo?: string;
  salaId?: string;
}

export async function criarBloqueio(dados: CriarBloqueioPayload): Promise<ApiAgendamento> {
  const response = await api.post<{ agendamento: ApiAgendamento }>(
    "/agendamentos/bloqueio",
    dados
  );
  return response.data.agendamento;
}

// ─────────────────────────────────────────────────────────────────────────
// Adaptador para o formato StoredAppointment que as telas de Agenda já
// sabem renderizar. Campos de Financeiro (billingType, paymentMethod,
// serviceValue, patientPackageId) e `unitId` (multiunidade) não existem
// ainda no backend — ficam como decoração client-side, undefined vindos da
// API real (não são persistidos até esses módulos serem migrados).
// ─────────────────────────────────────────────────────────────────────────

export interface RealAppointment {
  id: string;
  patientId: string;
  unitId: number;
  patient: string;
  professional: string;
  specialty: string;
  date: string;
  time: string;
  endTime: string;
  room: string;
  type: string;
  status: FrontStatus;
  observations?: string;
  tipo: "ATENDIMENTO" | "BLOQUEIO";
  motivo?: string;
}

function paraDataHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function paraStoredAppointment(dados: ApiAgendamento, unitIdAtiva: number): RealAppointment {
  const inicio = paraDataHora(dados.dataHora);
  const fim = dados.dataFim ? paraDataHora(dados.dataFim).time : "";

  return {
    id: dados.id,
    patientId: dados.paciente?.id ?? "",
    unitId: unitIdAtiva,
    patient: dados.paciente?.nome ?? (dados.tipo === "BLOQUEIO" ? "Bloqueio" : "-"),
    professional: dados.profissional?.usuario.nome ?? "-",
    specialty: dados.especialidade?.nome ?? dados.profissional?.especialidades[0]?.especialidade.nome ?? "",
    date: inicio.date,
    time: inicio.time,
    endTime: fim,
    room: dados.sala?.nome ?? "-",
    type: dados.servico?.nome ?? "",
    status: statusParaFront(dados.status),
    observations: dados.observacoes ?? dados.motivo ?? undefined,
    tipo: dados.tipo,
    motivo: dados.motivo ?? undefined,
  };
}
