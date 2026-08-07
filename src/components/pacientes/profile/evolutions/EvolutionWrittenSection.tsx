import { useState } from "react";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { PageCard } from "@/components/ui";

const MAX_LENGTH = 2000;

export function EvolutionWrittenSection() {
  const [text, setText] = useState("");

  return (
    <PageCard
      title="3. Evolução Escrita"
      description="Descreva detalhadamente o desenvolvimento da sessão."
    >
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
          <select
            defaultValue="paragraph"
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="paragraph">
              Parágrafo
            </option>

            <option value="title">
              Título
            </option>

            <option value="subtitle">
              Subtítulo
            </option>
          </select>

          <ToolbarButton>
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton>
            <Italic size={16} />
          </ToolbarButton>

          <ToolbarButton>
            <Underline size={16} />
          </ToolbarButton>

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <ToolbarButton>
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton>
            <ListOrdered size={16} />
          </ToolbarButton>

          <ToolbarButton>
            <Link size={16} />
          </ToolbarButton>
        </div>

        <textarea
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Descreva como foi a sessão, atividades realizadas, comportamento observado, respostas aos estímulos e demais informações clínicas..."
          className="min-h-56 w-full resize-none border-0 bg-white p-4 text-sm leading-7 text-slate-700 outline-none"
        />

        <div className="flex items-center justify-end border-t border-slate-100 px-4 py-2">
          <span className="text-xs text-slate-400">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </PageCard>
  );
}

interface ToolbarButtonProps {
  children: React.ReactNode;
}

function ToolbarButton({
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-indigo-600"
    >
      {children}
    </button>
  );
}