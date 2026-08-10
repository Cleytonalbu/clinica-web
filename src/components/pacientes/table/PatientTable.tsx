import {
  Calendar,
  Eye,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import {
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

/* =========================================
   TIPOS
========================================= */

interface Patient {
  id: number;

  nome: string;

  cpf: string;

  telefone: string;

  convenio: string;

  ultimaConsulta: string;

  status:
    | "Ativo"
    | "Inativo";
}

/* =========================================
   DADOS TEMPORÁRIOS
========================================= */

const initialPatients: Patient[] = [
  {
    id: 1,

    nome:
      "Maria Oliveira",

    cpf:
      "123.456.789-10",

    telefone:
      "(83) 99999-9999",

    convenio:
      "Particular",

    ultimaConsulta:
      "Hoje",

    status:
      "Ativo",
  },

  {
    id: 2,

    nome:
      "João Pedro",

    cpf:
      "987.654.321-11",

    telefone:
      "(83) 98888-8888",

    convenio:
      "Unimed",

    ultimaConsulta:
      "Ontem",

    status:
      "Ativo",
  },

  {
    id: 3,

    nome:
      "Fernanda Souza",

    cpf:
      "321.654.987-00",

    telefone:
      "(83) 97777-7777",

    convenio:
      "Hapvida",

    ultimaConsulta:
      "18/07/2026",

    status:
      "Inativo",
  },
];

/* =========================================
   INICIAIS DO PACIENTE
========================================= */

function getInitials(
  nome: string
) {
  return nome
    .split(" ")
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
   TABELA
========================================= */

export function PatientTable() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const [
    patients,
    setPatients,
  ] =
    useState<Patient[]>(
      initialPatients
    );

  /* =======================================
     PERMISSÕES POR PERFIL
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
     VISUALIZAR PACIENTE
  ======================================= */

  function handleViewPatient(
    patientId: number
  ) {
    navigate(
      `/pacientes/${patientId}`
    );
  }

  /* =======================================
     EDITAR PACIENTE
  ======================================= */

  function handleEditPatient(
    patientId: number
  ) {
    /*
     * Por enquanto vamos abrir o
     * perfil do paciente.
     *
     * Depois criaremos a tela/rota
     * específica para edição cadastral.
     */

    navigate(
      `/pacientes/${patientId}`
    );
  }

  /* =======================================
     EXCLUIR PACIENTE
  ======================================= */

  function handleDeletePatient(
    patient: Patient
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

    setPatients(
      (
        currentPatients
      ) =>
        currentPatients.filter(
          (
            currentPatient
          ) =>
            currentPatient.id !==
            patient.id
        )
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
            {patients.map(
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
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
                      patient.cpf
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
                        patient.telefone
                      }
                    </div>
                  </td>

                  {/* ========================= */}
                  {/* CONVÊNIO */}
                  {/* ========================= */}

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {
                        patient.convenio
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
                        patient.ultimaConsulta
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

                      {/* EDITAR
                          Gestor + Recepção */}

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

                      {/* EXCLUIR
                          Somente Gestor */}

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

            {patients.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    7
                  }
                  className="px-6 py-12 text-center"
                >
                  <p className="font-semibold text-slate-600">
                    Nenhum paciente encontrado.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Não existem pacientes para exibir neste momento.
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
            {patients.length >
            0
              ? `1–${patients.length}`
              : "0"}
          </strong>{" "}
          de{" "}
          <strong>
            {
              patients.length
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