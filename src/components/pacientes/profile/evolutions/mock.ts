import type { Evolution } from "./types";

export const evolutions: Evolution[] = [
  {
    id: 1,

    specialty: "Psicologia",

    professional: "Dra. Ana Paula",

    objective: "Melhorar interação social",

    sessionDate: "07/08/2026",

    createdAt: "08:00",

    description:
      "Paciente apresentou melhora significativa durante as atividades propostas, mantendo contato visual e respondendo adequadamente aos estímulos.",

    patientResponse:
      "Boa participação durante toda a sessão.",

    familyGuidance:
      "Estimular brincadeiras em grupo durante a semana.",

    attachments: 2,

    status: "Registrada",
  },

  {
    id: 2,

    specialty: "Fonoaudiologia",

    professional: "Dra. Camila Soares",

    objective: "Estimular comunicação verbal",

    sessionDate: "05/08/2026",

    createdAt: "14:00",

    description:
      "Foram realizados exercícios de repetição de fonemas e construção de frases curtas.",

    patientResponse:
      "Apresentou evolução na articulação.",

    familyGuidance:
      "Repetir exercícios diariamente por 15 minutos.",

    attachments: 1,

    status: "Revisada",
  },
];