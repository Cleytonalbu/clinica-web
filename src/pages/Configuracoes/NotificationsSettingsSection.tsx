import { Bell, Clock3, Smartphone } from "lucide-react";

import { FormField, Input, PageCard } from "@/components/ui";

import type {
  NotificationRuleSetting,
  NotificationSettings,
} from "./settingsStorage";

interface Props {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
}

function appOnly(settings: NotificationSettings): NotificationSettings {
  return {
    ...settings,
    enableWhatsApp: false,
    enableEmail: false,
    enablePush: true,
    rules: settings.rules.map((rule) => ({
      ...rule,
      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },
    })),
  };
}

export default function NotificationsSettingsSection({
  settings,
  onChange,
}: Props) {
  function update<K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K]
  ) {
    onChange(appOnly({ ...settings, [field]: value }));
  }

  function updateRule(
    id: number,
    patch: Partial<NotificationRuleSetting>
  ) {
    update(
      "rules",
      settings.rules.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Notificações do Aplicativo"
        description="Todos os avisos desta tela são exibidos exclusivamente no aplicativo dos responsáveis."
      >
        <div className="flex items-center gap-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
            <Smartphone size={22} />
          </span>
          <div className="flex-1">
            <p className="font-extrabold text-[#10235f]">Aplicativo dos Responsáveis</p>
            <p className="mt-1 text-sm text-slate-500">Canal único das notificações configuradas abaixo.</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-700">Canal ativo</span>
        </div>
      </PageCard>

      <PageCard
        title="Tipos de Notificação"
        description="Defina quais avisos aparecem no aplicativo e personalize suas mensagens."
      >
        <div className="space-y-4">
          {settings.rules.map((rule) => (
            <article key={rule.id} className={`rounded-2xl border p-5 ${rule.active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-75"}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Bell size={19} /></span>
                  <div><h3 className="font-extrabold text-[#10235f]">{rule.title}</h3><p className="mt-1 text-sm text-slate-500">{rule.description}</p></div>
                </div>
                <button type="button" onClick={() => updateRule(rule.id, { active: !rule.active })} className={`rounded-xl px-4 py-2 text-sm font-semibold ${rule.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{rule.active ? "Ativa" : "Inativa"}</button>
              </div>

              {rule.advanceHours !== undefined && (
                <div className="mt-5 max-w-xs">
                  <FormField label="Antecedência (horas)">
                    <Input type="number" min="0" disabled={!rule.active} value={rule.advanceHours} onChange={(event) => updateRule(rule.id, { advanceHours: Math.max(Number(event.target.value) || 0, 0) })} />
                  </FormField>
                </div>
              )}

              <div className="mt-5">
                <FormField label="Mensagem do aplicativo">
                  <textarea value={rule.message} disabled={!rule.active} maxLength={600} onChange={(event) => updateRule(rule.id, { message: event.target.value })} className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50" />
                </FormField>
                <p className="mt-2 text-xs text-slate-500">Variáveis: {"{responsavel}"}, {"{paciente}"}, {"{profissional}"}, {"{data}"}, {"{hora}"}, {"{valor}"} e {"{vencimento}"}.</p>
              </div>
            </article>
          ))}
        </div>
      </PageCard>

      <PageCard title="Horário dos Avisos" description="Defina quando o aplicativo pode apresentar os avisos automáticos.">
        <button type="button" onClick={() => update("sendOnlyDuringBusinessHours", !settings.sendOnlyDuringBusinessHours)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${settings.sendOnlyDuringBusinessHours ? "border-indigo-200 bg-indigo-50" : "border-slate-200"}`}>
          <Clock3 size={19} className="text-violet-600" />
          <span className="flex-1 font-semibold text-slate-800">Exibir apenas durante o horário configurado</span>
          <span className={settings.sendOnlyDuringBusinessHours ? "text-emerald-600" : "text-slate-400"}>{settings.sendOnlyDuringBusinessHours ? "Ativo" : "Inativo"}</span>
        </button>
        {settings.sendOnlyDuringBusinessHours && (
          <div className="mt-5 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Início"><Input type="time" value={settings.businessHourStart} onChange={(event) => update("businessHourStart", event.target.value)} /></FormField>
            <FormField label="Fim"><Input type="time" value={settings.businessHourEnd} onChange={(event) => update("businessHourEnd", event.target.value)} /></FormField>
          </div>
        )}
      </PageCard>
    </div>
  );
}
