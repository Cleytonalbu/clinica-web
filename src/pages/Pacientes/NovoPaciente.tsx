import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui";
import { PatientForm } from "@/components/pacientes/form";

import type { PatientSchema } from "@/components/pacientes/form";

export default function NovoPaciente() {
  const navigate = useNavigate();

  function handleSubmit(data: PatientSchema) {
    console.log("Novo paciente:", data);

    // Quando a API estiver pronta, entra aqui:
    // await pacientesService.create(data);

    navigate("/pacientes");
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/pacientes")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ArrowLeft size={17} />
              Voltar para pacientes
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Novo Paciente
            </h1>

            <p className="mt-2 text-slate-500">
              Cadastre as informações do novo paciente.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/pacientes")}
          >
            Cancelar
          </Button>
        </div>

        <PatientForm
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  );
}