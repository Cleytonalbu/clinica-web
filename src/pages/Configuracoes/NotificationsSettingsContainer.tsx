import {
  useEffect,
} from "react";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Smartphone,
} from "lucide-react";

import type {
  NotificationRuleSetting,
  SystemSettings,
} from "./settingsStorage";

interface Props {
  settings:
    SystemSettings;

  onSettingsChange:
    (
      settings:
        SystemSettings
    ) => void;

  onFeedback:
    (
      message:
        string
    ) => void;
}

const VARIABLES = [
  "{responsavel}",
  "{paciente}",
  "{profissional}",
  "{data}",
  "{hora}",
  "{valor}",
  "{vencimento}",
];

function normalizeAppOnly(
  settings:
    SystemSettings
):
  SystemSettings {
  return {
    ...settings,

    notifications: {
      ...settings.notifications,

      /*
       * REGRA OFICIAL:
       * Configurações > Notificações envia avisos
       * exclusivamente para o Aplicativo dos Responsáveis.
       *
       * Mantemos os campos antigos na estrutura para
       * compatibilidade com dados já salvos, mas eles
       * permanecem sempre desativados.
       */
      enableWhatsApp:
        false,

      enableEmail:
        false,

      enablePush:
        true,

      rules:
        settings.notifications.rules.map(
          (
            rule
          ) => ({
            ...rule,

            channels: {
              whatsapp:
                false,

              email:
                false,

              push:
                true,
            },
          })
        ),
    },
  };
}

