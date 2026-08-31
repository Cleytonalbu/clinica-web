import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

export type ConvenioPlanoStatus = "Ativo" | "Inativo";

export interface ConvenioPlano {
  id: string;

  /* Unidade responsável por esta autorização/plano. */
  unitId: number;

  /**
   * convenioId é a referência canônica do convênio.
   * convenio permanece como snapshot do nome.
   */
  convenioId?: number;
  convenio: string;

  plano: string;

  /**
   * patientId é a referência principal.
   * paciente é mantido para exibição e compatibilidade com
   * registros antigos do protótipo.
   */
  patientId?: number;
  paciente: string;

  valorSessao: number;
  sessoesAutorizadas: number;
  sessoesUtilizadas: number;
  autorizacao: string;
  inicioAutorizacao: string;
  validadeAutorizacao: string;
  status: ConvenioPlanoStatus;
  observacoes: string;

  /**
   * IDs dos agendamentos que já consumiram sessão desta
   * autorização. Garante que o mesmo atendimento não seja
   * descontado duas vezes.
   */
  consumedAppointmentIds?: number[];

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

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed = false;

    const normalized =
      parsed.map((item) => {
        const unitId =
          Number(item?.unitId);

        if (
          Number.isFinite(unitId) &&
          unitId > 0
        ) {
          const consumedAppointmentIds =
            Array.isArray(
              item?.consumedAppointmentIds
            )
              ? item.consumedAppointmentIds
                  .map(Number)
                  .filter(
                    (
                      id
                    ) =>
                      Number.isFinite(
                        id
                      )
                  )
              : [];

          if (
            !Array.isArray(
              item?.consumedAppointmentIds
            )
          ) {
            changed =
              true;
          }

          return {
            ...item,
            unitId,
            consumedAppointmentIds,
          } as ConvenioPlano;
        }

        changed = true;

        return {
          ...item,
          unitId:
            defaultUnitId,
          consumedAppointmentIds:
            Array.isArray(
              item?.consumedAppointmentIds
            )
              ? item.consumedAppointmentIds
                  .map(Number)
                  .filter(
                    (
                      id
                    ) =>
                      Number.isFinite(
                        id
                      )
                  )
              : [],
        } as ConvenioPlano;
      });

    if (changed) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );
    }

    return normalized;
  } catch {
    return [];
  }
}

