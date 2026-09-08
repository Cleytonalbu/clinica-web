import {
  getPermissionProfileByName,
  getProfessionalById,
  getProfessionalByName,
  type PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

export type UserProfile =
  | "Gestor"
  | "Recepção"
  | "Profissional"
  | "Administrativo";

export interface AuthUser {
  id: number;

  name: string;

  email: string;

  /** Perfil atualmente ativo na sessão. No cadastro salvo, continua sendo o perfil principal. */
  profile: UserProfile;

  /** Perfil principal do usuário. Mantido na sessão mesmo quando a área ativa muda. */
  primaryProfile?: UserProfile;

  /** Perfis adicionais liberados para o mesmo login. */
  additionalProfiles?: UserProfile[];

  /**
   * Referência canônica ao cadastro do profissional.
   * professionalName permanece para exibição e compatibilidade.
   */
  professionalId?: number;

  professionalName?: string;

  /** Referência ao cadastro administrativo quando o usuário é colaborador. */
  collaboratorId?: string;

  collaboratorName?: string;

  avatar?: string;
}

export interface StoredUser extends AuthUser {
  password: string;

  active: boolean;
}

export interface AuthSession {
  user: AuthUser;

  token: string;

  createdAt: string;
}

const USERS_STORAGE_KEY =
  "entre-afetos-users";

const SESSION_STORAGE_KEY =
  "entre-afetos-auth-session";

const defaultUsers: StoredUser[] = [
  {
    id: 1,

    name: "Administrador",

    email: "gestor@entreafetos.com.br",

    password: "123456",

    profile: "Gestor",

    active: true,
  },

  {
    id: 2,

    name: "Recepção",

    email: "recepcao@entreafetos.com.br",

    password: "123456",

    profile: "Recepção",

    active: true,
  },

  {
    id: 3,

    name: "Dra. Ana Paula",

    email: "ana@entreafetos.com.br",

    password: "123456",

    profile: "Profissional",

    professionalId: 1,

    professionalName: "Dra. Ana Paula",

    active: true,
  },

  {
    id: 4,

    name: "Administrativo",

    email: "administrativo@entreafetos.com.br",

    password: "123456",

    profile: "Administrativo",

    active: true,
  },

  {
    id: 5,

    name: "Dra. Mariana Nutricionista",

    email: "nutricao@entreafetos.com.br",

    password: "123456",

    profile: "Profissional",

    professionalId: 5,

    professionalName: "Dra. Mariana Nutricionista",

    active: true,
  },

  {
    id: 6,

    name: "Dr. Rafael Costa",

    email: "fisioterapia@entreafetos.com.br",

    password: "123456",

    profile: "Profissional",

    professionalId: 4,

    professionalName: "Dr. Rafael Costa",

    active: true,
  },
];

const VALID_USER_PROFILES: UserProfile[] = [
  "Gestor",
  "Recepção",
  "Profissional",
  "Administrativo",
];

function normalizeAdditionalProfiles(
  primaryProfile: UserProfile,
  profiles: UserProfile[] | undefined
) {
  if (!Array.isArray(profiles)) {
    return [];
  }

  return Array.from(
    new Set(
      profiles.filter(
        (profile): profile is UserProfile =>
          VALID_USER_PROFILES.includes(profile) &&
          profile !== primaryProfile
      )
    )
  );
}

export function getUserProfiles(
  user: Pick<AuthUser, "profile" | "primaryProfile" | "additionalProfiles">
): UserProfile[] {
  const primary =
    user.primaryProfile ??
    user.profile;

  return Array.from(
    new Set([
      primary,
      ...normalizeAdditionalProfiles(
        primary,
        user.additionalProfiles
      ),
    ])
  );
}

export function userHasProfile(
  user: Pick<AuthUser, "profile" | "primaryProfile" | "additionalProfiles"> | null | undefined,
  profile: UserProfile
) {
  return Boolean(
    user &&
    getUserProfiles(user).includes(profile)
  );
}

function generateToken() {
  return [
    Date.now().toString(36),

    Math.random()
      .toString(36)
      .slice(2),

    Math.random()
      .toString(36)
      .slice(2),
  ].join(".");
}

export function getStoredUsers(): StoredUser[] {
  try {
    const stored =
      localStorage.getItem(
        USERS_STORAGE_KEY
      );

    const parsed =
      stored
        ? JSON.parse(
            stored
          ) as StoredUser[]
        : [];

    const baseUsers =
      Array.isArray(
        parsed
      )
        ? parsed
        : [];

    const missingDefaults =
      defaultUsers.filter(
        (defaultUser) =>
          !baseUsers.some(
            (user) =>
              user.email
                .trim()
                .toLowerCase() ===
              defaultUser.email
                .trim()
                .toLowerCase()
          )
      );

    const withDefaults = [
      ...baseUsers,
      ...missingDefaults,
    ];

    /*
     * Migração compatível:
     * logins profissionais antigos que guardavam apenas
     * professionalName passam a receber professionalId.
     */
    const normalized =
      withDefaults.map(
        (user) => {
          const additionalProfiles =
            normalizeAdditionalProfiles(
              user.profile,
              user.additionalProfiles
            );

          const normalizedBase = {
            ...user,
            primaryProfile:
              user.profile,
            additionalProfiles,
          };

          if (
            user.profile !==
            "Profissional"
          ) {
            if (!user.collaboratorId) {
              return normalizedBase;
            }

            const collaborator =
              getAdministrativeCollaborators().find(
                (item) => item.id === user.collaboratorId
              );

            if (!collaborator) {
              return normalizedBase;
            }

            return {
              ...normalizedBase,
              name: collaborator.name,
              collaboratorName: collaborator.name,
            };
          }

          const linkedProfessional =
            user.professionalId !==
              undefined
              ? getProfessionalById(
                  user.professionalId
                )
              : getProfessionalByName(
                  user.professionalName ??
                    user.name
                );

          if (
            !linkedProfessional
          ) {
            return normalizedBase;
          }

          return {
            ...normalizedBase,

            professionalId:
              linkedProfessional.id,

            /*
             * O cadastro profissional é a fonte oficial
             * do nome exibido pelo sistema.
             */
            name:
              linkedProfessional.name,

            professionalName:
              linkedProfessional.name,
          };
        }
      );

    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    return normalized;
  } catch {
    return defaultUsers;
  }
}

export function saveStoredUsers(
  users: StoredUser[]
) {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(
      users
    )
  );
}


