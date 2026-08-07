import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PatientFilters() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Pesquisa */}
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Pesquisar paciente..."
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              py-3
              pl-11
              pr-4
              text-sm
              outline-none
              transition
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </div>

        {/* Status */}
        <select
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
          "
        >
          <option>Todos os status</option>
          <option>Ativo</option>
          <option>Inativo</option>
        </select>

        {/* Convênio */}
        <select
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
          "
        >
          <option>Todos os convênios</option>
          <option>Particular</option>
          <option>Unimed</option>
          <option>Bradesco Saúde</option>
          <option>Hapvida</option>
        </select>

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
          >
            <Filter size={16} />
            Filtrar
          </Button>

          <Button
            variant="outline"
            className="flex-1"
          >
            <X size={16} />
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}