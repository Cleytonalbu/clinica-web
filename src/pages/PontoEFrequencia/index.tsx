import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlarmClock,
  CalendarCheck2,
  Clock3,
  Plus,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import type {
  AdministrativeCollaborator,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import {
  createAttendanceRecord,
  getAttendanceRecords,
} from "./attendanceStorage";

import type {
  AttendanceRecord,
  AttendanceStatus,
} from "./attendanceStorage";

const statuses: AttendanceStatus[] = [
  "Presente",
  "Atraso",
  "Falta",
  "Justificado",
];

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function statusClass(status: AttendanceStatus) {
  if (status === "Presente") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Atraso") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Falta") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

const emptyForm = {
  collaboratorId: "",
  date: today(),
  entryTime: "",
  exitTime: "",
  status: "Presente" as AttendanceStatus,
  justification: "",
  notes: "",
};

export default function PontoEFrequencia() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [collaborators, setCollaborators] = useState<
    AdministrativeCollaborator[]
  >([]);

  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Todos" | AttendanceStatus>("Todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setRecords(getAttendanceRecords());

    setCollaborators(
      getAdministrativeCollaborators().filter(
        (item) => item.status === "Ativo",
      ),
    );
  }

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener(
      "administrative-attendance-changed",
      refresh,
    );

    window.addEventListener(
      "administrative-collaborators-changed",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "administrative-attendance-changed",
        refresh,
      );

      window.removeEventListener(
        "administrative-collaborators-changed",
        refresh,
      );
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesMonth = !month || record.date.startsWith(month);

      const matchesStatus =
        status === "Todos" || record.status === status;

      const matchesSearch =
        !term ||
        record.collaboratorName.toLowerCase().includes(term) ||
        record.collaboratorRole.toLowerCase().includes(term);

      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [records, month, search, status]);

  const summary = useMemo(() => {
    const monthRecords = records.filter(
      (record) => !month || record.date.startsWith(month),
    );

    return {
      present: monthRecords.filter(
        (record) => record.status === "Presente",
      ).length,
      late: monthRecords.filter(
        (record) => record.status === "Atraso",
      ).length,
      absent: monthRecords.filter(
        (record) => record.status === "Falta",
      ).length,
      justified: monthRecords.filter(
        (record) => record.status === "Justificado",
      ).length,
    };
  }, [records, month]);

  function submit(event: FormEvent) {
    event.preventDefault();

    const collaborator = collaborators.find(
      (item) => item.id === form.collaboratorId,
    );

    if (!collaborator) {
      window.alert("Selecione um colaborador ativo.");
      return;
    }

    if (!form.date) {
      window.alert("Informe a data.");
      return;
    }

    createAttendanceRecord({
      collaboratorId: collaborator.id,
      collaboratorName: collaborator.name,
      collaboratorRole: collaborator.role,
      date: form.date,
      entryTime: form.entryTime,
      exitTime: form.exitTime,
      status: form.status,
      justification: form.justification.trim(),
      notes: form.notes.trim(),
    });

    setForm({
      ...emptyForm,
      date: today(),
    });

    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Ponto e frequência
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Controle administrativo de presença, atrasos,
              faltas e justificativas dos colaboradores.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Novo registro
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Presenças"
            value={summary.present}
            icon={UserCheck}
          />

          <SummaryCard
            label="Atrasos"
            value={summary.late}
            icon={AlarmClock}
          />

          <SummaryCard
            label="Faltas"
            value={summary.absent}
            icon={UserX}
          />

          <SummaryCard
            label="Justificados"
            value={summary.justified}
            icon={CalendarCheck2}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por colaborador ou função"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as typeof status)
              }
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>Todos</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Data",
                    "Colaborador",
                    "Entrada",
                    "Saída",
                    "Situação",
                    "Justificativa",
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
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {formatDate(record.date)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {record.collaboratorName}
                      </div>

                      <div className="text-xs text-slate-500">
                        {record.collaboratorRole}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {record.entryTime || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                      {record.exitTime || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {record.justification || "—"}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
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
                    Novo registro de frequência
                  </h2>

                  <p className="text-sm text-slate-500">
                    Informe presença, atraso, falta ou justificativa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                      value={form.collaboratorId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          collaboratorId: event.target.value,
                        })
                      }
                      className="input-attendance"
                    >
                      <option value="">Selecione</option>

                      {collaborators.map((collaborator) => (
                        <option
                          key={collaborator.id}
                          value={collaborator.id}
                        >
                          {collaborator.name} — {collaborator.role}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Data *">
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          date: event.target.value,
                        })
                      }
                      className="input-attendance"
                    />
                  </Field>

                  <Field label="Situação *">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status:
                            event.target.value as AttendanceStatus,
                        })
                      }
                      className="input-attendance"
                    >
                      {statuses.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Entrada">
                      <input
                        type="time"
                        value={form.entryTime}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            entryTime: event.target.value,
                          })
                        }
                        className="input-attendance"
                      />
                    </Field>

                    <Field label="Saída">
                      <input
                        type="time"
                        value={form.exitTime}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            exitTime: event.target.value,
                          })
                        }
                        className="input-attendance"
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Justificativa">
                  <input
                    value={form.justification}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        justification: event.target.value,
                      })
                    }
                    placeholder="Ex.: atestado entregue, atraso no transporte..."
                    className="input-attendance"
                  />
                </Field>

                <Field label="Observações">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    className="input-attendance resize-none"
                  />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
          .input-attendance {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }

          .input-attendance:focus {
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
  icon: typeof Clock3;
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