import {
  ClipboardList,
} from "lucide-react";

const statuses = [
  {
    label: "Concluídas",
    value: 80,
    percent: 64,
  },

  {
    label: "Pendentes",
    value: 25,
    percent: 20,
  },

  {
    label: "Aguardando assinatura",
    value: 15,
    percent: 12,
  },

  {
    label: "Em rascunho",
    value: 5,
    percent: 4,
  },
];

export function ProfissionalEvolucoesStatus() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <ClipboardList
          size={20}
          className="text-violet-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Evoluções por status
        </h2>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-[150px_1fr] sm:items-center">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[16px] border-emerald-500">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              125
            </p>

            <p className="text-xs text-slate-400">
              Total
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {statuses.map(
            (
              status
            ) => (
              <div
                key={
                  status.label
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    {
                      status.label
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {status.value} ({status.percent}%)
                  </span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width:
                        `${status.percent}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}