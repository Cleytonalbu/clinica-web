import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
} from "@/components/ui";

import {
  getEvolutionsByPatientId,
  type StoredEvolution,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getProfessionalSpecialty,
} from "@/pages/Pacientes/patientAccessRules";

/* =========================================
   COMPONENTE
========================================= */

export function PatientEvolutions() {
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

  const isGestor =
    user?.profile ===
    "Gestor";

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

  const evolutions =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <=
            0
        ) {
          return [];
        }

        const all =
          getEvolutionsByPatientId(
            patientId
          );

        if (
          !isProfissional
        ) {
          return all;
        }

        return all.filter(
          (
            evolution
          ) =>
            evolution.professional ===
              loggedProfessionalName &&
            (
              !professionalSpecialty ||
              evolution.specialty ===
                professionalSpecialty
            )
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
        patientId,
        professionalSpecialty,
      ]
    );

  const finalized =
    evolutions.filter(
      (
        evolution
      ) =>
        evolution.status ===
        "FINALIZADA"
    ).length;

  const drafts =
    evolutions.filter(
      (
        evolution
      ) =>
        evolution.status ===
        "RASCUNHO"
    ).length;

  const attachments =
    evolutions.reduce(
      (
        total,
        evolution
      ) =>
        total +
        evolution.attachments.length,
      0
    );

  const canCreate =
    isGestor ||
    isProfissional;

  function handleNewEvolution() {
    if (
      !canCreate ||
      !Number.isFinite(
        patientId
      )
    ) {
      return;
    }

    navigate(
      `/pacientes/${patientId}/evolucoes/nova`
    );
  }

  function handleView(
    evolutionId:
      number
  ) {
    navigate(
      `/pacientes/${patientId}/evolucoes/${evolutionId}`
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Evoluções Clínicas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Histórico dos atendimentos e registros clínicos do paciente.
          </p>

          {isProfissional && (
            <p className="mt-2 text-xs font-semibold text-violet-600">
              Exibindo somente suas evoluções de {professionalSpecialty || "sua especialidade"}.
            </p>
          )}
        </div>

        {canCreate && (
          <Button
            type="button"
            onClick={
              handleNewEvolution
            }
          >
            <Plus
              size={18}
            />

            Nova evolução
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Registros"
          value={String(
            evolutions.length
          )}
          description="Evoluções acessíveis"
          icon={
            <ClipboardList
              size={21}
            />
          }
          iconClassName="bg-violet-100 text-violet-600"
        />

        <SummaryCard
          title="Finalizadas"
          value={String(
            finalized
          )}
          description="Registros concluídos"
          icon={
            <CheckCircle2
              size={21}
            />
          }
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Rascunhos"
          value={String(
            drafts
          )}
          description="Registros em andamento"
          icon={
            <FileText
              size={21}
            />
          }
          iconClassName="bg-amber-100 text-amber-600"
        />

        <SummaryCard
          title="Anexos"
          value={String(
            attachments
          )}
          description="Arquivos vinculados"
          icon={
            <FileText
              size={21}
            />
          }
          iconClassName="bg-blue-100 text-blue-600"
        />
      </div>

      {evolutions.length >
      0 ? (
        <div className="space-y-4">
          {evolutions.map(
            (
              evolution
            ) => (
              <EvolutionCard
                key={
                  evolution.id
                }
                evolution={
                  evolution
                }
                onView={() =>
                  handleView(
                    evolution.id
                  )
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/60 to-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <ClipboardList
              size={26}
            />
          </div>

          <h3 className="mt-4 font-bold text-slate-800">
            Nenhuma evolução disponível
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            {isProfissional
              ? "Ainda não existem evoluções vinculadas ao seu perfil para este paciente."
              : "As evoluções clínicas registradas para este paciente aparecerão aqui."}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================
   CARD
========================================= */

function EvolutionCard({
  evolution,
  onView,
}: {
  evolution:
    StoredEvolution;

  onView:
    () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                evolution.status
              }
            />

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {evolution.appointmentType || "Atendimento"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              icon={
                <CalendarDays
                  size={17}
                />
              }
              label="Data"
              value={
                formatDate(
                  evolution.sessionDate
                )
              }
            />

            <InfoItem
              icon={
                <Stethoscope
                  size={17}
                />
              }
              label="Especialidade"
              value={
                evolution.specialty ||
                "—"
              }
            />

            <InfoItem
              icon={
                <UserRound
                  size={17}
                />
              }
              label="Profissional"
              value={
                evolution.professional ||
                "—"
              }
            />

            <InfoItem
              icon={
                <ClipboardList
                  size={17}
                />
              }
              label="Objetivos"
              value={`${evolution.objectives.length} trabalhado(s)`}
            />
          </div>

          {evolution.writtenEvolution && (
            <p className="mt-4 line-clamp-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              {
                evolution.writtenEvolution
              }
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={
            onView
          }
        >
          <Eye
            size={16}
          />

          Ver evolução
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  iconClassName:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {
              title
            }
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              value
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              description
            }
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        {
          icon
        }
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {
            label
          }
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {
            value
          }
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    StoredEvolution["status"];
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
        status ===
        "FINALIZADA"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status ===
      "FINALIZADA"
        ? "Finalizada"
        : "Rascunho"}
    </span>
  );
}

function formatDate(
  value:
    string
) {
  if (
    !value
  ) {
    return "—";
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