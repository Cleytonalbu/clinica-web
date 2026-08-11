import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "@/auth/ProtectedRoute";

import GestorOnlyRoute from "@/auth/GestorOnlyRoute";

import ProfileRoute from "@/auth/ProfileRoute";

import Dashboard from "@/pages/Dashboard";

import Pacientes from "@/pages/Pacientes";

import NovoPaciente from "@/pages/Pacientes/NovoPaciente";

import PerfilPaciente from "@/pages/Pacientes/PerfilPaciente";

import EditarPaciente from "@/pages/Pacientes/EditarPaciente";

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

import Financeiro from "@/pages/Financeiro";

import DashboardFinanceiro from "@/pages/Financeiro/DashboardFinanceiro";

import HistoricoPaciente from "@/pages/Financeiro/HistoricoPaciente";

import ReceberCobranca from "@/pages/Financeiro/ReceberCobranca";

import NovaDespesa from "@/pages/Financeiro/NovaDespesa";

import PagarDespesa from "@/pages/Financeiro/PagarDespesa";

import Relatorios from "@/pages/Relatorios";

import RelatorioAtendimentos from "@/pages/Relatorios/RelatorioAtendimentos";

import RelatorioFinanceiro from "@/pages/Relatorios/RelatorioFinanceiro";

import RelatorioPacientes from "@/pages/Relatorios/RelatorioPacientes";

import RelatorioProfissionais from "@/pages/Relatorios/RelatorioProfissionais";

import Configuracoes from "@/pages/Configuracoes";

import Indicadores from "@/pages/Indicadores";

import Login from "@/pages/Login";

import AcessoNegado from "@/pages/AcessoNegado";

export function AppRoutes() {
  return (
    <Routes>
      {/* ========================================= */}
      {/* LOGIN */}
      {/* ========================================= */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      {/* ========================================= */}
      {/* INÍCIO */}
      {/* ========================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ========================================= */}
      {/* DASHBOARD */}
      {/* ========================================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            module="dashboard"
            action="view"
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ========================================= */}
      {/* INDICADORES */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/indicadores"
        element={
          <GestorOnlyRoute>
            <Indicadores />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* PACIENTES */}
      {/* TODOS OS PERFIS */}
      {/* ========================================= */}

      <Route
        path="/pacientes"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="patients"
              action="view"
            >
              <Pacientes />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* NOVO PACIENTE */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/pacientes/novo"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="patients"
              action="create"
            >
              <NovoPaciente />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* PERFIL DO PACIENTE */}
      {/* TODOS OS PERFIS */}
      {/* ========================================= */}

      <Route
        path="/pacientes/:id"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="patients"
              action="view"
            >
              <PerfilPaciente />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* EDITAR PACIENTE */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/pacientes/:id/editar"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="patients"
              action="edit"
            >
              <EditarPaciente />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* EVOLUÇÕES */}
      {/* GESTOR + PROFISSIONAL */}
      {/* ========================================= */}

      <Route
        path="/pacientes/:id/evolucoes/nova"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="evolutions"
              action="create"
            >
              <NovaEvolucao />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/pacientes/:id/evolucoes/:evolutionId"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="evolutions"
              action="view"
            >
              <DetalheEvolucao />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* PROFISSIONAIS */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/profissionais"
        element={
          <GestorOnlyRoute>
            <Profissionais />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/profissionais/novo"
        element={
          <GestorOnlyRoute>
            <NovoProfissional />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/profissionais/:id"
        element={
          <GestorOnlyRoute>
            <PerfilProfissional />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* AGENDA */}
      {/* TODOS OS PERFIS */}
      {/* ========================================= */}

      <Route
        path="/agenda"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="view"
            >
              <Agenda />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* NOVO AGENDAMENTO */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/agenda/novo"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="create"
            >
              <NovoAgendamento />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* NOVO BLOQUEIO */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/agenda/bloqueio/novo"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="create"
            >
              <NovoBloqueio />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* DETALHE DO AGENDAMENTO */}
      {/* TODOS OS PERFIS */}
      {/* ========================================= */}

      <Route
        path="/agenda/:appointmentId"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="view"
            >
              <DetalheAgendamento />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* REMARCAR */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/agenda/:appointmentId/remarcar"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="edit"
            >
              <RemarcarAgendamento />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* FINANCEIRO */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/financeiro"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Financeiro />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* DASHBOARD FINANCEIRO */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/financeiro/dashboard"
        element={
          <GestorOnlyRoute>
            <DashboardFinanceiro />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* HISTÓRICO FINANCEIRO DO PACIENTE */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/financeiro/paciente/:patientId"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <HistoricoPaciente />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* RECEBER COBRANÇA */}
      {/* GESTOR + RECEPÇÃO */}
      {/* ========================================= */}

      <Route
        path="/financeiro/receber/:chargeId"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Recepção",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="edit"
            >
              <ReceberCobranca />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* NOVA DESPESA */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/financeiro/despesas/nova"
        element={
          <GestorOnlyRoute>
            <NovaDespesa />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* PAGAR DESPESA */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/financeiro/despesas/:expenseId/pagar"
        element={
          <GestorOnlyRoute>
            <PagarDespesa />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* RELATÓRIOS */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/relatorios"
        element={
          <GestorOnlyRoute>
            <Relatorios />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/relatorios/atendimentos"
        element={
          <GestorOnlyRoute>
            <RelatorioAtendimentos />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/relatorios/financeiro"
        element={
          <GestorOnlyRoute>
            <RelatorioFinanceiro />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/relatorios/pacientes"
        element={
          <GestorOnlyRoute>
            <RelatorioPacientes />
          </GestorOnlyRoute>
        }
      />

      <Route
        path="/relatorios/profissionais"
        element={
          <GestorOnlyRoute>
            <RelatorioProfissionais />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* CONFIGURAÇÕES */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/configuracoes"
        element={
          <GestorOnlyRoute>
            <Configuracoes />
          </GestorOnlyRoute>
        }
      />

      {/* ========================================= */}
      {/* ACESSO NEGADO */}
      {/* ========================================= */}

      <Route
        path="/acesso-negado"
        element={
          <ProtectedRoute>
            <AcessoNegado />
          </ProtectedRoute>
        }
      />

      {/* ========================================= */}
      {/* ROTA INVÁLIDA */}
      {/* ========================================= */}

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