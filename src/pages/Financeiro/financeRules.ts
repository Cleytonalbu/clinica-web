import {
  getConvenioServiceValue,
  getProfessionalServiceValue,
} from "@/pages/Configuracoes/settingsStorage";

export type BillingType =
  | "Particular"
  | "Convênio";

export type PaymentMethod =
  | "Pix"
  | "Dinheiro"
  | "Cartão de débito"
  | "Cartão de crédito"
  | "Transferência"
  | "Convênio";

export function calculateChargeAmount({
  professional,
  specialty,
  billingType,
  convenio,
}: {
  professional: string;

  specialty: string;

  billingType: BillingType;

  convenio?: string;
}) {
  if (
    billingType ===
      "Convênio" &&
    convenio
  ) {
    return getConvenioServiceValue(
      convenio,
      professional,
      specialty
    );
  }

  return getProfessionalServiceValue(
    professional,
    specialty
  );
}

export function getDefaultPaymentMethod(
  billingType: BillingType
): PaymentMethod {
  if (
    billingType ===
    "Convênio"
  ) {
    return "Convênio";
  }

  return "Pix";
}

export function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    value
  );
}