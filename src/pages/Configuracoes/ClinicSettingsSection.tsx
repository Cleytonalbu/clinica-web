import { Building2 } from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { ClinicSettings } from "./settingsStorage";

interface Props {
  settings: ClinicSettings;
  onChange: (settings: ClinicSettings) => void;
}

export default function ClinicSettingsSection({
  settings,
  onChange,
}: Props) {
  function update<K extends keyof ClinicSettings>(
    field: K,
    value: ClinicSettings[K]
  ) {
    onChange({ ...settings, [field]: value });
  }

  return (
    <PageCard
      title="Dados da Clínica"
      description="Informações institucionais usadas nos recibos e documentos financeiros."
    >
      <div className="mb-5 flex items-start gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
        <Building2 size={19} className="mt-0.5 shrink-0" />
        Estes dados são gerais da clínica. Endereços específicos continuam sendo administrados em Unidades.
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField label="Nome da clínica">
          <Input value={settings.clinicName} onChange={(event) => update("clinicName", event.target.value)} />
        </FormField>
        <FormField label="CNPJ">
          <Input value={settings.cnpj} onChange={(event) => update("cnpj", event.target.value)} />
        </FormField>
        <FormField label="E-mail">
          <Input type="email" value={settings.email} onChange={(event) => update("email", event.target.value)} />
        </FormField>
        <FormField label="Telefone">
          <Input value={settings.phone} onChange={(event) => update("phone", event.target.value)} />
        </FormField>
        <FormField label="Endereço">
          <Input value={settings.address} onChange={(event) => update("address", event.target.value)} />
        </FormField>
        <FormField label="Cidade">
          <Input value={settings.city} onChange={(event) => update("city", event.target.value)} />
        </FormField>
        <FormField label="Estado">
          <Select value={settings.state} onChange={(event) => update("state", event.target.value)}>
            {[
              "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
              "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
              "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
            ].map((state) => <option key={state} value={state}>{state}</option>)}
          </Select>
        </FormField>
        <FormField label="CEP">
          <Input value={settings.zipCode} onChange={(event) => update("zipCode", event.target.value)} />
        </FormField>
      </div>
    </PageCard>
  );
}
