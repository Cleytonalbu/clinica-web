export type ReconciliationType =
  | "Receita"
  | "Despesa"
  | "Outro";

export interface BankReconciliation {
  transactionId: string;
  type: ReconciliationType;
  category: string;
  notes?: string;
  reconciledAt: string;
}

const STORAGE_KEY =
  "entreafetos_bank_reconciliations";

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("bank-reconciliations-changed"),
    );
  }
}

export function getBankReconciliations(): BankReconciliation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    return raw
      ? JSON.parse(raw)
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
  saveBankReconciliations(
    getBankReconciliations().filter(
      (item) =>
        item.transactionId !==
        transactionId,
    ),
  );
}