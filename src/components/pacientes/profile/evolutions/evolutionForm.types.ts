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

/* =========================================
   OBJETIVO DA EVOLUÇÃO
========================================= */

export interface EvolutionObjectiveFormData {
  id: number;
  name: string;
  status: EvolutionObjectiveStatus;
  performance: number;
}

/* =========================================
   MATERIAL UTILIZADO
========================================= */

export interface EvolutionMaterialFormData {
  id: number;
  name: string;
  quantity: string;
  observation: string;
}

/* =========================================
   OBJETIVO DO PLANO TERAPÊUTICO
========================================= */

export interface TherapeuticPlanObjective {
  id: number;
  name: string;
  specialty: string;
}

/* =========================================
   FORMULÁRIO DA EVOLUÇÃO
========================================= */

export interface EvolutionFormData {
  patientId: string;

  /* SESSÃO */

  sessionDate: string;
  startTime: string;
  endTime: string;

  specialty: string;
  appointmentType: string;
  appointmentLocation: string;

  /* OBJETIVOS */

  objectives: EvolutionObjectiveFormData[];

  /* MATERIAIS */

  materials: EvolutionMaterialFormData[];

  /* EVOLUÇÃO ESCRITA */

  writtenEvolution: string;

  /* ENCAMINHAMENTO */

  referralSpecialty: string;
  referralProfessional: string;
  referralReason: string;
  referralPriority: ReferralPriority;
  referralObservation: string;

  /* NOTIFICAÇÕES */

  notifyProfessional: boolean;
  addProfessionalAgenda: boolean;
  notifyManager: boolean;

  /* IMPACTOS */

  observedImpacts: string[];

  /* RESULTADO */

  sessionResult: SessionResult;
  sessionResultObservation: string;

  /* ANEXOS */

  attachments: File[];

  /* PROFISSIONAL */

  professional: string;

  /* STATUS */

  status: "RASCUNHO" | "FINALIZADA";
}