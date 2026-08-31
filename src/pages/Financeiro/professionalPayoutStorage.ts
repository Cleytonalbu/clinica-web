import {
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

import {
  getSystemSettings,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getUnitProfessionalValue,
  getUnitSpecialtyValue,
} from "@/pages/Configuracoes/unitServiceValueStorage";

import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

/* =========================================
   TIPOS
========================================= */

export type ProfessionalPayoutStatus =
  | "Pendente"
  | "Pago";

export interface ProfessionalPayout {
  id: string;

  unitId: number;

  appointmentId: number;

  patientId: number;

  patient: string;

  professionalId?: number;
  professional: string;

  specialty: string;

  serviceDate: string;

  amount: number;

  status:
    ProfessionalPayoutStatus;

  createdAt: string;

  paidAt?: string;

  paymentDate?: string;
  paymentMethod?: string;

  bankAccountId?: string;
  bankAccountName?: string;

  financialExpenseId?: number;
  bankTransactionId?: string;
}

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-professional-payouts";

/* =========================================
   LISTAR
========================================= */

export function getProfessionalPayouts():
  ProfessionalPayout[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      !stored
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        stored
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    const appointments =
      getSavedAppointments();

    const appointmentUnitMap =
      new Map(
        appointments.map(
          (
            appointment
          ) => [
            appointment.id,
            appointment.unitId,
          ]
        )
      );

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed =
      false;

    const normalized =
      parsed
        .filter(
          isValidPayout
        )
        .map(
          (
            payout
          ) => {
            const savedUnitId =
              Number(
                payout.unitId
              );

            const unitId =
              Number.isFinite(
                savedUnitId
              ) &&
              savedUnitId >
                0
                ? savedUnitId
                : appointmentUnitMap.get(
                    payout.appointmentId
                  ) ??
                  defaultUnitId;

            if (
              payout.unitId !==
              unitId
            ) {
              changed =
                true;
            }

            return {
              ...payout,
              unitId,
            };
          }
        );

    if (
      changed
    ) {
      saveProfessionalPayouts(
        normalized
      );
    }

    return normalized;
  } catch {
    return [];
  }
}

/* =========================================
   SINCRONIZAR COM ATENDIMENTOS REALIZADOS
========================================= */

function normalizeText(
  value:
    string |
    undefined
) {
  return String(
    value ??
    ""
  )
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

/**
 * O valor do repasse agora respeita a hierarquia
 * utilizada nas Configurações:
 *
 * 1. Valor específico do profissional NA UNIDADE;
 * 2. Valor padrão da especialidade NA UNIDADE;
 * 3. Valor legado específico do profissional;
 * 4. Valor legado da especialidade;
 * 5. Zero quando realmente não há configuração.
 */
function getAppointmentRepasseValue(
  appointment:
    StoredAppointment
) {
  const settings =
    getSystemSettings();

  const professional =
    settings.professionals.find(
      (item) =>
        appointment.professionalId !==
          undefined
          ? item.id ===
            appointment.professionalId
          : normalizeText(
              item.name
            ) ===
            normalizeText(
              appointment.professional
            )
    );

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        normalizeText(
          item.name
        ) ===
        normalizeText(
          appointment.specialty
        )
    );

  if (
    professional
  ) {
    const unitProfessional =
      getUnitProfessionalValue(
        appointment.unitId,
        professional.id
      );

    if (
      unitProfessional?.repasseValue !==
        undefined &&
      Number.isFinite(
        Number(
          unitProfessional.repasseValue
        )
      )
    ) {
      return Math.max(
        Number(
          unitProfessional.repasseValue
        ),
        0
      );
    }
  }

  if (
    specialty
  ) {
    const unitSpecialty =
      getUnitSpecialtyValue(
        appointment.unitId,
        specialty.id
      );

    if (
      Number.isFinite(
        Number(
          unitSpecialty.repasseValue
        )
      ) &&
      Number(
        unitSpecialty.repasseValue
      ) >
        0
    ) {
      return Math.max(
        Number(
          unitSpecialty.repasseValue
        ),
        0
      );
    }
  }

  /*
   * Compatibilidade com cadastros anteriores
   * à configuração financeira por unidade.
   */
  if (
    professional?.customRepasseValue !==
      undefined &&
    Number.isFinite(
      Number(
        professional.customRepasseValue
      )
    )
  ) {
    return Math.max(
      Number(
        professional.customRepasseValue
      ),
      0
    );
  }

  if (
    specialty?.repasseValue !==
      undefined &&
    Number.isFinite(
      Number(
        specialty.repasseValue
      )
    )
  ) {
    return Math.max(
      Number(
        specialty.repasseValue
      ),
      0
    );
  }

  return 0;
}

