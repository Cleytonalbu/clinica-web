import { useState } from "react";

import { PageCard } from "@/components/ui";

const impacts = [
  "Comunicação",
  "Interação social",
  "Atenção",
  "Autonomia",
  "Regulação emocional",
  "Coordenação motora",
  "Comportamento",
  "Outros",
];

export function ObservedImpactsSection() {
  const [selected, setSelected] = useState<string[]>([
    "Comunicação",
    "Interação social",
    "Atenção",
    "Autonomia",
    "Regulação emocional",
  ]);

  function toggleImpact(impact: string) {
    setSelected((current) =>
      current.includes(impact)
        ? current.filter((item) => item !== impact)
        : [...current, impact]
    );
  }

  return (
    <PageCard
      title="5. Impactos observados na sessão"
      description="Selecione os principais impactos observados hoje."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {impacts.map((impact) => {
          const active = selected.includes(impact);

          return (
            <button
              key={impact}
              type="button"
              onClick={() => toggleImpact(impact)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{impact}</span>

              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {active ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </PageCard>
  );
}