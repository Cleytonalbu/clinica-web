import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

import {
  formatarCEP,
} from "./masks";

interface AddressSectionProps {
  form: UseFormReturn<PatientSchema>;
}

export function AddressSection({
  form,
}: AddressSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageCard
      title="Endereço"
      description="Informações de endereço do paciente."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <FormField
          label="CEP"
          error={errors.cep?.message}
        >
          <Input
            placeholder="00000-000"
            maxLength={9}
            {...register("cep", {
              onChange: (event) => {
                event.target.value = formatarCEP(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="Rua"
          error={errors.rua?.message}
          className="md:col-span-2"
        >
          <Input
            placeholder="Nome da rua"
            {...register("rua")}
          />
        </FormField>

        <FormField
          label="Número"
          error={errors.numero?.message}
        >
          <Input
            placeholder="Número"
            {...register("numero")}
          />
        </FormField>

        <FormField
          label="Bairro"
          error={errors.bairro?.message}
        >
          <Input
            placeholder="Bairro"
            {...register("bairro")}
          />
        </FormField>

        <FormField
          label="Cidade"
          error={errors.cidade?.message}
        >
          <Input
            placeholder="Cidade"
            {...register("cidade")}
          />
        </FormField>

        <FormField
          label="Estado"
          error={errors.estado?.message}
        >
          <Input
            placeholder="UF"
            maxLength={2}
            {...register("estado")}
          />
        </FormField>

        <FormField
          label="Complemento"
          error={errors.complemento?.message}
          className="lg:col-span-2"
        >
          <Input
            placeholder="Apartamento, bloco, referência..."
            {...register("complemento")}
          />
        </FormField>
      </div>
    </PageCard>
  );
}