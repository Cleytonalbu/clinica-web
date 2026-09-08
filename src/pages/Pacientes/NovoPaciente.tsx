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
  useUnit,
} from "@/providers/UnitContext";

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

import {
  setNewPatientUnit,
} from "./patientUnitStorage";

import {
  findResponsible,
  linkResponsibleToPatient,
  saveResponsible,
} from "./responsiblePatientStorage";

/* =========================================
   COMPONENTE
========================================= */

export default function NovoPaciente() {
  const navigate =
    useNavigate();

  const {
    activeUnitId,
  } = useUnit();

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
     CANCELAR
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
     URL DE RETORNO
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
     SALVAR RESPONSÁVEIS
  ======================================= */

  function savePatientResponsibles(
    patientId: number,
    data: PatientSchema
  ) {
    const responsibles =
      data
        .responsaveisVinculados ??
      [];

    /*
     * Caso o formulário ainda venha
     * apenas com o responsável antigo,
     * continuamos criando o vínculo.
     */
    const normalizedResponsibles =
      responsibles.length >
      0
        ? responsibles
        : data.responsavelNome
          ? [
              {
                responsibleId:
                  null,

                nome:
                  data.responsavelNome,

                cpf:
                  data.responsavelCpf,

                parentesco:
                  data.responsavelParentesco,

                telefone:
                  data.responsavelTelefone,

                email:
                  data.responsavelEmail,

                responsavelPrincipal:
                  true,

                acessoApp:
                  true,

                acessoFinanceiro:
                  true,

                acessoDocumentos:
                  true,

                ativo:
                  true,
              },
            ]
          : [];

    normalizedResponsibles.forEach(
      (
        responsibleData,
        index
      ) => {
        if (
          !responsibleData.nome
            ?.trim()
        ) {
          return;
        }

        /*
         * Primeiro procuramos se esse
         * responsável já existe.
         *
         * Isso é o que permite:
         *
         * Juliana
         * ├── Maria
         * └── Pedro
         *
         * sem criar duas Julianas.
         */
        const existing =
          responsibleData
            .responsibleId
            ? null
            : findResponsible({
                cpf:
                  responsibleData.cpf,

                email:
                  responsibleData.email,

                nome:
                  responsibleData.nome,
              });

        /*
         * Se já veio com ID,
         * salvamos/atualizamos esse registro.
         *
         * Se foi encontrado pelo CPF,
         * e-mail ou nome, reutilizamos.
         */
        const responsible =
          saveResponsible({
            id:
              responsibleData
                .responsibleId ??
              existing?.id,

            nome:
              responsibleData.nome,

            cpf:
              responsibleData.cpf ??
              "",

            telefone:
              responsibleData.telefone ??
              "",

            email:
              responsibleData.email ??
              "",

            ativo:
              responsibleData.ativo ??
              true,
          });

        /*
         * Cria a relação
         * RESPONSÁVEL ↔ PACIENTE.
         */
        linkResponsibleToPatient({
          responsibleId:
            responsible.id,

          patientId,

          parentesco:
            (
              responsibleData.parentesco ||
              "Responsável legal"
            ) as
              | "Mãe"
              | "Pai"
              | "Avó"
              | "Avô"
              | "Tia"
              | "Tio"
              | "Irmã"
              | "Irmão"
              | "Responsável legal"
              | "Outro",

          /*
           * Se por algum motivo nenhum
           * estiver marcado como principal,
           * o primeiro se torna principal.
           */
          responsavelPrincipal:
            responsibleData
              .responsavelPrincipal ||
            (
              index ===
                0 &&
              !normalizedResponsibles.some(
                (
                  item
                ) =>
                  item
                    .responsavelPrincipal
              )
            ),

          acessoApp:
            responsibleData
              .acessoApp ??
            true,

          acessoFinanceiro:
            responsibleData
              .acessoFinanceiro ??
            true,

          acessoDocumentos:
            responsibleData
              .acessoDocumentos ??
            true,

          ativo:
            responsibleData.ativo ??
            true,
        });
      }
    );
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
      /*
       * 1. Mantemos exatamente o cadastro
       *    atual do paciente.
       */
      const patient =
        createPatient(
          data
        );

      /*
       * 2. Mantemos o vínculo Multi Unidades:
       *    o novo paciente pertence à unidade
       *    que está ativa no momento do cadastro.
       */
      if (
        activeUnitId &&
        Number.isFinite(
          activeUnitId
        )
      ) {
        setNewPatientUnit(
          patient.id,
          activeUnitId
        );
      }

      /*
       * 3. Depois criamos os vínculos
       *    dos responsáveis.
       */
      savePatientResponsibles(
        patient.id,
        data
      );

      setFeedback(
        cameFromAppointment
          ? "Paciente cadastrado. Retornando ao agendamento..."
          : "Paciente e responsáveis cadastrados com sucesso."
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
          loading={
            loading
          }
        />
      </div>
    </DashboardLayout>
  );
}