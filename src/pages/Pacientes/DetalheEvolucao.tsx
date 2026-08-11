import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  PenLine,
  Target,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  getPatientEvolutionById,
  type StoredEvolution,
} from "@/pages/Pacientes/evolutionStorage";

/* =========================================
   COMPONENTE
========================================= */

export default function DetalheEvolucao() {
  const navigate =
    useNavigate();

  const {
    id,
    evolutionId,
  } =
    useParams();

  const patientId =
    Number(id);

  const currentEvolutionId =
    Number(evolutionId);

  /* =======================================
     PACIENTE
  ======================================= */

  const patient =
    getPatientById(
      patientId
    );

  /* =======================================
     EVOLUÇÃO
  ======================================= */

  const evolution =
    getPatientEvolutionById(
      patientId,
      currentEvolutionId
    );

  /* =======================================
     VOLTAR
  ======================================= */

  function handleBack() {
    if (
      Number.isFinite(
        patientId
      ) &&
      patientId > 0
    ) {
      navigate(
        `/pacientes/${patientId}?tab=evolucoes`
      );

      return;
    }

    navigate(
      "/pacientes"
    );
  }

  /* =======================================
     NÃO ENCONTRADO
  ======================================= */

  if (
    !patient ||
    !evolution
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Evolução não encontrada
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O registro solicitado não existe ou não pertence a este paciente.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={
              handleBack
            }
          >
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <div>
          <button
            type="button"
            onClick={
              handleBack
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={17}
            />

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

            <StatusBadge
              status={
                evolution.status
              }
            />
          </div>
        </div>

        {/* ================================= */}
        {/* PACIENTE */}
        {/* ================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserRound
                  size={30}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {
                    patient.nome
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {calculateAge(
                    patient.nascimento
                  )}{" "}
                  anos • Paciente #
                  {
                    patient.id
                  }
                </p>
              </div>
            </div>

            <Info
              icon={
                <CalendarDays
                  size={19}
                />
              }
              label="Data"
              value={
                formatDate(
                  evolution.sessionDate
                )
              }
            />

            <Info
              icon={
                <ClipboardList
                  size={19}
                />
              }
              label="Especialidade"
              value={
                evolution.specialty ||
                "-"
              }
            />

            <Info
              icon={
                <UserRound
                  size={19}
                />
              }
              label="Profissional"
              value={
                evolution.professional ||
                "-"
              }
            />
          </div>
        </div>

        {/* ================================= */}
        {/* 1. DADOS DA SESSÃO */}
        {/* ================================= */}

        <PageCard
          title="1. Dados da Sessão"
          description="Informações principais do atendimento."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Info
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Data"
              value={
                formatDate(
                  evolution.sessionDate
                )
              }
            />

            <Info
              icon={
                <Clock3
                  size={18}
                />
              }
              label="Horário"
              value={
                formatTimeRange(
                  evolution.startTime,
                  evolution.endTime
                )
              }
            />

            <Info
              icon={
                <ClipboardList
                  size={18}
                />
              }
              label="Especialidade"
              value={
                evolution.specialty ||
                "-"
              }
            />

            <Info
              icon={
                <UserRound
                  size={18}
                />
              }
              label="Profissional"
              value={
                evolution.professional ||
                "-"
              }
            />

            <Info
              icon={
                <ClipboardList
                  size={18}
                />
              }
              label="Tipo de atendimento"
              value={
                evolution.appointmentType ||
                "-"
              }
            />

            <Info
              icon={
                <MapPin
                  size={18}
                />
              }
              label="Local"
              value={
                evolution.appointmentLocation ||
                "-"
              }
            />
          </div>
        </PageCard>

        {/* ================================= */}
        {/* 2. OBJETIVOS */}
        {/* ================================= */}

        <PageCard
          title="2. Objetivos Trabalhados"
          description="Objetivos terapêuticos relacionados à sessão."
        >
          {evolution.objectives.length >
          0 ? (
            <div className="space-y-3">
              {evolution.objectives.map(
                (
                  objective
                ) => (
                  <div
                    key={
                      objective.id
                    }
                    className="rounded-xl border border-violet-100 bg-violet-50 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <Target
                          size={20}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                objective.name
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                objective.specialty
                              }
                            </p>
                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm">
                            {
                              objective.status
                            }
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-500">
                              Desempenho na sessão
                            </span>

                            <span className="text-xs font-bold text-violet-700">
                              {
                                objective.performance
                              }
                              /5
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-5 gap-1.5">
                            {[
                              1,
                              2,
                              3,
                              4,
                              5,
                            ].map(
                              (
                                level
                              ) => (
                                <div
                                  key={
                                    level
                                  }
                                  className={`h-2 rounded-full ${
                                    level <=
                                    objective.performance
                                      ? "bg-violet-500"
                                      : "bg-violet-100"
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyText>
              Nenhum objetivo terapêutico foi vinculado a esta sessão.
            </EmptyText>
          )}
        </PageCard>

        {/* ================================= */}
        {/* 3. EVOLUÇÃO ESCRITA */}
        {/* ================================= */}

        <PageCard
          title="3. Evolução Escrita"
          description="Registro clínico realizado pelo profissional."
        >
          {evolution.writtenEvolution ? (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {
                evolution.writtenEvolution
              }
            </p>
          ) : (
            <EmptyText>
              Nenhuma evolução escrita registrada.
            </EmptyText>
          )}
        </PageCard>

        {/* ================================= */}
        {/* 4. RESULTADO + IMPACTOS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="4. Resultado da Sessão"
            description="Avaliação geral do atendimento."
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {
                      evolution.sessionResult
                    }
                  </p>

                  {evolution.sessionResultObservation && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-emerald-700">
                      {
                        evolution.sessionResultObservation
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </PageCard>

          <PageCard
            title="5. Impactos Observados"
            description="Aspectos percebidos durante a sessão."
          >
            {evolution.observedImpacts.length >
            0 ? (
              <div className="flex flex-wrap gap-2">
                {evolution.observedImpacts.map(
                  (
                    impact
                  ) => (
                    <span
                      key={
                        impact
                      }
                      className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                    >
                      {
                        impact
                      }
                    </span>
                  )
                )}
              </div>
            ) : (
              <EmptyText>
                Nenhum impacto observado foi registrado.
              </EmptyText>
            )}
          </PageCard>
        </div>

        {/* ================================= */}
        {/* 6. ENCAMINHAMENTO */}
        {/* ================================= */}

        <PageCard
          title="6. Encaminhamentos / Orientações"
          description="Encaminhamentos realizados durante a sessão."
        >
          {evolution.referralSpecialty ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <SimpleInfo
                  label="Especialidade"
                  value={
                    evolution.referralSpecialty
                  }
                />

                <SimpleInfo
                  label="Profissional"
                  value={
                    evolution.referralProfessional ||
                    "Não definido"
                  }
                />

                <SimpleInfo
                  label="Prioridade"
                  value={
                    evolution.referralPriority
                  }
                />
              </div>

              {evolution.referralReason && (
                <TextBlock
                  label="Motivo do encaminhamento"
                  value={
                    evolution.referralReason
                  }
                />
              )}

              {evolution.referralObservation && (
                <TextBlock
                  label="Observações ao profissional"
                  value={
                    evolution.referralObservation
                  }
                />
              )}

              <div className="flex flex-wrap gap-2">
                {evolution.notifyProfessional && (
                  <NotificationBadge>
                    Notificação interna
                  </NotificationBadge>
                )}

                {evolution.addProfessionalAgenda && (
                  <NotificationBadge>
                    Adicionado à agenda
                  </NotificationBadge>
                )}

                {evolution.notifyManager && (
                  <NotificationBadge>
                    Gestor informado
                  </NotificationBadge>
                )}
              </div>
            </div>
          ) : (
            <EmptyText>
              Nenhum encaminhamento registrado nesta sessão.
            </EmptyText>
          )}
        </PageCard>

        {/* ================================= */}
        {/* 7. ANEXOS */}
        {/* ================================= */}

        <PageCard
          title="7. Anexos"
          description="Arquivos vinculados à evolução."
        >
          {evolution.attachments.length >
          0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {evolution.attachments.map(
                (
                  attachment
                ) => (
                  <div
                    key={
                      attachment.id
                    }
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <FileText
                        size={20}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {
                          attachment.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          formatFileSize(
                            attachment.size
                          )
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <EmptyText>
              Nenhum arquivo vinculado a esta evolução.
            </EmptyText>
          )}

          {evolution.attachments.length >
            0 && (
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Nesta versão local do sistema são armazenadas as informações dos anexos. O arquivo físico será disponibilizado quando o upload estiver integrado à API.
            </p>
          )}
        </PageCard>

        {/* ================================= */}
        {/* 8. ASSINATURA */}
        {/* ================================= */}

        <PageCard
          title="8. Assinatura do Profissional"
          description="Registro de autoria da evolução."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <SimpleInfo
                label="Profissional"
                value={
                  evolution.professional ||
                  "-"
                }
              />

              <SimpleInfo
                label="Status do registro"
                value={
                  evolution.status ===
                  "FINALIZADA"
                    ? "Finalizada"
                    : "Rascunho"
                }
              />

              <SimpleInfo
                label={
                  evolution.status ===
                  "FINALIZADA"
                    ? "Finalizada em"
                    : "Última atualização"
                }
                value={
                  formatDateTime(
                    evolution.finalizedAt ||
                    evolution.updatedAt
                  )
                }
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assinatura
              </p>

              <div className="mt-2 flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
                <PenLine
                  size={20}
                />

                <span className="ml-2 font-medium italic">
                  {evolution.professional ||
                    "Profissional não informado"}
                </span>
              </div>
            </div>
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
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
  const finalized =
    status ===
    "FINALIZADA";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
        finalized
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {finalized
        ? "Finalizada"
        : "Rascunho"}
    </span>
  );
}

/* =========================================
   INFO COM ÍCONE
========================================= */

interface InfoProps {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}

function Info({
  icon,
  label,
  value,
}: InfoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {
          icon
        }
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {
            label
          }
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value ||
            "-"}
        </p>
      </div>
    </div>
  );
}

/* =========================================
   INFO SIMPLES
========================================= */

interface SimpleInfoProps {
  label:
    string;

  value:
    string;
}

function SimpleInfo({
  label,
  value,
}: SimpleInfoProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value ||
          "-"}
      </p>
    </div>
  );
}

/* =========================================
   BLOCO DE TEXTO
========================================= */

interface TextBlockProps {
  label:
    string;

  value:
    string;
}

function TextBlock({
  label,
  value,
}: TextBlockProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {
          value
        }
      </p>
    </div>
  );
}

/* =========================================
   BADGE DE NOTIFICAÇÃO
========================================= */

function NotificationBadge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
      {
        children
      }
    </span>
  );
}

/* =========================================
   TEXTO VAZIO
========================================= */

function EmptyText({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="text-sm italic text-slate-400">
      {
        children
      }
    </p>
  );
}

/* =========================================
   IDADE
========================================= */

function calculateAge(
  birthDate:
    string
) {
  if (
    !birthDate
  ) {
    return 0;
  }

  const birth =
    new Date(
      `${birthDate}T12:00:00`
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return 0;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference <
      0 ||
    (
      monthDifference ===
        0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -=
      1;
  }

  return Math.max(
    age,
    0
  );
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

/* =========================================
   HORÁRIO
========================================= */

function formatTimeRange(
  start:
    string,

  end:
    string
) {
  if (
    start &&
    end
  ) {
    return `${start} às ${end}`;
  }

  return start ||
    end ||
    "-";
}

/* =========================================
   DATA/HORA
========================================= */

function formatDateTime(
  value:
    string |
    undefined
) {
  if (
    !value
  ) {
    return "-";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

/* =========================================
   TAMANHO DO ARQUIVO
========================================= */

function formatFileSize(
  bytes:
    number
) {
  if (
    !Number.isFinite(
      bytes
    ) ||
    bytes <= 0
  ) {
    return "0 KB";
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.max(
      1,
      Math.round(
        bytes /
          1024
      )
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1
  )} MB`;
}