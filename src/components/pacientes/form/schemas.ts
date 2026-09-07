import { z } from "zod";

/* =========================================
   RESPONSÁVEL VINCULADO
========================================= */

export const linkedResponsibleSchema = z.object({
  responsibleId: z
    .number()
    .nullable()
    .optional(),

  nome: z.string(),

  cpf: z.string(),

  parentesco: z.string(),

  telefone: z.string(),

  email: z
    .string()
    .email("E-mail do responsável inválido.")
    .or(z.literal("")),

  responsavelPrincipal: z.boolean(),

  acessoApp: z.boolean(),

  acessoFinanceiro: z.boolean(),

  acessoDocumentos: z.boolean(),

  ativo: z.boolean(),
});

export type LinkedResponsibleSchema =
  z.infer<
    typeof linkedResponsibleSchema
  >;

/* =========================================
   PACIENTE
========================================= */

export const patientSchema =
  z.object({
    nome: z
      .string()
      .min(
        3,
        "Informe o nome completo."
      ),

    cpf: z
      .string()
      .min(
        11,
        "CPF inválido."
      ),

    rg: z.string(),

    cns: z.string(),

    nascimento: z.string(),

    sexo: z
      .string()
      .min(
        1,
        "Selecione o sexo."
      ),

    estadoCivil: z.string(),

    telefone: z.string(),

    celular: z.string(),

    email: z
      .string()
      .email(
        "E-mail inválido."
      )
      .or(
        z.literal("")
      ),

    cep: z.string(),

    rua: z.string(),

    numero: z.string(),

    bairro: z.string(),

    cidade: z.string(),

    estado: z.string(),

    complemento: z.string(),

    convenio: z.string(),

    numeroCarteirinha:
      z.string(),

    tipoSanguineo: z.string(),

    alergias: z.string(),

    /*
     * CAMPOS ANTIGOS
     *
     * NÃO REMOVER.
     *
     * Continuam sendo preenchidos com
     * os dados do responsável principal
     * para não quebrar as telas atuais.
     */
    responsavelNome: z.string(),

    responsavelCpf: z.string(),

    responsavelParentesco:
      z.string(),

    responsavelTelefone:
      z.string(),

    responsavelEmail: z
      .string()
      .email(
        "E-mail do responsável inválido."
      )
      .or(
        z.literal("")
      ),

    /*
     * NOVA ESTRUTURA
     *
     * Permite mais de um responsável
     * para o mesmo paciente.
     */
    responsaveisVinculados:
      z
        .array(
          linkedResponsibleSchema
        )
        .default([]),

    observacoes: z.string(),
  });

export type PatientSchema =
  z.infer<
    typeof patientSchema
  >;