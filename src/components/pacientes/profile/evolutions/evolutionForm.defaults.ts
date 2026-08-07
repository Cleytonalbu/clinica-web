import type { EvolutionFormData } from "./evolutionForm.types";

export function createEvolutionDefaultValues(
  patientId: string
): EvolutionFormData {
  return {
    patientId,

    sessionDate: "",
    startTime: "",
    endTime: "",

    specialty: "Psicologia",
    appointmentType: "Individual",
    appointmentLocation: "Clinica",

    objectives: [
      {
        id: 1,
        name: "Comunicação funcional",
        status: "Em evolução",
        performance: 4,
      },
      {
        id: 2,
        name: "Interação social",
        status: "Em evolução",
        performance: 3,
      },
      {
        id: 3,
        name: "Autorregulação emocional",
        status: "Alcançado",
        performance: 5,
      },
      {
        id: 4,
        name: "Autonomia nas atividades",
        status: "Parcialmente alcançado",
        performance: 3,
      },
      {
        id: 5,
        name: "Atenção e concentração",
        status: "Em evolução",
        performance: 4,
      },
    ],

    writtenEvolution: "",

    referralSpecialty: "Fonoaudiologia",
    referralProfessional: "Dra. Camila Soares",
    referralReason: "",
    referralPriority: "Alta",
    referralObservation: "",

    notifyProfessional: true,
    addProfessionalAgenda: true,
    notifyManager: false,

    observedImpacts: [
      "Comunicação",
      "Interação social",
      "Atenção",
      "Autonomia",
      "Regulação emocional",
    ],

    sessionResult: "Dentro do esperado",
    sessionResultObservation: "",

    professional: "Dra. Juliana Santos",

    status: "RASCUNHO",
  };
}