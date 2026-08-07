import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

export default function RemarcarAgendamento() {
  const navigate = useNavigate();

  const { appointmentId } =
    useParams();

  const [date, setDate] =
    useState("2026-08-07");

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("08:50");

  const [professional, setProfessional] =
    useState("Dra. Ana Paula");

  const [room, setRoom] =
    useState("Sala 01");

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<string | null>(null);

  async function handleSave() {
    if (
      !date ||
      !startTime ||
      !professional
    ) {
      setFeedback(
        "Preencha os campos obrigatórios."
      );

      return;
    }

    setSaving(true);

    try {
      const data = {
        appointmentId,
        date,
        startTime,
        endTime,
        professional,
        room,
        reason,
      };

      console.log(
        "Reagendamento:",
        data
      );

      setFeedback(
        "Agendamento remarcado com sucesso."
      );

      setTimeout(() => {
        navigate("/agenda");
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/agenda")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Voltar para agenda
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Remarcar Atendimento
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Altere a data, horário ou profissional responsável.
          </p>
        </div>

        {feedback && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {feedback}
          </div>
        )}

        <PageCard
          title="Agendamento Atual"
          description={`Atendimento #${appointmentId}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Summary
              label="Paciente"
              value="Maria Oliveira"
            />

            <Summary
              label="Profissional"
              value="Dra. Ana Paula"
            />

            <Summary
              label="Especialidade"
              value="Psicologia"
            />
          </div>
        </PageCard>

        <PageCard
          title="Novo Horário"
          description="Defina a nova data e horário do atendimento."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FormField
              label="Data"
              required
            >
              <Input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Hora início"
              required
            >
              <Input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField label="Hora fim">
              <Input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Profissional e Sala"
          description="Altere o profissional ou local se necessário."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Profissional"
              required
            >
              <Select
                value={professional}
                onChange={(event) =>
                  setProfessional(
                    event.target.value
                  )
                }
              >
                <option value="Dra. Ana Paula">
                  Dra. Ana Paula
                </option>

                <option value="Dra. Camila Soares">
                  Dra. Camila Soares
                </option>

                <option value="Dra. Larissa Lima">
                  Dra. Larissa Lima
                </option>

                <option value="Dr. Rafael Costa">
                  Dr. Rafael Costa
                </option>
              </Select>
            </FormField>

            <FormField label="Sala">
              <Select
                value={room}
                onChange={(event) =>
                  setRoom(
                    event.target.value
                  )
                }
              >
                <option value="Sala 01">
                  Sala 01
                </option>

                <option value="Sala 02">
                  Sala 02
                </option>

                <option value="Sala 03">
                  Sala 03
                </option>

                <option value="Sala 04">
                  Sala 04
                </option>
              </Select>
            </FormField>
          </div>
        </PageCard>

        <PageCard
          title="Motivo da Remarcação"
          description="Informe o motivo para manter o histórico."
        >
          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            placeholder="Ex.: solicitação do responsável, indisponibilidade do profissional..."
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </PageCard>

        <div className="sticky bottom-0 z-20 flex flex-col gap-4 rounded-t-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays
              size={17}
              className="text-indigo-500"
            />

            A disponibilidade será validada pela API futuramente.
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate("/agenda")
              }
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
                : "Confirmar remarcação"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface SummaryProps {
  label: string;
  value: string;
}

function Summary({
  label,
  value,
}: SummaryProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}