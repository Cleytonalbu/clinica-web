import {
  getPackagePlanById,
  type PackagePlan,
} from "@/pages/Configuracoes/packagePlanStorage";

export interface PatientPackageItem {
  specialty: string;
  totalSessions: number;
  usedSessions: number;
}

export type PatientPackageStatus =
  | "Ativo"
  | "Finalizado"
  | "Expirado"
  | "Cancelado";

export interface PatientPackageSessionUsage {
  id: number;
  appointmentId: number;
  patientPackageId: number;
  patientId: number;
  unitId: number;
  specialty: string;
  consumedAt: string;
}

export interface PatientPackage {
  id: number;
  unitId: number;
  patientId: number;
  patient: string;

  planId: number;
  planName: string;

  items: PatientPackageItem[];

  originalValue: number;
  discountValue: number;
  finalValue: number;

  purchaseDate: string;
  validUntil: string;

  paymentMethod: string;
  installments: number;

  status: PatientPackageStatus;

  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-patient-packages";

const USAGE_STORAGE_KEY =
  "entre-afetos-patient-package-session-usages";

function addDays(
  dateValue: string,
  days: number
) {
  const date =
    new Date(
      `${dateValue}T12:00:00`
    );

  date.setDate(
    date.getDate() +
      Math.max(
        Math.trunc(days),
        0
      )
  );

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

function normalizeStatus(
  packageItem: PatientPackage
): PatientPackageStatus {
  if (
    packageItem.status ===
      "Cancelado" ||
    packageItem.status ===
      "Finalizado"
  ) {
    return packageItem.status;
  }

  const today =
    new Date();

  const validUntil =
    new Date(
      `${packageItem.validUntil}T23:59:59`
    );

  if (
    !Number.isNaN(
      validUntil.getTime()
    ) &&
    validUntil <
      today
  ) {
    return "Expirado";
  }

  const remaining =
    packageItem.items.reduce(
      (
        total,
        item
      ) =>
        total +
        Math.max(
          item.totalSessions -
            item.usedSessions,
          0
        ),
      0
    );

  return remaining <=
    0
    ? "Finalizado"
    : "Ativo";
}

function normalizePackage(
  value: PatientPackage
): PatientPackage {
  const normalized: PatientPackage = {
    ...value,

    items:
      Array.isArray(
        value.items
      )
        ? value.items.map(
            (
              item
            ) => ({
              specialty:
                String(
                  item.specialty ??
                    ""
                ),
              totalSessions:
                Math.max(
                  Math.trunc(
                    Number(
                      item.totalSessions
                    ) ||
                      0
                  ),
                  0
                ),
              usedSessions:
                Math.max(
                  Math.trunc(
                    Number(
                      item.usedSessions
                    ) ||
                      0
                  ),
                  0
                ),
            })
          )
        : [],

    installments:
      Math.max(
        Math.trunc(
          Number(
            value.installments
          ) ||
            1
        ),
        1
      ),
  };

  return {
    ...normalized,
    status:
      normalizeStatus(
        normalized
      ),
  };
}

export function getPatientPackages():
  PatientPackage[] {
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

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized =
      parsed.map(
        normalizePackage
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    return normalized;
  } catch {
    return [];
  }
}

export function getPatientPackagesByUnit(
  unitId: number
) {
  return getPatientPackages()
    .filter(
      (
        item
      ) =>
        item.unitId ===
        unitId
    )
    .sort(
      (
        a,
        b
      ) =>
        b.purchaseDate.localeCompare(
          a.purchaseDate
        )
    );
}

export function getPatientPackagesByPatient(
  patientId: number,
  unitId?: number
) {
  return getPatientPackages()
    .filter(
      (
        item
      ) =>
        item.patientId ===
          patientId &&
        (
          unitId ===
            undefined ||
          item.unitId ===
            unitId
        )
    )
    .sort(
      (
        a,
        b
      ) =>
        b.purchaseDate.localeCompare(
          a.purchaseDate
        )
    );
}

export function getActivePatientPackages(
  patientId: number,
  unitId: number
) {
  return getPatientPackagesByPatient(
    patientId,
    unitId
  ).filter(
    (
      item
    ) =>
      item.status ===
      "Ativo"
  );
}

export function getPatientPackageRemainingSessions(
  packageItem: PatientPackage
) {
  return packageItem.items.reduce(
    (
      total,
      item
    ) =>
      total +
      Math.max(
        item.totalSessions -
          item.usedSessions,
        0
      ),
    0
  );
}

export function getPatientPackageTotalSessions(
  packageItem: PatientPackage
) {
  return packageItem.items.reduce(
    (
      total,
      item
    ) =>
      total +
      item.totalSessions,
    0
  );
}

export function purchasePatientPackage({
  plan,
  patientId,
  patient,
  unitId,
  purchaseDate,
  paymentMethod,
  installments,
}: {
  plan: PackagePlan;
  patientId: number;
  patient: string;
  unitId: number;
  purchaseDate: string;
  paymentMethod: string;
  installments: number;
}) {
  const current =
    getPatientPackages();

  const now =
    new Date().toISOString();

  const discountValue =
    Math.max(
      plan.originalValue -
        plan.finalValue,
      0
    );

  const item: PatientPackage = {
    id:
      Date.now(),

    unitId,

    patientId,
    patient,

    planId:
      plan.id,

    planName:
      plan.name,

    items:
      plan.items.map(
        (
          planItem
        ) => ({
          specialty:
            planItem.specialty,
          totalSessions:
            planItem.sessions,
          usedSessions:
            0,
        })
      ),

    originalValue:
      plan.originalValue,

    discountValue,

    finalValue:
      plan.finalValue,

    purchaseDate,

    validUntil:
      addDays(
        purchaseDate,
        plan.validityDays
      ),

    paymentMethod,

    installments:
      Math.max(
        Math.min(
          Math.trunc(
            installments ||
              1
          ),
          plan.allowInstallments
            ? plan.maxInstallments
            : 1
        ),
        1
      ),

    status:
      "Ativo",

    createdAt:
      now,

    updatedAt:
      now,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      item,
      ...current,
    ])
  );

