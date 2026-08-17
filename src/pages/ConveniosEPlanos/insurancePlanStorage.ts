export type ConvenioPlanoStatus = "Ativo" | "Inativo";

export interface ConvenioPlano {
  id: string;
  convenio: string;
  plano: string;
  paciente: string;
  valorSessao: number;
  sessoesAutorizadas: number;
  sessoesUtilizadas: number;
  autorizacao: string;
  inicioAutorizacao: string;
  validadeAutorizacao: string;
  status: ConvenioPlanoStatus;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_convenios_planos";

function notify() {
  window.dispatchEvent(new Event("convenios-planos-changed"));
}

export function getConveniosPlanos(): ConvenioPlano[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConveniosPlanos(items: ConvenioPlano[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
}

export function createConvenioPlano(
  data: Omit<ConvenioPlano, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const item: ConvenioPlano = {
    ...data,
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  saveConveniosPlanos([item, ...getConveniosPlanos()]);
  return item;
}

export function updateConvenioPlano(
  id: string,
  changes: Partial<Omit<ConvenioPlano, "id" | "createdAt">>
) {
  saveConveniosPlanos(
    getConveniosPlanos().map((item) =>
      item.id === id
        ? { ...item, ...changes, updatedAt: new Date().toISOString() }
        : item
    )
  );
}

export function registrarSessao(id: string) {
  const item = getConveniosPlanos().find((x) => x.id === id);
  if (!item) throw new Error("Plano não encontrado.");
  if (item.status !== "Ativo") throw new Error("Plano inativo.");
  if (item.sessoesUtilizadas >= item.sessoesAutorizadas)
    throw new Error("Todas as sessões autorizadas já foram utilizadas.");

  updateConvenioPlano(id, {
    sessoesUtilizadas: item.sessoesUtilizadas + 1,
  });
}