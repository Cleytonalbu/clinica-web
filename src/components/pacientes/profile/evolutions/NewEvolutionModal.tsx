import { useState } from "react";
import { Paperclip, Save, X } from "lucide-react";

import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

interface NewEvolutionModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewEvolutionModal({
  open,
  onClose,
}: NewEvolutionModalProps) {
  const [specialty, setSpecialty] = useState("");
  const [professional, setProfessional] = useState("");
  const [objective, setObjective] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [patientResponse, setPatientResponse] = useState("");
  const [familyGuidance, setFamilyGuidance] = useState("");

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    console.log({
      specialty,
      professional,
      objective,
      date,
      description,
      patientResponse,
      familyGuidance,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Nova Evolução
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registre as informações da sessão do paciente.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Especialidade" required>
              <Select
                value={specialty}
                onChange={(event) =>
                  setSpecialty(event.target.value)
                }
              >
                <option value="">
                  Selecione a especialidade
                </option>

                <option value="Psicologia">
                  Psicologia
                </option>

                <option value="Fonoaudiologia">
                  Fonoaudiologia
                </option>

                <option value="Terapia Ocupacional">
                  Terapia Ocupacional
                </option>

                <option value="Fisioterapia">
                  Fisioterapia
                </option>

                <option value="Nutrição">
                  Nutrição
                </option>
              </Select>
            </FormField>

            <FormField label="Profissional" required>
              <Select
                value={professional}
                onChange={(event) =>
                  setProfessional(event.target.value)
                }
              >
                <option value="">
                  Selecione o profissional
                </option>

                <option value="Dra. Ana Paula">
                  Dra. Ana Paula
                </option>

                <option value="Dra. Camila Soares">
                  Dra. Camila Soares
                </option>

                <option value="Dra. Larissa Lima">
                  Dra. Larissa Lima
                </option>
              </Select>
            </FormField>

            <FormField label="Objetivo relacionado">
              <Select
                value={objective}
                onChange={(event) =>
                  setObjective(event.target.value)
                }
              >
                <option value="">
                  Selecione um objetivo
                </option>

                <option value="Melhorar comunicação verbal">
                  Melhorar comunicação verbal
                </option>

                <option value="Aumentar atenção sustentada">
                  Aumentar atenção sustentada
                </option>

                <option value="Desenvolver autonomia nas tarefas">
                  Desenvolver autonomia nas tarefas
                </option>
              </Select>
            </FormField>

            <FormField label="Data da sessão" required>
              <Input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </FormField>
          </div>

          <FormField
            label="Descrição da sessão"
            required
          >
            <Textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descreva as atividades realizadas, comportamento observado e principais pontos da sessão..."
              className="min-h-[140px]"
            />
          </FormField>

          <FormField label="Resposta do paciente">
            <Textarea
              value={patientResponse}
              onChange={(event) =>
                setPatientResponse(event.target.value)
              }
              placeholder="Como o paciente respondeu aos estímulos, atividades e intervenções?"
              className="min-h-[110px]"
            />
          </FormField>

          <FormField label="Orientações para família">
            <Textarea
              value={familyGuidance}
              onChange={(event) =>
                setFamilyGuidance(event.target.value)
              }
              placeholder="Registre orientações, atividades ou recomendações para os responsáveis..."
              className="min-h-[110px]"
            />
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Anexos
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
              <Paperclip
                size={24}
                className="text-indigo-500"
              />

              <span className="mt-3 text-sm font-semibold text-slate-700">
                Adicionar arquivos
              </span>

              <span className="mt-1 text-xs text-slate-500">
                PDF, imagem ou documento
              </span>

              <input
                type="file"
                multiple
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button type="submit">
              <Save size={17} />
              Salvar evolução
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}