import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

export type GuiaConvenioStatus =
  | "Pendente de envio"
  | "Enviado"
  | "Aprovado"
  | "Glosado"
  | "Em recurso"
  | "Recurso aprovado"
  | "Recurso negado"
  | "Pago";


export type LoteConvenioStatus =
  | "Aberto"
  | "Fechado"
  | "Enviado"
  | "Em análise"
  | "Parcialmente aprovado"
  | "Aprovado"
  | "Parcialmente pago"
  | "Pago";

export type RecursoGlosaStatus =
  | "Em recurso"
  | "Aprovado"
  | "Negado";

export interface RecursoGlosa {
  id: string;
  guiaId: string;
  loteId: string;
  unitId: number;
  convenio: string;

  valorGlosadoOriginal: number;
  valorRecorrido: number;
  valorRecuperado?: number;

  motivoGlosa: string;
  justificativaRecurso: string;

  protocolo?: string;
  dataEnvio: string;
  dataRetorno?: string;

  status: RecursoGlosaStatus;
  observacaoRetorno?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ConvenioRepasse {
  id: string;
  loteId: string;
  unitId: number;
  convenio: string;

  date: string;
  amount: number;

  bankAccountId: string;
  bankAccountName: string;

  financeChargeId: number;
  bankTransactionId: string;

  observation?: string;

  createdAt: string;
}

export interface LoteConvenio {
  id: string;
  unitId: number;
  convenio: string;
  competencia: string;
  guiaIds: string[];
  quantidadeAtendimentos: number;
  valorTotal: number;

  valorAprovado?: number;
  valorGlosado?: number;
  quantidadeGlosada?: number;

  valorRecebido?: number;
  saldoAReceber?: number;
  repasses?: ConvenioRepasse[];

