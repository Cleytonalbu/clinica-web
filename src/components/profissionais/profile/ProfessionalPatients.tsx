import { useMemo, useState } from "react";

import {
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Search,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

interface ProfessionalPatient {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
  lastSession: string;
  nextSession: string;
  nextTime: string;
  status: "Ativo" | "Pausado";
}

const patients: ProfessionalPatient[] = [
  {
    id: 1,
    name: "Maria Oliveira",
    age: 8,
    diagnosis: "TEA - Nível 1 de Suporte",
    lastSession: "05/08/2026",
    nextSession: "10/08/2026",
    nextTime: "10:30",
    status: "Ativo",
  },
  {
    id: 2,
    name: "João Miguel Silva",
    age: 9,
    diagnosis: "TEA",
    lastSession: "04/08/2026",
    nextSession: "11/08/2026",
    nextTime: "09:00",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Lucas Gabriel",
    age: 7,
    diagnosis: "TDAH",
    lastSession: "01/08/2026",
    nextSession: "12/08/2026",
    nextTime: "14:00",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Ana Clara Rodrigues",
    age: 10,
    diagnosis: "Acompanhamento psicológico",
    lastSession: "30/07/2026",
    nextSession: "14/08/2026",
    nextTime: "15:30",
    status: "Pausado",
  },
];

export function ProfessionalPatients() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        patient.diagnosis
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "Todos" ||
        patient.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  function handleOpenPatient(patientId: number) {
    navigate(`/pacientes/${patientId}`);
  }

  function handleEvolution(patientId: number) {
    navigate(
      `/pacientes/${patientId}/evolucoes/nova`
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Pacientes do Profissional
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Pacientes atualmente vinculados a este profissional.
        </p>
      </div>

      <PageCard
        title="Pacientes vinculados"
        description="Consulte rapidamente prontuário, agenda e evolução."
      >
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar paciente..."
              className="pl-11"
            />
          </div>

          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="lg:w-52"
          >
            <option value="Todos">
              Todos os status
            </option>

            <option value="Ativo">
              Ativos
            </option>

            <option value="Pausado">
              Pausados
            </option>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <UserRound size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenPatient(
                            patient.id
                          )
                        }
                        className="text-left text-lg font-bold text-slate-900 transition hover:text-indigo-600"
                      >
                        {patient.name}
                      </button>

                      <StatusBadge
                        status={patient.status}
                      />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {patient.age} anos
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {patient.diagnosis}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<CalendarDays size={17} />}
                    label="Última sessão"
                    value={patient.lastSession}
                  />

                  <InfoBox
                    icon={<Clock3 size={17} />}
                    label="Próxima sessão"
                    value={`${patient.nextSession} • ${patient.nextTime}`}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleOpenPatient(
                        patient.id
                      )
                    }
                  >
                    <Eye size={16} />
                    Prontuário
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      handleEvolution(
                        patient.id
                      )
                    }
                  >
                    <FileText size={16} />
                    Nova evolução
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
            <UserRound
              size={34}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-700">
              Nenhum paciente encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Altere a pesquisa ou o filtro de status.
            </p>
          </div>
        )}
      </PageCard>
    </div>
  );
}

interface InfoBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoBox({
  icon,
  label,
  value,
}: InfoBoxProps) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <div className="mt-0.5 text-indigo-500">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "Ativo" | "Pausado";
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    Ativo:
      "bg-emerald-100 text-emerald-700",
    Pausado:
      "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}