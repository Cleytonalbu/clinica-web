import {
  Calendar,
  CalendarClock,
  Eye,
  Pencil,
  Phone,
  Trash2,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  excluirPaciente,
  listarPacientes,
  paraStoredPatient,
  type RealPatient as StoredPatient,
} from "@/services/pacientes";

import {
  getSavedAppointments,
  type StoredAppointment,
} from "@/pages/Agenda/appointmentStorage";

interface PatientTableProps {
  search:
    string;

  statusFilter:
    string;

  convenioFilter:
    string;
}

/* =========================================
   INICIAIS
========================================= */

function getInitials(
  nome:
    string
) {
  return nome
    .trim()
    .split(
      /\s+/
    )
    .filter(
      Boolean
    )
    .slice(
      0,
      2
    )
    .map(
      (
        name
      ) =>
        name[0]
    )
    .join("")
    .toUpperCase();
}

/* =========================================
   DATA/HORA
========================================= */

function createAppointmentDate(
  appointment:
    StoredAppointment
) {
  if (
    !appointment.date ||
    !appointment.time
  ) {
    return null;
  }

  const date =
    new Date(
      `${appointment.date}T${appointment.time}:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
  value:
    string
) {
  if (
    !value
  ) {
    return "-";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split(
      "-"
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

/* =========================================
   CONSULTAS
========================================= */

function getLastAppointment(
  patient:
    StoredPatient,

  appointments:
    StoredAppointment[]
) {
  const completed =
    appointments
      .filter(
        (
          appointment
        ) =>
          String(appointment.patientId) ===
            patient.id &&
          appointment.status ===
            "Realizado"
      )
      .sort(
        (
          a,
          b
        ) => {
          const dateA =
            createAppointmentDate(
              a
            );

          const dateB =
            createAppointmentDate(
              b
            );

          if (
            !dateA &&
            !dateB
          ) {
            return 0;
          }

          if (
            !dateA
          ) {
            return 1;
          }

          if (
            !dateB
          ) {
            return -1;
          }

          return (
            dateB.getTime() -
            dateA.getTime()
          );
        }
      );

  return (
    completed[0] ??
    null
  );
}

function getNextAppointment(
  patient:
    StoredPatient,

  appointments:
    StoredAppointment[]
) {
  const now =
    new Date();

  const future =
    appointments
      .filter(
        (
          appointment
        ) => {
          if (
            String(appointment.patientId) !==
            patient.id ||
            appointment.status ===
              "Realizado" ||
            appointment.status ===
              "Cancelado" ||
            appointment.status ===
              "Faltou"
          ) {
            return false;
          }

          const date =
            createAppointmentDate(
              appointment
            );

          return (
            date &&
            date.getTime() >=
              now.getTime()
          );
        }
      )
      .sort(
        (
          a,
          b
        ) => {
          const dateA =
            createAppointmentDate(
              a
            );

          const dateB =
            createAppointmentDate(
              b
            );

          if (
            !dateA ||
            !dateB
          ) {
            return 0;
          }

          return (
            dateA.getTime() -
            dateB.getTime()
          );
        }
      );

  return (
    future[0] ??
    null
  );
}

/* =========================================
   TABELA
========================================= */

export function PatientTable({
  search,
  statusFilter,
  convenioFilter,
}: PatientTableProps) {
  const navigate =
    useNavigate();

  const {
    user,
  } =
    useAuth();

  const [
    patients,
    setPatients,
  ] =
    useState<
      StoredPatient[]
    >(
      []
    );

  function reloadPatients() {
    listarPacientes({ porPagina: 200 }).then((resposta) => {
      setPatients(resposta.dados.map(paraStoredPatient));
    });
  }

  useEffect(() => {
    reloadPatients();
  }, []);

  const [
    appointments,
  ] =
    useState<
      StoredAppointment[]
    >(
      () =>
        getSavedAppointments()
    );

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const isProfissional =
    user?.profile ===
    "Profissional";

  const loggedProfessionalName =
    user?.professionalName ??
    user?.name ??
    "";

  const canEdit =
    isGestor ||
    isRecepcao;

  const canDelete =
    isGestor;

  const filteredPatients =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return [
          ...patients,
        ]
          .filter(
            (
              patient
            ) => {
              const phone =
                patient.celular ||
                patient.telefone ||
                "";

              // O backend já filtra a listagem por vínculo real quando
              // quem pede é PROFISSIONAL — `patients` aqui já vem restrito.
              const matchesSearch =
                !normalizedSearch ||
                patient.nome
                  .toLocaleLowerCase(
                    "pt-BR"
                  )
                  .includes(
                    normalizedSearch
                  ) ||
                (
                  patient.cpf ||
                  ""
                )
                  .toLocaleLowerCase(
                    "pt-BR"
                  )
                  .includes(
                    normalizedSearch
                  ) ||
                phone
                  .toLocaleLowerCase(
                    "pt-BR"
                  )
                  .includes(
                    normalizedSearch
                  );

              const matchesStatus =
                statusFilter ===
                  "Todos" ||
                patient.status ===
                  statusFilter;

              const patientConvenio =
                patient.convenio ||
                "Particular";

              const matchesConvenio =
                convenioFilter ===
                  "Todos" ||
                patientConvenio ===
                  convenioFilter;

              return (
                matchesSearch &&
                matchesStatus &&
                matchesConvenio
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              a.nome.localeCompare(
                b.nome,
                "pt-BR"
              )
          );
      },
      [
        patients,
        search,
        statusFilter,
        convenioFilter,
      ]
    );

  function handleViewPatient(
    patientId:
      string
  ) {
    navigate(
      `/pacientes/${patientId}`
    );
  }

  function handleEditPatient(
    patientId:
      string
  ) {
    if (
      !canEdit
    ) {
      return;
    }

    navigate(
      `/pacientes/${patientId}/editar`
    );
  }

  // DELETE /pacientes/:id é soft-delete no backend (o cadastro é mantido,
  // só o status vira Inativo) — por isso, após excluir, o paciente ainda
  // pode reaparecer na lista se o filtro de status incluir "Inativo".
  async function handleDeletePatient(
    patient:
      StoredPatient
  ) {
    if (
      !canDelete
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir o paciente ${patient.nome}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    await excluirPaciente(
      patient.id
    );

    reloadPatients();
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full">
          <thead className="border-b border-[#e9ebf3] bg-[#fbfbfe]">
            <tr>
              <TableHeading>
                Paciente
              </TableHeading>

              <TableHeading>
                Contato
              </TableHeading>

              <TableHeading>
                Convênio
              </TableHeading>

              <TableHeading>
                Última consulta
              </TableHeading>

              <TableHeading>
                Próxima consulta
              </TableHeading>

              <TableHeading>
                Status
              </TableHeading>

              <TableHeading
                centered
              >
                Ações
              </TableHeading>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eef0f5]">
            {filteredPatients.map(
              (
                patient,
                index
              ) => {
                const patientAppointments =
                  isProfissional
                    ? appointments.filter(
                        (
                          appointment
                        ) =>
                          appointment.professional ===
                          loggedProfessionalName
                      )
                    : appointments;

                const lastAppointment =
                  getLastAppointment(
                    patient,
                    patientAppointments
                  );

                const nextAppointment =
                  getNextAppointment(
                    patient,
                    patientAppointments
                  );

                return (
                  <tr
                    key={
                      patient.id
                    }
                    className="transition hover:bg-[#fcfbff]"
                  >
                    {/* PACIENTE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${getAvatarStyle(
                            index
                          )}`}
                        >
                          {
                            getInitials(
                              patient.nome
                            )
                          }
                        </div>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewPatient(
                                patient.id
                              )
                            }
                            className="max-w-[220px] truncate text-left text-sm font-extrabold text-[#263765] transition hover:text-[#6543ef]"
                          >
                            {
                              patient.nome
                            }
                          </button>

                          <p className="mt-1 text-[10px] font-semibold text-[#9aa3b9]">
                            ID #
                            {
                              patient.id
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTATO */}

                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-2 text-xs font-semibold text-[#667394]">
                          <Phone
                            size={13}
                            className="text-[#8590ad]"
                          />

                          {
                            patient.celular ||
                            patient.telefone ||
                            "-"
                          }
                        </p>

                        <p className="text-[10px] font-medium text-[#9aa3b9]">
                          CPF:{" "}
                          {
                            patient.cpf ||
                            "-"
                          }
                        </p>
                      </div>
                    </td>

                    {/* CONVÊNIO */}

                    <td className="px-5 py-4">
                      <ConvenioBadge
                        convenio={
                          patient.convenio ||
                          "Particular"
                        }
                      />
                    </td>

                    {/* ÚLTIMA CONSULTA */}

                    <td className="px-5 py-4">
                      {lastAppointment ? (
                        <AppointmentInfo
                          icon={
                            Calendar
                          }
                          date={
                            formatDate(
                              lastAppointment.date
                            )
                          }
                          detail={
                            lastAppointment.specialty
                          }
                        />
                      ) : (
                        <span className="text-xs text-[#a1a9bc]">
                          -
                        </span>
                      )}
                    </td>

                    {/* PRÓXIMA CONSULTA */}

                    <td className="px-5 py-4">
                      {nextAppointment ? (
                        <AppointmentInfo
                          icon={
                            CalendarClock
                          }
                          date={`${formatDate(
                            nextAppointment.date
                          )} ${nextAppointment.time}`}
                          detail={
                            nextAppointment.specialty
                          }
                        />
                      ) : (
                        <span className="text-xs text-[#a1a9bc]">
                          -
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${
                          patient.status ===
                          "Ativo"
                            ? "bg-[#e7f8f0] text-[#269d75]"
                            : "bg-[#fff0f3] text-[#df4e67]"
                        }`}
                      >
                        <i
                          className={`h-1.5 w-1.5 rounded-full ${
                            patient.status ===
                            "Ativo"
                              ? "bg-[#2daf82]"
                              : "bg-[#eb5771]"
                          }`}
                        />

                        {
                          patient.status
                        }
                      </span>
                    </td>

                    {/* AÇÕES */}

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <ActionButton
                          title="Visualizar paciente"
                          onClick={() =>
                            handleViewPatient(
                              patient.id
                            )
                          }
                        >
                          <Eye
                            size={15}
                          />
                        </ActionButton>

                        {canEdit && (
                          <ActionButton
                            title="Editar paciente"
                            onClick={() =>
                              handleEditPatient(
                                patient.id
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </ActionButton>
                        )}

                        {canDelete && (
                          <ActionButton
                            danger
                            title="Excluir paciente"
                            onClick={() =>
                              handleDeletePatient(
                                patient
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}

            {filteredPatients.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    7
                  }
                  className="px-6 py-14 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2efff] text-[#6847f5]">
                    <Users
                      size={21}
                    />
                  </div>

                  <p className="mt-4 font-extrabold text-[#526080]">
                    Nenhum paciente encontrado
                  </p>

                  <p className="mt-1 text-sm text-[#929bb3]">
                    {isProfissional
                      ? "Nenhum paciente está vinculado ao seu perfil."
                      : "Ajuste os filtros ou cadastre um novo paciente."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ */}

      <div className="flex flex-col gap-3 border-t border-[#eceef5] bg-[#fbfbfe] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-[#7e89a6]">
          Exibindo{" "}
          <strong className="text-[#526080]">
            {
              filteredPatients.length
            }
          </strong>{" "}
          de{" "}
          <strong className="text-[#526080]">
            {
              patients.length
            }
          </strong>{" "}
          pacientes
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
   AUXILIARES VISUAIS
========================================= */

function TableHeading({
  children,
  centered =
    false,
}: {
  children:
    React.ReactNode;

  centered?:
    boolean;
}) {
  return (
    <th
      className={`px-5 py-4 text-[11px] font-extrabold text-[#5c698c] ${
        centered
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

function AppointmentInfo({
  icon:
    Icon,
  date,
  detail,
}: {
  icon:
    typeof Calendar;

  date:
    string;

  detail:
    string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold text-[#667394]">
        <Icon
          size={13}
          className="text-[#8590ad]"
        />

        {
          date
        }
      </p>

      <p className="mt-1 pl-[21px] text-[9px] font-medium text-[#9aa3b9]">
        {
          detail
        }
      </p>
    </div>
  );
}

function ConvenioBadge({
  convenio,
}: {
  convenio:
    string;
}) {
  const normalized =
    convenio.toLocaleLowerCase(
      "pt-BR"
    );

  let style =
    "bg-[#eeeaff] text-[#6847f5]";

  if (
    normalized.includes(
      "unimed"
    )
  ) {
    style =
      "bg-[#e8f8f1] text-[#269d75]";
  } else if (
    normalized.includes(
      "hapvida"
    )
  ) {
    style =
      "bg-[#eaf4ff] text-[#3984dc]";
  } else if (
    normalized.includes(
      "bradesco"
    )
  ) {
    style =
      "bg-[#fff0f3] text-[#df4e67]";
  }

  return (
    <span
      className={`inline-flex rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${style}`}
    >
      {
        convenio
      }
    </span>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger =
    false,
}: {
  children:
    React.ReactNode;

  title:
    string;

  onClick:
    () => void;

  danger?:
    boolean;
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
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-[#ffdce3] bg-[#fff7f8] text-[#e34e68] hover:border-[#ffc6d1] hover:bg-[#fff0f3]"
          : "border-[#e1e4ef] bg-white text-[#68769a] hover:border-[#d4ceff] hover:bg-[#faf9ff] hover:text-[#6543ef]"
      }`}
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