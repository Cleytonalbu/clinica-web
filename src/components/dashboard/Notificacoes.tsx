import { Bell } from "lucide-react";

const notificacoes = [
  {
    id: 1,
    titulo: "Consulta cancelada",
    descricao: "Maria Oliveira cancelou a consulta das 14:00.",
  },
  {
    id: 2,
    titulo: "Novo paciente",
    descricao: "João Pedro foi cadastrado no sistema.",
  },
  {
    id: 3,
    titulo: "Pagamento recebido",
    descricao: "Consulta de Ana Souza foi confirmada.",
  },
];

export function Notificacoes() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Bell className="text-amber-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">
          Notificações
        </h2>
      </div>

      <div className="space-y-4">
        {notificacoes.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-100 p-4"
          >
            <p className="font-medium text-slate-800">
              {item.titulo}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {item.descricao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
