import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

import {
  formatarCNS,
  formatarCPF,
  formatarRG,
} from "./masks";

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
            maxLength={14}
            {...register("cpf", {
              onChange: (event) => {
                event.target.value = formatarCPF(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="RG"
          error={errors.rg?.message}
        >
          <Input
            placeholder="RG"
            maxLength={9}
            {...register("rg", {
              onChange: (event) => {
                event.target.value = formatarRG(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="CNS"
          error={errors.cns?.message}
        >
          <Input
            placeholder="000 0000 0000 0000"
            maxLength={18}
            {...register("cns", {
              onChange: (event) => {
                event.target.value = formatarCNS(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="Data de Nascimento"
          error={errors.nascimento?.message}
        >
          <Input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
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