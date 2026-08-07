export type EvolutionObjectiveStatus =
  | "Em evolução"
  | "Alcançado"
  | "Parcialmente alcançado"
  | "Regressão";

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
  id: number;
  name: string;
  status: EvolutionObjectiveStatus;
  performance: number;
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

  professional: string;

  status: "RASCUNHO" | "FINALIZADA";
}