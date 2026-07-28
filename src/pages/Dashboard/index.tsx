import { DashboardLayout } from "../../layouts/DashboardLayout";
import { DashboardGrid } from "../../components/dashboard/DashboardGrid";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Bem-vindo ao Sistema
          </h1>

          <p className="mt-2 text-slate-500">
            Acompanhe os principais indicadores da clínica.
          </p>
        </div>

        <DashboardGrid />
      </div>
    </DashboardLayout>
  );
}