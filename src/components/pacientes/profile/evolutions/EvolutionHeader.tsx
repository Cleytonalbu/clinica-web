import {
  Plus,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Button,
} from "@/components/ui";

import {
  useAuth,
} from "@/auth/AuthContext";

export function EvolutionHeader() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  /* =========================================
     PERFIS
  ========================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isProfissional =
    user?.profile ===
    "Profissional";

  /*
   * Somente Gestor e Profissional
   * podem registrar uma evolução clínica.
   */
  const canCreateEvolution =
    isGestor ||
    isProfissional;

  /* =========================================
     NOVA EVOLUÇÃO
  ========================================= */

  function handleNewEvolution() {
    if (
      !canCreateEvolution
    ) {
      return;
    }

    if (
      !id
    ) {
      return;
    }

    navigate(
      `/pacientes/${id}/evolucoes/nova`
    );
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* ================================= */}
      {/* TÍTULO */}
      {/* ================================= */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Evoluções Clínicas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Histórico completo das evoluções do paciente.
        </p>
      </div>

      {/* ================================= */}
      {/* NOVA EVOLUÇÃO */}
      {/* ================================= */}

      {canCreateEvolution && (
        <Button
          type="button"
          onClick={
            handleNewEvolution
          }
        >
          <Plus
            size={
              18
            }
          />

          Nova Evolução
        </Button>
      )}
    </div>
  );
}