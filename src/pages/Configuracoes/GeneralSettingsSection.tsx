import {
  Bell,
  Clock3,
  DatabaseBackup,
  Eye,
  History,
  KeyRound,
  LayoutPanelLeft,
  LockKeyhole,
  MonitorCog,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  GeneralSettings,
} from "./settingsStorage";

interface Props {
  settings:
    GeneralSettings;

  onChange:
    (
      settings:
        GeneralSettings
    ) => void;
}

export default function GeneralSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof GeneralSettings
  >(
    field:
      K,

    value:
      GeneralSettings[K]
  ) {
    onChange({
      ...settings,

      [field]:
        value,
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Idioma"
          value={
            settings.language ===
            "pt-BR"
              ? "Português"
              : settings.language ===
                "en-US"
              ? "English"
              : "Español"
          }
        />

        <SummaryCard
          title="Tema"
          value={
            settings.theme ===
            "light"
              ? "Claro"
              : settings.theme ===
                "dark"
              ? "Escuro"
              : "Sistema"
          }
        />

        <SummaryCard
          title="Sessão"
          value={
            settings.enableSessionTimeout
              ? `${settings.sessionTimeoutMinutes} min`
              : "Sem limite"
          }
        />

        <SummaryCard
          title="Auditoria"
          value={
            settings.enableAuditLog
              ? "Ativa"
              : "Inativa"
          }
        />
      </div>

      <PageCard
        title="Idioma e Formatação"
        description="Defina como datas, horários e idioma serão apresentados no sistema."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <FormField
            label="Idioma"
          >
            <Select
              value={
                settings.language
              }
              onChange={(
                event
              ) =>
                updateField(
                  "language",
                  event.target.value as GeneralSettings["language"]
                )
              }
            >
              <option value="pt-BR">
                Português - Brasil
              </option>

              <option value="en-US">
                English
              </option>

              <option value="es">
                Español
              </option>
            </Select>
          </FormField>

          <FormField
            label="Tema"
          >
            <Select
              value={
                settings.theme
              }
              onChange={(
                event
              ) =>
                updateField(
                  "theme",
                  event.target.value as GeneralSettings["theme"]
                )
              }
            >
              <option value="light">
                Claro
              </option>

              <option value="dark">
                Escuro
              </option>

              <option value="system">
                Seguir sistema
              </option>
            </Select>
          </FormField>

          <FormField
            label="Formato da data"
          >
            <Select
              value={
                settings.dateFormat
              }
              onChange={(
                event
              ) =>
                updateField(
                  "dateFormat",
                  event.target.value as GeneralSettings["dateFormat"]
                )
              }
            >
              <option value="DD/MM/YYYY">
                DD/MM/AAAA
              </option>

              <option value="MM/DD/YYYY">
                MM/DD/AAAA
              </option>

              <option value="YYYY-MM-DD">
                AAAA-MM-DD
              </option>
            </Select>
          </FormField>

          <FormField
            label="Formato da hora"
          >
            <Select
              value={
                settings.timeFormat
              }
              onChange={(
                event
              ) =>
                updateField(
                  "timeFormat",
                  event.target.value as GeneralSettings["timeFormat"]
                )
              }
            >
              <option value="24h">
                24 horas
              </option>

              <option value="12h">
                12 horas
              </option>
            </Select>
          </FormField>

          <FormField
            label="Fuso horário"
          >
            <Select
              value={
                settings.timezone
              }
              onChange={(
                event
              ) =>
                updateField(
                  "timezone",
                  event.target.value
                )
              }
            >
              <option value="America/Sao_Paulo">
                Brasília
              </option>

              <option value="America/Manaus">
                Manaus
              </option>

              <option value="America/Rio_Branco">
                Acre
              </option>
            </Select>
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Interface"
        description="Configure o comportamento visual e a navegação da plataforma."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <LayoutPanelLeft
                size={18}
              />
            }
            title="Menu lateral compacto"
            description="Reduz o tamanho do menu principal."
            checked={
              settings.compactSidebar
            }
            onChange={(
              value
            ) =>
              updateField(
                "compactSidebar",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <History
                size={18}
              />
            }
            title="Lembrar última página"
            description="Ao entrar novamente, retorna para a última tela utilizada."
            checked={
              settings.rememberLastPage
            }
            onChange={(
              value
            ) =>
              updateField(
                "rememberLastPage",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <Eye
                size={18}
              />
            }
            title="Exibir caminho de navegação"
            description="Mostra breadcrumbs nas páginas internas."
            checked={
              settings.showBreadcrumbs
            }
            onChange={(
              value
            ) =>
              updateField(
                "showBreadcrumbs",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <Settings
                size={18}
              />
            }
            title="Exibir ações rápidas"
            description="Mostra atalhos para tarefas frequentes."
            checked={
              settings.showQuickActions
            }
            onChange={(
              value
            ) =>
              updateField(
                "showQuickActions",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <MonitorCog
                size={18}
              />
            }
            title="Mensagem de boas-vindas"
            description="Exibe uma mensagem ao entrar no sistema."
            checked={
              settings.showWelcomeMessage
            }
            onChange={(
              value
            ) =>
              updateField(
                "showWelcomeMessage",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Comportamento do Sistema"
        description="Configure confirmações e salvamento automático."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <TriangleAlert
                size={18}
              />
            }
            title="Confirmar antes de excluir"
            description="Solicita confirmação antes de remover registros."
            checked={
              settings.confirmBeforeDelete
            }
            onChange={(
              value
            ) =>
              updateField(
                "confirmBeforeDelete",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <LockKeyhole
                size={18}
              />
            }
            title="Confirmar antes de sair"
            description="Solicita confirmação antes de encerrar a sessão."
            checked={
              settings.confirmBeforeLogout
            }
            onChange={(
              value
            ) =>
              updateField(
                "confirmBeforeLogout",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <Save
                size={18}
              />
            }
            title="Salvar formulários automaticamente"
            description="Salva rascunhos enquanto o usuário preenche formulários."
            checked={
              settings.autosaveForms
            }
            onChange={(
              value
            ) =>
              updateField(
                "autosaveForms",
                value
              )
            }
          />
        </div>

        {settings.autosaveForms && (
          <div className="mt-5 max-w-sm rounded-2xl bg-slate-50 p-5">
            <FormField
              label="Intervalo do salvamento automático"
            >
              <Select
                value={String(
                  settings.autosaveIntervalSeconds
                )}
                onChange={(
                  event
                ) =>
                  updateField(
                    "autosaveIntervalSeconds",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value="15">
                  A cada 15 segundos
                </option>

                <option value="30">
                  A cada 30 segundos
                </option>

                <option value="60">
                  A cada 1 minuto
                </option>

                <option value="120">
                  A cada 2 minutos
                </option>

                <option value="300">
                  A cada 5 minutos
                </option>
              </Select>
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Sessão e Acesso"
        description="Configure o tempo de inatividade e encerramento automático da sessão."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <Clock3
                size={18}
              />
            }
            title="Encerrar sessão por inatividade"
            description="Desconecta usuários que permanecerem inativos."
            checked={
              settings.enableSessionTimeout
            }
            onChange={(
              value
            ) =>
              updateField(
                "enableSessionTimeout",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <Bell
                size={18}
              />
            }
            title="Avisar antes de encerrar"
            description="Mostra um aviso antes da sessão expirar."
            checked={
              settings.warnBeforeSessionTimeout
            }
            disabled={
              !settings.enableSessionTimeout
            }
            onChange={(
              value
            ) =>
              updateField(
                "warnBeforeSessionTimeout",
                value
              )
            }
          />
        </div>

        {settings.enableSessionTimeout && (
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <FormField
              label="Tempo máximo de inatividade"
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

            <FormField
              label="Avisar com antecedência"
            >
              <Select
                disabled={
                  !settings.warnBeforeSessionTimeout
                }
                value={String(
                  settings.sessionTimeoutWarningMinutes
                )}
                onChange={(
                  event
                ) =>
                  updateField(
                    "sessionTimeoutWarningMinutes",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value="1">
                  1 minuto
                </option>

                <option value="5">
                  5 minutos
                </option>

                <option value="10">
                  10 minutos
                </option>

                <option value="15">
                  15 minutos
                </option>
              </Select>
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Política de Senhas"
        description="Defina requisitos mínimos para as senhas dos usuários."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <KeyRound
                size={18}
              />
            }
            title="Exigir troca periódica de senha"
            description="Solicita uma nova senha após o período definido."
            checked={
              settings.forcePasswordChange
            }
            onChange={(
              value
            ) =>
              updateField(
                "forcePasswordChange",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <ShieldCheck
                size={18}
              />
            }
            title="Exigir letra maiúscula"
            description="A senha deve conter pelo menos uma letra maiúscula."
            checked={
              settings.requireUppercasePassword
            }
            onChange={(
              value
            ) =>
              updateField(
                "requireUppercasePassword",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <ShieldCheck
                size={18}
              />
            }
            title="Exigir número"
            description="A senha deve conter pelo menos um número."
            checked={
              settings.requireNumberPassword
            }
            onChange={(
              value
            ) =>
              updateField(
                "requireNumberPassword",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <ShieldCheck
                size={18}
              />
            }
            title="Exigir caractere especial"
            description="A senha deve conter um símbolo especial."
            checked={
              settings.requireSpecialCharacterPassword
            }
            onChange={(
              value
            ) =>
              updateField(
                "requireSpecialCharacterPassword",
                value
              )
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
          <FormField
            label="Tamanho mínimo da senha"
          >
            <Select
              value={String(
                settings.minimumPasswordLength
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "minimumPasswordLength",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="6">
                6 caracteres
              </option>

              <option value="8">
                8 caracteres
              </option>

              <option value="10">
                10 caracteres
              </option>

              <option value="12">
                12 caracteres
              </option>
            </Select>
          </FormField>

          <FormField
            label="Expiração da senha"
          >
            <Select
              disabled={
                !settings.forcePasswordChange
              }
              value={String(
                settings.passwordExpirationDays
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "passwordExpirationDays",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="30">
                30 dias
              </option>

              <option value="60">
                60 dias
              </option>

              <option value="90">
                90 dias
              </option>

              <option value="180">
                180 dias
              </option>
            </Select>
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Segurança de Login"
        description="Defina regras adicionais para proteger as contas dos usuários."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <ShieldCheck
                size={18}
              />
            }
            title="Autenticação em dois fatores"
            description="Exige uma segunda etapa de autenticação."
            checked={
              settings.enableTwoFactorAuthentication
            }
            onChange={(
              value
            ) =>
              updateField(
                "enableTwoFactorAuthentication",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <LockKeyhole
                size={18}
              />
            }
            title="Registrar tentativas de login"
            description="Mantém registro das tentativas de acesso malsucedidas."
            checked={
              settings.logFailedLoginAttempts
            }
            onChange={(
              value
            ) =>
              updateField(
                "logFailedLoginAttempts",
                value
              )
            }
          />
        </div>

        {settings.logFailedLoginAttempts && (
          <div className="mt-5 max-w-sm rounded-2xl bg-slate-50 p-5">
            <FormField
              label="Máximo de tentativas"
            >
              <Select
                value={String(
                  settings.maxFailedLoginAttempts
                )}
                onChange={(
                  event
                ) =>
                  updateField(
                    "maxFailedLoginAttempts",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value="3">
                  3 tentativas
                </option>

                <option value="5">
                  5 tentativas
                </option>

                <option value="10">
                  10 tentativas
                </option>
              </Select>
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Auditoria"
        description="Defina quais ações serão registradas para rastreabilidade."
      >
        <BooleanSetting
          icon={
            <History
              size={18}
            />
          }
          title="Ativar auditoria"
          description="Mantém registro das principais ações realizadas no sistema."
          checked={
            settings.enableAuditLog
          }
          onChange={(
            value
          ) =>
            updateField(
              "enableAuditLog",
              value
            )
          }
        />

        {settings.enableAuditLog && (
          <>
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <BooleanSetting
                title="Registrar logins"
                description="Registra entradas e saídas do sistema."
                checked={
                  settings.auditLoginEvents
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "auditLoginEvents",
                    value
                  )
                }
              />

              <BooleanSetting
                title="Registrar alterações"
                description="Registra mudanças em dados e cadastros."
                checked={
                  settings.auditDataChanges
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "auditDataChanges",
                    value
                  )
                }
              />

              <BooleanSetting
                title="Registrar exclusões"
                description="Mantém histórico das exclusões realizadas."
                checked={
                  settings.auditDeletes
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "auditDeletes",
                    value
                  )
                }
              />

              <BooleanSetting
                title="Registrar exportações"
                description="Registra downloads e exportações de dados."
                checked={
                  settings.auditExports
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "auditExports",
                    value
                  )
                }
              />

              <BooleanSetting
                title="Registrar alterações de configuração"
                description="Registra mudanças nas configurações do sistema."
                checked={
                  settings.auditConfigurationChanges
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "auditConfigurationChanges",
                    value
                  )
                }
              />
            </div>

            <div className="mt-5 max-w-sm">
              <FormField
                label="Manter auditoria por"
              >
                <Select
                  value={String(
                    settings.auditRetentionDays
                  )}
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "auditRetentionDays",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  <option value="90">
                    90 dias
                  </option>

                  <option value="180">
                    180 dias
                  </option>

                  <option value="365">
                    1 ano
                  </option>

                  <option value="730">
                    2 anos
                  </option>

                  <option value="1825">
                    5 anos
                  </option>
                </Select>
              </FormField>
            </div>
          </>
        )}
      </PageCard>

      <PageCard
        title="Backup"
        description="Configure a política de cópias de segurança do sistema."
      >
        <BooleanSetting
          icon={
            <DatabaseBackup
              size={18}
            />
          }
          title="Backup automático"
          description="Realiza cópias de segurança periodicamente."
          checked={
            settings.enableAutomaticBackup
          }
          onChange={(
            value
          ) =>
            updateField(
              "enableAutomaticBackup",
              value
            )
          }
        />

        {settings.enableAutomaticBackup && (
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <FormField
              label="Frequência"
            >
              <Select
                value={
                  settings.backupFrequency
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "backupFrequency",
                    event.target.value as GeneralSettings["backupFrequency"]
                  )
                }
              >
                <option value="daily">
                  Diário
                </option>

                <option value="weekly">
                  Semanal
                </option>

                <option value="monthly">
                  Mensal
                </option>
              </Select>
            </FormField>

            <FormField
              label="Manter backups por"
            >
              <Select
                value={String(
                  settings.backupRetentionDays
                )}
                onChange={(
                  event
                ) =>
                  updateField(
                    "backupRetentionDays",
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value="7">
                  7 dias
                </option>

                <option value="15">
                  15 dias
                </option>

                <option value="30">
                  30 dias
                </option>

                <option value="90">
                  90 dias
                </option>
              </Select>
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Manutenção"
        description="Controle o acesso ao sistema durante manutenções programadas."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <MonitorCog
                size={18}
              />
            }
            title="Modo de manutenção"
            description="Bloqueia temporariamente o acesso normal ao sistema."
            checked={
              settings.maintenanceMode
            }
            onChange={(
              value
            ) =>
              updateField(
                "maintenanceMode",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <ShieldCheck
                size={18}
              />
            }
            title="Permitir acesso administrativo"
            description="Administradores continuam acessando durante a manutenção."
            checked={
              settings.allowAdministratorAccessDuringMaintenance
            }
            disabled={
              !settings.maintenanceMode
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowAdministratorAccessDuringMaintenance",
                value
              )
            }
          />
        </div>

        {settings.maintenanceMode && (
          <div className="mt-5">
            <FormField
              label="Mensagem de manutenção"
            >
              <textarea
                value={
                  settings.maintenanceMessage
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "maintenanceMessage",
                    event.target.value
                  )
                }
                className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </FormField>
          </div>
        )}
      </PageCard>

      <PageCard
        title="Atualizações"
        description="Configure o comportamento das atualizações do sistema."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <RefreshCcw
                size={18}
              />
            }
            title="Verificar atualizações automaticamente"
            description="Consulta novas versões disponíveis."
            checked={
              settings.checkForUpdatesAutomatically
            }
            onChange={(
              value
            ) =>
              updateField(
                "checkForUpdatesAutomatically",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <MonitorCog
                size={18}
              />
            }
            title="Exibir versão do sistema"
            description="Mostra a versão instalada na área administrativa."
            checked={
              settings.showSystemVersion
            }
            onChange={(
              value
            ) =>
              updateField(
                "showSystemVersion",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Notificações Internas"
        description="Configure alertas exibidos dentro da plataforma."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            icon={
              <Bell
                size={18}
              />
            }
            title="Ativar notificações internas"
            description="Mostra alertas e avisos no sistema."
            checked={
              settings.enableInternalNotifications
            }
            onChange={(
              value
            ) =>
              updateField(
                "enableInternalNotifications",
                value
              )
            }
          />

          <BooleanSetting
            icon={
              <Bell
                size={18}
              />
            }
            title="Som de notificação"
            description="Reproduz som em novos alertas."
            checked={
              settings.enableSoundNotifications
            }
            disabled={
              !settings.enableInternalNotifications
            }
            onChange={(
              value
            ) =>
              updateField(
                "enableSoundNotifications",
                value
              )
            }
          />
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Configurações globais
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Estas configurações controlam o comportamento geral da plataforma. Algumas opções, como backup, autenticação em dois fatores, auditoria e atualizações, serão conectadas posteriormente à API e aos serviços do servidor.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function BooleanSetting({
  icon,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  icon?:
    React.ReactNode;

  title:
    string;

  description:
    string;

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
    <label
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
          : "cursor-pointer border-slate-200 bg-white hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {
              icon
            }
          </div>
        )}

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
          disabled={
            disabled
          }
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