import {
  Eye,
  Pencil,
  Trash2,
  Phone,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Patient {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  convenio: string;
  ultimaConsulta: string;
  status: "Ativo" | "Inativo";
}

const pacientes: Patient[] = [
  {
    id: 1,
    nome: "Maria Oliveira",
    cpf: "123.456.789-10",
    telefone: "(83) 99999-9999",
    convenio: "Particular",
    ultimaConsulta: "Hoje",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "João Pedro",
    cpf: "987.654.321-11",
    telefone: "(83) 98888-8888",
    convenio: "Unimed",
    ultimaConsulta: "Ontem",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Fernanda Souza",
    cpf: "321.654.987-00",
    telefone: "(83) 97777-7777",
    convenio: "Hapvida",
    ultimaConsulta: "18/07/2026",
    status: "Inativo",
  },
];

function getInitials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PatientTable() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full">
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

          <tbody>
            {pacientes.map((patient) => (
              <tr
                key={patient.id}
                className="border-b transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                      {getInitials(patient.nome)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {patient.nome}
                      </p>

                      <p className="text-sm text-slate-500">
                        ID #{patient.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {patient.cpf}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={15} />
                    {patient.telefone}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {patient.convenio}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={15} />
                    {patient.ultimaConsulta}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      patient.status === "Ativo"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye size={16} />
                    </Button>

                    <Button variant="secondary" size="sm">
                      <Pencil size={16} />
                    </Button>

                    <Button variant="danger" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-500">
          Exibindo <strong>1–3</strong> de <strong>3</strong> pacientes
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Anterior
          </Button>

          <Button size="sm">1</Button>

          <Button variant="outline" size="sm">
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  );
}