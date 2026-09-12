import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CakeSlice,
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
  daysUntil: number;
}

function getInitials(
  name: string
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

function parseBirthDate(
  value:
    string
) {
  if (
    !value
  ) {
    return null;
  }

  const isoMatch =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (
    isoMatch
  ) {
    return {
      month:
        Number(
          isoMatch[2]
        ),
      day:
        Number(
          isoMatch[3]
        ),
    };
  }

  const brMatch =
    value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})/
    );

  if (
    brMatch
  ) {
    return {
      month:
        Number(
          brMatch[2]
        ),
      day:
        Number(
          brMatch[1]
        ),
    };
  }

  return null;
}

function getDaysUntilBirthday(
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
    return null;
  }

  const current =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  let birthday =
    new Date(
      today.getFullYear(),
      parsed.month - 1,
      parsed.day
    );

  if (
    birthday <
    current
  ) {
    birthday =
      new Date(
        today.getFullYear() + 1,
        parsed.month - 1,
        parsed.day
      );
  }

  const difference =
    birthday.getTime() -
    current.getTime();

  return Math.round(
    difference /
    86400000
  );
}

function formatBirthdayLabel(
  person:
    BirthdayPerson
) {
  if (
    person.daysUntil ===
    0
  ) {
    return "Hoje 🎉";
  }

  if (
    person.daysUntil ===
    1
  ) {
    return "Amanhã";
  }

  const parsed =
    parseBirthDate(
      person.birthDate
    );

  if (
    !parsed
  ) {
    return "";
  }

  return `${String(
    parsed.day
  ).padStart(
    2,
    "0"
  )}/${String(
    parsed.month
  ).padStart(
    2,
    "0"
  )}`;
}

