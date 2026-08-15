import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

const STORAGE_KEY =
  "entre-afetos-patient-units";

export interface PatientUnitLink {
  patientId: number;
  unitId: number;
  createdAt: string;
}

function readLinks():
  PatientUnitLink[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ) =>
          item &&
          Number.isFinite(
            Number(
              item.patientId
            )
          ) &&
          Number.isFinite(
            Number(
              item.unitId
            )
          )
      )
      .map(
        (
          item
        ) => ({
          patientId:
            Number(
              item.patientId
            ),

          unitId:
            Number(
              item.unitId
            ),

          createdAt:
            typeof item.createdAt ===
            "string"
              ? item.createdAt
              : new Date()
                  .toISOString(),
        })
      );
  } catch {
    return [];
  }
}

function saveLinks(
  links:
    PatientUnitLink[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      links
    )
  );
}

export function getPatientUnitIds(
  patientId: number
) {
  const links =
    readLinks().filter(
      (
        item
      ) =>
        item.patientId ===
        patientId
    );

  /*
   * Pacientes antigos não possuíam vínculo
   * explícito com unidade. Eles continuam
   * aparecendo na Unidade Principal até
   * serem utilizados em outra unidade.
   */
  if (
    links.length ===
    0
  ) {
    return [
      getDefaultClinicUnitId(),
    ];
  }

  return Array.from(
    new Set(
      links.map(
        (
          item
        ) =>
          item.unitId
      )
    )
  );
}

export function patientWorksAtUnit(
  patientId: number,
  unitId: number
) {
  return getPatientUnitIds(
    patientId
  ).includes(
    unitId
  );
}

export function addPatientToUnit(
  patientId: number,
  unitId: number
) {
  const links =
    readLinks();

  const exists =
    links.some(
      (
        item
      ) =>
        item.patientId ===
          patientId &&
        item.unitId ===
          unitId
    );

  if (
    exists
  ) {
    return;
  }

  /*
   * Ao criar o primeiro vínculo explícito
   * para um paciente antigo, preservamos
   * também a Unidade Principal.
   */
  const hasAnyExplicitLink =
    links.some(
      (
        item
      ) =>
        item.patientId ===
        patientId
    );

  const next = [
    ...links,
  ];

  if (
    !hasAnyExplicitLink
  ) {
    const defaultUnitId =
      getDefaultClinicUnitId();

    if (
      defaultUnitId !==
      unitId
    ) {
      next.push({
        patientId,
        unitId:
          defaultUnitId,
        createdAt:
          new Date()
            .toISOString(),
      });
    }
  }

  next.push({
    patientId,
    unitId,
    createdAt:
      new Date()
        .toISOString(),
  });

  saveLinks(
    next
  );
}

export function setNewPatientUnit(
  patientId: number,
  unitId: number
) {
  const otherLinks =
    readLinks().filter(
      (
        item
      ) =>
        item.patientId !==
        patientId
    );

  saveLinks([
    ...otherLinks,
    {
      patientId,
      unitId,
      createdAt:
        new Date()
          .toISOString(),
    },
  ]);
}

export function removePatientUnitLinks(
  patientId: number
) {
  saveLinks(
    readLinks().filter(
      (
        item
      ) =>
        item.patientId !==
        patientId
    )
  );
}