  return item;
}

export function cancelPatientPackage(
  packageId: number
) {
  const next =
    getPatientPackages().map(
      (
        item
      ) =>
        item.id ===
        packageId
          ? {
              ...item,
              status:
                "Cancelado" as const,
              updatedAt:
                new Date().toISOString(),
            }
          : item
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

/**
 * Esta função já deixa o projeto preparado para a próxima etapa:
 * consumir automaticamente uma sessão quando um atendimento
 * coberto pelo pacote for realizado.
 */
export function getPatientPackageSessionUsages():
  PatientPackageSessionUsage[] {
  try {
    const raw =
      localStorage.getItem(
        USAGE_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function savePatientPackageSessionUsage(
  usage: PatientPackageSessionUsage
) {
  const current =
    getPatientPackageSessionUsages();

  localStorage.setItem(
    USAGE_STORAGE_KEY,
    JSON.stringify([
      usage,
      ...current,
    ])
  );
}

export function hasAppointmentConsumedPackageSession(
  appointmentId: number
) {
  return getPatientPackageSessionUsages().some(
    (
      usage
    ) =>
      usage.appointmentId ===
      appointmentId
  );
}

export function consumePatientPackageSession({
  packageId,
  specialty,
  appointmentId,
}: {
  packageId: number;
  specialty: string;
  appointmentId?: number;
}) {
  if (
    appointmentId !==
      undefined &&
    hasAppointmentConsumedPackageSession(
      appointmentId
    )
  ) {
    return {
      consumed:
        false,
      alreadyConsumed:
        true,
      patientPackageId:
        packageId,
    };
  }

  let consumed =
    false;

  let consumedPackage:
    PatientPackage |
    undefined;

  const next =
    getPatientPackages().map(
      (
        item
      ) => {
        if (
          item.id !==
            packageId ||
          item.status !==
            "Ativo"
        ) {
          return item;
        }

        const index =
          item.items.findIndex(
            (
              packageItem
            ) =>
              packageItem.specialty ===
                specialty &&
              packageItem.usedSessions <
                packageItem.totalSessions
          );

        if (
          index <
          0
        ) {
          return item;
        }

        const items =
          item.items.map(
            (
              packageItem,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? {
                    ...packageItem,
                    usedSessions:
                      packageItem.usedSessions +
                      1,
                  }
                : packageItem
          );

        consumed =
          true;

        consumedPackage =
          normalizePackage({
            ...item,
            items,
            updatedAt:
              new Date().toISOString(),
          });

        return consumedPackage;
      }
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  if (
    consumed &&
    consumedPackage &&
    appointmentId !==
      undefined
  ) {
    savePatientPackageSessionUsage({
      id:
        Date.now(),
      appointmentId,
      patientPackageId:
        consumedPackage.id,
      patientId:
        consumedPackage.patientId,
      unitId:
        consumedPackage.unitId,
      specialty,
      consumedAt:
        new Date().toISOString(),
    });
  }

  return {
    consumed,
    alreadyConsumed:
      false,
    patientPackageId:
      consumedPackage?.id,
    patientPackage:
      consumedPackage,
  };
}

export function consumeLinkedPatientPackageSession({
  appointmentId,
  patientPackageId,
  patientId,
  unitId,
  specialty,
}: {
  appointmentId: number;
  patientPackageId: number;
  patientId: number;
  unitId: number;
  specialty: string;
}) {
  if (
    hasAppointmentConsumedPackageSession(
      appointmentId
    )
  ) {
    const usage =
      getPatientPackageSessionUsages().find(
        (
          item
        ) =>
          item.appointmentId ===
          appointmentId
      );

    return {
      consumed:
        false,
      alreadyConsumed:
        true,
      patientPackageId:
        usage?.patientPackageId,
      patientPackage:
        usage
          ? getPatientPackages().find(
              (
                item
              ) =>
                item.id ===
                usage.patientPackageId
            )
          : undefined,
    };
  }

  const packageItem =
    getPatientPackages().find(
      (
        item
      ) =>
        item.id ===
          patientPackageId &&
        item.patientId ===
          patientId &&
        item.unitId ===
          unitId &&
        item.status ===
          "Ativo"
    );

  if (
    !packageItem
  ) {
    return {
      consumed:
        false,
      alreadyConsumed:
        false,
      patientPackageId:
        undefined,
      patientPackage:
        undefined,
    };
  }

  const compatible =
    packageItem.items.some(
      (
        item
      ) =>
        item.specialty ===
          specialty &&
        item.usedSessions <
          item.totalSessions
    );

  if (
    !compatible
  ) {
    return {
      consumed:
        false,
      alreadyConsumed:
        false,
      patientPackageId:
        packageItem.id,
      patientPackage:
        packageItem,
    };
  }

  return consumePatientPackageSession({
    packageId:
      packageItem.id,
    specialty,
    appointmentId,
  });
}

export function consumeAvailablePatientPackageSession({
  appointmentId,
  patientId,
  unitId,
  specialty,
}: {
  appointmentId: number;
  patientId: number;
  unitId: number;
  specialty: string;
}) {
  if (
    hasAppointmentConsumedPackageSession(
      appointmentId
    )
  ) {
    const usage =
      getPatientPackageSessionUsages().find(
        (
          item
        ) =>
          item.appointmentId ===
          appointmentId
      );

    return {
      consumed:
        false,
      alreadyConsumed:
        true,
      patientPackageId:
        usage?.patientPackageId,
      patientPackage:
        usage
          ? getPatientPackages().find(
              (
                item
              ) =>
                item.id ===
                usage.patientPackageId
            )
          : undefined,
    };
  }

  const activePackages =
    getActivePatientPackages(
      patientId,
      unitId
    );

  const compatible =
    activePackages.find(
      (
        packageItem
      ) =>
        packageItem.items.some(
          (
            item
          ) =>
            item.specialty ===
              specialty &&
            item.usedSessions <
              item.totalSessions
        )
    );

  if (
    !compatible
  ) {
    return {
      consumed:
        false,
      alreadyConsumed:
        false,
      patientPackageId:
        undefined,
      patientPackage:
        undefined,
    };
  }

  return consumePatientPackageSession({
    packageId:
      compatible.id,
    specialty,
    appointmentId,
  });
}

export function findPlanFromPatientPackage(
  packageItem: PatientPackage
) {
  return getPackagePlanById(
    packageItem.planId
  );
}