import {
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
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
  createPatient,
} from "./patientStorage";

/* =========================================
   COMPONENTE
========================================= */

export default function NovoPaciente() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  /* =======================================
     ORIGEM
  ======================================= */

  const returnTo =
    searchParams.get(
      "returnTo"
    );

  const cameFromAppointment =
    returnTo?.startsWith(
      "/agenda/novo"
    ) ??
    false;

  /* =======================================
     ESTADOS
  ======================================= */

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
     DESTINO DE CANCELAMENTO
  ======================================= */

  function handleCancel() {
    if (
      returnTo
    ) {
      navigate(
        returnTo
      );

      return;
    }

    navigate(
      "/pacientes"
    );
  }

  /* =======================================
     MONTAR URL DE RETORNO
  ======================================= */

  function buildReturnUrl(
    patientId:
      number
  ) {
    if (
      !returnTo
    ) {
      return `/pacientes/${patientId}`;
    }

    const separator =
      returnTo.includes(
        "?"
      )
        ? "&"
        : "?";

    return `${returnTo}${separator}patientId=${patientId}`;
  }

  /* =======================================
     SALVAR PACIENTE
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
        createPatient(
          data
        );

      setFeedback(
        cameFromAppointment
          ? "Paciente cadastrado. Retornando ao agendamento..."
          : "Paciente cadastrado com sucesso."
      );

      setFeedbackType(
        "success"
      );

      setTimeout(
        () => {
          navigate(
            buildReturnUrl(
              patient.id
            )
          );
        },
        700
      );
    } catch (
      error
    ) {
      setFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível cadastrar o paciente."
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

              {cameFromAppointment
                ? "Voltar para o agendamento"
                : "Voltar para pacientes"}
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Novo Paciente
            </h1>

            <p className="mt-2 text-slate-500">
              {cameFromAppointment
                ? "Cadastre o paciente para continuar o novo agendamento."
                : "Cadastre as informações do novo paciente."}
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
        {/* ORIGEM DO AGENDAMENTO */}
        {/* ================================= */}

        {cameFromAppointment && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
            <p className="text-sm font-semibold text-indigo-800">
              Cadastro durante um agendamento
            </p>

            <p className="mt-1 text-sm text-indigo-600">
              Depois de salvar, você retornará automaticamente ao Novo Agendamento com este paciente selecionado.
            </p>
          </div>
        )}

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
          onCancel={
            handleCancel
          }
          loading={
            loading
          }
          submitLabel={
            cameFromAppointment
              ? "Cadastrar e continuar"
              : "Salvar Paciente"
          }
        />
      </div>
    </DashboardLayout>
  );
}