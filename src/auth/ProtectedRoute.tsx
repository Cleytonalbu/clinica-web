import type { ReactNode } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import type {
  ModulePermission,
  PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

import { useAuth } from "./AuthContext";

import {
  userCan,
  userCanAccessModule,
} from "./permissions";

interface ProtectedRouteProps {
  children: ReactNode;

  module?: PermissionModuleKey;

  action?: keyof ModulePermission;
}

export default function ProtectedRoute({
  children,
  module,
  action,
}: ProtectedRouteProps) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const location =
    useLocation();

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (
    module &&
    !userCanAccessModule(
      user,
      module
    )
  ) {
    return (
      <Navigate
        to="/acesso-negado"
        replace
      />
    );
  }

  if (
    module &&
    action &&
    !userCan(
      user,
      module,
      action
    )
  ) {
    return (
      <Navigate
        to="/acesso-negado"
        replace
      />
    );
  }

  return <>{children}</>;
}