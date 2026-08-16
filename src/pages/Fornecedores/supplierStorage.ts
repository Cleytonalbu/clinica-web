export type SupplierStatus = "Ativo" | "Inativo";

export interface Supplier {
  id: string;
  name: string;
  document: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  status: SupplierStatus;
  createdAt: string;
}

const STORAGE_KEY = "entreafetos_suppliers";

function readSuppliers(): Supplier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSuppliers(): Supplier[] {
  return readSuppliers();
}

export function saveSupplier(data: Omit<Supplier, "id" | "createdAt">): Supplier {
  const supplier: Supplier = {
    ...data,
    id: `supplier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const suppliers = readSuppliers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([supplier, ...suppliers]));
  return supplier;
}

export function updateSupplierStatus(id: string, status: SupplierStatus): Supplier[] {
  const suppliers = readSuppliers().map((supplier) =>
    supplier.id === id ? { ...supplier, status } : supplier
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  return suppliers;
}