import {
  getBankAccounts,
  updateBankAccount,
} from "@/pages/ContasBancarias/bankAccountStorage";

export type BankTransactionSource =
  | "OFX"
  | "CSV"
  | "Manual";

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  source: BankTransactionSource;
  fitId?: string;
  fingerprint: string;
  importedAt: string;
  originalFileName?: string;
}

const STORAGE_KEY =
  "entreafetos_bank_transactions";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("bank-transactions-changed"),
    );
  }
}

export function getBankTransactions(): BankTransaction[] {
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

export function saveBankTransactions(
  transactions: BankTransaction[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions),
  );

  emitChange();
}

export function createTransactionFingerprint(
  accountId: string,
  date: string,
  amount: number,
  description: string,
  fitId?: string,
) {
  const normalizedDescription =
    description
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  return [
    accountId,
    date,
    amount.toFixed(2),
    normalizedDescription,
    fitId?.trim() ?? "",
  ].join("|");
}

export function transactionExists(
  fingerprint: string,
) {
  return getBankTransactions().some(
    (transaction) =>
      transaction.fingerprint ===
      fingerprint,
  );
}

export function recalculateBankAccountBalance(
  accountId: string,
) {
  const account =
    getBankAccounts().find(
      (item) => item.id === accountId,
    );

  if (!account) {
    return;
  }

  const movementBalance =
    getBankTransactions()
      .filter(
        (transaction) =>
          transaction.accountId ===
          accountId,
      )
      .reduce(
        (sum, transaction) =>
          sum +
          transaction.amount,
        0,
      );

  updateBankAccount(
    accountId,
    {
      currentBalance:
        account.initialBalance +
        movementBalance,
    },
  );
}

export function importBankTransactions(
  accountId: string,
  items: Array<{
    date: string;
    description: string;
    amount: number;
    source: BankTransactionSource;
    fitId?: string;
    originalFileName?: string;
  }>,
) {
  const existing =
    getBankTransactions();

  const fingerprints =
    new Set(
      existing.map(
        (transaction) =>
          transaction.fingerprint,
      ),
    );

  const now =
    new Date().toISOString();

  const imported: BankTransaction[] =
    [];

  const duplicates: typeof items =
    [];

  for (const item of items) {
    const fingerprint =
      createTransactionFingerprint(
        accountId,
        item.date,
        item.amount,
        item.description,
        item.fitId,
      );

    if (
      fingerprints.has(
        fingerprint,
      )
    ) {
      duplicates.push(item);
      continue;
    }

    const transaction: BankTransaction = {
      id:
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,
      accountId,
      date: item.date,
      description:
        item.description,
      amount:
        item.amount,
      source:
        item.source,
      fitId:
        item.fitId,
      fingerprint,
      importedAt: now,
      originalFileName:
        item.originalFileName,
    };

    imported.push(
      transaction,
    );

    fingerprints.add(
      fingerprint,
    );
  }

  if (imported.length > 0) {
    saveBankTransactions([
      ...imported,
      ...existing,
    ]);

    recalculateBankAccountBalance(
      accountId,
    );
  }

  return {
    imported,
    duplicates,
  };
}