export function syncProfessionalPayoutsFromAppointments() {
  const current =
    getProfessionalPayouts();

  const realizedAppointments =
    getSavedAppointments().filter(
      (
        appointment
      ) =>
        appointment.status ===
        "Realizado"
    );

  const realizedIds =
    new Set(
      realizedAppointments.map(
        (
          appointment
        ) =>
          appointment.id
      )
    );

  /*
   * Mantemos apenas lançamentos cujo atendimento
   * continua realizado. Se um atendimento for
   * corrigido para Faltou/Cancelado, o repasse
   * pendente desaparece automaticamente.
   *
   * Um repasse já PAGO é preservado para não
   * apagar histórico financeiro realizado.
   */
  const retained =
    current.filter(
      (
        payout
      ) =>
        payout.status ===
          "Pago" ||
        realizedIds.has(
          payout.appointmentId
        )
    );

  const byAppointment =
    new Map(
      retained.map(
        (
          payout
        ) => [
          payout.appointmentId,
          payout,
        ]
      )
    );

  realizedAppointments.forEach(
    (
      appointment
    ) => {
      const amount =
        getAppointmentRepasseValue(
          appointment
        );

      const existing =
        byAppointment.get(
          appointment.id
        );

      if (
        existing
      ) {
        /*
         * Enquanto pendente, acompanha alterações
         * de configuração do repasse.
         * Depois de pago, congela o valor histórico.
         */
        if (
          existing.status ===
          "Pendente"
        ) {
          byAppointment.set(
            appointment.id,
            {
              ...existing,

              unitId:
                appointment.unitId,

              patientId:
                appointment.patientId,

              patient:
                appointment.patient,

              professionalId:
                appointment.professionalId,

              professional:
                appointment.professional,

              specialty:
                appointment.specialty,

              serviceDate:
                appointment.date,

              amount:
                amount,
            }
          );
        }

        return;
      }

      const createdAt =
        new Date()
          .toISOString();

      byAppointment.set(
        appointment.id,
        createPayoutFromAppointment(
          appointment,
          amount,
          createdAt
        )
      );
    }
  );

  const next =
    Array.from(
      byAppointment.values()
    ).sort(
      (
        a,
        b
      ) =>
        getDateTimestamp(
          b.serviceDate
        ) -
        getDateTimestamp(
          a.serviceDate
        )
    );

  saveProfessionalPayouts(
    next
  );

  return next;
}

/* =========================================
   POR PROFISSIONAL
========================================= */

export function getPayoutsByProfessional(
  professionalName: string
) {
  const name =
    professionalName.trim();

  if (
    !name
  ) {
    return [];
  }

  return syncProfessionalPayoutsFromAppointments().filter(
    (
      payout
    ) =>
      payout.professional ===
      name
  );
}

export function getPayoutsByProfessionalId(
  professionalId: number
) {
  if (
    !Number.isFinite(
      professionalId
    ) ||
    professionalId <=
      0
  ) {
    return [];
  }

  return syncProfessionalPayoutsFromAppointments().filter(
    (
      payout
    ) =>
      payout.professionalId ===
      professionalId
  );
}

export function getPayoutsByProfessionalReference({
  professionalId,
  professionalName,
}: {
  professionalId?: number;
  professionalName: string;
}) {
  if (
    professionalId !==
    undefined
  ) {
    const byId =
      getPayoutsByProfessionalId(
        professionalId
      );

    if (
      byId.length >
      0
    ) {
      return byId;
    }
  }

  return getPayoutsByProfessional(
    professionalName
  );
}

/* =========================================
   RESUMO DO PROFISSIONAL
========================================= */

export function getProfessionalPayoutSummary(
  professionalName: string,
  referenceDate = new Date()
) {
  const payouts =
    getPayoutsByProfessional(
      professionalName
    );

  const month =
    referenceDate.getMonth();

  const year =
    referenceDate.getFullYear();

  const monthPayouts =
    payouts.filter(
      (
        payout
      ) => {
        const date =
          parseLocalDate(
            payout.serviceDate
          );

        return (
          date !== null &&
          date.getMonth() ===
            month &&
          date.getFullYear() ===
            year
        );
      }
    );

  const received =
    monthPayouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pago"
      )
      .reduce(
        (
          total,
          payout
        ) =>
          total +
          payout.amount,
        0
      );

  const pending =
    monthPayouts
      .filter(
        (
          payout
        ) =>
          payout.status ===
          "Pendente"
      )
      .reduce(
        (
          total,
          payout
        ) =>
          total +
          payout.amount,
        0
      );

  return {
    total:
      received +
      pending,

    received,

    pending,

    appointments:
      monthPayouts.length,

    payouts:
      monthPayouts,
  };
}

/* =========================================
   MARCAR COMO PAGO
   USO FUTURO PELO GESTOR/FINANCEIRO
========================================= */

export interface ProfessionalPayoutPaymentData {
  paymentDate: string;
  paymentMethod: string;

  bankAccountId: string;
  bankAccountName: string;

  financialExpenseId: number;
  bankTransactionId: string;
}

