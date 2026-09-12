import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Building2,
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
  getUserProfiles,
  type UserProfile,
} from "@/auth/authStorage";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  userCan,
  userCanAccessModule,
} from "@/auth/permissions";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  getResponsibles,
  getResponsiblePatientIds,
} from "@/pages/Pacientes/responsiblePatientStorage";

import {
  getProfessionalTableData,
} from "@/components/profissionais/table/ProfessionalTable";

import {
  WEB_NOTIFICATIONS_CHANGED_EVENT,
  getWebNotificationsForUser,
  markAllWebNotificationsAsReadForUser,
  markWebNotificationAsRead,
  type WebNotification,
  type WebNotificationRecipientProfile,
} from "@/components/common/webNotificationStorage";

/* =========================================
   TIPOS
========================================= */

type GlobalSearchResult = {
  id: string;
  type: "patient" | "responsible" | "professional";
  title: string;
  subtitle: string;
  route: string;
};

interface HeaderNotification {
  id:
    number;

  title:
    string;

  description:
    string;

  time:
    string;

  read:
    boolean;

  type:
    | "appointment"
    | "payment"
    | "patient"
    | "system";

  route?:
    string;

  dynamic?:
    boolean;
}

/* =========================================
   NOTIFICAÇÕES
========================================= */

const initialNotifications:
  HeaderNotification[] = [
  {
    id:
      1,

    title:
      "Consulta cancelada",

    description:
      "Maria Oliveira cancelou a consulta das 14:00.",

    time:
      "há 5 min",

    read:
      false,

    type:
      "appointment",
  },

  {
    id:
      2,

    title:
      "Novo paciente",

    description:
      "João Pedro foi cadastrado no sistema.",

    time:
      "há 18 min",

    read:
      false,

    type:
      "patient",
  },

  {
    id:
      3,

    title:
      "Pagamento recebido",

    description:
      "O pagamento da consulta de Ana Souza foi confirmado.",

    time:
      "há 32 min",

    read:
      false,

    type:
      "payment",
  },

  {
    id:
      4,

    title:
      "Agendamento confirmado",

    description:
      "Fernanda Souza confirmou o atendimento das 16:00.",

    time:
      "há 1 h",

    read:
      true,

    type:
      "appointment",
  },

  {
    id:
      5,

    title:
      "Atualização do sistema",

    description:
      "As configurações gerais foram atualizadas.",

    time:
      "há 2 h",

    read:
      true,

    type:
      "system",
  },
];

/* =========================================
   COMPONENTE
========================================= */


function formatNotificationTime(
  value:
    string
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  const diffMs =
    Date.now() -
    date.getTime();

  const diffMinutes =
    Math.max(
      0,
      Math.floor(
        diffMs /
        60000
      )
    );

  if (
    diffMinutes <
    1
  ) {
    return "agora";
  }

  if (
    diffMinutes <
    60
  ) {
    return `há ${diffMinutes} min`;
  }

  const diffHours =
    Math.floor(
      diffMinutes /
      60
    );

  if (
    diffHours <
    24
  ) {
    return `há ${diffHours} h`;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
  );
}

