import {
  useNavigate,
} from "react-router-dom";

interface Consultation {
  id: number;
  time: string;
  patient: string;
  specialty: string;
  status:
    | "Confirmado"
    | "Aguardando"
    | "Pendente";
}

const consultations: Consultation[] = [
  {
    id: 1,
    time: "09:00",
    patient: "Ana Clara Rodrigues",
    specialty: "Psicologia",
    status: "Confirmado",
  },

  {
    id: 2,
    time: "10:00",
    patient: "João Miguel Silva",
    specialty: "Psicologia",
    status: "Aguardando",
  },

  {
    id: 3,
    time: "11:00",
    patient: "Maria Eduarda Lima",
    specialty: "Psicologia",
    status: "Confirmado",
  },

  {
    id: 4,
    time: "14:00",
    patient: "Pedro Henrique",
    specialty: "Psicologia",
    status: "Pendente",
  },

  {
    id: 5,
    time: "16:00",
    patient: "Lucas Gabriel",
    specialty: "Psicologia",
    status: "Confirmado",
  },
];

export function ProfissionalProximasConsultas() {
  const navigate =
    useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Próximas consultas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Seus próximos atendimentos de hoje.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/agenda"
            )
          }
          className="text-sm font-semibold text-indigo-600"
        >
          Ver agenda
        </button>
      </div>

      <div>
        {consultations.map(
          (
            consultation
          ) => (
            <div
              key={
                consultation.id
              }
              className="grid grid-cols-[65px_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
            >
              <span className="text-sm font-bold text-slate-900">
                {
                  consultation.time
                }
              </span>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {
                    consultation.patient
                  }
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    consultation.specialty
                  }
                </p>
              </div>

              <StatusBadge
                status={
                  consultation.status
                }
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status:
    Consultation["status"];
}) {
  const style =
    status ===
    "Confirmado"
      ? "bg-emerald-50 text-emerald-600"
      : status ===
        "Aguardando"
      ? "bg-sky-50 text-sky-600"
      : "bg-orange-50 text-orange-600";

  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      {
        status
      }
    </span>
  );
}