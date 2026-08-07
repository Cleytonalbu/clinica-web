import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import { EvolutionWrittenSection } from "@/components/pacientes/profile/evolutions/EvolutionWrittenSection";
import { ReferralSection } from "@/components/pacientes/profile/evolutions/ReferralSection";
import { ObservedImpactsSection } from "@/components/pacientes/profile/evolutions/ObservedImpactsSection";
import { SessionResultSection } from "@/components/pacientes/profile/evolutions/SessionResultSection";
import { EvolutionAttachmentsSection } from "@/components/pacientes/profile/evolutions/EvolutionAttachmentsSection";
import { ProfessionalSignatureSection } from "@/components/pacientes/profile/evolutions/ProfessionalSignatureSection";

export default function NovaEvolucao() {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleCancel() {
    navigate(`/pacientes/${id}`);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para evoluções
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Nova Evolução
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Registre os detalhes da sessão e os indicadores utilizados no acompanhamento do paciente.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound size={30} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Maria Oliveira
                  </h2>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Ativo
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  8 anos • Feminino
                </p>
              </div>
            </div>

            <PatientInfo
              icon={<ClipboardList size={20} />}
              label="Diagnóstico"
              value="TEA - Nível 1 de Suporte"
            />

            <PatientInfo
              icon={<FileText size={20} />}
              label="Plano Terapêutico"
              value="Plano ativo"
            />

            <PatientInfo
              icon={<CalendarDays size={20} />}
              label="Última evolução"
              value="05/08/2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <SessionDataSection />
          <SessionObjectivesSection />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <EvolutionWrittenSection />
          <ReferralSection />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <ObservedImpactsSection />
          <SessionResultSection />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <EvolutionAttachmentsSection />
          <ProfessionalSignatureSection />
        </div>

        <div className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="secondary"
          >
            Salvar rascunho
          </Button>

          <Button type="button">
            Salvar e Finalizar Evolução
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SessionDataSection() {
  return (
    <PageCard
      title="1. Dados da Sessão"
      description="Informações do atendimento realizado."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FormField
          label="Data do atendimento"
          required
        >
          <Input type="date" />
        </FormField>

        <FormField
          label="Hora início"
          required
        >
          <Input type="time" />
        </FormField>

        <FormField label="Hora fim">
          <Input type="time" />
        </FormField>

        <FormField
          label="Especialidade"
          required
        >
          <Select defaultValue="Psicologia">
            <option value="Psicologia">
              Psicologia
            </option>

            <option value="Fonoaudiologia">
              Fonoaudiologia
            </option>

            <option value="Terapia Ocupacional">
              Terapia Ocupacional
            </option>

            <option value="Fisioterapia">
              Fisioterapia
            </option>
          </Select>
        </FormField>

        <FormField
          label="Tipo de atendimento"
          required
        >
          <Select defaultValue="Individual">
            <option value="Individual">
              Individual
            </option>

            <option value="Grupo">
              Grupo
            </option>

            <option value="Avaliação">
              Avaliação
            </option>
          </Select>
        </FormField>

        <FormField label="Local do atendimento">
          <Select defaultValue="Clinica">
            <option value="Clinica">
              Clínica
            </option>

            <option value="Domiciliar">
              Domiciliar
            </option>

            <option value="Online">
              Online
            </option>
          </Select>
        </FormField>
      </div>
    </PageCard>
  );
}

function SessionObjectivesSection() {
  const objectives = [
    {
      id: 1,
      name: "Comunicação funcional",
      status: "Em evolução",
      performance: 4,
    },
    {
      id: 2,
      name: "Interação social",
      status: "Em evolução",
      performance: 3,
    },
    {
      id: 3,
      name: "Autorregulação emocional",
      status: "Alcançado",
      performance: 5,
    },
    {
      id: 4,
      name: "Autonomia nas atividades",
      status: "Parcialmente alcançado",
      performance: 3,
    },
    {
      id: 5,
      name: "Atenção e concentração",
      status: "Em evolução",
      performance: 4,
    },
  ];

  return (
    <PageCard
      title="2. Indicadores da Sessão"
      description="Objetivos terapêuticos trabalhados no atendimento."
    >
      <div className="space-y-3">
        <div className="hidden grid-cols-[1fr_190px_150px] gap-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Objetivo</span>
          <span>Status na sessão</span>
          <span>Desempenho</span>
        </div>

        {objectives.map((objective) => (
          <div
            key={objective.id}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-3 md:grid-cols-[1fr_190px_150px] md:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-indigo-500" />

              <span className="text-sm font-medium text-slate-800">
                {objective.name}
              </span>
            </div>

            <Select defaultValue={objective.status}>
              <option value="Em evolução">
                Em evolução
              </option>

              <option value="Alcançado">
                Alcançado
              </option>

              <option value="Parcialmente alcançado">
                Parcialmente alcançado
              </option>

              <option value="Regressão">
                Regressão
              </option>
            </Select>

            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-amber-500">
                {"★".repeat(objective.performance)}

                <span className="text-slate-200">
                  {"★".repeat(5 - objective.performance)}
                </span>
              </span>

              <Select
                defaultValue={String(objective.performance)}
                className="w-16"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Select>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="mt-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          + Adicionar objetivo à sessão
        </button>
      </div>
    </PageCard>
  );
}

interface PatientInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PatientInfo({
  icon,
  label,
  value,
}: PatientInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}