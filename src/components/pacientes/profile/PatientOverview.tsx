import {
  CalendarCheck2,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

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

/* =========================================
   DADOS TEMPORÁRIOS
========================================= */

const dadosPaciente = {
  cpf:
    "123.456.789-10",

  nascimento:
    "15/04/2018",

  sexo:
    "Feminino",

  telefone:
    "(83) 99999-9999",

  email:
    "responsavel@email.com",

  endereco:
    "Rua das Flores, 120 - Centro",

  convenio:
    "Particular",

  responsavel:
    "Ana Oliveira",

  parentesco:
    "Mãe",
};

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientOverview() {
  const {
    user,
  } = useAuth();

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

  /*
   * Conteúdo clínico resumido.
   *
   * Recepção não visualiza:
   * - timeline clínica;
   * - objetivos terapêuticos;
   * - indicadores clínicos.
   */

  const canViewClinicalSummary =
    isGestor ||
    isProfissional;

  /*
   * Dados administrativos completos.
   *
   * Profissional não precisa visualizar
   * CPF, endereço e convênio.
   */

  const canViewAdministrativeData =
    isGestor ||
    isRecepcao;

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* CARDS DE RESUMO */}
      {/* GESTOR + PROFISSIONAL */}
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
          {/* DADOS DO PACIENTE */}
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
              {/* =========================== */}
              {/* CPF */}
              {/* GESTOR + RECEPÇÃO */}
              {/* =========================== */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <UserRound
                      size={
                        18
                      }
                    />
                  }
                  label="CPF"
                  value={
                    dadosPaciente.cpf
                  }
                />
              )}

              {/* =========================== */}
              {/* NASCIMENTO */}
              {/* TODOS */}
              {/* =========================== */}

              <InfoItem
                icon={
                  <CalendarCheck2
                    size={
                      18
                    }
                  />
                }
                label="Data de nascimento"
                value={
                  dadosPaciente.nascimento
                }
              />

              {/* =========================== */}
              {/* SEXO */}
              {/* TODOS */}
              {/* =========================== */}

              <InfoItem
                icon={
                  <UserRound
                    size={
                      18
                    }
                  />
                }
                label="Sexo"
                value={
                  dadosPaciente.sexo
                }
              />

              {/* =========================== */}
              {/* TELEFONE */}
              {/* TODOS */}
              {/* =========================== */}

              <InfoItem
                icon={
                  <Phone
                    size={
                      18
                    }
                  />
                }
                label="Telefone"
                value={
                  dadosPaciente.telefone
                }
              />

              {/* =========================== */}
              {/* ENDEREÇO */}
              {/* GESTOR + RECEPÇÃO */}
              {/* =========================== */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <MapPin
                      size={
                        18
                      }
                    />
                  }
                  label="Endereço"
                  value={
                    dadosPaciente.endereco
                  }
                />
              )}

              {/* =========================== */}
              {/* CONVÊNIO */}
              {/* GESTOR + RECEPÇÃO */}
              {/* =========================== */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <ShieldCheck
                      size={
                        18
                      }
                    />
                  }
                  label="Convênio"
                  value={
                    dadosPaciente.convenio
                  }
                />
              )}
            </div>
          </PageCard>

          {/* =============================== */}
          {/* TIMELINE */}
          {/* GESTOR + PROFISSIONAL */}
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
          {/* TODOS */}
          {/* =============================== */}

          <PageCard
            title="Próxima Sessão"
            description="Próximo atendimento agendado."
          >
            <div className="rounded-xl bg-indigo-50 p-5">
              <p className="text-sm font-medium text-indigo-600">
                Segunda-feira
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                10:30
              </p>

              <div className="mt-4 border-t border-indigo-100 pt-4">
                <p className="font-semibold text-slate-800">
                  Psicologia
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Dra. Ana Paula
                </p>
              </div>
            </div>
          </PageCard>

          {/* =============================== */}
          {/* OBJETIVOS ATIVOS */}
          {/* GESTOR + PROFISSIONAL */}
          {/* =============================== */}

          {canViewClinicalSummary && (
            <PatientActiveGoals />
          )}

          {/* =============================== */}
          {/* RESPONSÁVEL */}
          {/* TODOS */}
          {/* =============================== */}

          <PageCard
            title="Responsável"
            description="Responsável legal vinculado."
          >
            <div className="space-y-5">
              <InfoItem
                icon={
                  <UserRound
                    size={
                      18
                    }
                  />
                }
                label="Nome"
                value={
                  dadosPaciente.responsavel
                }
              />

              <InfoItem
                icon={
                  <HeartPulse
                    size={
                      18
                    }
                  />
                }
                label="Parentesco"
                value={
                  dadosPaciente.parentesco
                }
              />

              <InfoItem
                icon={
                  <Phone
                    size={
                      18
                    }
                  />
                }
                label="Contato"
                value={
                  dadosPaciente.telefone
                }
              />

              {/* =========================== */}
              {/* E-MAIL */}
              {/* GESTOR + RECEPÇÃO */}
              {/* =========================== */}

              {canViewAdministrativeData && (
                <InfoItem
                  icon={
                    <UserRound
                      size={
                        18
                      }
                    />
                  }
                  label="E-mail"
                  value={
                    dadosPaciente.email
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