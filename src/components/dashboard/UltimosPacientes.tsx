import {
  Search,
  UserRound,
  CircleCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const pacientes = [
  {
    id: 1,
    nome: "Maria Oliveira",
    ultimaConsulta: "Hoje • 08:00",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "João Pedro",
    ultimaConsulta: "Ontem • 15:30",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Carlos Henrique",
    ultimaConsulta: "22/07 • 10:15",
    status: "Ativo",
  },
  {
    id: 4,
    nome: "Fernanda Souza",
    ultimaConsulta: "20/07 • 09:40",
    status: "Ativo",
  },
  {
    id: 5,
    nome: "Patrícia Lima",
    ultimaConsulta: "18/07 • 14:10",
    status: "Ativo",
  },
];

export function UltimosPacientes() {
  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Últimos Pacientes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Últimos atendimentos realizados
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
        >
          <Search size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        {pacientes.map((paciente) => (
          <div
            key={paciente.id}
            className="
              group
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-slate-100
              p-4
              transition-all
              duration-200
              hover:border-emerald-200
              hover:bg-emerald-50/40
            "
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  {paciente.nome}
                </h3>

                <p className="text-sm text-slate-500">
                  {paciente.ultimaConsulta}
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CircleCheck size={14} />
              {paciente.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}