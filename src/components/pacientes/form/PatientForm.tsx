import {
  useEffect,
} from "react";

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

import {
  getPatientResponsibles,
} from "@/pages/Pacientes/responsiblePatientStorage";

/* =========================================
   PROPS
========================================= */

interface PatientFormProps {
  onSubmit?: (
    data: PatientSchema
  ) => void;

  onCancel?: () => void;

  loading?: boolean;

  submitLabel?: string;

  /*
   * Usado principalmente na edição.
   *
   * Não interfere no cadastro novo.
   */
  initialValues?: Partial<PatientSchema>;

  /*
   * ID do paciente em edição.
   *
   * Quando informado, carregamos
   * automaticamente todos os responsáveis
   * vinculados.
   */
  patientId?: number;
}

/* =========================================
   COMPONENTE
========================================= */

export function PatientForm({
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Salvar Paciente",
  initialValues,
  patientId,
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

        /*
         * Garante que o campo exista
         * mesmo em pacientes novos.
         */
        responsaveisVinculados:
          [],

        /*
         * Na edição, os dados recebidos
         * têm prioridade.
         */
        ...initialValues,
      },

      mode:
        "onBlur",
    });

  const {
    reset,
  } =
    form;

  /* =======================================
     CARREGAR DADOS DE EDIÇÃO
  ======================================= */

  useEffect(
    () => {
      /*
       * Se não existir initialValues,
       * estamos provavelmente em um
       * cadastro novo.
       */
      if (
        !initialValues
      ) {
        return;
      }

      /*
       * Começamos preservando todos os
       * dados atuais do paciente.
       */
      let values:
        PatientSchema =
        {
          ...defaultValues,

          responsaveisVinculados:
            [],

          ...initialValues,
        } as PatientSchema;

      /* =====================================
         RESPONSÁVEIS VINCULADOS
      ===================================== */

      if (
        patientId &&
        Number.isFinite(
          patientId
        )
      ) {
        const linked =
          getPatientResponsibles(
            patientId
          );

        /*
         * Se já houver vínculos no novo
         * armazenamento, carregamos todos.
         */
        if (
          linked.length >
          0
        ) {
          values = {
            ...values,

            responsaveisVinculados:
              linked.map(
                (
                  responsible
                ) => ({
                  responsibleId:
                    responsible.id,

                  nome:
                    responsible.nome,

                  cpf:
                    responsible.cpf ??
                    "",

                  parentesco:
                    responsible
                      .link
                      .parentesco ??
                    "Responsável legal",

                  telefone:
                    responsible.telefone ??
                    "",

                  email:
                    responsible.email ??
                    "",

                  responsavelPrincipal:
                    responsible
                      .link
                      .responsavelPrincipal,

                  acessoApp:
                    responsible
                      .link
                      .acessoApp,

                  acessoFinanceiro:
                    responsible
                      .link
                      .acessoFinanceiro,

                  acessoDocumentos:
                    responsible
                      .link
                      .acessoDocumentos,

                  ativo:
                    responsible
                      .link
                      .ativo,
                })
              ),
          };
        }

        /*
         * Caso seja paciente antigo,
         * ainda sem vínculo criado,
         * ResponsibleSection fará a migração
         * automática usando:
         *
         * responsavelNome
         * responsavelCpf
         * responsavelParentesco
         * responsavelTelefone
         * responsavelEmail
         */
      }

      reset(
        values
      );
    },
    [
      initialValues,
      patientId,
      reset,
    ]
  );

  /* =======================================
     ENVIAR
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
     CANCELAR
  ======================================= */

  function handleCancel() {
    onCancel?.();
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
      {/* RESPONSÁVEIS */}
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
          <Button
            type="button"
            variant="outline"
            disabled={
              loading
            }
            onClick={
              handleCancel
            }
          >
            Cancelar
          </Button>

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