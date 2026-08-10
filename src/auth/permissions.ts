import {
  getPermissionProfileByName,
  type ModulePermission,
  type PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

import type {
  AuthUser,
} from "./authStorage";

export type PermissionAction =
  keyof ModulePermission;

export function getUserProfilePermissions(
  user:
    AuthUser |
    null
) {
  if (!user) {
    return null;
  }

  return (
    getPermissionProfileByName(
      user.profile
    ) ??
    null
  );
}

export function userCanAccessModule(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey
) {
  const profile =
    getUserProfilePermissions(
      user
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

export function userCan(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey,

  action:
    PermissionAction
) {
  const profile =
    getUserProfilePermissions(
      user
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
      action
    ]
  );
}

export function userCanCreate(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey
) {
  return userCan(
    user,
    module,
    "create"
  );
}

export function userCanEdit(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey
) {
  return userCan(
    user,
    module,
    "edit"
  );
}

export function userCanDelete(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey
) {
  return userCan(
    user,
    module,
    "delete"
  );
}

export function userCanManage(
  user:
    AuthUser |
    null,

  module:
    PermissionModuleKey
) {
  return userCan(
    user,
    module,
    "manage"
  );
}