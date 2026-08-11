import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Plus,
  Target,
  TrendingUp,
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
  PageCard,
} from "@/components/ui";

import {
  getObjectivesByPatientId,
  type ObjectiveStatus,
  type TherapeuticObjective,
} from "@/pages/Pacientes/objectiveStorage";

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientObjectives() {
  const {
    user,
  } =
    useAuth();

  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     PERFIL
  ======================================= */

  const isProfissional =
    user?.profile ===
    "Profissional";

  /*
   * O acompanhamento terapêutico é
   * atualizado pelo profissional.
   *
   * O Gestor possui visão gerencial,
   * mas não altera diretamente o
   * registro terapêutico.
   */

  const canManageObjectives =
    isProfissional;

  /* =======================================
     OBJETIVOS DO PACIENTE
  ======================================= */

  const objectives =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          )
        ) {
          return [];
        }

        return getObjectivesByPatientId(
          patientId
        ).sort(
          (
            a,
            b
          ) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
      },
      [
        patientId,
      ]
    );

  /* =======================================
     RESUMOS
  ======================================= */

  const activeObjectives =
    objectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Em evolução"
    );

  const achievedObjectives =
    objectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Atingido"
    );

  const regressionObjectives =
    objectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Com regressão"
    );

  /* =======================================
     NOVO OBJETIVO
  ======================================= */

  function handleNewObjective() {
    if (
      !canManageObjectives ||
      !patientId
    ) {
      return;
    }

    navigate(
      `/pacientes/${patientId}/objetivos/novo`
    );
  }

  /* =======================================
     DETALHES
  ======================================= */

  function handleDetails(
    objective:
      TherapeuticObjective
  ) {
    /*
     * Na próxima etapa vamos criar
     * detalhes/atualização do objetivo.
     *
     * Por enquanto mantemos o objetivo
     * real preparado para essa integração.
     */

    console.log(
      "Detalhes do objetivo:",
      objective.id
    );
  }

  /* =======================================
     ATUALIZAR
  ======================================= */

  function handleUpdate(
    objective:
      TherapeuticObjective
  ) {
    if (
      !canManageObjectives
    ) {
      return;
    }

    /*
     * Na próxima etapa vamos substituir
     * isto pela tela/modal de atualização.
     */

    console.log(
      "Atualizar objetivo:",
      objective.id
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Objetivos Terapêuticos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os objetivos, progresso e resultados do paciente.
          </p>
        </div>

        {/* ================================= */}
        {/* NOVO OBJETIVO */}
        {/* SOMENTE PROFISSIONAL */}
        {/* ================================= */}

        {canManageObjectives && (
          <Button
            type="button"
            onClick={
              handleNewObjective
            }
          >
            <Plus
              size={18}
            />

            Novo objetivo
          </Button>
        )}
      </div>

      {/* ================================= */}
      {/* INDICADORES */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Em evolução"
          value={String(
            activeObjectives.length
          )}
          description="Objetivos em acompanhamento"
          icon={
            <TrendingUp
              size={22}
            />
          }
          iconClassName="bg-amber-100 text-amber-600"
        />

        <SummaryCard
          title="Atingidos"
          value={String(
            achievedObjectives.length
          )}
          description="Objetivos concluídos"
          icon={
            <CheckCircle2
              size={22}
            />
          }
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Com regressão"
          value={String(
            regressionObjectives.length
          )}
          description="Precisam de atenção"
          icon={
            <AlertTriangle
              size={22}
            />
          }
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* ================================= */}
      {/* OBJETIVOS */}
      {/* ================================= */}

      <PageCard
        title="Objetivos"
        description={
          objectives.length > 0
            ? `${objectives.length} objetivo${
                objectives.length ===
                1
                  ? ""
                  : "s"
              } cadastrado${
                objectives.length ===
                1
                  ? ""
                  : "s"
              } para este paciente.`
            : "Nenhum objetivo terapêutico cadastrado."
        }
      >
        {/* ================================= */}
        {/* LISTA */}
        {/* ================================= */}

        {objectives.length >
        0 ? (
          <div className="space-y-4">
            {objectives.map(
              (
                objective
              ) => (
                <ObjectiveCard
                  key={
                    objective.id
                  }
                  objective={
                    objective
                  }
                  canManage={
                    canManageObjectives
                  }
                  onDetails={
                    handleDetails
                  }
                  onUpdate={
                    handleUpdate
                  }
                />
              )
            )}
          </div>
        ) : (
          /* ================================= */
          /* ESTADO VAZIO */
          /* ================================= */

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Target
                size={22}
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Nenhum objetivo terapêutico
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ainda não existem objetivos terapêuticos cadastrados para este paciente.
            </p>

            {canManageObjectives && (
              <Button
                type="button"
                className="mt-5"
                onClick={
                  handleNewObjective
                }
              >
                <Plus
                  size={17}
                />

                Criar primeiro objetivo
              </Button>
            )}
          </div>
        )}
      </PageCard>
    </div>
  );
}

