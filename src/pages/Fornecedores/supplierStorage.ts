import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

export type SupplierStatus = "Ativo" | "Inativo";

export interface Supplier {
  id: string;
  unitId: number;
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
    if (!Array.isArray(parsed)) return [];

    const defaultUnitId = getDefaultClinicUnitId();
    let changed = false;

    const normalized = parsed.map((supplier) => {
      const unitId = Number(supplier?.unitId);

      if (Number.isFinite(unitId) && unitId > 0) {
        return { ...supplier, unitId } as Supplier;
      }

      changed = true;
      return { ...supplier, unitId: defaultUnitId } as Supplier;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return [];
  }
}

export function getSuppliers(): Supplier[] {
  return readSuppliers();
}

export function saveSupplier(
  data: Omit<Supplier, "id" | "createdAt" | "unitId"> & { unitId?: number }
): Supplier {
  const supplier: Supplier = {
    ...data,
    unitId:
      Number.isFinite(Number(data.unitId)) && Number(data.unitId) > 0
        ? Number(data.unitId)
        : getDefaultClinicUnitId(),
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