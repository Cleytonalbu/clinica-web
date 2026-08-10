const reasons = [
  {
    label: "Problemas de saúde",
    value: 8,
    percent: 44,
  },

  {
    label: "Compromissos pessoais",
    value: 5,
    percent: 28,
  },

  {
    label: "Esquecimento",
    value: 3,
    percent: 17,
  },

  {
    label: "Outros",
    value: 2,
    percent: 11,
  },
];

export function FaltasPorMotivo() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Faltas por motivo
      </h2>

      <div className="mt-6 space-y-5">
        {reasons.map(
          (
            reason
          ) => (
            <div
              key={
                reason.label
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  {
                    reason.label
                  }
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {reason.value} ({reason.percent}%)
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${reason.percent}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}