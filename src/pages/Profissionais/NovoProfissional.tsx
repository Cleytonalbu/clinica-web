import { useState } from "react";

import {
  ArrowLeft,
  BriefcaseMedical,
  Save,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

interface ProfessionalFormData {
  name: string;
  birthDate: string;
  cpf: string;
  rg: string;

  phone: string;
  email: string;

  specialty: string;
  councilType: string;
  councilNumber: string;

  employmentType: string;
  admissionDate: string;

  status: string;

  observations: string;
}

const initialValues: ProfessionalFormData = {
  name: "",
  birthDate: "",
  cpf: "",
  rg: "",

  phone: "",
  email: "",

  specialty: "",
  councilType: "",
  councilNumber: "",

  employmentType: "",
  admissionDate: "",

  status: "Ativo",

  observations: "",
};

export default function NovoProfissional() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<ProfessionalFormData>(
      initialValues
    );

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  function updateField<
    K extends keyof ProfessionalFormData
  >(
    field: K,
    value: ProfessionalFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFeedback(null);
  }

  function handleCancel() {
    navigate("/profissionais");
  }

  async function handleSave() {
    setSaving(true);

    try {
      console.log(
        "Novo profissional:",
        formData
      );

      // Futuramente:
      // await professionalService.create(formData);

      setFeedback(
        "Profissional cadastrado com sucesso."
      );

      setTimeout(() => {
        navigate("/profissionais");
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para profissionais
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Novo Profissional
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre os dados pessoais e profissionais.
          </p>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {feedback}
          </div>
        )}

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
                <option value="Ativo">
                  Ativo
                </option>

                <option value="Inativo">
                  Inativo
                </option>

                <option value="Férias">
                  Férias
                </option>
              </Select>
            </FormField>

            <FormField label="CPF">
              <Input
                value={formData.cpf}
                onChange={(event) =>
                  updateField(
                    "cpf",
                    event.target.value
                  )
                }
                placeholder="000.000.000-00"
              />
            </FormField>

            <FormField label="RG">
              <Input
                value={formData.rg}
                onChange={(event) =>
                  updateField(
                    "rg",
                    event.target.value
                  )
                }
                placeholder="RG"
              />
            </FormField>

            <FormField label="Telefone">
              <Input
                value={formData.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="(00) 00000-0000"
              />
            </FormField>

            <FormField label="E-mail">
              <Input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="profissional@email.com"
              />
            </FormField>
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
                value={formData.specialty}
                onChange={(event) =>
                  updateField(
                    "specialty",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione
                </option>

                <option value="Psicologia">
                  Psicologia
                </option>

                <option value="Fonoaudiologia">
                  Fonoaudiologia
                </option>

                <option value="Terapia Ocupacional">
                  Terapia Ocupacional
                </option>

                <option value="Fisioterapia">
                  Fisioterapia
                </option>

                <option value="Psicopedagogia">
                  Psicopedagogia
                </option>

                <option value="Nutrição">
                  Nutrição
                </option>
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

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BriefcaseMedical size={19} />
            </div>

            <p className="text-sm">
              Após salvar, os horários poderão ser configurados no perfil do profissional.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={handleSave}
            >
              <Save size={17} />

              {saving
                ? "Salvando..."
                : "Salvar profissional"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}