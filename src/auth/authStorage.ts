import {
  getPermissionProfileByName,
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

    if (!stored) {
      localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(
          defaultUsers
        )
      );

      return defaultUsers;
    }

    const parsed =
      JSON.parse(
        stored
      ) as StoredUser[];

    const missingDefaults =
      defaultUsers.filter(
        (defaultUser) =>
          !parsed.some(
            (user) =>
              user.email
                .trim()
                .toLowerCase() ===
              defaultUser.email
                .trim()
                .toLowerCase()
          )
      );

    if (missingDefaults.length > 0) {
      const normalized = [
        ...parsed,
        ...missingDefaults,
      ];

      localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );

      return normalized;
    }

    return parsed;
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

  const authUser: AuthUser = {
    id:
      user.id,

    name:
      user.name,

    email:
      user.email,

    profile:
      user.profile,

    professionalName:
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