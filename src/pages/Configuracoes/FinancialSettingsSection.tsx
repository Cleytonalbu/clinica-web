import { Banknote, CircleDollarSign, ReceiptText } from "lucide-react";

import type { ReactNode } from "react";

import { FormField, Input, PageCard, Select } from "@/components/ui";

import type {
  FinancialSettings,
  PaymentMethodSetting,
} from "./settingsStorage";

interface Props {
  settings: FinancialSettings;
  onChange: (settings: FinancialSettings) => void;
}

export default function FinancialSettingsSection({ settings, onChange }: Props) {
  function update<K extends keyof FinancialSettings>(field: K, value: FinancialSettings[K]) {
    onChange({ ...settings, [field]: value });
  }

  function updateMethod(id: number, patch: Partial<PaymentMethodSetting>) {
    if (
      patch.active === false &&
      settings.paymentMethods.filter((method) => method.active).length === 1 &&
      settings.paymentMethods.find((method) => method.id === id)?.active
    ) {
      return;
    }

    update(
      "paymentMethods",
      settings.paymentMethods.map((method) =>
        method.id === id ? { ...method, ...patch } : method
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Formas de Pagamento"
        description="As formas ativas ficam disponíveis nos fluxos de recebimento da Recepção."
      >
        <div className="space-y-3">
          {settings.paymentMethods.map((method) => (
            <div key={method.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 p-4 xl:grid-cols-[1fr_130px_150px_160px_130px]">
              <FormField label="Forma de pagamento">
                <div className="flex h-11 items-center rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700">{method.name}</div>
              </FormField>
              <FormField label="Taxa (%)">
                <Input type="number" min="0" step="0.01" value={method.feePercent} onChange={(event) => updateMethod(method.id, { feePercent: Math.max(Number(event.target.value) || 0, 0) })} />
              </FormField>
              <div className="flex items-end">
                <button type="button" onClick={() => updateMethod(method.id, { allowInstallments: !method.allowInstallments, maxInstallments: method.allowInstallments ? 1 : Math.max(method.maxInstallments, 2) })} className={`h-11 w-full rounded-xl px-3 text-sm font-semibold ${method.allowInstallments ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {method.allowInstallments ? "Parcela" : "À vista"}
                </button>
              </div>
              <FormField label="Máximo de parcelas">
                <Input type="number" min="1" max="24" disabled={!method.allowInstallments} value={method.maxInstallments} onChange={(event) => updateMethod(method.id, { maxInstallments: Math.max(Number(event.target.value) || 1, 1) })} />
              </FormField>
              <div className="flex items-end">
                <button type="button" onClick={() => updateMethod(method.id, { active: !method.active })} className={`h-11 w-full rounded-xl px-4 text-sm font-semibold ${method.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {method.active ? "Ativa" : "Inativa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageCard>

      <PageCard
        title="Cobranças da Recepção"
        description="Estas regras controlam a geração de cobranças ao criar agendamentos e encaixes rápidos."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Toggle icon={<CircleDollarSign size={19} />} title="Gerar cobranças automaticamente" description="Habilita a integração entre Agenda/Recepção e Financeiro." checked={settings.generateChargeAutomatically} onChange={(value) => update("generateChargeAutomatically", value)} />
          <Toggle icon={<Banknote size={19} />} title="Cobrar ao criar agendamento" description="Cria cobrança para atendimento particular avulso; pacotes e convênios mantêm seus próprios fluxos." checked={settings.chargeOnAppointmentCreation} disabled={!settings.generateChargeAutomatically} onChange={(value) => update("chargeOnAppointmentCreation", value)} />
          <Toggle title="Cobrar após atendimento" description="Mantém disponível a regra de cobrança posterior para os fluxos financeiros." checked={settings.chargeAfterAppointment} onChange={(value) => update("chargeAfterAppointment", value)} />
          <Toggle title="Permitir pagamento parcial" description="Autoriza recebimento menor que o saldo aberto." checked={settings.allowPartialPayment} onChange={(value) => update("allowPartialPayment", value)} />
          <Toggle title="Permitir pagamento acima do valor" description="Autoriza recebimento superior ao saldo da cobrança." checked={settings.allowOverpayment} onChange={(value) => update("allowOverpayment", value)} />
          <Toggle title="Exigir forma de pagamento" description="Impede confirmação sem uma forma de pagamento selecionada." checked={settings.requirePaymentMethodOnConfirmation} onChange={(value) => update("requirePaymentMethodOnConfirmation", value)} />
        </div>
        <div className="mt-5 max-w-xs">
          <FormField label="Dia padrão de vencimento">
            <Select value={String(settings.defaultDueDay)} onChange={(event) => update("defaultDueDay", Number(event.target.value))}>
              {[1, 5, 10, 15, 20, 25, 30].map((day) => <option key={day} value={day}>Dia {day}</option>)}
            </Select>
          </FormField>
        </div>
      </PageCard>

      <PageCard title="Multa, Juros e Descontos" description="Regras financeiras para cobranças e negociações.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Rule title="Multa por atraso" active={settings.applyLateFee} onToggle={() => update("applyLateFee", !settings.applyLateFee)} label="Multa (%)" value={settings.lateFeePercent} onValue={(value) => update("lateFeePercent", value)} />
          <Rule title="Juros" active={settings.applyInterest} onToggle={() => update("applyInterest", !settings.applyInterest)} label="Juros ao mês (%)" value={settings.monthlyInterestPercent} onValue={(value) => update("monthlyInterestPercent", value)} />
          <Rule title="Descontos" active={settings.allowDiscount} onToggle={() => update("allowDiscount", !settings.allowDiscount)} label="Desconto máximo (%)" value={settings.maximumDiscountPercent} onValue={(value) => update("maximumDiscountPercent", Math.min(value, 100))} />
        </div>
      </PageCard>

      <PageCard title="Recibos" description="Dados que devem aparecer nos recibos emitidos pelo Financeiro.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Toggle icon={<ReceiptText size={19} />} title="Gerar recibo automaticamente" checked={settings.generateReceiptAutomatically} onChange={(value) => update("generateReceiptAutomatically", value)} />
          <Toggle title="Exibir dados da clínica" checked={settings.showClinicDataOnReceipt} onChange={(value) => update("showClinicDataOnReceipt", value)} />
          <Toggle title="Exibir profissional" checked={settings.showProfessionalOnReceipt} onChange={(value) => update("showProfessionalOnReceipt", value)} />
          <Toggle title="Exibir paciente" checked={settings.showPatientOnReceipt} onChange={(value) => update("showPatientOnReceipt", value)} />
        </div>
      </PageCard>

    </div>
  );
}

function Toggle({ title, description, checked, disabled = false, onChange, icon }: { title: string; description?: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void; icon?: ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!checked)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"}`}>
      {icon && <span className="mt-0.5 text-indigo-600">{icon}</span>}
      <span className="flex-1"><span className="block font-semibold text-slate-800">{title}</span>{description && <span className="mt-1 block text-sm text-slate-500">{description}</span>}</span>
      <span className={`mt-1 h-5 w-9 rounded-full p-0.5 ${checked ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} /></span>
    </button>
  );
}

function Rule({ title, active, onToggle, label, value, onValue }: { title: string; active: boolean; onToggle: () => void; label: string; value: number; onValue: (value: number) => void }) {
  return (
    <div className={`rounded-2xl border p-5 ${active ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200"}`}>
      <button type="button" onClick={onToggle} className="mb-4 flex w-full items-center justify-between font-semibold text-slate-800"><span>{title}</span><span className={active ? "text-emerald-600" : "text-slate-400"}>{active ? "Ativo" : "Inativo"}</span></button>
      <FormField label={label}><Input type="number" min="0" step="0.01" disabled={!active} value={value} onChange={(event) => onValue(Math.max(Number(event.target.value) || 0, 0))} /></FormField>
    </div>
  );
}