export function RecepcaoPacientesRecentes() {
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
    birthdayPopupOpen,
    setBirthdayPopupOpen,
  ] =
    useState(
      false
    );

  const [
    birthdayPopupStorageKey,
    setBirthdayPopupStorageKey,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const today =
    useMemo(
      () =>
        new Date(),
      []
    );

  const birthdays =
    useMemo<
      BirthdayPerson[]
    >(
      () => {
        const patientBirthdays =
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
                !!patient.nascimento
            )
            .flatMap(
              (
                patient
              ) => {
                const daysUntil =
                  getDaysUntilBirthday(
                    patient.nascimento,
                    today
                  );

                if (
                  daysUntil ===
                  null
                ) {
                  return [];
                }

                return [{
                  id:
                    patient.id,

                  name:
                    patient.nome,

                  type:
                    "Paciente" as const,

                  birthDate:
                    patient.nascimento,

                  daysUntil,
                }];
              }
            );

        const professionalBirthdays =
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
            .flatMap(
              (
                professional
              ) => {
                const details =
                  getProfessionalDetailsById(
                    professional.id
                  );

                if (
                  !details?.birthDate
                ) {
                  return [];
                }

                const daysUntil =
                  getDaysUntilBirthday(
                    details.birthDate,
                    today
                  );

                if (
                  daysUntil ===
                  null
                ) {
                  return [];
                }

                return [{
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

                  daysUntil,
                }];
              }
            );

        return [
          ...patientBirthdays,
          ...professionalBirthdays,
        ]
          .sort(
            (
              a,
              b
            ) => {
              if (
                a.daysUntil !==
                b.daysUntil
              ) {
                return (
                  a.daysUntil -
                  b.daysUntil
                );
              }

              return a.name.localeCompare(
                b.name,
                "pt-BR"
              );
            }
          );
      },
      [
        activeUnitId,
        today,
      ]
    );

  const todayBirthdays =
    useMemo(
      () =>
        birthdays.filter(
          (
            person
          ) =>
            person.daysUntil ===
            0
        ),
      [
        birthdays,
      ]
    );

  const visibleBirthdays =
    birthdays.slice(
      0,
      5
    );

  useEffect(
    () => {
      if (
        todayBirthdays.length ===
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
        user?.name ??
        user?.profile ??
        "usuario";

      const storageKey =
        `entre-afetos-birthday-popup-v2:${userKey}:${activeUnitId}:${dateKey}`;

      if (
        localStorage.getItem(
          storageKey
        )
      ) {
        return;
      }

      setBirthdayPopupStorageKey(
        storageKey
      );

      const timeout =
        window.setTimeout(
          () =>
            setBirthdayPopupOpen(
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
      today,
      todayBirthdays,
      user,
    ]
  );

  function closeBirthdayPopup() {
    if (
      birthdayPopupStorageKey
    ) {
      localStorage.setItem(
        birthdayPopupStorageKey,
        "shown"
      );
    }

    setBirthdayPopupOpen(
      false
    );
  }

  function handleOpenPerson(
    person:
      BirthdayPerson
  ) {
    if (
      person.type ===
      "Paciente"
    ) {
      navigate(
        `/pacientes/${person.id}`
      );

      return;
    }

    navigate(
      `/profissionais/${person.id}`
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CakeSlice
                size={19}
                className="text-violet-600"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Aniversariantes
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Pacientes e profissionais da unidade.
            </p>
          </div>

          {todayBirthdays.length >
            0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-600">
              <PartyPopper
                size={13}
              />

              {todayBirthdays.length} hoje
            </span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
          {visibleBirthdays.length ===
          0 ? (
            <div className="col-span-full flex min-h-[104px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center">
              <p className="text-xs font-semibold text-slate-400">
                Nenhuma data de aniversário cadastrada nesta unidade.
              </p>
            </div>
          ) : (
            visibleBirthdays.map(
              (
                person,
                index
              ) => {
                const avatarClasses = [
                  "bg-violet-100 text-violet-700",
                  "bg-emerald-100 text-emerald-700",
                  "bg-amber-100 text-amber-700",
                  "bg-rose-100 text-rose-700",
                  "bg-sky-100 text-sky-700",
                ];

                return (
                  <button
                    key={`${person.type}-${person.id}`}
                    type="button"
                    onClick={() =>
                      handleOpenPerson(
                        person
                      )
                    }
                    className="group text-center"
                  >
                    <div className="relative mx-auto w-fit">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition group-hover:-translate-y-0.5 group-hover:shadow-md ${
                          avatarClasses[
                            index %
                            avatarClasses.length
                          ]
                        }`}
                      >
                        {getInitials(
                          person.name
                        )}
                      </div>

                      {person.daysUntil ===
                        0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white shadow-sm">
                          🎂
                        </span>
                      )}
                    </div>

                    <p className="mt-3 truncate text-xs font-bold text-slate-800">
                      {person.name}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-violet-600">
                      {formatBirthdayLabel(
                        person
                      )}
                    </p>

                    <p className="mt-0.5 truncate text-[9px] text-slate-400">
                      {person.type}
                      {person.specialty
                        ? ` • ${person.specialty}`
                        : ""}
                    </p>
                  </button>
                );
              }
            )
          )}
        </div>
      </section>

      {birthdayPopupOpen &&
        todayBirthdays.length >
          0 && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[1px]">
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
                closeBirthdayPopup
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
                Hoje é um dia especial para{" "}
                {todayBirthdays.length ===
                1
                  ? "uma pessoa da clínica."
                  : `${todayBirthdays.length} pessoas da clínica.`}
              </p>
            </div>

            <div className="space-y-2 p-6">
              {todayBirthdays.map(
                (
                  person
                ) => (
                  <button
                    key={`popup-${person.type}-${person.id}`}
                    type="button"
                    onClick={() => {
                      closeBirthdayPopup();

                      handleOpenPerson(
                        person
                      );
                    }}
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
                  closeBirthdayPopup
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
              >
                Que dia especial! 🎈
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
