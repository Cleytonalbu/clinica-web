import {
  Clock3,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

interface Appointment {
  id: number;
  time: string;
  patient: string;
  professional: string;
  specialty: string;
}

const appointments: Appointment[] = [
  {
    id: 1,
    time: "08:00",
    patient: "Ana Clara",
    professional: "Dra. Ana Paula",
    specialty: "Psicologia",
  },

  {
    id: 2,
    time: "09:00",
    patient: "João Miguel",
    professional: "Dra. Camila Soares",
    specialty: "Fonoaudiologia",
  },

  {
    id: 3,
    time: "10:00",
    patient: "Beatriz Lima",
    professional: "Dra. Larissa Lima",
    specialty: "Terapia Ocupacional",
  },

  {
    id: 4,
    time: "11:00",
    patient: "Lucas Gabriel",
    professional: "Dr. Rafael Costa",
    specialty: "Fisioterapia",
  },
];

const appointmentStyles = [
  {
    avatar:
      "bg-[#eeeaff] text-[#6847f5]",
    time:
      "text-[#6847f5]",
  },

  {
    avatar:
      "bg-[#eaf7ff] text-[#2b9bd8]",
    time:
      "text-[#2b9bd8]",
  },

  {
    avatar:
      "bg-[#eafbf6] text-[#27ae83]",
    time:
      "text-[#27ae83]",
  },

  {
    avatar:
      "bg-[#fff5df] text-[#e7a229]",
    time:
      "text-[#e0a02d]",
  },
];

export function GestorProximosAtendimentos() {
  const navigate =
    useNavigate();

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