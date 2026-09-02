import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  Input,
  PageCard,
} from "@/components/ui";

import type { PatientSchema } from "./schemas";

import {
  formatarCelular,
  formatarTelefoneFixo,
} from "./masks";

interface ContactSectionProps {
  form: UseFormReturn<PatientSchema>;
}

export function ContactSection({
  form,
}: ContactSectionProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <PageCard
      title="Contato"
      description="Informações para comunicação com o paciente ou responsável."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <FormField
          label="Celular"
          error={errors.celular?.message}
        >
          <Input
            type="tel"
            placeholder="(00) 00000-0000"
            maxLength={15}
            {...register("celular", {
              onChange: (event) => {
                event.target.value = formatarCelular(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="Telefone"
          error={errors.telefone?.message}
        >
          <Input
            type="tel"
            placeholder="(00) 0000-0000"
            maxLength={14}
            {...register("telefone", {
              onChange: (event) => {
                event.target.value = formatarTelefoneFixo(event.target.value);
              },
            })}
          />
        </FormField>

        <FormField
          label="E-mail"
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="paciente@email.com"
            {...register("email")}
          />
        </FormField>
      </div>
    </PageCard>
  );
}