import { api } from "./api";

export interface LoginRequest {
  email: string;
  senha: string;
}

// Espelha o enum Papel do backend (prisma/schema.prisma). RESPONSAVEL ainda
// não existe na API — será adicionado quando o portal de responsáveis for
// implementado (ver relatório de integração, Fase 6).
export type Papel =
  | "GESTOR"
  | "PROFISSIONAL"
  | "RECEPCIONISTA"
  | "ADMINISTRATIVO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  foto?: string | null;
}

interface MeResponse {
  usuario: Usuario;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function me(): Promise<Usuario> {
  const response = await api.get<MeResponse>("/auth/me");
  return response.data.usuario;
}
