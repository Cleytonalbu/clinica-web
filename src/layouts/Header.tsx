import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  Bell,
  CheckCheck,
  ChevronDown,
  Clock3,
  Loader2,
  LogOut,
  Mail,
  Search,
  Settings,
  Stethoscope,
  User,
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

import {
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  type ApiNotificacao,
} from "@/services/notificacoes";

import {
  contarMensagensNaoLidas,
} from "@/services/mensagens";

import {
  listarPacientes,
  type ApiPaciente,
} from "@/services/pacientes";

import {
  listarProfissionais,
  type ApiProfissional,
} from "@/services/referencias";

/* =========================================
   BUSCA GLOBAL
========================================= */

interface SearchResultItem {
  kind: "paciente" | "profissional";
  id: string;
  label: string;
  sublabel: string;
}

function paraResultadoPaciente(
  paciente: ApiPaciente
): SearchResultItem {
  return {
    kind: "paciente",
    id: paciente.id,
    label: paciente.nome,
    sublabel:
      paciente.cpf ??
      paciente.telefone ??
      paciente.responsavel ??
      "Paciente",
  };
}

function paraResultadoProfissional(
  profissional: ApiProfissional
): SearchResultItem {
  return {
    kind: "profissional",
    id: profissional.id,
    label: profissional.usuario.nome,
    sublabel:
      profissional.especialidades[0]?.especialidade.nome ??
      "Profissional",
  };
}

/* =========================================
   TIPOS
========================================= */

interface HeaderNotification {
  id:
    string;

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
}

/* =========================================
   NOTIFICAÇÕES
========================================= */

// Tipo (enum do backend) → categoria de ícone usada aqui no dropdown.
function tipoParaCategoria(
  tipo: ApiNotificacao["tipo"]
): HeaderNotification["type"] {
  switch (tipo) {
    case "lembrete_consulta":
    case "confirmacao_consulta":
    case "novo_agendamento":
    case "faltas_ausencias":
      return "appointment";
    case "pagamento_recebido":
      return "payment";
    case "novos_objetivos":
    case "encaminhamento":
      return "patient";
    default:
      return "system";
  }
}

function formatarTempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras} h`;

  const diffDias = Math.round(diffHoras / 24);
  return `há ${diffDias} d`;
}

function paraHeaderNotification(
  api: ApiNotificacao
): HeaderNotification {
  return {
    id: api.id,
    title: api.texto,
    description: "",
    time: formatarTempoRelativo(api.criadoEm),
    read: api.lida,
    type: tipoParaCategoria(api.tipo),
  };
}

/* =========================================
   COMPONENTE
========================================= */

export function Header() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } =
    useAuth();

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
    notifications,
    setNotifications,
  ] =
    useState<
      HeaderNotification[]
    >(
      []
    );

  /* =======================================
     BUSCA GLOBAL
  ======================================= */

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const canSearchPacientes = userCanAccessModule(user, "patients");
  const canSearchProfissionais = user?.profile === "Gestor";

  useEffect(() => {
    const termo = searchQuery.trim();

    if (termo.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelado = false;
    setSearchLoading(true);

    const timeout = window.setTimeout(() => {
      Promise.all([
        canSearchPacientes
          ? listarPacientes({ busca: termo, porPagina: 5 }).then(
              (resposta) => resposta.dados.map(paraResultadoPaciente)
            )
          : Promise.resolve<SearchResultItem[]>([]),

        canSearchProfissionais
          ? listarProfissionais({ busca: termo, ativo: null }).then(
              (dados) => dados.slice(0, 5).map(paraResultadoProfissional)
            )
          : Promise.resolve<SearchResultItem[]>([]),
      ])
        .then(([pacientes, profissionais]) => {
          if (cancelado) return;
          setSearchResults([...pacientes, ...profissionais]);
          setHighlightedIndex(0);
        })
        .catch(() => {
          if (!cancelado) setSearchResults([]);
        })
        .finally(() => {
          if (!cancelado) setSearchLoading(false);
        });
    }, 300);

    return () => {
      cancelado = true;
      window.clearTimeout(timeout);
    };
  }, [searchQuery, canSearchPacientes, canSearchProfissionais]);

  // Atalho Ctrl+K / Cmd+K foca a busca de qualquer lugar da tela.
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function handleSelectResult(item: SearchResultItem) {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.blur();

    navigate(
      item.kind === "paciente"
        ? `/pacientes/${item.id}`
        : `/profissionais/${item.id}`
    );
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSearchOpen(false);
      searchInputRef.current?.blur();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, searchResults.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      const item = searchResults[highlightedIndex];
      if (item) handleSelectResult(item);
    }
  }

  useEffect(() => {
    let cancelado = false;

    function carregar() {
      listarNotificacoes()
        .then((resposta) => {
          if (cancelado) return;
          setNotifications(resposta.notificacoes.map(paraHeaderNotification));
        })
        .catch(() => {});
    }

    carregar();

    // Atualiza a cada minuto para refletir novas notificações sem exigir reload.
    const interval = window.setInterval(carregar, 60000);

    return () => {
      cancelado = true;
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================
     MENSAGENS NÃO LIDAS
  ======================================= */

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let cancelado = false;

    function carregar() {
      contarMensagensNaoLidas()
        .then((total) => {
          if (!cancelado) setUnreadMessages(total);
        })
        .catch(() => {});
    }

    carregar();

    const interval = window.setInterval(carregar, 30000);

    return () => {
      cancelado = true;
      window.clearInterval(interval);
    };
  }, []);

  const userMenuRef =
    useRef<HTMLDivElement>(
      null
    );

  const notificationsRef =
    useRef<HTMLDivElement>(
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

  /* =======================================
     NOTIFICAÇÕES NÃO LIDAS
  ======================================= */

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

  /* =======================================
     PERMISSÕES
  ======================================= */

  const canAccessSettings =
    userCanAccessModule(
      user,
      "settings"
    );

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

    marcarTodasNotificacoesLidas().catch(() => {});
  }

  function handleMarkAsRead(
    id:
      string
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

    marcarNotificacaoLida(id).catch(() => {});
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
          ref={searchRef}
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
            {searchLoading ? (
              <Loader2
                size={17}
                className="shrink-0 animate-spin text-[#596dc0]"
              />
            ) : (
              <Search
                size={17}
                className="shrink-0 text-[#596dc0]"
              />
            )}

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
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

            {searchQuery ? (
              <button
                type="button"
                title="Limpar busca"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                className="ml-2 shrink-0 text-[#8792b3] transition hover:text-slate-500"
              >
                <X size={15} />
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

          {/* ================================= */}
          {/* DROPDOWN DE RESULTADOS */}
          {/* ================================= */}

          {searchOpen && searchQuery.trim().length >= 2 && (
            <div
              className="
                absolute
                left-0
                top-[calc(100%+10px)]
                z-50
                w-full
                overflow-hidden
                rounded-2xl
                border
                border-[#e8ebf4]
                bg-white
                shadow-[0_20px_50px_rgba(44,57,105,0.14)]
              "
            >
              {searchResults.length > 0 ? (
                <div className="max-h-[380px] overflow-y-auto py-2">
                  {searchResults.map((item, index) => (
                    <button
                      key={`${item.kind}-${item.id}`}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleSelectResult(item)}
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        px-4
                        py-2.5
                        text-left
                        transition

                        ${
                          index === highlightedIndex
                            ? "bg-[#f6f7ff]"
                            : "bg-white"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl

                          ${
                            item.kind === "paciente"
                              ? "bg-[#eef1ff] text-[#5d3df5]"
                              : "bg-[#eafaf1] text-[#1a9a63]"
                          }
                        `}
                      >
                        {item.kind === "paciente" ? (
                          <User size={16} />
                        ) : (
                          <Stethoscope size={16} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {item.label}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {item.kind === "paciente" ? "Paciente" : "Profissional"}
                          {" · "}
                          {item.sublabel}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !searchLoading ? (
                <div className="px-5 py-8 text-center">
                  <Search size={22} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Nenhum resultado encontrado
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Tente buscar por nome, CPF ou telefone.
                  </p>
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-xs text-slate-400">
                  Buscando...
                </div>
              )}
            </div>
          )}
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

              {notifications.length >
              0 ? (
                <>
                  <div
                    className="
                      max-h-[430px]
                      overflow-y-auto
                    "
                  >
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
          <Mail
            size={20}
          />

          {unreadMessages > 0 && (
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
              {unreadMessages}
            </span>
          )}
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