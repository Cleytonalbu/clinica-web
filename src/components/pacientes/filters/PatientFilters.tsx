import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface PatientFiltersProps {
  search:
    string;

  status:
    string;

  convenio:
    string;

  convenios:
    string[];

  onSearchChange:
    (
      value:
        string
    ) => void;

  onStatusChange:
    (
      value:
        string
    ) => void;

  onConvenioChange:
    (
      value:
        string
    ) => void;

  onClear:
    () => void;
}

export function PatientFilters({
  search,
  status,
  convenio,
  convenios,
  onSearchChange,
  onStatusChange,
  onConvenioChange,
  onClear,
}: PatientFiltersProps) {
  const hasFilters =
    search.trim() !==
      "" ||
    status !==
      "Todos" ||
    convenio !==
      "Todos";

  return (
    <div className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        {/* PESQUISA */}

        <div className="relative min-w-0 flex-[1.5]">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792b3]"
          />

          <input
            type="text"
            value={
              search
            }
            onChange={(
              event
            ) =>
              onSearchChange(
                event.target
                  .value
              )
            }
            placeholder="Pesquisar paciente por nome, CPF ou telefone..."
            className="h-11 w-full rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] py-2 pl-11 pr-4 text-sm font-medium text-[#455477] outline-none transition placeholder:text-[#9ca5bb] focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
          />
        </div>

        {/* STATUS */}

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            onStatusChange(
              event.target
                .value
            )
          }
          className="h-11 min-w-[190px] rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-4 text-sm font-semibold text-[#59688d] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
        >
          <option value="Todos">
            Todos os status
          </option>

          <option value="Ativo">
            Ativos
          </option>

          <option value="Inativo">
            Inativos
          </option>
        </select>

        {/* CONVÊNIO */}

        <select
          value={
            convenio
          }
          onChange={(
            event
          ) =>
            onConvenioChange(
              event.target
                .value
            )
          }
          className="h-11 min-w-[210px] rounded-xl border border-[#e1e4f1] bg-[#fbfbfe] px-4 text-sm font-semibold text-[#59688d] outline-none transition focus:border-[#bcb0ff] focus:bg-white focus:ring-4 focus:ring-[#eeeaff]"
        >
          <option value="Todos">
            Todos os convênios
          </option>

          {convenios.map(
            (
              item
            ) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {
                  item
                }
              </option>
            )
          )}
        </select>

        {/* INDICADOR */}

        <div className="hidden h-11 items-center gap-2 rounded-xl bg-[#f6f4ff] px-4 text-xs font-bold text-[#6744ef] 2xl:flex">
          <SlidersHorizontal
            size={15}
          />

          Filtros
        </div>

        {/* LIMPAR */}

        <button
          type="button"
          onClick={
            onClear
          }
          disabled={
            !hasFilters
          }
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e1e4ef] bg-white px-4 text-sm font-bold text-[#657295] transition hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X
            size={16}
          />

          Limpar
        </button>
      </div>
    </div>
  );
}