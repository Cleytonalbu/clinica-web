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

import Profissionais from "@/pages/Profissionais";
import NovoProfissional from "@/pages/Profissionais/NovoProfissional";
import PerfilProfissional from "@/pages/Profissionais/PerfilProfissional";

import Agenda from "@/pages/Agenda";
import NovoAgendamento from "@/pages/Agenda/NovoAgendamento";
import DetalheAgendamento from "@/pages/Agenda/DetalheAgendamento";
import RemarcarAgendamento from "@/pages/Agenda/RemarcarAgendamento";
import NovoBloqueio from "@/pages/Agenda/NovoBloqueio";

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
        element={
          <Dashboard />
        }
      />

      <Route
        path="/pacientes"
        element={
          <Pacientes />
        }
      />

      <Route
        path="/pacientes/novo"
        element={
          <NovoPaciente />
        }
      />

      <Route
        path="/pacientes/:id"
        element={
          <PerfilPaciente />
        }
      />

      <Route
        path="/pacientes/:id/evolucoes/nova"
        element={
          <NovaEvolucao />
        }
      />

      <Route
        path="/pacientes/:id/evolucoes/:evolutionId"
        element={
          <DetalheEvolucao />
        }
      />

      <Route
        path="/profissionais"
        element={
          <Profissionais />
        }
      />

      <Route
        path="/profissionais/novo"
        element={
          <NovoProfissional />
        }
      />

      <Route
        path="/profissionais/:id"
        element={
          <PerfilProfissional />
        }
      />

      <Route
        path="/agenda"
        element={
          <Agenda />
        }
      />

      <Route
        path="/agenda/novo"
        element={
          <NovoAgendamento />
        }
      />

      <Route
        path="/agenda/bloqueio/novo"
        element={
          <NovoBloqueio />
        }
      />

      <Route
        path="/agenda/:appointmentId"
        element={
          <DetalheAgendamento />
        }
      />

      <Route
        path="/agenda/:appointmentId/remarcar"
        element={
          <RemarcarAgendamento />
        }
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