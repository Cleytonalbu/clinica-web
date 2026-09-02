import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import {
  buscarProfissional,
  type ApiProfissional,
} from "@/services/referencias";

const STATUS_LABEL: Record<ApiProfissional["status"], "Ativo" | "Inativo" | "Férias"> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  FERIAS: "Férias",
};

export default function PerfilProfissional() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profissional, setProfissional] = useState<ApiProfissional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelado = false;
    setLoading(true);

    buscarProfissional(id)
      .then((dados) => {
        if (cancelado) return;
        setProfissional(dados);
      })
      .catch(() => {
        if (cancelado) return;
        setNotFound(true);
      })
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const [activeTab, setActiveTab] =
    useState<ProfessionalProfileTab>(
      "resumo"
    );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Carregando profissional…
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !profissional) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Profissional não encontrado
          </h1>

          <button
            type="button"
            onClick={() => navigate("/profissionais")}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Voltar para profissionais
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const especialidadeNome = profissional.especialidades[0]?.especialidade.nome ?? "Sem especialidade";
  const conselho = [profissional.conselho, profissional.registro].filter(Boolean).join(" ") || "—";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfessionalProfileHeader
          name={profissional.usuario.nome}
          specialty={especialidadeNome}
          council={conselho}
          status={STATUS_LABEL[profissional.status]}
          onEdit={() => navigate(`/profissionais/${id}/editar`)}
          onViewAgenda={() => setActiveTab("agenda")}
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
          <ProfessionalOverview profissional={profissional} />
        )}

        {activeTab ===
          "agenda" && (
          <ProfessionalAgenda profissionalId={profissional.id} />
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
