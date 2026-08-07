import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

interface PersonalDataSectionProps {
  form: UseFormReturn<PatientSchema>;
}

export function PersonalDataSection({
  form,
}: PersonalDataSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageCard
      title="Dados Pessoais"
      description="Informações básicas do paciente."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <FormField
          label="Nome Completo"
          required
          error={errors.nome?.message}
        >
          <Input
            placeholder="Nome completo"
            {...register("nome")}
          />
        </FormField>

        <FormField
          label="CPF"
          required
          error={errors.cpf?.message}
        >
          <Input
            placeholder="000.000.000-00"
            {...register("cpf")}
          />
        </FormField>

        <FormField
          label="RG"
          error={errors.rg?.message}
        >
          <Input
            placeholder="RG"
            {...register("rg")}
          />
        </FormField>

        <FormField
          label="CNS"
          error={errors.cns?.message}
        >
          <Input
            placeholder="Cartão Nacional de Saúde"
            {...register("cns")}
          />
        </FormField>

        <FormField
          label="Data de Nascimento"
          error={errors.nascimento?.message}
        >
          <Input
            type="date"
            {...register("nascimento")}
          />
        </FormField>

        <FormField
          label="Sexo"
          required
          error={errors.sexo?.message}
        >
          <Select {...register("sexo")}>
            <option value="">
              Selecione
            </option>

            <option value="M">
              Masculino
            </option>

            <option value="F">
              Feminino
            </option>

            <option value="O">
              Outro
            </option>
          </Select>
        </FormField>

        <FormField
          label="Estado Civil"
          error={errors.estadoCivil?.message}
          className="lg:col-span-2"
        >
          <Input
            placeholder="Estado civil"
            {...register("estadoCivil")}
          />
        </FormField>
      </div>
    </PageCard>
  );
}