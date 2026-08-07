import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";

interface ProfessionalProfileHeaderProps {
  name: string;
  specialty: string;
  council: string;
  status?: "Ativo" | "Inativo" | "Férias";
}

export function ProfessionalProfileHeader({
  name,
  specialty,
  council,
  status = "Ativo",
}: ProfessionalProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => navigate("/profissionais")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Voltar para profissionais
      </button>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <UserRound size={38} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {name}
              </h1>

              <StatusBadge status={status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Stethoscope size={15} />
                {specialty}
              </span>

              <span>{council}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
          >
            <CalendarDays size={17} />
            Ver agenda
          </Button>

          <Button type="button">
            <Edit3 size={17} />
            Editar profissional
          </Button>
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "Ativo" | "Inativo" | "Férias";
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    Ativo:
      "bg-emerald-100 text-emerald-700",

    Inativo:
      "bg-red-100 text-red-700",

    Férias:
      "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}