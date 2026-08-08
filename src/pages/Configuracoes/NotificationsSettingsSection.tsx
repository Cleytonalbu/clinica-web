import {
  Bell,
  Mail,
  MessageCircle,
  Smartphone,
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
  NotificationRuleSetting,
  NotificationSettings,
} from "./settingsStorage";

interface Props {
  settings:
    NotificationSettings;

  onChange:
    (
      settings:
        NotificationSettings
    ) => void;
}

export default function NotificationsSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof NotificationSettings
  >(
    field: K,
    value:
      NotificationSettings[K]
  ) {
    onChange({
      ...settings,

      [field]:
        value,
    });
  }

  function updateRule(
    id: number,
    data:
      Partial<NotificationRuleSetting>
  ) {
    onChange({
      ...settings,

      rules:
        settings.rules.map(
          (
            rule
          ) =>
            rule.id === id
              ? {
                  ...rule,

                  ...data,
                }
              : rule
        ),
    });
  }

  function toggleChannel(
    rule:
      NotificationRuleSetting,

    channel:
      keyof NotificationRuleSetting["channels"]
  ) {
    updateRule(
      rule.id,
      {
        channels: {
          ...rule.channels,

          [channel]:
            !rule.channels[
              channel
            ],
        },
      }
    );
  }

  const activeRules =
    settings.rules.filter(
      (
        rule
      ) =>
        rule.active
    ).length;

  const whatsappRules =
    settings.rules.filter(
      (
        rule
      ) =>
        rule.active &&
        rule.channels.whatsapp
    ).length;

  const emailRules =
    settings.rules.filter(
      (
        rule
      ) =>
        rule.active &&
        rule.channels.email
    ).length;

  const pushRules =
    settings.rules.filter(
      (
        rule
      ) =>
        rule.active &&
        rule.channels.push
    ).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Regras ativas"
          value={String(
            activeRules
          )}
        />

        <SummaryCard
          title="WhatsApp"
          value={String(
            whatsappRules
          )}
        />

        <SummaryCard
          title="E-mail"
          value={String(
            emailRules
          )}
        />

        <SummaryCard
          title="Push"
          value={String(
            pushRules
          )}
        />
      </div>

      <PageCard
        title="Canais de Notificação"
        description="Defina quais meios de comunicação estarão disponíveis para a clínica."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ChannelCard
            icon={
              <MessageCircle
                size={22}
              />
            }

            title="WhatsApp"

            description="Mensagens enviadas para o número cadastrado do responsável."

            checked={
              settings.enableWhatsApp
            }

            onChange={(
              value
            ) =>
              updateField(
                "enableWhatsApp",
                value
              )
            }
          />

          <ChannelCard
            icon={
              <Mail
                size={22}
              />
            }

            title="E-mail"

            description="Avisos enviados para o endereço eletrônico cadastrado."

            checked={
              settings.enableEmail
            }

            onChange={(
              value
            ) =>
              updateField(
                "enableEmail",
                value
              )
            }
          />

          <ChannelCard
            icon={
              <Smartphone
                size={22}
              />
            }

            title="Push do aplicativo"

            description="Notificações exibidas diretamente no aplicativo dos responsáveis."

            checked={
              settings.enablePush
            }

            onChange={(
              value
            ) =>
              updateField(
                "enablePush",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Tipos de Notificação"
        description="Configure quando cada notificação deve ser enviada e por quais canais."
      >
        <div className="space-y-5">
          {settings.rules.map(
            (
              rule
            ) => (
              <div
                key={
                  rule.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        rule.active
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Bell
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        {
                          rule.title
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          rule.description
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateRule(
                        rule.id,
                        {
                          active:
                            !rule.active,
                        }
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      rule.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {rule.active
                      ? "Ativa"
                      : "Inativa"}
                  </button>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-700">
                    Canais utilizados
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <ChannelButton
                      label="WhatsApp"

                      active={
                        rule.channels.whatsapp
                      }

                      disabled={
                        !settings.enableWhatsApp ||
                        !rule.active
                      }

                      onClick={() =>
                        toggleChannel(
                          rule,
                          "whatsapp"
                        )
                      }
                    />

                    <ChannelButton
                      label="E-mail"

                      active={
                        rule.channels.email
                      }

                      disabled={
                        !settings.enableEmail ||
                        !rule.active
                      }

                      onClick={() =>
                        toggleChannel(
                          rule,
                          "email"
                        )
                      }
                    />

                    <ChannelButton
                      label="Push"

                      active={
                        rule.channels.push
                      }

                      disabled={
                        !settings.enablePush ||
                        !rule.active
                      }

                      onClick={() =>
                        toggleChannel(
                          rule,
                          "push"
                        )
                      }
                    />
                  </div>
                </div>

                {rule.advanceHours !==
                  undefined && (
                  <div className="mt-5 max-w-xs">
                    <FormField
                      label="Antecedência"
                    >
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          value={
                            rule.advanceHours
                          }
                          disabled={
                            !rule.active
                          }
                          onChange={(
                            event
                          ) =>
                            updateRule(
                              rule.id,
                              {
                                advanceHours:
                                  Math.max(
                                    Number(
                                      event.target.value
                                    ) ||
                                      0,
                                    0
                                  ),
                              }
                            )
                          }
                          className="pr-16"
                        />

                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          horas
                        </span>
                      </div>
                    </FormField>
                  </div>
                )}

                <div className="mt-5">
                  <FormField
                    label="Mensagem padrão"
                  >
                    <textarea
                      value={
                        rule.message
                      }
                      disabled={
                        !rule.active
                      }
                      onChange={(
                        event
                      ) =>
                        updateRule(
                          rule.id,
                          {
                            message:
                              event.target.value,
                          }
                        )
                      }
                      maxLength={
                        600
                      }
                      className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </FormField>

                  <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Variáveis disponíveis
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <VariableTag
                        value="{responsavel}"
                      />

                      <VariableTag
                        value="{paciente}"
                      />

                      <VariableTag
                        value="{profissional}"
                      />

                      <VariableTag
                        value="{data}"
                      />

                      <VariableTag
                        value="{hora}"
                      />

                      <VariableTag
                        value="{valor}"
                      />

                      <VariableTag
                        value="{vencimento}"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Preferências Gerais"
        description="Defina regras globais para o envio das notificações."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Responsável pode desativar notificações"

            description="Permite que o responsável controle preferências de comunicação pelo aplicativo."

            checked={
              settings.responsibleCanDisableNotifications
            }

            onChange={(
              value
            ) =>
              updateField(
                "responsibleCanDisableNotifications",
                value
              )
            }
          />

          <BooleanSetting
            title="Enviar somente em horário comercial"

            description="Evita disparos automáticos fora do período definido pela clínica."

            checked={
              settings.sendOnlyDuringBusinessHours
            }

            onChange={(
              value
            ) =>
              updateField(
                "sendOnlyDuringBusinessHours",
                value
              )
            }
          />
        </div>

        {settings.sendOnlyDuringBusinessHours && (
          <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <FormField
              label="Início dos envios"
            >
              <Input
                type="time"
                value={
                  settings.businessHourStart
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "businessHourStart",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Fim dos envios"
            >
              <Input
                type="time"
                value={
                  settings.businessHourEnd
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "businessHourEnd",
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        )}
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <Bell
            size={21}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Central de notificações
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              As regras configuradas aqui serão utilizadas pela Agenda, Financeiro e aplicativo dos responsáveis. O envio real por WhatsApp, e-mail e push será conectado posteriormente à API.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ChannelCard({
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
    (
      value:
        boolean
    ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked
        )
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

      <p className="mt-4 font-bold text-slate-900">
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
          ? "Canal ativo"
          : "Canal inativo"}
      </p>
    </button>
  );
}

function ChannelButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label:
    string;

  active:
    boolean;

  disabled:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
          : active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {
        label
      }
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

function VariableTag({
  value,
}: {
  value:
    string;
}) {
  return (
    <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-600">
      {
        value
      }
    </span>
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