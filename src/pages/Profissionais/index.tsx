import { DashboardLayout } from "@/layouts/DashboardLayout";

import { ProfessionalHeader } from "@/components/profissionais/header/ProfessionalHeader";
import { ProfessionalFilters } from "@/components/profissionais/filters/ProfessionalFilters";
import { ProfessionalTable } from "@/components/profissionais/table/ProfessionalTable";

export default function Profissionais() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ProfessionalHeader />

        <ProfessionalFilters />

        <ProfessionalTable />
      </div>
    </DashboardLayout>
  );
}