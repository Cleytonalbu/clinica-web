import {
  formatarCPF,
  formatarCelular,
  formatarRG,
} from "@/components/pacientes/form/masks";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type { ApiEspecialidade } from "@/services/referencias";

export interface ProfessionalFormData {
  name: string;
  birthDate: string;
  cpf: string;
  rg: string;

  phone: string;
  email: string;
  senha: string;

  specialtyId: string;
  councilType: string;
  councilNumber: string;

  employmentType: string;
  admissionDate: string;

  status: string;

  observations: string;
}

export const professionalFormInitialValues: ProfessionalFormData = {
  name: "",
  birthDate: "",
  cpf: "",
  rg: "",

  phone: "",
  email: "",
  senha: "",

  specialtyId: "",
  councilType: "",
  councilNumber: "",

  employmentType: "",
  admissionDate: "",

  status: "ATIVO",

  observations: "",
};

interface ProfessionalFormProps {
  formData: ProfessionalFormData;
  updateField: <K extends keyof ProfessionalFormData>(
    field: K,
    value: ProfessionalFormData[K]
  ) => void;
  especialidades: ApiEspecialidade[];
  // Na edição não pedimos senha (troca de senha é um fluxo à parte) e o
  // e-mail some do jeito de "editar dado sensível junto" — mantemos os dois
  // por ora já que não há fluxo de troca de e-mail/senha dedicado ainda.
  isEdit?: boolean;
}

export function ProfessionalForm({
  formData,
  updateField,
  especialidades,
  isEdit = false,
}: ProfessionalFormProps) {
  return (
    <>
      <PageCard
        title="Dados Pessoais"
        description="Informações básicas do profissional."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <FormField
              label="Nome completo"
              required
            >
              <Input
                value={formData.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Nome completo"
              />
            </FormField>
          </div>

          <FormField
            label="Data de nascimento"
          >
            <Input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={formData.birthDate}
              onChange={(event) =>
                updateField(
                  "birthDate",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField label="Status">
            <Select
              value={formData.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value
                )
              }
            >
              <option value="ATIVO">
                Ativo
              </option>

              <option value="INATIVO">
                Inativo
              </option>

              <option value="FERIAS">
                Férias
              </option>
            </Select>
          </FormField>

          <FormField label="CPF">
            <Input
              value={formData.cpf}
              maxLength={14}
              onChange={(event) =>
                updateField(
                  "cpf",
                  formatarCPF(event.target.value)
                )
              }
              placeholder="000.000.000-00"
            />
          </FormField>

          <FormField label="RG">
            <Input
              value={formData.rg}
              maxLength={9}
              onChange={(event) =>
                updateField(
                  "rg",
                  formatarRG(event.target.value)
                )
              }
              placeholder="RG"
            />
          </FormField>

          <FormField label="Telefone">
            <Input
              value={formData.phone}
              maxLength={15}
              onChange={(event) =>
                updateField(
                  "phone",
                  formatarCelular(event.target.value)
                )
              }
              placeholder="(00) 00000-0000"
            />
          </FormField>

          <FormField
            label="E-mail"
            required
          >
            <Input
              type="email"
              value={formData.email}
              disabled={isEdit}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              placeholder="profissional@email.com"
            />
          </FormField>

          {!isEdit && (
            <FormField
              label="Senha de acesso"
              required
            >
              <Input
                type="password"
                value={formData.senha}
                onChange={(event) =>
                  updateField(
                    "senha",
                    event.target.value
                  )
                }
                placeholder="Mínimo 6 caracteres"
              />
            </FormField>
          )}
        </div>
      </PageCard>

      <PageCard
        title="Dados Profissionais"
        description="Especialidade, conselho e vínculo."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Especialidade"
            required
          >
            <Select
              value={formData.specialtyId}
              onChange={(event) =>
                updateField(
                  "specialtyId",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione
              </option>

              {especialidades.map((especialidade) => (
                <option
                  key={especialidade.id}
                  value={especialidade.id}
                >
                  {especialidade.nome}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Conselho">
            <Select
              value={formData.councilType}
              onChange={(event) =>
                updateField(
                  "councilType",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione
              </option>

              <option value="CRP">
                CRP
              </option>

              <option value="CREFONO">
                CREFONO
              </option>

              <option value="CREFITO">
                CREFITO
              </option>

              <option value="CRN">
                CRN
              </option>

              <option value="Outro">
                Outro
              </option>
            </Select>
          </FormField>

          <FormField label="Número do conselho">
            <Input
              value={formData.councilNumber}
              onChange={(event) =>
                updateField(
                  "councilNumber",
                  event.target.value
                )
              }
              placeholder="Número do registro"
            />
          </FormField>

          <FormField label="Tipo de vínculo">
            <Select
              value={formData.employmentType}
              onChange={(event) =>
                updateField(
                  "employmentType",
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione
              </option>

              <option value="CLT">
                CLT
              </option>

              <option value="Prestador">
                Prestador de serviço
              </option>

              <option value="PJ">
                Pessoa Jurídica
              </option>

              <option value="Autônomo">
                Autônomo
              </option>
            </Select>
          </FormField>

          <FormField label="Data de admissão">
            <Input
              type="date"
              value={formData.admissionDate}
              onChange={(event) =>
                updateField(
                  "admissionDate",
                  event.target.value
                )
              }
            />
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Observações"
        description="Informações adicionais sobre o profissional."
      >
        <textarea
          value={formData.observations}
          onChange={(event) =>
            updateField(
              "observations",
              event.target.value
            )
          }
          placeholder="Observações adicionais..."
          className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </PageCard>
    </>
  );
}
