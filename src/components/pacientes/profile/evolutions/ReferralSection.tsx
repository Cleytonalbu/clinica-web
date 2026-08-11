import {
  useMemo,
} from "react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getActiveProfessionals,
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

import type {
  EvolutionFormData,
  ReferralPriority,
} from "./evolutionForm.types";

/* =========================================
   PROPS
========================================= */

interface ReferralSectionProps {
  formData:
    EvolutionFormData;

  updateField: <
    K extends keyof EvolutionFormData
  >(
    field: K,

    value:
      EvolutionFormData[K]
  ) => void;
}

/* =========================================
   COMPONENTE
========================================= */

export function ReferralSection({
  formData,
  updateField,
}: ReferralSectionProps) {
  /* =======================================
     PRIORIDADES
  ======================================= */

  const priorities:
    ReferralPriority[] = [
    "Baixa",
    "Média",
    "Alta",
    "Urgente",
  ];

  /* =======================================
     CONFIGURAÇÕES
  ======================================= */

  const specialties =
    useMemo(
      () =>
        getActiveSpecialties(),

      []
    );

  const professionals =
    useMemo(
      () =>
        getActiveProfessionals(),

      []
    );

  /* =======================================
     PROFISSIONAIS DA ESPECIALIDADE
  ======================================= */

  const availableProfessionals =
    useMemo(
      () => {
        if (
          !formData.referralSpecialty
        ) {
          return professionals;
        }

        return professionals.filter(
          (
            professional
          ) =>
            professional.specialty ===
            formData.referralSpecialty
        );
      },
      [
        professionals,
        formData.referralSpecialty,
      ]
    );

  /* =======================================
     ALTERAR ESPECIALIDADE
  ======================================= */

  function handleSpecialtyChange(
    specialty:
      string
  ) {
    updateField(
      "referralSpecialty",
      specialty
    );

    /*
     * Ao trocar a especialidade,
     * limpamos o profissional anterior
     * para impedir vínculo incorreto.
     */

    updateField(
      "referralProfessional",
      ""
    );

    /*
     * Se remover o encaminhamento,
     * também limpamos seus campos.
     */

    if (
      !specialty
    ) {
      updateField(
        "referralReason",
        ""
      );

      updateField(
        "referralObservation",
        ""
      );

      updateField(
        "notifyProfessional",
        false
      );

      updateField(
        "addProfessionalAgenda",
        false
      );

      updateField(
        "notifyManager",
        false
      );
    }
  }

  return (
    <PageCard
      title="4. Encaminhamentos / Orientações"
      description="Registre encaminhamentos realizados durante a sessão."
    >
      <div className="space-y-5">
        {/* ================================= */}
        {/* DESTINO */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FormField label="Encaminhar para">
            <Select
              value={
                formData.referralSpecialty
              }
              onChange={(
                event
              ) =>
                handleSpecialtyChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Nenhum encaminhamento
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

          <FormField label="Profissional de destino">
            <Select
              value={
                formData.referralProfessional
              }
              disabled={
                !formData.referralSpecialty
              }
              onChange={(
                event
              ) =>
                updateField(
                  "referralProfessional",
                  event.target.value
                )
              }
            >
              <option value="">
                {formData.referralSpecialty
                  ? "Selecione o profissional"
                  : "Selecione primeiro a especialidade"}
              </option>

              {availableProfessionals.map(
                (
                  professional
                ) => (
                  <option
                    key={
                      professional.id
                    }
                    value={
                      professional.name
                    }
                  >
                    {
                      professional.name
                    }{" "}
                    —{" "}
                    {
                      professional.specialty
                    }
                  </option>
                )
              )}
            </Select>

            {formData.referralSpecialty &&
              availableProfessionals.length ===
                0 && (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  Nenhum profissional ativo cadastrado nesta especialidade.
                </p>
              )}
          </FormField>
        </div>

        {/* ================================= */}
        {/* MOTIVO + PRIORIDADE */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_260px]">
          <FormField label="Motivo do encaminhamento">
            <div className="relative">
              <Input
                value={
                  formData.referralReason
                }
                disabled={
                  !formData.referralSpecialty
                }
                maxLength={300}
                onChange={(
                  event
                ) =>
                  updateField(
                    "referralReason",
                    event.target.value
                  )
                }
                placeholder="Descreva o motivo do encaminhamento..."
                className="pr-16"
              />

              <span className="absolute bottom-2 right-3 text-xs text-slate-400">
                {
                  formData.referralReason.length
                }
                /300
              </span>
            </div>
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Prioridade
            </p>

            <div className="flex min-h-11 flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-3">
              {priorities.map(
                (
                  priority
                ) => (
                  <label
                    key={
                      priority
                    }
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600"
                  >
                    <input
                      type="radio"
                      name="priority"
                      disabled={
                        !formData.referralSpecialty
                      }
                      checked={
                        formData.referralPriority ===
                        priority
                      }
                      onChange={() =>
                        updateField(
                          "referralPriority",
                          priority
                        )
                      }
                      className="accent-indigo-600"
                    />

                    {
                      priority
                    }
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* OBSERVAÇÃO */}
        {/* ================================= */}

        <FormField label="Observações ao profissional">
          <div className="relative">
            <textarea
              value={
                formData.referralObservation
              }
              disabled={
                !formData.referralSpecialty
              }
              maxLength={300}
              onChange={(
                event
              ) =>
                updateField(
                  "referralObservation",
                  event.target.value
                )
              }
              placeholder="Registre informações importantes para o profissional..."
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <span className="absolute bottom-3 right-3 text-xs text-slate-400">
              {
                formData.referralObservation.length
              }
              /300
            </span>
          </div>
        </FormField>

        {/* ================================= */}
        {/* NOTIFICAÇÕES */}
        {/* ================================= */}

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Notificações
          </p>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <CheckOption
              label="Enviar notificação interna"
              checked={
                formData.notifyProfessional
              }
              disabled={
                !formData.referralSpecialty
              }
              onChange={(
                value
              ) =>
                updateField(
                  "notifyProfessional",
                  value
                )
              }
            />

            <CheckOption
              label="Adicionar à agenda"
              checked={
                formData.addProfessionalAgenda
              }
              disabled={
                !formData.referralSpecialty
              }
              onChange={(
                value
              ) =>
                updateField(
                  "addProfessionalAgenda",
                  value
                )
              }
            />

            <CheckOption
              label="Informar gestor"
              checked={
                formData.notifyManager
              }
              disabled={
                !formData.referralSpecialty
              }
              onChange={(
                value
              ) =>
                updateField(
                  "notifyManager",
                  value
                )
              }
            />
          </div>
        </div>
      </div>
    </PageCard>
  );
}

/* =========================================
   CHECKBOX
========================================= */

interface CheckOptionProps {
  label:
    string;

  checked:
    boolean;

  disabled?:
    boolean;

  onChange: (
    value:
      boolean
  ) => void;
}

function CheckOption({
  label,
  checked,
  disabled =
    false,
  onChange,
}: CheckOptionProps) {
  return (
    <label
      className={`flex items-center gap-2 text-sm ${
        disabled
          ? "cursor-not-allowed text-slate-400"
          : "cursor-pointer text-slate-600"
      }`}
    >
      <input
        type="checkbox"
        checked={
          checked
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 accent-indigo-600"
      />

      {
        label
      }
    </label>
  );
}