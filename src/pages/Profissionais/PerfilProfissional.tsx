import { useState } from "react";
import { useParams } from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import { ProfessionalAgenda } from "@/components/profissionais/profile/ProfessionalAgenda";
import { ProfessionalOverview } from "@/components/profissionais/profile/ProfessionalOverview";
import { ProfessionalPatients } from "@/components/profissionais/profile/ProfessionalPatients";
import { ProfessionalProduction } from "@/components/profissionais/profile/ProfessionalProduction";
import { ProfessionalProfileHeader } from "@/components/profissionais/profile/ProfessionalProfileHeader";
import { ProfessionalSchedule } from "@/components/profissionais/profile/ProfessionalSchedule";

import {
  ProfessionalProfileNav,
  type ProfessionalProfileTab,
} from "@/components/profissionais/profile/ProfessionalProfileNav";

export default function PerfilProfissional() {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState<ProfessionalProfileTab>(
      "resumo"
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfessionalProfileHeader
          professionalId={
            Number(
              id
            )
          }
          name="Dra. Ana Paula"
          specialty="Psicologia"
          council="CRP 13/12345"
          status="Ativo"
        />

        <ProfessionalProfileNav
          activeTab={
            activeTab
          }
          onChange={
            setActiveTab
          }
        />

        {activeTab ===
          "resumo" && (
          <ProfessionalOverview />
        )}

        {activeTab ===
          "agenda" && (
          <ProfessionalAgenda />
        )}

        {activeTab ===
          "pacientes" && (
          <ProfessionalPatients />
        )}

        {activeTab ===
          "producao" && (
          <ProfessionalProduction />
        )}

        {activeTab ===
          "horarios" && (
          <ProfessionalSchedule />
        )}

        {![
          "resumo",
          "agenda",
          "pacientes",
          "producao",
          "horarios",
        ].includes(
          activeTab
        ) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Módulo em
              desenvolvimento
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Profissional #
              {id} • seção:{" "}
              {activeTab}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}