/* =========================================
   CARD DO OBJETIVO
========================================= */

interface ObjectiveCardProps {
  objective:
    TherapeuticObjective;

  canManage:
    boolean;

  onDetails: (
    objective:
      TherapeuticObjective
  ) => void;

  onUpdate: (
    objective:
      TherapeuticObjective
  ) => void;
}

function ObjectiveCard({
  objective,

  canManage,

  onDetails,

  onUpdate,
}: ObjectiveCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 transition hover:border-violet-200 hover:bg-violet-50/20">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        {/* ================================= */}
        {/* CONTEÚDO */}
        {/* ================================= */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Target
                size={19}
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">
                {
                  objective.title
                }
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {
                  objective.specialty
                }{" "}
                •{" "}
                {
                  objective.professional
                }
              </p>
            </div>

            <StatusBadge
              status={
                objective.status
              }
            />
          </div>

          {/* ================================= */}
          {/* PROGRESSO */}
          {/* ================================= */}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">
                Progresso
              </span>

              <span className="text-sm font-bold text-violet-600">
                {
                  objective.progress
                }
                %
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={
                  getProgressClass(
                    objective.status
                  )
                }
                style={{
                  width: `${objective.progress}%`,
                }}
              />
            </div>
          </div>

          {/* ================================= */}
          {/* DATAS */}
          {/* ================================= */}

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-400">
                Início
              </span>

              <span className="mt-1 block font-medium text-slate-700">
                {
                  formatDate(
                    objective.startDate
                  )
                }
              </span>
            </div>

            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-400">
                Previsão
              </span>

              <span className="mt-1 block font-medium text-slate-700">
                {
                  formatDate(
                    objective.targetDate
                  )
                }
              </span>
            </div>
          </div>

          {/* ================================= */}
          {/* OBSERVAÇÃO */}
          {/* ================================= */}

          {objective.observation && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Observação
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  objective.observation
                }
              </p>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* AÇÕES */}
        {/* ================================= */}

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              onDetails(
                objective
              )
            }
          >
            Detalhes
          </Button>

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() =>
                onUpdate(
                  objective
                )
              }
            >
              Atualizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   CARD DE RESUMO
========================================= */

interface SummaryCardProps {
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
}

function SummaryCard({
  title,

  value,

  description,

  icon,

  iconClassName,
}: SummaryCardProps) {
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

/* =========================================
   STATUS
========================================= */

interface StatusBadgeProps {
  status:
    ObjectiveStatus;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles:
    Record<
      ObjectiveStatus,
      string
    > = {
    "Em evolução":
      "bg-amber-100 text-amber-700",

    Atingido:
      "bg-emerald-100 text-emerald-700",

    "Com regressão":
      "bg-red-100 text-red-700",
  };

  const icons:
    Record<
      ObjectiveStatus,
      React.ReactNode
    > = {
    "Em evolução": (
      <TrendingUp
        size={13}
      />
    ),

    Atingido: (
      <CheckCircle2
        size={13}
      />
    ),

    "Com regressão": (
      <CircleDot
        size={13}
      />
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        icons[
          status
        ]
      }

      {
        status
      }
    </span>
  );
}

/* =========================================
   COR DA BARRA DE PROGRESSO
========================================= */

function getProgressClass(
  status:
    ObjectiveStatus
) {
  const base =
    "h-full rounded-full transition-all duration-300";

  if (
    status ===
    "Atingido"
  ) {
    return `${base} bg-emerald-500`;
  }

  if (
    status ===
    "Com regressão"
  ) {
    return `${base} bg-red-500`;
  }

  return `${base} bg-violet-600`;
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