export default function NotificationsSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  const notifications =
    settings.notifications;

  /*
   * Faz também a migração das configurações antigas.
   * Se uma instalação ainda possuir WhatsApp/E-mail
   * marcados no localStorage, ao abrir esta tela eles
   * passam para App somente.
   */
  useEffect(
    () => {
      const needsMigration =
        notifications.enableWhatsApp ||
        notifications.enableEmail ||
        !notifications.enablePush ||
        notifications.rules.some(
          (
            rule
          ) =>
            rule.channels.whatsapp ||
            rule.channels.email ||
            !rule.channels.push
        );

      if (
        !needsMigration
      ) {
        return;
      }

      onSettingsChange(
        normalizeAppOnly(
          settings
        )
      );
    },
    [
      notifications,
      onSettingsChange,
      settings,
    ]
  );

  function updateNotifications(
    nextNotifications:
      SystemSettings["notifications"]
  ) {
    onSettingsChange(
      normalizeAppOnly({
        ...settings,

        notifications:
          nextNotifications,
      })
    );
  }

  function updateRule(
    ruleId:
      number,

    patch:
      Partial<
        NotificationRuleSetting
      >
  ) {
    updateNotifications({
      ...notifications,

      rules:
        notifications.rules.map(
          (
            rule
          ) =>
            rule.id ===
            ruleId
              ? {
                  ...rule,
                  ...patch,

                  channels: {
                    whatsapp:
                      false,

                    email:
                      false,

                    push:
                      true,
                  },
                }
              : rule
        ),
    });
  }

  function handleToggleRule(
    rule:
      NotificationRuleSetting
  ) {
    updateRule(
      rule.id,
      {
        active:
          !rule.active,
      }
    );

    onFeedback(
      rule.active
        ? `${rule.title} desativado no aplicativo.`
        : `${rule.title} ativado no aplicativo.`
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Smartphone
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#10235f]">
                Notificações do Aplicativo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure os avisos automáticos exibidos no aplicativo dos responsáveis.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <Smartphone
                    size={21}
                  />
                </div>

                <div>
                  <p className="font-extrabold text-[#10235f]">
                    Aplicativo dos Responsáveis
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Todos os avisos configurados nesta tela serão enviados somente para o app.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                <CheckCircle2
                  size={14}
                />
                Canal ativo
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-[#10235f]">
            Tipos de Notificação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure quando cada aviso deve aparecer no aplicativo dos responsáveis.
          </p>
        </div>

        <div className="space-y-5 p-6">
          {notifications.rules.map(
            (
              rule
            ) => (
              <NotificationRuleCard
                key={
                  rule.id
                }
                rule={
                  rule
                }
                onToggle={() =>
                  handleToggleRule(
                    rule
                  )
                }
                onAdvanceHoursChange={(
                  value
                ) =>
                  updateRule(
                    rule.id,
                    {
                      advanceHours:
                        value,
                    }
                  )
                }
                onMessageChange={(
                  value
                ) =>
                  updateRule(
                    rule.id,
                    {
                      message:
                        value,
                    }
                  )
                }
              />
            )
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Clock3
              size={19}
              className="text-violet-600"
            />

            <div>
              <h2 className="text-lg font-extrabold text-[#10235f]">
                Horário dos avisos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Defina se os avisos automáticos devem respeitar o horário de funcionamento.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={
                notifications.sendOnlyDuringBusinessHours
              }
              onChange={(
                event
              ) =>
                updateNotifications({
                  ...notifications,

                  sendOnlyDuringBusinessHours:
                    event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 accent-violet-600"
            />

            <div>
              <p className="text-sm font-bold text-slate-700">
                Enviar apenas durante o horário configurado
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fora desse período, o aviso poderá aguardar o próximo horário permitido.
              </p>
            </div>
          </label>

          {notifications.sendOnlyDuringBusinessHours && (
            <div className="mt-5 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold text-slate-600">
                  Início
                </span>

                <input
                  type="time"
                  value={
                    notifications.businessHourStart
                  }
                  onChange={(
                    event
                  ) =>
                    updateNotifications({
                      ...notifications,

                      businessHourStart:
                        event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-slate-600">
                  Fim
                </span>

                <input
                  type="time"
                  value={
                    notifications.businessHourEnd
                  }
                  onChange={(
                    event
                  ) =>
                    updateNotifications({
                      ...notifications,

                      businessHourEnd:
                        event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>
            </div>
          )}

          <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-slate-100 pt-5">
            <input
              type="checkbox"
              checked={
                notifications.responsibleCanDisableNotifications
              }
              onChange={(
                event
              ) =>
                updateNotifications({
                  ...notifications,

                  responsibleCanDisableNotifications:
                    event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 accent-violet-600"
            />

            <div>
              <p className="text-sm font-bold text-slate-700">
                Permitir que o responsável desative avisos no aplicativo
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Quando habilitado, o responsável poderá ajustar as preferências de notificações dentro do próprio app.
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}

function NotificationRuleCard({
  rule,
  onToggle,
  onAdvanceHoursChange,
  onMessageChange,
}: {
  rule:
    NotificationRuleSetting;

  onToggle:
    () => void;

  onAdvanceHoursChange:
    (
      value:
        number
    ) => void;

  onMessageChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 transition ${
        rule.active
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50/70 opacity-75"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Bell
              size={19}
            />
          </div>

          <div>
            <h3 className="font-extrabold text-[#10235f]">
              {rule.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {rule.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onToggle
          }
          className={`inline-flex h-9 w-fit items-center rounded-xl px-4 text-xs font-extrabold transition ${
            rule.active
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
          }`}
        >
          {rule.active
            ? "Ativa"
            : "Inativa"}
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-xs font-bold text-slate-600">
          Canal de envio
        </p>

        <div className="mt-3">
          <span className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
            <Smartphone
              size={16}
            />
            Aplicativo
          </span>
        </div>
      </div>

      {rule.advanceHours !==
        undefined && (
        <div className="mt-5 max-w-[290px]">
          <label className="text-xs font-bold text-slate-600">
            Antecedência
          </label>

          <div className="relative mt-2">
            <input
              type="number"
              min={0}
              step={1}
              value={
                rule.advanceHours
              }
              onChange={(
                event
              ) =>
                onAdvanceHoursChange(
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    ) ||
                      0
                  )
                )
              }
              className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-16 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              horas
            </span>
          </div>
        </div>
      )}

      <div className="mt-5">
        <label className="text-xs font-bold text-slate-600">
          Mensagem padrão
        </label>

        <textarea
          value={
            rule.message
          }
          onChange={(
            event
          ) =>
            onMessageChange(
              event.target.value
            )
          }
          rows={4}
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold text-slate-500">
            Variáveis disponíveis
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {VARIABLES.map(
              (
                variable
              ) => (
                <span
                  key={
                    variable
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600"
                >
                  {variable}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
