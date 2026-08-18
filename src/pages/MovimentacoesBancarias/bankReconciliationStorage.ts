export type ReconciliationType =
  | "Receita"
  | "Despesa"
  | "Outro";

export type ReconciliationLinkType =
  | "charge"
  | "expense";

export interface BankReconciliation {
  transactionId: string;
  type: ReconciliationType;
  category: string;
  notes?: string;
  reconciledAt: string;

  linkedType?: ReconciliationLinkType;
  linkedId?: number;
  linkedLabel?: string;
}

const STORAGE_KEY =
  "entreafetos_bank_reconciliations";

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(
        "bank-reconciliations-changed",
      ),
    );
  }
}

export function getBankReconciliations():
  BankReconciliation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveBankReconciliations(
  items: BankReconciliation[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items),
  );

  notify();
}

export function getBankReconciliation(
  transactionId: string,
) {
  return getBankReconciliations().find(
    (item) =>
      item.transactionId ===
      transactionId,
  );
}

export function reconcileBankTransaction(
  input: BankReconciliation,
) {
  const current =
    getBankReconciliations();

  const exists =
    current.some(
      (item) =>
        item.transactionId ===
        input.transactionId,
    );

  if (exists) {
    saveBankReconciliations(
      current.map(
        (item) =>
          item.transactionId ===
          input.transactionId
            ? input
            : item,
      ),
    );

    return;
  }

  saveBankReconciliations([
    input,
    ...current,
  ]);
}

export function removeBankReconciliation(
  transactionId: string,
) {
  const current =
    getBankReconciliations();

  const reconciliation =
    current.find(
      (item) =>
        item.transactionId ===
        transactionId,
    );

  /*
   * Se já existe vínculo com uma cobrança
   * ou despesa do Financeiro, não apagamos
   * a conciliação.
   *
   * Isso evita deixar um lançamento marcado
   * como Pago no Financeiro sem rastreabilidade
   * com a movimentação bancária que o quitou.
   */
  if (
    reconciliation?.linkedType &&
    reconciliation.linkedId !==
      undefined
  ) {
    throw new Error(
      "Esta movimentação já está vinculada ao Financeiro e não pode ter a conciliação removida.",
    );
  }

  saveBankReconciliations(
    current.filter(
      (item) =>
        item.transactionId !==
        transactionId,
    ),
  );
}