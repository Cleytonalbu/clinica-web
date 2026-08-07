import { DashboardLayout } from "@/layouts/DashboardLayout";

import { PatientHeader } from "@/components/pacientes/header/PatientHeader";
import { PatientFilters } from "@/components/pacientes/filters/PatientFilters";
import { PatientTable } from "@/components/pacientes/table/PatientTable";

export default function Pacientes() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PatientHeader />

        <PatientFilters />

        <PatientTable />
      </div>
    </DashboardLayout>
  );
}