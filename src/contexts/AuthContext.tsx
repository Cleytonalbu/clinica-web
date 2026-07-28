import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { User } from "../services/auth";

import {
  login as loginService,
  me,
  salvarToken,
  removerToken,
  obterToken,
} from "../services/auth";

interface LoginData {
  email: string;
  senha: string;
}

interface AuthContextData {
  usuario: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login(data: LoginData): Promise<void>;
  logout(): void;
  refreshUser(): Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const usuario = await me();

      setUsuario(usuario);
    } catch {
      removerToken();
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    async function carregarUsuario() {
      const token = obterToken();

      if (!token) {
        setLoading(false);
        return;
      }

      await refreshUser();

      setLoading(false);
    }

    carregarUsuario();
  }, [refreshUser]);

  async function login(data: LoginData) {
    const response = await loginService(data);

    salvarToken(response.token);

    setUsuario(response.usuario);
  }

  function logout() {
    removerToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}