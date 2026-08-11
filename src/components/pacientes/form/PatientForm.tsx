import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Button,
  PageCard,
} from "@/components/ui";

import {
  patientSchema,
} from "./schemas";

import type {
  PatientSchema,
} from "./schemas";

import {
  defaultValues,
} from "./defaultValues";

import {
  PersonalDataSection,
} from "./PersonalDataSection";

import {
  ContactSection,
} from "./ContactSection";

import {
  AddressSection,
} from "./AddressSection";

import {
  HealthSection,
} from "./HealthSection";

import {
  ResponsibleSection,
} from "./ResponsibleSection";

/* =========================================
   PROPS
========================================= */

interface PatientFormProps {
  onSubmit?:
    (
      data:
        PatientSchema
    ) => void;

  onCancel?:
    () => void;

  initialValues?:
    Partial<PatientSchema>;

  loading?:
    boolean;

  submitLabel?:
    string;
}

/* =========================================
   COMPONENTE
========================================= */

export function PatientForm({
  onSubmit,

  onCancel,

  initialValues,

  loading =
    false,

  submitLabel =
    "Salvar Paciente",
}: PatientFormProps) {
  /* =======================================
     FORMULÁRIO
  ======================================= */

  const form =
    useForm<PatientSchema>({
      resolver:
        zodResolver(
          patientSchema
        ),

      defaultValues: {
        ...defaultValues,

        ...initialValues,
      },

      mode:
        "onBlur",
    });

  /* =======================================
     SUBMIT
  ======================================= */

  function handleFormSubmit(
    data:
      PatientSchema
  ) {
    onSubmit?.(
      data
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <form
      onSubmit={
        form.handleSubmit(
          handleFormSubmit
        )
      }
      className="space-y-8"
    >
      {/* ================================= */}
      {/* DADOS PESSOAIS */}
      {/* ================================= */}

      <PersonalDataSection
        form={
          form
        }
      />

      {/* ================================= */}
      {/* CONTATO */}
      {/* ================================= */}

      <ContactSection
        form={
          form
        }
      />

      {/* ================================= */}
      {/* ENDEREÇO */}
      {/* ================================= */}

      <AddressSection
        form={
          form
        }
      />

      {/* ================================= */}
      {/* SAÚDE */}
      {/* ================================= */}

      <HealthSection
        form={
          form
        }
      />

      {/* ================================= */}
      {/* RESPONSÁVEL */}
      {/* ================================= */}

      <ResponsibleSection
        form={
          form
        }
      />

      {/* ================================= */}
      {/* SALVAR */}
      {/* ================================= */}

      <PageCard
        title="Salvar Cadastro"
        description="Confira as informações antes de salvar."
      >
        <div className="flex justify-end gap-3">
          {/* ============================= */}
          {/* CANCELAR */}
          {/* ============================= */}

          <Button
            type="button"
            variant="outline"
            disabled={
              loading
            }
            onClick={
              onCancel
            }
          >
            Cancelar
          </Button>

          {/* ============================= */}
          {/* SALVAR */}
          {/* ============================= */}

          <Button
            type="submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Salvando..."
              : submitLabel}
          </Button>
        </div>
      </PageCard>
    </form>
  );
}