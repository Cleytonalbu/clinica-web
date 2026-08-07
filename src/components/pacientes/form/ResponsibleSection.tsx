import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

interface ResponsibleSectionProps {
  form: UseFormReturn<PatientSchema>;
}

export function ResponsibleSection({
  form,
}: ResponsibleSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageCard
      title="Responsável"
      description="Preencha os dados do responsável legal quando necessário."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <FormField
          label="Nome do Responsável"
          error={errors.responsavelNome?.message}
          className="md:col-span-2"
        >
          <Input
            placeholder="Nome completo do responsável"
            {...register("responsavelNome")}
          />
        </FormField>

        <FormField
          label="Parentesco"
          error={errors.responsavelParentesco?.message}
        >
          <Select {...register("responsavelParentesco")}>
            <option value="">Selecione</option>
            <option value="Mae">Mãe</option>
            <option value="Pai">Pai</option>
            <option value="Avo">Avô / Avó</option>
            <option value="Tio">Tio / Tia</option>
            <option value="Irmao">Irmão / Irmã</option>
            <option value="Tutor">Tutor legal</option>
            <option value="Outro">Outro</option>
          </Select>
        </FormField>

        <FormField
          label="CPF do Responsável"
          error={errors.responsavelCpf?.message}
        >
          <Input
            placeholder="000.000.000-00"
            {...register("responsavelCpf")}
          />
        </FormField>

        <FormField
          label="Telefone"
          error={errors.responsavelTelefone?.message}
        >
          <Input
            type="tel"
            placeholder="(00) 00000-0000"
            {...register("responsavelTelefone")}
          />
        </FormField>

        <FormField
          label="E-mail"
          error={errors.responsavelEmail?.message}
        >
          <Input
            type="email"
            placeholder="responsavel@email.com"
            {...register("responsavelEmail")}
          />
        </FormField>
      </div>
    </PageCard>
  );
}