export function markProfessionalPayoutAsPaid(
  payoutId: string,
  paymentData?:
    ProfessionalPayoutPaymentData
) {
  const current =
    getProfessionalPayouts();

  const now =
    new Date()
      .toISOString();

  const next =
    current.map(
      (
        payout
      ) =>
        payout.id ===
        payoutId
          ? {
              ...payout,

              status:
                "Pago" as const,

              paidAt:
                now,

              paymentDate:
                paymentData?.paymentDate ??
                payout.paymentDate ??
                now.slice(
                  0,
                  10
                ),

              paymentMethod:
                paymentData?.paymentMethod ??
                payout.paymentMethod,

              bankAccountId:
                paymentData?.bankAccountId ??
                payout.bankAccountId,

              bankAccountName:
                paymentData?.bankAccountName ??
                payout.bankAccountName,

              financialExpenseId:
                paymentData?.financialExpenseId ??
                payout.financialExpenseId,

              bankTransactionId:
                paymentData?.bankTransactionId ??
                payout.bankTransactionId,
            }
          : payout
    );

  saveProfessionalPayouts(
    next
  );

  return next.find(
    (
      payout
    ) =>
      payout.id ===
      payoutId
  );
}

export function markProfessionalPayoutsAsPaid(
  payoutIds: string[],
  paymentData:
    ProfessionalPayoutPaymentData
) {
  const ids =
    new Set(
      payoutIds
    );

  const current =
    getProfessionalPayouts();

  const now =
    new Date()
      .toISOString();

  const next =
    current.map(
      (
        payout
      ) =>
        ids.has(
          payout.id
        )
          ? {
              ...payout,

              status:
                "Pago" as const,

              paidAt:
                now,

              paymentDate:
                paymentData.paymentDate,

              paymentMethod:
                paymentData.paymentMethod,

              bankAccountId:
                paymentData.bankAccountId,

              bankAccountName:
                paymentData.bankAccountName,

              financialExpenseId:
                paymentData.financialExpenseId,

              bankTransactionId:
                paymentData.bankTransactionId,
            }
          : payout
    );

  saveProfessionalPayouts(
    next
  );

  return next.filter(
    (
      payout
    ) =>
      ids.has(
        payout.id
      )
  );
}

/* =========================================
   VOLTAR PARA PENDENTE
========================================= */

export function markProfessionalPayoutAsPending(
  payoutId: string
) {
  const current =
    getProfessionalPayouts();

  const target =
    current.find(
      (
        payout
      ) =>
        payout.id ===
        payoutId
    );

  if (
    target?.financialExpenseId ||
    target?.bankTransactionId
  ) {
    throw new Error(
      "Este repasse possui pagamento financeiro e movimentação bancária vinculados. Ele não pode voltar para pendente por esta tela."
    );
  }

  const next =
    current.map(
      (
        payout
      ) =>
        payout.id ===
        payoutId
          ? {
              ...payout,

              status:
                "Pendente" as const,

              paidAt:
                undefined,

              paymentDate:
                undefined,

              paymentMethod:
                undefined,

              bankAccountId:
                undefined,

              bankAccountName:
                undefined,
            }
          : payout
    );

  saveProfessionalPayouts(
    next
  );

  return next.find(
    (
      payout
    ) =>
      payout.id ===
      payoutId
  );
}

/* =========================================
   CRIAR A PARTIR DO AGENDAMENTO
========================================= */

function createPayoutFromAppointment(
  appointment: StoredAppointment,
  amount: number,
  createdAt: string
): ProfessionalPayout {
  return {
    id:
      `repasse-${appointment.id}`,

    unitId:
      appointment.unitId,

    appointmentId:
      appointment.id,

    patientId:
      appointment.patientId,

    patient:
      appointment.patient,

    professionalId:
      appointment.professionalId,

    professional:
      appointment.professional,

    specialty:
      appointment.specialty,

    serviceDate:
      appointment.date,

    amount:
      Math.max(
        0,
        Number(
          amount
        ) || 0
      ),

    status:
      "Pendente",

    createdAt,
  };
}

/* =========================================
   SALVAR
========================================= */

function saveProfessionalPayouts(
  payouts: ProfessionalPayout[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      payouts
    )
  );
}

/* =========================================
   VALIDAR
========================================= */

function isValidPayout(
  value: unknown
): value is ProfessionalPayout {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const payout =
    value as Partial<ProfessionalPayout>;

  return (
    typeof payout.id ===
      "string" &&
    typeof payout.appointmentId ===
      "number" &&
    typeof payout.patientId ===
      "number" &&
    typeof payout.patient ===
      "string" &&
    typeof payout.professional ===
      "string" &&
    typeof payout.specialty ===
      "string" &&
    typeof payout.serviceDate ===
      "string" &&
    typeof payout.amount ===
      "number" &&
    (
      payout.status ===
        "Pendente" ||
      payout.status ===
        "Pago"
    )
  );
}

/* =========================================
   DATA LOCAL
========================================= */

function parseLocalDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    ).map(
      Number
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0
  );
}

function getDateTimestamp(
  value: string
) {
  return (
    parseLocalDate(
      value
    )?.getTime() ??
    0
  );
}