export type StockMovementType = "Entrada" | "Saída";

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  reason: string;
  responsible?: string;
  notes?: string;
  createdAt: string;
}

const ITEMS_KEY = "entreafetos_stock_items";
const MOVEMENTS_KEY = "entreafetos_stock_movements";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("stock-changed"));
  }
}

export function getStockItems(): StockItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStockItems(items: StockItem[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  emitChange();
}

export function createStockItem(
  input: Omit<StockItem, "id" | "createdAt" | "updatedAt">,
): StockItem {
  const now = new Date().toISOString();

  const item: StockItem = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
  };

  const current = getStockItems();
  saveStockItems([item, ...current]);

  return item;
}

export function getStockMovements(): StockMovement[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MOVEMENTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStockMovements(movements: StockMovement[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    MOVEMENTS_KEY,
    JSON.stringify(movements),
  );
}

export function registerStockMovement(
  input: Omit<StockMovement, "id" | "itemName" | "createdAt">,
) {
  const items = getStockItems();
  const item = items.find((current) => current.id === input.itemId);

  if (!item) {
    throw new Error("Item de estoque não encontrado.");
  }

  if (input.quantity <= 0) {
    throw new Error("A quantidade deve ser maior que zero.");
  }

  if (input.type === "Saída" && input.quantity > item.quantity) {
    throw new Error("A quantidade de saída é maior que o saldo disponível.");
  }

  const newQuantity =
    input.type === "Entrada"
      ? item.quantity + input.quantity
      : item.quantity - input.quantity;

  const updatedItems = items.map((current) =>
    current.id === item.id
      ? {
          ...current,
          quantity: newQuantity,
          updatedAt: new Date().toISOString(),
        }
      : current,
  );

  const movement: StockMovement = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    itemName: item.name,
    createdAt: new Date().toISOString(),
  };

  saveStockItems(updatedItems);
  saveStockMovements([movement, ...getStockMovements()]);
  emitChange();
}