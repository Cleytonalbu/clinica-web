import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  MapPin,
  PenLine,
  Stethoscope,
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
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  getPatientEvolutionById,
} from "@/pages/Pacientes/evolutionStorage";

import {
  canProfessionalAccessPatient,
  getProfessionalSpecialty,
} from "@/pages/Pacientes/patientAccessRules";

export default function DetalheEvolucao() {
  const navigate =
    useNavigate();

  const {
    id,
    evolutionId,
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

  const numericEvolutionId =
    Number(
      evolutionId
    );

  const patient =
    getPatientById(
      patientId
    );

  const evolution =
    getPatientEvolutionById(
      patientId,
      numericEvolutionId
    );

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

  const hasPatientAccess =
    !isProfissional ||
    canProfessionalAccessPatient(
      loggedProfessionalName,
      patientId
    );

  const hasEvolutionAccess =
    !isProfissional ||
    Boolean(
      evolution &&
      evolution.professional ===
        loggedProfessionalName &&
      (
        !professionalSpecialty ||
        evolution.specialty ===
          professionalSpecialty
      )
    );

  function handleBack() {
    navigate(
      `/pacientes/${patientId}`
    );
  }

  if (
    !patient ||
    !evolution
  ) {
    return (
      <DashboardLayout>
        <CenteredMessage
          title="Evolução não encontrada"
          description="O registro solicitado não existe para este paciente ou foi removido."
          buttonLabel="Voltar para paciente"
          onClick={
            handleBack
          }
        />
      </DashboardLayout>
    );
  }

  if (
    !hasPatientAccess ||
    !hasEvolutionAccess
  ) {
    return (
      <DashboardLayout>
        <CenteredMessage
          title="Acesso restrito à evolução"
          description="Profissionais só podem visualizar evoluções registradas pelo próprio perfil e dentro da própria especialidade."
          buttonLabel="Voltar para minhas evoluções"
          onClick={
            handleBack
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={
              handleBack
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft
              size={17}
            />

            Voltar para evoluções
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#10235f]">
                Evolução Clínica
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Visualização completa do registro clínico do atendimento.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
                evolution.status ===
                "FINALIZADA"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {evolution.status ===
              "FINALIZADA"
                ? "Finalizada"
                : "Rascunho"}
            </span>
          </div>
        </div>

        {isProfissional && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-3 text-xs font-semibold text-violet-700">
            Registro autorizado para {loggedProfessionalName} • {professionalSpecialty || evolution.specialty}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
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
                  Paciente #{patient.id}
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
                <Stethoscope
                  size={19}
                />
              }
              label="Especialidade"
              value={
                evolution.specialty ||
                "—"
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
                "—"
              }
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
                  <ClipboardList
                    size={18}
                  />
                }
                label="Horário"
                value={`${evolution.startTime || "—"}${evolution.endTime ? ` - ${evolution.endTime}` : ""}`}
              />

              <Info
                icon={
                  <ClipboardList
                    size={18}
                  />
                }
                label="Tipo"
                value={
                  evolution.appointmentType ||
                  "—"
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
                  "—"
                }
              />
            </div>
          </PageCard>

          <PageCard
            title="2. Objetivos trabalhados"
            description="Objetivos terapêuticos registrados nesta sessão."
          >
            {evolution.objectives.length >
            0 ? (
              <div className="space-y-3">
                {evolution.objectives.map(
                  (
                    objective,
                    index
                  ) => (
                    <div
                      key={`${objective.id}-${index}`}
                      className="rounded-xl border border-violet-100 bg-violet-50/50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <Target
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">
                            {
                              objective.name
                            }
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="rounded-full bg-white px-2.5 py-1 text-violet-700 ring-1 ring-violet-100">
                              {objective.status}
                            </span>

                            {objective.markerScore !== null && objective.markerScore !== undefined && (
                              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                                Marcador: {objective.markerScore}
                              </span>
                            )}

                            <span className="rounded-full bg-white px-2.5 py-1 text-amber-600 ring-1 ring-amber-100">
                              Desempenho: {objective.performance}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum objetivo foi registrado nesta sessão.
              </p>
            )}
          </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="3. Evolução Escrita"
            description="Registro clínico da sessão."
          >
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {evolution.writtenEvolution || "Nenhum registro escrito informado."}
            </p>
          </PageCard>

          <PageCard
            title="4. Resultado da Sessão"
            description="Síntese do resultado observado."
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {
                    evolution.sessionResult ||
                    "Não informado"
                  }
                </p>

                {evolution.sessionResultObservation && (
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {
                      evolution.sessionResultObservation
                    }
                  </p>
                )}
              </div>
            </div>
          </PageCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PageCard
            title="5. Impactos Observados"
            description="Marcadores clínicos registrados durante a sessão."
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
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {
                        impact
                      }
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum impacto registrado.
              </p>
            )}
          </PageCard>

          <PageCard
            title="6. Encaminhamento"
            description="Dados de encaminhamento registrados no atendimento."
          >
            {evolution.referralReason ||
            evolution.referralProfessional ||
            evolution.referralSpecialty ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  <strong className="text-slate-800">Destino:</strong>{" "}
                  {evolution.referralProfessional || evolution.referralSpecialty || "—"}
                </p>

                <p>
                  <strong className="text-slate-800">Prioridade:</strong>{" "}
                  {evolution.referralPriority}
                </p>

                <p className="leading-6">
                  <strong className="text-slate-800">Motivo:</strong>{" "}
                  {evolution.referralReason || "—"}
                </p>

                {evolution.referralObservation && (
                  <p className="leading-6">
                    <strong className="text-slate-800">Observação:</strong>{" "}
                    {evolution.referralObservation}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhum encaminhamento registrado.
              </p>
            )}
          </PageCard>
        </div>

        <PageCard
          title="7. Anexos"
          description="Arquivos vinculados à evolução."
        >
          {evolution.attachments.length >
          0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <FileText
                        size={18}
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
            <p className="text-sm text-slate-500">
              Nenhum anexo registrado.
            </p>
          )}
        </PageCard>

        <PageCard
          title="8. Assinatura do Profissional"
          description="Registro de autoria da evolução."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Profissional
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {
                  evolution.professional ||
                  "—"
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {evolution.finalizedAt
                  ? `Finalizada em ${formatDateTime(evolution.finalizedAt)}`
                  : "Registro ainda não finalizado"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assinatura
              </p>

              <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-violet-600">
                <PenLine
                  size={20}
                />

                <span className="ml-2 font-medium italic">
                  {
                    evolution.professional ||
                    "Profissional"
                  }
                </span>
              </div>
            </div>
          </div>
        </PageCard>
      </div>
    </DashboardLayout>
  );
}

function CenteredMessage({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title:
    string;

  description:
    string;

  buttonLabel:
    string;

  onClick:
    () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">
        {
          title
        }
      </h1>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>

      <Button
        type="button"
        className="mt-6"
        onClick={
          onClick
        }
      >
        {
          buttonLabel
        }
      </Button>
    </div>
  );
}

function Info({
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {
            value
          }
        </p>
      </div>
    </div>
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

function formatDateTime(
  value:
    string
) {
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

  return date.toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",
      timeStyle:
        "short",
    }
  );
}

function formatFileSize(
  size:
    number
) {
  if (
    size <
    1024
  ) {
    return `${size} B`;
  }

  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size /
      1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(1)} MB`;
}