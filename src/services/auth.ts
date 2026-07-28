import { api } from "./api";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: "GESTOR" | "PROFISSIONAL" | "RESPONSAVEL";
  foto?: string | null;
}

interface MeResponse {
  usuario: User;
}

export interface LoginResponse {
  usuario: User;
  token: string;
}

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

export async function me(): Promise<User> {
  const response =
    await api.get<MeResponse>("/auth/me");

  return response.data.usuario;
}

export function salvarToken(token: string) {
  localStorage.setItem("@entreafetos:token", token);
}

export function removerToken() {
  localStorage.removeItem("@entreafetos:token");
}

export function obterToken() {
  return localStorage.getItem("@entreafetos:token");
}