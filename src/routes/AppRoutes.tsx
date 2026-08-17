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

import NovoObjetivo from "@/pages/Pacientes/NovoObjetivo";

import Profissionais from "@/pages/Profissionais";

import NovoProfissional from "@/pages/Profissionais/NovoProfissional";

import PerfilProfissional from "@/pages/Profissionais/PerfilProfissional";

import Agenda from "@/pages/Agenda";

import NovoAgendamento from "@/pages/Agenda/NovoAgendamento";

import DetalheAgendamento from "@/pages/Agenda/DetalheAgendamento";

import RemarcarAgendamento from "@/pages/Agenda/RemarcarAgendamento";

import NovoBloqueio from "@/pages/Agenda/NovoBloqueio";

import SolicitarBloqueio from "@/pages/Agenda/SolicitarBloqueio";

import Financeiro from "@/pages/Financeiro";

import ContasBancarias from "@/pages/ContasBancarias";

import ImportarExtrato from "@/pages/ImportarExtrato";

import MovimentacoesBancarias from "@/pages/MovimentacoesBancarias";

import Faturamento from "@/pages/Faturamento";

import ConveniosEPlanos from "@/pages/ConveniosEPlanos";

import GuiasConvenios from "@/pages/GuiasConvenios";

import Repasses from "@/pages/Repasses";

import Despesas from "@/pages/Despesas";

import Compras from "@/pages/Compras";

import Estoque from "@/pages/Estoque";

import Fornecedores from "@/pages/Fornecedores";

import DocumentosAdministrativos from "@/pages/DocumentosAdministrativos";

import ColaboradoresAdministrativos from "@/pages/ColaboradoresAdministrativos";

import PagamentosAdministrativos from "@/pages/PagamentosAdministrativos";

import FeriasEAfastamentos from "@/pages/FeriasEAfastamentos";

import PontoEFrequencia from "@/pages/PontoEFrequencia";

import DashboardFinanceiro from "@/pages/Financeiro/DashboardFinanceiro";

import HistoricoPaciente from "@/pages/Financeiro/HistoricoPaciente";

import ReceberCobranca from "@/pages/Financeiro/ReceberCobranca";

import NovaDespesa from "@/pages/Financeiro/NovaDespesa";

import PagarDespesa from "@/pages/Financeiro/PagarDespesa";

import Relatorios from "@/pages/Relatorios";

import RelatoriosAdministrativos from "@/pages/RelatoriosAdministrativos";

import RelatorioAtendimentos from "@/pages/Relatorios/RelatorioAtendimentos";

import RelatorioFinanceiro from "@/pages/Relatorios/RelatorioFinanceiro";

import RelatorioPacientes from "@/pages/Relatorios/RelatorioPacientes";

import RelatorioProfissionais from "@/pages/Relatorios/RelatorioProfissionais";

