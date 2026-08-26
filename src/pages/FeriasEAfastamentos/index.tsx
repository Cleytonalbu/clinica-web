import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import type {
  AdministrativeCollaborator,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import {
  cancelAdministrativeLeave,
  createAdministrativeLeave,
  getAdministrativeLeaves,
} from "./administrativeLeaveStorage";

import type {
  AdministrativeLeave,
  AdministrativeLeaveStatus,
  AdministrativeLeaveType,
} from "./administrativeLeaveStorage";

const leaveTypes: AdministrativeLeaveType[] = [
  "Férias",
  "Atestado",
  "Licença",
  "Folga",
  "Afastamento",
  "Outro",
];

const emptyForm = {
  collaboratorId: "",
  type: "Férias" as AdministrativeLeaveType,
  startDate: "",
  endDate: "",
  reason: "",
  notes: "",
};

function dateOnly(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value?: string) {
  if (!value) return "—";

  return dateOnly(value).toLocaleDateString(
    "pt-BR",
  );
}

function calculateStatus(
  leave: AdministrativeLeave,
): AdministrativeLeaveStatus {
  if (leave.status === "Cancelado") {
    return "Cancelado";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = dateOnly(leave.startDate);
  const end = dateOnly(leave.endDate);

  if (today.getTime() < start.getTime()) {
    return "Programado";
  }

  if (
    today.getTime() >= start.getTime() &&
    today.getTime() <= end.getTime()
  ) {
    return "Em andamento";
  }

  return "Concluído";
}

function statusClass(status: AdministrativeLeaveStatus) {
  if (status === "Em andamento") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "Programado") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Concluído") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = dateOnly(value);

  return Math.ceil(
    (date.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

export default function FeriasEAfastamentos() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [leaves, setLeaves] = useState<
    AdministrativeLeave[]
  >([]);

  const [collaborators, setCollaborators] = useState<
    AdministrativeCollaborator[]
  >([]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<
    "Todos" | AdministrativeLeaveType
  >("Todos");

  const [status, setStatus] = useState<
    "Todos" | AdministrativeLeaveStatus
  >("Todos");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  function load() {
    setLeaves(
      getAdministrativeLeaves().filter(
        (leave) =>
          leave.unitId ===
          activeUnitId,
      ),
    );

    setCollaborators(
      getAdministrativeCollaborators().filter(
        (item) =>
          item.status === "Ativo" &&
          item.unitId ===
            activeUnitId,
      ),
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener(
      "administrative-leaves-changed",
      refresh,
    );

    window.addEventListener(
      "administrative-collaborators-changed",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "administrative-leaves-changed",
        refresh,
      );

      window.removeEventListener(
        "administrative-collaborators-changed",
        refresh,
      );
    };
  }, [
    activeUnitId,
  ]);

  const filtered = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return leaves.filter((leave) => {
      const currentStatus =
        calculateStatus(leave);

      const matchesSearch =
        !term ||
        leave.collaboratorName
          .toLowerCase()
          .includes(term) ||
        leave.collaboratorRole
          .toLowerCase()
          .includes(term) ||
        leave.type
          .toLowerCase()
          .includes(term) ||
        leave.reason
          ?.toLowerCase()
          .includes(term);

      const matchesType =
        type === "Todos" ||
        leave.type === type;

      const matchesStatus =
        status === "Todos" ||
        currentStatus === status;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [leaves, search, type, status]);

  const summary = useMemo(() => {
    const active = leaves.filter(
      (leave) =>
        calculateStatus(leave) ===
        "Em andamento",
    );

    const scheduled = leaves.filter(
      (leave) =>
        calculateStatus(leave) ===
        "Programado",
    );

    const returningSoon = active.filter(
      (leave) => {
        const days = daysUntil(
          leave.endDate,
        );

        return days >= 0 && days <= 7;
      },
    );

    const vacations = leaves.filter(
      (leave) =>
        leave.type === "Férias" &&
        calculateStatus(leave) !==
          "Cancelado",
    );

    return {
      active: active.length,
      scheduled: scheduled.length,
      returningSoon:
        returningSoon.length,
      vacations: vacations.length,
    };
  }, [leaves]);

  function submit(event: FormEvent) {
    event.preventDefault();

    const collaborator =
      collaborators.find(
        (item) =>
          item.id ===
          form.collaboratorId,
      );

    if (!collaborator) {
      window.alert(
        "Selecione um colaborador ativo.",
      );
      return;
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      window.alert(
        "Informe a data inicial e a data final.",
      );
      return;
    }

    if (
      dateOnly(form.endDate).getTime() <
      dateOnly(form.startDate).getTime()
    ) {
      window.alert(
        "A data final não pode ser anterior à data inicial.",
      );
      return;
    }

    createAdministrativeLeave({
      unitId:
        activeUnitId,
      collaboratorId:
        collaborator.id,
      collaboratorName:
        collaborator.name,
      collaboratorRole:
        collaborator.role,
      type: form.type,
      startDate:
        form.startDate,
      endDate:
        form.endDate,
      reason:
        form.reason.trim(),
      notes:
        form.notes.trim(),
      status:
        "Programado",
    });

    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Férias e afastamentos
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Controle administrativo de férias,
              atestados, licenças, folgas e
              afastamentos dos colaboradores.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo afastamento
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Afastados agora"
            value={summary.active}
            icon={CalendarClock}
          />

          <SummaryCard
            label="Programados"
            value={summary.scheduled}
            icon={CalendarDays}
          />

          <SummaryCard
            label="Retorno em até 7 dias"
            value={summary.returningSoon}
            icon={CalendarCheck2}
          />

          <SummaryCard
            label="Registros de férias"
            value={summary.vacations}
            icon={CalendarRange}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por colaborador, função, tipo ou motivo"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as typeof type,
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todos</option>

              {leaveTypes.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                ),
              )}
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as typeof status,
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todos</option>
              <option>Programado</option>
              <option>
                Em andamento
              </option>
              <option>Concluído</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Colaborador",
                    "Tipo",
                    "Período",
                    "Motivo",
                    "Situação",
                    "Ação",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((leave) => {
                  const currentStatus =
                    calculateStatus(
                      leave,
                    );

                  return (
                    <tr
                      key={leave.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            leave.collaboratorName
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {
                            leave.collaboratorRole
                          }
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {leave.type}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="text-sm text-slate-700">
                          {formatDate(
                            leave.startDate,
                          )}
                        </div>

                        <div className="text-xs text-slate-500">
                          até{" "}
                          {formatDate(
                            leave.endDate,
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[280px] text-sm text-slate-700">
                          {leave.reason ||
                            "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                            currentStatus,
                          )}`}
                        >
                          {
                            currentStatus
                          }
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {currentStatus ===
                        "Programado" ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Deseja cancelar este registro?",
                                )
                              ) {
                                cancelAdministrativeLeave(
                                  leave.id,
                                );
                              }
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Novo afastamento
                  </h2>

                  <p className="text-sm text-slate-500">
                    Registre férias,
                    licença, atestado ou
                    outro afastamento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={submit}
                className="space-y-5 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Colaborador *">
                    <select
                      required
                      value={
                        form.collaboratorId
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          collaboratorId:
                            event.target
                              .value,
                        })
                      }
                      className="input-leave"
                    >
                      <option value="">
                        Selecione
                      </option>

                      {collaborators.map(
                        (collaborator) => (
                          <option
                            key={
                              collaborator.id
                            }
                            value={
                              collaborator.id
                            }
                          >
                            {
                              collaborator.name
                            }{" "}
                            —{" "}
                            {
                              collaborator.role
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field label="Tipo *">
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          type: event
                            .target
                            .value as AdministrativeLeaveType,
                        })
                      }
                      className="input-leave"
                    >
                      {leaveTypes.map(
                        (item) => (
                          <option
                            key={item}
                          >
                            {item}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field label="Data inicial *">
                    <input
                      required
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          startDate:
                            event.target
                              .value,
                        })
                      }
                      className="input-leave"
                    />
                  </Field>

                  <Field label="Data final *">
                    <input
                      required
                      type="date"
                      value={
                        form.endDate
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          endDate:
                            event.target
                              .value,
                        })
                      }
                      className="input-leave"
                    />
                  </Field>
                </div>

                <Field label="Motivo">
                  <input
                    value={form.reason}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        reason:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Ex.: férias anuais, atestado médico..."
                    className="input-leave"
                  />
                </Field>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes:
                          event.target
                            .value,
                      })
                    }
                    className="input-leave resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Salvar registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-leave {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-leave:focus {
            border-color: rgb(148 163 184);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}