export function setStoredUserAdditionalProfiles(
  userId: number,
  additionalProfiles: UserProfile[]
) {
  const users =
    getStoredUsers();

  const target =
    users.find(
      (user) =>
        user.id === userId
    );

  if (!target) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  if (
    target.profile ===
      "Profissional" &&
    additionalProfiles.length >
      0
  ) {
    throw new Error(
      "O perfil Profissional deve permanecer exclusivo para preservar autoria clínica e permissões do prontuário."
    );
  }

  const normalized =
    normalizeAdditionalProfiles(
      target.profile,
      additionalProfiles
    );

  const next =
    users.map(
      (user) =>
        user.id === userId
          ? {
              ...user,
              primaryProfile:
                user.profile,
              additionalProfiles:
                normalized,
            }
          : user
    );

  saveStoredUsers(next);

  const session =
    getAuthSession();

  if (
    session?.user.id ===
    userId
  ) {
    const primaryProfile =
      target.profile;

    const activeProfile =
      getUserProfiles({
        profile:
          session.user.profile,
        primaryProfile,
        additionalProfiles:
          normalized,
      }).includes(
        session.user.profile
      )
        ? session.user.profile
        : primaryProfile;

    saveAuthSession({
      ...session,
      user: {
        ...session.user,
        profile:
          activeProfile,
        primaryProfile,
        additionalProfiles:
          normalized,
      },
    });
  }

  return next.find(
    (user) =>
      user.id === userId
  );
}

export interface CreateProfessionalLoginData {
  professionalId: number;
  email: string;
  password: string;
  active?: boolean;
}

export function getProfessionalLoginByProfessionalId(
  professionalId: number
) {
  return getStoredUsers().find(
    (user) =>
      user.profile ===
        "Profissional" &&
      user.professionalId ===
        professionalId
  );
}

