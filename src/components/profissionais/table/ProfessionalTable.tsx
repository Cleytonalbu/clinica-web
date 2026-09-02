import {
  CalendarDays,
  Eye,
  Pencil,
  Phone,
  Stethoscope,
  Users,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import type { ApiProfissional } from "@/services/referencias";

export type ProfessionalStatus =
  | "Ativo"
  | "Inativo"
  | "Férias";

export interface ProfessionalFilterState {
  search:
    string;

  specialty:
    string;

  status:
    string;
}

const STATUS_LABEL: Record<ApiProfissional["status"], ProfessionalStatus> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  FERIAS: "Férias",
};

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

interface ProfessionalTableProps {
  profissionais: ApiProfissional[];
  loading: boolean;
  filters: ProfessionalFilterState;
}

export function ProfessionalTable({
  profissionais,
  loading,
  filters,
}: ProfessionalTableProps) {
  const navigate =
    useNavigate();

  const filteredProfessionals =
    useMemo(
      () => {
        const search =
          filters.search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return profissionais.filter(
          (
            profissional
          ) => {
            const conselho = [profissional.conselho, profissional.registro].filter(Boolean).join(" ");

            const matchesSearch =
              !search ||
              profissional.usuario.nome
                .toLocaleLowerCase("pt-BR")
                .includes(search) ||
              conselho
                .toLocaleLowerCase("pt-BR")
                .includes(search) ||
              (profissional.telefone ?? "")
                .toLocaleLowerCase("pt-BR")
                .includes(search);

            const matchesSpecialty =
              filters.specialty === "todas" ||
              profissional.especialidades.some(
                (e) => e.especialidade.id === filters.specialty
              );

            const matchesStatus =
              filters.status === "todos" ||
              profissional.status === filters.status;

            return (
              matchesSearch &&
              matchesSpecialty &&
              matchesStatus
            );
          }
        );
      },
      [
        profissionais,
        filters,
      ]
    );

  function handleViewProfessional(
    professionalId:
      string
  ) {
    navigate(
      `/profissionais/${professionalId}`
    );
  }

  function handleEditProfessional(
    professionalId:
      string
  ) {
    navigate(
      `/profissionais/${professionalId}/editar`
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="border-b border-[#eceef5] px-5 py-4">
        <h2 className="text-base font-extrabold text-[#10235f]">
          Profissionais cadastrados
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8a95b4]">
          Consulte os profissionais vinculados à clínica.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full">
          <thead className="border-b border-[#e9ebf3] bg-[#fbfbfe]">
            <tr>
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

              <TableHeader
                align="center"
              >
                Ações
              </TableHeader>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eef0f5]">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center text-sm text-[#929bb3]">
                  Carregando profissionais…
                </td>
              </tr>
            )}

            {!loading && filteredProfessionals.map(
              (
                profissional,
                index
              ) => {
                const especialidadeNome = profissional.especialidades[0]?.especialidade.nome ?? "Sem especialidade";
                const conselho = [profissional.conselho, profissional.registro].filter(Boolean).join(" ") || "—";
                const status = STATUS_LABEL[profissional.status];

                return (
                <tr
                  key={
                    profissional.id
                  }
                  className="transition hover:bg-[#fcfbff]"
                >
                  {/* PROFISSIONAL */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${getAvatarStyle(
                          index
                        )}`}
                      >
                        {
                          getInitials(
                            profissional.usuario.nome
                          )
                        }
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewProfessional(
                              profissional.id
                            )
                          }
                          className="text-left text-sm font-extrabold text-[#263765] transition hover:text-[#6543ef]"
                        >
                          {
                            profissional.usuario.nome
                          }
                        </button>

                        <p className="mt-1 truncate text-[10px] font-semibold text-[#9aa3b9]">
                          {
                            profissional.usuario.email
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ESPECIALIDADE */}

                  <td className="px-5 py-4">
                    <SpecialtyBadge
                      specialty={
                        especialidadeNome
                      }
                    />
                  </td>

                  {/* CONSELHO */}

                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-[#657295]">
                      {
                        conselho
                      }
                    </p>
                  </td>

                  {/* TELEFONE */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#667394]">
                      <Phone
                        size={13}
                        className="text-[#8590ad]"
                      />

                      {
                        profissional.telefone || "—"
                      }
                    </div>
                  </td>

                  {/* PACIENTES */}

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-[#f5f3ff] px-3 py-1.5 text-xs font-extrabold text-[#6847f5]">
                      <Users
                        size={14}
                      />

                      {
                        profissional.pacientes ?? 0
                      }
                    </div>
                  </td>

                  {/* AGENDA */}

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-[#eef7ff] px-3 py-1.5 text-xs font-extrabold text-[#3984dc]">
                      <CalendarDays
                        size={14}
                      />

                      {
                        profissional.atendimentosHoje ?? 0
                      }
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={
                        status
                      }
                    />
                  </td>

                  {/* AÇÕES */}

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <ActionButton
                        title="Visualizar profissional"
                        onClick={() =>
                          handleViewProfessional(
                            profissional.id
                          )
                        }
                      >
                        <Eye
                          size={15}
                        />
                      </ActionButton>

                      <ActionButton
                        title="Editar profissional"
                        onClick={() =>
                          handleEditProfessional(
                            profissional.id
                          )
                        }
                      >
                        <Pencil
                          size={15}
                        />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
                );
              }
            )}

            {!loading && filteredProfessionals.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    8
                  }
                  className="px-6 py-14 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2efff] text-[#6847f5]">
                    <Stethoscope
                      size={21}
                    />
                  </div>

                  <p className="mt-4 font-extrabold text-[#526080]">
                    Nenhum profissional encontrado
                  </p>

                  <p className="mt-1 text-sm text-[#929bb3]">
                    Ajuste os filtros para tentar novamente.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#eceef5] bg-[#fbfbfe] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-[#7e89a6]">
          Exibindo{" "}
          <strong className="text-[#526080]">
            {
              filteredProfessionals.length
            }
          </strong>{" "}
          de{" "}
          <strong className="text-[#526080]">
            {
              profissionais.length
            }
          </strong>{" "}
          profissionais
        </p>
      </div>
    </section>
  );
}

/* =========================================
   AUXILIARES
========================================= */

interface TableHeaderProps {
  children:
    ReactNode;

  align?:
    | "left"
    | "center";
}

function TableHeader({
  children,
  align =
    "left",
}: TableHeaderProps) {
  return (
    <th
      className={`px-5 py-4 text-[11px] font-extrabold text-[#5c698c] ${
        align ===
        "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      {
        children
      }
    </th>
  );
}

function SpecialtyBadge({
  specialty,
}: {
  specialty:
    string;
}) {
  const style =
    getSpecialtyStyle(
      specialty
    );

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${style}`}
    >
      <Stethoscope
        size={13}
      />

      {
        specialty
      }
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status:
    ProfessionalStatus;
}) {
  const styles:
    Record<
      ProfessionalStatus,
      string
    > = {
    Ativo:
      "bg-[#e7f8f0] text-[#269d75]",

    Inativo:
      "bg-[#fff0f3] text-[#df4e67]",

    Férias:
      "bg-[#fff3e4] text-[#df8a27]",
  };

  const dotStyles:
    Record<
      ProfessionalStatus,
      string
    > = {
    Ativo:
      "bg-[#2daf82]",

    Inativo:
      "bg-[#eb5771]",

    Férias:
      "bg-[#ed982f]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${styles[status]}`}
    >
      <i
        className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`}
      />

      {
        status
      }
    </span>
  );
}

function ActionButton({
  children,
  title,
  onClick,
}: {
  children:
    ReactNode;

  title:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      title={
        title
      }
      onClick={
        onClick
      }
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e4ef] bg-white text-[#68769a] transition hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef]"
    >
      {
        children
      }
    </button>
  );
}

function getAvatarStyle(
  index:
    number
) {
  const styles = [
    "bg-[#eeeaff] text-[#6847f5]",
    "bg-[#eaf4ff] text-[#3984dc]",
    "bg-[#e8f8f1] text-[#269d75]",
    "bg-[#fff3e4] text-[#df8a27]",
    "bg-[#f8eaff] text-[#a04ed7]",
  ];

  return styles[
    index %
    styles.length
  ];
}

function getSpecialtyStyle(
  specialty:
    string
) {
  if (
    specialty ===
    "Psicologia"
  ) {
    return "bg-[#eeeaff] text-[#6847f5]";
  }

  if (
    specialty ===
    "Fonoaudiologia"
  ) {
    return "bg-[#eaf4ff] text-[#3984dc]";
  }

  if (
    specialty ===
    "Terapia Ocupacional"
  ) {
    return "bg-[#e8f8f1] text-[#269d75]";
  }

  if (
    specialty ===
    "Fisioterapia"
  ) {
    return "bg-[#fff3e4] text-[#df8a27]";
  }

  if (
    specialty ===
    "Nutrição"
  ) {
    return "bg-[#f8eaff] text-[#a04ed7]";
  }

  return "bg-[#eef0f5] text-[#66718c]";
}

function getInitials(
  name:
    string
) {
  return name
    .replace(
      "Dra. ",
      ""
    )
    .replace(
      "Dr. ",
      ""
    )
    .split(
      " "
    )
    .slice(
      0,
      2
    )
    .map(
      (
        word
      ) =>
        word[0]
    )
    .join("")
    .toUpperCase();
}
