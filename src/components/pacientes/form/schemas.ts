import { z } from "zod";

import { contarDigitos } from "./masks";

// Campo opcional que, quando preenchido, precisa ter exatamente N dígitos —
// evita CPF/telefone/CNS incompletos ou com dígito a mais passarem batido
// (a máscara já impede digitar dígitos a mais, isso cobre o "a menos").
function digitosOpcionais(quantidade: number, mensagem: string) {
  return z
    .string()
    .refine(
      (value) => value === "" || contarDigitos(value) === quantidade,
      mensagem
    );
}

export const patientSchema = z.object({
  nome: z
    .string()
    .min(3, "Informe o nome completo."),

  cpf: z
    .string()
    .refine(
      (value) => contarDigitos(value) === 11,
      "CPF deve ter 11 dígitos."
    ),

  rg: z
    .string()
    .refine(
      (value) => value === "" || (value.length >= 5 && value.length <= 9),
      "RG deve ter entre 5 e 9 caracteres."
    ),

  cns: digitosOpcionais(15, "CNS deve ter 15 dígitos."),

  nascimento: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine(
      (value) => new Date(value) <= new Date(),
      "A data de nascimento não pode ser no futuro."
    ),

  sexo: z
    .string()
    .min(1, "Selecione o sexo."),

  estadoCivil: z.string(),

  telefone: digitosOpcionais(10, "Telefone deve ter 10 dígitos (DDD + número)."),

  celular: digitosOpcionais(11, "Celular deve ter 11 dígitos (DDD + número)."),

  email: z
    .string()
    .email("E-mail inválido.")
    .or(z.literal("")),

  cep: digitosOpcionais(8, "CEP deve ter 8 dígitos."),

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

  responsavelCpf: digitosOpcionais(11, "CPF do responsável deve ter 11 dígitos."),

  responsavelParentesco: z.string(),

  responsavelTelefone: digitosOpcionais(11, "Telefone do responsável deve ter 11 dígitos (DDD + número)."),

  responsavelEmail: z
    .string()
    .email("E-mail do responsável inválido.")
    .or(z.literal("")),

  observacoes: z.string(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
