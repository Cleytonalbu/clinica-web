import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Smartphone,
  UserRound,
} from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  ReactNode,
} from "react";

import type {
  ResponsibleAppModules,
  ResponsibleAppPermissions,
  ResponsibleAppSettings,
} from "./settingsStorage";

interface Props {
  settings:
    ResponsibleAppSettings;

  onChange:
    (
      settings:
        ResponsibleAppSettings
    ) => void;
}

const moduleItems: {
  key:
    keyof ResponsibleAppModules;

  title:
    string;

  description:
    string;

  icon:
    ReactNode;
}[] = [
  {
    key: "agenda",

    title: "Agenda",

    description:
      "Próximos atendimentos, datas e horários.",

    icon:
      <CalendarDays
        size={20}
      />,
  },



  {
    key: "documents",

    title: "Documentos",

    description:
      "Arquivos, relatórios e documentos disponibilizados.",

    icon:
      <FileText
        size={20}
      />,
  },

  {
    key: "notifications",

    title: "Notificações",

    description:
      "Central de avisos e comunicados do aplicativo.",

    icon:
      <Bell
        size={20}
      />,
  },

  {
    key: "observations",

    title: "Observações",

    description:
      "Observações compartilhadas com os responsáveis.",

    icon:
      <ClipboardList
        size={20}
      />,
  },

  {
    key: "therapeuticSummary",

    title: "Resumo terapêutico",

    description:
      "Informações resumidas sobre acompanhamento e progresso.",

    icon:
      <HeartPulse
        size={20}
      />,
  },

  {
    key: "professionals",

    title: "Profissionais",

    description:
      "Exibe a equipe vinculada ao paciente.",

    icon:
      <UserRound
        size={20}
      />,
  },
];

const permissionItems: {
  key:
    keyof ResponsibleAppPermissions;

  title:
    string;

  description:
    string;
}[] = [
  {
    key:
      "confirmAppointment",

    title:
      "Confirmar atendimento",

    description:
      "Responsável pode confirmar presença pelo aplicativo.",
  },

  {
    key:
      "requestReschedule",

    title:
      "Solicitar reagendamento",

    description:
      "Permite solicitar nova data ou horário.",
  },

  {
    key:
      "requestCancellation",

    title:
      "Solicitar cancelamento",

    description:
      "Permite solicitar cancelamento de um atendimento.",
  },

  {
    key:
      "downloadDocuments",

    title:
      "Baixar documentos",

    description:
      "Permite baixar documentos liberados pela clínica.",
  },

  {
    key:
      "downloadAttachments",

    title:
      "Baixar anexos",

    description:
      "Permite baixar materiais e anexos disponibilizados.",
  },





  {
    key:
      "viewProfessionalName",

    title:
      "Visualizar profissional",

    description:
      "Exibe o nome do profissional responsável pelo atendimento.",
  },

  {
    key:
      "viewSpecialtyName",

    title:
      "Visualizar especialidade",

    description:
      "Exibe a especialidade vinculada ao atendimento.",
  },

  {
    key:
      "viewClinicalObservations",

    title:
      "Visualizar observações clínicas",

    description:
      "Exibe somente observações liberadas para os responsáveis.",
  },

  {
    key:
      "viewTherapeuticProgress",

    title:
      "Visualizar progresso terapêutico",

    description:
      "Permite visualizar informações resumidas da evolução do paciente.",
  },
];