export function createProfessionalLogin({
  professionalId,
  email,
  password,
  active = true,
}: CreateProfessionalLoginData) {
  const professional =
    getProfessionalById(
      professionalId
    );

  if (!professional) {
    throw new Error(
      "Profissional não encontrado."
    );
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Informe o e-mail do usuário."
    );
  }

  if (
    password.length <
    6
  ) {
    throw new Error(
      "A senha deve possuir pelo menos 6 caracteres."
    );
  }

  const users =
    getStoredUsers();

  const existingProfessional =
    users.find(
      (user) =>
        user.profile ===
          "Profissional" &&
        (
          user.professionalId ===
            professionalId ||
          (
            user.professionalId ===
              undefined &&
            user.professionalName ===
              professional.name
          )
        )
    );

  if (
    existingProfessional
  ) {
    throw new Error(
      "Este profissional já possui um login cadastrado."
    );
  }

  const existingEmail =
    users.some(
      (user) =>
        user.email
          .trim()
          .toLowerCase() ===
        normalizedEmail
    );

  if (
    existingEmail
  ) {
    throw new Error(
      "Já existe um usuário utilizando este e-mail."
    );
  }

  const nextId =
    users.reduce(
      (
        highest,
        user
      ) =>
        Math.max(
          highest,
          user.id
        ),
      0
    ) + 1;

  const user:
    StoredUser = {
    id:
      nextId,

    name:
      professional.name,

    email:
      normalizedEmail,

    password,

    profile:
      "Profissional",

    professionalId:
      professional.id,

    professionalName:
      professional.name,

    active,
  };

  saveStoredUsers(
    [
      ...users,
      user,
    ]
  );

  return user;
}

export interface CreateCollaboratorLoginData {
  collaboratorId: string;
  profile: "Recepção" | "Administrativo";
  email: string;
  password: string;
  active?: boolean;
}

export function getCollaboratorLoginByCollaboratorId(
  collaboratorId: string
) {
  return getStoredUsers().find(
    (user) => user.collaboratorId === collaboratorId
  );
}

export function createCollaboratorLogin({
  collaboratorId,
  profile,
  email,
  password,
  active = true,
}: CreateCollaboratorLoginData) {
  const collaborator =
    getAdministrativeCollaborators().find(
      (item) => item.id === collaboratorId
    );

  if (!collaborator) {
    throw new Error("Colaborador não encontrado.");
  }

  if (collaborator.status !== "Ativo") {
    throw new Error("Este colaborador está inativo.");
  }

  if (
    collaborator.type !== "Recepção" &&
    collaborator.type !== "Administrativo"
  ) {
    throw new Error(
      "Somente colaboradores de Recepção ou Administrativo podem receber este tipo de login."
    );
  }

  if (collaborator.type !== profile) {
    throw new Error(
      `O perfil de acesso deve corresponder ao tipo do colaborador (${collaborator.type}).`
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Informe o e-mail do usuário.");
  }

  if (password.length < 6) {
    throw new Error("A senha deve possuir pelo menos 6 caracteres.");
  }

  const users = getStoredUsers();

  if (
    users.some(
      (user) => user.collaboratorId === collaboratorId
    )
  ) {
    throw new Error(
      "Este colaborador já possui um login cadastrado."
    );
  }

  if (
    users.some(
      (user) =>
        user.email.trim().toLowerCase() === normalizedEmail
    )
  ) {
    throw new Error(
      "Já existe um usuário utilizando este e-mail."
    );
  }

  const nextId =
    users.reduce(
      (highest, user) => Math.max(highest, user.id),
      0
    ) + 1;

  const user: StoredUser = {
    id: nextId,
    name: collaborator.name,
    email: normalizedEmail,
    password,
    profile,
    collaboratorId: collaborator.id,
    collaboratorName: collaborator.name,
    active,
  };

  saveStoredUsers([...users, user]);

  return user;
}

export function setStoredUserActive(
  userId: number,
  active: boolean
) {
  const users =
    getStoredUsers();

  const next =
    users.map(
      (user) =>
        user.id ===
          userId
          ? {
              ...user,
              active,
            }
          : user
    );

  saveStoredUsers(
    next
  );

  return next.find(
    (user) =>
      user.id ===
      userId
  );
}

export function resetStoredUserPassword(
  userId: number,
  newPassword: string
) {
  if (
    newPassword.length <
    6
  ) {
    throw new Error(
      "A nova senha deve possuir pelo menos 6 caracteres."
    );
  }

  const users =
    getStoredUsers();

  const target =
    users.find(
      (user) =>
        user.id ===
        userId
    );

  if (!target) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  const next =
    users.map(
      (user) =>
        user.id ===
          userId
          ? {
              ...user,
              password:
                newPassword,
            }
          : user
    );

  saveStoredUsers(
    next
  );

  return next.find(
    (user) =>
      user.id ===
      userId
  );
}

export function authenticateUser(
  email: string,
  password: string
):
  | {
      success: true;

      session: AuthSession;
    }
  | {
      success: false;

      message: string;
    } {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const users =
    getStoredUsers();

  const user =
    users.find(
      (
        item
      ) =>
        item.email
          .trim()
          .toLowerCase() ===
        normalizedEmail
    );

  if (!user) {
    return {
      success: false,

      message:
        "E-mail ou senha inválidos.",
    };
  }

  if (!user.active) {
    return {
      success: false,

      message:
        "Este usuário está inativo.",
    };
  }

  if (
    user.password !==
    password
  ) {
    return {
      success: false,

      message:
        "E-mail ou senha inválidos.",
    };
  }

  const profile =
    getPermissionProfileByName(
      user.profile
    );

  if (
    !profile ||
    !profile.active
  ) {
    return {
      success: false,

      message:
        "O perfil deste usuário está inativo ou não está disponível.",
    };
  }

  const linkedProfessional =
    user.profile ===
      "Profissional"
      ? (
          user.professionalId !==
            undefined
            ? getProfessionalById(
                user.professionalId
              )
            : getProfessionalByName(
                user.professionalName ??
                  user.name
              )
        )
      : undefined;

  const authUser: AuthUser = {
    id:
      user.id,

    name:
      linkedProfessional?.name ??
      user.name,

    email:
      user.email,

    profile:
      user.profile,

    primaryProfile:
      user.profile,

    additionalProfiles:
      normalizeAdditionalProfiles(
        user.profile,
        user.additionalProfiles
      ),

    professionalId:
      linkedProfessional?.id ??
      user.professionalId,

    professionalName:
      linkedProfessional?.name ??
      user.professionalName,

    collaboratorId:
      user.collaboratorId,

    collaboratorName:
      user.collaboratorName,

    avatar:
      user.avatar,
  };

  const session: AuthSession = {
    user:
      authUser,

    token:
      generateToken(),

    createdAt:
      new Date().toISOString(),
  };

  saveAuthSession(
    session
  );

  return {
    success: true,

    session,
  };
}

export function switchAuthSessionProfile(
  profile: UserProfile
) {
  const session =
    getAuthSession();

  if (!session) {
    throw new Error(
      "Sessão não encontrada."
    );
  }

  const allowedProfiles =
    getUserProfiles(
      session.user
    );

  if (
    !allowedProfiles.includes(
      profile
    )
  ) {
    throw new Error(
      "Este perfil não está liberado para o usuário."
    );
  }

  const nextSession: AuthSession = {
    ...session,
    user: {
      ...session.user,
      profile,
    },
  };

  saveAuthSession(
    nextSession
  );

  return nextSession;
}

export function saveAuthSession(
  session: AuthSession
) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(
      session
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      "entre-afetos-auth-session-changed"
    )
  );
}

