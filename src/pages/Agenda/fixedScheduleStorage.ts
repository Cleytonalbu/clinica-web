import {
  getDefaultClinicUnitId,
} from "@/pages/Configuracoes/clinicUnitStorage";

export type FixedScheduleWeekDay =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type FixedScheduleBillingType =
  | "Particular"
  | "Pacote"
  | "Convênio";

export interface FixedSchedule {
  id: string;

  unitId: number;

  patientId: number;
  patientName: string;

  professionalId: number;
  professionalName: string;

  specialty: string;

  /**
   * Procedimento exibido na agenda.
   * Ex.: Sessão convencional, Avaliação, Sessão plano.
   */
  procedure: string;

  roomId?: number;
  roomName: string;

  weekDay: FixedScheduleWeekDay;

  startTime: string;
  endTime: string;

  /**
   * Período em que o horário fixo é válido.
   * endDate vazio = recorrência sem data final definida.
   */
  startDate: string;
  endDate?: string;

  billingType?: FixedScheduleBillingType;
  convenioId?: number;
  convenioName?: string;
  patientPackageId?: number;
  patientPackageName?: string;

  active: boolean;

  observations?: string;

  createdAt: string;
  updatedAt: string;
}

export type FixedScheduleExceptionStatus =
  | "Confirmado"
  | "Cancelado pelo paciente"
  | "Cancelado pela clínica"
  | "Falta"
  | "Falta do profissional"
  | "Bloqueado"
  | "Remarcado";

export interface FixedScheduleException {
  id: string;

  fixedScheduleId: string;

  unitId: number;

  date: string;

  status:
    FixedScheduleExceptionStatus;

  reason?: string;

  /**
   * Quando a ocorrência foi remarcada, estes campos permitem
   * representar a exceção sem alterar o horário fixo original.
   */
  replacementDate?: string;
  replacementStartTime?: string;
  replacementEndTime?: string;
  replacementProfessionalId?: number;
  replacementProfessionalName?: string;
  replacementRoomId?: number;
  replacementRoomName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FixedScheduleOccurrence {
  fixedScheduleId: string;

  unitId: number;

  date: string;

  patientId: number;
  patientName: string;

  professionalId: number;
  professionalName: string;

  specialty: string;
  procedure: string;

  roomId?: number;
  roomName: string;

  startTime: string;
  endTime: string;

  billingType?: FixedScheduleBillingType;
  convenioId?: number;
  convenioName?: string;
  patientPackageId?: number;
  patientPackageName?: string;

  exception?: FixedScheduleException;
}

const FIXED_STORAGE_KEY =
  "entre-afetos-fixed-schedules";

const EXCEPTIONS_STORAGE_KEY =
  "entre-afetos-fixed-schedule-exceptions";

export const FIXED_SCHEDULES_CHANGED_EVENT =
  "entre-afetos:fixed-schedules-changed";

export const FIXED_SCHEDULE_EXCEPTIONS_CHANGED_EVENT =
  "entre-afetos:fixed-schedule-exceptions-changed";

function notifySchedules() {
  window.dispatchEvent(
    new CustomEvent(
      FIXED_SCHEDULES_CHANGED_EVENT
    )
  );
}

function notifyExceptions() {
  window.dispatchEvent(
    new CustomEvent(
      FIXED_SCHEDULE_EXCEPTIONS_CHANGED_EVENT
    )
  );
}

function normalizeTime(
  value:
    string
) {
  return value
    .trim()
    .slice(
      0,
      5
    );
}

function isValidTime(
  value:
    string
) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    value
  );
}

function normalizeDate(
  value:
    string
) {
  return value
    .trim()
    .slice(
      0,
      10
    );
}

function isValidDate(
  value:
    string
) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}

function generateId(
  prefix:
    string
) {
  return (
    crypto.randomUUID?.() ??
    `${prefix}-${Date.now()}-${Math.random()
      .toString(
        36
      )
      .slice(
        2
      )}`
  );
}

