import {
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

import {
  getProfessionalRepasseValue,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

export type ProfessionalPayoutStatus =
  | "Pendente"
  | "Pago";

export interface ProfessionalPayout {
  id: string;

  appointmentId: number;

  patientId: number;

  patient: string;

  professional: string;

  specialty: string;

  serviceDate: string;

  amount: number;

  status:
    ProfessionalPayoutStatus;

  createdAt: string;

  paidAt?: string;
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

    return parsed.filter(
      isValidPayout
    );
  } catch {
    return [];
  }
}

/* =========================================
   SINCRONIZAR COM ATENDIMENTOS REALIZADOS
========================================= */

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
        getProfessionalRepasseValue(
          appointment.professional,
          appointment.specialty
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

              patientId:
                appointment.patientId,

              patient:
                appointment.patient,

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

export function markProfessionalPayoutAsPaid(
  payoutId: string
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
   VOLTAR PARA PENDENTE
========================================= */

export function markProfessionalPayoutAsPending(
  payoutId: string
) {
  const current =
    getProfessionalPayouts();

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

    appointmentId:
      appointment.id,

    patientId:
      appointment.patientId,

    patient:
      appointment.patient,

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