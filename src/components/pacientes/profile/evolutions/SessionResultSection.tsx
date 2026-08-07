import { useState } from "react";
import {
  Frown,
  Meh,
  Smile,
} from "lucide-react";

import { PageCard } from "@/components/ui";

type SessionResult =
  | "Abaixo do esperado"
  | "Dentro do esperado"
  | "Acima do esperado";

const results: Array<{
  value: SessionResult;
  icon: typeof Smile;
  className: string;
}> = [
  {
    value: "Abaixo do esperado",
    icon: Frown,
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },
  {
    value: "Dentro do esperado",
    icon: Meh,
    className:
      "border-violet-300 bg-violet-50 text-violet-700",
  },
  {
    value: "Acima do esperado",
    icon: Smile,
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
];

export function SessionResultSection() {
  const [result, setResult] =
    useState<SessionResult>("Dentro do esperado");

  const [notes, setNotes] = useState("");

  return (
    <PageCard
      title="6. Resultado geral da sessão"
      description="Como você avalia o resultado deste atendimento?"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {results.map((item) => {
          const Icon = item.icon;
          const active = result === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setResult(item.value)}
              className={`rounded-xl border p-4 text-center transition ${
                active
                  ? item.className
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
            value={notes}
            maxLength={300}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Descreva observações adicionais sobre o resultado da sessão..."
            className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          <span className="absolute bottom-3 right-3 text-xs text-slate-400">
            {notes.length}/300
          </span>
        </div>
      </div>
    </PageCard>
  );
}