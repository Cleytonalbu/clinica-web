import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui";

export function EvolutionHeader() {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleNewEvolution() {
    navigate(`/pacientes/${id}/evolucoes/nova`);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Evoluções Clínicas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Histórico completo das evoluções do paciente.
        </p>
      </div>

      <Button
        type="button"
        onClick={handleNewEvolution}
      >
        <Plus size={18} />
        Nova Evolução
      </Button>
    </div>
  );
}