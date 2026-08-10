import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

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

export default function PerfilPaciente() {
  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

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

  /* =========================================
     ABAS PERMITIDAS
  ========================================= */

  const allowedTabs =
    useMemo<
      PatientProfileTab[]
    >(
      () => {
        /*
         * GESTOR
         */

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

        /*
         * RECEPÇÃO
         */

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

        /*
         * PROFISSIONAL
         */

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

        /*
         * FALLBACK
         */

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
     PROTEÇÃO DA ABA ATIVA
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
     TROCA DE ABA
  ========================================= */

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
          nome="Maria Oliveira"
          idade={
            8
          }
          telefone="(83) 99999-9999"
          status="Ativo"
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
            <PatientOverview />
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
              {id} • seção:{" "}
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