export type PurchaseStatus =
  | "Solicitado"
  | "Aprovado"
  | "Comprado"
  | "Recebido"
  | "Cancelado";

export interface PurchaseRequest {
  id: string;
  description: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  estimatedValue: number;
  requestDate: string;
  expectedDate?: string;
  status: PurchaseStatus;
  requester?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_purchase_requests";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("purchase-requests-changed"));
  }
}

export function getPurchaseRequests(): PurchaseRequest[] {
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

export function savePurchaseRequests(requests: PurchaseRequest[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  emitChange();
}

export function createPurchaseRequest(
  input: Omit<PurchaseRequest, "id" | "createdAt" | "updatedAt">,
): PurchaseRequest {
  const now = new Date().toISOString();

  const request: PurchaseRequest = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getPurchaseRequests();
  savePurchaseRequests([request, ...current]);

  return request;
}

export function updatePurchaseRequest(
  id: string,
  changes: Partial<Omit<PurchaseRequest, "id" | "createdAt">>,
) {
  const current = getPurchaseRequests();

  const updated = current.map((request) =>
    request.id === id
      ? {
          ...request,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : request,
  );

  savePurchaseRequests(updated);
}