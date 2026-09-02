import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BriefcaseMedical,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
} from "@/components/ui";

import {
  ProfessionalForm,
  professionalFormInitialValues,
  type ProfessionalFormData,
} from "@/components/profissionais/form/ProfessionalForm";

import {
  contarDigitos,
} from "@/components/pacientes/form/masks";

import {
  criarProfissional,
  listarEspecialidades,
  type ApiEspecialidade,
} from "@/services/referencias";

export default function NovoProfissional() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<ProfessionalFormData>(
      professionalFormInitialValues
    );

  const [especialidades, setEspecialidades] = useState<ApiEspecialidade[]>([]);

  useEffect(() => {
    listarEspecialidades().then(setEspecialidades).catch(() => {});
  }, []);

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  const [feedbackType, setFeedbackType] =
    useState<"success" | "error" | null>(null);

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
    setFeedbackType(null);
  }

  function handleCancel() {
    navigate("/profissionais");
  }

  function validar() {
    if (!formData.name.trim()) {
      return "Informe o nome completo.";
    }
    if (!formData.email.trim()) {
      return "Informe o e-mail.";
    }
    if (!formData.senha || formData.senha.length < 6) {
      return "A senha deve ter ao menos 6 caracteres.";
    }
    if (!formData.specialtyId) {
      return "Selecione a especialidade.";
    }
    if (formData.cpf && contarDigitos(formData.cpf) !== 11) {
      return "CPF deve ter 11 dígitos.";
    }
    if (formData.phone && contarDigitos(formData.phone) !== 11) {
      return "Telefone deve ter 11 dígitos (DDD + número).";
    }
    return null;
  }

  async function handleSave() {
    const erro = validar();
    if (erro) {
      setFeedback(erro);
      setFeedbackType("error");
      return;
    }

    setSaving(true);

    try {
      await criarProfissional({
        nome: formData.name.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        cpf: formData.cpf || undefined,
        rg: formData.rg || undefined,
        dataNascimento: formData.birthDate || undefined,
        telefone: formData.phone || undefined,
        status: formData.status as "ATIVO" | "INATIVO" | "FERIAS",
        conselho: formData.councilType || undefined,
        registro: formData.councilNumber || undefined,
        tipoVinculo: formData.employmentType || undefined,
        dataAdmissao: formData.admissionDate || undefined,
        observacoes: formData.observations || undefined,
        especialidadeIds: formData.specialtyId ? [formData.specialtyId] : [],
      });

      setFeedback(
        "Profissional cadastrado com sucesso."
      );
      setFeedbackType("success");

      setTimeout(() => {
        navigate("/profissionais");
      }, 800);
    } catch (error: any) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível cadastrar o profissional."
      );
      setFeedbackType("error");
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
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedbackType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback}
          </div>
        )}

        <ProfessionalForm
          formData={formData}
          updateField={updateField}
          especialidades={especialidades}
        />

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
