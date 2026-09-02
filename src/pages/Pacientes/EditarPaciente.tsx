import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
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
} from "@/components/ui";

import {
  PatientForm,
} from "@/components/pacientes/form";

import type {
  PatientSchema,
} from "@/components/pacientes/form";

import {
  atualizarPaciente,
  buscarPaciente,
  paraStoredPatient,
  type RealPatient,
} from "@/services/pacientes";

/* =========================================
   COMPONENTE
========================================= */

export default function EditarPaciente() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const [
    patient,
    setPatient,
  ] =
    useState<RealPatient | null>(
      null
    );

  const [
    fetching,
    setFetching,
  ] =
    useState(
      true
    );

  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }

    let cancelado = false;

    buscarPaciente(id)
      .then((dados) => {
        if (cancelado) return;
        setPatient(paraStoredPatient(dados));
      })
      .catch(() => {
        if (cancelado) return;
        setPatient(null);
      })
      .finally(() => {
        if (cancelado) return;
        setFetching(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const [
    loading,
    setLoading,
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
      | "success"
      | "error"
      | null
    >(
      null
    );

  /* =======================================
     CARREGANDO
  ======================================= */

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Carregando paciente…
        </div>
      </DashboardLayout>
    );
  }

  /* =======================================
     PACIENTE NÃO ENCONTRADO
  ======================================= */

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Paciente não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O paciente pode ter sido removido ou o cadastro não existe.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              navigate(
                "/pacientes"
              )
            }
          >
            Voltar para pacientes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================================
     SALVAR ALTERAÇÕES
  ======================================= */

  async function handleSubmit(
    data:
      PatientSchema
  ) {
    setLoading(
      true
    );

    setFeedback(
      null
    );

    setFeedbackType(
      null
    );

    try {
      await atualizarPaciente(
        patient!.id,
        data
      );

      setFeedback(
        "Paciente atualizado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            `/pacientes/${patient!.id}`
          );
        },
        700
      );
    } catch (
      error: any
    ) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível atualizar o paciente."
      );

      setFeedbackType(
        "error"
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =======================================
     CANCELAR
  ======================================= */

  function handleCancel() {
    navigate(
      `/pacientes/${patient!.id}`
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ================================= */}
        {/* CABEÇALHO */}
        {/* ================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={
                handleCancel
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ArrowLeft
                size={17}
              />

              Voltar para o paciente
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Editar Paciente
            </h1>

            <p className="mt-2 text-slate-500">
              Atualize as informações cadastrais de{" "}
              <strong className="font-semibold text-slate-700">
                {patient.nome}
              </strong>
              .
            </p>
          </div>

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
        </div>

        {/* ================================= */}
        {/* FEEDBACK */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* FORMULÁRIO */}
        {/* ================================= */}

        <PatientForm
          initialValues={
            patient
          }
          onSubmit={
            handleSubmit
          }
          onCancel={
            handleCancel
          }
          loading={
            loading
          }
          submitLabel="Salvar alterações"
        />
      </div>
    </DashboardLayout>
  );
}