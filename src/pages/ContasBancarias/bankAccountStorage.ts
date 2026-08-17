export type BankAccountType =
  | "Conta corrente"
  | "Conta poupança"
  | "Conta pagamento"
  | "Caixa"
  | "Outro";

export type BankAccountStatus =
  | "Ativa"
  | "Inativa";

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountType: BankAccountType;
  agency?: string;
  accountNumber?: string;
  initialBalance: number;
  currentBalance: number;
  status: BankAccountStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entreafetos_bank_accounts";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("bank-accounts-changed"),
    );
  }
}

export function getBankAccounts(): BankAccount[] {
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

export function saveBankAccounts(
  accounts: BankAccount[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(accounts),
  );

  emitChange();
}

export function createBankAccount(
  input: Omit<
    BankAccount,
    "id" | "createdAt" | "updatedAt" | "currentBalance"
  >,
): BankAccount {
  const now = new Date().toISOString();

  const account: BankAccount = {
    ...input,
    id:
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
    currentBalance: input.initialBalance,
    createdAt: now,
    updatedAt: now,
  };

  const current =
    getBankAccounts();

  saveBankAccounts([
    account,
    ...current,
  ]);

  return account;
}

export function updateBankAccount(
  id: string,
  changes: Partial<
    Omit<BankAccount, "id" | "createdAt">
  >,
) {
  const current =
    getBankAccounts();

  const updated = current.map(
    (account) =>
      account.id === id
        ? {
            ...account,
            ...changes,
            updatedAt:
              new Date().toISOString(),
          }
        : account,
  );

  saveBankAccounts(updated);
}

export function setBankAccountStatus(
  id: string,
  status: BankAccountStatus,
) {
  updateBankAccount(id, {
    status,
  });
}