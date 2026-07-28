export interface DashboardStats {
  pacientes: number;
  atendimentosHoje: number;
  profissionais: number;
  receitaMes: number;
}

export interface AgendaItem {
  id: number;
  horario: string;
  paciente: string;
  profissional: string;
}

export interface AtendimentoItem {
  id: number;
  paciente: string;
  horario: string;
}

export interface DashboardData {
  stats: DashboardStats;
  agenda: AgendaItem[];
  proximosAtendimentos: AtendimentoItem[];
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    stats: {
      pacientes: 248,
      atendimentosHoje: 31,
      profissionais: 12,
      receitaMes: 18540,
    },

    agenda: [
      {
        id: 1,
        horario: "08:00",
        paciente: "Maria Oliveira",
        profissional: "Dra. Ana Paula",
      },
      {
        id: 2,
        horario: "09:30",
        paciente: "João Carlos",
        profissional: "Dr. Pedro Lima",
      },
      {
        id: 3,
        horario: "11:00",
        paciente: "Fernanda Souza",
        profissional: "Dra. Carla Menezes",
      },
    ],

    proximosAtendimentos: [
      {
        id: 1,
        paciente: "Carlos Henrique",
        horario: "13:30",
      },
      {
        id: 2,
        paciente: "Patrícia Silva",
        horario: "15:00",
      },
      {
        id: 3,
        paciente: "Lucas Gomes",
        horario: "16:20",
      },
    ],
  };
}