  status: LoteConvenioStatus;
  dataFechamento?: string;
  dataEnvio?: string;
  protocoloEnvio?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuiaConvenio {
  id: string;
  unitId: number;
  appointmentId?: number;
  convenio: string;
  plano: string;
  paciente: string;
  professional?: string;
  specialty?: string;
  numeroGuia: string;
  competencia: string;
  dataAtendimento: string;
  quantidadeSessoes: number;
  valorUnitario: number;
  valorTotal: number;

  valorAprovado?: number;
  valorGlosado?: number;
  motivoGlosa?: string;

  recursoGlosaId?: string;
  valorRecuperadoGlosa?: number;

  status: GuiaConvenioStatus;
  loteId?: string;
  dataEnvio?: string;
  dataPagamento?: string;
  motivoGlosa?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "entreafetos_guias_convenios";
const LOTES_STORAGE_KEY = "entreafetos_lotes_convenios";
const RECURSOS_GLOSA_STORAGE_KEY = "entreafetos_recursos_glosa";

function notify() {
  window.dispatchEvent(new Event("guias-convenios-changed"));
}

function notifyLotes() {
  window.dispatchEvent(new Event("lotes-convenios-changed"));
}

function notifyRecursosGlosa() {
  window.dispatchEvent(new Event("recursos-glosa-changed"));
}

export function getGuiasConvenios(): GuiaConvenio[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Array<GuiaConvenio | Omit<GuiaConvenio, "unitId">>;
    const defaultUnitId = getDefaultClinicUnitId();
    let changed = false;

    const migrated = parsed.map((item) => {
      if ("unitId" in item && Number.isFinite(Number(item.unitId))) {
        return { ...item, unitId: Number(item.unitId) } as GuiaConvenio;
      }
      changed = true;
      return { ...item, unitId: defaultUnitId } as GuiaConvenio;
    });

    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
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

export function createGuiaFromAppointment(data: {
  unitId: number;
  appointmentId: number;
  convenio: string;
  paciente: string;
  professional: string;
  specialty: string;
  dataAtendimento: string;
  valorUnitario: number;
}) {
  const existing = getGuiasConvenios().find(
    (item) => item.appointmentId === data.appointmentId
  );
  if (existing) return existing;

  return createGuiaConvenio({
    unitId: data.unitId,
    appointmentId: data.appointmentId,
    convenio: data.convenio,
    plano: "",
    paciente: data.paciente,
    professional: data.professional,
    specialty: data.specialty,
    numeroGuia: "",
    competencia: data.dataAtendimento.slice(0, 7),
    dataAtendimento: data.dataAtendimento,
    quantidadeSessoes: 1,
    valorUnitario: data.valorUnitario,
    status: "Pendente de envio",
    observacoes: "Gerado automaticamente após a realização do atendimento.",
  });
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


export function getLotesConvenios(): LoteConvenio[] {
  try {
    const raw =
      localStorage.getItem(
        LOTES_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      ) as LoteConvenio[];

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveLotesConvenios(
  items: LoteConvenio[]
) {
  localStorage.setItem(
    LOTES_STORAGE_KEY,
    JSON.stringify(items)
  );

  notifyLotes();
}

export function getLoteConvenioById(
  loteId: string
) {
  return getLotesConvenios().find(
    (item) =>
      item.id === loteId
  );
}

export function createLoteConvenio({
  unitId,
  convenio,
  competencia,
  observacoes,
}: {
  unitId: number;
  convenio: string;
  competencia: string;
  observacoes?: string;
}) {
  const availableGuides =
    getGuiasConvenios().filter(
      (item) =>
        item.unitId === unitId &&
        item.convenio === convenio &&
        item.competencia === competencia &&
        item.status === "Pendente de envio" &&
        !item.loteId
    );

  if (
    availableGuides.length === 0
  ) {
    throw new Error(
      "Não existem atendimentos pendentes disponíveis para este lote."
    );
  }

  const now =
    new Date().toISOString();

  const lote: LoteConvenio = {
    id:
      crypto.randomUUID?.() ??
      `${Date.now()}`,
    unitId,
    convenio,
    competencia,
    guiaIds:
      availableGuides.map(
        (item) =>
          item.id
      ),
    quantidadeAtendimentos:
      availableGuides.reduce(
        (sum, item) =>
          sum +
          item.quantidadeSessoes,
        0
      ),
    valorTotal:
      availableGuides.reduce(
        (sum, item) =>
          sum +
          item.valorTotal,
        0
      ),
    status:
      "Aberto",
    observacoes,
    createdAt:
      now,
    updatedAt:
      now,
  };

  saveLotesConvenios([
    lote,
    ...getLotesConvenios(),
  ]);

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (item) =>
        lote.guiaIds.includes(
          item.id
        )
          ? {
              ...item,
              loteId:
                lote.id,
              updatedAt:
                now,
            }
          : item
    )
  );

  return lote;
}

export function updateLoteConvenio(
  loteId: string,
  changes: Partial<
    Omit<
      LoteConvenio,
      "id" |
        "createdAt"
    >
  >
) {
  saveLotesConvenios(
    getLotesConvenios().map(
      (item) =>
        item.id ===
        loteId
          ? {
              ...item,
              ...changes,
              updatedAt:
                new Date().toISOString(),
            }
          : item
    )
  );
}

export function closeLoteConvenio(
  loteId: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    lote.status !==
    "Aberto"
  ) {
    throw new Error(
      "Somente lotes abertos podem ser fechados."
    );
  }

  updateLoteConvenio(
    loteId,
    {
      status:
        "Fechado",
      dataFechamento:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),
    }
  );
}

export function sendLoteConvenio(
  loteId: string,
  protocoloEnvio?: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    lote.status !==
    "Fechado"
  ) {
    throw new Error(
      "Feche o lote antes de enviá-lo."
    );
  }

  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  updateLoteConvenio(
    loteId,
    {
      status:
        "Enviado",
      dataEnvio:
        today,
      protocoloEnvio:
        protocoloEnvio?.trim() ||
        undefined,
    }
  );

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (item) =>
        lote.guiaIds.includes(
          item.id
        )
          ? {
              ...item,
              status:
                "Enviado" as GuiaConvenioStatus,
              dataEnvio:
                today,
              updatedAt:
                new Date().toISOString(),
            }
          : item
    )
  );
}

export function reopenLoteConvenio(
  loteId: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    return;
  }

  if (
    lote.status !==
      "Aberto" &&
    lote.status !==
      "Fechado"
  ) {
    throw new Error(
      "Lotes enviados não podem ser reabertos."
    );
  }

  const now =
    new Date().toISOString();

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (item) =>
        lote.guiaIds.includes(
          item.id
        )
          ? {
              ...item,
              loteId:
                undefined,
              updatedAt:
                now,
            }
          : item
    )
  );

  saveLotesConvenios(
    getLotesConvenios().filter(
      (item) =>
        item.id !==
        loteId
    )
  );
}

