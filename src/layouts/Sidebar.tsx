import type {
  ComponentType,
} from "react";

import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  Gauge,
  Home,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  userCanAccessModule,
} from "@/auth/permissions";

import type {
  PermissionModuleKey,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   TIPOS
========================================= */

interface PermissionMenuItem {
  id: string;

  label: string;

  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;

  path: string;

  module: PermissionModuleKey;

  gestorOnly?: false;
}

interface GestorMenuItem {
  id: string;

  label: string;

  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;

  path: string;

  gestorOnly: true;

  module?: never;
}

type MenuItem =
  | PermissionMenuItem
  | GestorMenuItem;

/* =========================================
   ITENS DISPONÍVEIS
========================================= */

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
    module: "dashboard",
  },

  {
    id: "agenda",
    label: "Agenda",
    icon: CalendarDays,
    path: "/agenda",
    module: "agenda",
  },

  {
    id: "pacientes",
    label: "Pacientes",
    icon: Users,
    path: "/pacientes",
    module: "patients",
  },

  {
    id: "profissionais",
    label: "Profissionais",
    icon: Stethoscope,
    path: "/profissionais",
    module: "professionals",
  },

  {
    id: "indicadores",
    label: "Indicadores",
    icon: Gauge,
    path: "/indicadores",
    gestorOnly: true,
  },

  {
    id: "financeiro",
    label: "Financeiro",
    icon: CircleDollarSign,
    path: "/financeiro",
    module: "financial",
  },

  {
    id: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    path: "/relatorios",
    module: "reports",
  },

  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    path: "/configuracoes",
    module: "settings",
  },
];

/* =========================================
   MENU POR PERFIL
========================================= */

const profileMenuAccess: Record<
  string,
  string[]
> = {
  /*
   * GESTOR
   *
   * Tem acesso ao menu administrativo
   * completo.
   */
  Gestor: [
    "dashboard",
    "agenda",
    "pacientes",
    "profissionais",
    "indicadores",
    "financeiro",
    "relatorios",
    "configuracoes",
  ],

  /*
   * RECEPÇÃO
   *
   * Somente recursos operacionais.
   */
  "Recepção": [
    "dashboard",
    "agenda",
    "pacientes",
    "financeiro",
  ],

  /*
   * PROFISSIONAL
   *
   * Foco no atendimento.
   */
  Profissional: [
    "dashboard",
    "agenda",
    "pacientes",
  ],
};

/* =========================================
   SIDEBAR
========================================= */

export function Sidebar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
  } = useAuth();

  /* =======================================
     PERFIL ATUAL
  ======================================= */

  const currentProfile =
    user?.profile ?? "";

  /*
   * Primeiro verificamos quais itens
   * pertencem ao perfil.
   */

  const profileAllowedItems =
    profileMenuAccess[
      currentProfile
    ] ?? [];

  /*
   * Depois aplicamos também as permissões
   * existentes do sistema.
   *
   * Dessa maneira:
   *
   * - o perfil controla quais módulos
   *   podem aparecer;
   *
   * - as permissões continuam controlando
   *   se o usuário realmente pode
   *   acessar o módulo.
   */

  const allowedMenuItems =
    menuItems.filter(
      (
        item
      ) => {
        /*
         * Se o item não pertence ao menu
         * desse perfil, ele não aparece.
         */

        if (
          !profileAllowedItems.includes(
            item.id
          )
        ) {
          return false;
        }

        /*
         * Indicadores é exclusivo
         * do Gestor.
         */

        if (
          item.gestorOnly
        ) {
          return (
            currentProfile ===
            "Gestor"
          );
        }

        /*
         * Para os demais módulos,
         * respeitamos as permissões
         * existentes.
         */

        return userCanAccessModule(
          user,
          item.module
        );
      }
    );

  /* =======================================
     ITEM ATIVO
  ======================================= */

  function isMenuActive(
    item: MenuItem
  ) {
    if (
      item.path ===
      "/dashboard"
    ) {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    return (
      location.pathname ===
        item.path ||
      location.pathname.startsWith(
        `${item.path}/`
      )
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* ================================= */}
      {/* LOGO */}
      {/* ================================= */}

      <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-200">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
          className="text-center"
        >
          <h1 className="text-xl font-bold text-sky-600">
            Entre Afetos
          </h1>

          <p className="text-xs text-slate-500">
            Sistema de Gestão
          </p>
        </button>
      </div>

      {/* ================================= */}
      {/* MENU PRINCIPAL */}
      {/* ================================= */}

      <nav className="flex-1 overflow-y-auto p-5">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Menu principal
        </p>

        <ul className="space-y-2">
          {allowedMenuItems.map(
            (
              item
            ) => {
              const Icon =
                item.icon;

              const active =
                isMenuActive(
                  item
                );

              return (
                <li
                  key={
                    item.id
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        item.path
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                      active
                        ? "bg-sky-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      size={20}
                    />

                    <span className="font-medium">
                      {
                        item.label
                      }
                    </span>
                  </button>
                </li>
              );
            }
          )}
        </ul>

        {/* ================================= */}
        {/* SEM MÓDULOS */}
        {/* ================================= */}

        {allowedMenuItems.length ===
          0 && (
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm font-medium text-slate-500">
              Nenhum módulo disponível para este perfil.
            </p>
          </div>
        )}
      </nav>

      {/* ================================= */}
      {/* PERFIL ATUAL */}
      {/* ================================= */}

      {user && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-medium text-slate-400">
            Perfil atual
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
              {
                getInitials(
                  user.name
                )
              }
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {
                  user.name
                }
              </p>

              <p className="text-xs text-slate-500">
                {
                  user.profile
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* RECOLHER MENU */}
      {/* ================================= */}

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-slate-600 transition hover:bg-slate-100"
        >
          <ChevronLeft
            size={18}
          />

          <span>
            Recolher menu
          </span>
        </button>

        {/* ================================= */}
        {/* AC SOFTWARE */}
        {/* ================================= */}

        <div className="mt-5 rounded-xl bg-sky-600 p-4 text-white">
          <p className="text-sm font-semibold">
            Desenvolvido por
          </p>

          <p className="mt-1 text-lg font-bold">
            AC Software
          </p>

          <p className="mt-2 text-xs text-sky-100">
            Gestão inteligente para clínicas multiprofissionais.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* =========================================
   INICIAIS DO USUÁRIO
========================================= */

function getInitials(
  name: string
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