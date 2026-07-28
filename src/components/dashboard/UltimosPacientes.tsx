const pacientes = [
  "Maria Oliveira",
  "João Pedro",
  "Carlos Henrique",
  "Fernanda Souza",
  "Patrícia Lima",
];

export function UltimosPacientes() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        Últimos Pacientes
      </h2>

      <div className="space-y-3">
        {pacientes.map((paciente) => (
          <div
            key={paciente}
            className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
          >
            <span className="font-medium text-slate-700">
              {paciente}
            </span>

            <span className="text-sm text-emerald-600">
              Ativo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}