export function saveConveniosPlanos(items: ConvenioPlano[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
}

export function createConvenioPlano(
  data: Omit<
    ConvenioPlano,
    "id" | "createdAt" | "updatedAt" | "unitId"
  > & {
    unitId?: number;
  }
) {
  const now = new Date().toISOString();
  const item: ConvenioPlano = {
    ...data,

    unitId:
      Number.isFinite(
        Number(
          data.unitId
        )
      ) &&
      Number(
        data.unitId
      ) > 0
        ? Number(
            data.unitId
          )
        : getDefaultClinicUnitId(),

    consumedAppointmentIds:
      Array.isArray(
        data.consumedAppointmentIds
      )
        ? data.consumedAppointmentIds
        : [],

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

export function registrarSessao(
  id: string
) {
  const item =
    getConveniosPlanos()
      .find(
        (
          authorization
        ) =>
          authorization.id ===
          id
      );

  if (
    !item
  ) {
    throw new Error(
      "Autorização não encontrada."
    );
  }

  if (
    item.status !==
    "Ativo"
  ) {
    throw new Error(
      "Autorização inativa."
    );
  }

  if (
    item.sessoesUtilizadas >=
    item.sessoesAutorizadas
  ) {
    throw new Error(
      "Todas as sessões autorizadas já foram utilizadas."
    );
  }

  updateConvenioPlano(
    id,
    {
      sessoesUtilizadas:
        item.sessoesUtilizadas +
        1,
    }
  );
}

export interface ConsumeAuthorizationSessionParams {
  appointmentId:
    number;

  unitId:
    number;

  patientId:
    number;

  patientName:
    string;

  convenioId?:
    number;

  convenio:
    string;

  appointmentDate:
    string;
}

export interface ConsumeAuthorizationSessionResult {
  consumed:
    boolean;

  alreadyConsumed:
    boolean;

  authorization:
    ConvenioPlano;

  remainingSessions:
    number;
}

/**
 * Encontra a autorização correta do paciente e consome uma
 * sessão de maneira idempotente.
 *
 * Critérios:
 * - mesma unidade;
 * - mesmo convênio;
 * - mesmo paciente (patientId, com fallback pelo nome para
 *   registros antigos);
 * - autorização ativa;
 * - atendimento dentro do período autorizado, quando houver
 *   datas configuradas;
 * - sessão disponível.
 */
export function consumeConvenioAuthorizationSessionForAppointment({
  appointmentId,
  unitId,
  patientId,
  patientName,
  convenioId,
  convenio,
  appointmentDate,
}: ConsumeAuthorizationSessionParams):
  ConsumeAuthorizationSessionResult {
  const all =
    getConveniosPlanos();

  const alreadyConsumedAuthorization =
    all.find(
      (
        authorization
      ) =>
        authorization.unitId ===
          unitId &&
        (
          authorization.consumedAppointmentIds ??
          []
        ).includes(
          appointmentId
        )
    );

  if (
    alreadyConsumedAuthorization
  ) {
    return {
      consumed:
        false,

      alreadyConsumed:
        true,

      authorization:
        alreadyConsumedAuthorization,

      remainingSessions:
        Math.max(
          alreadyConsumedAuthorization.sessoesAutorizadas -
            alreadyConsumedAuthorization.sessoesUtilizadas,
          0
        ),
    };
  }

  const normalizedPatientName =
    patientName
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  const normalizedConvenio =
    convenio
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  const candidates =
    all
      .filter(
        (
          authorization
        ) => {
          if (
            authorization.unitId !==
            unitId ||
          authorization.status !==
            "Ativo"
          ) {
            return false;
          }

          const sameConvenio =
            convenioId !==
              undefined &&
            authorization.convenioId !==
              undefined
              ? authorization.convenioId ===
                convenioId
              : authorization.convenio
                  .trim()
                  .toLocaleLowerCase(
                    "pt-BR"
                  ) ===
                normalizedConvenio;

          if (
            !sameConvenio
          ) {
            return false;
          }

          const samePatient =
            authorization.patientId !==
            undefined
              ? authorization.patientId ===
                patientId
              : authorization.paciente
                  .trim()
                  .toLocaleLowerCase(
                    "pt-BR"
                  ) ===
                normalizedPatientName;

          if (
            !samePatient
          ) {
            return false;
          }

          if (
            authorization.inicioAutorizacao &&
            appointmentDate <
              authorization.inicioAutorizacao
          ) {
            return false;
          }

          if (
            authorization.validadeAutorizacao &&
            appointmentDate >
              authorization.validadeAutorizacao
          ) {
            return false;
          }

          return (
            authorization.sessoesUtilizadas <
            authorization.sessoesAutorizadas
          );
        }
      )
      .sort(
        (
          a,
          b
        ) => {
          /*
           * Quando houver mais de uma autorização válida,
           * prioriza a que vence primeiro.
           */
          const validityA =
            a.validadeAutorizacao ||
            "9999-12-31";

          const validityB =
            b.validadeAutorizacao ||
            "9999-12-31";

          return validityA.localeCompare(
            validityB
          );
        }
      );

  const authorization =
    candidates[0];

  if (
    !authorization
  ) {
    throw new Error(
      "Não existe autorização ativa com sessão disponível para este paciente, convênio, unidade e data."
    );
  }

  const consumedAppointmentIds = [
    ...(
      authorization.consumedAppointmentIds ??
      []
    ),
    appointmentId,
  ];

  const nextUsed =
    authorization.sessoesUtilizadas +
    1;

  updateConvenioPlano(
    authorization.id,
    {
      sessoesUtilizadas:
        nextUsed,

      consumedAppointmentIds,
    }
  );

  const updatedAuthorization:
    ConvenioPlano = {
    ...authorization,

    sessoesUtilizadas:
      nextUsed,

    consumedAppointmentIds,

    updatedAt:
      new Date()
        .toISOString(),
  };

  return {
    consumed:
      true,

    alreadyConsumed:
      false,

    authorization:
      updatedAuthorization,

    remainingSessions:
      Math.max(
        updatedAuthorization.sessoesAutorizadas -
          updatedAuthorization.sessoesUtilizadas,
        0
      ),
  };
}

/**
 * Usado pela Agenda para saber se há cobertura de convênio
 * antes de concluir o atendimento.
 */
export function findAvailableConvenioAuthorization({
  unitId,
  patientId,
  patientName,
  convenio,
  appointmentDate,
}: Omit<
  ConsumeAuthorizationSessionParams,
  "appointmentId"
>) {
  const normalizedPatientName =
    patientName
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  const normalizedConvenio =
    convenio
      .trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  return getConveniosPlanos()
    .filter(
      (
        authorization
      ) =>
        authorization.unitId ===
          unitId &&
        authorization.status ===
          "Ativo" &&
        authorization.convenio
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          ) ===
          normalizedConvenio &&
        (
          authorization.patientId !==
          undefined
            ? authorization.patientId ===
              patientId
            : authorization.paciente
                .trim()
                .toLocaleLowerCase(
                  "pt-BR"
                ) ===
              normalizedPatientName
        ) &&
        (
          !authorization.inicioAutorizacao ||
          appointmentDate >=
            authorization.inicioAutorizacao
        ) &&
        (
          !authorization.validadeAutorizacao ||
          appointmentDate <=
            authorization.validadeAutorizacao
        ) &&
        authorization.sessoesUtilizadas <
          authorization.sessoesAutorizadas
    )
    .sort(
      (
        a,
        b
      ) =>
        (
          a.validadeAutorizacao ||
          "9999-12-31"
        ).localeCompare(
          b.validadeAutorizacao ||
          "9999-12-31"
        )
    )[0];
}


/**
 * Devolve a sessão da autorização consumida por um atendimento.
 * É idempotente e só altera a autorização que contém o appointmentId.
 */
export function reverseConvenioAuthorizationSessionForAppointment(
  appointmentId: number
) {
  const all =
    getConveniosPlanos();

  const authorization =
    all.find(
      (item) =>
        (
          item.consumedAppointmentIds ??
          []
        ).includes(
          appointmentId
        )
    );

  if (!authorization) {
    return false;
  }

  updateConvenioPlano(
    authorization.id,
    {
      sessoesUtilizadas:
        Math.max(
          authorization.sessoesUtilizadas -
            1,
          0
        ),

      consumedAppointmentIds:
        (
          authorization.consumedAppointmentIds ??
          []
        ).filter(
          (id) =>
            id !==
            appointmentId
        ),
    }
  );

  return true;
}
