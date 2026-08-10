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

interface GestorOnlyRouteProps {
  children: ReactNode;
}

export default function GestorOnlyRoute({
  children,
}: GestorOnlyRouteProps) {
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
    user.profile !==
    "Gestor"
  ) {
    return (
      <Navigate
        to="/acesso-negado"
        replace
      />
    );
  }

  return (
    <>
      {children}
    </>
  );
}