import {
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getObjectives,
} from "@/pages/Pacientes/objectiveStorage";

/* =========================================
   UTILITÁRIOS
========================================= */

function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/* =========================================
   INDICADORES DE OBJETIVOS POR PROFISSIONAL
========================================= */

export function ObjetivosPorProfissional() {
  const {
    activeUnitId,
  } =
    useUnit();

  const professionals =
    getActiveProfessionals().filter(
      (professional) =>
        professionalWorksAtUnit(
          professional.id,
          activeUnitId
        )
    );

  const objectives =
    getObjectives().filter(
      (objective) =>
        objective.unitId ===
        activeUnitId
    );

  const rows = professionals
    .map((professional) => {
      const professionalName = normalizeName(professional.name);

      const professionalObjectives = objectives.filter(
        (objective) =>
          normalizeName(objective.professional) === professionalName
      );

      const patientIds = new Set(
        professionalObjectives.map((objective) => objective.patientId)
      );

      const lastObjective = [...professionalObjectives].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0];

      return {
        id: professional.id,
        name: professional.name,
        specialty: professional.specialty,
        patients: patientIds.size,
        objectives: professionalObjectives.length,
        lastCreatedAt: lastObjective?.createdAt,
        hasObjectives: professionalObjectives.length > 0,
      };
    })
    .sort((a, b) => {
      if (a.hasObjectives !== b.hasObjectives) {
        return Number(a.hasObjectives) - Number(b.hasObjectives);
      }

      if (a.objectives !== b.objectives) {
        return b.objectives - a.objectives;
      }

      return a.name.localeCompare(b.name, "pt-BR");
    });

  const professionalsWithObjectives = rows.filter(
    (row) => row.hasObjectives
  ).length;

  const professionalsWithoutObjectives =
    rows.length - professionalsWithObjectives;

  const totalObjectives = rows.reduce(
    (total, row) => total + row.objectives,
    0
  );

  const totalPatients = new Set(
    objectives.map((objective) => objective.patientId)
  ).size;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Criação de objetivos por profissional
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe quais profissionais estão cadastrando objetivos terapêuticos e quais ainda não possuem registros.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
          <Target size={16} />
          {totalObjectives} objetivos cadastrados
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Profissionais ativos"
          value={rows.length}
          icon={Users}
          iconClassName="bg-slate-100 text-slate-600"
        />

        <SummaryCard
          label="Criando objetivos"
          value={professionalsWithObjectives}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Sem objetivos"
          value={professionalsWithoutObjectives}
          icon={AlertCircle}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          label="Pacientes com objetivos"
          value={totalPatients}
          icon={Target}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <TableHead>Profissional</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead className="text-center">
                  Pacientes com objetivos
                </TableHead>
                <TableHead className="text-center">
                  Objetivos criados
                </TableHead>
                <TableHead>Último cadastro</TableHead>
                <TableHead>Situação</TableHead>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <TableCell>
                    <p className="font-semibold text-slate-800">
                      {row.name}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-slate-600">
                      {row.specialty || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-bold text-slate-800">
                      {row.patients}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-bold text-slate-800">
                      {row.objectives}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-slate-600">
                      {formatDate(row.lastCreatedAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    {row.hasObjectives ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                        Criando objetivos
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <AlertCircle size={14} />
                        Sem objetivos
                      </span>
                    )}
                  </TableCell>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum profissional ativo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {professionalsWithoutObjectives > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-sm leading-5 text-amber-800">
            <strong>{professionalsWithoutObjectives}</strong>{" "}
            {professionalsWithoutObjectives === 1
              ? "profissional ativo ainda não possui objetivo terapêutico cadastrado."
              : "profissionais ativos ainda não possuem objetivos terapêuticos cadastrados."}
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================
   COMPONENTES AUXILIARES
========================================= */

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number }>;
  iconClassName: string;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({
  children,
  className = "",
}: TableCellProps) {
  return (
    <td className={`px-4 py-3.5 text-sm ${className}`}>
      {children}
    </td>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

function TableHead({
  children,
  className = "",
}: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}