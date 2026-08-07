import { useState } from "react";
import { useParams } from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import { PatientProfileHeader } from "@/components/pacientes/profile/PatientProfileHeader";
import {
  PatientProfileNav,
  type PatientProfileTab,
} from "@/components/pacientes/profile/PatientProfileNav";
import { PatientOverview } from "@/components/pacientes/profile/PatientOverview";

export default function PerfilPaciente() {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState<PatientProfileTab>("resumo");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PatientProfileHeader
          nome="Maria Oliveira"
          idade={8}
          telefone="(83) 99999-9999"
          status="Ativo"
        />

        <PatientProfileNav
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "resumo" && (
          <PatientOverview />
        )}

        {activeTab !== "resumo" && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Módulo em desenvolvimento
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Paciente #{id} • seção: {activeTab}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}