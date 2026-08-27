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
  id: number;
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

export interface EvolutionMaterialFormData {
  id: number;
  name: string;
  quantity: string;
  observation: string;
}

export type NutritionAppetite =
  | ""
  | "Preservado"
  | "Aumentado"
  | "Reduzido"
  | "Oscilante";

export type NutritionFoodAcceptance =
  | ""
  | "Boa"
  | "Parcial"
  | "Baixa"
  | "Recusa importante";

export type NutritionSelectivity =
  | ""
  | "Não observada"
  | "Leve"
  | "Moderada"
  | "Importante";

export interface NutritionEvolutionData {
  weightKg: string;
  heightCm: string;

  appetite: NutritionAppetite;
  foodAcceptance: NutritionFoodAcceptance;
  foodSelectivity: NutritionSelectivity;

  hydration: string;
  acceptedTextures: string;
  foodsPresented: string;
  foodsAccepted: string;
  refusalsAversions: string;

  gastrointestinalSymptoms: string;
  bowelPattern: string;

  nutritionalConduct: string;
  familyGuidance: string;
  nextSessionPlan: string;
}

export type PhysiotherapyPainLevel =
  | ""
  | "Sem dor"
  | "Leve"
  | "Moderada"
  | "Intensa";

export type PhysiotherapyFunctionalLevel =
  | ""
  | "Dependente"
  | "Assistência máxima"
  | "Assistência moderada"
  | "Assistência mínima"
  | "Supervisão"
  | "Independente";

export interface PhysiotherapyEvolutionData {
  painLevel: PhysiotherapyPainLevel;
  painLocation: string;

  mobility: string;
  rangeOfMotion: string;
  muscleStrength: string;

  balance: string;
  coordination: string;
  gait: string;
  posture: string;

  functionalLevel: PhysiotherapyFunctionalLevel;
  functionalActivities: string;

  techniquesApplied: string;
  resourcesUsed: string;
  patientResponse: string;

  familyGuidance: string;
  nextSessionPlan: string;
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

  materials: EvolutionMaterialFormData[];

  /**
   * Dados específicos utilizados quando a especialidade
   * selecionada é Nutrição. Para as demais especialidades,
   * o objeto permanece salvo com valores vazios e não altera
   * o modelo terapêutico atual.
   */
  nutrition: NutritionEvolutionData;

  /**
   * Dados específicos utilizados quando a especialidade
   * selecionada é Fisioterapia. Para as demais especialidades,
   * o objeto permanece vazio e não altera seus modelos.
   */
  physiotherapy: PhysiotherapyEvolutionData;

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