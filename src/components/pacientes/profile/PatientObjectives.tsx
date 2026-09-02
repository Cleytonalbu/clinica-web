import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  LineChart,
  Layers3,
  Plus,
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
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  PageCard,
  Select,
} from "@/components/ui";

import {
  listarObjetivos,
  paraTherapeuticObjective,
  type FrontObjectiveStatus as ObjectiveStatus,
  type RealObjective as TherapeuticObjective,
} from "@/services/objetivos";

interface ObjectiveGroup {
  generalObjective: string;
  objectives: TherapeuticObjective[];
}

import {
  getFinalizedEvolutionsByPatientId,
} from "@/pages/Pacientes/evolutionStorage";

import {
  getEvolutionObjectiveMarkerScore,
} from "@/components/pacientes/profile/evolutions/evolutionForm.types";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientObjectives() {
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
    id ?? "";

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
   * O Gestor possui visão gerencial.
   */
  const canManageObjectives =
    isProfissional;

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const loggedProfessional =
    useMemo(
      () =>
        isProfissional
          ? getActiveProfessionals().find(
              (
                professional
              ) =>
                professional.name ===
                loggedProfessionalName
            )
          : undefined,
      [
        isProfissional,
        loggedProfessionalName,
      ]
    );

  const professionalSpecialty =
    loggedProfessional?.specialty ??
    "";

  /* =======================================
     DADOS
  ======================================= */

  const [objectives, setObjectives] = useState<TherapeuticObjective[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoadingObjectives(false);
      return;
    }

    let cancelado = false;
    setLoadingObjectives(true);

    listarObjetivos(patientId)
      .then((resposta) => {
        if (cancelado) return;
        setObjectives(resposta.dados.map(paraTherapeuticObjective));
      })
      .catch(() => {})
      .finally(() => {
        if (cancelado) return;
        setLoadingObjectives(false);
      });

    return () => {
      cancelado = true;
    };
  }, [patientId]);

  const visibleObjectives =
    useMemo(
      () => {
        if (
          !isProfissional
        ) {
          return objectives;
        }

        return objectives.filter(
          (
            objective
          ) =>
            objective.professional ===
              loggedProfessionalName &&
            (
              !professionalSpecialty ||
              objective.specialty ===
                professionalSpecialty
            )
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
        objectives,
        professionalSpecialty,
      ]
    );

  const objectiveGroups =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            TherapeuticObjective[]
          >();

        visibleObjectives.forEach(
          (
            objective
          ) => {
            const key =
              objective.generalObjective.trim() ||
              "Objetivo terapêutico geral";

            groups.set(
              key,
              [
                ...(
                  groups.get(
                    key
                  ) ??
                  []
                ),
                objective,
              ]
            );
          }
        );

        return Array.from(
          groups.entries()
        ).map(
          ([
            generalObjective,
            groupedObjectives,
          ]) => ({
            generalObjective,

            objectives:
              groupedObjectives,
          })
        );
      },
      [
        visibleObjectives,
      ]
    );

  const finalizedEvolutions =
    useMemo(
      () => {
        if (
          !patientId
        ) {
          return [];
        }

        // Evoluções ainda são mock (IDs numéricos) — paciente real (UUID)
        // nunca bate, então isso retorna [] até Evoluções ser migrado.
        const all =
          getFinalizedEvolutionsByPatientId(
            Number(patientId) || -1
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

  /* =======================================
     RESUMOS
  ======================================= */

  const activeObjectives =
    visibleObjectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Em evolução"
    );

  const achievedObjectives =
    visibleObjectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Atingido"
    );

  const regressionObjectives =
    visibleObjectives.filter(
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
            Acompanhe objetivos gerais, objetivos específicos e o progresso terapêutico do paciente.
          </p>

          {isProfissional && (
            <p className="mt-2 text-xs font-semibold text-violet-600">
              Visualização restrita a {professionalSpecialty || "sua especialidade"} e aos objetivos vinculados a {loggedProfessionalName}.
            </p>
          )}
        </div>

        {canManageObjectives && (
          <Button
            type="button"
            onClick={
              handleNewObjective
            }
          >
            <Plus
              size={
                18
              }
            />

            Novo objetivo
          </Button>
        )}
      </div>

      {loadingObjectives && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
          Carregando objetivos…
        </div>
      )}

      {/* ================================= */}
      {/* INDICADORES */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Objetivos gerais"
          value={String(
            objectiveGroups.length
          )}
          description="Metas terapêuticas amplas"
          icon={
            <Layers3
              size={
                22
              }
            />
          }
          iconClassName="bg-violet-100 text-violet-600"
        />

        <SummaryCard
          title="Em evolução"
          value={String(
            activeObjectives.length
          )}
          description="Objetivos específicos em acompanhamento"
          icon={
            <TrendingUp
              size={
                22
              }
            />
          }
          iconClassName="bg-amber-100 text-amber-600"
        />

        <SummaryCard
          title="Atingidos"
          value={String(
            achievedObjectives.length
          )}
          description="Objetivos específicos concluídos"
          icon={
            <CheckCircle2
              size={
                22
              }
            />
          }
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Com regressão"
          value={String(
            regressionObjectives.length
          )}
          description="Objetivos que precisam de atenção"
          icon={
            <AlertTriangle
              size={
                22
              }
            />
          }
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* ================================= */}
      {/* HIERARQUIA DOS OBJETIVOS */}
      {/* ================================= */}

      <PageCard
        title="Plano de objetivos"
        description="Cada objetivo geral reúne os objetivos específicos trabalhados durante os atendimentos."
      >
        {objectiveGroups.length >
        0 ? (
          <div className="space-y-5">
            {objectiveGroups.map(
              (
                group,
                index
              ) => (
                <GeneralObjectiveCard
                  key={`${group.generalObjective}-${index}`}
                  group={
                    group
                  }
                  defaultOpen={
                    true
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptyObjectives
            canManage={
              canManageObjectives
            }
            onNewObjective={
              handleNewObjective
            }
          />
        )}
      </PageCard>

      <TherapeuticEvolutionCharts
        objectives={
          visibleObjectives
        }
        evolutions={
          finalizedEvolutions
        }
      />
    </div>
  );
}

/* =========================================
   GRÁFICOS DE EVOLUÇÃO
========================================= */

type ChartView =
  | "specific"
  | "general"
  | "specialty"
  | "overall";

interface ChartPoint {
  label:
    string;

  date:
    string;

  value:
    number;

  statusLabel?:
    string;
}

interface TherapeuticEvolutionChartsProps {
  objectives:
    TherapeuticObjective[];

  evolutions:
    ReturnType<
      typeof getFinalizedEvolutionsByPatientId
    >;
}

function TherapeuticEvolutionCharts({
  objectives,
  evolutions,
}: TherapeuticEvolutionChartsProps) {
  const [
    view,
    setView,
  ] =
    useState<ChartView>(
      "specific"
    );

  const [
    selectedObjectiveId,
    setSelectedObjectiveId,
  ] =
    useState(
      ""
    );

  const [
    selectedGeneralObjective,
    setSelectedGeneralObjective,
  ] =
    useState(
      ""
    );

  const [
    selectedSpecialty,
    setSelectedSpecialty,
  ] =
    useState(
      ""
    );

  const generalObjectives =
    useMemo(
      () =>
        Array.from(
          new Set(
            objectives
              .map(
                (
                  objective
                ) =>
                  objective.generalObjective
              )
              .filter(
                Boolean
              )
          )
        ),
      [
        objectives,
      ]
    );

  const specialties =
    useMemo(
      () =>
        Array.from(
          new Set(
            objectives
              .map(
                (
                  objective
                ) =>
                  objective.specialty
              )
              .filter(
                Boolean
              )
          )
        ),
      [
        objectives,
      ]
    );

  const effectiveObjectiveId =
    selectedObjectiveId ||
    String(
      objectives[0]?.id ??
      ""
    );

  const effectiveGeneralObjective =
    selectedGeneralObjective ||
    generalObjectives[0] ||
    "";

  const effectiveSpecialty =
    selectedSpecialty ||
    specialties[0] ||
    "";

  const chartPoints =
    useMemo(
      () => {
        if (
          view ===
          "specific"
        ) {
          const objectiveId =
            Number(
              effectiveObjectiveId
            );

          return buildSpecificObjectiveSeries(
            evolutions,
            objectiveId
          );
        }

        if (
          view ===
          "general"
        ) {
          const objectiveIds =
            objectives
              .filter(
                (
                  objective
                ) =>
                  objective.generalObjective ===
                  effectiveGeneralObjective
              )
              .map(
                (
                  objective
                ) =>
                  objective.id
              );

          return buildAverageSeries(
            evolutions,
            objectiveIds
          );
        }

        if (
          view ===
          "specialty"
        ) {
          const objectiveIds =
            objectives
              .filter(
                (
                  objective
                ) =>
                  objective.specialty ===
                  effectiveSpecialty
              )
              .map(
                (
                  objective
                ) =>
                  objective.id
              );

          return buildAverageSeries(
            evolutions,
            objectiveIds
          );
        }

        return buildAverageSeries(
          evolutions,
          objectives.map(
            (
              objective
            ) =>
              objective.id
          )
        );
      },
      [
        effectiveGeneralObjective,
        effectiveObjectiveId,
        effectiveSpecialty,
        evolutions,
        objectives,
        view,
      ]
    );

  const chartTitle =
    view ===
    "specific"
      ? objectives.find(
          (
            objective
          ) =>
            String(
              objective.id
            ) ===
            effectiveObjectiveId
        )?.title ??
        "Objetivo específico"
      : view ===
        "general"
        ? effectiveGeneralObjective ||
          "Objetivo geral"
        : view ===
          "specialty"
          ? effectiveSpecialty ||
            "Especialidade"
          : "Evolução geral da criança";

  const chartDescription =
    view ===
    "specific"
      ? "Trajetória de um objetivo específico ao longo das sessões."
      : view ===
        "general"
        ? "Média dos objetivos específicos vinculados ao objetivo geral em cada sessão."
        : view ===
          "specialty"
          ? "Média dos objetivos da especialidade em cada sessão."
          : "Média dos marcadores registrados em todas as especialidades.";

  return (
    <PageCard
      title="Evolução terapêutica"
      description="Gráficos gerados a partir dos status registrados nas evoluções finalizadas."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <ChartViewButton
            active={
              view ===
              "specific"
            }
            onClick={() =>
              setView(
                "specific"
              )
            }
          >
            Objetivo específico
          </ChartViewButton>

          <ChartViewButton
            active={
              view ===
              "general"
            }
            onClick={() =>
              setView(
                "general"
              )
            }
          >
            Objetivo geral
          </ChartViewButton>

          <ChartViewButton
            active={
              view ===
              "specialty"
            }
            onClick={() =>
              setView(
                "specialty"
              )
            }
          >
            Especialidade
          </ChartViewButton>

          <ChartViewButton
            active={
              view ===
              "overall"
            }
            onClick={() =>
              setView(
                "overall"
              )
            }
          >
            Evolução geral
          </ChartViewButton>
        </div>

        {view ===
          "specific" &&
          objectives.length >
            0 && (
            <div className="max-w-xl">
              <Select
                value={
                  effectiveObjectiveId
                }
                onChange={(
                  event
                ) =>
                  setSelectedObjectiveId(
                    event.target.value
                  )
                }
              >
                {objectives.map(
                  (
                    objective
                  ) => (
                    <option
                      key={
                        objective.id
                      }
                      value={
                        objective.id
                      }
                    >
                      {
                        objective.title
                      }{" "}
                      —{" "}
                      {
                        objective.specialty
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          )}

        {view ===
          "general" &&
          generalObjectives.length >
            0 && (
            <div className="max-w-xl">
              <Select
                value={
                  effectiveGeneralObjective
                }
                onChange={(
                  event
                ) =>
                  setSelectedGeneralObjective(
                    event.target.value
                  )
                }
              >
                {generalObjectives.map(
                  (
                    generalObjective
                  ) => (
                    <option
                      key={
                        generalObjective
                      }
                      value={
                        generalObjective
                      }
                    >
                      {
                        generalObjective
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          )}

        {view ===
          "specialty" &&
          specialties.length >
            0 && (
            <div className="max-w-xl">
              <Select
                value={
                  effectiveSpecialty
                }
                onChange={(
                  event
                ) =>
                  setSelectedSpecialty(
                    event.target.value
                  )
                }
              >
                {specialties.map(
                  (
                    specialty
                  ) => (
                    <option
                      key={
                        specialty
                      }
                      value={
                        specialty
                      }
                    >
                      {
                        specialty
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          )}

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/55 via-white to-violet-50/40 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <LineChart
                    size={
                      18
                    }
                  />
                </span>

                <h3 className="font-bold text-[#10235f]">
                  {
                    chartTitle
                  }
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {
                  chartDescription
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <MarkerLegend
                label="Regressão"
                value="-1"
                className="bg-red-100 text-red-700"
              />

              <MarkerLegend
                label="Mantido"
                value="1"
                className="bg-slate-100 text-slate-600"
              />

              <MarkerLegend
                label="Em evolução"
                value="2"
                className="bg-amber-100 text-amber-700"
              />

              <MarkerLegend
                label="Alcançado"
                value="3"
                className="bg-emerald-100 text-emerald-700"
              />
            </div>
          </div>

          <div className="mt-5">
            {chartPoints.length >
            0 ? (
              <TherapeuticLineChart
                points={
                  chartPoints
                }
              />
            ) : (
              <div className="rounded-xl border border-dashed border-indigo-200 bg-white/75 px-6 py-12 text-center">
                <LineChart
                  size={
                    28
                  }
                  className="mx-auto text-indigo-200"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Ainda não há dados suficientes para este gráfico.
                </p>

                <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-slate-400">
                  Finalize atendimentos registrando os objetivos e seus status para que a linha de evolução seja construída automaticamente.
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 text-[10px] leading-5 text-slate-400">
            Falta da criança e “Não trabalhado” ficam fora da pontuação clínica do gráfico e não são tratados como regressão.
          </p>
        </div>
      </div>
    </PageCard>
  );
}

function ChartViewButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-violet-600 text-white shadow-md shadow-violet-200"
          : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-600"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function MarkerLegend({
  label,
  value,
  className,
}: {
  label:
    string;

  value:
    string;

  className:
    string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 ${className}`}
    >
      {label}: {value}
    </span>
  );
}

function TherapeuticLineChart({
  points,
}: {
  points:
    ChartPoint[];
}) {
  const width =
    900;

  const height =
    280;

  const padding = {
    top:
      24,
    right:
      25,
    bottom:
      54,
    left:
      54,
  };

  const minValue =
    -1;

  const maxValue =
    3;

  const innerWidth =
    width -
    padding.left -
    padding.right;

  const innerHeight =
    height -
    padding.top -
    padding.bottom;

  const xForIndex =
    (
      index:
        number
    ) =>
      points.length ===
      1
        ? padding.left +
          innerWidth /
            2
        : padding.left +
          (
            index /
            (
              points.length -
              1
            )
          ) *
            innerWidth;

  const yForValue =
    (
      value:
        number
    ) =>
      padding.top +
      (
        (
          maxValue -
          value
        ) /
        (
          maxValue -
          minValue
        )
      ) *
        innerHeight;

  const path =
    points
      .map(
        (
          point,
          index
        ) => {
          const x =
            xForIndex(
              index
            );

          const y =
            yForValue(
              point.value
            );

          return `${index ===
          0
            ? "M"
            : "L"} ${x} ${y}`;
        }
      )
      .join(
        " "
      );

  const guideValues =
    [
      3,
      2,
      1,
      0,
      -1,
    ];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[720px] w-full"
        role="img"
        aria-label="Gráfico de evolução terapêutica"
      >
        {guideValues.map(
          (
            value
          ) => {
            const y =
              yForValue(
                value
              );

            return (
              <g
                key={
                  value
                }
              >
                <line
                  x1={
                    padding.left
                  }
                  y1={
                    y
                  }
                  x2={
                    width -
                    padding.right
                  }
                  y2={
                    y
                  }
                  stroke="#e8eaf3"
                  strokeWidth="1"
                />

                <text
                  x={
                    padding.left -
                    12
                  }
                  y={
                    y +
                    4
                  }
                  textAnchor="end"
                  fontSize="11"
                  fill="#8792b3"
                >
                  {
                    value
                  }
                </text>
              </g>
            );
          }
        )}

        <path
          d={
            path
          }
          fill="none"
          stroke="#6d4aff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(
          (
            point,
            index
          ) => {
            const x =
              xForIndex(
                index
              );

            const y =
              yForValue(
                point.value
              );

            return (
              <g
                key={`${point.date}-${index}`}
              >
                <circle
                  cx={
                    x
                  }
                  cy={
                    y
                  }
                  r="7"
                  fill="#ffffff"
                  stroke="#6d4aff"
                  strokeWidth="4"
                />

                <text
                  x={
                    x
                  }
                  y={
                    y -
                    14
                  }
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#5f43df"
                >
                  {
                    formatChartValue(
                      point.value
                    )
                  }
                </text>

                <text
                  x={
                    x
                  }
                  y={
                    height -
                    22
                  }
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8792b3"
                >
                  {
                    point.label
                  }
                </text>
              </g>
            );
          }
        )}
      </svg>
    </div>
  );
}

function buildSpecificObjectiveSeries(
  evolutions:
    ReturnType<
      typeof getFinalizedEvolutionsByPatientId
    >,

  objectiveId:
    number
): ChartPoint[] {
  return [...evolutions]
    .reverse()
    .flatMap(
      (
        evolution
      ) => {
        const sessionObjective =
          evolution.objectives.find(
            (
              objective
            ) =>
              objective.id ===
              objectiveId
          );

        if (
          !sessionObjective
        ) {
          return [];
        }

        const score =
          sessionObjective.markerScore ??
          getEvolutionObjectiveMarkerScore(
            sessionObjective.status
          );

        if (
          score ===
          null
        ) {
          return [];
        }

        return [
          {
            label:
              formatShortDate(
                evolution.sessionDate
              ),

            date:
              evolution.sessionDate,

            value:
              score,

            statusLabel:
              sessionObjective.status,
          },
        ];
      }
    );
}

function buildAverageSeries(
  evolutions:
    ReturnType<
      typeof getFinalizedEvolutionsByPatientId
    >,

  objectiveIds:
    (string | number)[]
): ChartPoint[] {
  const allowedIds =
    new Set(
      objectiveIds
    );

  return [...evolutions]
    .reverse()
    .flatMap(
      (
        evolution
      ) => {
        const scores =
          evolution.objectives
            .filter(
              (
                objective
              ) =>
                allowedIds.has(
                  objective.id
                )
            )
            .map(
              (
                objective
              ) =>
                objective.markerScore ??
                getEvolutionObjectiveMarkerScore(
                  objective.status
                )
            )
            .filter(
              (
                score
              ): score is number =>
                score !==
                null
            );

        if (
          scores.length ===
          0
        ) {
          return [];
        }

        const average =
          scores.reduce(
            (
              sum,
              value
            ) =>
              sum +
              value,
            0
          ) /
          scores.length;

        return [
          {
            label:
              formatShortDate(
                evolution.sessionDate
              ),

            date:
              evolution.sessionDate,

            value:
              Math.round(
                average *
                  100
              ) /
              100,
          },
        ];
      }
    );
}

function formatShortDate(
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

  return `${day}/${month}`;
}

function formatChartValue(
  value:
    number
) {
  if (
    Number.isInteger(
      value
    )
  ) {
    return String(
      value
    );
  }

  return value
    .toFixed(
      1
    )
    .replace(
      ".",
      ","
    );
}

/* =========================================
   OBJETIVO GERAL
========================================= */

interface GeneralObjectiveCardProps {
  group:
    ObjectiveGroup;

  defaultOpen?:
    boolean;
}

function GeneralObjectiveCard({
  group,
  defaultOpen =
    true,
}: GeneralObjectiveCardProps) {
  const [
    open,
    setOpen,
  ] =
    useState(
      defaultOpen
    );

  const total =
    group.objectives.length;

  const achieved =
    group.objectives.filter(
      (
        objective
      ) =>
        objective.status ===
        "Atingido"
    ).length;

  const averageProgress =
    total >
    0
      ? Math.round(
          group.objectives.reduce(
            (
              sum,
              objective
            ) =>
              sum +
              objective.progress,
            0
          ) /
            total
        )
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/40 shadow-sm">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }
        className="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-violet-50/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200/60">
            <Target
              size={
                21
              }
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                Objetivo geral
              </span>

              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                {total} específico
                {total ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>

            <h3 className="mt-2 text-base font-bold leading-6 text-[#10235f]">
              {
                group.generalObjective
              }
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {achieved} de {total} objetivo
              {total ===
              1
                ? ""
                : "s"}{" "}
              atingido
              {achieved ===
              1
                ? ""
                : "s"}{" "}
              • progresso médio de {averageProgress}%
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden min-w-32 sm:block">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>
                Progresso médio
              </span>

              <span className="text-violet-600">
                {averageProgress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-300"
                style={{
                  width: `${averageProgress}%`,
                }}
              />
            </div>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
            {open ? (
              <ChevronDown
                size={
                  18
                }
              />
            ) : (
              <ChevronRight
                size={
                  18
                }
              />
            )}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-violet-100 bg-white/80 px-4 py-4 sm:px-5">
          <div className="relative space-y-3 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-violet-100">
            {group.objectives.map(
              (
                objective,
                index
              ) => (
                <SpecificObjectiveCard
                  key={
                    objective.id
                  }
                  objective={
                    objective
                  }
                  number={
                    index +
                    1
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================
   OBJETIVO ESPECÍFICO
========================================= */

interface SpecificObjectiveCardProps {
  objective:
    TherapeuticObjective;

  number:
    number;
}

function SpecificObjectiveCard({
  objective,
  number,
}: SpecificObjectiveCardProps) {
  return (
    <div className="relative ml-9 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_3px_12px_rgba(51,65,120,0.04)] transition hover:border-violet-200 hover:shadow-sm">
      <span className="absolute -left-[37px] top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-violet-100 text-[10px] font-extrabold text-violet-700">
        {
          number
        }
      </span>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Objetivo específico
            </span>

            <StatusBadge
              status={
                objective.status
              }
            />
          </div>

          <h4 className="mt-2 font-bold text-slate-800">
            {
              objective.title
            }
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            {
              objective.specialty
            }{" "}
            •{" "}
            {
              objective.professional
            }
          </p>

          {objective.observation && (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              {
                objective.observation
              }
            </p>
          )}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Progresso
              </span>

              <span className="text-sm font-extrabold text-violet-600">
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

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-500">
            <div>
              <span className="block font-semibold uppercase tracking-wide text-slate-400">
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
              <span className="block font-semibold uppercase tracking-wide text-slate-400">
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
  const styles: Record<
    ObjectiveStatus,
    string
  > = {
    "Em evolução":
      "bg-amber-100 text-amber-700",

    Atingido:
      "bg-emerald-100 text-emerald-700",

    "Com regressão":
      "bg-red-100 text-red-700",

    "Não trabalhado":
      "bg-slate-100 text-slate-600",
  };

  const icons: Record<
    ObjectiveStatus,
    React.ReactNode
  > = {
    "Em evolução": (
      <TrendingUp
        size={
          13
        }
      />
    ),

    Atingido: (
      <CheckCircle2
        size={
          13
        }
      />
    ),

    "Com regressão": (
      <CircleDot
        size={
          13
        }
      />
    ),

    "Não trabalhado": (
      <CircleDot
        size={
          13
        }
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
   ESTADO VAZIO
========================================= */

interface EmptyObjectivesProps {
  canManage:
    boolean;

  onNewObjective:
    () => void;
}

function EmptyObjectives({
  canManage,
  onNewObjective,
}: EmptyObjectivesProps) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/60 to-white px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <Target
          size={
            25
          }
        />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        Nenhum objetivo terapêutico cadastrado
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        Cadastre um objetivo geral e vincule a ele os objetivos específicos que serão acompanhados durante os atendimentos.
      </p>

      {canManage && (
        <Button
          type="button"
          className="mt-5"
          onClick={
            onNewObjective
          }
        >
          <Plus
            size={
              17
            }
          />

          Criar primeiro objetivo
        </Button>
      )}
    </div>
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
   DATA
========================================= */

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