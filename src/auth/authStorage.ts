import {
  getPermissionProfileByName,
  type PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

import { login as loginRequest, type Papel } from "@/services/auth";

export type UserProfile =
  | "Gestor"
  | "Recepção"
  | "Profissional"
  | "Administrativo";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  professionalName?: string;
  avatar?: string;
}

// Mantido apenas pela tipagem — nenhum código ainda constrói um StoredUser
// real (a lista de usuários mockada foi removida junto da autenticação
// falsa). Fica para quando a tela de Usuários/Acessos passar a consumir
// GET /usuarios da API.
export interface StoredUser extends AuthUser {
  password: string;
  active: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  createdAt: string;
}

const SESSION_STORAGE_KEY = "entre-afetos-auth-session";

// Papel (enum do backend) → UserProfile (rótulo em PT usado no front para
// rotas/permissões). Mantém os nomes de perfil já usados em todo o app.
function mapPapelToProfile(papel: Papel): UserProfile {
  switch (papel) {
    case "GESTOR":
      return "Gestor";
    case "RECEPCIONISTA":
      return "Recepção";
    case "PROFISSIONAL":
      return "Profissional";
    case "ADMINISTRATIVO":
      return "Administrativo";
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<
  | { success: true; session: AuthSession }
  | { success: false; message: string }
> {
  let response;

  try {
    response = await loginRequest({ email, senha: password });
  } catch (err: any) {
    const status = err?.response?.status;
    const mensagem = err?.response?.data?.mensagem;

    if (status === 401) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    if (status === 403) {
      return {
        success: false,
        message: mensagem || "Este usuário está inativo.",
      };
    }

    return {
      success: false,
      message:
        mensagem || "Não foi possível entrar. Verifique sua conexão e tente novamente.",
    };
  }

  const profileName = mapPapelToProfile(response.usuario.papel);

  const profile = getPermissionProfileByName(profileName);

  if (!profile || !profile.active) {
    return {
      success: false,
      message: "O perfil deste usuário está inativo ou não está disponível.",
    };
  }

  const authUser: AuthUser = {
    id: response.usuario.id,
    name: response.usuario.nome,
    email: response.usuario.email,
    profile: profileName,
    // A API ainda não expõe um "nome de exibição profissional" separado —
    // usamos o próprio nome do usuário. Ajustar quando /auth/login passar a
    // incluir os dados do registro de Profissional vinculado.
    professionalName:
      profileName === "Profissional" ? response.usuario.nome : undefined,
    avatar: response.usuario.foto ?? undefined,
  };

  const session: AuthSession = {
    user: authUser,
    token: response.token,
    createdAt: new Date().toISOString(),
  };

  saveAuthSession(session);

  return { success: true, session };
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthSession());
}

export function getCurrentUser(): AuthUser | null {
  return getAuthSession()?.user ?? null;
}

export function getCurrentUserProfile() {
  return getCurrentUser()?.profile ?? null;
}

export function canCurrentUserAccessModule(module: PermissionModuleKey) {
  const user = getCurrentUser();
  if (!user) return false;

  const profile = getPermissionProfileByName(user.profile);
  if (!profile || !profile.active) return false;

  return Boolean(profile.modules[module]?.view);
}

export function canCurrentUserPerform(
  module: PermissionModuleKey,
  permission: "view" | "create" | "edit" | "delete" | "manage"
) {
  const user = getCurrentUser();
  if (!user) return false;

  const profile = getPermissionProfileByName(user.profile);
  if (!profile || !profile.active) return false;

  return Boolean(profile.modules[module]?.[permission]);
}