export function Header() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
    switchProfile,
  } =
    useAuth();

  const {
    activeUnit,
    activeUnitId,
    availableUnits,
    hasMultipleUnits,
    isAllUnits,
    canViewAllUnits,
    setAllUnitsView,
    setActiveUnit,
  } =
    useUnit();

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] =
    useState(
      false
    );

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] =
    useState(
      false
    );

  const [
    searchValue,
    setSearchValue,
  ] =
    useState(
      ""
    );

  const [
    searchOpen,
    setSearchOpen,
  ] =
    useState(
      false
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      HeaderNotification[]
    >(
      initialNotifications
    );

  const [
    dynamicNotifications,
    setDynamicNotifications,
  ] =
    useState<
      WebNotification[]
    >(
      []
    );

  const userMenuRef =
    useRef<HTMLDivElement>(
      null
    );

  const notificationsRef =
    useRef<HTMLDivElement>(
      null
    );

  const searchRef =
    useRef<HTMLDivElement>(
      null
    );

  const searchInputRef =
    useRef<HTMLInputElement>(
      null
    );

  /* =======================================
     CLIQUE FORA
  ======================================= */

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

        if (
          searchRef.current &&
          !searchRef.current.contains(
            target
          )
        ) {
          setSearchOpen(
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

  useEffect(
    () => {
      function handleSearchShortcut(
        event: KeyboardEvent
      ) {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLocaleLowerCase(
            "pt-BR"
          ) === "k"
        ) {
          event.preventDefault();

          setSearchOpen(
            true
          );

          window.setTimeout(
            () =>
              searchInputRef.current?.focus(),
            0
          );
        }

        if (
          event.key ===
          "Escape"
        ) {
          setSearchOpen(
            false
          );
        }
      }

      window.addEventListener(
        "keydown",
        handleSearchShortcut
      );

      return () =>
        window.removeEventListener(
          "keydown",
          handleSearchShortcut
        );
    },
    []
  );

  const notificationProfile =
    user?.profile as
      WebNotificationRecipientProfile |
      undefined;

  const notificationName =
    user?.professionalName ??
    user?.name ??
    "";

  useEffect(
    () => {
      if (
        !notificationProfile
      ) {
        const timeoutId =
          window.setTimeout(
            () =>
              setDynamicNotifications(
                []
              ),
            0
          );

        return () =>
          window.clearTimeout(
            timeoutId
          );
      }

      const currentNotificationProfile =
        notificationProfile;

      function refreshDynamicNotifications() {
        setDynamicNotifications(
          getWebNotificationsForUser(
            currentNotificationProfile,
            notificationName
          )
        );
      }

      const timeoutId =
        window.setTimeout(
          refreshDynamicNotifications,
          0
        );

      window.addEventListener(
        WEB_NOTIFICATIONS_CHANGED_EVENT,
        refreshDynamicNotifications
      );

      window.addEventListener(
        "storage",
        refreshDynamicNotifications
      );

      return () => {
        window.clearTimeout(
          timeoutId
        );

        window.removeEventListener(
          WEB_NOTIFICATIONS_CHANGED_EVENT,
          refreshDynamicNotifications
        );

        window.removeEventListener(
          "storage",
          refreshDynamicNotifications
        );
      };
    },
    [
      notificationProfile,
      notificationName,
    ]
  );

  const visibleNotifications:
    HeaderNotification[] = [
      ...dynamicNotifications.map(
        (
          notification
        ) => ({
          id:
            notification.id,

          title:
            notification.title,

          description:
            notification.description,

          time:
            formatNotificationTime(
              notification.createdAt
            ),

          read:
            notification.read,

          type:
            "system" as const,

          route:
            notification.route,

          dynamic:
            true,
        })
      ),

      ...notifications,
    ];

  /* =======================================
     NOTIFICAÇÕES NÃO LIDAS
  ======================================= */

  const unreadCount =
    visibleNotifications.filter(
      (
        notification
      ) =>
        !notification.read
    ).length;

  /* =======================================
     PRIMEIRO NOME
  ======================================= */

  const firstName =
    user?.name
      ?.trim()
      .split(
        /\s+/
      )[0] ??
    "Usuário";

  const availableProfiles =
    user
      ? getUserProfiles(
          user
        )
      : [];

  const hasMultipleProfiles =
    availableProfiles.length >
    1;

  function handleSwitchProfile(
    profile: UserProfile
  ) {
    if (
      !user ||
      profile ===
        user.profile
    ) {
      setUserMenuOpen(
        false
      );
      return;
    }

    switchProfile(
      profile
    );

    setUserMenuOpen(
      false
    );

    navigate(
      "/dashboard"
    );
  }

  /* =======================================
     PERMISSÕES
  ======================================= */

  const canAccessSettings =
    userCan(
      user,
      "settings",
      "manage"
    );


  const canAccessPatients =
    userCanAccessModule(
      user,
      "patients"
    );

  const canAccessProfessionals =
    user?.profile ===
    "Gestor";

  const canAccessResponsibles =
    canAccessPatients &&
    (user?.profile ===
      "Gestor" ||
      user?.profile ===
        "Recepção");

  const globalSearchResults =
    useMemo<
      GlobalSearchResult[]
    >(
      () => {
        const query =
          searchValue
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        if (
          query.length <
          2
        ) {
          return [];
        }

        const results:
          GlobalSearchResult[] =
          [];

        if (
          canAccessPatients
        ) {
          getPatients()
            .filter(
              (patient) => {
                const searchable =
                  [
                    patient.nome,
                    patient.cpf,
                    patient.telefone,
                    patient.celular,
                    patient.email,
                    patient.responsavelNome,
                    patient.responsavelCpf,
                    patient.responsavelTelefone,
                    patient.responsavelEmail,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )
                    .toLocaleLowerCase(
                      "pt-BR"
                    );

                return searchable.includes(
                  query
                );
              }
            )
            .slice(
              0,
              5
            )
            .forEach(
              (patient) => {
                results.push({
                  id: `patient-${patient.id}`,
                  type: "patient",
                  title:
                    patient.nome,
                  subtitle: `Paciente${
                    patient.cpf
                      ? ` • CPF ${patient.cpf}`
                      : ""
                  }`,
                  route: `/pacientes/${patient.id}`,
                });
              }
            );
        }

        if (
          canAccessResponsibles
        ) {
          getResponsibles()
            .filter(
              (responsible) => {
                const patientNames =
                  getResponsiblePatientIds(
                    responsible.id
                  )
                    .map(
                      (patientId) =>
                        getPatients().find(
                          (patient) =>
                            patient.id ===
                            patientId
                        )?.nome ??
                        ""
                    )
                    .join(
                      " "
                    );

                const searchable =
                  [
                    responsible.nome,
                    responsible.cpf,
                    responsible.telefone,
                    responsible.email,
                    patientNames,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )
                    .toLocaleLowerCase(
                      "pt-BR"
                    );

                return searchable.includes(
                  query
                );
              }
            )
            .slice(
              0,
              5
            )
            .forEach(
              (responsible) => {
                const childrenCount =
                  getResponsiblePatientIds(
                    responsible.id
                  ).length;

                results.push({
                  id: `responsible-${responsible.id}`,
                  type: "responsible",
                  title:
                    responsible.nome,
                  subtitle: `Responsável • ${childrenCount} criança${
                    childrenCount ===
                    1
                      ? ""
                      : "s"
                  } vinculada${
                    childrenCount ===
                    1
                      ? ""
                      : "s"
                  }`,
                  route: `/responsaveis/${responsible.id}/editar`,
                });
              }
            );
        }

        if (
          canAccessProfessionals
        ) {
          getProfessionalTableData()
            .filter(
              (professional) =>
                [
                  professional.name,
                  professional.specialty,
                  professional.council,
                  professional.phone,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " "
                  )
                  .toLocaleLowerCase(
                    "pt-BR"
                  )
                  .includes(
                    query
                  )
            )
            .slice(
              0,
              5
            )
            .forEach(
              (professional) => {
                results.push({
                  id: `professional-${professional.id}`,
                  type: "professional",
                  title:
                    professional.name,
                  subtitle: `Profissional • ${professional.specialty}`,
                  route: `/profissionais/${professional.id}`,
                });
              }
            );
        }

        return results.slice(
          0,
          10
        );
      },
      [
        searchValue,
        canAccessPatients,
        canAccessResponsibles,
        canAccessProfessionals,
      ]
    );

  function handleSearchResult(
    result: GlobalSearchResult
  ) {
    setSearchOpen(
      false
    );

    setSearchValue(
      ""
    );

    navigate(
      result.route
    );
  }

  /* =======================================
     LOGOUT
  ======================================= */

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

  /* =======================================
     NOTIFICAÇÕES
  ======================================= */

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

    if (
      notificationProfile
    ) {
      markAllWebNotificationsAsReadForUser(
        notificationProfile,
        notificationName
      );
    }
  }

  function handleMarkAsRead(
    notification:
      HeaderNotification
  ) {
    if (
      notification.dynamic
    ) {
      markWebNotificationAsRead(
        notification.id
      );
    } else {
      setNotifications(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              notification.id
                ? {
                    ...item,

                    read:
                      true,
                  }
                : item
          )
      );
    }

    if (
      notification.route
    ) {
      setNotificationsOpen(
        false
      );

      navigate(
        notification.route
      );
    }
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <header
      className="
        relative
        z-40
        flex
        h-[92px]
        shrink-0
        items-center
        justify-between
        border-b
        border-[#edf0f8]
        bg-white
        px-8
      "
    >
      {/* ================================= */}
      {/* SAUDAÇÃO */}
      {/* ================================= */}

      <div className="min-w-0">
        <h1
          className="
            truncate
            text-[27px]
            font-extrabold
            leading-tight
            tracking-[-0.02em]
            text-[#10235f]
          "
        >
          Olá,{" "}
          {
            firstName
          }
          ! 👋
        </h1>

        <p
          className="
            mt-1
            text-sm
            font-medium
            text-[#7180a8]
          "
        >
          Aqui está o panorama geral da clínica hoje.
        </p>
      </div>

      {/* ================================= */}
      {/* AÇÕES */}
      {/* ================================= */}

      <div
        className="
          ml-6
          flex
          items-center
          gap-3
        "
      >
        {/* ================================= */}
        {/* BUSCA */}
        {/* ================================= */}

        <div
          ref={
            searchRef
          }
          className="relative hidden xl:block"
        >
          <div
            className="
              flex
              h-11
              w-[320px]
              items-center
              rounded-xl
              border
              border-[#dfe4f4]
              bg-white
              px-4
              shadow-[0_3px_12px_rgba(47,63,112,0.04)]
            "
          >
            <Search
              size={17}
              className="shrink-0 text-[#596dc0]"
            />

            <input
              ref={
                searchInputRef
              }
              type="text"
              value={
                searchValue
              }
              onFocus={() =>
                setSearchOpen(
                  true
                )
              }
              onChange={(event) => {
                setSearchValue(
                  event.target.value
                );

                setSearchOpen(
                  true
                );
              }}
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" &&
                  globalSearchResults.length >
                    0
                ) {
                  handleSearchResult(
                    globalSearchResults[0]
                  );
                }
              }}
              placeholder="Buscar paciente, responsável, profissional..."
              className="
                ml-3
                min-w-0
                flex-1
                bg-transparent
                text-xs
                font-medium
                text-slate-700
                outline-none
                placeholder:text-[#8792b3]
              "
            />

            {searchValue ? (
              <button
                type="button"
                title="Limpar busca"
                onClick={() => {
                  setSearchValue(
                    ""
                  );

                  searchInputRef.current?.focus();
                }}
                className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#8d97b5] transition hover:bg-[#f5f6fb] hover:text-[#596dc0]"
              >
                <X
                  size={14}
                />
              </button>
            ) : (
              <span
                className="
                  ml-2
                  shrink-0
                  rounded-md
                  bg-[#f5f6fb]
                  px-2
                  py-1
                  text-[9px]
                  font-semibold
                  text-[#7580a2]
                "
              >
                Ctrl + K
              </span>
            )}
          </div>

          {searchOpen && (
            <div
              className="absolute left-0 top-[calc(100%+10px)] z-50 w-[390px] overflow-hidden rounded-2xl border border-[#e8ebf4] bg-white shadow-[0_20px_50px_rgba(44,57,105,0.14)]"
            >
              {searchValue.trim().length <
              2 ? (
                <div className="px-5 py-5">
                  <p className="text-sm font-bold text-[#10235f]">
                    Busca geral
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#7d89aa]">
                    Digite pelo menos 2 caracteres para buscar pacientes, responsáveis e profissionais disponíveis para o seu perfil.
                  </p>
                </div>
              ) : globalSearchResults.length ===
                0 ? (
                <div className="px-5 py-6 text-center">
                  <Search
                    size={22}
                    className="mx-auto text-[#a1abc7]"
                  />

                  <p className="mt-3 text-sm font-bold text-[#10235f]">
                    Nenhum resultado encontrado
                  </p>

                  <p className="mt-1 text-xs text-[#8792b3]">
                    Tente buscar por nome, CPF, contato, especialidade ou criança vinculada.
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-[#eef0f6] px-4 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#929dbb]">
                      Resultados
                    </p>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {globalSearchResults.map(
                      (result) => (
                        <button
                          key={
                            result.id
                          }
                          type="button"
                          onClick={() =>
                            handleSearchResult(
                              result
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f8f7ff]"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              result.type ===
                              "patient"
                                ? "bg-[#eef4ff] text-[#4577d8]"
                                : result.type ===
                                    "responsible"
                                  ? "bg-[#f3efff] text-[#6847f5]"
                                  : "bg-[#eaf9f4] text-[#289a75]"
                            }`}
                          >
                            <UserRound
                              size={17}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-extrabold text-[#24345f]">
                              {
                                result.title
                              }
                            </span>

                            <span className="mt-0.5 block truncate text-[11px] font-medium text-[#8b96b4]">
                              {
                                result.subtitle
                              }
                            </span>
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>


        {/* ================================= */}
        {/* UNIDADE ATIVA */}
        {/* ================================= */}

        <div
          className="
            hidden
            min-w-[210px]
            items-center
            gap-3
            rounded-xl
            border
            border-[#dfe4f4]
            bg-white
            px-3
            py-2
            shadow-[0_3px_12px_rgba(47,63,112,0.04)]
            lg:flex
          "
          title="Unidade ativa"
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#f3efff]
              text-[#6543ef]
            "
          >
            <Building2
              size={17}
            />
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.08em]
                text-[#9aa5c4]
              "
            >
              Unidade
            </p>

            {hasMultipleUnits ? (
              <div
                className="
                  relative
                  mt-0.5
                "
              >
                <select
                  value={
                    isAllUnits ? "all" : String(activeUnitId)
                  }
                  onChange={(event) => {
                    if (event.target.value === "all") {
                      setAllUnitsView();
                      return;
                    }

                    setActiveUnit(Number(event.target.value));
                  }}
                  className="
                    w-full
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    pr-5
                    text-xs
                    font-extrabold
                    text-[#10235f]
                    outline-none
                  "
                  aria-label="Selecionar unidade"
                >
                  {canViewAllUnits && (
                    <option value="all">
                      Todas as unidades
                    </option>
                  )}

                  {availableUnits.map(
                    (
                      unit
                    ) => (
                      <option
                        key={
                          unit.id
                        }
                        value={
                          unit.id
                        }
                      >
                        {
                          unit.name
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-1/2
                    -translate-y-1/2
                    text-[#7180a8]
                  "
                />
              </div>
            ) : (
              <p
                className="
                  mt-0.5
                  truncate
                  text-xs
                  font-extrabold
                  text-[#10235f]
                "
              >
                {
                  activeUnit.name
                }
              </p>
            )}
          </div>
        </div>

        {/* ================================= */}
        {/* NOTIFICAÇÕES */}
        {/* ================================= */}

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
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-[#5368b8]
              transition
              hover:bg-[#f6f7ff]
              hover:text-[#5d3df5]
            "
          >
            <Bell
              size={20}
            />

            {unreadCount >
              0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  min-h-[18px]
                  min-w-[18px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#ff3b55]
                  px-1
                  text-[9px]
                  font-extrabold
                  text-white
                  ring-2
                  ring-white
                "
              >
                {
                  unreadCount
                }
              </span>
            )}
          </button>

          {/* ================================= */}
          {/* DROPDOWN NOTIFICAÇÕES */}
          {/* ================================= */}

          {notificationsOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+14px)]
                z-50
                w-[390px]
                overflow-hidden
                rounded-2xl
                border
                border-[#e8ebf4]
                bg-white
                shadow-[0_20px_50px_rgba(44,57,105,0.14)]
              "
            >
              {/* CABEÇALHO */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  px-5
                  py-4
                "
              >
                <div>
                  <h2
                    className="
                      text-base
                      font-bold
                      text-[#10235f]
                    "
                  >
                    Notificações
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
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
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-600
                  "
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              {/* LISTA */}

              {visibleNotifications.length >
              0 ? (
                <>
                  <div
                    className="
                      max-h-[430px]
                      overflow-y-auto
                    "
                  >
                    {visibleNotifications.map(
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
                              notification
                            )
                          }
                          className={`
                            flex
                            w-full
                            items-start
                            gap-3
                            border-b
                            border-slate-100
                            px-5
                            py-4
                            text-left
                            transition

                            ${
                              notification.read
                                ? "bg-white"
                                : "bg-[#faf9ff]"
                            }

                            hover:bg-slate-50
                          `}
                        >
                          <div
                            className={`
                              mt-1
                              h-2.5
                              w-2.5
                              shrink-0
                              rounded-full

                              ${
                                notification.read
                                  ? "bg-slate-200"
                                  : "bg-[#7046ff]"
                              }
                            `}
                          />

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <p
                                className="
                                  text-sm
                                  font-bold
                                  text-slate-800
                                "
                              >
                                {
                                  notification.title
                                }
                              </p>

                              {!notification.read && (
                                <span
                                  className="
                                    mt-1
                                    h-2
                                    w-2
                                    shrink-0
                                    rounded-full
                                    bg-[#ff3b55]
                                  "
                                />
                              )}
                            </div>

                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-slate-500
                              "
                            >
                              {
                                notification.description
                              }
                            </p>

                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                gap-1.5
                                text-[11px]
                                text-slate-400
                              "
                            >
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

                  {/* RODAPÉ */}

                  <div
                    className="
                      space-y-2
                      border-t
                      border-slate-100
                      p-3
                    "
                  >
                    {unreadCount >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-slate-50
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-slate-600
                          transition
                          hover:bg-slate-100
                        "
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
                      className="
                        w-full
                        rounded-xl
                        bg-gradient-to-r
                        from-[#5d3df5]
                        to-[#7b3ff5]
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:opacity-95
                      "
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className="
                    px-5
                    py-10
                    text-center
                  "
                >
                  <Bell
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-semibold
                      text-slate-600
                    "
                  >
                    Nenhuma notificação
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Novos avisos aparecerão aqui.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* MENSAGENS */}
        {/* ================================= */}

        <button
          type="button"
          title="Mensagens"
          onClick={() =>
            navigate(
              "/mensagens"
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-[#5368b8]
            transition
            hover:bg-[#f6f7ff]
            hover:text-[#5d3df5]
          "
        >
          <Mail
            size={20}
          />
        </button>

        {/* ================================= */}
        {/* DIVISOR */}
        {/* ================================= */}

        <div
          className="
            mx-1
            hidden
            h-8
            w-px
            bg-[#edf0f8]
            lg:block
          "
        />

        {/* ================================= */}
        {/* PERFIL */}
        {/* ================================= */}

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
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-1.5
              transition
              hover:bg-[#f8f9fd]
            "
          >
            {/* AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#f6b28c]
                to-[#d77c63]
                text-xs
                font-extrabold
                text-white
                shadow-sm
              "
            >
              {
                getInitials(
                  user?.name ??
                  "Usuário"
                )
              }
            </div>

            {/* DADOS */}

            <div
              className="
                hidden
                min-w-0
                text-left
                lg:block
              "
            >
              <p
                className="
                  max-w-36
                  truncate
                  text-sm
                  font-bold
                  text-[#10235f]
                "
              >
                {
                  user?.name ??
                  "Usuário"
                }
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  font-medium
                  text-[#7a86aa]
                "
              >
                {
                  user?.profile ??
                  ""
                }
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`
                hidden
                text-[#6474a6]
                transition-transform
                lg:block

                ${
                  userMenuOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {/* ================================= */}
          {/* MENU DO USUÁRIO */}
          {/* ================================= */}

          {userMenuOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+14px)]
                z-50
                w-64
                overflow-hidden
                rounded-2xl
                border
                border-[#e8ebf4]
                bg-white
                shadow-[0_20px_50px_rgba(44,57,105,0.14)]
              "
            >
              <div
                className="
                  border-b
                  border-slate-100
                  p-4
                "
              >
                <p
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-[#10235f]
                  "
                >
                  {
                    user?.name
                  }
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-xs
                    text-slate-500
                  "
                >
                  {
                    user?.email
                  }
                </p>

                <span
                  className="
                    mt-3
                    inline-flex
                    rounded-lg
                    bg-[#f2efff]
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-[#633df0]
                  "
                >
                  {
                    user?.profile
                  }
                </span>
              </div>

              {hasMultipleProfiles && (
                <div className="border-b border-slate-100 p-3">
                  <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Área de acesso
                  </p>

                  <div className="space-y-1">
                    {availableProfiles.map(
                      (profile) => {
                        const active =
                          profile ===
                          user?.profile;

                        return (
                          <button
                            key={profile}
                            type="button"
                            onClick={() =>
                              handleSwitchProfile(
                                profile
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                              active
                                ? "bg-[#f2efff] text-[#633df0]"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Building2
                                size={16}
                              />

                              {profile}
                            </span>

                            {active && (
                              <CheckCheck
                                size={16}
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="p-2">
                <button
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-slate-50
                  "
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
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <Settings
                      size={17}
                    />

                    Configurações
                  </button>
                )}
              </div>

              <div
                className="
                  border-t
                  border-slate-100
                  p-2
                "
              >
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
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

/* =========================================
   INICIAIS
========================================= */

function getInitials(
  name:
    string
) {
  const parts =
    name
      .trim()
      .split(
        /\s+/
      )
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
