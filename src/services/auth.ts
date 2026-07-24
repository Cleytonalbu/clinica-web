import { api } from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

export async function login(data: LoginRequest) {
  const response = await api.post("/auth/login", data);

  return response.data;
}