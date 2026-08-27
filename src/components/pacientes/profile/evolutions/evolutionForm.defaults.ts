import type {
  EvolutionFormData,
} from "./evolutionForm.types";

/* =========================================
   VALORES PADRÃO DA EVOLUÇÃO
========================================= */

export function createEvolutionDefaultValues(
  patientId: string
): EvolutionFormData {
  return {
    patientId,

    /* =====================================
       SESSÃO
    ===================================== */

    sessionDate: "",

    startTime: "",

    endTime: "",

    specialty: "",

    appointmentType:
      "Individual",

    appointmentLocation:
      "Clinica",

    /* =====================================
       OBJETIVOS
    ===================================== */

    objectives: [],

    /* =====================================
       MATERIAIS UTILIZADOS
    ===================================== */

    materials: [],

    /* =====================================
       EVOLUÇÃO NUTRICIONAL
    ===================================== */

    nutrition: {
      weightKg: "",
      heightCm: "",

      appetite: "",
      foodAcceptance: "",
      foodSelectivity: "",

      hydration: "",
      acceptedTextures: "",
      foodsPresented: "",
      foodsAccepted: "",
      refusalsAversions: "",

      gastrointestinalSymptoms: "",
      bowelPattern: "",

      nutritionalConduct: "",
      familyGuidance: "",
      nextSessionPlan: "",
    },

    /* =====================================
       EVOLUÇÃO FISIOTERAPÊUTICA
    ===================================== */

    physiotherapy: {
      painLevel: "",
      painLocation: "",

      mobility: "",
      rangeOfMotion: "",
      muscleStrength: "",

      balance: "",
      coordination: "",
      gait: "",
      posture: "",

      functionalLevel: "",
      functionalActivities: "",

      techniquesApplied: "",
      resourcesUsed: "",
      patientResponse: "",

      familyGuidance: "",
      nextSessionPlan: "",
    },

    /* =====================================
       EVOLUÇÃO ESCRITA
    ===================================== */

    writtenEvolution: "",

    /* =====================================
       ENCAMINHAMENTO
    ===================================== */

    referralSpecialty: "",

    referralProfessional: "",

    referralReason: "",

    referralPriority:
      "Média",

    referralObservation: "",

    /* =====================================
       NOTIFICAÇÕES
    ===================================== */

    notifyProfessional:
      false,

    addProfessionalAgenda:
      false,

    notifyManager:
      false,

    /* =====================================
       IMPACTOS OBSERVADOS
    ===================================== */

    observedImpacts: [],

    /* =====================================
       RESULTADO DA SESSÃO
    ===================================== */

    sessionResult:
      "Dentro do esperado",

    sessionResultObservation: "",

    /* =====================================
       ANEXOS
    ===================================== */

    attachments: [],

    /* =====================================
       PROFISSIONAL
    ===================================== */

    professional: "",

    /* =====================================
       STATUS
    ===================================== */

    status:
      "RASCUNHO",
  };
}