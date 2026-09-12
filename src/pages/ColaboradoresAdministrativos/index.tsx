import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Search,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getActiveClinicUnits,
} from "@/pages/Configuracoes/clinicUnitStorage";

import {
  collaboratorWorksAtUnit,
  getCollaboratorUnitIds,
  setCollaboratorUnits,
} from "@/pages/Configuracoes/collaboratorUnitStorage";

import {
  createAdministrativeCollaborator,
  getAdministrativeCollaborators,
  setAdministrativeCollaboratorStatus,
} from "./collaboratorStorage";

import type {
  AdministrativeCollaborator,
  CollaboratorStatus,
  CollaboratorType,
} from "./collaboratorStorage";

const collaboratorTypes: CollaboratorType[] = [
  "Recepção",
  "Administrativo",
  "Serviços gerais",
  "Contabilidade",
  "Prestador",
  "Outro",
];

const emptyForm = {
  name: "",
  type: "Recepção" as CollaboratorType,
  role: "",
  document: "",
  phone: "",
  email: "",
  admissionDate: "",
  company: "",
  notes: "",
};

function statusClass(status: CollaboratorStatus) {
  return status === "Ativo"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
}

export default function ColaboradoresAdministrativos() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [collaborators, setCollaborators] = useState<
    AdministrativeCollaborator[]
  >([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Todos" | CollaboratorStatus>(
    "Todos",
  );
  const [type, setType] = useState<"Todos" | CollaboratorType>(
    "Todos",
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formUnitIds, setFormUnitIds] = useState<number[]>([activeUnitId]);
  const [unitEditorCollaborator, setUnitEditorCollaborator] = useState<
    AdministrativeCollaborator | null
  >(null);
  const [unitEditorIds, setUnitEditorIds] = useState<number[]>([]);

  const activeUnits = useMemo(
    () => getActiveClinicUnits(),
    [],
  );

  const load = () => {
    setCollaborators(
      getAdministrativeCollaborators().filter(
        (collaborator) =>
          collaboratorWorksAtUnit(
            collaborator.id,
            activeUnitId,
          ),
      ),
    );
  };

  useEffect(() => {
    load();

    const handleChange = () => load();
    window.addEventListener(
      "administrative-collaborators-changed",
      handleChange,
    );
    window.addEventListener(
      "collaborator-units-changed",
      handleChange,
    );

    return () => {
      window.removeEventListener(
        "administrative-collaborators-changed",
        handleChange,
      );
      window.removeEventListener(
        "collaborator-units-changed",
        handleChange,
      );
    };
  }, [
    activeUnitId,
  ]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return collaborators.filter((collaborator) => {
      const matchesSearch =
        !term ||
        collaborator.name.toLowerCase().includes(term) ||
        collaborator.role.toLowerCase().includes(term) ||
        collaborator.type.toLowerCase().includes(term) ||
        collaborator.email?.toLowerCase().includes(term) ||
        collaborator.company?.toLowerCase().includes(term);

      const matchesStatus =
        status === "Todos" || collaborator.status === status;

      const matchesType =
        type === "Todos" || collaborator.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [collaborators, search, status, type]);

  const totals = useMemo(
    () => ({
      total: collaborators.length,
      active: collaborators.filter((item) => item.status === "Ativo")
        .length,
      inactive: collaborators.filter(
        (item) => item.status === "Inativo",
      ).length,
      providers: collaborators.filter(
        (item) => item.type === "Prestador",
      ).length,
    }),
    [collaborators],
  );

  useEffect(() => {
    if (!showForm) {
      setFormUnitIds([activeUnitId]);
    }
  }, [activeUnitId, showForm]);

  function toggleFormUnit(unitId: number) {
    setFormUnitIds((current) =>
      current.includes(unitId)
        ? current.filter((id) => id !== unitId)
        : [...current, unitId],
    );
  }

  function toggleEditorUnit(unitId: number) {
    setUnitEditorIds((current) =>
      current.includes(unitId)
        ? current.filter((id) => id !== unitId)
        : [...current, unitId],
    );
  }

  function openUnitEditor(collaborator: AdministrativeCollaborator) {
    setUnitEditorCollaborator(collaborator);
    setUnitEditorIds(getCollaboratorUnitIds(collaborator.id));
  }

  function saveUnitEditor() {
    if (!unitEditorCollaborator) return;

    if (unitEditorIds.length === 0) {
      window.alert("Selecione pelo menos uma unidade para o colaborador.");
      return;
    }

    try {
      setCollaboratorUnits(
        unitEditorCollaborator.id,
        unitEditorIds,
      );
      setUnitEditorCollaborator(null);
      setUnitEditorIds([]);
      load();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar as unidades do colaborador.",
      );
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim() || !form.role.trim()) {
      window.alert("Informe o nome e a função do colaborador.");
      return;
    }

    if (formUnitIds.length === 0) {
      window.alert("Selecione pelo menos uma unidade para o colaborador.");
      return;
    }

    const collaborator = createAdministrativeCollaborator({
      unitId:
        activeUnitId,
      name: form.name.trim(),
      type: form.type,
      role: form.role.trim(),
      document: form.document.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      admissionDate: form.admissionDate,
      company: form.company.trim(),
      notes: form.notes.trim(),
      status: "Ativo",
    });

    setCollaboratorUnits(
      collaborator.id,
      formUnitIds,
    );

    setForm(emptyForm);
    setFormUnitIds([activeUnitId]);
    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Colaboradores administrativos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Controle de recepção, administrativo, serviços gerais,
            contabilidade e demais prestadores da clínica.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <UserPlus size={18} />
          Novo colaborador
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Cadastrados"
          value={totals.total}
          icon={Users}
        />
        <SummaryCard
          label="Ativos"
          value={totals.active}
          icon={UserCheck}
        />
        <SummaryCard
          label="Inativos"
          value={totals.inactive}
          icon={UserX}
        />
        <SummaryCard
          label="Prestadores"
          value={totals.providers}
          icon={BriefcaseBusiness}
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, função, tipo, e-mail ou empresa"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as "Todos" | CollaboratorStatus,
              )
            }
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "Todos" | CollaboratorType)
            }
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option>Todos</option>
            {collaboratorTypes.map((item) => (
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
                  "Colaborador",
                  "Tipo",
                  "Função",
                  "Contato",
                  "Admissão",
                  "Unidades",
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
              {filtered.map((collaborator) => (
                <tr key={collaborator.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {collaborator.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {collaborator.document || "Documento não informado"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                    {collaborator.type}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                    {collaborator.role}
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700">
                      {collaborator.phone || "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {collaborator.email || "—"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                    {collaborator.admissionDate
                      ? new Date(
                          `${collaborator.admissionDate}T12:00:00`,
                        ).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="flex flex-wrap gap-1.5">
                      {getCollaboratorUnitIds(collaborator.id).map((unitId) => {
                        const unit = activeUnits.find((item) => item.id === unitId);

                        return (
                          <span
                            key={unitId}
                            className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                          >
                            {unit?.name ?? `Unidade ${unitId}`}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                        collaborator.status,
                      )}`}
                    >
                      {collaborator.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openUnitEditor(collaborator)}
                        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100"
                      >
                        Unidades
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAdministrativeCollaboratorStatus(
                            collaborator.id,
                            collaborator.status === "Ativo"
                              ? "Inativo"
                              : "Ativo",
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {collaborator.status === "Ativo"
                          ? "Inativar"
                          : "Reativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Novo colaborador
                </h2>
                <p className="text-sm text-slate-500">
                  Cadastro administrativo sem acesso ao prontuário clínico.
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

            <form onSubmit={submit} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo *">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="Tipo *">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as CollaboratorType,
                      })
                    }
                    className="input-admin"
                  >
                    {collaboratorTypes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Função / Cargo *">
                  <input
                    required
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="CPF / CNPJ">
                  <input
                    value={form.document}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        document: event.target.value,
                      })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="Telefone">
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="E-mail">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="Data de admissão / início">
                  <input
                    type="date"
                    value={form.admissionDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        admissionDate: event.target.value,
                      })
                    }
                    className="input-admin"
                  />
                </Field>

                <Field label="Empresa / Prestador">
                  <input
                    value={form.company}
                    onChange={(event) =>
                      setForm({ ...form, company: event.target.value })
                    }
                    className="input-admin"
                  />
                </Field>
              </div>

              <Field label="Unidades de trabalho *">
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeUnits.map((unit) => (
                    <label
                      key={unit.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                        formUnitIds.includes(unit.id)
                          ? "border-violet-300 bg-violet-50 text-violet-800"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formUnitIds.includes(unit.id)}
                        onChange={() => toggleFormUnit(unit.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium">{unit.name}</span>
                        <span className="block text-xs opacity-70">
                          {unit.city || unit.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  O mesmo colaborador pode trabalhar em uma ou mais unidades sem duplicar o cadastro.
                </p>
              </Field>

              <Field label="Observações">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  className="input-admin resize-none"
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
                  Salvar colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {unitEditorCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Unidades do colaborador
                </h2>
                <p className="text-sm text-slate-500">
                  {unitEditorCollaborator.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUnitEditorCollaborator(null);
                  setUnitEditorIds([]);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-2 sm:grid-cols-2">
                {activeUnits.map((unit) => (
                  <label
                    key={unit.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
                      unitEditorIds.includes(unit.id)
                        ? "border-violet-300 bg-violet-50 text-violet-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={unitEditorIds.includes(unit.id)}
                      onChange={() => toggleEditorUnit(unit.id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>
                      <span className="block font-medium">{unit.name}</span>
                      <span className="block text-xs opacity-70">
                        {unit.city || unit.code}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setUnitEditorCollaborator(null);
                    setUnitEditorIds([]);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveUnitEditor}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Salvar unidades
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-admin {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          color: rgb(30 41 59);
          background: white;
        }
        .input-admin:focus {
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
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
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
