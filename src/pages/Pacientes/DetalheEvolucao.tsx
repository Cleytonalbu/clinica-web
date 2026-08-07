import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  PenLine,
  Target,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  PageCard,
} from "@/components/ui";

import { evolutions } from "@/components/pacientes/profile/evolutions/mock";

export default function DetalheEvolucao() {
  const navigate = useNavigate();

  const {
    id: patientId,
    evolutionId,
  } = useParams();

  const evolution = evolutions.find(
    (item) =>
      item.id === Number(evolutionId)
  );

  function handleBack() {
    navigate(`/pacientes/${patientId}`);
  }

  if (!evolution) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Evolução não encontrada
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O registro solicitado não está disponível.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={handleBack}
          >
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para evoluções
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Evolução Clínica
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Visualização completa do registro clínico.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              {evolution.status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound size={30} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Maria Oliveira
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Paciente #{patientId}
                </p>
              </div>
            </div>

            <Info
              icon={<CalendarDays size={19} />}
              label="Data"
              value={evolution.sessionDate}
            />

            <Info
              icon={<ClipboardList size={19} />}
              label="Especialidade"
              value={evolution.specialty}
            />

            <Info
              icon={<UserRound size={19} />}
              label="Profissional"
              value={evolution.professional}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="1. Dados da Sessão"
            description="Informações principais do atendimento."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info
                icon={<CalendarDays size={18} />}
                label="Data"
                value={evolution.sessionDate}
              />

              <Info
                icon={<ClipboardList size={18} />}
                label="Horário"
                value={evolution.createdAt}
              />

              <Info
                icon={<ClipboardList size={18} />}
                label="Especialidade"
                value={evolution.specialty}
              />

              <Info
                icon={<UserRound size={18} />}
                label="Profissional"
                value={evolution.professional}
              />
            </div>
          </PageCard>

          <PageCard
            title="2. Objetivo trabalhado"
            description="Objetivo terapêutico relacionado à sessão."
          >
            <div className="flex items-start gap-4 rounded-xl bg-violet-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Target size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {evolution.objective}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Objetivo vinculado ao plano terapêutico.
                </p>
              </div>
            </div>
          </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="3. Evolução Escrita"
            description="Registro clínico da sessão."
          >
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {evolution.description}
            </p>
          </PageCard>

          <PageCard
            title="4. Resposta do Paciente"
            description="Comportamento observado durante a sessão."
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 text-emerald-600"
              />

              <p className="text-sm leading-7 text-slate-600">
                {evolution.patientResponse}
              </p>
            </div>
          </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="5. Orientações para Família"
            description="Recomendações registradas pelo profissional."
          >
            <p className="text-sm leading-7 text-slate-600">
              {evolution.familyGuidance}
            </p>
          </PageCard>

          <PageCard
            title="6. Anexos"
            description="Arquivos vinculados à evolução."
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FileText size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {evolution.attachments} arquivo(s)
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Anexos da sessão
                </p>
              </div>
            </div>
          </PageCard>
        </div>

        <PageCard
          title="7. Assinatura do Profissional"
          description="Registro de autoria da evolução."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Profissional
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {evolution.professional}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assinatura
              </p>

              <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
                <PenLine size={20} />

                <span className="ml-2 font-medium italic">
                  {evolution.professional}
                </span>
              </div>
            </div>
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

interface InfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Info({
  icon,
  label,
  value,
}: InfoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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