import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  RecepcaoMetricCards,
} from "../../../components/dashboard/recepcao/RecepcaoMetricCards";

import {
  RecepcaoAgendaHoje,
} from "../../../components/dashboard/recepcao/RecepcaoAgendaHoje";

import {
  RecepcaoFilaAtendimento,
} from "../../../components/dashboard/recepcao/RecepcaoFilaAtendimento";

import {
  RecepcaoBuscaRapida,
} from "../../../components/dashboard/recepcao/RecepcaoBuscaRapida";

import {
  RecepcaoPacientesRecentes,
} from "../../../components/dashboard/recepcao/RecepcaoPacientesRecentes";

import {
  RecepcaoResumoAgenda,
} from "../../../components/dashboard/recepcao/RecepcaoResumoAgenda";

export default function DashboardRecepcao() {
  const {
    user,
  } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Bom dia, {user?.name ?? "Recepção"}! 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe os atendimentos e movimentações de hoje.
          </p>
        </div>

        <RecepcaoMetricCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
          <RecepcaoAgendaHoje />

          <RecepcaoFilaAtendimento />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.7fr_1.25fr_1fr]">
          <RecepcaoBuscaRapida />

          <RecepcaoPacientesRecentes />

          <RecepcaoResumoAgenda />
        </div>
      </div>
    </DashboardLayout>
  );
}