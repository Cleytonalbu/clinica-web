import {
  CalendarDays,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Target,
  UserRound,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import type { Evolution } from "./types";

interface EvolutionCardProps {
  evolution: Evolution;
}

export function EvolutionCard({
  evolution,
}: EvolutionCardProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleViewDetails() {
    navigate(
      `/pacientes/${id}/evolucoes/${evolution.id}`
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <UserRound size={21} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-slate-900">
                {evolution.specialty}
              </h3>

              <StatusBadge status={evolution.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {evolution.professional}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} />
                {evolution.sessionDate}
              </span>

              <span>{evolution.createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">
          <Target size={16} />
          {evolution.objective}
        </div>
      </div>

      <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
        <Section
          icon={<MessageSquareText size={17} />}
          title="Descrição da sessão"
          content={evolution.description}
        />

        <Section
          icon={<CheckCircle2 size={17} />}
          title="Resposta do paciente"
          content={evolution.patientResponse}
        />

        <Section
          icon={<UserRound size={17} />}
          title="Orientações para família"
          content={evolution.familyGuidance}
        />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText size={16} />
          {evolution.attachments}{" "}
          {evolution.attachments === 1
            ? "anexo"
            : "anexos"}
        </div>

        <button
          type="button"
          onClick={handleViewDetails}
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function Section({
  icon,
  title,
  content,
}: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-indigo-500">
          {icon}
        </span>

        {title}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {content}
      </p>
    </div>
  );
}

interface StatusBadgeProps {
  status: Evolution["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<
    Evolution["status"],
    string
  > = {
    Registrada:
      "bg-emerald-100 text-emerald-700",

    Revisada:
      "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}