import {
  CheckCircle2,
  PenLine,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  FormField,
  PageCard,
  Select,
} from "@/components/ui";

/* =========================================
   PROPS
========================================= */

interface ProfessionalSignatureSectionProps {
  professional:
    string;

  professionals:
    Array<{ id: number | string; name: string; specialty: string }>;

  onChange: (
    professional:
      string
  ) => void;
}

/* =========================================
   COMPONENTE
========================================= */

export function ProfessionalSignatureSection({
  professional,
  professionals,
  onChange,
}: ProfessionalSignatureSectionProps) {

  /* =======================================
     PROFISSIONAL SELECIONADO
  ======================================= */

  const selectedProfessional =
    useMemo(
      () =>
        professionals.find(
          (
            item
          ) =>
            item.name ===
            professional
        ),

      [
        professionals,
        professional,
      ]
    );

  return (
    <PageCard
      title="8. Assinatura do Profissional"
      description="Confirme seus dados para finalizar o registro da evolução."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ================================= */}
        {/* PROFISSIONAL */}
        {/* ================================= */}

        <FormField
          label="Profissional"
          required
        >
          <Select
            value={
              professional
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target.value
              )
            }
          >
            <option value="">
              Selecione o profissional
            </option>

            {professionals.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {
                    item.name
                  }{" "}
                  —{" "}
                  {
                    item.specialty
                  }
                </option>
              )
            )}
          </Select>

          {professionals.length ===
            0 && (
            <p className="mt-2 text-xs font-medium text-amber-600">
              Nenhum profissional ativo cadastrado nas configurações.
            </p>
          )}
        </FormField>

        {/* ================================= */}
        {/* ASSINATURA ELETRÔNICA */}
        {/* ================================= */}

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
                A evolução será assinada eletronicamente pelo profissional selecionado.
              </p>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* DATA */}
        {/* ================================= */}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Data do registro
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-800">
            Gerada automaticamente ao finalizar
          </p>
        </div>

        {/* ================================= */}
        {/* ASSINATURA */}
        {/* ================================= */}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Assinatura
          </p>

          <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
            <PenLine
              size={20}
            />

            <span className="ml-2 font-medium italic">
              {selectedProfessional
                ? selectedProfessional.name
                : professional ||
                  "Profissional não selecionado"}
            </span>
          </div>

          {selectedProfessional && (
            <p className="mt-2 text-right text-xs text-slate-400">
              {
                selectedProfessional.specialty
              }
            </p>
          )}
        </div>
      </div>
    </PageCard>
  );
}