import {
  CalendarDays,
  Eye,
  MoreVertical,
  Pencil,
  Phone,
  Stethoscope,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  Button,
  PageCard,
} from "@/components/ui";

type ProfessionalStatus =
  | "Ativo"
  | "Inativo"
  | "Férias";

interface Professional {
  id: number;
  name: string;
  specialty: string;
  council: string;
  phone: string;
  patients: number;
  appointmentsToday: number;
  status: ProfessionalStatus;
}

const professionals: Professional[] = [
  {
    id: 1,
    name: "Dra. Ana Paula",
    specialty: "Psicologia",
    council: "CRP 13/12345",
    phone: "(83) 99999-1111",
    patients: 32,
    appointmentsToday: 8,
    status: "Ativo",
  },
  {
    id: 2,
    name: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
    council: "CREFONO 4-12345",
    phone: "(83) 99999-2222",
    patients: 28,
    appointmentsToday: 6,
    status: "Ativo",
  },
  {
    id: 3,
    name: "Dra. Larissa Lima",
    specialty: "Terapia Ocupacional",
    council: "CREFITO 1/123456",
    phone: "(83) 99999-3333",
    patients: 21,
    appointmentsToday: 5,
    status: "Férias",
  },
  {
    id: 4,
    name: "Dr. Rafael Costa",
    specialty: "Fisioterapia",
    council: "CREFITO 1/654321",
    phone: "(83) 99999-4444",
    patients: 18,
    appointmentsToday: 4,
    status: "Inativo",
  },
];

export function ProfessionalTable() {
  const navigate = useNavigate();

  function handleViewProfessional(
    professionalId: number
  ) {
    navigate(
      `/profissionais/${professionalId}`
    );
  }

  return (
    <PageCard
      title="Profissionais cadastrados"
      description="Consulte os profissionais vinculados à clínica."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-slate-200">
              <TableHeader>
                Profissional
              </TableHeader>

              <TableHeader>
                Especialidade
              </TableHeader>

              <TableHeader>
                Conselho
              </TableHeader>

              <TableHeader>
                Telefone
              </TableHeader>

              <TableHeader>
                Pacientes
              </TableHeader>

              <TableHeader>
                Agenda hoje
              </TableHeader>

              <TableHeader>
                Status
              </TableHeader>

              <TableHeader align="right">
                Ações
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {professionals.map(
              (professional) => (
                <tr
                  key={professional.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {getInitials(
                          professional.name
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {
                            professional.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID #
                          {
                            professional.id
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Stethoscope
                        size={16}
                      />
                      {
                        professional.specialty
                      }
                    </div>
                  </td>

                  <td className="py-4 pr-4 text-sm text-slate-600">
                    {professional.council}
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={15} />
                      {professional.phone}
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} />
                      {professional.patients}
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays
                        size={16}
                      />
                      {
                        professional.appointmentsToday
                      }
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <StatusBadge
                      status={
                        professional.status
                      }
                    />
                  </td>

                  <td className="py-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewProfessional(
                            professional.id
                          )
                        }
                      >
                        <Eye size={16} />
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                      >
                        <Pencil size={16} />
                      </Button>

                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreVertical
                          size={18}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Exibindo{" "}
          <strong>
            {professionals.length}
          </strong>{" "}
          profissionais
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>

          <Button
            type="button"
            size="sm"
          >
            1
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
          >
            Próxima
          </Button>
        </div>
      </div>
    </PageCard>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  align?: "left" | "right";
}

function TableHeader({
  children,
  align = "left",
}: TableHeaderProps) {
  return (
    <th
      className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

interface StatusBadgeProps {
  status: ProfessionalStatus;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<
    ProfessionalStatus,
    string
  > = {
    Ativo:
      "bg-emerald-100 text-emerald-700",

    Inativo:
      "bg-red-100 text-red-700",

    Férias:
      "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .replace("Dra. ", "")
    .replace("Dr. ", "")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}