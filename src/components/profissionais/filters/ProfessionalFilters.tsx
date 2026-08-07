import {
  Search,
  X,
} from "lucide-react";

import {
  Button,
  Input,
  Select,
} from "@/components/ui";

export function ProfessionalFilters() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <Input
            placeholder="Pesquisar profissional..."
            className="pl-11"
          />
        </div>

        <Select defaultValue="todas">
          <option value="todas">
            Todas as especialidades
          </option>

          <option value="psicologia">
            Psicologia
          </option>

          <option value="fono">
            Fonoaudiologia
          </option>

          <option value="to">
            Terapia Ocupacional
          </option>

          <option value="fisio">
            Fisioterapia
          </option>

          <option value="nutricao">
            Nutrição
          </option>
        </Select>

        <Select defaultValue="todos">
          <option value="todos">
            Todos os status
          </option>

          <option value="ativo">
            Ativo
          </option>

          <option value="inativo">
            Inativo
          </option>

          <option value="ferias">
            Férias
          </option>
        </Select>

        <Button
          type="button"
          variant="outline"
        >
          <X size={16} />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}