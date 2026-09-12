import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import type {
  ModulePermission,
  PermissionModuleKey,
  PermissionProfileSetting,
  PermissionsSettings,
} from "./settingsStorage";

interface Props {
  settings:
    PermissionsSettings;

  onChange:
    (
      settings:
        PermissionsSettings
    ) => void;

}

const moduleItems: {
  key:
    PermissionModuleKey;

  title:
    string;

  description:
    string;

  icon:
    ReactNode;
}[] = [
  {
    key:
      "dashboard",

    title:
      "Dashboard",

    description:
      "Indicadores e informações gerais do sistema.",

    icon:
      <LayoutDashboard
        size={18}
      />,
  },

  {
    key:
      "patients",

    title:
      "Pacientes",

    description:
      "Cadastro, prontuário e informações dos pacientes.",

    icon:
      <UsersRound
        size={18}
      />,
  },

  {
    key:
      "agenda",

    title:
      "Agenda",

    description:
      "Agendamentos, horários e organização dos atendimentos.",

    icon:
      <CalendarDays
        size={18}
      />,
  },

  {
    key:
      "financial",

    title:
      "Financeiro",

    description:
      "Recebimentos, cobranças e informações financeiras.",

    icon:
      <CircleDollarSign
        size={18}
      />,
  },

  {
    key:
      "evolutions",

    title:
      "Evoluções",

    description:
      "Registros clínicos e evoluções dos pacientes.",

    icon:
      <FileText
        size={18}
      />,
  },

  {
    key:
      "reports",

    title:
      "Relatórios",

    description:
      "Geração e visualização dos relatórios do sistema.",

    icon:
      <BarChart3
        size={18}
      />,
  },

  {
    key:
      "settings",

    title:
      "Configurações",

    description:
      "Acesso à Central de Configurações.",

    icon:
      <Settings
        size={18}
      />,
  },
];

const permissionLabels: {
  key:
    keyof ModulePermission;

  title:
    string;
}[] = [
  {
    key:
      "view",

    title:
      "Visualizar",
  },

  {
    key:
      "create",

    title:
      "Criar",
  },

  {
    key:
      "edit",

    title:
      "Editar",
  },

  {
    key:
      "manage",

    title:
      "Gerenciar",
  },
];

const supportedActionsByModule: Record<
  PermissionModuleKey,
  Array<keyof ModulePermission>
> = {
  dashboard: ["view"],
  patients: ["view", "create", "edit"],
  agenda: ["view", "create", "edit"],
  financial: ["view", "create", "edit"],
  evolutions: ["view", "create", "edit"],
  reports: ["view"],
  settings: ["view", "manage"],
};

