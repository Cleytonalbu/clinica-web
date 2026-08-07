import { useState } from "react";

import {
  Clock3,
  Save,
} from "lucide-react";

import {
  Button,
  Input,
  PageCard,
} from "@/components/ui";

interface ScheduleDay {
  id: number;
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
}

const initialSchedule: ScheduleDay[] = [
  {
    id: 1,
    day: "Segunda-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 2,
    day: "Terça-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 3,
    day: "Quarta-feira",
    enabled: true,
    start: "08:00",
    end: "12:00",
    breakStart: "",
    breakEnd: "",
  },
  {
    id: 4,
    day: "Quinta-feira",
    enabled: true,
    start: "08:00",
    end: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  {
    id: 5,
    day: "Sexta-feira",
    enabled: true,
    start: "08:00",
    end: "12:00",
    breakStart: "",
    breakEnd: "",
  },
  {
    id: 6,
    day: "Sábado",
    enabled: false,
    start: "",
    end: "",
    breakStart: "",
    breakEnd: "",
  },
  {
    id: 7,
    day: "Domingo",
    enabled: false,
    start: "",
    end: "",
    breakStart: "",
    breakEnd: "",
  },
];

export function ProfessionalSchedule() {
  const [schedule, setSchedule] =
    useState<ScheduleDay[]>(initialSchedule);

  const [saved, setSaved] = useState(false);

  function updateDay(
    dayId: number,
    field: keyof Omit<
      ScheduleDay,
      "id" | "day"
    >,
    value: string | boolean
  ) {
    setSchedule((current) =>
      current.map((day) =>
        day.id === dayId
          ? {
              ...day,
              [field]: value,
            }
          : day
      )
    );

    setSaved(false);
  }

  function handleSave() {
    console.log(
      "Horários do profissional:",
      schedule
    );

    // Futuramente:
    // await professionalService.updateSchedule(schedule);

    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Horários
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure a disponibilidade semanal do profissional.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
        >
          <Save size={18} />
          Salvar horários
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Horários salvos com sucesso.
        </div>
      )}

      <PageCard
        title="Disponibilidade semanal"
        description="Defina os dias e horários em que o profissional estará disponível."
      >
        <div className="space-y-4">
          {schedule.map((day) => (
            <ScheduleRow
              key={day.id}
              day={day}
              onChange={(
                field,
                value
              ) =>
                updateDay(
                  day.id,
                  field,
                  value
                )
              }
            />
          ))}
        </div>
      </PageCard>

      <PageCard
        title="Resumo da jornada"
        description="Carga horária semanal configurada."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Dias ativos"
            value={String(
              schedule.filter(
                (day) =>
                  day.enabled
              ).length
            )}
          />

          <SummaryCard
            title="Dias indisponíveis"
            value={String(
              schedule.filter(
                (day) =>
                  !day.enabled
              ).length
            )}
          />

          <SummaryCard
            title="Carga semanal estimada"
            value={`${calculateWeeklyHours(
              schedule
            )}h`}
          />
        </div>
      </PageCard>
    </div>
  );
}

interface ScheduleRowProps {
  day: ScheduleDay;

  onChange: (
    field: keyof Omit<
      ScheduleDay,
      "id" | "day"
    >,
    value: string | boolean
  ) => void;
}

function ScheduleRow({
  day,
  onChange,
}: ScheduleRowProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        day.enabled
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex min-w-48 items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={day.enabled}
              onChange={(event) =>
                onChange(
                  "enabled",
                  event.target.checked
                )
              }
              className="peer sr-only"
            />

            <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600">
              <div
                className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  day.enabled
                    ? "ml-5.5"
                    : "ml-0.5"
                }`}
              />
            </div>
          </label>

          <div>
            <p className="font-semibold text-slate-800">
              {day.day}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {day.enabled
                ? "Disponível"
                : "Indisponível"}
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScheduleField
            label="Início"
            value={day.start}
            disabled={!day.enabled}
            onChange={(value) =>
              onChange(
                "start",
                value
              )
            }
          />

          <ScheduleField
            label="Fim"
            value={day.end}
            disabled={!day.enabled}
            onChange={(value) =>
              onChange(
                "end",
                value
              )
            }
          />

          <ScheduleField
            label="Início intervalo"
            value={day.breakStart}
            disabled={!day.enabled}
            onChange={(value) =>
              onChange(
                "breakStart",
                value
              )
            }
          />

          <ScheduleField
            label="Fim intervalo"
            value={day.breakEnd}
            disabled={!day.enabled}
            onChange={(value) =>
              onChange(
                "breakEnd",
                value
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

interface ScheduleFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string
  ) => void;
}

function ScheduleField({
  label,
  value,
  disabled,
  onChange,
}: ScheduleFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-500">
        {label}
      </label>

      <div className="relative">
        <Clock3
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <Input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="pl-9"
        />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
}

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function calculateWeeklyHours(
  schedule: ScheduleDay[]
) {
  const totalMinutes =
    schedule.reduce(
      (
        total,
        day
      ) => {
        if (
          !day.enabled ||
          !day.start ||
          !day.end
        ) {
          return total;
        }

        const start =
          timeToMinutes(
            day.start
          );

        const end =
          timeToMinutes(
            day.end
          );

        let minutes =
          end - start;

        if (
          day.breakStart &&
          day.breakEnd
        ) {
          minutes -=
            timeToMinutes(
              day.breakEnd
            ) -
            timeToMinutes(
              day.breakStart
            );
        }

        return (
          total +
          Math.max(
            minutes,
            0
          )
        );
      },
      0
    );

  return (
    totalMinutes / 60
  ).toFixed(1);
}

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
}