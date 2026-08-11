import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
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

/* =========================================
   ABAS VÁLIDAS
========================================= */

const VALID_TABS: PatientProfileTab[] = [
  "resumo",
  "agenda",
  "objetivos",
  "evolucoes",
  "documentos",
  "financeiro",
  "relatorios",
];

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

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

  const {
    user,
  } =
    useAuth();

  const patientId =
    Number(id);

  const patient =
    getPatientById(
      patientId
    );

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const isProfissional =
    user?.profile ===
    "Profissional";

  /* =======================================
     ABAS PERMITIDAS
  ======================================= */

  const allowedTabs =
    useMemo<PatientProfileTab[]>(
      () => {
        if (isGestor) {
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

        if (isRecepcao) {
          return [
            "resumo",
            "agenda",
            "documentos",
            "financeiro",
          ];
        }

        if (isProfissional) {
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

  /* =======================================
     ABA DA URL
  ======================================= */

  const requestedTab =
    searchParams.get(
      "tab"
    );

  const tabFromUrl: PatientProfileTab =
    isPatientProfileTab(
      requestedTab
    )
      ? requestedTab
      : "resumo";

  /* =======================================
     ABA ATIVA
  ======================================= */

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<PatientProfileTab>(
      () => tabFromUrl
    );

  /* =======================================
     SINCRONIZAR URL → ABA
  ======================================= */

  useEffect(
    () => {
      if (
        allowedTabs.includes(
          tabFromUrl
        )
      ) {
        setActiveTab(
          tabFromUrl
        );

        return;
      }

      setActiveTab(
        "resumo"
      );

      if (
        requestedTab &&
        requestedTab !==
          "resumo"
      ) {
        setSearchParams(
          {
            tab:
              "resumo",
          },
          {
            replace:
              true,
          }
        );
      }
    },
    [
      tabFromUrl,
      requestedTab,
      allowedTabs,
      setSearchParams,
    ]
  );

  /* =======================================
     PROTEGER ABA ATIVA
  ======================================= */

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

        setSearchParams(
          {
            tab:
              "resumo",
          },
          {
            replace:
              true,
          }
        );
      }
    },
    [
      activeTab,
      allowedTabs,
      setSearchParams,
    ]
  );

  /* =======================================
     PACIENTE NÃO ENCONTRADO
  ======================================= */

  if (!patient) {
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

  /* =======================================
     TROCAR ABA
  ======================================= */

  function handleTabChange(
    tab: PatientProfileTab
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

    setSearchParams(
      {
        tab,
      }
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <PatientProfileHeader
          patientId={
            patient.id
          }
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

        {!VALID_TABS.includes(
          activeTab
        ) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Módulo em desenvolvimento
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Paciente #
              {patient.id}
              {" • seção: "}
              {activeTab}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   VALIDAR ABA
========================================= */

function isPatientProfileTab(
  value: string | null
): value is PatientProfileTab {
  if (!value) {
    return false;
  }

  return VALID_TABS.includes(
    value as PatientProfileTab
  );
}

/* =========================================
   CALCULAR IDADE
========================================= */

function calculateAge(
  birthDate: string
) {
  if (!birthDate) {
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
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
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