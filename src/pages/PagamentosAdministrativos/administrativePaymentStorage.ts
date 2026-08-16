export type AdministrativePaymentType =
  | "Salário"
  | "Pró-labore"
  | "Prestação de serviço"
  | "Diária"
  | "Benefício"
  | "Outro";

export type AdministrativePaymentStatus =
  | "Pendente"
  | "Pago"
  | "Cancelado";

export interface AdministrativePayment {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  collaboratorRole: string;
  competence: string;
  type: AdministrativePaymentType;
  description: string;
  amount: number;
  dueDate: string;
  status: AdministrativePaymentStatus;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_administrative_payments";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("administrative-payments-changed"),
    );
  }
}

export function getAdministrativePayments(): AdministrativePayment[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAdministrativePayments(
  payments: AdministrativePayment[],
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(payments),
  );

  emitChange();
}

export function createAdministrativePayment(
  input: Omit<
    AdministrativePayment,
    "id" | "createdAt" | "updatedAt"
  >,
): AdministrativePayment {
  const now = new Date().toISOString();

  const payment: AdministrativePayment = {
    ...input,
    id:
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getAdministrativePayments();
  saveAdministrativePayments([payment, ...current]);

  return payment;
}

export function updateAdministrativePayment(
  id: string,
  changes: Partial<
    Omit<AdministrativePayment, "id" | "createdAt">
  >,
) {
  const current = getAdministrativePayments();

  const updated = current.map((payment) =>
    payment.id === id
      ? {
          ...payment,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : payment,
  );

  saveAdministrativePayments(updated);
}

export function markAdministrativePaymentAsPaid(
  id: string,
  paymentDate: string,
  paymentMethod: string,
) {
  updateAdministrativePayment(id, {
    status: "Pago",
    paymentDate,
    paymentMethod,
  });
}

export function cancelAdministrativePayment(id: string) {
  updateAdministrativePayment(id, {
    status: "Cancelado",
  });
}