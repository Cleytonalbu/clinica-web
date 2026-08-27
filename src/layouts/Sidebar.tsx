import type {
  ComponentType,
} from "react";

import {
  BarChart3,
  BadgeDollarSign,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ReceiptText,
  ShoppingCart,
  HandCoins,
  Landmark,
  WalletCards,
  Building2,
  Boxes,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  DoorOpen,
  Gauge,
  Home,
  Settings,
  Stethoscope,
  Users,
  UserRoundCog,
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

import logoAcSoftware from "@/assets/logo-ac-software.png";
import logoDash from "@/assets/logo-dash.png";

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
   ITENS DO MENU
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
    id: "salas",
    label: "Salas",
    icon: DoorOpen,
    path: "/salas",
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
    id: "solicitacoes-relatorios",
    label: "Solicitações",
    icon: ClipboardList,
    path: "/solicitacoes-relatorios",
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
    id: "contas-bancarias",
    label: "Contas bancárias",
    icon: Landmark,
    path: "/contas-bancarias",
    module: "financial",
  },

  {
    id: "faturamento",
    label: "Faturamento",
    icon: ReceiptText,
    path: "/faturamento",
    module: "financial",
  },

  {
    id: "convenios-planos",
    label: "Convênios e planos",
    icon: BadgeDollarSign,
    path: "/convenios-planos",
    module: "financial",
  },

  {
    id: "guias-convenios",
    label: "Guias de convênios",
    icon: FileSpreadsheet,
    path: "/guias-convenios",
    module: "financial",
  },

  {
    id: "repasses",
    label: "Repasses",
    icon: HandCoins,
    path: "/repasses",
    module: "financial",
  },

  {
    id: "despesas",
    label: "Despesas",
    icon: WalletCards,
    path: "/despesas",
    module: "financial",
  },


  {
    id: "compras",
    label: "Compras",
    icon: ShoppingCart,
    path: "/compras",
    module: "financial",
  },


  {
    id: "estoque",
    label: "Estoque",
    icon: Boxes,
    path: "/estoque",
    module: "financial",
  },

  {
    id: "fornecedores",
    label: "Fornecedores",
    icon: Building2,
    path: "/fornecedores",
    module: "financial",
  },


  {
    id: "colaboradores-administrativos",
    label: "Colaboradores",
    icon: UserRoundCog,
    path: "/colaboradores-administrativos",
    module: "financial",
  },


  {
    id: "pagamentos-administrativos",
    label: "Pagamentos",
    icon: BadgeDollarSign,
    path: "/pagamentos-administrativos",
    module: "financial",
  },


  {
    id: "ferias-afastamentos",
    label: "Férias e afastamentos",
    icon: CalendarRange,
    path: "/ferias-afastamentos",
    module: "financial",
  },


  {
    id: "documentos-administrativos",
    label: "Documentos",
    icon: FileText,
    path: "/documentos-administrativos",
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
    id: "relatorios-administrativos",
    label: "Relatórios",
    icon: BarChart3,
    path: "/relatorios-administrativos",
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
  Gestor: [
    "dashboard",
    "agenda",
    "salas",
    "pacientes",
    "solicitacoes-relatorios",
    "profissionais",
    "indicadores",
    "financeiro",
    "relatorios",
    "configuracoes",
  ],

  "Recepção": [
    "dashboard",
    "agenda",
    "salas",
    "pacientes",
    "solicitacoes-relatorios",
    "financeiro",
  ],

  Profissional: [
    "dashboard",
    "agenda",
    "pacientes",
    "solicitacoes-relatorios",
  ],

  Administrativo: [
    "dashboard",
    "financeiro",
    "contas-bancarias",
    "faturamento",
    "convenios-planos",
    "guias-convenios",
    "repasses",
    "despesas",
    "compras",
    "estoque",
    "fornecedores",
    "colaboradores-administrativos",
    "pagamentos-administrativos",
    "ferias-afastamentos",
    "documentos-administrativos",
    "relatorios-administrativos",
    "configuracoes",
  ],
};

/* =========================================
   COMPONENTE
========================================= */

