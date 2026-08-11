import {
  CalendarCheck2,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  PageCard,
} from "@/components/ui";

import {
  PatientSummaryCards,
} from "./PatientSummaryCards";

import {
  PatientTimeline,
} from "./PatientTimeline";

import {
  PatientActiveGoals,
} from "./PatientActiveGoals";

import type {
  StoredPatient,
} from "@/pages/Pacientes/patientStorage";

import {
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

/* =========================================
   PROPS
========================================= */

interface PatientOverviewProps {
  patient:
    StoredPatient;
}

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientOverview({
  patient,
}: PatientOverviewProps) {
  const {
    user,
  } =
    useAuth();

  /* =======================================
     PERFIS
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const isProfissional =
    user?.profile ===
    "Profissional";

  /* =======================================
     PERMISSÕES
  ======================================= */

  const canViewClinicalSummary =
    isGestor ||
    isProfissional;

  const canViewAdministrativeData =
    isGestor ||
    isRecepcao;

  /* =======================================
     DADOS FORMATADOS
  ======================================= */

  const phone =
    patient.celular ||
    patient.telefone ||
    "-";

  const responsiblePhone =
    patient.responsavelTelefone ||
    "-";

  const address =
    buildAddress(
      patient
    );

  /* =======================================
     PRÓXIMA SESSÃO
  ======================================= */

  const nextAppointment =
    useMemo(
      () => {
        const appointments =
          getSavedAppointments();

        const now =
          new Date();

        return appointments
          .filter(
            (
              appointment
            ) => {
              if (
                appointment.patientId !==
                patient.id
              ) {
                return false;
              }

              if (
                appointment.status ===
                  "Realizado" ||
                appointment.status ===
                  "Cancelado" ||
                appointment.status ===
                  "Faltou"
              ) {
                return false;
              }

              const appointmentDate =
                createAppointmentDate(
                  appointment
                );

              if (
                !appointmentDate
              ) {
                return false;
              }

              return (
                appointmentDate.getTime() >=
                now.getTime()
              );
            }
          )
          .sort(
            (
              a,
              b
            ) => {
              const dateA =
                createAppointmentDate(
                  a
                );

              const dateB =
                createAppointmentDate(
                  b
                );

              if (
                !dateA ||
                !dateB
              ) {
                return 0;
              }

              return (
                dateA.getTime() -
                dateB.getTime()
              );
            }
          )[0];
      },
      [
        patient.id,
      ]
    );

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* CARDS DE RESUMO */}
      {/* ================================= */}

      {canViewClinicalSummary && (
        <PatientSummaryCards />
      )}

      {/* ================================= */}
      {/* CONTEÚDO PRINCIPAL */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ================================= */}
        {/* COLUNA PRINCIPAL */}
        {/* ================================= */}

        <div className="space-y-6 xl:col-span-2">
          {/* =============================== */}
          {/* DADOS PESSOAIS */}
          {/* =============================== */}

          <PageCard
            title="Dados Pessoais"
            description={
              isProfissional
                ? "Informações básicas do paciente."
                : "Informações cadastrais do paciente."
            }
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* CPF */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <UserRound
                      size={18}
                    />
                  }
                  label="CPF"
                  value={
                    patient.cpf ||
                    "-"
                  }
                />
              )}

              {/* NASCIMENTO */}

              <InfoItem
                icon={
                  <CalendarCheck2
                    size={18}
                  />
                }
                label="Data de nascimento"
                value={
                  formatDate(
                    patient.nascimento
                  )
                }
              />

              {/* SEXO */}

              <InfoItem
                icon={
                  <UserRound
                    size={18}
                  />
                }
                label="Sexo"
                value={
                  patient.sexo ||
                  "-"
                }
              />

              {/* TELEFONE */}

              <InfoItem
                icon={
                  <Phone
                    size={18}
                  />
                }
                label="Telefone"
                value={
                  phone
                }
              />

              {/* ENDEREÇO */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <MapPin
                      size={18}
                    />
                  }
                  label="Endereço"
                  value={
                    address
                  }
                />
              )}

              {/* CONVÊNIO */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <ShieldCheck
                      size={18}
                    />
                  }
                  label="Convênio"
                  value={
                    patient.convenio ||
                    "Particular"
                  }
                />
              )}
            </div>
          </PageCard>

          {/* =============================== */}
          {/* SAÚDE */}
          {/* =============================== */}

          <PageCard
            title="Informações de Saúde"
            description="Dados complementares cadastrados."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoItem
                icon={
                  <HeartPulse
                    size={18}
                  />
                }
                label="Tipo sanguíneo"
                value={
                  patient.tipoSanguineo ||
                  "-"
                }
              />

              <InfoItem
                icon={
                  <HeartPulse
                    size={18}
                  />
                }
                label="Alergias"
                value={
                  patient.alergias ||
                  "Nenhuma informada"
                }
              />
            </div>

            {patient.observacoes && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Observações
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {
                    patient.observacoes
                  }
                </p>
              </div>
            )}
          </PageCard>

          {/* =============================== */}
          {/* TIMELINE */}
          {/* =============================== */}

          {canViewClinicalSummary && (
            <PatientTimeline />
          )}
        </div>

        {/* ================================= */}
        {/* COLUNA LATERAL */}
        {/* ================================= */}

        <div className="space-y-6">
          {/* =============================== */}
          {/* PRÓXIMA SESSÃO */}
          {/* =============================== */}

          <PageCard
            title="Próxima Sessão"
            description="Próximo atendimento agendado."
          >
            {nextAppointment ? (
              <NextAppointmentCard
                appointment={
                  nextAppointment
                }
              />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <CalendarCheck2
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  Nenhuma sessão agendada
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Este paciente não possui próximos atendimentos.
                </p>
              </div>
            )}
          </PageCard>

          {/* =============================== */}
          {/* OBJETIVOS ATIVOS */}
          {/* =============================== */}

          {canViewClinicalSummary && (
            <PatientActiveGoals />
          )}

          {/* =============================== */}
          {/* RESPONSÁVEL */}
          {/* =============================== */}

          <PageCard
            title="Responsável"
            description="Responsável legal vinculado."
          >
            <div className="space-y-5">
              <InfoItem
                icon={
                  <UserRound
                    size={18}
                  />
                }
                label="Nome"
                value={
                  patient.responsavelNome ||
                  "-"
                }
              />

              <InfoItem
                icon={
                  <HeartPulse
                    size={18}
                  />
                }
                label="Parentesco"
                value={
                  patient.responsavelParentesco ||
                  "-"
                }
              />

              <InfoItem
                icon={
                  <Phone
                    size={18}
                  />
                }
                label="Contato"
                value={
                  responsiblePhone
                }
              />

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <UserRound
                      size={18}
                    />
                  }
                  label="E-mail"
                  value={
                    patient.responsavelEmail ||
                    "-"
                  }
                />
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   PRÓXIMA SESSÃO
========================================= */

