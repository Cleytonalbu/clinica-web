interface RecentPatient {
  id: number;
  name: string;
  time: string;
  initials: string;
}

const patients: RecentPatient[] = [
  {
    id: 1,
    name: "João Miguel",
    time: "Hoje, 07:45",
    initials: "JM",
  },

  {
    id: 2,
    name: "Ana Clara",
    time: "Hoje, 08:30",
    initials: "AC",
  },

  {
    id: 3,
    name: "Pedro Henrique",
    time: "Hoje, 08:40",
    initials: "PH",
  },

  {
    id: 4,
    name: "Maria Eduarda",
    time: "Ontem, 16:20",
    initials: "ME",
  },

  {
    id: 5,
    name: "Lucas Gabriel",
    time: "Ontem, 15:10",
    initials: "LG",
  },
];

export function RecepcaoPacientesRecentes() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pacientes recentes
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Acessados recentemente.
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-indigo-600"
        >
          Ver todos
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
        {patients.map(
          (
            patient
          ) => (
            <button
              key={
                patient.id
              }
              type="button"
              className="text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {
                  patient.initials
                }
              </div>

              <p className="mt-3 truncate text-xs font-bold text-slate-800">
                {
                  patient.name
                }
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {
                  patient.time
                }
              </p>
            </button>
          )
        )}
      </div>
    </section>
  );
}