export type WebNotificationRecipientProfile =
  | "Gestor"
  | "Administrativo"
  | "Recepção"
  | "Profissional";

export interface WebNotification {
  id: number;

  recipientProfile:
    WebNotificationRecipientProfile;

  recipientName?:
    string;

  title:
    string;

  description:
    string;

  createdAt:
    string;

  read:
    boolean;

  route?:
    string;

  sourceType?:
    string;

  sourceReference?:
    string;
}

const STORAGE_KEY =
  "entre-afetos-web-notifications";

export const WEB_NOTIFICATIONS_CHANGED_EVENT =
  "entre-afetos:web-notifications-changed";

export function getWebNotifications():
  WebNotification[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function getWebNotificationsForUser(
  profile:
    WebNotificationRecipientProfile,

  name?:
    string
) {
  const normalizedName =
    name
      ?.trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  return getWebNotifications()
    .filter(
      (
        notification
      ) => {
        if (
          notification.recipientProfile !==
          profile
        ) {
          return false;
        }

        if (
          !notification.recipientName
        ) {
          return true;
        }

        return (
          notification.recipientName
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            ) ===
          normalizedName
        );
      }
    )
    .sort(
      (
        a,
        b
      ) =>
        b.createdAt.localeCompare(
          a.createdAt
        )
    );
}

export function createWebNotification(
  notification:
    Omit<
      WebNotification,
      "id" |
      "createdAt" |
      "read"
    >
) {
  const current =
    getWebNotifications();

  const created:
    WebNotification = {
      ...notification,

      id:
        Date.now() +
        Math.floor(
          Math.random() *
          1000
        ),

      createdAt:
        new Date()
          .toISOString(),

      read:
        false,
    };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      [
        ...current,
        created,
      ]
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      WEB_NOTIFICATIONS_CHANGED_EVENT
    )
  );

  return created;
}

export function markWebNotificationAsRead(
  id:
    number
) {
  const current =
    getWebNotifications();

  const next =
    current.map(
      (
        notification
      ) =>
        notification.id ===
          id
          ? {
              ...notification,
              read:
                true,
            }
          : notification
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      WEB_NOTIFICATIONS_CHANGED_EVENT
    )
  );
}

export function markAllWebNotificationsAsReadForUser(
  profile:
    WebNotificationRecipientProfile,

  name?:
    string
) {
  const current =
    getWebNotifications();

  const normalizedName =
    name
      ?.trim()
      .toLocaleLowerCase(
        "pt-BR"
      );

  const next =
    current.map(
      (
        notification
      ) => {
        const belongsToProfile =
          notification.recipientProfile ===
          profile;

        const belongsToName =
          !notification.recipientName ||
          notification.recipientName
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            ) ===
            normalizedName;

        return belongsToProfile &&
          belongsToName
          ? {
              ...notification,
              read:
                true,
            }
          : notification;
      }
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      WEB_NOTIFICATIONS_CHANGED_EVENT
    )
  );
}