export function getGuiasByLote(
  loteId: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    return [];
  }

  return getGuiasConvenios().filter(
    (item) =>
      lote.guiaIds.includes(
        item.id
      )
  );
}


export interface LoteConvenioReturnItem {
  guiaId: string;
  valorAprovado: number;
  valorGlosado: number;
  motivoGlosa?: string;
}

export function registerLoteConvenioReturn({
  loteId,
  items,
}: {
  loteId: string;
  items: LoteConvenioReturnItem[];
}) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    ![
      "Enviado",
      "Em análise",
    ].includes(
      lote.status
    )
  ) {
    throw new Error(
      "O retorno só pode ser registrado em lotes enviados ou em análise."
    );
  }

  const guiasDoLote =
    getGuiasByLote(
      loteId
    );

  if (
    guiasDoLote.length ===
    0
  ) {
    throw new Error(
      "O lote não possui atendimentos."
    );
  }

  const itemMap =
    new Map(
      items.map(
        (
          item
        ) => [
          item.guiaId,
          item,
        ]
      )
    );

  const now =
    new Date().toISOString();

  let totalAprovado =
    0;

  let totalGlosado =
    0;

  let quantidadeGlosada =
    0;

  const nextGuides =
    getGuiasConvenios().map(
      (
        guia
      ) => {
        if (
          !lote.guiaIds.includes(
            guia.id
          )
        ) {
          return guia;
        }

        const returned =
          itemMap.get(
            guia.id
          );

        if (
          !returned
        ) {
          return guia;
        }

        const aprovado =
          Math.max(
            Math.min(
              Number(
                returned.valorAprovado
              ) ||
                0,
              guia.valorTotal
            ),
            0
          );

        const glosado =
          Math.max(
            Math.min(
              Number(
                returned.valorGlosado
              ) ||
                (
                  guia.valorTotal -
                  aprovado
                ),
              guia.valorTotal
            ),
            0
          );

        totalAprovado +=
          aprovado;

        totalGlosado +=
          glosado;

        if (
          glosado >
          0
        ) {
          quantidadeGlosada +=
            guia.quantidadeSessoes;
        }

        const nextStatus:
          GuiaConvenioStatus =
          glosado >
          0
            ? "Glosado"
            : "Aprovado";

        return {
          ...guia,

          valorAprovado:
            aprovado,

          valorGlosado:
            glosado,

          motivoGlosa:
            glosado >
            0
              ? returned.motivoGlosa?.trim() ||
                "Glosa informada pelo convênio"
              : undefined,

          status:
            nextStatus,

          updatedAt:
            now,
        };
      }
    );

  saveGuiasConvenios(
    nextGuides
  );

  const hasGlosa =
    totalGlosado >
    0;

  const hasApproval =
    totalAprovado >
    0;

  const nextStatus:
    LoteConvenioStatus =
    hasGlosa &&
    hasApproval
      ? "Parcialmente aprovado"
      : hasGlosa
        ? "Parcialmente aprovado"
        : "Aprovado";

  updateLoteConvenio(
    loteId,
    {
      status:
        nextStatus,

      valorAprovado:
        totalAprovado,

      valorGlosado:
        totalGlosado,

      quantidadeGlosada,
    }
  );
}

export function markLoteConvenioInAnalysis(
  loteId: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    lote.status !==
    "Enviado"
  ) {
    throw new Error(
      "Somente lotes enviados podem ser marcados como em análise."
    );
  }

  updateLoteConvenio(
    loteId,
    {
      status:
        "Em análise",
    }
  );
}

export function resetLoteConvenioReturn(
  loteId: string
) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    lote.status ===
    "Pago"
  ) {
    throw new Error(
      "Um lote pago não pode ter o retorno redefinido."
    );
  }

  const now =
    new Date().toISOString();

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (
        guia
      ) =>
        lote.guiaIds.includes(
          guia.id
        )
          ? {
              ...guia,
              valorAprovado:
                undefined,
              valorGlosado:
                undefined,
              motivoGlosa:
                undefined,
              status:
                "Enviado" as GuiaConvenioStatus,
              updatedAt:
                now,
            }
          : guia
    )
  );

  updateLoteConvenio(
    loteId,
    {
      status:
        "Enviado",
      valorAprovado:
        undefined,
      valorGlosado:
        undefined,
      quantidadeGlosada:
        undefined,
    }
  );
}


