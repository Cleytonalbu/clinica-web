import type {
  BillingType,
  PaymentMethod,
} from "./financeRules";

import {
  calculateChargeAmount,
  getDefaultPaymentMethod,
} from "./financeRules";

export type FinancialChargeStatus =
  | "Pendente"
  | "Pago"
  | "Cancelado";

export interface FinancialCharge {
  id: number;

  appointmentId: number;

  patientId: number;
  patient: string;

  professional: string;
  specialty: string;

  description: string;

  date: string;
  dueDate: string;

  billingType: BillingType;

  convenio?: string;

  paymentMethod: PaymentMethod;

  originalAmount: number;

  discount: number;

  surcharge?: number;

  amount: number;

  receivedAmount?: number;

  status: FinancialChargeStatus;

  paidAt?: string;

  paymentDate?: string;

  paymentObservation?: string;

  bankAccountId?: string;

  bankAccountName?: string;

  createdAt: string;
}

const STORAGE_KEY =
  "entre-afetos-financial-charges";

export function getFinancialCharges(): FinancialCharge[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    return JSON.parse(
      stored
    ) as FinancialCharge[];
  } catch {
    return [];
  }
}

export function getFinancialChargeById(
  chargeId: number
) {
  return getFinancialCharges().find(
    (
      charge
    ) =>
      charge.id ===
      chargeId
  );
}

export function saveFinancialCharge(
  charge: FinancialCharge
) {
  const current =
    getFinancialCharges();

  const alreadyExists =
    current.some(
      (
        item
      ) =>
        item.appointmentId ===
        charge.appointmentId
    );

  if (
    alreadyExists
  ) {
    return;
  }

  const next = [
    ...current,
    charge,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

interface CreateChargeData {
  appointmentId: number;

  patientId: number;
  patient: string;

  professional: string;
  specialty: string;

  date: string;

  billingType?: BillingType;

  convenio?: string;

  paymentMethod?: PaymentMethod;

  amount?: number;
}

export function createChargeFromAppointment(
  data: CreateChargeData
) {
  const existing =
    getFinancialCharges().find(
      (
        item
      ) =>
        item.appointmentId ===
        data.appointmentId
    );

  if (
    existing
  ) {
    return existing;
  }

  const billingType =
    data.billingType ??
    "Particular";

  const originalAmount =
    calculateChargeAmount({
      professional:
        data.professional,

      specialty:
        data.specialty,

      billingType:
        "Particular",
    });

  const calculatedAmount =
    calculateChargeAmount({
      professional:
        data.professional,

      specialty:
        data.specialty,

      billingType,

      convenio:
        data.convenio,
    });

  /*
    Se o agendamento já possui um valor
    calculado e salvo, usamos exatamente
    aquele valor.

    Isso evita que uma alteração futura
    nas configurações mude retroativamente
    o preço do atendimento.
  */
  const finalAmount =
    data.amount !==
      undefined &&
    data.amount >=
      0
      ? data.amount
      : calculatedAmount;

  const discount =
    Math.max(
      originalAmount -
        finalAmount,
      0
    );

  const charge: FinancialCharge = {
    id:
      Date.now(),

    appointmentId:
      data.appointmentId,

    patientId:
      data.patientId,

    patient:
      data.patient,

    professional:
      data.professional,

    specialty:
      data.specialty,

    description:
      `Atendimento - ${data.specialty}`,

    date:
      data.date,

    dueDate:
      data.date,

    billingType,

    convenio:
      data.convenio,

    paymentMethod:
      data.paymentMethod ??
      getDefaultPaymentMethod(
        billingType
      ),

    originalAmount,

    discount,

    surcharge:
      0,

    amount:
      finalAmount,

    status:
      "Pendente",

    createdAt:
      new Date().toISOString(),
  };

  saveFinancialCharge(
    charge
  );

  return charge;
}

export function updateFinancialCharge(
  chargeId: number,
  data: Partial<FinancialCharge>
) {
  const current =
    getFinancialCharges();

  const next =
    current.map(
      (
        charge
      ) =>
        charge.id ===
        chargeId
          ? {
              ...charge,
              ...data,
            }
          : charge
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}

interface ReceiveChargeData {
  paymentMethod: PaymentMethod;

  receivedAmount: number;

  discount: number;

  surcharge: number;

  paymentDate: string;

  observation?: string;

  bankAccountId?: string;

  bankAccountName?: string;
}

export function receiveFinancialCharge(
  chargeId: number,
  data: ReceiveChargeData
) {
  const charge =
    getFinancialChargeById(
      chargeId
    );

  if (!charge) {
    throw new Error(
      "Cobrança não encontrada."
    );
  }

  const calculatedAmount =
    Math.max(
      charge.originalAmount -
        data.discount +
        data.surcharge,
      0
    );

  updateFinancialCharge(
    chargeId,
    {
      paymentMethod:
        data.paymentMethod,

      discount:
        data.discount,

      surcharge:
        data.surcharge,

      amount:
        calculatedAmount,

      receivedAmount:
        data.receivedAmount,

      paymentDate:
        data.paymentDate,

      paymentObservation:
        data.observation,

      bankAccountId:
        data.bankAccountId,

      bankAccountName:
        data.bankAccountName,

      status:
        "Pago",

      paidAt:
        new Date().toISOString(),
    }
  );
}

export function markChargeAsPaid(
  chargeId: number
) {
  const charge =
    getFinancialChargeById(
      chargeId
    );

  if (!charge) {
    return;
  }

  receiveFinancialCharge(
    chargeId,
    {
      paymentMethod:
        charge.paymentMethod,

      receivedAmount:
        charge.amount,

      discount:
        charge.discount ??
        0,

      surcharge:
        charge.surcharge ??
        0,

      paymentDate:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      observation:
        "",
    }
  );
}

export function cancelFinancialCharge(
  chargeId: number
) {
  updateFinancialCharge(
    chargeId,
    {
      status:
        "Cancelado",
    }
  );
}

export function getPatientFinancialHistory(
  patientId: number
) {
  return getFinancialCharges()
    .filter(
      (
        charge
      ) =>
        charge.patientId ===
        patientId
    )
    .sort(
      (
        a,
        b
      ) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );
}