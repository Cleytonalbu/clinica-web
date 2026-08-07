import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, PageCard } from "@/components/ui";

import { patientSchema } from "./schemas";
import type { PatientSchema } from "./schemas";

import { defaultValues } from "./defaultValues";

import { PersonalDataSection } from "./PersonalDataSection";
import { ContactSection } from "./ContactSection";
import { AddressSection } from "./AddressSection";
import { HealthSection } from "./HealthSection";
import { ResponsibleSection } from "./ResponsibleSection";

interface PatientFormProps {
  onSubmit?: (data: PatientSchema) => void;
  loading?: boolean;
}

export function PatientForm({
  onSubmit,
  loading = false,
}: PatientFormProps) {
  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues,
    mode: "onBlur",
  });

  function handleFormSubmit(data: PatientSchema) {
    onSubmit?.(data);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="space-y-8"
    >
      <PersonalDataSection form={form} />

      <ContactSection form={form} />

      <AddressSection form={form} />

      <HealthSection form={form} />

      <ResponsibleSection form={form} />

      <PageCard
        title="Salvar Cadastro"
        description="Confira as informações antes de salvar."
      >
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : "Salvar Paciente"}
          </Button>
        </div>
      </PageCard>
    </form>
  );
}