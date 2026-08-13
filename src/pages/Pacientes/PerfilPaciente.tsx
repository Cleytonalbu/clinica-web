import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
} from "@/components/ui";

import {
  PatientAgenda,
} from "@/components/pacientes/profile/PatientAgenda";

import {
  PatientDocuments,
} from "@/components/pacientes/profile/PatientDocuments";

import {
  PatientEvolutions,
} from "@/components/pacientes/profile/PatientEvolutions";

import {
  PatientFinance,
} from "@/components/pacientes/profile/PatientFinance";

import {
  PatientObjectives,
} from "@/components/pacientes/profile/PatientObjectives";

import {
  PatientOverview,
} from "@/components/pacientes/profile/PatientOverview";

import {
  PatientProfileHeader,
} from "@/components/pacientes/profile/PatientProfileHeader";

import {
  PatientReports,
} from "@/components/pacientes/profile/PatientReports";

import {
  PatientProfileNav,
  type PatientProfileTab,
} from "@/components/pacientes/profile/PatientProfileNav";

import {
  getPatientById,
} from "./patientStorage";

import {
  canProfessionalAccessPatient,
  getProfessionalSpecialty,
} from "./patientAccessRules";

/* =========================================
   COMPONENTE
========================================= */

export default function PerfilPaciente() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const {
    user,
  } =
    useAuth();

  const patientId =
    Number(
      id
    );

  const patient =
    getPatientById(
      patientId
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<PatientProfileTab>(
      "resumo"
    );

  /* =========================================
     PERFIL
  ========================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const isProfissional =
    user?.profile ===
    "Profissional";

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const professionalSpecialty =
    isProfissional
      ? getProfessionalSpecialty(
          loggedProfessionalName
        )
      : "";

  const hasPatientAccess =
    !isProfissional ||
    canProfessionalAccessPatient(
      loggedProfessionalName,
      patientId
    );

  const canEdit =
    isGestor ||
    isRecepcao;

  /* =========================================
     ABAS PERMITIDAS
  ========================================= */

  const allowedTabs =
    useMemo<
      PatientProfileTab[]
    >(
      () => {
        if (
          isGestor
        ) {
          return [
            "resumo",
            "agenda",
            "objetivos",
            "evolucoes",
            "documentos",
            "financeiro",
            "relatorios",
          ];
        }

        if (
          isRecepcao
        ) {
          return [
            "resumo",
            "agenda",
            "documentos",
            "financeiro",
          ];
        }

        if (
          isProfissional
        ) {
          return [
            "resumo",
            "agenda",
            "objetivos",
            "evolucoes",
            "documentos",
            "relatorios",
          ];
        }

        return [
          "resumo",
        ];
      },
      [
        isGestor,
        isRecepcao,
        isProfissional,
      ]
    );

  /* =========================================
     PROTEÇÃO DA ABA
  ========================================= */

  useEffect(
    () => {
      if (
        !allowedTabs.includes(
          activeTab
        )
      ) {
        setActiveTab(
          "resumo"
        );
      }
    },
    [
      activeTab,
      allowedTabs,
    ]
  );

  /* =========================================
     PACIENTE NÃO ENCONTRADO
  ========================================= */

  if (
    !patient
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Paciente não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O paciente pode ter sido removido ou o cadastro não existe.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/pacientes"
              )
            }
          >
            Voltar para pacientes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================
     ACESSO DO PROFISSIONAL AO PACIENTE
  ========================================= */

  if (
    isProfissional &&
    !hasPatientAccess
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-violet-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Paciente não vinculado ao seu atendimento
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Seu perfil profissional pode acessar apenas pacientes vinculados à sua especialidade e aos seus atendimentos.
          </p>

          {professionalSpecialty && (
            <p className="mt-2 text-xs font-semibold text-violet-600">
              Especialidade: {professionalSpecialty}
            </p>
          )}

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/pacientes"
              )
            }
          >
            Voltar para meus pacientes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================
     TROCA DE ABA
  ========================================= */

  function handleTabChange(
    tab:
      PatientProfileTab
  ) {
    if (
      !allowedTabs.includes(
        tab
      )
    ) {
      return;
    }

    setActiveTab(
      tab
    );
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <PatientProfileHeader
          nome={
            patient.nome
          }
          idade={
            calculateAge(
              patient.nascimento
            )
          }
          telefone={
            patient.celular ||
            patient.telefone ||
            "-"
          }
          status={
            patient.status
          }
        />

        {isProfissional && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/65 px-5 py-3 text-xs font-semibold text-violet-700">
            Paciente vinculado ao seu perfil • {professionalSpecialty || "sua especialidade"}
          </div>
        )}

        {/* ================================= */}
        {/* AÇÃO DE EDIÇÃO */}
        {/* ================================= */}

        {canEdit && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  `/pacientes/${patient.id}/editar`
                )
              }
            >
              Editar cadastro
            </Button>
          </div>
        )}

        {/* ================================= */}
        {/* NAVEGAÇÃO */}
        {/* ================================= */}

        <PatientProfileNav
          activeTab={
            activeTab
          }
          onChange={
            handleTabChange
          }
          allowedTabs={
            allowedTabs
          }
        />

        {/* ================================= */}
        {/* RESUMO */}
        {/* ================================= */}

        {activeTab ===
          "resumo" &&
          allowedTabs.includes(
            "resumo"
          ) && (
            <PatientOverview
              patient={
                patient
              }
            />
          )}

        {/* ================================= */}
        {/* AGENDA */}
        {/* ================================= */}

        {activeTab ===
          "agenda" &&
          allowedTabs.includes(
            "agenda"
          ) && (
            <PatientAgenda />
          )}

        {/* ================================= */}
        {/* OBJETIVOS */}
        {/* ================================= */}

        {activeTab ===
          "objetivos" &&
          allowedTabs.includes(
            "objetivos"
          ) && (
            <PatientObjectives />
          )}

        {/* ================================= */}
        {/* EVOLUÇÕES */}
        {/* ================================= */}

        {activeTab ===
          "evolucoes" &&
          allowedTabs.includes(
            "evolucoes"
          ) && (
            <PatientEvolutions />
          )}

        {/* ================================= */}
        {/* DOCUMENTOS */}
        {/* ================================= */}

        {activeTab ===
          "documentos" &&
          allowedTabs.includes(
            "documentos"
          ) && (
            <PatientDocuments />
          )}

        {/* ================================= */}
        {/* FINANCEIRO */}
        {/* ================================= */}

        {activeTab ===
          "financeiro" &&
          allowedTabs.includes(
            "financeiro"
          ) && (
            <PatientFinance />
          )}

        {/* ================================= */}
        {/* RELATÓRIOS */}
        {/* ================================= */}

        {activeTab ===
          "relatorios" &&
          allowedTabs.includes(
            "relatorios"
          ) && (
            <PatientReports />
          )}

        {/* ================================= */}
        {/* FALLBACK */}
        {/* ================================= */}

        {![
          "resumo",
          "agenda",
          "objetivos",
          "evolucoes",
          "documentos",
          "financeiro",
          "relatorios",
        ].includes(
          activeTab
        ) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Módulo em desenvolvimento
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Paciente #
              {
                patient.id
              }{" "}
              • seção:{" "}
              {
                activeTab
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CALCULAR IDADE
========================================= */

function calculateAge(
  birthDate:
    string
) {
  if (
    !birthDate
  ) {
    return 0;
  }

  const birth =
    new Date(
      `${birthDate}T12:00:00`
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return 0;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference <
      0 ||
    (
      monthDifference ===
        0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return Math.max(
    age,
    0
  );
}