import {
  CalendarCheck2,
  Clock3,
  Phone,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageCard } from "@/components/ui";

const professional = {
  phone: "(83) 99999-1111",
  email: "ana.paula@entreafetos.com.br",
  specialty: "Psicologia",
  council: "CRP 13/12345",
  patients: 32,
  appointmentsMonth: 126,
  appointmentsToday: 8,
  attendanceRate: "94%",
};

export function ProfessionalOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Pacientes"
          value={String(
            professional.patients
          )}
          icon={<Users size={22} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Atendimentos no mês"
          value={String(
            professional.appointmentsMonth
          )}
          icon={
            <CalendarCheck2
              size={22}
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <MetricCard
          title="Agenda hoje"
          value={String(
            professional.appointmentsToday
          )}
          icon={<Clock3 size={22} />}
          className="bg-amber-100 text-amber-600"
        />

        <MetricCard
          title="Comparecimento"
          value={
            professional.attendanceRate
          }
          icon={
            <TrendingUp size={22} />
          }
          className="bg-violet-100 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <PageCard
            title="Dados Profissionais"
            description="Informações principais do profissional."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Info
                icon={
                  <Stethoscope
                    size={18}
                  />
                }
                label="Especialidade"
                value={
                  professional.specialty
                }
              />

              <Info
                icon={
                  <Stethoscope
                    size={18}
                  />
                }
                label="Conselho"
                value={
                  professional.council
                }
              />

              <Info
                icon={
                  <Phone size={18} />
                }
                label="Telefone"
                value={
                  professional.phone
                }
              />

              <Info
                icon={
                  <Users size={18} />
                }
                label="E-mail"
                value={
                  professional.email
                }
              />
            </div>
          </PageCard>

          <PageCard
            title="Próximos Atendimentos"
            description="Agenda do profissional para hoje."
          >
            <div className="space-y-3">
              <AppointmentRow
                time="08:00"
                patient="Maria Oliveira"
                specialty="Psicologia"
              />

              <AppointmentRow
                time="09:00"
                patient="João Miguel Silva"
                specialty="Psicologia"
              />

              <AppointmentRow
                time="10:30"
                patient="Lucas Gabriel"
                specialty="Psicologia"
              />

              <AppointmentRow
                time="14:00"
                patient="Ana Clara Rodrigues"
                specialty="Psicologia"
              />
            </div>
          </PageCard>
        </div>

        <div className="space-y-6">
          <PageCard
            title="Carga Horária"
            description="Resumo da disponibilidade semanal."
          >
            <div className="space-y-3">
              <SummaryRow
                label="Segunda"
                value="08h às 17h"
              />

              <SummaryRow
                label="Terça"
                value="08h às 17h"
              />

              <SummaryRow
                label="Quarta"
                value="08h às 12h"
              />

              <SummaryRow
                label="Quinta"
                value="08h às 17h"
              />

              <SummaryRow
                label="Sexta"
                value="08h às 12h"
              />
            </div>
          </PageCard>

          <PageCard
            title="Resumo do mês"
            description="Indicadores rápidos."
          >
            <div className="space-y-3">
              <SummaryRow
                label="Realizados"
                value="118"
              />

              <SummaryRow
                label="Cancelados"
                value="5"
              />

              <SummaryRow
                label="Faltas"
                value="3"
              />

              <SummaryRow
                label="Evoluções registradas"
                value="112"
              />
            </div>
          </PageCard>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}

function MetricCard({
  title,
  value,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface InfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Info({
  icon,
  label,
  value,
}: InfoProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

interface AppointmentRowProps {
  time: string;
  patient: string;
  specialty: string;
}

function AppointmentRow({
  time,
  patient,
  specialty,
}: AppointmentRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
      <div className="flex h-11 min-w-16 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
        {time}
      </div>

      <div>
        <p className="font-semibold text-slate-800">
          {patient}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {specialty}
        </p>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}