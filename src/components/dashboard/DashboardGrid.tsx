import { DashboardCards } from "./DashboardCards";
import { AgendaHoje } from "./AgendaHoje";
import { ProximosAtendimentos } from "./ProximosAtendimentos";
import { Notificacoes } from "./Notificacoes";
import { UltimosPacientes } from "./UltimosPacientes";

export function DashboardGrid() {
  return (
    <div className="space-y-8">
      <DashboardCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AgendaHoje />
        <ProximosAtendimentos />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UltimosPacientes />
        <Notificacoes />
      </div>
    </div>
  );
}