export function registerLoteConvenioRepasse({
  loteId,
  repasse,
}: {
  loteId: string;
  repasse: ConvenioRepasse;
}) {
  const lote =
    getLoteConvenioById(
      loteId
    );

  if (!lote) {
    throw new Error(
      "Lote não encontrado."
    );
  }

  if (
    ![
      "Aprovado",
      "Parcialmente aprovado",
      "Parcialmente pago",
    ].includes(
      lote.status
    )
  ) {
    throw new Error(
      "O repasse só pode ser registrado após o retorno do convênio."
    );
  }

  const approved =
    Math.max(
      lote.valorAprovado ??
        0,
      0
    );

  if (
    approved <=
    0
  ) {
    throw new Error(
      "O lote não possui valor aprovado para recebimento."
    );
  }

  const currentRepasses =
    lote.repasses ??
    [];

  if (
    currentRepasses.some(
      (
        item
      ) =>
        item.id ===
        repasse.id ||
        item.bankTransactionId ===
        repasse.bankTransactionId
    )
  ) {
    return lote;
  }

  const previousReceived =
    currentRepasses.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.amount,
      0
    );

  const nextReceived =
    previousReceived +
    repasse.amount;

  if (
    nextReceived >
    approved +
      0.01
  ) {
    throw new Error(
      "O total recebido não pode ser maior que o valor aprovado pelo convênio."
    );
  }

  const balance =
    Math.max(
      approved -
        nextReceived,
      0
    );

  const fullyPaid =
    balance <=
    0.01;

  updateLoteConvenio(
    loteId,
    {
      repasses: [
        ...currentRepasses,
        repasse,
      ],

      valorRecebido:
        nextReceived,

      saldoAReceber:
        balance,

      status:
        fullyPaid
          ? "Pago"
          : "Parcialmente pago",
    }
  );

  if (
    fullyPaid
  ) {
    const now =
      new Date().toISOString();

    saveGuiasConvenios(
      getGuiasConvenios().map(
        (
          guia
        ) => {
          if (
            !lote.guiaIds.includes(
              guia.id
            )
          ) {
            return guia;
          }

          /*
           * Guias totalmente aprovadas viram Pago.
           * Guias com glosa permanecem Glosado para
           * que a perda/recurso continue rastreável.
           */
          if (
            (
              guia.valorGlosado ??
              0
            ) >
            0
          ) {
            return guia;
          }

          return {
            ...guia,
            status:
              "Pago" as GuiaConvenioStatus,
            dataPagamento:
              repasse.date,
            updatedAt:
              now,
          };
        }
      )
    );
  }

  return getLoteConvenioById(
    loteId
  );
}


export function getRecursosGlosa(): RecursoGlosa[] {
  try {
    const raw =
      localStorage.getItem(
        RECURSOS_GLOSA_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      ) as RecursoGlosa[];

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveRecursosGlosa(
  items: RecursoGlosa[]
) {
  localStorage.setItem(
    RECURSOS_GLOSA_STORAGE_KEY,
    JSON.stringify(items)
  );

  notifyRecursosGlosa();
}

export function getRecursoGlosaById(
  recursoId: string
) {
  return getRecursosGlosa().find(
    (item) =>
      item.id ===
      recursoId
  );
}

export function getRecursoGlosaByGuia(
  guiaId: string
) {
  return getRecursosGlosa().find(
    (item) =>
      item.guiaId ===
      guiaId
  );
}

export function createRecursoGlosa({
  guiaId,
  valorRecorrido,
  justificativaRecurso,
  protocolo,
  dataEnvio,
}: {
  guiaId: string;
  valorRecorrido: number;
  justificativaRecurso: string;
  protocolo?: string;
  dataEnvio: string;
}) {
  const guia =
    getGuiasConvenios().find(
      (item) =>
        item.id ===
        guiaId
    );

  if (!guia) {
    throw new Error(
      "Atendimento glosado não encontrado."
    );
  }

  if (
    guia.status !==
    "Glosado"
  ) {
    throw new Error(
      "Somente atendimentos glosados podem receber recurso."
    );
  }

  const valorGlosado =
    Math.max(
      guia.valorGlosado ??
        0,
      0
    );

  if (
    valorGlosado <=
    0
  ) {
    throw new Error(
      "Este atendimento não possui valor glosado."
    );
  }

  const recorrida =
    Math.max(
      Number(
        valorRecorrido
      ) ||
        0,
      0
    );

  if (
    recorrida <=
    0 ||
    recorrida >
      valorGlosado +
        0.01
  ) {
    throw new Error(
      "O valor recorrido deve ser maior que zero e não pode ultrapassar o valor glosado."
    );
  }

  if (
    !justificativaRecurso.trim()
  ) {
    throw new Error(
      "Informe a justificativa do recurso."
    );
  }

  if (
    guia.recursoGlosaId ||
    getRecursoGlosaByGuia(
      guiaId
    )
  ) {
    throw new Error(
      "Já existe um recurso registrado para este atendimento."
    );
  }

  const now =
    new Date().toISOString();

  const recurso: RecursoGlosa = {
    id:
      crypto.randomUUID?.() ??
      `${Date.now()}`,

    guiaId:
      guia.id,

    loteId:
      guia.loteId ??
      "",

    unitId:
      guia.unitId,

    convenio:
      guia.convenio,

    valorGlosadoOriginal:
      valorGlosado,

    valorRecorrido:
      recorrida,

    motivoGlosa:
      guia.motivoGlosa ??
      "Glosa informada pelo convênio",

    justificativaRecurso:
      justificativaRecurso.trim(),

    protocolo:
      protocolo?.trim() ||
      undefined,

    dataEnvio,

    status:
      "Em recurso",

    createdAt:
      now,

    updatedAt:
      now,
  };

  saveRecursosGlosa([
    recurso,
    ...getRecursosGlosa(),
  ]);

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (item) =>
        item.id ===
        guia.id
          ? {
              ...item,
              recursoGlosaId:
                recurso.id,
              status:
                "Em recurso" as GuiaConvenioStatus,
              updatedAt:
                now,
            }
          : item
    )
  );

  return recurso;
}

