import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getObjectivesByPatientId,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   REGRAS DE ACESSO A PACIENTES
========================================= */

/*
 * Enquanto o front-end ainda usa dados locais,
 * o vínculo Paciente ↔ Profissional é obtido por:
 *
 * 1. agendamentos salvos;
 * 2. objetivos terapêuticos vinculados;
 * 3. vínculos de demonstração já utilizados
 *    pelas telas do projeto.
 *
 * Quando a API estiver integrada, esta regra
 * deve ser substituída pelo vínculo retornado
 * pelo backend.
 */

interface DemoProfessionalPatientLink {
  patientId:
    number;

  professional:
    string;

  specialty:
    string;
}

const DEMO_PROFESSIONAL_PATIENT_LINKS:
  DemoProfessionalPatientLink[] = [
    {
      patientId:
        1,

      professional:
        "Dra. Ana Paula",

      specialty:
        "Psicologia",
    },

    {
      patientId:
        3,

      professional:
        "Dra. Ana Paula",

      specialty:
        "Psicologia",
    },

    {
      patientId:
        1,

      professional:
        "Dra. Camila Soares",

      specialty:
        "Fonoaudiologia",
    },

    {
      patientId:
        2,

      professional:
        "Dra. Camila Soares",

      specialty:
        "Fonoaudiologia",
    },

    {
      patientId:
        4,

      professional:
        "Dra. Larissa Lima",

      specialty:
        "Terapia Ocupacional",
    },

    {
      patientId:
        5,

      professional:
        "Dr. Rafael Costa",

      specialty:
        "Fisioterapia",
    },
  ];

/* =========================================
   ESPECIALIDADE DO PROFISSIONAL
========================================= */

export function getProfessionalSpecialty(
  professionalName:
    string
) {
  return (
    getActiveProfessionals().find(
      (
        professional
      ) =>
        professional.name ===
        professionalName
    )?.specialty ??
    ""
  );
}

/* =========================================
   IDs DOS PACIENTES VINCULADOS
========================================= */

export function getProfessionalAccessiblePatientIds(
  professionalName:
    string
): number[] {
  const normalizedName =
    professionalName.trim();

  if (
    !normalizedName
  ) {
    return [];
  }

  const specialty =
    getProfessionalSpecialty(
      normalizedName
    );

  const patientIds =
    new Set<number>();

  /* AGENDAMENTOS SALVOS */

  getSavedAppointments()
    .filter(
      (
        appointment
      ) =>
        appointment.professional ===
          normalizedName &&
        (
          !specialty ||
          appointment.specialty ===
            specialty
        )
    )
    .forEach(
      (
        appointment
      ) =>
        patientIds.add(
          appointment.patientId
        )
    );

  /* VÍNCULOS DE DEMONSTRAÇÃO */

  DEMO_PROFESSIONAL_PATIENT_LINKS
    .filter(
      (
        link
      ) =>
        link.professional ===
          normalizedName &&
        (
          !specialty ||
          link.specialty ===
            specialty
        )
    )
    .forEach(
      (
        link
      ) =>
        patientIds.add(
          link.patientId
        )
    );

  /*
   * Objetivos também contam como vínculo.
   * Fazemos a checagem apenas para os IDs
   * já conhecidos pelo front de demonstração.
   */

  const possiblePatientIds =
    Array.from(
      {
        length:
          500,
      },
      (
        _,
        index
      ) =>
        index +
        1
    );

  possiblePatientIds.forEach(
    (
      patientId
    ) => {
      const hasLinkedObjective =
        getObjectivesByPatientId(
          patientId
        ).some(
          (
            objective
          ) =>
            objective.professional ===
              normalizedName &&
            (
              !specialty ||
              objective.specialty ===
                specialty
            )
        );

      if (
        hasLinkedObjective
      ) {
        patientIds.add(
          patientId
        );
      }
    }
  );

  return Array.from(
    patientIds
  );
}

/* =========================================
   VALIDAR UM PACIENTE
========================================= */

export function canProfessionalAccessPatient(
  professionalName:
    string,

  patientId:
    number
) {
  if (
    !Number.isFinite(
      patientId
    ) ||
    patientId <=
      0
  ) {
    return false;
  }

  return getProfessionalAccessiblePatientIds(
    professionalName
  ).includes(
    patientId
  );
}