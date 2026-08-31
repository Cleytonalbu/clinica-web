import {
  getPermissionProfileByName,
  getProfessionalById,
  getProfessionalByName,
  type PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

export type UserProfile =
  | "Gestor"
  | "Recepção"
  | "Profissional"
  | "Administrativo";

export interface AuthUser {
  id: number;

  name: string;

  email: string;

  profile: UserProfile;

  /**
   * Referência canônica ao cadastro do profissional.
   * professionalName permanece para exibição e compatibilidade.
   */
  professionalId?: number;

  professionalName?: string;

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
          if (
            user.profile !==
            "Profissional"
          ) {
            return user;
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
            return user;
          }

          return {
            ...user,

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

    professionalId:
      linkedProfessional?.id ??
      user.professionalId,

    professionalName:
      linkedProfessional?.name ??
      user.professionalName,

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

export function saveAuthSession(
  session: AuthSession
) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(
      session
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