import {
  CalendarDays,
  Clock3,
  Stethoscope,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  ProfessionalHeader,
} from "@/components/profissionais/header/ProfessionalHeader";

import {
  ProfessionalFilters,
} from "@/components/profissionais/filters/ProfessionalFilters";

import {
  ProfessionalTable,
  type ProfessionalFilterState,
} from "@/components/profissionais/table/ProfessionalTable";

/* =========================================
   PÁGINA PROFISSIONAIS
========================================= */

export default function Profissionais() {
  const [
    filters,
    setFilters,
  ] =
    useState<ProfessionalFilterState>({
      search: "",
      specialty: "todas",
      status: "todos",
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfessionalHeader />

        <ProfessionalTable.Summary
          cards={[
            {
              title:
                "Total de profissionais",

              value:
                ProfessionalTable.data.length,

              description:
                "Vinculados à clínica",

              icon:
                Users,

              iconStyle:
                "bg-[#eeeaff] text-[#6847f5]",

              valueStyle:
                "text-[#6847f5]",
            },

            {
              title:
                "Ativos",

              value:
                ProfessionalTable.data.filter(
                  (
                    professional
                  ) =>
                    professional.status ===
                    "Ativo"
                ).length,

              description:
                "Em atendimento",

              icon:
                UserCheck,

              iconStyle:
                "bg-[#e8faf4] text-[#2daf82]",

              valueStyle:
                "text-[#269d75]",
            },

            {
              title:
                "Em férias",

              value:
                ProfessionalTable.data.filter(
                  (
                    professional
                  ) =>
                    professional.status ===
                    "Férias"
                ).length,

              description:
                "Temporariamente indisponíveis",

              icon:
                Clock3,

              iconStyle:
                "bg-[#fff4e7] text-[#ed982f]",

              valueStyle:
                "text-[#dc8a27]",
            },

            {
              title:
                "Inativos",

              value:
                ProfessionalTable.data.filter(
                  (
                    professional
                  ) =>
                    professional.status ===
                    "Inativo"
                ).length,

              description:
                "Sem agenda ativa",

              icon:
                UserX,

              iconStyle:
                "bg-[#fff0f3] text-[#eb5771]",

              valueStyle:
                "text-[#df4e67]",
            },

            {
              title:
                "Atendimentos hoje",

              value:
                ProfessionalTable.data.reduce(
                  (
                    total,
                    professional
                  ) =>
                    total +
                    professional.appointmentsToday,
                  0
                ),

              description:
                "Somando toda a equipe",

              icon:
                CalendarDays,

              iconStyle:
                "bg-[#eaf4ff] text-[#3988e8]",

              valueStyle:
                "text-[#357fd6]",
            },
          ]}
        />

        <ProfessionalFilters
          filters={
            filters
          }
          onChange={
            setFilters
          }
        />

        <ProfessionalTable
          filters={
            filters
          }
        />

        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e2ff] bg-gradient-to-r from-[#f3efff] via-[#f7f4ff] to-[#fbf9ff] px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
            <Stethoscope
              size={18}
            />
          </span>

          <p className="text-sm font-medium text-[#657196]">
            <strong className="text-[#6543ef]">
              Dica:
            </strong>{" "}
            use os filtros para localizar profissionais por nome, especialidade ou status e acesse o perfil completo pela ação de visualizar.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}