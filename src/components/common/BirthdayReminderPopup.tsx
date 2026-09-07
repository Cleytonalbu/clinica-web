import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PartyPopper,
  Sparkles,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  patientWorksAtUnit,
} from "@/pages/Pacientes/patientUnitStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  getProfessionalDetailsById,
} from "@/pages/Profissionais/professionalDetailsStorage";

interface BirthdayPerson {
  id: number;
  name: string;

  type:
    | "Paciente"
    | "Profissional";

  birthDate: string;
  specialty?: string;
}

function parseBirthDate(
  value:
    string
) {
  if (
    !value
  ) {
    return null;
  }

  const iso =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (
    iso
  ) {
    return {
      month:
        Number(
          iso[2]
        ),

      day:
        Number(
          iso[3]
        ),
    };
  }

  const br =
    value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})/
    );

  if (
    br
  ) {
    return {
      month:
        Number(
          br[2]
        ),

      day:
        Number(
          br[1]
        ),
    };
  }

  return null;
}

function isBirthdayToday(
  birthDate:
    string,
  today:
    Date
) {
  const parsed =
    parseBirthDate(
      birthDate
    );

  if (
    !parsed
  ) {
    return false;
  }

  return (
    parsed.day ===
      today.getDate() &&
    parsed.month ===
      today.getMonth() + 1
  );
}

function getInitials(
  name:
    string
) {
  return name
    .split(
      " "
    )
    .filter(
      Boolean
    )
    .slice(
      0,
      2
    )
    .map(
      (
        part
      ) =>
        part[0]
    )
    .join("")
    .toUpperCase();
}

