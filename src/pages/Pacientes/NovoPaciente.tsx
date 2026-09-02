import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
} from "lucide-react";

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
  criarPaciente,
} from "@/services/pacientes";

/* =========================================
   COMPONENTE
========================================= */

export default function NovoPaciente() {
  const navigate =
    useNavigate();

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
     SALVAR
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
      const patient =
        await criarPaciente(
          data
        );

      setFeedback(
        "Paciente cadastrado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            `/pacientes/${patient.id}`
          );
        },

        700
      );
    } catch (
      error: any
    ) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível cadastrar o paciente."
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
              onClick={() =>
                navigate(
                  "/pacientes"
                )
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ArrowLeft
                size={17}
              />

              Voltar para pacientes
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Novo Paciente
            </h1>

            <p className="mt-2 text-slate-500">
              Cadastre as informações do novo paciente.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={
              loading
            }
            onClick={() =>
              navigate(
                "/pacientes"
              )
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
          onSubmit={
            handleSubmit
          }
          loading={
            loading
          }
        />
      </div>
    </DashboardLayout>
  );
}