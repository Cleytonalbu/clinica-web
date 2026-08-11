import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  Target,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  StoredEvolution,
} from "@/pages/Pacientes/evolutionStorage";

/* =========================================
   PROPS
========================================= */

interface EvolutionCardProps {
  evolution:
    StoredEvolution;
}

/* =========================================
   COMPONENTE
========================================= */

export function EvolutionCard({
  evolution,
}: EvolutionCardProps) {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  /* =======================================
     DETALHES
  ======================================= */

  function handleViewDetails() {
    navigate(
      `/pacientes/${id}/evolucoes/${evolution.id}`
    );
  }

  /* =======================================
     OBJETIVO PRINCIPAL
  ======================================= */

  const mainObjective =
    evolution.objectives[0];

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <UserRound
              size={21}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-slate-900">
                {
                  evolution.specialty ||
                  "Especialidade não informada"
                }
              </h3>

              <StatusBadge
                status={
                  evolution.status
                }
              />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {
                evolution.professional ||
                "Profissional não informado"
              }
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CalendarDays
                  size={15}
                />

                {
                  formatDate(
                    evolution.sessionDate
                  )
                }
              </span>

              <span className="flex items-center gap-2">
                <Clock3
                  size={15}
                />

                {
                  evolution.startTime ||
                  "-"
                }
              </span>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* OBJETIVO */}
        {/* ================================= */}

        {mainObjective && (
          <div className="flex max-w-full items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">
            <Target
              size={16}
              className="shrink-0"
            />

            <span className="break-words">
              {
                mainObjective.name
              }
            </span>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* CONTEÚDO */}
      {/* ================================= */}

      <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
        <Section
          icon={
            <MessageSquareText
              size={17}
            />
          }
          title="Evolução escrita"
          content={
            evolution.writtenEvolution
          }
          emptyText="Nenhuma evolução escrita registrada."
        />

        <Section
          icon={
            <CheckCircle2
              size={17}
            />
          }
          title="Resultado da sessão"
          content={
            evolution.sessionResult
          }
        />

        {evolution.sessionResultObservation && (
          <Section
            icon={
              <MessageSquareText
                size={17}
              />
            }
            title="Observação do resultado"
            content={
              evolution.sessionResultObservation
            }
          />
        )}

        {evolution.observedImpacts.length >
          0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="text-indigo-500">
                <Target
                  size={17}
                />
              </span>

              Impactos observados
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {evolution.observedImpacts.map(
                (
                  impact
                ) => (
                  <span
                    key={
                      impact
                    }
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {
                      impact
                    }
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* RODAPÉ */}
      {/* ================================= */}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText
            size={16}
          />

          {
            evolution.attachments.length
          }{" "}
          {evolution.attachments.length ===
          1
            ? "anexo"
            : "anexos"}
        </div>

        <button
          type="button"
          onClick={
            handleViewDetails
          }
          className="text-left text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:text-right"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}

/* =========================================
   SEÇÃO
========================================= */

interface SectionProps {
  icon:
    React.ReactNode;

  title:
    string;

  content:
    string;

  emptyText?:
    string;
}

function Section({
  icon,
  title,
  content,
  emptyText =
    "Não informado.",
}: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-indigo-500">
          {
            icon
          }
        </span>

        {
          title
        }
      </div>

      <p
        className={`mt-2 text-sm leading-relaxed ${
          content
            ? "text-slate-500"
            : "italic text-slate-400"
        }`}
      >
        {content ||
          emptyText}
      </p>
    </div>
  );
}

/* =========================================
   STATUS
========================================= */

interface StatusBadgeProps {
  status:
    StoredEvolution["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles:
    Record<
      StoredEvolution["status"],
      string
    > = {
    RASCUNHO:
      "bg-amber-100 text-amber-700",

    FINALIZADA:
      "bg-emerald-100 text-emerald-700",
  };

  const labels:
    Record<
      StoredEvolution["status"],
      string
    > = {
    RASCUNHO:
      "Rascunho",

    FINALIZADA:
      "Finalizada",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        labels[
          status
        ]
      }
    </span>
  );
}

/* =========================================
   FORMATAR DATA
========================================= */

function formatDate(
  value:
    string
) {
  if (
    !value
  ) {
    return "-";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}