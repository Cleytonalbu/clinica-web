export type EvolutionObjectiveStatus =
  | "Em evolução"
  | "Regressão"
  | "Falta da criança"
  | "Mantido/sem alteração"
  | "Alcançado"
  | "Não trabalhado";

export function getEvolutionObjectiveMarkerScore(
  status: EvolutionObjectiveStatus
): number | null {
  switch (status) {
    case "Regressão":
      return -1;

    case "Mantido/sem alteração":
      return 1;

    case "Em evolução":
      return 2;

    case "Alcançado":
      return 3;

    case "Falta da criança":
    case "Não trabalhado":
      return null;

    default:
      return null;
  }
}

export function hasEvolutionObjectiveMarkerScore(
  status: EvolutionObjectiveStatus
) {
  return getEvolutionObjectiveMarkerScore(
    status
  ) !== null;
}

export type SessionResult =
  | "Abaixo do esperado"
  | "Dentro do esperado"
  | "Acima do esperado";

export type ReferralPriority =
  | "Baixa"
  | "Média"
  | "Alta"
  | "Urgente";

export interface EvolutionObjectiveFormData {
  id: number | string;
  name: string;
  status: EvolutionObjectiveStatus;

  /**
   * Avaliação clínica complementar de 1 a 5.
   * Para falta ou objetivo não trabalhado, o valor
   * permanece armazenado, mas não entra no marcador.
   */
  performance: number;

  /**
   * Marcador numérico derivado do status da sessão.
   * Regressão = -1
   * Mantido = 1
   * Em evolução = 2
   * Alcançado = 3
   * Falta / Não trabalhado = null
   */
  markerScore: number | null;
}

export interface TherapeuticPlanObjective {
  id: number;
  name: string;
  specialty: string;
}

export interface EvolutionFormData {
  patientId: string;

  sessionDate: string;
  startTime: string;
  endTime: string;

  specialty: string;
  appointmentType: string;
  appointmentLocation: string;

  objectives: EvolutionObjectiveFormData[];

  writtenEvolution: string;

  referralSpecialty: string;
  referralProfessional: string;
  referralReason: string;
  referralPriority: ReferralPriority;
  referralObservation: string;

  notifyProfessional: boolean;
  addProfessionalAgenda: boolean;
  notifyManager: boolean;

  observedImpacts: string[];

  sessionResult: SessionResult;
  sessionResultObservation: string;

  attachments: File[];

  professional: string;

  status: "RASCUNHO" | "FINALIZADA";
}