import {
  AlertTriangle,
  ArrowRight,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  listarObjetivos,
  paraTherapeuticObjective,
  type FrontObjectiveStatus as ObjectiveStatus,
  type RealObjective,
} from "@/services/objetivos";

/* =========================================
   COMPONENTE
========================================= */

export function PatientActiveGoals() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const patientId =
    id ?? "";

  /* =======================================
     OBJETIVOS ATIVOS
  ======================================= */

  const [allObjectives, setAllObjectives] = useState<RealObjective[]>([]);

  useEffect(() => {
    if (!patientId) return;

    listarObjetivos(patientId)
      .then((resposta) => setAllObjectives(resposta.dados.map(paraTherapeuticObjective)))
      .catch(() => {});
  }, [patientId]);

  const goals =
    useMemo(
      () => {
        if (
          !patientId
        ) {
          return [];
        }

        return allObjectives
          .filter(
            (objective) =>
              objective.status === "Em evolução" ||
              objective.status === "Com regressão"
          )
          .sort(
            (
              a,
              b
            ) => {
              /*
               * Objetivos com regressão
               * aparecem primeiro, pois
               * demandam maior atenção.
               */

              if (
                a.status ===
                  "Com regressão" &&
                b.status !==
                  "Com regressão"
              ) {
                return -1;
              }

              if (
                b.status ===
                  "Com regressão" &&
                a.status !==
                  "Com regressão"
              ) {
                return 1;
              }

              return (
                new Date(
                  b.updatedAt
                ).getTime() -
                new Date(
                  a.updatedAt
                ).getTime()
              );
            }
          )
          .slice(
            0,
            3
          );
      },
      [
        patientId,
        allObjectives,
      ]
    );

  /* =======================================
     VER TODOS
  ======================================= */

  function handleViewAll() {
    if (
      !patientId
    ) {
      return;
    }

    /*
     * Vamos utilizar este parâmetro
     * para abrir diretamente a aba
     * Objetivos no PerfilPaciente.
     *
     * No próximo ajuste do PerfilPaciente
     * ele passará a ler ?tab=objetivos.
     */

    navigate(
      `/pacientes/${patientId}?tab=objetivos`
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Objetivos ativos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhamento terapêutico atual.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Target
            size={20}
          />
        </div>
      </div>

      {/* ================================= */}
      {/* OBJETIVOS */}
      {/* ================================= */}

      {goals.length >
      0 ? (
        <div className="space-y-5">
          {goals.map(
            (
              goal
            ) => (
              <GoalItem
                key={
                  goal.id
                }
                title={
                  goal.title
                }
                specialty={
                  goal.specialty
                }
                professional={
                  goal.professional
                }
                progress={
                  goal.progress
                }
                status={
                  goal.status
                }
              />
            )
          )}
        </div>
      ) : (
        /* ================================= */
        /* ESTADO VAZIO */
        /* ================================= */

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
          <Target
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 font-semibold text-slate-700">
            Nenhum objetivo ativo
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Este paciente ainda não possui objetivos terapêuticos em acompanhamento.
          </p>
        </div>
      )}

      {/* ================================= */}
      {/* VER TODOS */}
      {/* ================================= */}

      <button
        type="button"
        onClick={
          handleViewAll
        }
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
      >
        Ver todos os objetivos

        <ArrowRight
          size={16}
        />
      </button>
    </div>
  );
}

/* =========================================
   OBJETIVO
========================================= */

interface GoalItemProps {
  title:
    string;

  specialty:
    string;

  professional:
    string;

  progress:
    number;

  status:
    ObjectiveStatus;
}

function GoalItem({
  title,

  specialty,

  professional,

  progress,

  status,
}: GoalItemProps) {
  const isRegression =
    status ===
    "Com regressão";

  return (
    <div>
      {/* ================================= */}
      {/* INFORMAÇÕES */}
      {/* ================================= */}

      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-800">
              {
                title
              }
            </p>

            {isRegression && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                <AlertTriangle
                  size={11}
                />

                Regressão
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {
              specialty
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              professional
            }
          </p>
        </div>

        <span
          className={`shrink-0 text-sm font-semibold ${
            isRegression
              ? "text-red-600"
              : "text-violet-600"
          }`}
        >
          {
            progress
          }
          %
        </span>
      </div>

      {/* ================================= */}
      {/* PROGRESSO */}
      {/* ================================= */}

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={
            getProgressClass(
              status
            )
          }
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>

      {/* ================================= */}
      {/* STATUS */}
      {/* ================================= */}

      <div className="mt-2 flex items-center gap-1 text-xs">
        {isRegression ? (
          <>
            <AlertTriangle
              size={12}
              className="text-red-500"
            />

            <span className="font-medium text-red-600">
              Com regressão
            </span>
          </>
        ) : (
          <>
            <TrendingUp
              size={12}
              className="text-violet-500"
            />

            <span className="font-medium text-violet-600">
              Em evolução
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================
   COR DO PROGRESSO
========================================= */

function getProgressClass(
  status:
    ObjectiveStatus
) {
  const base =
    "h-full rounded-full transition-all";

  if (
    status ===
    "Com regressão"
  ) {
    return `${base} bg-red-500`;
  }

  return `${base} bg-violet-600`;
}