export function ProximosAtendimentos() {
  const atendimentos = [
    {
      paciente: "Carlos Henrique",
      horario: "13:30",
    },
    {
      paciente: "Patrícia Silva",
      horario: "15:00",
    },
    {
      paciente: "Lucas Gomes",
      horario: "16:20",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        Próximos Atendimentos
      </h2>

      <div className="space-y-4">
        {atendimentos.map((item) => (
          <div
            key={`${item.horario}-${item.paciente}`}
            className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-none"
          >
            <span className="font-medium text-slate-700">
              {item.paciente}
            </span>

            <span className="text-sm text-slate-500">
              {item.horario}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
