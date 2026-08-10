import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "./AuthContext";

type AllowedProfile =
  | "Gestor"
  | "Recepção"
  | "Profissional";

interface ProfileRouteProps {
  children: ReactNode;

  allowedProfiles: AllowedProfile[];
}

export default function ProfileRoute({
  children,
  allowedProfiles,
}: ProfileRouteProps) {
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
    !allowedProfiles.includes(
      user.profile
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