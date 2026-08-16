import {
  useAuth,
} from "../../auth/AuthContext";

import DashboardGestor from "./Gestor";

import DashboardRecepcao from "./Recepcao";

import DashboardProfissional from "./Profissional";

import DashboardAdministrativo from "./Administrativo";

export default function Dashboard() {
  const {
    user,
  } = useAuth();

  if (
    user?.profile ===
    "Gestor"
  ) {
    return (
      <DashboardGestor />
    );
  }

  if (
    user?.profile ===
    "Recepção"
  ) {
    return (
      <DashboardRecepcao />
    );
  }

  if (
    user?.profile ===
    "Profissional"
  ) {
    return (
      <DashboardProfissional />
    );
  }

  if (
    user?.profile ===
    "Administrativo"
  ) {
    return (
      <DashboardAdministrativo />
    );
  }

  return (
    <DashboardGestor />
  );
}