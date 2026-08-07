import {
  CheckCircle2,
  PenLine,
} from "lucide-react";

import {
  FormField,
  PageCard,
  Select,
} from "@/components/ui";

interface ProfessionalSignatureSectionProps {
  professional: string;

  onChange: (
    professional: string
  ) => void;
}

export function ProfessionalSignatureSection({
  professional,
  onChange,
}: ProfessionalSignatureSectionProps) {
  return (
    <PageCard
      title="8. Assinatura do Profissional"
      description="Confirme seus dados para finalizar o registro da evolução."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <FormField
          label="Profissional"
          required
        >
          <Select
            value={professional}
            onChange={(event) =>
              onChange(event.target.value)
            }
          >
            <option value="Dra. Juliana Santos">
              Dra. Juliana Santos — Psicóloga
            </option>

            <option value="Dra. Camila Soares">
              Dra. Camila Soares — Fonoaudióloga
            </option>

            <option value="Dra. Larissa Lima">
              Dra. Larissa Lima — Terapeuta Ocupacional
            </option>
          </Select>
        </FormField>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 text-emerald-600"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Assinatura eletrônica disponível
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                A evolução será assinada eletronicamente pelo profissional.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Data do registro
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-800">
            Gerada automaticamente ao finalizar
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Assinatura
          </p>

          <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
            <PenLine size={20} />

            <span className="ml-2 font-medium italic">
              {professional}
            </span>
          </div>
        </div>
      </div>
    </PageCard>
  );
}