interface NextAppointmentCardProps {
  appointment:
    StoredAppointment;
}

function NextAppointmentCard({
  appointment,
}: NextAppointmentCardProps) {
  return (
    <div className="rounded-xl bg-indigo-50 p-5">
      <p className="text-sm font-medium capitalize text-indigo-600">
        {
          getWeekDay(
            appointment.date
          )
        }
      </p>

      <p className="mt-1 text-sm font-medium text-slate-500">
        {
          formatDate(
            appointment.date
          )
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {
          appointment.time
        }
      </p>

      <div className="mt-4 border-t border-indigo-100 pt-4">
        <p className="font-semibold text-slate-800">
          {
            appointment.specialty
          }
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {
            appointment.professional
          }
        </p>

        <div className="mt-3">
          <AppointmentStatus
            status={
              appointment.status
            }
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STATUS DO AGENDAMENTO
========================================= */

function AppointmentStatus({
  status,
}: {
  status:
    StoredAppointment["status"];
}) {
  const styles:
    Record<
      StoredAppointment["status"],
      string
    > = {
    Agendado:
      "bg-blue-100 text-blue-700",

    Confirmado:
      "bg-violet-100 text-violet-700",

    Realizado:
      "bg-emerald-100 text-emerald-700",

    Cancelado:
      "bg-red-100 text-red-700",

    Faltou:
      "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {
        status
      }
    </span>
  );
}

/* =========================================
   ITEM DE INFORMAÇÃO
========================================= */

interface InfoItemProps {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {
          icon
        }
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {
            label
          }
        </p>

        <p className="mt-1 text-sm font-medium text-slate-800">
          {
            value
          }
        </p>
      </div>
    </div>
  );
}

/* =========================================
   DATA/HORA DO AGENDAMENTO
========================================= */

function createAppointmentDate(
  appointment:
    StoredAppointment
) {
  if (
    !appointment.date ||
    !appointment.time
  ) {
    return null;
  }

  const date =
    new Date(
      `${appointment.date}T${appointment.time}:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
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

/* =========================================
   DIA DA SEMANA
========================================= */

function getWeekDay(
  value:
    string
) {
  if (
    !value
  ) {
    return "-";
  }

  const date =
    new Date(
      `${value}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday:
        "long",
    }
  ).format(
    date
  );
}

/* =========================================
   MONTAR ENDEREÇO
========================================= */

function buildAddress(
  patient:
    StoredPatient
) {
  const streetLine =
    [
      patient.rua,
      patient.numero,
    ]
      .filter(
        Boolean
      )
      .join(
        ", "
      );

  const locationLine =
    [
      patient.bairro,
      patient.cidade,
      patient.estado,
    ]
      .filter(
        Boolean
      )
      .join(
        " - "
      );

  const parts =
    [
      streetLine,
      locationLine,
      patient.complemento,
    ].filter(
      Boolean
    );

  return parts.length >
    0
    ? parts.join(
        " • "
      )
    : "-";
}