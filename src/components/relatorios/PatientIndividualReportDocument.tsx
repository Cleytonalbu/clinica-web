import { X, Printer } from "lucide-react";

import type { ReactNode } from "react";
import type { StoredEvolution } from "@/pages/Pacientes/evolutionStorage";
import type { TherapeuticObjective } from "@/pages/Pacientes/objectiveStorage";
import type { StoredAppointment } from "@/pages/Agenda/appointmentStorage";

export type PatientIndividualReportType =
  | "clinical"
  | "objectives"
  | "attendance";

interface Props {
  type: PatientIndividualReportType;
  patientName: string;
  patientId: number;
  specialty: string;
  periodLabel: string;
  professionalName: string;
  evolutions: StoredEvolution[];
  objectives: TherapeuticObjective[];
  appointments: StoredAppointment[];
  preview?: boolean;
  onClose?: () => void;
  onPrint?: () => void;
}

export function PatientIndividualReportDocument({
  type,
  patientName,
  patientId,
  specialty,
  periodLabel,
  professionalName,
  evolutions,
  objectives,
  appointments,
  preview = false,
  onClose,
  onPrint,
}: Props) {
  const title =
    type === "clinical"
      ? "Relatório de Evolução Clínica"
      : type === "objectives"
        ? "Relatório de Objetivos Terapêuticos"
        : "Relatório de Frequência";

  return (
    <div className={preview ? "pir-preview" : "pir-print"}>
      {preview && (
        <div className="pir-toolbar">
          <div>
            <strong>Pré-visualização</strong>
            <span>{title}</span>
          </div>

          <div className="pir-toolbar-actions">
            <button type="button" onClick={onPrint}>
              <Printer size={16} />
              Gerar PDF
            </button>

            <button
              type="button"
              className="pir-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <article className="pir-document">
        <Header
          title={title}
          patientName={patientName}
          patientId={patientId}
          specialty={specialty}
          periodLabel={periodLabel}
          professionalName={professionalName}
        />

        {type === "clinical" && (
          <Clinical
            evolutions={evolutions}
            objectives={objectives}
          />
        )}

        {type === "objectives" && (
          <Objectives
            objectives={objectives}
            evolutions={evolutions}
          />
        )}

        {type === "attendance" && (
          <Attendance appointments={appointments} />
        )}

        <footer className="pir-footer">
          <div>
            <strong>Clínica Integrada Entre Afetos</strong>
            <span>{title}</span>
          </div>

          <div className="pir-right">
            <span>AC Software</span>
            <span>Documento gerado pelo sistema</span>
          </div>
        </footer>
      </article>
    </div>
  );
}

function Header({
  title,
  patientName,
  patientId,
  specialty,
  periodLabel,
  professionalName,
}: {
  title: string;
  patientName: string;
  patientId: number;
  specialty: string;
  periodLabel: string;
  professionalName: string;
}) {
  return (
    <>
      <header className="pir-header">
        <div className="pir-brand">
          <div className="pir-mark">EA</div>

          <div>
            <p className="pir-kicker">CLÍNICA INTEGRADA</p>
            <p className="pir-brand-name">Entre Afetos</p>
          </div>
        </div>

        <div className="pir-meta">
          <span>Relatório clínico individual</span>
          <strong>Paciente #{patientId}</strong>
        </div>
      </header>

      <section className="pir-title">
        <div>
          <p className="pir-eyebrow">ACOMPANHAMENTO DO PACIENTE</p>
          <h1>{title}</h1>
          <p className="pir-patient">{patientName}</p>
        </div>

        <div className="pir-period">
          <span>Período</span>
          <strong>{periodLabel}</strong>
          <small>Gerado em {new Date().toLocaleString("pt-BR")}</small>
        </div>
      </section>

      <section className="pir-filter">
        <span><strong>Especialidade:</strong> {specialty || "Todas"}</span>
        <span><strong>Profissional:</strong> {professionalName || "Equipe clínica"}</span>
      </section>
    </>
  );
}

function Clinical({
  evolutions,
  objectives,
}: {
  evolutions: StoredEvolution[];
  objectives: TherapeuticObjective[];
}) {
  const finalized = evolutions.filter((item) => item.status === "FINALIZADA");
  const worked = finalized.reduce((sum, item) => sum + (item.objectives?.length || 0), 0);
  const impacts = count(finalized.flatMap((item) => item.observedImpacts || []));
  const results = count(finalized.map((item) => item.sessionResult || "Não informado"));
  const latest = [...finalized].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))[0];

  return (
    <>
      <Section n="01" title="Resumo executivo" subtitle="Síntese dos registros clínicos do período.">
        <div className="pir-metrics">
          <Metric label="Evoluções" value={String(finalized.length)} note="registros finalizados" />
          <Metric label="Objetivos trabalhados" value={String(worked)} note="marcações nas sessões" />
          <Metric label="Objetivos ativos" value={String(objectives.length)} note="plano terapêutico" />
          <Metric label="Impactos" value={String(impacts.length)} note="categorias observadas" />
          <Metric label="Última evolução" value={latest ? fmt(latest.sessionDate) : "—"} note="registro mais recente" />
          <Metric label="Profissionais" value={String(new Set(finalized.map((x) => x.professional)).size)} note="autores dos registros" />
        </div>
      </Section>

      <div className="pir-two">
        <Section n="02" title="Resultado das sessões" subtitle="Distribuição dos resultados registrados.">
          <Bars items={results} />
        </Section>

        <Section n="03" title="Impactos observados" subtitle="Categorias mais frequentes nas evoluções.">
          <Bars items={impacts} />
        </Section>
      </div>

      <Section n="04" title="Análise clínica" subtitle="Leitura consolidada dos registros disponíveis.">
        <div className="pir-analysis">
          <p>
            Foram localizadas <strong>{finalized.length} evoluções finalizadas</strong> no período,
            com <strong>{worked} marcações de objetivos trabalhados</strong>.
          </p>
          {latest && (
            <p>
              O registro mais recente é de <strong>{fmt(latest.sessionDate)}</strong>,
              realizado por <strong>{latest.professional}</strong> em <strong>{latest.specialty}</strong>.
            </p>
          )}
          <p>O documento utiliza somente os registros disponíveis para o perfil, período e especialidade selecionados.</p>
        </div>
      </Section>

      <Section n="05" title="Histórico das evoluções" subtitle="Registros clínicos em ordem cronológica.">
        <div className="pir-timeline">
          {finalized.length ? [...finalized]
            .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
            .map((item) => (
              <div className="pir-timeline-item" key={item.id}>
                <div className="pir-date">
                  <strong>{fmt(item.sessionDate)}</strong>
                  <span>{item.startTime || "—"}</span>
                </div>

                <div>
                  <div className="pir-timeline-head">
                    <strong>{item.professional}</strong>
                    <span>{item.specialty}</span>
                  </div>

                  <p>{strip(item.writtenEvolution) || "Sem texto clínico registrado."}</p>

                  <div className="pir-tags">
                    {(item.observedImpacts || []).map((impact) => (
                      <span key={impact}>{impact}</span>
                    ))}
                  </div>

                  {item.sessionResultObservation && (
                    <small>Observação: {item.sessionResultObservation}</small>
                  )}
                </div>
              </div>
            )) : <Empty text="Nenhuma evolução finalizada encontrada." />}
        </div>
      </Section>
    </>
  );
}

