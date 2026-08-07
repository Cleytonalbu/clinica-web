import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  EvolutionFormData,
  ReferralPriority,
} from "./evolutionForm.types";

interface ReferralSectionProps {
  formData: EvolutionFormData;

  updateField: <
    K extends keyof EvolutionFormData
  >(
    field: K,
    value: EvolutionFormData[K]
  ) => void;
}

export function ReferralSection({
  formData,
  updateField,
}: ReferralSectionProps) {
  const priorities: ReferralPriority[] = [
    "Baixa",
    "Média",
    "Alta",
    "Urgente",
  ];

  return (
    <PageCard
      title="4. Encaminhamentos / Orientações"
      description="Registre encaminhamentos realizados durante a sessão."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FormField label="Encaminhar para">
            <Select
              value={formData.referralSpecialty}
              onChange={(event) =>
                updateField(
                  "referralSpecialty",
                  event.target.value
                )
              }
            >
              <option value="">
                Nenhum encaminhamento
              </option>

              <option value="Fonoaudiologia">
                Fonoaudiologia
              </option>

              <option value="Psicologia">
                Psicologia
              </option>

              <option value="Terapia Ocupacional">
                Terapia Ocupacional
              </option>

              <option value="Fisioterapia">
                Fisioterapia
              </option>

              <option value="Psicopedagogia">
                Psicopedagogia
              </option>

              <option value="Nutrição">
                Nutrição
              </option>
            </Select>
          </FormField>

          <FormField label="Profissional de destino">
            <Select
              value={
                formData.referralProfessional
              }
              onChange={(event) =>
                updateField(
                  "referralProfessional",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione o profissional
              </option>

              <option value="Dra. Camila Soares">
                Dra. Camila Soares — Fonoaudióloga
              </option>

              <option value="Dra. Ana Paula">
                Dra. Ana Paula — Psicóloga
              </option>

              <option value="Dra. Larissa Lima">
                Dra. Larissa Lima — Terapeuta Ocupacional
              </option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_260px]">
          <FormField label="Motivo do encaminhamento">
            <div className="relative">
              <Input
                value={formData.referralReason}
                maxLength={300}
                onChange={(event) =>
                  updateField(
                    "referralReason",
                    event.target.value
                  )
                }
                placeholder="Descreva o motivo do encaminhamento..."
                className="pr-16"
              />

              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {formData.referralReason.length}/300
              </span>
            </div>
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Prioridade
            </p>

            <div className="flex min-h-11 flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-3">
              {priorities.map((priority) => (
                <label
                  key={priority}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600"
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={
                      formData.referralPriority ===
                      priority
                    }
                    onChange={() =>
                      updateField(
                        "referralPriority",
                        priority
                      )
                    }
                    className="accent-indigo-600"
                  />

                  {priority}
                </label>
              ))}
            </div>
          </div>
        </div>

        <FormField label="Observações ao profissional">
          <div className="relative">
            <textarea
              value={
                formData.referralObservation
              }
              maxLength={300}
              onChange={(event) =>
                updateField(
                  "referralObservation",
                  event.target.value
                )
              }
              placeholder="Registre informações importantes para o profissional..."
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <span className="absolute bottom-3 right-3 text-xs text-slate-400">
              {
                formData.referralObservation
                  .length
              }
              /300
            </span>
          </div>
        </FormField>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Notificações
          </p>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <CheckOption
              label="Enviar notificação interna"
              checked={
                formData.notifyProfessional
              }
              onChange={(value) =>
                updateField(
                  "notifyProfessional",
                  value
                )
              }
            />

            <CheckOption
              label="Adicionar à agenda"
              checked={
                formData.addProfessionalAgenda
              }
              onChange={(value) =>
                updateField(
                  "addProfessionalAgenda",
                  value
                )
              }
            />

            <CheckOption
              label="Informar gestor"
              checked={formData.notifyManager}
              onChange={(value) =>
                updateField(
                  "notifyManager",
                  value
                )
              }
            />
          </div>
        </div>
      </div>
    </PageCard>
  );
}

interface CheckOptionProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function CheckOption({
  label,
  checked,
  onChange,
}: CheckOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 accent-indigo-600"
      />

      {label}
    </label>
  );
}