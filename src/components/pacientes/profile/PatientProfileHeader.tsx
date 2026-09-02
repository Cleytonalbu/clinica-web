import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Phone,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
} from "@/components/ui";

import {
  useAuth,
} from "@/auth/AuthContext";

/* =========================================
   PROPS
========================================= */

interface PatientProfileHeaderProps {
  patientId:
    string | number;

  nome:
    string;

  idade:
    number;

  telefone:
    string;

  status?:
    | "Ativo"
    | "Inativo";
}

/* =========================================
   COMPONENTE
========================================= */

export function PatientProfileHeader({
  patientId,
  nome,
  idade,
  telefone,
  status =
    "Ativo",
}: PatientProfileHeaderProps) {
  const navigate =
    useNavigate();

  const {
    user,
  } =
    useAuth();

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const canManagePatient =
    isGestor ||
    isRecepcao;

  /* =======================================
     VOLTAR
  ======================================= */

  function handleBack() {
    navigate(
      "/pacientes"
    );
  }

  /* =======================================
     AGENDAR
  ======================================= */

  function handleSchedule() {
    if (
      !canManagePatient
    ) {
      return;
    }

    /*
     * Enviamos o patientId na query.
     *
     * Assim o NovoAgendamento poderá
     * pré-selecionar este paciente.
     */

    navigate(
      `/agenda/novo?patientId=${patientId}`
    );
  }

  /* =======================================
     EDITAR
  ======================================= */

  function handleEdit() {
    if (
      !canManagePatient
    ) {
      return;
    }

    navigate(
      `/pacientes/${patientId}/editar`
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ================================= */}
      {/* VOLTAR */}
      {/* ================================= */}

      <button
        type="button"
        onClick={
          handleBack
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft
          size={17}
        />

        Voltar para pacientes
      </button>

      {/* ================================= */}
      {/* CONTEÚDO */}
      {/* ================================= */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* ================================= */}
        {/* DADOS DO PACIENTE */}
        {/* ================================= */}

        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
            <UserRound
              size={38}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {
                  nome
                }
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status ===
                  "Ativo"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {
                  status
                }
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span>
                {
                  idade
                }{" "}
                anos
              </span>

              <span className="flex items-center gap-2">
                <Phone
                  size={15}
                />

                {
                  telefone
                }
              </span>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* AÇÕES ADMINISTRATIVAS */}
        {/* ================================= */}

        {canManagePatient && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={
                handleSchedule
              }
            >
              <CalendarDays
                size={17}
              />

              Agendar
            </Button>

            <Button
              type="button"
              onClick={
                handleEdit
              }
            >
              <Edit3
                size={17}
              />

              Editar paciente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}