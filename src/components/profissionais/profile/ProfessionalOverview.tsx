import {
  CalendarCheck2,
  Clock3,
  Phone,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { PageCard } from "@/components/ui";

import {
  listarAgendamentos,
  type ApiAgendamento,
} from "@/services/agenda";

import type { ApiProfissional } from "@/services/referencias";

interface ProfessionalOverviewProps {
  profissional: ApiProfissional;
}

function inicioDoMes() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProfessionalOverview({
  profissional,
}: ProfessionalOverviewProps) {
  const [agendaMes, setAgendaMes] = useState<ApiAgendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    listarAgendamentos({
      profissionalId: profissional.id,
      dataInicio: inicioDoMes(),
      dataFim: hojeISO(),
      porPagina: 300,
    })
      .then((resposta) => {
        if (cancelado) return;
        setAgendaMes(resposta.dados.filter((a) => a.tipo === "ATENDIMENTO"));
      })
      .catch(() => {})
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [profissional.id]);

  const hoje = hojeISO();
  const agendaHoje = agendaMes.filter((a) => a.dataHora.slice(0, 10) === hoje);
  const realizados = agendaMes.filter((a) => a.status === "CONCLUIDO").length;
  const cancelados = agendaMes.filter((a) => a.status === "CANCELADO").length;
  const faltas = agendaMes.filter((a) => a.status === "FALTOU").length;
  const taxaComparecimento = agendaMes.length > 0
    ? Math.round((realizados / agendaMes.length) * 100)
    : 0;

  const proximosHoje = agendaHoje
    .filter((a) => a.status !== "CANCELADO" && a.status !== "FALTOU")
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    .slice(0, 4);

  const especialidadeNome = profissional.especialidades[0]?.especialidade.nome ?? "Sem especialidade";
  const conselho = [profissional.conselho, profissional.registro].filter(Boolean).join(" ") || "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Pacientes"
          value={loading ? "…" : String(profissional.pacientes ?? 0)}
          icon={<Users size={22} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <MetricCard
          title="Atendimentos no mês"
          value={loading ? "…" : String(agendaMes.length)}
          icon={
            <CalendarCheck2
              size={22}
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <MetricCard
          title="Agenda hoje"
          value={loading ? "…" : String(agendaHoje.length)}
          icon={<Clock3 size={22} />}
          className="bg-amber-100 text-amber-600"
        />

        <MetricCard
          title="Comparecimento"
          value={loading ? "…" : `${taxaComparecimento}%`}
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
                value={especialidadeNome}
              />

              <Info
                icon={
                  <Stethoscope
                    size={18}
                  />
                }
                label="Conselho"
                value={conselho}
              />

              <Info
                icon={
                  <Phone size={18} />
                }
                label="Telefone"
                value={profissional.telefone || "—"}
              />

              <Info
                icon={
                  <Users size={18} />
                }
                label="E-mail"
                value={profissional.usuario.email}
              />
            </div>
          </PageCard>

          <PageCard
            title="Próximos Atendimentos"
            description="Agenda do profissional para hoje."
          >
            {loading ? (
              <p className="text-sm text-slate-400">Carregando…</p>
            ) : proximosHoje.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum atendimento restante para hoje.</p>
            ) : (
              <div className="space-y-3">
                {proximosHoje.map((agendamento) => (
                  <AppointmentRow
                    key={agendamento.id}
                    time={formatarHora(agendamento.dataHora)}
                    patient={agendamento.paciente?.nome ?? "-"}
                    specialty={
                      agendamento.especialidade?.nome ??
                        agendamento.profissional?.especialidades[0]?.especialidade.nome ??
                        ""
                    }
                  />
                ))}
              </div>
            )}
          </PageCard>
        </div>

        <div className="space-y-6">
          {/*
           * ⚠️ "Carga Horária" não tem fonte real: não existe um modelo de
           * horário de trabalho/disponibilidade configurado por profissional
           * no backend (só a agenda de atendimentos já marcados). Mantido
           * como exemplo estático até essa configuração existir.
           */}
          <PageCard
            title="Carga Horária"
            description="Resumo da disponibilidade semanal (ainda não configurável)."
          >
            <div className="space-y-3">
              <SummaryRow
                label="Segunda a sexta"
                value="Configurável em breve"
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
                value={loading ? "…" : String(realizados)}
              />

              <SummaryRow
                label="Cancelados"
                value={loading ? "…" : String(cancelados)}
              />

              <SummaryRow
                label="Faltas"
                value={loading ? "…" : String(faltas)}
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
