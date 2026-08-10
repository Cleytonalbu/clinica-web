import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  ChevronDown,
  Clock3,
  LogOut,
  Mail,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  userCanAccessModule,
} from "@/auth/permissions";

interface HeaderNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type:
    | "appointment"
    | "payment"
    | "patient"
    | "system";
}

const initialNotifications: HeaderNotification[] = [
  {
    id: 1,
    title: "Consulta cancelada",
    description:
      "Maria Oliveira cancelou a consulta das 14:00.",
    time: "há 5 min",
    read: false,
    type: "appointment",
  },

  {
    id: 2,
    title: "Novo paciente",
    description:
      "João Pedro foi cadastrado no sistema.",
    time: "há 18 min",
    read: false,
    type: "patient",
  },

  {
    id: 3,
    title: "Pagamento recebido",
    description:
      "O pagamento da consulta de Ana Souza foi confirmado.",
    time: "há 32 min",
    read: false,
    type: "payment",
  },

  {
    id: 4,
    title: "Agendamento confirmado",
    description:
      "Fernanda Souza confirmou o atendimento das 16:00.",
    time: "há 1 h",
    read: true,
    type: "appointment",
  },

  {
    id: 5,
    title: "Atualização do sistema",
    description:
      "As configurações gerais foram atualizadas.",
    time: "há 2 h",
    read: true,
    type: "system",
  },
];

export function Header() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<HeaderNotification[]>(
    initialNotifications
  );

  const userMenuRef =
    useRef<HTMLDivElement>(
      null
    );

  const notificationsRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(
    () => {
      function handleClickOutside(
        event:
          MouseEvent
      ) {
        const target =
          event.target as Node;

        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(
            target
          )
        ) {
          setUserMenuOpen(
            false
          );
        }

        if (
          notificationsRef.current &&
          !notificationsRef.current.contains(
            target
          )
        ) {
          setNotificationsOpen(
            false
          );
        }
      }

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
      };
    },
    []
  );

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (
            notification
          ) =>
            !notification.read
        ).length,
      [
        notifications,
      ]
    );

  function handleLogout() {
    logout();

    navigate(
      "/login",
      {
        replace:
          true,
      }
    );
  }

  function handleOpenNotifications() {
    setNotificationsOpen(
      (
        current
      ) =>
        !current
    );

    setUserMenuOpen(
      false
    );
  }

  function handleMarkAllAsRead() {
    setNotifications(
      (
        current
      ) =>
        current.map(
          (
            notification
          ) => ({
            ...notification,
            read:
              true,
          })
        )
    );
  }

  function handleMarkAsRead(
    id:
      number
  ) {
    setNotifications(
      (
        current
      ) =>
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
        )
    );
  }

  const firstName =
    user?.name
      ?.trim()
      .split(
        /\s+/
      )[0] ??
    "Usuário";

  const canAccessSettings =
    userCanAccessModule(
      user,
      "settings"
    );

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bom dia,{" "}
          {
            firstName
          }{" "}
          👋
        </h1>

        <p className="text-sm text-slate-500">
          Bem-vindo ao sistema Entre Afetos.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden h-11 w-80 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 2xl:flex">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Pesquisar..."
            className="ml-3 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          title="Mensagens"
          className="relative rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200"
        >
          <Mail
            size={20}
            className="text-slate-600"
          />
        </button>

        <div
          ref={
            notificationsRef
          }
          className="relative"
        >
          <button
            type="button"
            title="Notificações"
            onClick={
              handleOpenNotifications
            }
            className="relative rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200"
          >
            <Bell
              size={20}
              className="text-slate-600"
            />

            {unreadCount >
              0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {
                  unreadCount
                }
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Notificações
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {unreadCount >
                    0
                      ? `${unreadCount} não lida${
                          unreadCount >
                          1
                            ? "s"
                            : ""
                        }`
                      : "Nenhuma notificação não lida"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationsOpen(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              {notifications.length >
              0 ? (
                <>
                  <div className="max-h-[430px] overflow-y-auto">
                    {notifications.map(
                      (
                        notification
                      ) => (
                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id
                            )
                          }
                          className={`flex w-full items-start gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                            notification.read
                              ? "bg-white"
                              : "bg-sky-50/40"
                          }`}
                        >
                          <div
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.read
                                ? "bg-slate-200"
                                : "bg-sky-500"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-bold text-slate-800">
                                {
                                  notification.title
                                }
                              </p>

                              {!notification.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {
                                notification.description
                              }
                            </p>

                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Clock3
                                size={12}
                              />

                              {
                                notification.time
                              }
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-100 p-3">
                    {unreadCount >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        <CheckCheck
                          size={16}
                        />

                        Marcar todas como lidas
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(
                          false
                        );

                        navigate(
                          "/notificacoes"
                        );
                      }}
                      className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Bell
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Nenhuma notificação
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Novos avisos aparecerão aqui.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          ref={
            userMenuRef
          }
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(
                (
                  current
                ) =>
                  !current
              );

              setNotificationsOpen(
                false
              );
            }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              {
                getInitials(
                  user?.name ??
                    "Usuário"
                )
              }
            </div>

            <div className="hidden text-left xl:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
                {
                  user?.name ??
                  "Usuário"
                }
              </p>

              <p className="text-xs text-slate-500">
                {
                  user?.profile ??
                  ""
                }
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`text-slate-500 transition-transform ${
                userMenuOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 p-4">
                <p className="truncate text-sm font-bold text-slate-900">
                  {
                    user?.name
                  }
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {
                    user?.email
                  }
                </p>

                <span className="mt-3 inline-flex rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  {
                    user?.profile
                  }
                </span>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <UserRound
                    size={17}
                  />

                  Meu perfil
                </button>

                {canAccessSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(
                        false
                      );

                      navigate(
                        "/configuracoes"
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Settings
                      size={17}
                    />

                    Configurações
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut
                    size={17}
                  />

                  Sair do sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(
  name:
    string
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(
        Boolean
      );

  if (
    parts.length ===
    0
  ) {
    return "US";
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[
      parts.length -
        1
    ][0]
  }`.toUpperCase();
}