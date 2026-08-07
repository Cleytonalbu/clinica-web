import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
  Select,
  Textarea,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

interface HealthSectionProps {
  form: UseFormReturn<PatientSchema>;
}

export function HealthSection({
  form,
}: HealthSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageCard
      title="Convênio e Saúde"
      description="Informações do convênio e observações importantes sobre o paciente."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <FormField
          label="Convênio"
          error={errors.convenio?.message}
        >
          <Select {...register("convenio")}>
            <option value="">Selecione o convênio</option>
            <option value="Particular">Particular</option>
            <option value="Unimed">Unimed</option>
            <option value="Hapvida">Hapvida</option>
            <option value="Bradesco Saúde">
              Bradesco Saúde
            </option>
            <option value="Outro">Outro</option>
          </Select>
        </FormField>

        <FormField
          label="Número da Carteirinha"
          error={errors.numeroCarteirinha?.message}
        >
          <Input
            placeholder="Número da carteirinha"
            {...register("numeroCarteirinha")}
          />
        </FormField>

        <FormField
          label="Tipo Sanguíneo"
          error={errors.tipoSanguineo?.message}
        >
          <Select {...register("tipoSanguineo")}>
            <option value="">Selecione</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
        </FormField>

        <FormField
          label="Alergias"
          error={errors.alergias?.message}
          className="md:col-span-2 lg:col-span-3"
        >
          <Input
            placeholder="Informe alergias conhecidas, se houver"
            {...register("alergias")}
          />
        </FormField>

        <FormField
          label="Observações"
          error={errors.observacoes?.message}
          className="md:col-span-2 lg:col-span-3"
        >
          <Textarea
            placeholder="Informações adicionais importantes sobre o paciente..."
            {...register("observacoes")}
          />
        </FormField>
      </div>
    </PageCard>
  );
}