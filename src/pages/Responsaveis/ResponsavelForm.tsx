import {
  ArrowLeft,
  Check,
  FileText,
  Link2,
  Save,
  Smartphone,
  Trash2,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

import {
  getResponsibleById,
  getResponsiblePatientLinks,
  linkResponsibleToPatient,
  saveResponsible,
  unlinkResponsibleFromPatient,
  type ResponsiblePatientLink,
  type ResponsibleRelationship,
} from "@/pages/Pacientes/responsiblePatientStorage";

const RELATIONSHIPS: ResponsibleRelationship[] = [
  "Mãe",
  "Pai",
  "Avó",
  "Avô",
  "Tia",
  "Tio",
  "Irmã",
  "Irmão",
  "Responsável legal",
  "Outro",
];

export default function ResponsavelForm() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const responsibleId =
    Number(id);

  const isEditing =
    Number.isFinite(
      responsibleId
    ) && responsibleId > 0;

  const existingResponsible =
    isEditing
      ? getResponsibleById(
          responsibleId
        )
      : null;

  const [nome, setNome] =
    useState(
      existingResponsible?.nome ??
        ""
    );

  const [cpf, setCpf] =
    useState(
      existingResponsible?.cpf ??
        ""
    );

  const [telefone, setTelefone] =
    useState(
      existingResponsible?.telefone ??
        ""
    );

  const [email, setEmail] =
    useState(
      existingResponsible?.email ??
        ""
    );

  const [ativo, setAtivo] =
    useState(
      existingResponsible?.ativo ??
        true
    );

  const [message, setMessage] =
    useState("");

  const [selectedPatientId, setSelectedPatientId] =
    useState("");

  const [newRelationship, setNewRelationship] =
    useState<ResponsibleRelationship>(
      "Responsável legal"
    );

  const [refreshKey, setRefreshKey] =
    useState(0);

  const patients =
    getPatients();

  const links =
    useMemo(
      () =>
        isEditing
          ? getResponsiblePatientLinks().filter(
              (link) =>
                link.responsibleId ===
                  responsibleId &&
                link.ativo
            )
          : [],
      [
        isEditing,
        refreshKey,
        responsibleId,
      ]
    );

  const linkedPatientIds =
    new Set(
      links.map(
        (link) => link.patientId
      )
    );

  const availablePatients =
    patients.filter(
      (patient) =>
        !linkedPatientIds.has(
          patient.id
        )
    );

  function handleSaveResponsible() {
    if (!nome.trim()) {
      setMessage(
        "Informe o nome do responsável."
      );
      return;
    }

    const saved =
      saveResponsible({
        id:
          existingResponsible?.id,
        nome,
        cpf,
        telefone,
        email,
        ativo,
      });

    setMessage(
      "Dados do responsável salvos com sucesso."
    );

    if (!isEditing) {
      navigate(
        `/responsaveis/${saved.id}/editar`,
        { replace: true }
      );
    }
  }

  function handleLinkPatient() {
    if (!isEditing) {
      setMessage(
        "Salve primeiro os dados do responsável."
      );
      return;
    }

    const patientId =
      Number(selectedPatientId);

    if (
      !Number.isFinite(
        patientId
      ) || patientId <= 0
    ) {
      setMessage(
        "Selecione uma criança para vincular."
      );
      return;
    }

    linkResponsibleToPatient({
      responsibleId,
      patientId,
      parentesco:
        newRelationship,
      responsavelPrincipal:
        getResponsiblePatientLinks().filter(
          (link) =>
            link.patientId ===
              patientId &&
            link.ativo
        ).length === 0,
      acessoApp: true,
      acessoFinanceiro: true,
      acessoDocumentos: true,
      ativo: true,
    });

    setSelectedPatientId("");
    setNewRelationship(
      "Responsável legal"
    );
    setRefreshKey(
      (current) => current + 1
    );
    setMessage(
      "Criança vinculada com sucesso."
    );
  }

  function handleUpdateLink(
    link: ResponsiblePatientLink,
    changes: Partial<ResponsiblePatientLink>
  ) {
    linkResponsibleToPatient({
      responsibleId:
        link.responsibleId,
      patientId:
        link.patientId,
      parentesco:
        changes.parentesco ??
        link.parentesco,
      responsavelPrincipal:
        changes.responsavelPrincipal ??
        link.responsavelPrincipal,
      acessoApp:
        changes.acessoApp ??
        link.acessoApp,
      acessoFinanceiro:
        changes.acessoFinanceiro ??
        link.acessoFinanceiro,
      acessoDocumentos:
        changes.acessoDocumentos ??
        link.acessoDocumentos,
      ativo: true,
    });

    setRefreshKey(
      (current) => current + 1
    );
  }

  function handleUnlinkPatient(
    link: ResponsiblePatientLink
  ) {
    unlinkResponsibleFromPatient(
      link.responsibleId,
      link.patientId
    );

    setRefreshKey(
      (current) => current + 1
    );
    setMessage(
      "Vínculo removido. O responsável continua cadastrado e outros vínculos foram preservados."
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/responsaveis"
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Voltar"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eeeaff] to-[#e8e5ff] text-[#6847f5]">
              <UserRound size={23} />
            </div>

            <div>
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
                {isEditing
                  ? "Editar responsável"
                  : "Novo responsável"}
              </h1>

              <p className="mt-1 text-sm font-medium text-[#7d89a8]">
                Dados do responsável e crianças vinculadas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleSaveResponsible
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,66,246,0.18)] transition hover:opacity-95"
          >
            <Save size={17} />
            Salvar responsável
          </button>
        </div>

        {isEditing &&
          !existingResponsible && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
              Responsável não encontrado.
            </div>
          )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Dados do responsável
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              O mesmo cadastro pode ser utilizado para mais de uma criança.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nome completo"
              value={nome}
              onChange={setNome}
              placeholder="Nome do responsável"
            />

            <Field
              label="CPF"
              value={cpf}
              onChange={setCpf}
              placeholder="000.000.000-00"
            />

            <Field
              label="Telefone"
              value={telefone}
              onChange={setTelefone}
              placeholder="(00) 00000-0000"
            />

            <Field
              label="E-mail"
              value={email}
              onChange={setEmail}
              placeholder="email@exemplo.com"
              type="email"
            />
          </div>

          <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(event) =>
                setAtivo(
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-violet-600"
            />

            <span className="text-sm font-semibold text-slate-700">
              Responsável ativo
            </span>
          </label>
        </section>

        {isEditing &&
          existingResponsible && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#10235f]">
                    Crianças/Pacientes vinculados
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Cada criança continua com prontuário, agenda, financeiro, documentos e evolução independentes.
                  </p>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto] lg:max-w-3xl">
                  <select
                    value={
                      selectedPatientId
                    }
                    onChange={(event) =>
                      setSelectedPatientId(
                        event.target.value
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="">
                      Selecione a criança
                    </option>

                    {availablePatients.map(
                      (patient) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            patient.id
                          }
                        >
                          {patient.nome}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={
                      newRelationship
                    }
                    onChange={(event) =>
                      setNewRelationship(
                        event.target.value as ResponsibleRelationship
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    {RELATIONSHIPS.map(
                      (relationship) => (
                        <option
                          key={
                            relationship
                          }
                          value={
                            relationship
                          }
                        >
                          {relationship}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={
                      handleLinkPatient
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
                  >
                    <Link2 size={16} />
                    Vincular criança
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {links.map(
                  (link) => {
                    const patient =
                      patients.find(
                        (item) =>
                          item.id ===
                          link.patientId
                      );

                    if (!patient) {
                      return null;
                    }

                    return (
                      <div
                        key={link.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-900">
                                {patient.nome}
                              </h3>

                              {link.responsavelPrincipal && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                                  <Check size={13} />
                                  Principal
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Paciente #{patient.id} · {patient.status}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleUnlinkPatient(
                                link
                              )
                            }
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Desvincular
                          </button>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[200px_1fr]">
                          <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                              Parentesco
                            </label>

                            <select
                              value={
                                link.parentesco
                              }
                              onChange={(event) =>
                                handleUpdateLink(
                                  link,
                                  {
                                    parentesco:
                                      event.target.value as ResponsibleRelationship,
                                  }
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                            >
                              {RELATIONSHIPS.map(
                                (relationship) => (
                                  <option
                                    key={
                                      relationship
                                    }
                                    value={
                                      relationship
                                    }
                                  >
                                    {relationship}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Permissões neste vínculo
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <PermissionToggle
                                label="Responsável principal"
                                icon={UserRound}
                                checked={
                                  link.responsavelPrincipal
                                }
                                onChange={(checked) => {
                                  if (checked) {
                                    handleUpdateLink(
                                      link,
                                      {
                                        responsavelPrincipal: true,
                                      }
                                    );
                                  }
                                }}
                              />

                              <PermissionToggle
                                label="Acesso ao app"
                                icon={Smartphone}
                                checked={
                                  link.acessoApp
                                }
                                onChange={(checked) =>
                                  handleUpdateLink(
                                    link,
                                    {
                                      acessoApp:
                                        checked,
                                    }
                                  )
                                }
                              />

                              <PermissionToggle
                                label="Financeiro"
                                icon={WalletCards}
                                checked={
                                  link.acessoFinanceiro
                                }
                                onChange={(checked) =>
                                  handleUpdateLink(
                                    link,
                                    {
                                      acessoFinanceiro:
                                        checked,
                                    }
                                  )
                                }
                              />

                              <PermissionToggle
                                label="Documentos"
                                icon={FileText}
                                checked={
                                  link.acessoDocumentos
                                }
                                onChange={(checked) =>
                                  handleUpdateLink(
                                    link,
                                    {
                                      acessoDocumentos:
                                        checked,
                                    }
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                {links.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    Nenhuma criança vinculada a este responsável.
                  </div>
                )}
              </div>
            </section>
          )}

        {message && (
          <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
            {message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
    </label>
  );
}

interface PermissionToggleProps {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PermissionToggle({
  label,
  icon: Icon,
  checked,
  onChange,
}: PermissionToggleProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
        checked
          ? "border-violet-200 bg-violet-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 rounded border-slate-300 text-violet-600"
      />

      <Icon
        size={16}
        className={
          checked
            ? "text-violet-600"
            : "text-slate-400"
        }
      />

      <span className="text-xs font-bold text-slate-700">
        {label}
      </span>
    </label>
  );
}
