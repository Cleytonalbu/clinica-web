import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  GestorMetricCards,
} from "../../../components/dashboard/gestor/GestorMetricCards";

import {
  GestorVisaoGeral,
} from "../../../components/dashboard/gestor/GestorVisaoGeral";

import {
  GestorProximosAtendimentos,
} from "../../../components/dashboard/gestor/GestorProximosAtendimentos";

import {
  GestorDesempenho,
} from "../../../components/dashboard/gestor/GestorDesempenho";

import {
  GestorFaixaEtaria,
} from "../../../components/dashboard/gestor/GestorFaixaEtaria";

import {
  GestorPendencias,
} from "../../../components/dashboard/gestor/GestorPendencias";

import {
  GestorInsights,
} from "../../../components/dashboard/gestor/GestorInsights";

export default function DashboardGestor() {
  const {
    user,
  } = useAuth();

  const firstName =
    user?.name
      ?.trim()
      .split(/\s+/)[0] ??
    "Gestor";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olá, {firstName}! 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Aqui está o panorama geral da clínica hoje.
          </p>
        </div>

        <GestorMetricCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
          <GestorVisaoGeral />

          <GestorProximosAtendimentos />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <GestorDesempenho />

          <GestorFaixaEtaria />

          <GestorPendencias />
        </div>

        <GestorInsights />
      </div>
    </DashboardLayout>
  );
}