import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "@/pages/Dashboard";
import Pacientes from "@/pages/Pacientes";
import NovoPaciente from "@/pages/Pacientes/NovoPaciente";
import PerfilPaciente from "@/pages/Pacientes/PerfilPaciente";
import NovaEvolucao from "@/pages/Pacientes/NovaEvolucao";
import DetalheEvolucao from "@/pages/Pacientes/DetalheEvolucao";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/pacientes"
        element={<Pacientes />}
      />

      <Route
        path="/pacientes/novo"
        element={<NovoPaciente />}
      />

      <Route
        path="/pacientes/:id"
        element={<PerfilPaciente />}
      />

      <Route
        path="/pacientes/:id/evolucoes/nova"
        element={<NovaEvolucao />}
      />

      <Route
        path="/pacientes/:id/evolucoes/:evolutionId"
        element={<DetalheEvolucao />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}