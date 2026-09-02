import {
  CalendarCheck2,
  CalendarClock,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  PatientHeader,
} from "@/components/pacientes/header/PatientHeader";

import {
  PatientFilters,
} from "@/components/pacientes/filters/PatientFilters";

import {
  PatientTable,
} from "@/components/pacientes/table/PatientTable";

import {
  listarPacientes,
  paraStoredPatient,
  type RealPatient,
} from "@/services/pacientes";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

/* =========================================
   PÁGINA PACIENTES
========================================= */

export default function Pacientes() {
  const {
    user,
  } =
    useAuth();

  const isProfissional =
    user?.profile ===
    "Profissional";

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const [searchParams] = useSearchParams();

  const [
    search,
    setSearch,
  ] =
    useState(() => searchParams.get("busca") ?? "");

  const [
    status,
    setStatus,
  ] =
    useState("Todos");

  const [
    convenio,
    setConvenio,
  ] =
    useState("Todos");

  const [
    allPatients,
    setAllPatients,
  ] =
    useState<RealPatient[]>([]);

  const [
    loadingPatients,
    setLoadingPatients,
  ] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    setLoadingPatients(true);

    listarPacientes({ porPagina: 200 })
      .then((resposta) => {
        if (cancelado) return;
        setAllPatients(resposta.dados.map(paraStoredPatient));
        setLoadError(null);
      })
      .catch(() => {
        if (cancelado) return;
        setLoadError("Não foi possível carregar os pacientes.");
      })
      .finally(() => {
        if (cancelado) return;
        setLoadingPatients(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // O backend já filtra GET /pacientes por vínculo real (agendamento ou
  // objetivo) quando quem pede é PROFISSIONAL — não precisa repetir a
  // restrição aqui.
  const patients = allPatients;

  const appointments =
    useMemo(
      () => {
        const all =
          getSavedAppointments();

        if (
          !isProfissional
        ) {
          return all;
        }

        return all.filter(
          (
            appointment
          ) =>
            appointment.professional ===
              loggedProfessionalName
        );
      },
      [
        isProfissional,
        loggedProfessionalName,
      ]
    );

  const now =
    new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const totalPatients =
    patients.length;

  const activePatients =
    patients.filter(
      (
        patient
      ) =>
        patient.status ===
        "Ativo"
    ).length;

  const inactivePatients =
    patients.filter(
      (
        patient
      ) =>
        patient.status ===
        "Inativo"
    ).length;

  const appointmentsThisMonth =
    appointments.filter(
      (
        appointment
      ) => {
        if (
          appointment.status !==
          "Realizado"
        ) {
          return false;
        }

        const date =
          new Date(
            `${appointment.date}T12:00:00`
          );

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date.getFullYear() ===
            currentYear &&
          date.getMonth() ===
            currentMonth
        );
      }
    ).length;

  const upcomingAppointments =
    appointments.filter(
      (
        appointment
      ) => {
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

        const date =
          new Date(
            `${appointment.date}T${appointment.time || "00:00"}:00`
          );

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date.getTime() >=
            now.getTime()
        );
      }
    ).length;

  const convenios =
    useMemo(
      () => {
        const values =
          patients
            .map(
              (
                patient
              ) =>
                patient.convenio ||
                "Particular"
            )
            .filter(
              Boolean
            );

        return Array.from(
          new Set(
            values
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "pt-BR"
            )
        );
      },
      [
        patients,
      ]
    );

  function handleClearFilters() {
    setSearch("");
    setStatus("Todos");
    setConvenio("Todos");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* CABEÇALHO */}

        <PatientHeader />

        {isProfissional && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-3 text-xs font-semibold text-violet-700">
            Exibindo somente pacientes vinculados aos seus atendimentos e à sua especialidade.
          </div>
        )}

        {loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-xs font-semibold text-rose-700">
            {loadError}
          </div>
        )}

        {loadingPatients && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
            Carregando pacientes…
          </div>
        )}

        {/* INDICADORES */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total de pacientes"
            value={
              String(
                totalPatients
              )
            }
            description="Pacientes cadastrados"
            icon={
              Users
            }
            iconStyle="bg-[#eeeaff] text-[#6847f5]"
            valueStyle="text-[#6847f5]"
          />

          <MetricCard
            title="Ativos"
            value={
              String(
                activePatients
              )
            }
            description={
              totalPatients >
              0
                ? `${Math.round(
                    (
                      activePatients /
                      totalPatients
                    ) *
                      100
                  )}% do total`
                : "Nenhum cadastro"
            }
            icon={
              UserCheck
            }
            iconStyle="bg-[#eaf4ff] text-[#3988e8]"
            valueStyle="text-[#357fd6]"
          />

          <MetricCard
            title="Consultas este mês"
            value={
              String(
                appointmentsThisMonth
              )
            }
            description="Agenda ainda não integrada — não conta pacientes novos"
            icon={
              CalendarCheck2
            }
            iconStyle="bg-[#e8faf4] text-[#2daf82]"
            valueStyle="text-[#269d75]"
          />

          <MetricCard
            title="Próximas consultas"
            value={
              String(
                upcomingAppointments
              )
            }
            description="Agenda ainda não integrada — não conta pacientes novos"
            icon={
              CalendarClock
            }
            iconStyle="bg-[#fff4e7] text-[#ed982f]"
            valueStyle="text-[#dc8a27]"
          />

          <MetricCard
            title="Inativos"
            value={
              String(
                inactivePatients
              )
            }
            description={
              totalPatients >
              0
                ? `${Math.round(
                    (
                      inactivePatients /
                      totalPatients
                    ) *
                      100
                  )}% do total`
                : "Nenhum cadastro"
            }
            icon={
              UserX
            }
            iconStyle="bg-[#fff0f3] text-[#eb5771]"
            valueStyle="text-[#df4e67]"
          />
        </div>

        {/* FILTROS */}

        <PatientFilters
          search={
            search
          }
          status={
            status
          }
          convenio={
            convenio
          }
          convenios={
            convenios
          }
          onSearchChange={
            setSearch
          }
          onStatusChange={
            setStatus
          }
          onConvenioChange={
            setConvenio
          }
          onClear={
            handleClearFilters
          }
        />

        {/* TABELA */}

        <PatientTable
          search={
            search
          }
          statusFilter={
            status
          }
          convenioFilter={
            convenio
          }
        />

        {/* DICA */}

        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e2ff] bg-gradient-to-r from-[#f3efff] via-[#f7f4ff] to-[#fbf9ff] px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
            <UserPlus
              size={18}
            />
          </span>

          <p className="text-sm font-medium text-[#657196]">
            <strong className="text-[#6543ef]">
              Dica:
            </strong>{" "}
            clique em visualizar para acessar o perfil completo, agenda, objetivos, evoluções e documentos do paciente.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CARD DE MÉTRICA
========================================= */

interface MetricCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    typeof Users;

  iconStyle:
    string;

  valueStyle:
    string;
}

function MetricCard({
  title,
  value,
  description,
  icon:
    Icon,
  iconStyle,
  valueStyle,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e9ebf4] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(51,65,120,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-[#68769b]">
            {
              title
            }
          </p>

          <p
            className={`mt-3 text-[27px] font-extrabold tracking-[-0.03em] ${valueStyle}`}
          >
            {
              value
            }
          </p>

          <p className="mt-1.5 text-[10px] font-medium text-[#98a1ba]">
            {
              description
            }
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon
            size={20}
          />
        </span>
      </div>
    </div>
  );
}