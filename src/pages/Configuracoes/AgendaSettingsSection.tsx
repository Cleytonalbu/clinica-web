import {
  CalendarDays,
  Clock3,
  Coffee,
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
  onChange: (settings: AgendaSettings) => void;
}

export default function AgendaSettingsSection({
  settings,
  onChange,
}: Props) {
  function updateField<K extends keyof AgendaSettings>(
    field: K,
    value: AgendaSettings[K]
  ) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  function updateDay(
    dayName: AgendaDaySetting["day"],
    data: Partial<AgendaDaySetting>
  ) {
    updateField(
      "days",
      settings.days.map((day) =>
        day.day === dayName
          ? { ...day, ...data }
          : day
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Horário de funcionamento"
        description="Estes horários são usados para calcular a disponibilidade real da agenda."
      >
        <div className="space-y-3">
          {settings.days.map((day) => (
            <div
              key={day.day}
              className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[170px_1fr_1fr_130px]"
            >
              <div className="flex items-center gap-3 pb-2 md:pb-0">
                <CalendarDays
                  size={18}
                  className="text-indigo-600"
                />
                <span className="font-semibold text-slate-800">
                  {day.day}
                </span>
              </div>

              <FormField label="Início">
                <Input
                  type="time"
                  value={day.startTime}
                  disabled={!day.active}
                  onChange={(event) =>
                    updateDay(day.day, {
                      startTime: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Fim">
                <Input
                  type="time"
                  value={day.endTime}
                  disabled={!day.active}
                  onChange={(event) =>
                    updateDay(day.day, {
                      endTime: event.target.value,
                    })
                  }
                />
              </FormField>

              <button
                type="button"
                onClick={() =>
                  updateDay(day.day, {
                    active: !day.active,
                  })
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  day.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {day.active ? "Aberto" : "Fechado"}
              </button>
            </div>
          ))}
        </div>
      </PageCard>

      <PageCard
        title="Duração e intervalo"
        description="Valores aplicados na criação dos horários disponíveis."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Duração padrão da sessão">
            <Select
              value={String(settings.defaultSessionDuration)}
              onChange={(event) =>
                updateField(
                  "defaultSessionDuration",
                  Number(event.target.value)
                )
              }
            >
              {[30, 40, 45, 50, 60, 90, 120].map(
                (minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutos
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField label="Intervalo entre atendimentos">
            <Select
              value={String(settings.intervalBetweenAppointments)}
              onChange={(event) =>
                updateField(
                  "intervalBetweenAppointments",
                  Number(event.target.value)
                )
              }
            >
              {[0, 5, 10, 15, 20, 30].map(
                (minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes === 0
                      ? "Sem intervalo"
                      : `${minutes} minutos`}
                  </option>
                )
              )}
            </Select>
          </FormField>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
          <Clock3 size={18} className="mt-0.5 shrink-0" />
          A duração específica da especialidade continua tendo prioridade sobre a duração padrão.
        </div>
      </PageCard>

      <PageCard
        title="Intervalo de almoço"
        description="O período configurado é removido da disponibilidade dos profissionais."
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <button
            type="button"
            onClick={() =>
              updateField(
                "hasLunchBreak",
                !settings.hasLunchBreak
              )
            }
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              settings.hasLunchBreak
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Coffee size={17} />
            {settings.hasLunchBreak
              ? "Intervalo ativo"
              : "Sem intervalo"}
          </button>

          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Início">
              <Input
                type="time"
                value={settings.lunchStartTime}
                disabled={!settings.hasLunchBreak}
                onChange={(event) =>
                  updateField(
                    "lunchStartTime",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField label="Fim">
              <Input
                type="time"
                value={settings.lunchEndTime}
                disabled={!settings.hasLunchBreak}
                onChange={(event) =>
                  updateField(
                    "lunchEndTime",
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