export function getAuthSession():
  | AuthSession
  | null {
  try {
    const stored =
      localStorage.getItem(
        SESSION_STORAGE_KEY
      );

    if (!stored) {
      return null;
    }

    return JSON.parse(
      stored
    ) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(
    SESSION_STORAGE_KEY
  );

  window.dispatchEvent(
    new CustomEvent(
      "entre-afetos-auth-session-changed"
    )
  );
}

export function isAuthenticated() {
  return Boolean(
    getAuthSession()
  );
}

export function getCurrentUser():
  | AuthUser
  | null {
  return (
    getAuthSession()?.user ??
    null
  );
}

export function getCurrentUserProfile() {
  return (
    getCurrentUser()?.profile ??
    null
  );
}

export function canCurrentUserAccessModule(
  module:
    PermissionModuleKey
) {
  const user =
    getCurrentUser();

  if (!user) {
    return false;
  }

  const profile =
    getPermissionProfileByName(
      user.profile
    );

  if (
    !profile ||
    !profile.active
  ) {
    return false;
  }

  return Boolean(
    profile.modules[
      module
    ]?.view
  );
}

export function canCurrentUserPerform(
  module:
    PermissionModuleKey,

  permission:
    | "view"
    | "create"
    | "edit"
    | "delete"
    | "manage"
) {
  const user =
    getCurrentUser();

  if (!user) {
    return false;
  }

  const profile =
    getPermissionProfileByName(
      user.profile
    );

  if (
    !profile ||
    !profile.active
  ) {
    return false;
  }

  return Boolean(
    profile.modules[
      module
    ]?.[
      permission
    ]
  );
}