import {
  Bell,
  CalendarX2,
  CreditCard,
  UserPlus,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const notificacoes = [
  {
    id: 1,
    titulo: "Consulta cancelada",
    descricao: "Maria Oliveira cancelou a consulta das 14:00.",
    icon: CalendarX2,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 2,
    titulo: "Novo paciente",
    descricao: "João Pedro foi cadastrado no sistema.",
    icon: UserPlus,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    titulo: "Pagamento recebido",
    descricao: "Consulta de Ana Souza foi confirmada.",
    icon: CreditCard,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export function Notificacoes() {
  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Notificações
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Atualizações recentes do sistema
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Bell size={22} />
        </div>
      </div>

      <div className="space-y-4">
        {notificacoes.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="
                group
                flex
                gap-4
                rounded-xl
                border
                border-slate-100
                p-4
                transition-all
                duration-200
                hover:border-amber-200
                hover:bg-amber-50/40
              "
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  {item.titulo}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {item.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}