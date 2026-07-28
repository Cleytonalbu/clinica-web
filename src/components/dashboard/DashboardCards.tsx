import {
  CalendarDays,
  DollarSign,
  Stethoscope,
  Users,
} from "lucide-react";

import { useDashboard } from "../../hooks/useDashboard";
import { StatsCard } from "./StatsCard";

export function DashboardCards() {
  const { stats, loading } = useDashboard();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Pacientes"
        value={stats.pacientes}
        icon={<Users size={28} />}
      />

      <StatsCard
        title="Atendimentos Hoje"
        value={stats.atendimentosHoje}
        icon={<CalendarDays size={28} />}
      />

      <StatsCard
        title="Profissionais"
        value={stats.profissionais}
        icon={<Stethoscope size={28} />}
      />

      <StatsCard
        title="Receita do Mês"
        value={new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(stats.receitaMes)}
        icon={<DollarSign size={28} />}
      />
    </div>
  );
}