export function getFixedSchedules():
  FixedSchedule[] {
  try {
    const raw =
      localStorage.getItem(
        FIXED_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    const defaultUnitId =
      getDefaultClinicUnitId();

    return parsed
      .map(
        (
          item
        ) => ({
          ...item,

          unitId:
            Number.isFinite(
              Number(
                item?.unitId
              )
            ) &&
            Number(
              item?.unitId
            ) >
              0
              ? Number(
                  item.unitId
                )
              : defaultUnitId,

          patientId:
            Number(
              item.patientId
            ),

          professionalId:
            Number(
              item.professionalId
            ),

          weekDay:
            Number(
              item.weekDay
            ) as
              FixedScheduleWeekDay,

          startTime:
            normalizeTime(
              String(
                item.startTime ??
                ""
              )
            ),

          endTime:
            normalizeTime(
              String(
                item.endTime ??
                ""
              )
            ),

          active:
            item.active !==
            false,
        })
      )
      .filter(
        (
          item
        ) =>
          Number.isFinite(
            item.patientId
          ) &&
          Number.isFinite(
            item.professionalId
          ) &&
          item.weekDay >=
            0 &&
          item.weekDay <=
            6
      ) as FixedSchedule[];
  } catch {
    return [];
  }
}

function saveFixedSchedules(
  schedules:
    FixedSchedule[]
) {
  localStorage.setItem(
    FIXED_STORAGE_KEY,
    JSON.stringify(
      schedules
    )
  );

  notifySchedules();
}

export interface CreateFixedScheduleData {
  unitId: number;

  patientId: number;
  patientName: string;

  professionalId: number;
  professionalName: string;

  specialty: string;
  procedure: string;

  roomId?: number;
  roomName: string;

  weekDay: FixedScheduleWeekDay;

  startTime: string;
  endTime: string;

  startDate: string;
  endDate?: string;

  billingType?: FixedScheduleBillingType;
  convenioId?: number;
  convenioName?: string;
  patientPackageId?: number;
  patientPackageName?: string;

  observations?: string;
}

function validateFixedSchedule(
  data:
    CreateFixedScheduleData,

  ignoreId?:
    string
) {
  if (
    !Number.isFinite(
      data.unitId
    ) ||
    data.unitId <=
      0
  ) {
    throw new Error(
      "Unidade inválida."
    );
  }

  if (
    !Number.isFinite(
      data.patientId
    ) ||
    data.patientId <=
      0
  ) {
    throw new Error(
      "Paciente inválido."
    );
  }

  if (
    !Number.isFinite(
      data.professionalId
    ) ||
    data.professionalId <=
      0
  ) {
    throw new Error(
      "Profissional inválido."
    );
  }

  const startTime =
    normalizeTime(
      data.startTime
    );

  const endTime =
    normalizeTime(
      data.endTime
    );

  if (
    !isValidTime(
      startTime
    ) ||
    !isValidTime(
      endTime
    ) ||
    endTime <=
      startTime
  ) {
    throw new Error(
      "Informe um horário fixo válido."
    );
  }

  const startDate =
    normalizeDate(
      data.startDate
    );

  if (
    !isValidDate(
      startDate
    )
  ) {
    throw new Error(
      "Informe a data inicial do horário fixo."
    );
  }

  if (
    data.endDate &&
    (
      !isValidDate(
        normalizeDate(
          data.endDate
        )
      ) ||
      normalizeDate(
        data.endDate
      ) <
        startDate
    )
  ) {
    throw new Error(
      "A data final do horário fixo é inválida."
    );
  }

  const conflict =
    getFixedSchedules()
      .find(
        (
          item
        ) =>
          item.id !==
            ignoreId &&
          item.active &&
          item.unitId ===
            data.unitId &&
          item.weekDay ===
            data.weekDay &&
          (
            item.professionalId ===
              data.professionalId ||
            (
              data.roomName &&
              item.roomName ===
                data.roomName
            ) ||
            item.patientId ===
              data.patientId
          ) &&
          startTime <
            item.endTime &&
          endTime >
            item.startTime
      );

  if (
    conflict
  ) {
    if (
      conflict.professionalId ===
      data.professionalId
    ) {
      throw new Error(
        "O profissional já possui outro horário fixo neste período."
      );
    }

    if (
      data.roomName &&
      conflict.roomName ===
        data.roomName
    ) {
      throw new Error(
        "A sala já possui outro horário fixo neste período."
      );
    }

    throw new Error(
      "O paciente já possui outro horário fixo neste período."
    );
  }
}

export function createFixedSchedule(
  data:
    CreateFixedScheduleData
) {
  validateFixedSchedule(
    data
  );

  const now =
    new Date()
      .toISOString();

  const item:
    FixedSchedule = {
    ...data,

    id:
      generateId(
        "fixed"
      ),

    startTime:
      normalizeTime(
        data.startTime
      ),

    endTime:
      normalizeTime(
        data.endTime
      ),

    startDate:
      normalizeDate(
        data.startDate
      ),

    endDate:
      data.endDate
        ? normalizeDate(
            data.endDate
          )
        : undefined,

    active:
      true,

    createdAt:
      now,

    updatedAt:
      now,
  };

  saveFixedSchedules(
    [
      ...getFixedSchedules(),
      item,
    ]
  );

  return item;
}

export function updateFixedSchedule(
  fixedScheduleId:
    string,

  changes:
    Partial<
      CreateFixedScheduleData
    > & {
      active?:
        boolean;
    }
) {
  const current =
    getFixedSchedules();

  const existing =
    current.find(
      (
        item
      ) =>
        item.id ===
        fixedScheduleId
    );

  if (
    !existing
  ) {
    throw new Error(
      "Horário fixo não encontrado."
    );
  }

  const merged:
    CreateFixedScheduleData = {
    unitId:
      changes.unitId ??
      existing.unitId,

    patientId:
      changes.patientId ??
      existing.patientId,

    patientName:
      changes.patientName ??
      existing.patientName,

    professionalId:
      changes.professionalId ??
      existing.professionalId,

    professionalName:
      changes.professionalName ??
      existing.professionalName,

    specialty:
      changes.specialty ??
      existing.specialty,

    procedure:
      changes.procedure ??
      existing.procedure,

    roomId:
      changes.roomId ??
      existing.roomId,

    roomName:
      changes.roomName ??
      existing.roomName,

    weekDay:
      changes.weekDay ??
      existing.weekDay,

    startTime:
      changes.startTime ??
      existing.startTime,

    endTime:
      changes.endTime ??
      existing.endTime,

    startDate:
      changes.startDate ??
      existing.startDate,

    endDate:
      changes.endDate ??
      existing.endDate,

    billingType:
      changes.billingType ??
      existing.billingType,

    convenioId:
      changes.convenioId ??
      existing.convenioId,

    convenioName:
      changes.convenioName ??
      existing.convenioName,

    patientPackageId:
      changes.patientPackageId ??
      existing.patientPackageId,

    patientPackageName:
      changes.patientPackageName ??
      existing.patientPackageName,

    observations:
      changes.observations ??
      existing.observations,
  };

  validateFixedSchedule(
    merged,
    fixedScheduleId
  );

  const updated:
    FixedSchedule = {
    ...existing,
    ...changes,

    startTime:
      normalizeTime(
        merged.startTime
      ),

    endTime:
      normalizeTime(
        merged.endTime
      ),

    startDate:
      normalizeDate(
        merged.startDate
      ),

    endDate:
      merged.endDate
        ? normalizeDate(
            merged.endDate
          )
        : undefined,

    active:
      changes.active ??
      existing.active,

    updatedAt:
      new Date()
        .toISOString(),
  };

  saveFixedSchedules(
    current.map(
      (
        item
      ) =>
        item.id ===
          fixedScheduleId
          ? updated
          : item
    )
  );

  return updated;
}

export function removeFixedSchedule(
  fixedScheduleId:
    string
) {
  saveFixedSchedules(
    getFixedSchedules()
      .filter(
        (
          item
        ) =>
          item.id !==
          fixedScheduleId
      )
  );
}

export function getFixedSchedulesByUnit(
  unitId:
    number
) {
  return getFixedSchedules()
    .filter(
      (
        item
      ) =>
        item.unitId ===
          unitId &&
        item.active
    );
}

export function getFixedScheduleExceptions():
  FixedScheduleException[] {
  try {
    const raw =
      localStorage.getItem(
        EXCEPTIONS_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveExceptions(
  exceptions:
    FixedScheduleException[]
) {
  localStorage.setItem(
    EXCEPTIONS_STORAGE_KEY,
    JSON.stringify(
      exceptions
    )
  );

  notifyExceptions();
}

export function setFixedScheduleException(
  data:
    Omit<
      FixedScheduleException,
      | "id"
      | "createdAt"
      | "updatedAt"
    >
) {
  const current =
    getFixedScheduleExceptions();

  const existing =
    current.find(
      (
        item
      ) =>
        item.fixedScheduleId ===
          data.fixedScheduleId &&
        item.date ===
          data.date
    );

  const now =
    new Date()
      .toISOString();

  const item:
    FixedScheduleException = {
    ...data,

    id:
      existing?.id ??
      generateId(
        "fixed-exception"
      ),

    createdAt:
      existing?.createdAt ??
      now,

    updatedAt:
      now,
  };

  saveExceptions(
    existing
      ? current.map(
          (
            currentItem
          ) =>
            currentItem.id ===
              existing.id
              ? item
              : currentItem
        )
      : [
          ...current,
          item,
        ]
  );

  return item;
}

export function removeFixedScheduleException(
  fixedScheduleId:
    string,

  date:
    string
) {
  saveExceptions(
    getFixedScheduleExceptions()
      .filter(
        (
          item
        ) =>
          !(
            item.fixedScheduleId ===
              fixedScheduleId &&
            item.date ===
              date
          )
      )
  );
}

function parseLocalDate(
  value:
    string
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split(
        "-"
      )
      .map(
        Number
      );

  return new Date(
    year,
    month -
      1,
    day,
    12,
    0,
    0,
    0
  );
}

function formatLocalDate(
  date:
    Date
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() +
      1
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}

/**
 * Expande a recorrência somente em memória para o período solicitado.
 * Nenhum novo agendamento é gravado no localStorage.
 */
export function getFixedScheduleOccurrences(
  unitId:
    number,

  startDate:
    string,

  endDate:
    string
):
  FixedScheduleOccurrence[] {
  if (
    !isValidDate(
      startDate
    ) ||
    !isValidDate(
      endDate
    ) ||
    endDate <
      startDate
  ) {
    return [];
  }

  const schedules =
    getFixedSchedulesByUnit(
      unitId
    );

  const exceptions =
    getFixedScheduleExceptions();

  const first =
    parseLocalDate(
      startDate
    );

  const last =
    parseLocalDate(
      endDate
    );

  const result:
    FixedScheduleOccurrence[] = [];

  for (
    let cursor =
      new Date(
        first
      );
    cursor <=
      last;
    cursor.setDate(
      cursor.getDate() +
        1
    )
  ) {
    const date =
      formatLocalDate(
        cursor
      );

    schedules
      .filter(
        (
          schedule
        ) =>
          schedule.weekDay ===
            cursor.getDay() &&
          date >=
            schedule.startDate &&
          (
            !schedule.endDate ||
            date <=
              schedule.endDate
          )
      )
      .forEach(
        (
          schedule
        ) => {
          const exception =
            exceptions.find(
              (
                item
              ) =>
                item.fixedScheduleId ===
                  schedule.id &&
                item.date ===
                  date
            );

          result.push(
            {
              fixedScheduleId:
                schedule.id,

              unitId:
                schedule.unitId,

              date,

              patientId:
                schedule.patientId,

              patientName:
                schedule.patientName,

              professionalId:
                schedule.professionalId,

              professionalName:
                schedule.professionalName,

              specialty:
                schedule.specialty,

              procedure:
                schedule.procedure,

              roomId:
                schedule.roomId,

              roomName:
                schedule.roomName,

              startTime:
                schedule.startTime,

              endTime:
                schedule.endTime,

              billingType:
                schedule.billingType,

              convenioId:
                schedule.convenioId,

              convenioName:
                schedule.convenioName,

              patientPackageId:
                schedule.patientPackageId,

              patientPackageName:
                schedule.patientPackageName,

              exception,
            }
          );
        }
      );
  }

  return result.sort(
    (
      a,
      b
    ) =>
      `${a.date} ${a.startTime}`
        .localeCompare(
          `${b.date} ${b.startTime}`
        )
  );
}
