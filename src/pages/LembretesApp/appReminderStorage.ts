export type AppReminderTargetType =
  | "ALL_UNIT"
  | "PATIENT"
  | "RESPONSIBLE";

export type AppReminderDisplayMode =
  | "ONCE"
  | "UNTIL_ACKNOWLEDGED"
  | "ALWAYS_UNTIL_END";

export interface AppReminder {
  id: string;
  unitId: number;
  title: string;
  message?: string;
  imageDataUrl?: string;
  imageName?: string;
  targetType: AppReminderTargetType;
  patientId?: number;
  patientName?: string;
  responsibleId?: number;
  responsibleName?: string;
  startsAt: string;
  endsAt?: string;
  displayMode: AppReminderDisplayMode;
  active: boolean;
  createdByUserId: number;
  createdByName: string;
  createdByProfile: "Gestor" | "Recepção";
  createdAt: string;
  updatedAt: string;
}

export interface AppReminderRead {
  id: string;
  reminderId: string;
  responsibleId: number;
  viewedAt: string;
  acknowledgedAt?: string;
}

export interface CreateAppReminderData {
  unitId: number;
  title: string;
  message?: string;
  imageDataUrl?: string;
  imageName?: string;
  targetType: AppReminderTargetType;
  patientId?: number;
  patientName?: string;
  responsibleId?: number;
  responsibleName?: string;
  startsAt: string;
  endsAt?: string;
  displayMode: AppReminderDisplayMode;
  active?: boolean;
  createdByUserId: number;
  createdByName: string;
  createdByProfile: "Gestor" | "Recepção";
}

const REMINDERS_STORAGE_KEY =
  "entre-afetos-app-reminders";

const READS_STORAGE_KEY =
  "entre-afetos-app-reminder-reads";

export const APP_REMINDERS_CHANGED_EVENT =
  "entre-afetos:app-reminders-changed";

function notifyChanged() {
  window.dispatchEvent(
    new CustomEvent(
      APP_REMINDERS_CHANGED_EVENT
    )
  );
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function cleanText(value?: string | null) {
  const text = (value ?? "").trim();
  return text || undefined;
}

function normalizeDateTime(value: string) {
  const text = value.trim();
  if (!text) {
    return "";
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString();
}

function readReminders(): AppReminder[] {
  try {
    const raw = localStorage.getItem(
      REMINDERS_STORAGE_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        Number.isFinite(Number(item.unitId)) &&
        typeof item.title === "string" &&
        typeof item.startsAt === "string"
    ) as AppReminder[];
  } catch {
    return [];
  }
}

function persistReminders(
  reminders: AppReminder[]
) {
  localStorage.setItem(
    REMINDERS_STORAGE_KEY,
    JSON.stringify(reminders)
  );
  notifyChanged();
}

function readReads(): AppReminderRead[] {
  try {
    const raw = localStorage.getItem(
      READS_STORAGE_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as AppReminderRead[])
      : [];
  } catch {
    return [];
  }
}

function persistReads(
  reads: AppReminderRead[]
) {
  localStorage.setItem(
    READS_STORAGE_KEY,
    JSON.stringify(reads)
  );
  notifyChanged();
}

function validateReminder(
  data: CreateAppReminderData
) {
  if (
    !Number.isFinite(data.unitId) ||
    data.unitId <= 0
  ) {
    throw new Error(
      "Selecione uma unidade válida."
    );
  }

  if (!data.title.trim()) {
    throw new Error(
      "Informe o título do lembrete."
    );
  }

  const hasMessage = Boolean(
    data.message?.trim()
  );
  const hasImage = Boolean(
    data.imageDataUrl?.trim()
  );

  if (!hasMessage && !hasImage) {
    throw new Error(
      "Adicione um texto, uma imagem ou os dois."
    );
  }

  if (
    data.targetType === "PATIENT" &&
    !data.patientId
  ) {
    throw new Error(
      "Selecione o paciente destinatário."
    );
  }

  if (
    data.targetType === "RESPONSIBLE" &&
    !data.responsibleId
  ) {
    throw new Error(
      "Selecione o responsável destinatário."
    );
  }

  const startsAt = normalizeDateTime(
    data.startsAt
  );
  if (!startsAt) {
    throw new Error(
      "Informe a data e hora inicial."
    );
  }

  if (data.endsAt) {
    const endsAt = normalizeDateTime(
      data.endsAt
    );

    if (!endsAt) {
      throw new Error(
        "A data final informada é inválida."
      );
    }

    if (endsAt <= startsAt) {
      throw new Error(
        "A data final deve ser posterior à data inicial."
      );
    }
  }
}

export function getAppReminders():
  AppReminder[] {
  return readReminders().sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt)
  );
}

export function getAppRemindersByUnit(
  unitId: number
) {
  return getAppReminders().filter(
    (item) => item.unitId === unitId
  );
}

export function getAppReminderById(
  reminderId: string
) {
  return readReminders().find(
    (item) => item.id === reminderId
  );
}

