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
  } =
    useAuth();

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
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eeeaff] to-[#e8e5ff] text-[#6847f5] shadow-[0_7px_18px_rgba(104,71,245,0.10)]">
          <Users
            size={23}
          />
        </div>

        <div>
          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
            Pacientes
          </h1>

          <p className="mt-1 text-sm font-medium text-[#7d89a8]">
            {user?.profile ===
            "Profissional"
              ? "Acesse seus pacientes e acompanhe os atendimentos."
              : "Gerencie todos os pacientes cadastrados na clínica."}
          </p>
        </div>
      </div>

      {canCreatePatient && (
        <Button
          type="button"
          onClick={
            handleNewPatient
          }
          className="bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-5 shadow-[0_8px_20px_rgba(103,66,246,0.18)] hover:opacity-95"
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