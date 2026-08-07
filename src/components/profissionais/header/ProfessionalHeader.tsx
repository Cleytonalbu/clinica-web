import {
  Plus,
  Stethoscope,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";

export function ProfessionalHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Stethoscope size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Profissionais
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie profissionais, especialidades e disponibilidade.
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={() =>
          navigate(
            "/profissionais/novo"
          )
        }
      >
        <Plus size={18} />
        Novo Profissional
      </Button>
    </div>
  );
}