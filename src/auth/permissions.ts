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
