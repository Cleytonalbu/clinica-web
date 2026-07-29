import {
  CalendarClock,
  Clock3,
  UserRound,
  ChevronRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";

export function ProximosAtendimentos() {
  const { proximosAtendimentos, loading } = useDashboard();

  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Próximos Atendimentos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Agendamentos das próximas horas
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <CalendarClock size={22} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : proximosAtendimentos.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200">
          <CalendarClock
            size={42}
            className="mb-3 text-slate-300"
          />

          <p className="font-medium text-slate-700">
            Nenhum atendimento encontrado
          </p>

          <span className="mt-1 text-sm text-slate-500">
            Não existem atendimentos agendados.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {proximosAtendimentos.map((item) => (
            <div
              key={item.id}
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
                hover:border-violet-200
                hover:bg-violet-50/40
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-violet-100
                    text-violet-600
                    transition-all
                    duration-300
                    group-hover:scale-105
                  "
                >
                  <UserRound size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    {item.paciente}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Atendimento agendado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700">
                  <Clock3 size={15} />
                  {item.horario}
                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition-all group-hover:translate-x-1"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}