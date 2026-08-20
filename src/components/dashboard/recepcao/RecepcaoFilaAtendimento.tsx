import {
  UsersRound,
} from "lucide-react";

const queue = [
  {
    position: 1,
    patient: "Ana Clara Rodrigues",
    arrival: "Chegada 08:50",
    time: "09:00",
  },

  {
    position: 2,
    patient: "Beatriz Oliveira",
    arrival: "Chegada 09:20",
    time: "09:30",
  },

  {
    position: 3,
    patient: "Carlos Eduardo",
    arrival: "Chegada 09:45",
    time: "10:00",
  },
];

export function RecepcaoFilaAtendimento() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <UsersRound
          size={20}
          className="text-cyan-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Fila de atendimento
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {queue.map(
          (
            item
          ) => (
            <div
              key={
                item.position
              }
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.position === 1
                  ? "bg-violet-50 text-violet-700"
                  : item.position === 2
                    ? "bg-amber-50 text-amber-700"
                    : "bg-cyan-50 text-cyan-700"
              }`}>
                {
                  item.position
                }
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {
                    item.patient
                  }
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  {
                    item.arrival
                  }
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-600">
                  Aguardando
                </span>

                <p className="mt-2 text-xs font-bold text-slate-700">
                  {
                    item.time
                  }
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="mt-5 w-full text-sm font-semibold text-violet-600"
      >
        Ver fila completa →
      </button>
    </section>
  );
}