export default function ResponsibleAppSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof ResponsibleAppSettings
  >(
    field: K,
    value:
      ResponsibleAppSettings[K]
  ) {
    onChange({
      ...settings,

      [field]:
        value,
    });
  }

  function toggleModule(
    key:
      keyof ResponsibleAppModules
  ) {
    onChange({
      ...settings,

      modules: {
        ...settings.modules,

        [key]:
          !settings.modules[
            key
          ],
      },
    });
  }

  function togglePermission(
    key:
      keyof ResponsibleAppPermissions
  ) {
    onChange({
      ...settings,

      permissions: {
        ...settings.permissions,

        [key]:
          !settings.permissions[
            key
          ],
      },
    });
  }

  const activeModules =
    Object.values(
      settings.modules
    ).filter(
      Boolean
    ).length;

  const activePermissions =
    Object.values(
      settings.permissions
    ).filter(
      Boolean
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Status do aplicativo"

          value={
            settings.enabled
              ? "Ativo"
              : "Inativo"
          }
        />

        <SummaryCard
          title="Módulos ativos"

          value={String(
            activeModules
          )}
        />

        <SummaryCard
          title="Permissões liberadas"

          value={String(
            activePermissions
          )}
        />

        <SummaryCard
          title="Sessão"

          value={`${settings.sessionTimeoutMinutes} min`}
        />
      </div>

      <PageCard
        title="Aplicativo dos Responsáveis"
        description="Defina as configurações gerais do aplicativo utilizado pelos pais e responsáveis."
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <FormField
              label="Nome do aplicativo"
            >
              <Input
                value={
                  settings.appName
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "appName",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Mensagem de boas-vindas"
            >
              <textarea
                value={
                  settings.welcomeMessage
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "welcomeMessage",
                    event.target.value
                  )
                }
                maxLength={300}
                className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                label="Telefone de suporte"
              >
                <Input
                  value={
                    settings.supportPhone
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "supportPhone",
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField
                label="E-mail de suporte"
              >
                <Input
                  type="email"
                  value={
                    settings.supportEmail
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "supportEmail",
                      event.target.value
                    )
                  }
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <BooleanSetting
              title="Aplicativo ativo"

              description="Libera o acesso dos responsáveis ao aplicativo."

              checked={
                settings.enabled
              }

              onChange={(
                value
              ) =>
                updateField(
                  "enabled",
                  value
                )
              }
            />

            <BooleanSetting
              title="Exibir logo da clínica"

              description="Mostra a identidade visual no aplicativo."

              checked={
                settings.showClinicLogo
              }

              onChange={(
                value
              ) =>
                updateField(
                  "showClinicLogo",
                  value
                )
              }
            />

            <BooleanSetting
              title="Exibir foto do paciente"

              description="Mostra a foto cadastrada do paciente no perfil."

              checked={
                settings.showPatientPhoto
              }

              onChange={(
                value
              ) =>
                updateField(
                  "showPatientPhoto",
                  value
                )
              }
            />
          </div>
        </div>
      </PageCard>

      <PageCard
        title="Módulos Disponíveis"
        description="Escolha quais áreas aparecerão no menu do aplicativo."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleItems.map(
            (
              item
            ) => (
              <ModuleCard
                key={
                  item.key
                }

                icon={
                  item.icon
                }

                title={
                  item.title
                }

                description={
                  item.description
                }

                checked={
                  settings.modules[
                    item.key
                  ]
                }

                onChange={() =>
                  toggleModule(
                    item.key
                  )
                }
              />
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Permissões dos Responsáveis"
        description="Defina quais ações podem ser realizadas diretamente pelo aplicativo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {permissionItems.map(
            (
              item
            ) => (
              <BooleanSetting
                key={
                  item.key
                }

                title={
                  item.title
                }

                description={
                  item.description
                }

                checked={
                  settings.permissions[
                    item.key
                  ]
                }

                onChange={() =>
                  togglePermission(
                    item.key
                  )
                }
              />
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Tela Inicial"
        description="Defina quais informações terão destaque assim que o responsável abrir o aplicativo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <BooleanSetting
            title="Próximo atendimento"

            description="Exibe o próximo compromisso do paciente na tela inicial."

            checked={
              settings.showNextAppointmentOnHome
            }

            onChange={(
              value
            ) =>
              updateField(
                "showNextAppointmentOnHome",
                value
              )
            }
          />

          <BooleanSetting
            title="Notificações não lidas"

            description="Mostra avisos pendentes logo na página inicial."

            checked={
              settings.showUnreadNotificationsOnHome
            }

            onChange={(
              value
            ) =>
              updateField(
                "showUnreadNotificationsOnHome",
                value
              )
            }
          />

          <BooleanSetting
            title="Valores financeiros"

            description="Mostra saldo ou pendências financeiras diretamente na página inicial."

            checked={
              settings.showFinancialValuesOnHome
            }

            onChange={(
              value
            ) =>
              updateField(
                "showFinancialValuesOnHome",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Segurança e Acesso"
        description="Configure as regras de autenticação do aplicativo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Login com biometria"

            description="Permite utilizar Face ID, Touch ID ou biometria compatível."

            checked={
              settings.allowBiometricLogin
            }

            onChange={(
              value
            ) =>
              updateField(
                "allowBiometricLogin",
                value
              )
            }
          />

          <BooleanSetting
            title="Recuperação de senha"

            description="Permite recuperar o acesso pelo próprio aplicativo."

            checked={
              settings.allowPasswordRecovery
            }

            onChange={(
              value
            ) =>
              updateField(
                "allowPasswordRecovery",
                value
              )
            }
          />
        </div>

        <div className="mt-5 max-w-sm">
          <FormField
            label="Tempo para expirar a sessão"
          >
            <Select
              value={String(
                settings.sessionTimeoutMinutes
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "sessionTimeoutMinutes",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="15">
                15 minutos
              </option>

              <option value="30">
                30 minutos
              </option>

              <option value="60">
                1 hora
              </option>

              <option value="120">
                2 horas
              </option>

              <option value="240">
                4 horas
              </option>

              <option value="480">
                8 horas
              </option>
            </Select>
          </FormField>
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <Smartphone
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Configuração central do aplicativo
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Essas opções serão utilizadas para controlar dinamicamente a interface do aplicativo dos responsáveis. Quando integrarmos o app à API, as permissões cadastradas aqui poderão definir quais telas, informações e ações serão liberadas para cada usuário.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ModuleCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon:
    ReactNode;

  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onChange
      }
      className={`rounded-2xl border p-5 text-left transition ${
        checked
          ? "border-indigo-200 bg-indigo-50/60"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          checked
            ? "bg-white text-indigo-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {
          icon
        }
      </div>

      <p className="mt-4 font-semibold text-slate-900">
        {
          title
        }
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>

      <p
        className={`mt-4 text-xs font-bold ${
          checked
            ? "text-emerald-600"
            : "text-slate-400"
        }`}
      >
        {checked
          ? "Visível no aplicativo"
          : "Oculto no aplicativo"}
      </p>
    </button>
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