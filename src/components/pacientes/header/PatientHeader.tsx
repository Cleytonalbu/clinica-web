import {
  Plus,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
} from "@/components/ui/button";

import {
  useAuth,
} from "@/auth/AuthContext";

export function PatientHeader() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  /*
   * Somente Gestor e Recepção
   * podem cadastrar novos pacientes.
   */
  const canCreatePatient =
    user?.profile ===
      "Gestor" ||
    user?.profile ===
      "Recepção";

  function handleNewPatient() {
    navigate(
      "/pacientes/novo"
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* ================================= */}
      {/* TÍTULO */}
      {/* ================================= */}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Users
            size={24}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pacientes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {user?.profile ===
            "Profissional"
              ? "Acesse seus pacientes e acompanhe os atendimentos."
              : "Gerencie todos os pacientes cadastrados na clínica."}
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* NOVO PACIENTE */}
      {/* ================================= */}

      {canCreatePatient && (
        <Button
          type="button"
          onClick={
            handleNewPatient
          }
        >
          <Plus
            size={18}
          />

          Novo Paciente
        </Button>
      )}
    </div>
  );
}