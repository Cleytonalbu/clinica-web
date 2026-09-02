import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
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
  atualizarProfissional,
  buscarProfissional,
  listarEspecialidades,
  type ApiEspecialidade,
} from "@/services/referencias";

export default function EditarProfissional() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] =
    useState<ProfessionalFormData>(
      professionalFormInitialValues
    );

  const [especialidades, setEspecialidades] = useState<ApiEspecialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelado = false;

    Promise.all([buscarProfissional(id), listarEspecialidades()])
      .then(([profissional, listaEspecialidades]) => {
        if (cancelado) return;
        setEspecialidades(listaEspecialidades);
        setFormData({
          name: profissional.usuario.nome,
          birthDate: profissional.dataNascimento?.slice(0, 10) ?? "",
          cpf: profissional.cpf ?? "",
          rg: profissional.rg ?? "",
          phone: profissional.telefone ?? "",
          email: profissional.usuario.email,
          senha: "",
          specialtyId: profissional.especialidades[0]?.especialidade.id ?? "",
          councilType: profissional.conselho ?? "",
          councilNumber: profissional.registro ?? "",
          employmentType: profissional.tipoVinculo ?? "",
          admissionDate: profissional.dataAdmissao?.slice(0, 10) ?? "",
          status: profissional.status,
          observations: profissional.observacoes ?? "",
        });
      })
      .catch(() => {
        if (cancelado) return;
        setNotFound(true);
      })
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

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
    navigate(`/profissionais/${id}`);
  }

  function validar() {
    if (!formData.name.trim()) {
      return "Informe o nome completo.";
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
    if (!id) return;

    const erro = validar();
    if (erro) {
      setFeedback(erro);
      setFeedbackType("error");
      return;
    }

    setSaving(true);

    try {
      await atualizarProfissional(id, {
        nome: formData.name.trim(),
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
        "Profissional atualizado com sucesso."
      );
      setFeedbackType("success");

      setTimeout(() => {
        navigate(`/profissionais/${id}`);
      }, 800);
    } catch (error: any) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível atualizar o profissional."
      );
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Carregando profissional…
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Profissional não encontrado
          </h1>

          <Button
            type="button"
            className="mt-6"
            onClick={() => navigate("/profissionais")}
          >
            Voltar para profissionais
          </Button>
        </div>
      </DashboardLayout>
    );
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
            Voltar para o perfil
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Editar Profissional
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Atualize os dados pessoais e profissionais.
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
          isEdit
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-end">
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
              : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
