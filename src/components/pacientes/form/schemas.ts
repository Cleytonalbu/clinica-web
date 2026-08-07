import { z } from "zod";

export const patientSchema = z.object({
  nome: z
    .string()
    .min(3, "Informe o nome completo."),

  cpf: z
    .string()
    .min(11, "CPF inválido."),

  rg: z.string(),

  cns: z.string(),

  nascimento: z.string(),

  sexo: z
    .string()
    .min(1, "Selecione o sexo."),

  estadoCivil: z.string(),

  telefone: z.string(),

  celular: z.string(),

  email: z
    .string()
    .email("E-mail inválido.")
    .or(z.literal("")),

  cep: z.string(),

  rua: z.string(),

  numero: z.string(),

  bairro: z.string(),

  cidade: z.string(),

  estado: z.string(),

  complemento: z.string(),

  convenio: z.string(),

  numeroCarteirinha: z.string(),

  tipoSanguineo: z.string(),

  alergias: z.string(),

  responsavelNome: z.string(),

  responsavelCpf: z.string(),

  responsavelParentesco: z.string(),

  responsavelTelefone: z.string(),

  responsavelEmail: z
    .string()
    .email("E-mail do responsável inválido.")
    .or(z.literal("")),

  observacoes: z.string(),
});

export type PatientSchema = z.infer<typeof patientSchema>;