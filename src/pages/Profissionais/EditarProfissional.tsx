import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BriefcaseMedical,
  Building2,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getActiveSpecialties,
  getSystemSettings,
  saveSystemSettings,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getActiveClinicUnits,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  getProfessionalUnitIds,
  setProfessionalUnits,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  getProfessionalDetailsById,
  saveProfessionalDetails,
} from "./professionalDetailsStorage";

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

  status:
    | "Ativo"
    | "Inativo"
    | "Férias";

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

export default function EditarProfissional() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const professionalId =
    Number(
      id
    );

  const specialties =
    useMemo(
      () =>
        getActiveSpecialties(),
      []
    );

  const units =
    useMemo(
      () =>
        getActiveClinicUnits(),
      []
    );

  const [
    formData,
    setFormData,
  ] =
    useState<ProfessionalFormData>(
      initialValues
    );

  const [
    selectedUnitIds,
    setSelectedUnitIds,
  ] =
    useState<number[]>(
      []
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      "success" |
      "error" |
      null
    >(
      null
    );

  useEffect(
    () => {
      if (
        !Number.isFinite(
          professionalId
        )
      ) {
        setFeedback(
          "Profissional não encontrado."
        );

        setFeedbackType(
          "error"
        );

        return;
      }

      const professional =
        getSystemSettings()
          .professionals
          .find(
            (
              item
            ) =>
              item.id ===
              professionalId
          );

      if (
        !professional
      ) {
        setFeedback(
          "Profissional não encontrado."
        );

        setFeedbackType(
          "error"
        );

        return;
      }

      const details =
        getProfessionalDetailsById(
          professionalId
        );

      const registration =
        professional.registration ??
        "";

      const firstSpace =
        registration.indexOf(
          " "
        );

      setFormData(
        {
          ...initialValues,

          name:
            professional.name,

          birthDate:
            details?.birthDate ??
            "",

          cpf:
            details?.cpf ??
            "",

          rg:
            details?.rg ??
            "",

          phone:
            details?.phone ??
            "",

          email:
            details?.email ??
            "",

          specialty:
            professional.specialty,

          councilType:
            details?.councilType ??
            (
              firstSpace >
              0
                ? registration.slice(
                    0,
                    firstSpace
                  )
                : ""
            ),

          councilNumber:
            details?.councilNumber ??
            (
              firstSpace >
              0
                ? registration.slice(
                    firstSpace +
                      1
                  )
                : registration
            ),

          employmentType:
            details?.employmentType ??
            "",

          admissionDate:
            details?.admissionDate ??
            "",

          status:
            details?.status ??
            (
              professional.active
                ? "Ativo"
                : "Inativo"
            ),

          observations:
            details?.observations ??
            "",
        }
      );

      setSelectedUnitIds(
        getProfessionalUnitIds(
          professionalId
        )
      );
    },
    [
      professionalId,
    ]
  );

  function updateField<
    K extends keyof ProfessionalFormData
  >(
    field: K,
    value:
      ProfessionalFormData[K]
  ) {
    setFormData(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );

    setFeedback(
      null
    );

    setFeedbackType(
      null
    );
  }

  function toggleUnit(
    unitId: number
  ) {
    setSelectedUnitIds(
      (
        current
      ) =>
        current.includes(
          unitId
        )
          ? current.filter(
              (
                id
              ) =>
                id !==
                unitId
            )
          : [
              ...current,
              unitId,
            ]
    );

    setFeedback(
      null
    );

    setFeedbackType(
      null
    );
  }

  function showError(
    message: string
  ) {
    setFeedback(
      message
    );

    setFeedbackType(
      "error"
    );
  }

  function handleCancel() {
    navigate(
      `/profissionais/${professionalId}`
    );
  }

  async function handleSave() {
    const name =
      formData.name.trim();

    if (
      !name
    ) {
      showError(
        "Informe o nome do profissional."
      );

      return;
    }

    if (
      !formData.specialty
    ) {
      showError(
        "Selecione a especialidade."
      );

      return;
    }

    if (
      selectedUnitIds.length ===
      0
    ) {
      showError(
        "Selecione pelo menos uma unidade para o profissional."
      );

      return;
    }

    setSaving(
      true
    );

    try {
      const settings =
        getSystemSettings();

      const professionalIndex =
        settings.professionals.findIndex(
          (
            professional
          ) =>
            professional.id ===
            professionalId
        );

      if (
        professionalIndex <
        0
      ) {
        showError(
          "Profissional não encontrado."
        );

        return;
      }

      const currentProfessional =
        settings.professionals[
          professionalIndex
        ];

      const registration =
        [
          formData.councilType.trim(),
          formData.councilNumber.trim(),
        ]
          .filter(
            Boolean
          )
          .join(
            " "
          );

      const nextSettings = {
        ...settings,

        professionals:
          settings.professionals.map(
            (
              professional
            ) =>
              professional.id ===
              professionalId
                ? {
                    ...currentProfessional,

                    name,

                    specialty:
                      formData.specialty,

                    registration,

                    active:
                      formData.status !==
                      "Inativo",
                  }
                : professional
          ),
      };

      saveSystemSettings(
        nextSettings
      );

      setProfessionalUnits(
        professionalId,
        selectedUnitIds
      );

      const existingDetails =
        getProfessionalDetailsById(
          professionalId
        );

      const now =
        new Date()
          .toISOString();

      saveProfessionalDetails({
        professionalId,

        birthDate:
          formData.birthDate,

        cpf:
          formData.cpf.trim(),

        rg:
          formData.rg.trim(),

        phone:
          formData.phone.trim(),

        email:
          formData.email.trim(),

        councilType:
          formData.councilType,

        councilNumber:
          formData.councilNumber.trim(),

        employmentType:
          formData.employmentType,

        admissionDate:
          formData.admissionDate,

        status:
          formData.status,

        observations:
          formData.observations.trim(),

        createdAt:
          existingDetails?.createdAt ??
          now,

        updatedAt:
          now,
      });

      setFeedback(
        "Profissional atualizado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            `/profissionais/${professionalId}`
          );
        },
        500
      );
    } catch (
      error
    ) {
      showError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível atualizar o profissional."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={
              handleCancel
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft
              size={
                17
              }
            />

            Voltar para profissional
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Editar Profissional
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Atualize os dados do profissional e as unidades onde ele poderá atender.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType ===
              "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {
              feedback
            }
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
                  value={
                    formData.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Nome completo"
                />
              </FormField>
            </div>

            <FormField label="Data de nascimento">
              <Input
                type="date"
                value={
                  formData.birthDate
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "birthDate",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={
                  formData.status
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "status",
                    event.target.value as
                      ProfessionalFormData["status"]
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
                value={
                  formData.cpf
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.rg
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.phone
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.email
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.specialty
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "specialty",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Selecione
                </option>

                {specialties.map(
                  (
                    specialty
                  ) => (
                    <option
                      key={
                        specialty.id
                      }
                      value={
                        specialty.name
                      }
                    >
                      {
                        specialty.name
                      }
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="Conselho">
              <Select
                value={
                  formData.councilType
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.councilNumber
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.employmentType
                }
                onChange={(
                  event
                ) =>
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
                value={
                  formData.admissionDate
                }
                onChange={(
                  event
                ) =>
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
          title="Unidades de Atendimento"
          description="Selecione todas as unidades onde este profissional poderá atender."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {units.map(
              (
                unit
              ) => {
                const selected =
                  selectedUnitIds.includes(
                    unit.id
                  );

                return (
                  <button
                    key={
                      unit.id
                    }
                    type="button"
                    onClick={
                      () =>
                        toggleUnit(
                          unit.id
                        )
                    }
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Building2
                        size={
                          18
                        }
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {
                          unit.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          unit.isMain
                            ? "Unidade Principal"
                            : unit.code
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {selectedUnitIds.length ===
            0 && (
            <p className="mt-3 text-xs font-semibold text-red-600">
              Selecione pelo menos uma unidade.
            </p>
          )}
        </PageCard>

        <PageCard
          title="Observações"
          description="Informações adicionais sobre o profissional."
        >
          <textarea
            value={
              formData.observations
            }
            onChange={(
              event
            ) =>
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
              <BriefcaseMedical
                size={
                  19
                }
              />
            </div>

            <p className="text-sm">
              O profissional ficará disponível apenas nas unidades selecionadas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={
                saving
              }
              onClick={
                handleCancel
              }
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={
                saving ||
                selectedUnitIds.length ===
                  0
              }
              onClick={
                handleSave
              }
            >
              <Save
                size={
                  17
                }
              />

              {saving
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