export default function PermissionsSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateProfile(
    id:
      number,

    data:
      Partial<PermissionProfileSetting>
  ) {
    const currentProfile =
      settings.profiles.find(
        (profile) =>
          profile.id === id
      );

    if (
      currentProfile?.name ===
      "Gestor"
    ) {
      return;
    }

    onChange({
      ...settings,

      profiles:
        settings.profiles.map(
          (
            profile
          ) =>
            profile.id ===
            id
              ? {
                  ...profile,

                  ...data,
                }
              : profile
        ),
    });
  }

  function updatePermission(
    profile:
      PermissionProfileSetting,

    module:
      PermissionModuleKey,

    permission:
      keyof ModulePermission,

    value:
      boolean
  ) {
    if (
      profile.name ===
      "Gestor"
    ) {
      return;
    }

    if (
      !supportedActionsByModule[
        module
      ].includes(permission)
    ) {
      return;
    }

    const currentModule =
      profile.modules[
        module
      ];

    let nextModule: ModulePermission = {
      ...currentModule,

      [permission]:
        value,
    };

    if (
      permission ===
        "view" &&
      !value
    ) {
      nextModule = {
        view:
          false,

        create:
          false,

        edit:
          false,

        manage:
          false,
      };
    }

    if (
      permission !==
        "view" &&
      value
    ) {
      nextModule.view =
        true;
    }

    updateProfile(
      profile.id,
      {
        modules: {
          ...profile.modules,

          [module]:
            nextModule,
        },
      }
    );
  }

  function toggleFullModule(
    profile:
      PermissionProfileSetting,

    module:
      PermissionModuleKey
  ) {
    if (
      profile.name ===
      "Gestor"
    ) {
      return;
    }

    const permissions =
      profile.modules[
        module
      ];

    const supportedActions =
      supportedActionsByModule[
        module
      ];

    const allEnabled =
      supportedActions.every(
        (action) =>
          permissions[action]
      );

    const nextPermissions: ModulePermission = {
      view: false,
      create: false,
      edit: false,
      manage: false,
    };

    supportedActions.forEach(
      (action) => {
        nextPermissions[action] =
          !allEnabled;
      }
    );

    updateProfile(
      profile.id,
      {
        modules: {
          ...profile.modules,

          [module]:
            nextPermissions,
        },
      }
    );
  }

  const activeProfiles =
    settings.profiles.filter(
      (
        profile
      ) =>
        profile.active
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Perfis cadastrados"

          value={String(
            settings.profiles.length
          )}
        />

        <SummaryCard
          title="Perfis ativos"

          value={String(
            activeProfiles
          )}
        />

        <SummaryCard
          title="Módulos controlados"

          value={String(
            moduleItems.length
          )}
        />
      </div>

      <div className="space-y-6">
        {settings.profiles.map(
          (
            profile
          ) => (
            <PageCard
              key={
                profile.id
              }
              title={
                profile.name
              }
              description={
                profile.description
              }
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      label="Nome do perfil"
                    >
                      <Input
                        value={
                          profile.name
                        }
                        disabled={
                          profile.systemProfile
                        }
                        onChange={(
                          event
                        ) =>
                          updateProfile(
                            profile.id,
                            {
                              name:
                                event.target.value,
                            }
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Descrição"
                    >
                      <Input
                        value={
                          profile.description
                        }
                        onChange={(
                          event
                        ) =>
                          updateProfile(
                            profile.id,
                            {
                              description:
                                event.target.value,
                            }
                          )
                        }
                        disabled={
                          profile.name === "Gestor"
                        }
                      />
                    </FormField>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateProfile(
                          profile.id,
                          {
                            active:
                              !profile.active,
                          }
                        )
                      }
                      disabled={
                        profile.name === "Gestor"
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        profile.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {profile.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>

                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[260px_repeat(4,1fr)_110px] gap-2 border-b border-slate-200 pb-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Módulo
                      </div>

                      {permissionLabels.map(
                        (
                          permission
                        ) => (
                          <div
                            key={
                              permission.key
                            }
                            className="text-center text-xs font-bold uppercase tracking-wide text-slate-400"
                          >
                            {
                              permission.title
                            }
                          </div>
                        )
                      )}

                      <div className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
                        Todos
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {moduleItems.map(
                        (
                          module
                        ) => {
                          const permissions =
                            profile.modules[
                              module.key
                            ];

                          const supportedActions =
                            supportedActionsByModule[
                              module.key
                            ];

                          const allEnabled =
                            supportedActions.every(
                              (action) =>
                                permissions[action]
                            );

                          return (
                            <div
                              key={
                                module.key
                              }
                              className="grid grid-cols-[260px_repeat(4,1fr)_110px] items-center gap-2 py-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  {
                                    module.icon
                                  }
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {
                                      module.title
                                    }
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-400">
                                    {
                                      module.description
                                    }
                                  </p>
                                </div>
                              </div>

                              {permissionLabels.map(
                                (
                                  permission
                                ) => {
                                  const supported =
                                    supportedActions.includes(
                                      permission.key
                                    );

                                  return (
                                    <div
                                      key={
                                        permission.key
                                      }
                                      className="flex justify-center"
                                    >
                                      {supported ? (
                                        <PermissionCheckbox
                                          checked={
                                            permissions[
                                              permission.key
                                            ]
                                          }

                                          disabled={
                                            profile.name === "Gestor"
                                          }

                                          onChange={(
                                            value
                                          ) =>
                                            updatePermission(
                                              profile,
                                              module.key,
                                              permission.key,
                                              value
                                            )
                                          }
                                        />
                                      ) : (
                                        <span className="text-slate-300">—</span>
                                      )}
                                    </div>
                                  );
                                }
                              )}

                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleFullModule(
                                      profile,
                                      module.key
                                    )
                                  }
                                  disabled={
                                    profile.name === "Gestor"
                                  }
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                    allEnabled
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-slate-100 text-slate-500"
                                  } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                  {allEnabled
                                    ? "Completo"
                                    : "Liberar"}
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {profile.systemProfile && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    {profile.name === "Gestor"
                      ? "O perfil Gestor é a conta de segurança do sistema e mantém acesso completo para evitar bloqueio administrativo."
                      : "Este é um perfil padrão do sistema. O nome não pode ser alterado, mas suas permissões podem ser personalizadas."}
                  </div>
                )}
              </div>
            </PageCard>
          )
        )}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Controle de acesso
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              As permissões configuradas aqui são aplicadas imediatamente aos menus e às rotas protegidas do sistema. Os quatro perfis correspondem diretamente às áreas disponíveis no login.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function PermissionCheckbox({
  checked,
  disabled = false,
  onChange,
}: {
  checked:
    boolean;

  disabled?:
    boolean;

  onChange:
    (
      value:
        boolean
    ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={
          checked
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {
          value
        }
      </p>
    </div>
  );
}
