import {
  getActivePaymentMethods,
  getConvenioServiceValue,
  getFinancialSettings,
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

const paymentMethodByKey = {
  pix: "Pix",
  cash: "Dinheiro",
  creditCard: "Cartão de crédito",
  debitCard: "Cartão de débito",
  bankTransfer: "Transferência",
} as const;

export function getConfiguredPaymentMethods(): PaymentMethod[] {
  const configured = getActivePaymentMethods()
    .map((method) =>
      paymentMethodByKey[
        method.key as keyof typeof paymentMethodByKey
      ]
    )
    .filter(Boolean) as PaymentMethod[];

  return configured.length > 0
    ? configured
    : ["Pix"];
}

/**
 * Regra compartilhada por Agenda e Recepção:
 * a configuração financeira decide se o particular avulso
 * gera cobrança no agendamento. Pacote e convênio seguem
 * seus próprios fluxos.
 */
export function shouldCreateChargeOnAppointmentCreation({
  billingType,
  hasPatientPackage,
}: {
  billingType: BillingType;
  hasPatientPackage: boolean;
}) {
  const settings =
    getFinancialSettings();

  return (
    settings.generateChargeAutomatically &&
    settings.chargeOnAppointmentCreation &&
    billingType === "Particular" &&
    !hasPatientPackage
  );
}

export function calculateChargeAmount({
  professional,
  specialty,
  billingType,
  convenio,
}: {
  unitId?: number;

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
