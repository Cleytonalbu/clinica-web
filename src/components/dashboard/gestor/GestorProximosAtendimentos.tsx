import {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  listarAgendamentos,
  paraStoredAppointment,
  type RealAppointment,
} from "@/services/agenda";

import {
  useUnit,
} from "@/providers/UnitContext";

const appointmentStyles = [
  { avatar: "bg-[#eeeaff] text-[#6847f5]", time: "text-[#6847f5]" },
  { avatar: "bg-[#eaf7ff] text-[#2b9bd8]", time: "text-[#2b9bd8]" },
  { avatar: "bg-[#eafbf6] text-[#27ae83]", time: "text-[#27ae83]" },
  { avatar: "bg-[#fff5df] text-[#e7a229]", time: "text-[#e0a02d]" },
];

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function GestorProximosAtendimentos() {
  const navigate =
    useNavigate();

  const { activeUnitId } = useUnit();

  const [appointments, setAppointments] = useState<RealAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    listarAgendamentos({ data: hojeISO(), porPagina: 50 })
      .then((resposta) => {
        if (cancelado) return;
        const agora = new Date();
        const proximos = resposta.dados
          .map((a) => paraStoredAppointment(a, activeUnitId))
          .filter((a) =>
            a.status !== "Cancelado" &&
            a.status !== "Faltou" &&
            new Date(`${a.date}T${a.time}`) >= agora
          )
          .slice(0, 4);
        setAppointments(proximos);
      })
      .catch(() => {
        if (cancelado) return;
        setAppointments([]);
      })
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [activeUnitId]);

  return (
    <section
      className="
        rounded-2xl
        border
        border-[#eceef6]
        bg-white
        p-6
        shadow-[0_4px_16px_rgba(51,65,120,0.04)]
      "
    >
      {/* CABEÇALHO */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold text-[#10235f]">
            Próximos atendimentos
          </h2>

          <p className="mt-1 text-xs font-medium text-[#8a95b4]">
            Agenda de hoje.
          </p>
        </div>

        <span
          className="
            rounded-lg
            bg-[#f0edff]
            px-3
            py-1.5
            text-[10px]
            font-bold
            text-[#6743ef]
          "
        >
          Hoje
        </span>
      </div>

      {/* LISTA */}

      {loading ? (
        <p className="mt-5 text-sm text-[#9aa3bd]">Carregando…</p>
      ) : appointments.length === 0 ? (
        <p className="mt-5 text-sm text-[#9aa3bd]">
          Nenhum atendimento restante para hoje.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          {appointments.map(
            (
              appointment,
              index
            ) => {
              const style =
                appointmentStyles[
                  index %
                    appointmentStyles.length
                ];

              return (
                <div
                  key={
                    appointment.id
                  }
                  className="
                    rounded-xl
                    border
                    border-[#f0f1f6]
                    px-3.5
                    py-3
                    transition
                    duration-200
                    hover:border-[#ded9ff]
                    hover:bg-[#fbfaff]
                  "
                >
                  <div className="flex items-center gap-3">
                    {/* ÍCONE */}

                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${style.avatar}
                      `}
                    >
                      <Clock3
                        size={16}
                      />
                    </div>

                    {/* DADOS */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-extrabold text-[#263765]">
                          {
                            appointment.patient
                          }
                        </p>

                        <span
                          className={`
                            shrink-0
                            text-xs
                            font-extrabold
                            ${style.time}
                          `}
                        >
                          {
                            appointment.time
                          }
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[10px] font-medium text-[#7d89a8]">
                        {
                          appointment.professional
                        }
                      </p>

                      <p className="mt-0.5 truncate text-[9px] font-semibold text-[#a0a8be]">
                        {
                          appointment.specialty
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* VER AGENDA */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/agenda"
          )
        }
        className="
          mt-5
          w-full
          rounded-xl
          border
          border-[#e7e8f2]
          bg-white
          py-2.5
          text-xs
          font-bold
          text-[#6743ef]
          transition
          hover:border-[#d8d2ff]
          hover:bg-[#faf9ff]
        "
      >
        Ver agenda completa
      </button>
    </section>
  );
}
