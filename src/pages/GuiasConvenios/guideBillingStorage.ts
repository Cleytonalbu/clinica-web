export type GuiaConvenioStatus = "Pendente de envio" | "Enviado" | "Aprovado" | "Glosado" | "Pago";

export interface GuiaConvenio {
  id: string;
  convenio: string;
  plano: string;
  paciente: string;
  numeroGuia: string;
  competencia: string;
  dataAtendimento: string;
  quantidadeSessoes: number;
  valorUnitario: number;
  valorTotal: number;
  status: GuiaConvenioStatus;
  dataEnvio?: string;
  dataPagamento?: string;
  motivoGlosa?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_guias_convenios";

function notify() {
  window.dispatchEvent(new Event("guias-convenios-changed"));
}

export function getGuiasConvenios(): GuiaConvenio[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuiasConvenios(items: GuiaConvenio[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
}

export function createGuiaConvenio(
  data: Omit<GuiaConvenio, "id" | "createdAt" | "updatedAt" | "valorTotal">
) {
  const now = new Date().toISOString();
  const item: GuiaConvenio = {
    ...data,
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    valorTotal: data.quantidadeSessoes * data.valorUnitario,
    createdAt: now,
    updatedAt: now,
  };
  saveGuiasConvenios([item, ...getGuiasConvenios()]);
  return item;
}

export function updateGuiaConvenio(
  id: string,
  changes: Partial<Omit<GuiaConvenio, "id" | "createdAt">>
) {
  saveGuiasConvenios(
    getGuiasConvenios().map((item) =>
      item.id === id
        ? { ...item, ...changes, updatedAt: new Date().toISOString() }
        : item
    )
  );
}