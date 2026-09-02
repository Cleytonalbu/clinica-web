import axios from "axios";

import { getAuthSession } from "@/auth/authStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getAuthSession()?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