function Objectives({
  objectives,
  evolutions,
}: {
  objectives: TherapeuticObjective[];
  evolutions: StoredEvolution[];
}) {
  const achieved = objectives.filter((x) => x.status === "Atingido").length;
  const evolving = objectives.filter((x) => x.status === "Em evolução").length;
  const regression = objectives.filter((x) => x.status === "Com regressão").length;
  const avg = objectives.length
    ? Math.round(objectives.reduce((sum, x) => sum + x.progress, 0) / objectives.length)
    : 0;
  const groups = count(objectives.map((x) => x.generalObjective || "Objetivo terapêutico geral"));
  const worked = count(evolutions.flatMap((e) => e.objectives?.map((x) => x.name) || []));

  return (
    <>
      <Section n="01" title="Resumo executivo" subtitle="Situação geral dos objetivos terapêuticos.">
        <div className="pir-metrics">
          <Metric label="Objetivos" value={String(objectives.length)} note="cadastrados" />
          <Metric label="Atingidos" value={String(achieved)} note="concluídos" />
          <Metric label="Em evolução" value={String(evolving)} note="em acompanhamento" />
          <Metric label="Com regressão" value={String(regression)} note="requerem atenção" />
          <Metric label="Progresso médio" value={`${avg}%`} note="média cadastrada" />
          <Metric label="Trabalhados" value={String(worked.reduce((s, x) => s + x.value, 0))} note="marcações nas sessões" />
        </div>
      </Section>

      <div className="pir-two">
        <Section n="02" title="Status dos objetivos" subtitle="Distribuição por situação atual.">
          <Donut values={[
            { label: "Atingidos", value: achieved, color: "#16a34a" },
            { label: "Em evolução", value: evolving, color: "#6543ef" },
            { label: "Com regressão", value: regression, color: "#ef476f" },
          ]} />
        </Section>

        <Section n="03" title="Objetivos gerais" subtitle="Distribuição dos objetivos específicos.">
          <Bars items={groups} />
        </Section>
      </div>

      <Section n="04" title="Objetivos mais trabalhados" subtitle="Frequência de marcação nas evoluções.">
        <Bars items={worked} />
      </Section>

      <Section n="05" title="Análise terapêutica" subtitle="Síntese automática dos indicadores.">
        <div className="pir-analysis">
          <p>
            O plano apresenta <strong>{objectives.length} objetivos</strong>:{" "}
            <strong>{achieved} atingidos</strong>, <strong>{evolving} em evolução</strong> e{" "}
            <strong>{regression} com regressão</strong>.
          </p>
          <p>O progresso médio cadastrado é de <strong>{avg}%</strong>.</p>
        </div>
      </Section>

      <Section n="06" title="Detalhamento dos objetivos" subtitle="Relação dos objetivos terapêuticos filtrados.">
        <table className="pir-table">
          <thead>
            <tr>
              <th>Objetivo geral</th>
              <th>Objetivo específico</th>
              <th>Status</th>
              <th>Progresso</th>
              <th>Profissional</th>
              <th>Início</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((item) => (
              <tr key={item.id}>
                <td>{item.generalObjective}</td>
                <td><strong>{item.title}</strong></td>
                <td>{item.status}</td>
                <td>{item.progress}%</td>
                <td>{item.professional}</td>
                <td>{fmt(item.startDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Attendance({
  appointments,
}: {
  appointments: StoredAppointment[];
}) {
  const realized = appointments.filter((x) => x.status === "Realizado").length;
  const absent = appointments.filter((x) => x.status === "Faltou").length;
  const cancelled = appointments.filter((x) => x.status === "Cancelado").length;
  const confirmed = appointments.filter((x) => x.status === "Confirmado").length;
  const rate = realized + absent ? Math.round((realized / (realized + absent)) * 100) : 0;
  const months = monthly(appointments);

  return (
    <>
      <Section n="01" title="Resumo executivo" subtitle="Indicadores de presença e situação dos atendimentos.">
        <div className="pir-metrics">
          <Metric label="Atendimentos" value={String(appointments.length)} note="registros no período" />
          <Metric label="Realizados" value={String(realized)} note="presenças" />
          <Metric label="Faltas" value={String(absent)} note="ausências" />
          <Metric label="Cancelados" value={String(cancelled)} note="sessões canceladas" />
          <Metric label="Confirmados" value={String(confirmed)} note="a realizar" />
          <Metric label="Taxa de presença" value={`${rate}%`} note="realizados / realizados + faltas" />
        </div>
      </Section>

      <div className="pir-two">
        <Section n="02" title="Distribuição dos atendimentos" subtitle="Situação dos registros no período.">
          <Donut values={[
            { label: "Realizados", value: realized, color: "#6543ef" },
            { label: "Faltas", value: absent, color: "#f59e0b" },
            { label: "Cancelados", value: cancelled, color: "#ef476f" },
            { label: "Confirmados", value: confirmed, color: "#2563eb" },
          ]} />
        </Section>

        <Section n="03" title="Frequência por mês" subtitle="Realizados e faltas por competência.">
          <Monthly items={months} />
        </Section>
      </div>

      <Section n="04" title="Análise de frequência" subtitle="Síntese automática do comparecimento.">
        <div className="pir-analysis">
          <p>
            Foram encontrados <strong>{appointments.length} atendimentos</strong>, com{" "}
            <strong>{realized} presenças</strong>, <strong>{absent} faltas</strong> e{" "}
            <strong>{cancelled} cancelamentos</strong>.
          </p>
          <p>A taxa de presença foi de <strong>{rate}%</strong>.</p>
        </div>
      </Section>

      <Section n="05" title="Detalhamento da frequência" subtitle="Relação cronológica dos atendimentos.">
        <table className="pir-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Profissional</th>
              <th>Especialidade</th>
              <th>Tipo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...appointments].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
              <tr key={item.id}>
                <td>{fmt(item.date)}</td>
                <td>{item.time}{item.endTime ? ` - ${item.endTime}` : ""}</td>
                <td>{item.professional}</td>
                <td>{item.specialty}</td>
                <td>{item.type}</td>
                <td><strong>{item.status}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Section({
  n,
  title,
  subtitle,
  children,
}: {
  n: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="pir-section">
      <div className="pir-section-title">
        <span>{n}</span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="pir-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

interface CountItem { label: string; value: number; }

function Bars({ items }: { items: CountItem[] }) {
  const data = items.slice(0, 7);
  const max = Math.max(1, ...data.map((x) => x.value));

  return (
    <div className="pir-bars">
      {data.length ? data.map((item) => (
        <div className="pir-bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="pir-bar-track">
            <div className="pir-bar-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{item.value}</strong>
        </div>
      )) : <Empty text="Sem dados suficientes para este gráfico." />}
    </div>
  );
}

function Donut({
  values,
}: {
  values: { label: string; value: number; color: string }[];
}) {
  const total = Math.max(1, values.reduce((s, x) => s + x.value, 0));
  const circumference = 2 * Math.PI * 42;
  let offset = 0;

  return (
    <div className="pir-donut">
      <svg viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="42" fill="none" stroke="#eef1f7" strokeWidth="14" />
        {values.map((item) => {
          const length = circumference * (item.value / total);
          const node = (
            <circle
              key={item.label}
              cx="55"
              cy="55"
              r="42"
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 55 55)"
            />
          );
          offset += length;
          return node;
        })}
        <text x="55" y="54" textAnchor="middle" className="pir-donut-main">
          {values.reduce((s, x) => s + x.value, 0)}
        </text>
        <text x="55" y="68" textAnchor="middle" className="pir-donut-sub">registros</text>
      </svg>

      <div className="pir-legend">
        {values.map((item) => (
          <div key={item.label}>
            <span className="pir-dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value} • {Math.round((item.value / total) * 100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Monthly({
  items,
}: {
  items: { label: string; realized: number; absent: number }[];
}) {
  const max = Math.max(1, ...items.flatMap((x) => [x.realized, x.absent]));

  return (
    <div className="pir-monthly">
      {items.map((item) => (
        <div className="pir-month-row" key={item.label}>
          <span>{item.label}</span>
          <div><i className="pir-realized" style={{ width: `${(item.realized / max) * 100}%` }} /></div>
          <strong>{item.realized}</strong>
          <div><i className="pir-absent" style={{ width: `${(item.absent / max) * 100}%` }} /></div>
          <strong>{item.absent}</strong>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="pir-empty">{text}</p>;
}

function count(values: string[]): CountItem[] {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function monthly(appointments: StoredAppointment[]) {
  const map = new Map<string, { label: string; realized: number; absent: number }>();

  appointments.forEach((item) => {
    const [year, month] = item.date.split("-");
    if (!year || !month) return;

    const key = `${year}-${month}`;
    const label = new Date(Number(year), Number(month) - 1, 1)
      .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    const current = map.get(key) ?? { label, realized: 0, absent: 0 };
    if (item.status === "Realizado") current.realized += 1;
    if (item.status === "Faltou") current.absent += 1;
    map.set(key, current);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

function fmt(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function strip(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export const PATIENT_INDIVIDUAL_REPORT_STYLES = `
  .pir-print { display:none; }
  .pir-preview { position:fixed; inset:0; z-index:100; overflow:auto; background:rgba(15,23,42,.6); padding:24px; }
  .pir-toolbar { position:sticky; top:0; z-index:2; width:min(900px,100%); margin:auto; display:flex; align-items:center; justify-content:space-between; gap:16px; border:1px solid #e2e8f0; border-bottom:0; border-radius:14px 14px 0 0; background:#fff; padding:12px 16px; }
  .pir-toolbar strong,.pir-toolbar span { display:block; }
  .pir-toolbar span { color:#64748b; font-size:12px; }
  .pir-toolbar-actions { display:flex; align-items:center; gap:8px; }
  .pir-toolbar-actions button { display:inline-flex; align-items:center; gap:7px; border:0; border-radius:8px; background:#6543ef; color:#fff; padding:9px 13px; font-weight:700; }
  .pir-toolbar-actions .pir-close { width:38px; height:38px; justify-content:center; border:1px solid #e2e8f0; background:#fff; color:#64748b; padding:0; }
  .pir-document { width:min(900px,100%); margin:0 auto 32px; background:#fff; padding:36px; color:#172033; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.5; }
  .pir-preview .pir-document { border-radius:0 0 14px 14px; box-shadow:0 24px 70px rgba(15,23,42,.24); }
  .pir-header,.pir-brand,.pir-filter,.pir-footer { display:flex; }
  .pir-header { align-items:center; justify-content:space-between; gap:20px; padding-bottom:13px; border-bottom:2px solid #10235f; }
  .pir-brand { align-items:center; gap:10px; }
  .pir-mark { display:flex; width:42px; height:42px; align-items:center; justify-content:center; border-radius:11px; background:#6543ef; color:#fff; font-weight:800; }
  .pir-kicker { margin:0; color:#6543ef; font-size:9px; font-weight:800; letter-spacing:1.2px; }
  .pir-brand-name { margin:1px 0 0; color:#10235f; font-size:20px; font-weight:800; }
  .pir-meta { text-align:right; color:#64748b; font-size:10px; } .pir-meta span,.pir-meta strong { display:block; } .pir-meta strong { color:#10235f; font-size:12px; }
  .pir-title { display:grid; grid-template-columns:1fr 230px; gap:24px; align-items:end; padding:22px 0 14px; }
  .pir-eyebrow { margin:0 0 5px; color:#6543ef; font-size:9px; font-weight:800; letter-spacing:1.1px; }
  .pir-title h1 { margin:0; color:#10235f; font-size:28px; line-height:1.08; }
  .pir-patient { margin:7px 0 0; color:#59657e; font-size:14px; font-weight:700; }
  .pir-period { border:1px solid #dfe4f2; border-radius:9px; background:#f7f8fc; padding:11px 13px; }
  .pir-period span,.pir-period small,.pir-period strong { display:block; } .pir-period span,.pir-period small { color:#7c879f; font-size:9px; } .pir-period strong { margin:3px 0; color:#10235f; }
  .pir-filter { gap:22px; margin-bottom:18px; border-left:3px solid #6543ef; background:#f7f5ff; padding:9px 11px; color:#5e6983; font-size:10px; }
  .pir-filter strong { color:#2c3754; }
  .pir-section { margin-top:18px; break-inside:avoid; }
  .pir-section-title { display:flex; align-items:flex-start; gap:9px; margin-bottom:10px; }
  .pir-section-title>span { display:flex; width:26px; height:26px; align-items:center; justify-content:center; border-radius:7px; background:#eeeaff; color:#6543ef; font-size:9px; font-weight:800; }
  .pir-section-title h2 { margin:0; color:#10235f; font-size:15px; } .pir-section-title p { margin:2px 0 0; color:#7a859e; font-size:10px; }
  .pir-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .pir-metric { border:1px solid #e2e6f0; border-radius:8px; padding:10px; }
  .pir-metric>span { display:block; color:#7b869d; font-size:9px; font-weight:700; text-transform:uppercase; }
  .pir-metric>strong { display:block; margin-top:3px; color:#10235f; font-size:18px; } .pir-metric small { color:#98a1b5; font-size:9px; }
  .pir-two { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .pir-bars,.pir-monthly,.pir-donut { border:1px solid #e4e8f2; border-radius:9px; background:#fbfbfd; padding:12px; }
  .pir-bar-row { display:grid; grid-template-columns:140px 1fr 24px; gap:8px; align-items:center; margin:8px 0; color:#66728b; font-size:10px; }
  .pir-bar-track { height:8px; overflow:hidden; border-radius:999px; background:#eceff5; } .pir-bar-fill { height:100%; border-radius:999px; background:#6543ef; }
  .pir-donut { display:grid; grid-template-columns:120px 1fr; align-items:center; gap:12px; } .pir-donut svg { width:116px; height:116px; }
  .pir-donut-main { fill:#10235f; font-size:17px; font-weight:800; } .pir-donut-sub { fill:#8791a8; font-size:7px; }
  .pir-legend { display:grid; gap:7px; } .pir-legend>div { display:grid; grid-template-columns:8px 1fr auto; gap:6px; align-items:center; color:#66728b; font-size:9px; }
  .pir-dot { width:7px; height:7px; border-radius:50%; }
  .pir-analysis { border:1px solid #dfe4f2; border-left:4px solid #6543ef; border-radius:8px; background:#faf9ff; padding:12px 14px; color:#536078; }
  .pir-analysis p { margin:0 0 7px; } .pir-analysis p:last-child { margin-bottom:0; }
  .pir-timeline { display:grid; gap:10px; } .pir-timeline-item { display:grid; grid-template-columns:95px 1fr; gap:14px; border:1px solid #e4e8f2; border-radius:9px; padding:11px; }
  .pir-date strong,.pir-date span,.pir-timeline-head strong,.pir-timeline-head span { display:block; } .pir-date span,.pir-timeline-head span { color:#8791a8; font-size:9px; }
  .pir-timeline-item p { margin:7px 0; color:#536078; }
  .pir-tags { display:flex; flex-wrap:wrap; gap:5px; } .pir-tags span { border-radius:999px; background:#eeeaff; padding:3px 7px; color:#6543ef; font-size:8px; }
  .pir-month-row { display:grid; grid-template-columns:70px 1fr 20px 1fr 20px; gap:6px; align-items:center; margin:8px 0; font-size:9px; }
  .pir-month-row>div { height:7px; overflow:hidden; border-radius:999px; background:#eceff5; } .pir-month-row i { display:block; height:100%; } .pir-realized { background:#6543ef; } .pir-absent { background:#f59e0b; }
  .pir-table { width:100%; border-collapse:collapse; font-size:9px; } .pir-table th { border-bottom:1.5px solid #10235f; background:#f4f5f9; padding:7px 6px; color:#36415c; text-align:left; text-transform:uppercase; }
  .pir-table td { border-bottom:1px solid #e6e9f1; padding:7px 6px; color:#556179; }
  .pir-footer { justify-content:space-between; gap:20px; margin-top:22px; border-top:1px solid #d9deea; padding-top:9px; color:#8a94a9; font-size:9px; }
  .pir-footer strong,.pir-footer span { display:block; } .pir-footer strong { color:#10235f; } .pir-right { text-align:right; } .pir-empty { color:#8791a8; font-size:10px; }

  @media print {
    @page { size:A4 portrait; margin:12mm 12mm 13mm; }
    html,body { background:#fff !important; overflow:visible !important; }
    body * { visibility:hidden !important; }
    .pir-print,.pir-print * { visibility:visible !important; }
    .pir-print { display:block !important; position:absolute !important; inset:0 auto auto 0 !important; width:100% !important; }
    .pir-print .pir-document { width:100% !important; margin:0 !important; padding:0 !important; box-shadow:none !important; font-size:9pt !important; }
    .pir-preview { display:none !important; }
    .pir-section,.pir-two,.pir-metric,.pir-bars,.pir-donut,.pir-analysis,.pir-timeline-item { break-inside:avoid; page-break-inside:avoid; }
    .pir-table thead { display:table-header-group; } .pir-table tr { break-inside:avoid; page-break-inside:avoid; }
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
`;