export function BirthdayReminderPopup() {
  const navigate =
    useNavigate();

  const {
    user,
  } =
    useAuth();

  const {
    activeUnitId,
  } =
    useUnit();

  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );

  const [
    storageKey,
    setStorageKey,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const profile =
    user?.profile;

  const enabled =
    profile ===
      "Gestor" ||
    profile ===
      "Profissional";

  const today =
    useMemo(
      () =>
        new Date(),
      []
    );

  const birthdayPeople =
    useMemo<
      BirthdayPerson[]
    >(
      () => {
        if (
          !enabled
        ) {
          return [];
        }

        const patients =
          getPatients()
            .filter(
              (
                patient
              ) =>
                patient.status !==
                  "Inativo" &&
                patientWorksAtUnit(
                  patient.id,
                  activeUnitId
                ) &&
                isBirthdayToday(
                  patient.nascimento,
                  today
                )
            )
            .map(
              (
                patient
              ) => ({
                id:
                  patient.id,

                name:
                  patient.nome,

                type:
                  "Paciente" as const,

                birthDate:
                  patient.nascimento,
              })
            );

        const professionals =
          getActiveProfessionals()
            .filter(
              (
                professional
              ) =>
                professionalWorksAtUnit(
                  professional.id,
                  activeUnitId
                )
            )
            .map(
              (
                professional
              ) => {
                const details =
                  getProfessionalDetailsById(
                    professional.id
                  );

                if (
                  !details?.birthDate ||
                  !isBirthdayToday(
                    details.birthDate,
                    today
                  )
                ) {
                  return null;
                }

                return {
                  id:
                    professional.id,

                  name:
                    professional.name,

                  type:
                    "Profissional" as const,

                  birthDate:
                    details.birthDate,

                  specialty:
                    professional.specialty,
                };
              }
            )
            .filter(
              (
                person
              ):
                person is
                  BirthdayPerson =>
                person !==
                null
            );

        return [
          ...patients,
          ...professionals,
        ].sort(
          (
            a,
            b
          ) =>
            a.name.localeCompare(
              b.name,
              "pt-BR"
            )
        );
      },
      [
        activeUnitId,
        enabled,
        today,
      ]
    );

  useEffect(
    () => {
      if (
        !enabled ||
        birthdayPeople.length ===
          0
      ) {
        return;
      }

      const dateKey =
        `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(
          2,
          "0"
        )}-${String(
          today.getDate()
        ).padStart(
          2,
          "0"
        )}`;

      const userKey =
        user?.id ??
        user?.professionalName ??
        user?.name ??
        profile ??
        "usuario";

      const key =
        `entre-afetos-birthday-reminder-v1:${userKey}:${activeUnitId}:${dateKey}`;

      if (
        localStorage.getItem(
          key
        )
      ) {
        return;
      }

      setStorageKey(
        key
      );

      const timeout =
        window.setTimeout(
          () =>
            setOpen(
              true
            ),
          650
        );

      return () =>
        window.clearTimeout(
          timeout
        );
    },
    [
      activeUnitId,
      birthdayPeople,
      enabled,
      profile,
      today,
      user,
    ]
  );

  function closePopup() {
    if (
      storageKey
    ) {
      localStorage.setItem(
        storageKey,
        "shown"
      );
    }

    setOpen(
      false
    );
  }

  function openPerson(
    person:
      BirthdayPerson
  ) {
    closePopup();

    if (
      person.type ===
      "Paciente"
    ) {
      navigate(
        `/pacientes/${person.id}`
      );

      return;
    }

    if (
      profile ===
      "Gestor"
    ) {
      navigate(
        `/profissionais/${person.id}`
      );
    }
  }

  if (
    !open ||
    birthdayPeople.length ===
      0
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[1px]">
      <style>{`
        @keyframes birthday-pop-in {
          0% {
            opacity: 0;
            transform: translateY(36px) scale(.88);
          }

          65% {
            opacity: 1;
            transform: translateY(-5px) scale(1.025);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes birthday-confetti-fall {
          0% {
            opacity: 0;
            transform: translateY(-55px) rotate(0deg);
          }

          15% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(330px) rotate(520deg);
          }
        }

        @keyframes birthday-sparkle {
          0%, 100% {
            transform: scale(.9) rotate(-8deg);
          }

          50% {
            transform: scale(1.14) rotate(8deg);
          }
        }

        .birthday-popup-card {
          animation: birthday-pop-in .55s cubic-bezier(.2,.85,.32,1.18) both;
        }

        .birthday-confetti {
          position: absolute;
          top: 0;
          width: 9px;
          height: 18px;
          border-radius: 4px;
          animation: birthday-confetti-fall 2.8s ease-in infinite;
        }

        .birthday-sparkle {
          animation: birthday-sparkle 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          ["8%", "#8b5cf6", "0s"],
          ["16%", "#f43f5e", ".25s"],
          ["24%", "#14b8a6", ".55s"],
          ["34%", "#f59e0b", ".1s"],
          ["43%", "#3b82f6", ".7s"],
          ["54%", "#ec4899", ".35s"],
          ["64%", "#22c55e", ".8s"],
          ["74%", "#a855f7", ".18s"],
          ["84%", "#06b6d4", ".62s"],
          ["92%", "#fb7185", ".42s"],
        ].map(
          (
            [
              left,
              color,
              delay,
            ]
          ) => (
            <span
              key={`${left}-${color}`}
              className="birthday-confetti"
              style={{
                left,
                background:
                  color,
                animationDelay:
                  delay,
              }}
            />
          )
        )}
      </div>

      <div className="birthday-popup-card relative w-full max-w-lg overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-[0_30px_90px_rgba(70,55,145,0.24)]">
        <button
          type="button"
          onClick={
            closePopup
          }
          className="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-400 transition hover:bg-white/80 hover:text-slate-700"
          aria-label="Fechar aviso de aniversário"
        >
          <X
            size={18}
          />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-rose-50 to-sky-100 px-7 pb-6 pt-7 text-center">
          <div className="birthday-sparkle mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-lg shadow-violet-100">
            <PartyPopper
              size={34}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Sparkles
              size={16}
              className="text-amber-500"
            />

            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-600">
              Temos aniversariante hoje!
            </p>

            <Sparkles
              size={16}
              className="text-amber-500"
            />
          </div>

          <h3 className="mt-2 text-2xl font-extrabold text-[#10235f]">
            Feliz aniversário! 🎂
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-600">
            {birthdayPeople.length ===
            1
              ? "Hoje é um dia especial para uma pessoa da clínica."
              : `Hoje é um dia especial para ${birthdayPeople.length} pessoas da clínica.`}
          </p>
        </div>

        <div className="space-y-2 p-6">
          {birthdayPeople.map(
            (
              person
            ) => (
              <button
                key={`${person.type}-${person.id}`}
                type="button"
                onClick={() =>
                  openPerson(
                    person
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">
                  {getInitials(
                    person.name
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-900">
                    {person.name}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {person.type}
                    {person.specialty
                      ? ` • ${person.specialty}`
                      : ""}
                  </p>
                </div>

                <span className="text-xl">
                  🎉
                </span>
              </button>
            )
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-center">
          <button
            type="button"
            onClick={
              closePopup
            }
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            Que dia especial! 🎈
          </button>
        </div>
      </div>
    </div>
  );
}
