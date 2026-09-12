import {
  useEffect,
} from "react";

import {
  useFieldArray,
  useWatch,
} from "react-hook-form";

import type {
  UseFormReturn,
} from "react-hook-form";

import {
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import {
  PageCard,
} from "@/components/ui";

import type {
  PatientSchema,
} from "./schemas";

/* =========================================
   PROPS
========================================= */

interface ResponsibleSectionProps {
  form: UseFormReturn<PatientSchema>;
}

/* =========================================
   OPÇÕES DE PARENTESCO
========================================= */

const relationshipOptions = [
  "Mãe",
  "Pai",
  "Avó",
  "Avô",
  "Tia",
  "Tio",
  "Irmã",
  "Irmão",
  "Responsável legal",
  "Outro",
];

/* =========================================
   COMPONENTE
========================================= */

export function ResponsibleSection({
  form,
}: ResponsibleSectionProps) {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: {
      errors,
    },
  } = form;

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,

    name:
      "responsaveisVinculados",
  });

  const responsaveis =
    useWatch({
      control,

      name:
        "responsaveisVinculados",
    }) ?? [];

  /* =======================================
     MIGRAÇÃO DOS CAMPOS ANTIGOS

     Se o paciente já tiver responsável
     cadastrado pelo modelo antigo,
     transformamos esse responsável
     automaticamente no primeiro vínculo.
  ======================================= */

  useEffect(
    () => {
      if (
        fields.length >
        0
      ) {
        return;
      }

      const nome =
        getValues(
          "responsavelNome"
        );

      const cpf =
        getValues(
          "responsavelCpf"
        );

      const parentesco =
        getValues(
          "responsavelParentesco"
        );

      const telefone =
        getValues(
          "responsavelTelefone"
        );

      const email =
        getValues(
          "responsavelEmail"
        );

      /*
       * Se já houver responsável antigo,
       * reaproveitamos os dados.
       */
      if (
        nome ||
        cpf ||
        parentesco ||
        telefone ||
        email
      ) {
        append({
          responsibleId:
            null,

          nome:
            nome ?? "",

          cpf:
            cpf ?? "",

          parentesco:
            parentesco ??
            "",

          telefone:
            telefone ??
            "",

          email:
            email ?? "",

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
        });

        return;
      }

      /*
       * Paciente novo:
       * começamos com um responsável.
       */
      append({
        responsibleId:
          null,

        nome:
          "",

        cpf:
          "",

        parentesco:
          "",

        telefone:
          "",

        email:
          "",

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
      });
    },
    [
      append,
      fields.length,
      getValues,
    ]
  );

  /* =======================================
     SINCRONIZAR RESPONSÁVEL PRINCIPAL
     COM CAMPOS ANTIGOS

     Isso mantém todas as telas antigas
     funcionando normalmente.
  ======================================= */

  useEffect(
    () => {
      if (
        !responsaveis.length
      ) {
        return;
      }

      const principal =
        responsaveis.find(
          (
            responsible
          ) =>
            responsible
              ?.responsavelPrincipal
        ) ??
        responsaveis[0];

      if (
        !principal
      ) {
        return;
      }

      setValue(
        "responsavelNome",

        principal.nome ??
          "",

        {
          shouldDirty:
            true,
        }
      );

      setValue(
        "responsavelCpf",

        principal.cpf ??
          "",

        {
          shouldDirty:
            true,
        }
      );

      setValue(
        "responsavelParentesco",

        principal.parentesco ??
          "",

        {
          shouldDirty:
            true,
        }
      );

      setValue(
        "responsavelTelefone",

        principal.telefone ??
          "",

        {
          shouldDirty:
            true,
        }
      );

      setValue(
        "responsavelEmail",

        principal.email ??
          "",

        {
          shouldDirty:
            true,
        }
      );
    },
    [
      responsaveis,
      setValue,
    ]
  );

  /* =======================================
     ADICIONAR RESPONSÁVEL
  ======================================= */

  function handleAddResponsible() {
    append({
      responsibleId:
        null,

      nome:
        "",

      cpf:
        "",

      parentesco:
        "",

      telefone:
        "",

      email:
        "",

      responsavelPrincipal:
        false,

      acessoApp:
        true,

      acessoFinanceiro:
        true,

      acessoDocumentos:
        true,

      ativo:
        true,
    });
  }

  /* =======================================
     DEFINIR PRINCIPAL
  ======================================= */

  function handleSetPrimary(
    selectedIndex: number
  ) {
    const current =
      getValues(
        "responsaveisVinculados"
      ) ?? [];

    current.forEach(
      (
        _responsible,
        index
      ) => {
        setValue(
          `responsaveisVinculados.${index}.responsavelPrincipal`,

          index ===
            selectedIndex,

          {
            shouldDirty:
              true,
          }
        );
      }
    );
  }

  /* =======================================
     REMOVER
  ======================================= */

  function handleRemoveResponsible(
    index: number
  ) {
    if (
      fields.length <=
      1
    ) {
      return;
    }

    const removed =
      getValues(
        `responsaveisVinculados.${index}`
      );

    remove(index);

    /*
     * Se o removido era principal,
     * o primeiro restante vira principal.
     */
    if (
      removed
        ?.responsavelPrincipal
    ) {
      setTimeout(
        () => {
          const remaining =
            getValues(
              "responsaveisVinculados"
            ) ?? [];

          if (
            remaining.length >
            0
          ) {
            setValue(
              "responsaveisVinculados.0.responsavelPrincipal",

              true,

              {
                shouldDirty:
                  true,
              }
            );
          }
        },
        0
      );
    }
  }

  /* =======================================
     ERROS
  ======================================= */

  const linkedErrors =
    errors
      .responsaveisVinculados;

  /* =======================================
     RENDER
  ======================================= */

  return (
    <PageCard
      title="Responsáveis vinculados"
      description="Cadastre um ou mais responsáveis para este paciente."
    >
      <div className="space-y-5">

        {/* ================================= */}
        {/* AVISO */}
        {/* ================================= */}

        <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
          <Users
            size={20}
            className="mt-0.5 shrink-0 text-violet-600"
          />

          <div>
            <p className="text-sm font-semibold text-violet-800">
              Vínculo familiar
            </p>

            <p className="mt-1 text-sm leading-6 text-violet-700">
              O mesmo responsável poderá
              ser vinculado a mais de uma
              criança. Cada criança continuará
              com seus dados clínicos,
              financeiros e de agenda
              separados.
            </p>
          </div>
        </div>

        {/* ================================= */}
        {/* LISTA */}
        {/* ================================= */}

        <div className="space-y-5">
          {fields.map(
            (
              field,
              index
            ) => {
              const responsible =
                responsaveis[
                  index
                ];

              const isPrimary =
                Boolean(
                  responsible
                    ?.responsavelPrincipal
                );

              return (
                <div
                  key={
                    field.id
                  }
                  className={`rounded-2xl border p-5 transition ${
                    isPrimary
                      ? "border-violet-200 bg-violet-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* ======================= */}
                  {/* CABEÇALHO */}
                  {/* ======================= */}

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isPrimary
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <UserRound
                          size={20}
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            Responsável{" "}
                            {
                              index +
                              1
                            }
                          </p>

                          {isPrimary && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              <ShieldCheck
                                size={
                                  13
                                }
                              />

                              Principal
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Dados e permissões
                          deste responsável.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSetPrimary(
                              index
                            )
                          }
                          className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
                        >
                          Tornar principal
                        </button>
                      )}

                      {fields.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveResponsible(
                              index
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2
                            size={
                              14
                            }
                          />

                          Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ======================= */}
                  {/* DADOS */}
                  {/* ======================= */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {/* NOME */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nome completo
                      </label>

                      <input
                        type="text"
                        {...register(
                          `responsaveisVinculados.${index}.nome`
                        )}
                        placeholder="Nome do responsável"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />

                      {linkedErrors?.[
                        index
                      ]?.nome && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            linkedErrors[
                              index
                            ]?.nome
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* CPF */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        CPF
                      </label>

                      <input
                        type="text"
                        {...register(
                          `responsaveisVinculados.${index}.cpf`
                        )}
                        placeholder="000.000.000-00"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    {/* PARENTESCO */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Parentesco
                      </label>

                      <select
                        {...register(
                          `responsaveisVinculados.${index}.parentesco`
                        )}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="">
                          Selecione
                        </option>

                        {relationshipOptions.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {
                                option
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* TELEFONE */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Telefone
                      </label>

                      <input
                        type="text"
                        {...register(
                          `responsaveisVinculados.${index}.telefone`
                        )}
                        placeholder="(83) 99999-9999"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        E-mail
                      </label>

                      <input
                        type="email"
                        {...register(
                          `responsaveisVinculados.${index}.email`
                        )}
                        placeholder="responsavel@email.com"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />

                      {linkedErrors?.[
                        index
                      ]?.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            linkedErrors[
                              index
                            ]?.email
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ======================= */}
                  {/* PERMISSÕES */}
                  {/* ======================= */}

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Permissões
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Defina quais informações
                        este responsável poderá
                        acessar.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                      {/* APP */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30">
                        <input
                          type="checkbox"
                          {...register(
                            `responsaveisVinculados.${index}.acessoApp`
                          )}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Acesso ao App
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Permite visualizar
                            esta criança no
                            aplicativo.
                          </p>
                        </div>
                      </label>

                      {/* FINANCEIRO */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30">
                        <input
                          type="checkbox"
                          {...register(
                            `responsaveisVinculados.${index}.acessoFinanceiro`
                          )}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Financeiro
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Autoriza acesso às
                            informações financeiras
                            permitidas.
                          </p>
                        </div>
                      </label>

                      {/* DOCUMENTOS */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30">
                        <input
                          type="checkbox"
                          {...register(
                            `responsaveisVinculados.${index}.acessoDocumentos`
                          )}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Documentos
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Autoriza visualizar
                            documentos liberados
                            para a família.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ======================= */}
                  {/* CAMPOS INTERNOS */}
                  {/* ======================= */}

                  <input
                    type="hidden"
                    {...register(
                      `responsaveisVinculados.${index}.responsavelPrincipal`
                    )}
                  />

                  <input
                    type="hidden"
                    {...register(
                      `responsaveisVinculados.${index}.ativo`
                    )}
                  />
                </div>
              );
            }
          )}
        </div>

        {/* ================================= */}
        {/* ADICIONAR */}
        {/* ================================= */}

        <button
          type="button"
          onClick={
            handleAddResponsible
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-4 py-4 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
        >
          <Plus
            size={18}
          />

          Adicionar outro responsável
        </button>
      </div>
    </PageCard>
  );
}
