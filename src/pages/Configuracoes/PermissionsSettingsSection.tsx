import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
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

  onRemoveProfile:
    (
      id:
        number
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
      "professionals",

    title:
      "Profissionais",

    description:
      "Cadastro e gerenciamento dos profissionais.",

    icon:
      <Stethoscope
        size={18}
      />,
  },

  {
    key:
      "financial",

    title:
      "Financeiro",

    description:
      "Recebimentos, cobranças, carteira e informações financeiras.",

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
      "documents",

    title:
      "Documentos",

    description:
      "Documentos, anexos e arquivos do paciente.",

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
      "delete",

    title:
      "Excluir",
  },

  {
    key:
      "manage",

    title:
      "Gerenciar",
  },
];

export default function PermissionsSettingsSection({
  settings,
  onChange,
  onRemoveProfile,
}: Props) {
  function updateProfile(
    id:
      number,

    data:
      Partial<PermissionProfileSetting>
  ) {
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

        delete:
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
    const permissions =
      profile.modules[
        module
      ];

    const allEnabled =
      Object.values(
        permissions
      ).every(
        Boolean
      );

    updateProfile(
      profile.id,
      {
        modules: {
          ...profile.modules,

          [module]: {
            view:
              !allEnabled,

            create:
              !allEnabled,

            edit:
              !allEnabled,

            delete:
              !allEnabled,

            manage:
              !allEnabled,
          },
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

  const customProfiles =
    settings.profiles.filter(
      (
        profile
      ) =>
        !profile.systemProfile
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          title="Perfis personalizados"

          value={String(
            customProfiles
          )}
        />

        <SummaryCard
          title="Módulos controlados"

          value={String(
            moduleItems.length
          )}
        />
      </div>

      <PageCard
        title="Regras Gerais de Acesso"
        description="Defina restrições globais aplicadas aos perfis do sistema."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Profissional visualiza apenas seus pacientes"

            description="Limita o profissional aos pacientes vinculados aos seus atendimentos."

            checked={
              settings.restrictProfessionalsToOwnPatients
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                restrictProfessionalsToOwnPatients:
                  value,
              })
            }
          />

          <BooleanSetting
            title="Profissional visualiza apenas sua agenda"

            description="Oculta os atendimentos de outros profissionais."

            checked={
              settings.restrictProfessionalsToOwnAgenda
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                restrictProfessionalsToOwnAgenda:
                  value,
              })
            }
          />

          <BooleanSetting
            title="Profissional visualiza apenas suas evoluções"

            description="Impede acesso às evoluções registradas por outros profissionais."

            checked={
              settings.restrictProfessionalsToOwnEvolutions
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                restrictProfessionalsToOwnEvolutions:
                  value,
              })
            }
          />

          <BooleanSetting
            title="Ocultar valores financeiros dos profissionais"

            description="Não exibe valores de consultas, cobranças ou faturamento para o perfil profissional."

            checked={
              settings.hideFinancialValuesFromProfessionals
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                hideFinancialValuesFromProfessionals:
                  value,
              })
            }
          />

          <BooleanSetting
            title="Recepção pode visualizar dados clínicos"

            description="Libera acesso da recepção a informações clínicas do prontuário."

            checked={
              settings.allowReceptionToViewClinicalData
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                allowReceptionToViewClinicalData:
                  value,
              })
            }
          />

          <BooleanSetting
            title="Recepção pode editar cadastro do paciente"

            description="Permite atualizar dados pessoais e informações administrativas do paciente."

            checked={
              settings.allowReceptionToEditPatientData
            }

            onChange={(
              value
            ) =>
              onChange({
                ...settings,

                allowReceptionToEditPatientData:
                  value,
              })
            }
          />
        </div>
      </PageCard>

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
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        profile.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {profile.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>

                    {!profile.systemProfile && (
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveProfile(
                            profile.id
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[260px_repeat(5,1fr)_110px] gap-2 border-b border-slate-200 pb-3">
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

                          const allEnabled =
                            Object.values(
                              permissions
                            ).every(
                              Boolean
                            );

                          return (
                            <div
                              key={
                                module.key
                              }
                              className="grid grid-cols-[260px_repeat(5,1fr)_110px] items-center gap-2 py-4"
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
                                ) => (
                                  <div
                                    key={
                                      permission.key
                                    }
                                    className="flex justify-center"
                                  >
                                    <PermissionCheckbox
                                      checked={
                                        permissions[
                                          permission.key
                                        ]
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
                                  </div>
                                )
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
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                    allEnabled
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
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
                    Este é um perfil padrão do sistema. O nome não pode ser alterado, mas suas permissões podem ser personalizadas.
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
              As permissões configuradas aqui serão utilizadas posteriormente pelo login e pelas rotas protegidas do sistema. Isso permitirá ocultar menus, bloquear telas e impedir ações não autorizadas de acordo com o perfil do usuário.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function PermissionCheckbox({
  checked,
  onChange,
}: {
  checked:
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
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
    </label>
  );
}

function BooleanSetting({
  title,
  description,
  checked,
  onChange,
}: {
  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    (
      value:
        boolean
    ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {
            title
          }
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {
            description
          }
        </p>
      </div>

      <span
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={
            checked
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.checked
            )
          }
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
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