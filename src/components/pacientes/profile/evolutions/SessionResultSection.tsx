import {
  Frown,
  Meh,
  Smile,
} from "lucide-react";

import { PageCard } from "@/components/ui";

import type { SessionResult } from "./evolutionForm.types";

interface SessionResultSectionProps {
  value: SessionResult;
  observation: string;

  onChange: (
    value: SessionResult
  ) => void;

  onObservationChange: (
    value: string
  ) => void;
}

const results: Array<{
  value: SessionResult;
  icon: typeof Smile;
  activeClass: string;
}> = [
  {
    value: "Abaixo do esperado",
    icon: Frown,
    activeClass:
      "border-red-300 bg-red-50 text-red-700",
  },
  {
    value: "Dentro do esperado",
    icon: Meh,
    activeClass:
      "border-violet-300 bg-violet-50 text-violet-700",
  },
  {
    value: "Acima do esperado",
    icon: Smile,
    activeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
];

export function SessionResultSection({
  value,
  observation,
  onChange,
  onObservationChange,
}: SessionResultSectionProps) {
  return (
    <PageCard
      title="6. Resultado geral da sessão"
      description="Como você avalia o resultado deste atendimento?"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {results.map((item) => {
          const Icon = item.icon;
          const active =
            value === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onChange(item.value)
              }
              className={`rounded-xl border p-4 text-center transition ${
                active
                  ? item.activeClass
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon
                size={28}
                className="mx-auto"
              />

              <span className="mt-3 block text-sm font-semibold">
                {item.value}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Observações
        </label>

        <div className="relative">
          <textarea
            value={observation}
            maxLength={300}
            onChange={(event) =>
              onObservationChange(
                event.target.value
              )
            }
            placeholder="Descreva observações adicionais sobre o resultado da sessão..."
            className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <span className="absolute bottom-3 right-3 text-xs text-slate-400">
            {observation.length}/300
          </span>
        </div>
      </div>
    </PageCard>
  );
}