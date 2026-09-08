export const MEETING_ROOMS_CHANGED_EVENT =
  "entre-afetos-meeting-rooms-changed";

const STORAGE_KEY =
  "entre-afetos-meeting-room-bookings";

export interface MeetingRoomBooking {
  id: number;
  unitId: number;
  roomName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  participants: string;
  notes: string;
  status: "Agendada" | "Cancelada";
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRoomBookingData {
  unitId: number;
  roomName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer?: string;
  participants?: string;
  notes?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function emitChanged() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      MEETING_ROOMS_CHANGED_EVENT
    )
  );
}

function saveBookings(
  bookings: MeetingRoomBooking[]
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookings)
  );

  emitChanged();
}

export function getMeetingRoomBookings() {
  if (!isBrowser()) {
    return [] as MeetingRoomBooking[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [] as MeetingRoomBooking[];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [] as MeetingRoomBooking[];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item === "object"
      )
      .map(
        (item) => ({
          id: Number(item.id),
          unitId: Number(item.unitId),
          roomName: cleanText(item.roomName) || "Sala de Reunião",
          title: cleanText(item.title),
          date: cleanText(item.date),
          startTime: cleanText(
            item.startTime
          ),
          endTime: cleanText(
            item.endTime
          ),
          organizer: cleanText(
            item.organizer
          ),
          participants: cleanText(
            item.participants
          ),
          notes: cleanText(item.notes),
          status:
            item.status === "Cancelada"
              ? "Cancelada"
              : "Agendada",
          createdAt: cleanText(
            item.createdAt
          ),
          updatedAt: cleanText(
            item.updatedAt
          ),
        })
      )
      .filter(
        (item) =>
          Number.isFinite(item.id) &&
          item.id > 0 &&
          Number.isFinite(item.unitId) &&
          item.unitId > 0 &&
          Boolean(item.title) &&
          Boolean(item.date) &&
          Boolean(item.startTime) &&
          Boolean(item.endTime)
      );
  } catch {
    return [] as MeetingRoomBooking[];
  }
}

export function getMeetingRoomBookingsByUnit(
  unitId: number,
  date?: string
) {
  return getMeetingRoomBookings()
    .filter(
      (booking) =>
        booking.unitId === unitId &&
        booking.status === "Agendada" &&
        (!date || booking.date === date)
    )
    .sort((a, b) => {
      const dateCompare =
        a.date.localeCompare(b.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return a.startTime.localeCompare(
        b.startTime
      );
    });
}

function periodsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA < endB && endA > startB;
}

export function hasMeetingRoomConflict(
  unitId: number,
  roomName: string,
  date: string,
  startTime: string,
  endTime: string,
  ignoreId?: number
) {
  return getMeetingRoomBookingsByUnit(
    unitId,
    date
  ).some(
    (booking) =>
      booking.id !== ignoreId &&
      booking.roomName === roomName &&
      periodsOverlap(
        startTime,
        endTime,
        booking.startTime,
        booking.endTime
      )
  );
}

export function createMeetingRoomBooking(
  data: CreateMeetingRoomBookingData
) {
  const unitId = Number(data.unitId);
  const roomName =
    cleanText(data.roomName) ||
    "Sala de Reunião";
  const title = cleanText(data.title);
  const date = cleanText(data.date);
  const startTime = cleanText(
    data.startTime
  );
  const endTime = cleanText(data.endTime);

  if (
    !Number.isFinite(unitId) ||
    unitId <= 0 ||
    !title ||
    !date ||
    !startTime ||
    !endTime
  ) {
    throw new Error(
      "Preencha assunto, data e horário da reunião."
    );
  }

  if (endTime <= startTime) {
    throw new Error(
      "O horário final precisa ser maior que o horário inicial."
    );
  }

  if (
    hasMeetingRoomConflict(
      unitId,
      roomName,
      date,
      startTime,
      endTime
    )
  ) {
    throw new Error(
      `${roomName} já está reservada neste intervalo.`
    );
  }

  const current =
    getMeetingRoomBookings();

  const nextId =
    current.reduce(
      (max, item) =>
        Math.max(max, item.id),
      0
    ) + 1;

  const now = new Date().toISOString();

  const booking: MeetingRoomBooking = {
    id: nextId,
    unitId,
    roomName,
    title,
    date,
    startTime,
    endTime,
    organizer: cleanText(
      data.organizer
    ),
    participants: cleanText(
      data.participants
    ),
    notes: cleanText(data.notes),
    status: "Agendada",
    createdAt: now,
    updatedAt: now,
  };

  saveBookings([...current, booking]);

  return booking;
}

export function cancelMeetingRoomBooking(
  bookingId: number
) {
  const current =
    getMeetingRoomBookings();

  let changed = false;

  const next = current.map(
    (booking) => {
      if (booking.id !== bookingId) {
        return booking;
      }

      changed = true;

      return {
        ...booking,
        status: "Cancelada" as const,
        updatedAt:
          new Date().toISOString(),
      };
    }
  );

  if (changed) {
    saveBookings(next);
  }

  return changed;
}
