import { api } from "./api";

import type { PatientSchema } from "@/components/pacientes/form";

export type PatientStatus = "Ativo" | "Inativo";

// Mesmo formato de "StoredPatient" (src/pages/Pacientes/patientStorage.ts,
// ainda usado pelos módulos não migrados nesta etapa: Financeiro, Evoluções,
// Objetivos, Relatórios), mas com `id: string` (UUID real da API) em vez de
// `id: number` (mock). Definido à parte para não quebrar quem ainda depende
// do id numérico do mock.
export interface RealPatient extends PatientSchema {
  id: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

// Espelha os campos retornados por GET/POST/PUT /pacientes na API
// (ver RepositorioPacientes.SELECT_PACIENTE no backend).
export interface ApiPaciente {
  id: string;
  nome: string;
  dataNascimento: string;
  sexo: string;
  foto: string | null;
  status: "ativo" | "inativo";
  responsavel: string | null;
  telefone: string | null;
  diagnostico: string | null;
  tags: string[];
  cpf: string | null;
  rg: string | null;
  cns: string | null;
  estadoCivil: string | null;
  celular: string | null;
  email: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  complemento: string | null;
  convenio: string | null;
  numeroCarteirinha: string | null;
  tipoSanguineo: string | null;
  alergias: string | null;
  responsavelCpf: string | null;
  responsavelParentesco: string | null;
  responsavelTelefone: string | null;
  responsavelEmail: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

interface ListarPacientesParams {
  busca?: string;
  status?: "ativo" | "inativo";
  pagina?: number;
  porPagina?: number;
}

interface ListarPacientesResponse {
  dados: ApiPaciente[];
  meta: { total: number; pagina: number; porPagina: number; totalPaginas: number };
}

export async function listarPacientes(
  params: ListarPacientesParams = {}
): Promise<ListarPacientesResponse> {
  const response = await api.get<ListarPacientesResponse>("/pacientes", { params });
  return response.data;
}

export async function buscarPaciente(id: string): Promise<ApiPaciente> {
  const response = await api.get<{ paciente: ApiPaciente }>(`/pacientes/${id}`);
  return response.data.paciente;
}

// PatientSchema (formulário) → payload da API. Nomes já batem quase 1:1;
// só `nascimento` → `dataNascimento` e `responsavelNome` → `responsavel`
// (o mesmo conceito, nomes diferentes dos dois lados) precisam de tradução.
function paraPayloadApi(data: PatientSchema) {
  const {
    nascimento,
    responsavelNome,
    ...resto
  } = data;

  return {
    ...resto,
    dataNascimento: nascimento,
    responsavel: responsavelNome,
  };
}

export async function criarPaciente(data: PatientSchema): Promise<ApiPaciente> {
  const response = await api.post<{ paciente: ApiPaciente }>(
    "/pacientes",
    paraPayloadApi(data)
  );
  return response.data.paciente;
}

export async function atualizarPaciente(
  id: string,
  data: Partial<PatientSchema>
): Promise<ApiPaciente> {
  const response = await api.put<{ paciente: ApiPaciente }>(
    `/pacientes/${id}`,
    paraPayloadApi(data as PatientSchema)
  );
  return response.data.paciente;
}

// DELETE /pacientes/:id é soft-delete no backend (status vira "inativo",
// o registro continua existindo). Mantido com esse nome só por familiaridade
// de quem já usava a versão mock — o efeito real é inativar.
export async function excluirPaciente(id: string): Promise<void> {
  await api.delete(`/pacientes/${id}`);
}

// Adapta o formato da API para o StoredPatient que as telas do módulo
// Pacientes já sabem renderizar (PatientOverview, PatientProfileHeader,
// PatientForm etc.), evitando reescrever esses componentes.
export function paraStoredPatient(dados: ApiPaciente): RealPatient {
  const status: PatientStatus = dados.status === "ativo" ? "Ativo" : "Inativo";

  return {
    id: dados.id,
    nome: dados.nome,
    cpf: dados.cpf ?? "",
    rg: dados.rg ?? "",
    cns: dados.cns ?? "",
    nascimento: dados.dataNascimento.slice(0, 10),
    sexo: dados.sexo,
    estadoCivil: dados.estadoCivil ?? "",
    telefone: dados.telefone ?? "",
    celular: dados.celular ?? "",
    email: dados.email ?? "",
    cep: dados.cep ?? "",
    rua: dados.rua ?? "",
    numero: dados.numero ?? "",
    bairro: dados.bairro ?? "",
    cidade: dados.cidade ?? "",
    estado: dados.estado ?? "",
    complemento: dados.complemento ?? "",
    convenio: dados.convenio ?? "",
    numeroCarteirinha: dados.numeroCarteirinha ?? "",
    tipoSanguineo: dados.tipoSanguineo ?? "",
    alergias: dados.alergias ?? "",
    responsavelNome: dados.responsavel ?? "",
    responsavelCpf: dados.responsavelCpf ?? "",
    responsavelParentesco: dados.responsavelParentesco ?? "",
    responsavelTelefone: dados.responsavelTelefone ?? "",
    responsavelEmail: dados.responsavelEmail ?? "",
    observacoes: dados.observacoes ?? "",
    status,
    createdAt: dados.criadoEm,
    updatedAt: dados.atualizadoEm,
  };
}