import SolicitacoesRelatorios from "@/pages/SolicitacoesRelatorios";

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
      {/* NOVO OBJETIVO TERAPÊUTICO */}
      {/* SOMENTE PROFISSIONAL */}
      {/* ========================================= */}

      <Route
        path="/pacientes/:id/objetivos/novo"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="patients"
              action="view"
            >
              <NovoObjetivo />
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
      {/* SOLICITAR BLOQUEIO */}
      {/* SOMENTE PROFISSIONAL */}
      {/* ========================================= */}

      <Route
        path="/agenda/bloqueio/solicitar"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Profissional",
            ]}
          >
            <ProtectedRoute
              module="agenda"
              action="view"
            >
              <SolicitarBloqueio />
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
              "Administrativo",
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
      {/* FATURAMENTO */}
      {/* SOMENTE ADMINISTRATIVO */}


      {/* ========================================= */}
      {/* CONTAS BANCÁRIAS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/contas-bancarias"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <ContasBancarias />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* IMPORTAR EXTRATO BANCÁRIO */}
      {/* SOMENTE ADMINISTRATIVO */}


      {/* ========================================= */}
      {/* MOVIMENTAÇÕES BANCÁRIAS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/contas-bancarias/:accountId/movimentacoes"
        element={
          <ProfileRoute allowedProfiles={["Administrativo"]}>
            <ProtectedRoute module="financial" action="view">
              <MovimentacoesBancarias />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}

      <Route
        path="/financeiro/importar-extrato"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <ImportarExtrato />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}

      <Route
        path="/faturamento"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Faturamento />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* REPASSES AOS PROFISSIONAIS */}
      {/* SOMENTE ADMINISTRATIVO */}


      {/* ========================================= */}
      {/* CONVÊNIOS E PLANOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/convenios-planos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <ConveniosEPlanos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* GUIAS E FATURAMENTO DE CONVÊNIOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/guias-convenios"
        element={
          <ProfileRoute allowedProfiles={["Administrativo"]}>
            <ProtectedRoute module="financial" action="view">
              <GuiasConvenios />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}

      <Route
        path="/repasses"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Repasses />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* DESPESAS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/despesas"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Despesas />
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
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <DashboardFinanceiro />
            </ProtectedRoute>
          </ProfileRoute>
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
              "Administrativo",
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
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="create"
            >
              <NovaDespesa />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* PAGAR DESPESA */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      <Route
        path="/financeiro/despesas/:expenseId/pagar"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="edit"
            >
              <PagarDespesa />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* FORNECEDORES */}
      {/* SOMENTE ADMINISTRATIVO */}


      {/* ========================================= */}
      {/* COMPRAS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/compras"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Compras />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* ESTOQUE */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/estoque"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Estoque />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}

      <Route
        path="/fornecedores"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <Fornecedores />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* CONTRATOS E DOCUMENTOS ADMINISTRATIVOS */}
      {/* SOMENTE ADMINISTRATIVO */}


      {/* ========================================= */}
      {/* COLABORADORES ADMINISTRATIVOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/colaboradores-administrativos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <ColaboradoresAdministrativos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* PAGAMENTOS ADMINISTRATIVOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/pagamentos-administrativos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <PagamentosAdministrativos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* FÉRIAS E AFASTAMENTOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/ferias-afastamentos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <FeriasEAfastamentos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />



      {/* ========================================= */}
      {/* PONTO E FREQUÊNCIA */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/ponto-frequencia"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <PontoEFrequencia />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}

      <Route
        path="/documentos-administrativos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="financial"
              action="view"
            >
              <DocumentosAdministrativos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* SOLICITAÇÕES DE RELATÓRIOS */}
      {/* GESTOR + RECEPÇÃO + PROFISSIONAL */}
      {/* ========================================= */}

      <Route
        path="/solicitacoes-relatorios"
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
              <SolicitacoesRelatorios />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      {/* ========================================= */}
      {/* RELATÓRIOS */}
      {/* SOMENTE GESTOR */}
      {/* ========================================= */}

      {/* ========================================= */}
      {/* RELATÓRIOS ADMINISTRATIVOS */}
      {/* SOMENTE ADMINISTRATIVO */}
      {/* ========================================= */}

      <Route
        path="/relatorios-administrativos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <RelatoriosAdministrativos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <Relatorios />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/relatorios/atendimentos"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <RelatorioAtendimentos />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/relatorios/financeiro"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <RelatorioFinanceiro />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/relatorios/pacientes"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <RelatorioPacientes />
            </ProtectedRoute>
          </ProfileRoute>
        }
      />

      <Route
        path="/relatorios/profissionais"
        element={
          <ProfileRoute
            allowedProfiles={[
              "Gestor",
              "Administrativo",
            ]}
          >
            <ProtectedRoute
              module="reports"
              action="view"
            >
              <RelatorioProfissionais />
            </ProtectedRoute>
          </ProfileRoute>
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