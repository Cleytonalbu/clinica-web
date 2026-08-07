import { useState } from "react";

import {
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

const MAX_REASON = 300;
const MAX_OBSERVATION = 300;

type Priority =
  | "Baixa"
  | "Média"
  | "Alta"
  | "Urgente";

export function ReferralSection() {
  const [reason, setReason] = useState("");
  const [observation, setObservation] =
    useState("");

  const [priority, setPriority] =
    useState<Priority>("Alta");

  const [internalNotification, setInternalNotification] =
    useState(true);

  const [addToAgenda, setAddToAgenda] =
    useState(true);

  const [notifyManager, setNotifyManager] =
    useState(false);

  return (
    <PageCard
      title="4. Encaminhamentos / Orientações"
      description="Registre encaminhamentos realizados durante a sessão."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FormField label="Encaminhar para">
            <Select defaultValue="Fonoaudiologia">
              <option value="">
                Nenhum encaminhamento
              </option>

              <option value="Fonoaudiologia">
                Fonoaudiologia
              </option>

              <option value="Psicologia">
                Psicologia
              </option>

              <option value="Terapia Ocupacional">
                Terapia Ocupacional
              </option>

              <option value="Fisioterapia">
                Fisioterapia
              </option>

              <option value="Psicopedagogia">
                Psicopedagogia
              </option>

              <option value="Nutrição">
                Nutrição
              </option>
            </Select>
          </FormField>

          <FormField label="Profissional de destino">
            <Select defaultValue="Dra. Camila Soares">
              <option value="">
                Selecione o profissional
              </option>

              <option value="Dra. Camila Soares">
                Dra. Camila Soares — Fonoaudióloga
              </option>

              <option value="Dra. Ana Paula">
                Dra. Ana Paula — Psicóloga
              </option>

              <option value="Dra. Larissa Lima">
                Dra. Larissa Lima — Terapeuta Ocupacional
              </option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_260px]">
          <FormField
            label="Motivo do encaminhamento"
            required
          >
            <div className="relative">
              <Input
                value={reason}
                maxLength={MAX_REASON}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Descreva o motivo do encaminhamento..."
                className="pr-16"
              />

              <span className="absolute bottom-2 right-3 text-[11px] text-slate-400">
                {reason.length}/{MAX_REASON}
              </span>
            </div>
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Prioridade
            </p>

            <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 px-3">
              {(
                [
                  "Baixa",
                  "Média",
                  "Alta",
                  "Urgente",
                ] as Priority[]
              ).map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600"
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === item}
                    onChange={() =>
                      setPriority(item)
                    }
                    className="accent-indigo-600"
                  />

                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>

        <FormField label="Observações ao profissional">
          <div className="relative">
            <textarea
              value={observation}
              maxLength={MAX_OBSERVATION}
              onChange={(event) =>
                setObservation(
                  event.target.value
                )
              }
              placeholder="Registre informações importantes para o profissional que receberá o encaminhamento..."
              className="min-h-[90px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <span className="absolute bottom-3 right-3 text-[11px] text-slate-400">
              {observation.length}/
              {MAX_OBSERVATION}
            </span>
          </div>
        </FormField>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Notificar profissional
          </p>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <CheckOption
              label="Enviar notificação interna"
              checked={internalNotification}
              onChange={setInternalNotification}
            />

            <CheckOption
              label="Adicionar à agenda do profissional"
              checked={addToAgenda}
              onChange={setAddToAgenda}
            />

            <CheckOption
              label="Informar gestor da clínica"
              checked={notifyManager}
              onChange={setNotifyManager}
            />
          </div>
        </div>
      </div>
    </PageCard>
  );
}

interface CheckOptionProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function CheckOption({
  label,
  checked,
  onChange,
}: CheckOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 accent-indigo-600"
      />

      {label}
    </label>
  );
}