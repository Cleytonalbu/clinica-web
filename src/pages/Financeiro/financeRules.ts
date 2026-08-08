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

interface SpecialtyPrice {
  specialty: string;
  amount: number;
}

const specialtyPrices: SpecialtyPrice[] = [
  {
    specialty: "Psicologia",
    amount: 150,
  },
  {
    specialty: "Fonoaudiologia",
    amount: 140,
  },
  {
    specialty: "Terapia Ocupacional",
    amount: 160,
  },
  {
    specialty: "Fisioterapia",
    amount: 130,
  },
  {
    specialty: "Psicopedagogia",
    amount: 140,
  },
  {
    specialty: "Nutrição",
    amount: 150,
  },
];

export function getSpecialtyPrice(
  specialty: string
) {
  const item =
    specialtyPrices.find(
      (price) =>
        price.specialty ===
        specialty
    );

  return item?.amount ?? 150;
}

export function calculateChargeAmount({
  specialty,
  billingType,
}: {
  specialty: string;
  billingType: BillingType;
}) {
  const baseValue =
    getSpecialtyPrice(
      specialty
    );

  if (
    billingType === "Convênio"
  ) {
    return baseValue * 0.8;
  }

  return baseValue;
}

export function getDefaultPaymentMethod(
  billingType: BillingType
): PaymentMethod {
  if (
    billingType === "Convênio"
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
  ).format(value);
}