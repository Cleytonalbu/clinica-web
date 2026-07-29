import {
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";

export function AgendaHoje() {
  const { agenda, loading } = useDashboard();

  return (
    <Card className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Agenda de Hoje
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Atendimentos programados para hoje
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <CalendarDays size={22} />
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
      ) : agenda.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200">
          <CalendarDays
            size={42}
            className="mb-3 text-slate-300"
          />

          <p className="font-medium text-slate-700">
            Nenhum atendimento encontrado
          </p>

          <span className="mt-1 text-sm text-slate-500">
            Sua agenda está livre.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {agenda.map((item) => (
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
                hover:border-blue-200
                hover:bg-blue-50/40
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
                    bg-blue-100
                    text-blue-600
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
                    {item.profissional}
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-blue-100
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-blue-700
                "
              >
                <Clock3 size={15} />
                {item.horario}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}