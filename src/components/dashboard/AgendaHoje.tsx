export function AgendaHoje() {
  const agenda = [
    {
      horario: "08:00",
      paciente: "Maria Oliveira",
      profissional: "Dra. Ana Paula",
    },
    {
      horario: "09:30",
      paciente: "João Carlos",
      profissional: "Dr. Pedro Lima",
    },
    {
      horario: "11:00",
      paciente: "Fernanda Souza",
      profissional: "Dra. Carla Menezes",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        Agenda de Hoje
      </h2>

      <div className="space-y-4">
        {agenda.map((item) => (
          <div
            key={`${item.horario}-${item.paciente}`}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
          >
            <div>
              <p className="font-medium text-slate-800">
                {item.paciente}
              </p>

              <p className="text-sm text-slate-500">
                {item.profissional}
              </p>
            </div>

            <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {item.horario}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}