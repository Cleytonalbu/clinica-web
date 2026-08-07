import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button, PageCard } from "@/components/ui";

type ObjectiveStatus =
  | "Em evolução"
  | "Atingido"
  | "Com regressão";

interface Objective {
  id: number;
  title: string;
  specialty: string;
  professional: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: ObjectiveStatus;
}

const objectives: Objective[] = [
  {
    id: 1,
    title: "Melhorar comunicação verbal",
    specialty: "Fonoaudiologia",
    professional: "Dra. Camila Soares",
    startDate: "10/02/2026",
    targetDate: "10/08/2026",
    progress: 70,
    status: "Em evolução",
  },
  {
    id: 2,
    title: "Aumentar atenção sustentada",
    specialty: "Psicologia",
    professional: "Dra. Ana Paula",
    startDate: "15/03/2026",
    targetDate: "15/09/2026",
    progress: 60,
    status: "Em evolução",
  },
  {
    id: 3,
    title: "Desenvolver autonomia nas tarefas",
    specialty: "Terapia Ocupacional",
    professional: "Dra. Larissa Lima",
    startDate: "02/05/2026",
    targetDate: "02/11/2026",
    progress: 40,
    status: "Em evolução",
  },
  {
    id: 4,
    title: "Reconhecer emoções básicas",
    specialty: "Psicologia",
    professional: "Dra. Ana Paula",
    startDate: "20/01/2026",
    targetDate: "20/07/2026",
    progress: 100,
    status: "Atingido",
  },
  {
    id: 5,
    title: "Fortalecer consciência fonológica",
    specialty: "Fonoaudiologia",
    professional: "Dra. Camila Soares",
    startDate: "22/04/2026",
    targetDate: "22/10/2026",
    progress: 20,
    status: "Com regressão",
  },
];

export function PatientObjectives() {
  const activeObjectives = objectives.filter(
    (objective) => objective.status === "Em evolução"
  );

  const achievedObjectives = objectives.filter(
    (objective) => objective.status === "Atingido"
  );

  const regressionObjectives = objectives.filter(
    (objective) => objective.status === "Com regressão"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Objetivos Terapêuticos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os objetivos, progresso e resultados do paciente.
          </p>
        </div>

        <Button type="button">
          <Plus size={18} />
          Novo objetivo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Em evolução"
          value={String(activeObjectives.length)}
          description="Objetivos em acompanhamento"
          icon={<TrendingUp size={22} />}
          iconClassName="bg-amber-100 text-amber-600"
        />

        <SummaryCard
          title="Atingidos"
          value={String(achievedObjectives.length)}
          description="Objetivos concluídos"
          icon={<CheckCircle2 size={22} />}
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Com regressão"
          value={String(regressionObjectives.length)}
          description="Precisam de atenção"
          icon={<AlertTriangle size={22} />}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      <PageCard
        title="Objetivos ativos"
        description="Objetivos atualmente em acompanhamento."
      >
        <div className="space-y-4">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
            />
          ))}
        </div>
      </PageCard>
    </div>
  );
}

interface ObjectiveCardProps {
  objective: Objective;
}

function ObjectiveCard({
  objective,
}: ObjectiveCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 transition hover:border-violet-200 hover:bg-violet-50/20">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Target size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                {objective.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {objective.specialty} • {objective.professional}
              </p>
            </div>

            <StatusBadge status={objective.status} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">
                Progresso
              </span>

              <span className="text-sm font-bold text-violet-600">
                {objective.progress}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={getProgressClass(
                  objective.status
                )}
                style={{
                  width: `${objective.progress}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-400">
                Início
              </span>

              <span className="mt-1 block font-medium text-slate-700">
                {objective.startDate}
              </span>
            </div>

            <div>
              <span className="block text-xs uppercase tracking-wide text-slate-400">
                Previsão
              </span>

              <span className="mt-1 block font-medium text-slate-700">
                {objective.targetDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
          >
            Detalhes
          </Button>

          <Button
            variant="secondary"
            size="sm"
            type="button"
          >
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
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
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: ObjectiveStatus;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<ObjectiveStatus, string> = {
    "Em evolução":
      "bg-amber-100 text-amber-700",

    Atingido:
      "bg-emerald-100 text-emerald-700",

    "Com regressão":
      "bg-red-100 text-red-700",
  };

  const icons: Record<
    ObjectiveStatus,
    React.ReactNode
  > = {
    "Em evolução": (
      <TrendingUp size={13} />
    ),

    Atingido: (
      <CheckCircle2 size={13} />
    ),

    "Com regressão": (
      <CircleDot size={13} />
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

function getProgressClass(
  status: ObjectiveStatus
) {
  const base =
    "h-full rounded-full transition-all duration-300";

  if (status === "Atingido") {
    return `${base} bg-emerald-500`;
  }

  if (status === "Com regressão") {
    return `${base} bg-red-500`;
  }

  return `${base} bg-violet-600`;
}