export type PackageDiscountType =
  | "percentage"
  | "fixed";

export interface PackagePlanItem {
  id: number;
  specialty: string;
  sessions: number;
}

export interface PackagePlan {
  id: number;
  unitId: number;
  name: string;
  items: PackagePlanItem[];
  originalValue: number;
  discountType: PackageDiscountType;
  discountValue: number;
  finalValue: number;
  validityDays: number;
  allowInstallments: boolean;
  maxInstallments: number;
  active: boolean;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-package-plans";

function normalizeNumber(
  value: unknown,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function normalizePlan(
  plan: Partial<PackagePlan>
): PackagePlan {
  const originalValue = Math.max(
    normalizeNumber(
      plan.originalValue
    ),
    0
  );

  const discountType: PackageDiscountType =
    plan.discountType === "fixed"
      ? "fixed"
      : "percentage";

  const discountValue = Math.max(
    normalizeNumber(
      plan.discountValue
    ),
    0
  );

  const calculatedDiscount =
    discountType === "percentage"
      ? originalValue *
        Math.min(
          discountValue,
          100
        ) /
        100
      : Math.min(
          discountValue,
          originalValue
        );

  const calculatedFinal = Math.max(
    originalValue -
      calculatedDiscount,
    0
  );

  return {
    id:
      normalizeNumber(
        plan.id,
        Date.now()
      ),
    unitId:
      normalizeNumber(
        plan.unitId,
        1
      ),
    name:
      String(
        plan.name ?? ""
      ),
    items:
      Array.isArray(
        plan.items
      )
        ? plan.items
            .map(
              (
                item,
                index
              ) => ({
                id:
                  normalizeNumber(
                    item?.id,
                    Date.now() +
                      index
                  ),
                specialty:
                  String(
                    item?.specialty ??
                      ""
                  ),
                sessions:
                  Math.max(
                    Math.trunc(
                      normalizeNumber(
                        item?.sessions,
                        1
                      )
                    ),
                    1
                  ),
              })
            )
            .filter(
              (item) =>
                Boolean(
                  item.specialty
                )
            )
        : [],
    originalValue,
    discountType,
    discountValue,
    finalValue:
      Number.isFinite(
        Number(
          plan.finalValue
        )
      )
        ? Math.max(
            Number(
              plan.finalValue
            ),
            0
          )
        : calculatedFinal,
    validityDays:
      Math.max(
        Math.trunc(
          normalizeNumber(
            plan.validityDays,
            30
          )
        ),
        1
      ),
    allowInstallments:
      Boolean(
        plan.allowInstallments
      ),
    maxInstallments:
      Math.max(
        Math.trunc(
          normalizeNumber(
            plan.maxInstallments,
            1
          )
        ),
        1
      ),
    active:
      plan.active !== false,
    observation:
      String(
        plan.observation ?? ""
      ),
    createdAt:
      String(
        plan.createdAt ??
          new Date().toISOString()
      ),
    updatedAt:
      String(
        plan.updatedAt ??
          new Date().toISOString()
      ),
  };
}

export function calculatePackageFinalValue(
  originalValue: number,
  discountType: PackageDiscountType,
  discountValue: number
) {
  const original = Math.max(
    Number(originalValue) || 0,
    0
  );

  const discount = Math.max(
    Number(discountValue) || 0,
    0
  );

  if (
    discountType ===
    "percentage"
  ) {
    return Math.max(
      original -
        original *
          Math.min(
            discount,
            100
          ) /
          100,
      0
    );
  }

  return Math.max(
    original -
      Math.min(
        discount,
        original
      ),
    0
  );
}

export function getPackagePlans():
  PackagePlan[] {
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

    return parsed.map(
      normalizePlan
    );
  } catch {
    return [];
  }
}

export function getPackagePlansByUnit(
  unitId: number
) {
  return getPackagePlans()
    .filter(
      (plan) =>
        plan.unitId ===
        unitId
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "pt-BR"
        )
    );
}

export function getActivePackagePlansByUnit(
  unitId: number
) {
  return getPackagePlansByUnit(
    unitId
  ).filter(
    (plan) =>
      plan.active
  );
}

export function getPackagePlanById(
  planId: number
) {
  return getPackagePlans().find(
    (plan) =>
      plan.id ===
      planId
  );
}

export function savePackagePlan(
  plan: PackagePlan
) {
  const current =
    getPackagePlans();

  const normalized =
    normalizePlan({
      ...plan,
      updatedAt:
        new Date().toISOString(),
    });

  const exists =
    current.some(
      (item) =>
        item.id ===
        normalized.id
    );

  const next = exists
    ? current.map(
        (item) =>
          item.id ===
          normalized.id
            ? normalized
            : item
      )
    : [
        ...current,
        normalized,
      ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  return normalized;
}

export function createPackagePlan(
  data: Omit<
    PackagePlan,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "finalValue"
  >
) {
  const now =
    new Date().toISOString();

  const plan: PackagePlan = {
    ...data,
    id:
      Date.now(),
    finalValue:
      calculatePackageFinalValue(
        data.originalValue,
        data.discountType,
        data.discountValue
      ),
    createdAt:
      now,
    updatedAt:
      now,
  };

  return savePackagePlan(
    plan
  );
}

export function setPackagePlanStatus(
  planId: number,
  active: boolean
) {
  const plan =
    getPackagePlanById(
      planId
    );

  if (!plan) {
    return;
  }

  savePackagePlan({
    ...plan,
    active,
  });
}

export function deletePackagePlan(
  planId: number
) {
  const next =
    getPackagePlans().filter(
      (plan) =>
        plan.id !==
        planId
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}