export function createAppReminder(
  data: CreateAppReminderData
): AppReminder {
  validateReminder(data);

  const now = new Date().toISOString();
  const item: AppReminder = {
    id: generateId("app-reminder"),
    unitId: data.unitId,
    title: data.title.trim(),
    message: cleanText(data.message),
    imageDataUrl: cleanText(
      data.imageDataUrl
    ),
    imageName: cleanText(data.imageName),
    targetType: data.targetType,
    patientId:
      data.targetType === "PATIENT"
        ? data.patientId
        : undefined,
    patientName:
      data.targetType === "PATIENT"
        ? cleanText(data.patientName)
        : undefined,
    responsibleId:
      data.targetType === "RESPONSIBLE"
        ? data.responsibleId
        : undefined,
    responsibleName:
      data.targetType === "RESPONSIBLE"
        ? cleanText(data.responsibleName)
        : undefined,
    startsAt: normalizeDateTime(
      data.startsAt
    ),
    endsAt: data.endsAt
      ? normalizeDateTime(data.endsAt)
      : undefined,
    displayMode: data.displayMode,
    active: data.active ?? true,
    createdByUserId:
      data.createdByUserId,
    createdByName:
      data.createdByName.trim(),
    createdByProfile:
      data.createdByProfile,
    createdAt: now,
    updatedAt: now,
  };

  persistReminders([
    ...readReminders(),
    item,
  ]);

  return item;
}

export function updateAppReminder(
  reminderId: string,
  changes: Partial<
    Omit<
      AppReminder,
      | "id"
      | "createdAt"
      | "createdByUserId"
      | "createdByName"
      | "createdByProfile"
    >
  >
) {
  const current = readReminders();
  const existing = current.find(
    (item) => item.id === reminderId
  );

  if (!existing) {
    throw new Error(
      "Lembrete não encontrado."
    );
  }

  const merged: AppReminder = {
    ...existing,
    ...changes,
    updatedAt:
      new Date().toISOString(),
  };

  validateReminder({
    unitId: merged.unitId,
    title: merged.title,
    message: merged.message,
    imageDataUrl: merged.imageDataUrl,
    imageName: merged.imageName,
    targetType: merged.targetType,
    patientId: merged.patientId,
    patientName: merged.patientName,
    responsibleId: merged.responsibleId,
    responsibleName:
      merged.responsibleName,
    startsAt: merged.startsAt,
    endsAt: merged.endsAt,
    displayMode: merged.displayMode,
    active: merged.active,
    createdByUserId:
      existing.createdByUserId,
    createdByName:
      existing.createdByName,
    createdByProfile:
      existing.createdByProfile,
  });

  persistReminders(
    current.map((item) =>
      item.id === reminderId
        ? merged
        : item
    )
  );

  return merged;
}

export function setAppReminderActive(
  reminderId: string,
  active: boolean
) {
  return updateAppReminder(
    reminderId,
    { active }
  );
}

export function removeAppReminder(
  reminderId: string
) {
  persistReminders(
    readReminders().filter(
      (item) => item.id !== reminderId
    )
  );

  persistReads(
    readReads().filter(
      (item) =>
        item.reminderId !== reminderId
    )
  );
}

export function getAppReminderReads(
  reminderId?: string
) {
  const reads = readReads();
  return reminderId
    ? reads.filter(
        (item) =>
          item.reminderId === reminderId
      )
    : reads;
}

export function registerAppReminderViewed(
  reminderId: string,
  responsibleId: number
) {
  const current = readReads();
  const existing = current.find(
    (item) =>
      item.reminderId === reminderId &&
      item.responsibleId === responsibleId
  );

  if (existing) {
    return existing;
  }

  const item: AppReminderRead = {
    id: generateId("app-reminder-read"),
    reminderId,
    responsibleId,
    viewedAt: new Date().toISOString(),
  };

  persistReads([...current, item]);
  return item;
}

export function acknowledgeAppReminder(
  reminderId: string,
  responsibleId: number
) {
  const current = readReads();
  const existing = current.find(
    (item) =>
      item.reminderId === reminderId &&
      item.responsibleId === responsibleId
  );

  const now = new Date().toISOString();

  if (!existing) {
    const item: AppReminderRead = {
      id: generateId("app-reminder-read"),
      reminderId,
      responsibleId,
      viewedAt: now,
      acknowledgedAt: now,
    };

    persistReads([...current, item]);
    return item;
  }

  const updated: AppReminderRead = {
    ...existing,
    acknowledgedAt: now,
  };

  persistReads(
    current.map((item) =>
      item.id === existing.id
        ? updated
        : item
    )
  );

  return updated;
}

export function getAppReminderStatus(
  reminder: AppReminder,
  now = new Date()
): "Inativo" | "Agendado" | "Ativo" | "Encerrado" {
  if (!reminder.active) {
    return "Inativo";
  }

  const current = now.getTime();
  const starts = new Date(
    reminder.startsAt
  ).getTime();
  const ends = reminder.endsAt
    ? new Date(reminder.endsAt).getTime()
    : undefined;

  if (current < starts) {
    return "Agendado";
  }

  if (
    ends !== undefined &&
    current > ends
  ) {
    return "Encerrado";
  }

  return "Ativo";
}
