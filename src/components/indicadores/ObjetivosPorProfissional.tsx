import {
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react";

import type { ApiIndicadoresGerais } from "@/services/indicadores";

/* =========================================
   UTILITÁRIOS
========================================= */

function formatDate(value?: string | null) {
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

interface ObjetivosPorProfissionalProps {
  dados: ApiIndicadoresGerais["objetivosPorProfissional"];
}

export function ObjetivosPorProfissional({
  dados,
}: ObjetivosPorProfissionalProps) {
  const rows = [...dados].sort((a, b) => {
    const aTem = a.totalObjetivos > 0;
    const bTem = b.totalObjetivos > 0;

    if (aTem !== bTem) {
      return Number(aTem) - Number(bTem) ? -1 : 1;
    }

    if (a.totalObjetivos !== b.totalObjetivos) {
      return b.totalObjetivos - a.totalObjetivos;
    }

    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const profissionaisComObjetivos = rows.filter(
    (row) => row.totalObjetivos > 0
  ).length;

  const profissionaisSemObjetivos = rows.length - profissionaisComObjetivos;

  const totalObjetivos = rows.reduce(
    (total, row) => total + row.totalObjetivos,
    0
  );

  const totalPacientes = rows.reduce(
    (total, row) => total + row.pacientesComObjetivos,
    0
  );

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
          {totalObjetivos} objetivos cadastrados
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
          value={profissionaisComObjetivos}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Sem objetivos"
          value={profissionaisSemObjetivos}
          icon={AlertCircle}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          label="Pacientes com objetivos"
          value={totalPacientes}
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
                  key={row.profissionalId}
                  className="transition hover:bg-slate-50/70"
                >
                  <TableCell>
                    <p className="font-semibold text-slate-800">
                      {row.nome}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-slate-600">
                      {row.especialidade || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-bold text-slate-800">
                      {row.pacientesComObjetivos}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-bold text-slate-800">
                      {row.totalObjetivos}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-slate-600">
                      {formatDate(row.ultimoCriadoEm)}
                    </span>
                  </TableCell>

                  <TableCell>
                    {row.totalObjetivos > 0 ? (
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

      {profissionaisSemObjetivos > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-sm leading-5 text-amber-800">
            <strong>{profissionaisSemObjetivos}</strong>{" "}
            {profissionaisSemObjetivos === 1
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
