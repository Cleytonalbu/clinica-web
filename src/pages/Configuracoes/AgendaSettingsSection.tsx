import {
  CalendarDays,
  Clock3,
} from "lucide-react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import type {
  AgendaDaySetting,
  AgendaSettings,
} from "./settingsStorage";

interface Props {
  settings: AgendaSettings;

  onChange: (
    settings: AgendaSettings
  ) => void;
}

export default function AgendaSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<
    K extends keyof AgendaSettings
  >(
    field: K,
    value: AgendaSettings[K]
  ) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  function updateDay(
    index: number,
    data: Partial<AgendaDaySetting>
  ) {
    const nextDays =
      settings.days.map(
        (
          day,
          dayIndex
        ) =>
          dayIndex === index
            ? {
                ...day,
                ...data,
              }
            : day
      );

    onChange({
      ...settings,
      days: nextDays,
    });
  }

  const activeDays =
    settings.days.filter(
      (
        day
      ) =>
        day.active
    ).length;

  const activeStartTimes =
    settings.days
      .filter(
        (
          day
        ) =>
          day.active
      )
      .map(
        (
          day
        ) =>
          day.startTime
      )
      .sort();

  const activeEndTimes =
    settings.days
      .filter(
        (
          day
        ) =>
          day.active
      )
      .map(
        (
          day
        ) =>
          day.endTime
      )
      .sort();

  const openingTime =
    activeStartTimes[0] ??
    "-";

  const closingTime =
    activeEndTimes.length >
    0
      ? activeEndTimes[
          activeEndTimes.length -
            1
        ]
      : "-";

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Horário inicial"
          value={
            openingTime
          }
        />

        <SummaryCard
          title="Horário final"
          value={
            closingTime
          }
        />

        <SummaryCard
          title="Duração padrão"
          value={`${settings.defaultSessionDuration} min`}
        />

        <SummaryCard
          title="Dias ativos"
          value={String(
            activeDays
          )}
        />
      </div>

      <PageCard
        title="Horário de Funcionamento"
        description="Defina os dias e horários disponíveis para atendimento."
      >
        <div className="space-y-3">
          {settings.days.map(
            (
              day,
              index
            ) => (
              <div
                key={
                  day.day
                }
                className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[190px_130px_1fr_1fr]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      day.active
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CalendarDays
                      size={
                        18
                      }
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {
                        day.day
                      }
                    </p>

                    <p className="text-xs text-slate-400">
                      {day.active
                        ? "Funcionamento ativo"
                        : "Fechado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(
                        index,
                        {
                          active:
                            !day.active,
                        }
                      )
                    }
                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      day.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {day.active
                      ? "Ativo"
                      : "Inativo"}
                  </button>
                </div>

                <FormField label="Início">
                  <Input
                    type="time"
                    value={
                      day.startTime
                    }
                    disabled={
                      !day.active
                    }
                    onChange={(
                      event
                    ) =>
                      updateDay(
                        index,
                        {
                          startTime:
                            event.target.value,
                        }
                      )
                    }
                  />
                </FormField>

                <FormField label="Fim">
                  <Input
                    type="time"
                    value={
                      day.endTime
                    }
                    disabled={
                      !day.active
                    }
                    onChange={(
                      event
                    ) =>
                      updateDay(
                        index,
                        {
                          endTime:
                            event.target.value,
                        }
                      )
                    }
                  />
                </FormField>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Configuração das Sessões"
        description="Defina duração, intervalo e antecedência para reagendamento."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <FormField label="Duração padrão">
            <Select
              value={String(
                settings.defaultSessionDuration
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "defaultSessionDuration",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="30">
                30 minutos
              </option>

              <option value="40">
                40 minutos
              </option>

              <option value="45">
                45 minutos
              </option>

              <option value="50">
                50 minutos
              </option>

              <option value="60">
                60 minutos
              </option>

              <option value="90">
                90 minutos
              </option>
            </Select>
          </FormField>

          <FormField label="Intervalo entre atendimentos">
            <Select
              value={String(
                settings.intervalBetweenAppointments
              )}
              onChange={(
                event
              ) =>
                updateField(
                  "intervalBetweenAppointments",
                  Number(
                    event.target.value
                  )
                )
              }
            >
              <option value="0">
                Sem intervalo
              </option>

              <option value="5">
                5 minutos
              </option>

              <option value="10">
                10 minutos
              </option>

              <option value="15">
                15 minutos
              </option>

              <option value="20">
                20 minutos
              </option>

              <option value="30">
                30 minutos
              </option>
            </Select>
          </FormField>

          <FormField label="Antecedência mínima para reagendamento">
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={
                  settings.minimumRescheduleHours
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "minimumRescheduleHours",
                    Math.max(
                      Number(
                        event.target.value
                      ) ||
                        0,
                      0
                    )
                  )
                }
                className="pr-16"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                horas
              </span>
            </div>
          </FormField>
        </div>
      </PageCard>

      <PageCard
        title="Intervalo de Almoço"
        description="Defina se a clínica terá um período bloqueado para almoço."
      >
        <div className="space-y-5">
          <BooleanSetting
            title="Possui intervalo de almoço"
            description="O sistema deverá considerar este período indisponível para novos atendimentos."
            checked={
              settings.hasLunchBreak
            }
            onChange={(
              value
            ) =>
              updateField(
                "hasLunchBreak",
                value
              )
            }
          />

          {settings.hasLunchBreak && (
            <div className="grid grid-cols-1 gap-5 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
              <FormField label="Início do almoço">
                <Input
                  type="time"
                  value={
                    settings.lunchStartTime
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "lunchStartTime",
                      event.target.value
                    )
                  }
                />
              </FormField>

              <FormField label="Fim do almoço">
                <Input
                  type="time"
                  value={
                    settings.lunchEndTime
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "lunchEndTime",
                      event.target.value
                    )
                  }
                />
              </FormField>
            </div>
          )}
        </div>
      </PageCard>

      <PageCard
        title="Regras da Agenda"
        description="Defina como o sistema deve tratar conflitos e encaixes."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Permitir encaixe"
            description="Permite criar atendimentos classificados como encaixe."
            checked={
              settings.allowExtraAppointment
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowExtraAppointment",
                value
              )
            }
          />

          <BooleanSetting
            title="Permitir sobreposição"
            description="Permite mais de um atendimento no mesmo horário."
            checked={
              settings.allowOverlap
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowOverlap",
                value
              )
            }
          />

          <BooleanSetting
            title="Bloquear conflito de sala"
            description="Impede que uma mesma sala seja usada simultaneamente."
            checked={
              settings.blockRoomConflict
            }
            onChange={(
              value
            ) =>
              updateField(
                "blockRoomConflict",
                value
              )
            }
          />

          <BooleanSetting
            title="Bloquear conflito do profissional"
            description="Impede dois atendimentos simultâneos para o mesmo profissional."
            checked={
              settings.blockProfessionalConflict
            }
            onChange={(
              value
            ) =>
              updateField(
                "blockProfessionalConflict",
                value
              )
            }
          />

          <BooleanSetting
            title="Bloquear conflito do paciente"
            description="Impede que um paciente tenha dois atendimentos no mesmo horário."
            checked={
              settings.blockPatientConflict
            }
            onChange={(
              value
            ) =>
              updateField(
                "blockPatientConflict",
                value
              )
            }
          />

          <BooleanSetting
            title="Horários ocupados em vermelho"
            description="Destaca visualmente os períodos indisponíveis."
            checked={
              settings.showOccupiedTimesInRed
            }
            onChange={(
              value
            ) =>
              updateField(
                "showOccupiedTimesInRed",
                value
              )
            }
          />
        </div>
      </PageCard>

      <PageCard
        title="Confirmações e Lembretes"
        description="Configure as automações relacionadas à agenda."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BooleanSetting
            title="Lembrete 24 horas antes"
            description="Envia um lembrete ao responsável um dia antes."
            checked={
              settings.reminder24Hours
            }
            onChange={(
              value
            ) =>
              updateField(
                "reminder24Hours",
                value
              )
            }
          />

          <BooleanSetting
            title="Lembrete 2 horas antes"
            description="Envia um lembrete próximo ao horário do atendimento."
            checked={
              settings.reminder2Hours
            }
            onChange={(
              value
            ) =>
              updateField(
                "reminder2Hours",
                value
              )
            }
          />

          <BooleanSetting
            title="Solicitar confirmação"
            description="Solicita que o responsável confirme presença."
            checked={
              settings.requestConfirmation
            }
            onChange={(
              value
            ) =>
              updateField(
                "requestConfirmation",
                value
              )
            }
          />

          <BooleanSetting
            title="Cancelar se não confirmar"
            description="Permite cancelamento automático quando não houver confirmação."
            checked={
              settings.autoCancelWithoutConfirmation
            }
            onChange={(
              value
            ) =>
              updateField(
                "autoCancelWithoutConfirmation",
                value
              )
            }
          />

          <BooleanSetting
            title="Reagendamento pelo aplicativo"
            description="Permite que o responsável solicite alteração da consulta no app."
            checked={
              settings.allowResponsibleReschedule
            }
            onChange={(
              value
            ) =>
              updateField(
                "allowResponsibleReschedule",
                value
              )
            }
          />
        </div>
      </PageCard>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <Clock3
            size={21}
            className="mt-0.5 text-indigo-600"
          />

          <div>
            <p className="font-semibold text-indigo-900">
              Configuração da agenda
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-700">
              Depois de salvar, estas regras ficam disponíveis para serem utilizadas pela Agenda e pelos novos agendamentos.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function BooleanSetting({
  title,
  description,
  checked,
  onChange,
}: {
  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    (
      value: boolean
    ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={
            checked
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.checked
            )
          }
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </label>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}