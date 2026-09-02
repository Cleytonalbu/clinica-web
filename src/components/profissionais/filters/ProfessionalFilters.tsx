import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  ProfessionalFilterState,
} from "@/components/profissionais/table/ProfessionalTable";

import type { ApiEspecialidade } from "@/services/referencias";

interface ProfessionalFiltersProps {
  filters:
    ProfessionalFilterState;

  onChange:
    (
      filters:
        ProfessionalFilterState
    ) => void;

  especialidades: ApiEspecialidade[];
}

export function ProfessionalFilters({
  filters,
  onChange,
  especialidades,
}: ProfessionalFiltersProps) {
  const hasFilters =
    filters.search.trim() !==
      "" ||
    filters.specialty !==
      "todas" ||
    filters.status !==
      "todos";

  function updateFilter(
    field:
      keyof ProfessionalFilterState,

    value:
      string
  ) {
    onChange({
      ...filters,
      [field]:
        value,
    });
  }

  function handleClear() {
    onChange({
      search: "",
      specialty: "todas",
      status: "todos",
    });
  }

  return (
    <div className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-[1.5]">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792b3]"
          />

          <input
            type="text"
            value={
              filters.search
            }
            onChange={(
              event
            ) =>
              updateFilter(
                "search",
                event.target
                  .value
              )
            }
            placeholder="Pesquisar profissional por nome, conselho ou telefone..."
            className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] py-2 pl-11 pr-4 text-sm font-medium text-[#455477] outline-none transition placeholder:text-[#9ca5bb] focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
          />
        </div>

        <select
          value={
            filters.specialty
          }
          onChange={(
            event
          ) =>
            updateFilter(
              "specialty",
              event.target
                .value
            )
          }
          className="h-11 min-w-[220px] rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-4 text-sm font-semibold text-[#59688d] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
        >
          <option value="todas">
            Todas as especialidades
          </option>

          {especialidades.map((especialidade) => (
            <option
              key={especialidade.id}
              value={especialidade.id}
            >
              {especialidade.nome}
            </option>
          ))}
        </select>

        <select
          value={
            filters.status
          }
          onChange={(
            event
          ) =>
            updateFilter(
              "status",
              event.target
                .value
            )
          }
          className="h-11 min-w-[180px] rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-4 text-sm font-semibold text-[#59688d] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
        >
          <option value="todos">
            Todos os status
          </option>

          <option value="ATIVO">
            Ativos
          </option>

          <option value="INATIVO">
            Inativos
          </option>

          <option value="FERIAS">
            Férias
          </option>
        </select>

        <div className="hidden h-11 items-center gap-2 rounded-xl bg-[#f6f4ff] px-4 text-xs font-bold text-[#6744ef] 2xl:flex">
          <SlidersHorizontal
            size={15}
          />

          Filtros
        </div>

        <button
          type="button"
          onClick={
            handleClear
          }
          disabled={
            !hasFilters
          }
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e1e4ef] bg-white px-4 text-sm font-bold text-[#657295] transition hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X
            size={16}
          />

          Limpar filtros
        </button>
      </div>
    </div>
  );
}