export function Sidebar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
  } =
    useAuth();

  const currentProfile =
    user?.profile ?? "";

  /* =======================================
     PERMISSÕES
  ======================================= */

  const profileAllowedItems =
    profileMenuAccess[
      currentProfile
    ] ?? [];

  const allowedMenuItems =
    menuItems.filter(
      (item) => {
        if (
          !profileAllowedItems.includes(
            item.id
          )
        ) {
          return false;
        }

        if (
          item.gestorOnly
        ) {
          return (
            currentProfile ===
            "Gestor"
          );
        }

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
    <aside
      className="
        flex
        h-screen
        w-[252px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-[#edf0f8]
        bg-white
      "
    >
      {/* ================================= */}
      {/* MARCA ENTRE AFETOS */}
      {/* ================================= */}

      <div
        className="
          shrink-0
          px-6
          pb-5
          pt-6
        "
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
          className="
            flex
            w-full
            items-center
            gap-3
            text-left
          "
        >
          {/* Logo Entre Afetos */}

          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
            "
          >
            <img
              src={logoDash}
              alt="Entre Afetos"
              className="
                block
                h-full
                w-full
                scale-125
                object-contain
              "
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                whitespace-nowrap
                text-[9px]
                font-bold
                uppercase
                tracking-[0.20em]
                text-[#5966c8]
              "
            >
              Clínica Integrada
            </p>

            <h1
              className="
                mt-1
                whitespace-nowrap
                text-[20px]
                font-extrabold
                leading-none
                text-[#102a78]
              "
            >
              Entre Afetos
            </h1>
          </div>
        </button>
      </div>

      {/* ================================= */}
      {/* ÁREA CENTRAL */}
      {/* ================================= */}
      {/* SOMENTE ESTA PARTE TEM ROLAGEM */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-3
          pb-5
          sidebar-scroll
        "
      >
        {/* ================================= */}
        {/* MENU */}
        {/* ================================= */}

        <nav>
          <ul className="space-y-1">
            {allowedMenuItems.map(
              (item) => {
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
                      className={`
                        group
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
                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                              bg-gradient-to-r
                              from-[#5d3df5]
                              via-[#7046ff]
                              to-[#8238ff]
                              text-white
                              shadow-[0_8px_20px_rgba(103,66,246,0.22)]
                            `
                            : `
                              text-[#182d73]
                              hover:bg-[#f6f7ff]
                            `
                        }
                      `}
                    >
                      {/* ÍCONE */}

                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition

                          ${
                            active
                              ? `
                                bg-white/10
                                text-white
                              `
                              : `
                                text-[#5368b8]
                                group-hover:bg-white
                                group-hover:text-[#5d3df5]
                              `
                          }
                        `}
                      >
                        <Icon
                          size={18}
                        />
                      </span>

                      {/* TEXTO */}

                      <span
                        className="
                          truncate
                        "
                      >
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
        </nav>

        {/* ================================= */}
        {/* SEM MÓDULOS */}
        {/* ================================= */}

        {allowedMenuItems.length ===
          0 && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-dashed
              border-slate-200
              bg-slate-50
              p-4
              text-center
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-slate-500
              "
            >
              Nenhum módulo disponível
              para este perfil.
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* CARD CRESCIMENTO */}
        {/* ================================= */}

        {currentProfile ===
          "Gestor" && (
          <div
            className="
              mt-6
              overflow-hidden
              rounded-2xl
              bg-gradient-to-b
              from-[#faf8ff]
              to-[#f5f2ff]
              px-4
              py-5
              text-center
            "
          >
            {/* GRÁFICO ILUSTRATIVO */}

            <div
              className="
                mx-auto
                flex
                h-[82px]
                w-[130px]
                items-end
                justify-center
                gap-2
              "
            >
              <div
                className="
                  h-8
                  w-5
                  rounded-t-lg
                  bg-[#4e8cff]
                "
              />

              <div
                className="
                  h-12
                  w-5
                  rounded-t-lg
                  bg-[#ffbb45]
                "
              />

              <div
                className="
                  h-16
                  w-5
                  rounded-t-lg
                  bg-[#ff6fae]
                "
              />

              <span
                className="
                  mb-8
                  ml-1
                  text-3xl
                  font-light
                  text-[#102a78]
                "
              >
                ↗
              </span>
            </div>

            {/* TEXTO */}

            <p
              className="
                mt-3
                text-sm
                font-bold
                leading-5
                text-[#142a78]
              "
            >
              Acompanhe o crescimento
            </p>

            <p
              className="
                mt-0.5
                text-xs
                leading-5
                text-[#5863a6]
              "
            >
              da clínica em tempo real!
            </p>

            {/* BOTÃO */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/relatorios"
                )
              }
              className="
                mt-4
                inline-flex
                w-full
                items-center
                justify-center
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-xs
                font-bold
                text-[#653df4]
                shadow-sm
                transition
                hover:bg-[#fdfcff]
                hover:text-[#5128df]
              "
            >
              Ver relatórios
            </button>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* RODAPÉ AC SOFTWARE */}
      {/* ================================= */}
      {/* NÃO ROLA E NÃO SOBREPÕE NADA */}

      <div
        className="
          shrink-0
          border-t
          border-[#edf0f8]
          bg-white
          px-5
          py-3
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
          "
        >
          {/* LOGO */}

          <div
            className="
              flex
              h-[55px]
              w-full
              items-center
              justify-center
              overflow-hidden
            "
          >
            <img
              src={
                logoAcSoftware
              }
              alt="AC Software"
              className="
                block
                h-auto
                max-h-[52px]
                w-auto
                max-w-[118px]
                object-contain
              "
            />
          </div>

          {/* SLOGAN */}

          <p
            className="
              mt-1
              whitespace-nowrap
              text-center
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.05em]
              text-slate-400
            "
          >
            Transformando ideias em soluções
          </p>
        </div>
      </div>
    </aside>
  );
}