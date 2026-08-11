import {
  Calendar,
  Eye,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import {
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
  Button,
} from "@/components/ui/button";

import {
  Card,
} from "@/components/ui/card";

import {
  deletePatient,
  getPatients,
  type StoredPatient,
} from "@/pages/Pacientes/patientStorage";

/* =========================================
   INICIAIS
========================================= */

function getInitials(
  nome: string
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
   ÚLTIMA CONSULTA

   Temporariamente mostramos "-".

   Depois vamos calcular isso usando
   os atendimentos realizados da Agenda.
========================================= */

function getLastAppointment(
  _patient:
    StoredPatient
) {
  return "-";
}

/* =========================================
   TABELA
========================================= */

export function PatientTable() {
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
      () =>
        getPatients()
    );

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const canEdit =
    isGestor ||
    isRecepcao;

  const canDelete =
    isGestor;

  /* =======================================
     ORDENAR PACIENTES
  ======================================= */

  const sortedPatients =
    useMemo(
      () =>
        [
          ...patients,
        ].sort(
          (
            a,
            b
          ) =>
            a.nome.localeCompare(
              b.nome,
              "pt-BR"
            )
        ),

      [
        patients,
      ]
    );

  /* =======================================
     VISUALIZAR
  ======================================= */

  function handleViewPatient(
    patientId:
      number
  ) {
    navigate(
      `/pacientes/${patientId}`
    );
  }

  /* =======================================
     EDITAR
  ======================================= */

  function handleEditPatient(
    patientId:
      number
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

  /* =======================================
     EXCLUIR
  ======================================= */

  function handleDeletePatient(
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

    deletePatient(
      patient.id
    );

    setPatients(
      getPatients()
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* ================================= */}
          {/* CABEÇALHO */}
          {/* ================================= */}

          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Paciente
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                CPF
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Telefone
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Convênio
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Última Consulta
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                Ações
              </th>
            </tr>
          </thead>

          {/* ================================= */}
          {/* CORPO */}
          {/* ================================= */}

          <tbody>
            {sortedPatients.map(
              (
                patient
              ) => (
                <tr
                  key={
                    patient.id
                  }
                  className="border-b transition-colors hover:bg-slate-50"
                >
                  {/* ========================= */}
                  {/* PACIENTE */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {
                          getInitials(
                            patient.nome
                          )
                        }
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {
                            patient.nome
                          }
                        </p>

                        <p className="text-sm text-slate-500">
                          ID #
                          {
                            patient.id
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ========================= */}
                  {/* CPF */}
                  {/* ========================= */}

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {
                      patient.cpf ||
                      "-"
                    }
                  </td>

                  {/* ========================= */}
                  {/* TELEFONE */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone
                        size={15}
                      />

                      {
                        patient.celular ||
                        patient.telefone ||
                        "-"
                      }
                    </div>
                  </td>

                  {/* ========================= */}
                  {/* CONVÊNIO */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {
                        patient.convenio ||
                        "Particular"
                      }
                    </span>
                  </td>

                  {/* ========================= */}
                  {/* ÚLTIMA CONSULTA */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar
                        size={15}
                      />

                      {
                        getLastAppointment(
                          patient
                        )
                      }
                    </div>
                  </td>

                  {/* ========================= */}
                  {/* STATUS */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        patient.status ===
                        "Ativo"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {
                        patient.status
                      }
                    </span>
                  </td>

                  {/* ========================= */}
                  {/* AÇÕES */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {/* VISUALIZAR */}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title="Visualizar paciente"
                        onClick={() =>
                          handleViewPatient(
                            patient.id
                          )
                        }
                      >
                        <Eye
                          size={16}
                        />
                      </Button>

                      {/* EDITAR */}

                      {canEdit && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          title="Editar paciente"
                          onClick={() =>
                            handleEditPatient(
                              patient.id
                            )
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </Button>
                      )}

                      {/* EXCLUIR */}

                      {canDelete && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          title="Excluir paciente"
                          onClick={() =>
                            handleDeletePatient(
                              patient
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}

            {/* ================================= */}
            {/* LISTA VAZIA */}
            {/* ================================= */}

            {sortedPatients.length ===
              0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center"
                >
                  <p className="font-semibold text-slate-600">
                    Nenhum paciente encontrado.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Não existem pacientes cadastrados neste momento.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================================= */}
      {/* PAGINAÇÃO */}
      {/* ================================= */}

      <div className="flex flex-col gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Exibindo{" "}
          <strong>
            {sortedPatients.length >
            0
              ? `1–${sortedPatients.length}`
              : "0"}
          </strong>{" "}
          de{" "}
          <strong>
            {
              sortedPatients.length
            }
          </strong>{" "}
          pacientes
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
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
            disabled
          >
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  );
}