import {
  CalendarDays,
  Eye,
  Pencil,
  Phone,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getSystemSettings,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getSavedAppointments,
} from "@/pages/Agenda/appointmentStorage";

import {
  getProfessionalAccessiblePatientIds,
} from "@/pages/Pacientes/patientAccessRules";

export type ProfessionalStatus =
  | "Ativo"
  | "Inativo"
  | "Férias";

export interface Professional {
  id:
    number;

  name:
    string;

  specialty:
    string;

  council:
    string;

  phone:
    string;

  patients:
    number;

  appointmentsToday:
    number;

  status:
    ProfessionalStatus;
}

export interface ProfessionalFilterState {
  search:
    string;

  specialty:
    string;

  status:
    string;
}

/* =========================================
   FONTE ÚNICA DE PROFISSIONAIS
========================================= */

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getProfessionalTableData():
  Professional[] {
  const today = localDateKey();

  const appointments =
    getSavedAppointments();

  return getSystemSettings()
    .professionals
    .map((professional) => {
      const status:
        ProfessionalStatus =
          professional.status ??
          (professional.active
            ? "Ativo"
            : "Inativo");

      return {
        id: professional.id,
        name: professional.name,
        specialty: professional.specialty,
        council: professional.registration,
        phone: professional.phone ?? "—",
        patients:
          getProfessionalAccessiblePatientIds(
            professional.name
          ).length,
        appointmentsToday:
          appointments.filter(
            (appointment) =>
              appointment.professional === professional.name &&
              appointment.date === today &&
              appointment.status !== "Cancelado"
          ).length,
        status,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );
}

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

function ProfessionalTableBase({
  filters,
}: {
  filters:
    ProfessionalFilterState;
}) {
  const navigate =
    useNavigate();

  const professionals =
    getProfessionalTableData();

  const filteredProfessionals =
    useMemo(
      () => {
        const search =
          filters.search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return professionals.filter(
          (
            professional
          ) => {
            const matchesSearch =
              !search ||
              professional.name
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  search
                ) ||
              professional.council
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  search
                ) ||
              professional.phone
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  search
                );

            const matchesSpecialty =
              filters.specialty ===
                "todas" ||
              normalizeSpecialty(
                professional.specialty
              ) ===
                filters.specialty;

            const matchesStatus =
              filters.status ===
                "todos" ||
              normalizeStatus(
                professional.status
              ) ===
                filters.status;

            return (
              matchesSearch &&
              matchesSpecialty &&
              matchesStatus
            );
          }
        );
      },
      [
        filters,
      ]
    );

  function handleViewProfessional(
    professionalId:
      number
  ) {
    navigate(
      `/profissionais/${professionalId}`
    );
  }

  function handleEditProfessional(
    professionalId:
      number
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
            {filteredProfessionals.map(
              (
                professional,
                index
              ) => (
                <tr
                  key={
                    professional.id
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
                            professional.name
                          )
                        }
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewProfessional(
                              professional.id
                            )
                          }
                          className="text-left text-sm font-extrabold text-[#263765] transition hover:text-[#6543ef]"
                        >
                          {
                            professional.name
                          }
                        </button>

                        <p className="mt-1 text-[10px] font-semibold text-[#9aa3b9]">
                          ID #
                          {
                            professional.id
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ESPECIALIDADE */}

                  <td className="px-5 py-4">
                    <SpecialtyBadge
                      specialty={
                        professional.specialty
                      }
                    />
                  </td>

                  {/* CONSELHO */}

                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-[#657295]">
                      {
                        professional.council
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
                        professional.phone
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
                        professional.patients
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
                        professional.appointmentsToday
                      }
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={
                        professional.status
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
                            professional.id
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
                            professional.id
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
              )
            )}

            {filteredProfessionals.length ===
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
              professionals.length
            }
          </strong>{" "}
          profissionais
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="h-9 rounded-lg border border-[#e1e4ef] bg-white px-3 text-xs font-semibold text-[#9aa3b8] disabled:opacity-60"
          >
            Anterior
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6847f5] text-xs font-extrabold text-white shadow-[0_5px_13px_rgba(104,71,245,0.20)]"
          >
            1
          </button>

          <button
            type="button"
            disabled
            className="h-9 rounded-lg border border-[#e1e4ef] bg-white px-3 text-xs font-semibold text-[#9aa3b8] disabled:opacity-60"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   SUMMARY
========================================= */

interface SummaryCardConfig {
  title:
    string;

  value:
    number;

  description:
    string;

  icon:
    typeof Users;

  iconStyle:
    string;

  valueStyle:
    string;
}

function ProfessionalSummary({
  cards,
}: {
  cards:
    SummaryCardConfig[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        (
          card
        ) => {
          const Icon =
            card.icon;

          return (
            <div
              key={
                card.title
              }
              className="relative overflow-hidden rounded-2xl border border-[#e9ebf4] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(51,65,120,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#68769b]">
                    {
                      card.title
                    }
                  </p>

                  <p
                    className={`mt-3 text-[27px] font-extrabold tracking-[-0.03em] ${card.valueStyle}`}
                  >
                    {
                      card.value
                    }
                  </p>

                  <p className="mt-1.5 text-[10px] font-medium text-[#98a1ba]">
                    {
                      card.description
                    }
                  </p>
                </div>

                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon
                    size={20}
                  />
                </span>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================
   AUXILIARES
========================================= */

interface TableHeaderProps {
  children:
    React.ReactNode;

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
    React.ReactNode;

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

function normalizeSpecialty(
  specialty:
    string
) {
  const map:
    Record<
      string,
      string
    > = {
    Psicologia:
      "psicologia",

    Fonoaudiologia:
      "fono",

    "Terapia Ocupacional":
      "to",

    Fisioterapia:
      "fisio",

    Nutrição:
      "nutricao",
  };

  return (
    map[
      specialty
    ] ??
    specialty
      .toLocaleLowerCase(
        "pt-BR"
      )
  );
}

function normalizeStatus(
  status:
    ProfessionalStatus
) {
  if (
    status ===
    "Ativo"
  ) {
    return "ativo";
  }

  if (
    status ===
    "Inativo"
  ) {
    return "inativo";
  }

  return "ferias";
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

/* =========================================
   EXPORTS AUXILIARES NO COMPONENTE
========================================= */

export const ProfessionalTable = Object.assign(
  ProfessionalTableBase,
  {
    Summary: ProfessionalSummary,

    /**
     * Compatibilidade com as telas que ainda usam
     * ProfessionalTable.data.
     *
     * O getter sempre consulta a fonte única atualizada,
     * portanto não volta a criar uma lista fixa.
     */
    get data() {
      return getProfessionalTableData();
    },
  }
);