export function registerRecursoGlosaReturn({
  recursoId,
  approved,
  valorRecuperado,
  dataRetorno,
  observacaoRetorno,
}: {
  recursoId: string;
  approved: boolean;
  valorRecuperado: number;
  dataRetorno: string;
  observacaoRetorno?: string;
}) {
  const recurso =
    getRecursoGlosaById(
      recursoId
    );

  if (!recurso) {
    throw new Error(
      "Recurso não encontrado."
    );
  }

  if (
    recurso.status !==
    "Em recurso"
  ) {
    throw new Error(
      "Este recurso já possui retorno registrado."
    );
  }

  const recovered =
    approved
      ? Math.max(
          Math.min(
            Number(
              valorRecuperado
            ) ||
              0,
            recurso.valorRecorrido
          ),
          0
        )
      : 0;

  if (
    approved &&
    recovered <=
      0
  ) {
    throw new Error(
      "Informe o valor recuperado pelo recurso."
    );
  }

  const now =
    new Date().toISOString();

  saveRecursosGlosa(
    getRecursosGlosa().map(
      (item) =>
        item.id ===
        recurso.id
          ? {
              ...item,

              valorRecuperado:
                recovered,

              dataRetorno,

              status:
                approved
                  ? "Aprovado"
                  : "Negado",

              observacaoRetorno:
                observacaoRetorno?.trim() ||
                undefined,

              updatedAt:
                now,
            }
          : item
    )
  );

  saveGuiasConvenios(
    getGuiasConvenios().map(
      (guia) =>
        guia.id ===
        recurso.guiaId
          ? {
              ...guia,

              valorRecuperadoGlosa:
                recovered,

              status:
                approved
                  ? "Recurso aprovado" as GuiaConvenioStatus
                  : "Recurso negado" as GuiaConvenioStatus,

              updatedAt:
                now,
            }
          : guia
    )
  );

  const lote =
    getLoteConvenioById(
      recurso.loteId
    );

  if (
    lote &&
    approved &&
    recovered >
      0
  ) {
    const previousApproved =
      lote.valorAprovado ??
      0;

    const previousGlosa =
      lote.valorGlosado ??
      0;

    const nextApproved =
      previousApproved +
      recovered;

    const nextGlosa =
      Math.max(
        previousGlosa -
          recovered,
        0
      );

    const received =
      lote.valorRecebido ??
      0;

    updateLoteConvenio(
      lote.id,
      {
        valorAprovado:
          nextApproved,

        valorGlosado:
          nextGlosa,

        saldoAReceber:
          Math.max(
            nextApproved -
              received,
            0
          ),

        status:
          received >
          0
            ? "Parcialmente pago"
            : "Parcialmente aprovado",
      }
    );
  }

  return getRecursoGlosaById(
    recursoId
  );
}