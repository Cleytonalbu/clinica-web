import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  Power,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  createCollaboratorLogin,
  createProfessionalLogin,
  getStoredUsers,
  getUserProfiles,
  resetStoredUserPassword,
  setStoredUserActive,
  setStoredUserAdditionalProfiles,
  setStoredUserProfessionalLink,
  type StoredUser,
  type UserProfile,
} from "@/auth/authStorage";

import {
  getAdministrativeCollaborators,
} from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";

import {
  getCollaboratorUnitIds,
} from "./collaboratorUnitStorage";

import {
  getProfessionalUnitIds,
} from "./professionalUnitStorage";

import {
  getActiveClinicUnits,
} from "./clinicUnitStorage";

import {
  setUserUnitAccess,
} from "./userUnitAccessStorage";

import type {
  ProfessionalSetting,
} from "./settingsStorage";

type LoginSource =
  | "Profissional"
  | "Colaborador";

interface UserLoginsSettingsSectionProps {
  professionals: ProfessionalSetting[];
  onFeedback: (message: string) => void;
}

export default function UserLoginsSettingsSection({
  professionals,
  onFeedback,
}: UserLoginsSettingsSectionProps) {
  const [users, setUsers] = useState<StoredUser[]>(() => getStoredUsers());
  const [source, setSource] = useState<LoginSource>("Profissional");
  const [professionalId, setProfessionalId] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const collaborators = useMemo(
    () =>
      getAdministrativeCollaborators()
        .filter(
          (item) =>
            item.status === "Ativo" &&
            (item.type === "Recepção" || item.type === "Administrativo"),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [users],
  );

  const units = useMemo(() => getActiveClinicUnits(), [users]);

  const managedUsers = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [users],
  );

  const professionalIdsWithLogin = useMemo(
    () =>
      new Set(
        users
          .filter((user) => user.profile === "Profissional")
          .map((user) => user.professionalId)
          .filter((value): value is number => value !== undefined),
      ),
    [users],
  );

  const collaboratorIdsWithLogin = useMemo(
    () =>
      new Set(
        users
          .map((user) => user.collaboratorId)
          .filter((value): value is string => Boolean(value)),
      ),
    [users],
  );

  const availableProfessionals = useMemo(
    () =>
      professionals
        .filter(
          (professional) =>
            professional.active &&
            !professionalIdsWithLogin.has(professional.id) &&
            !users.some(
              (user) =>
                user.profile === "Profissional" &&
                user.professionalId === undefined &&
                user.professionalName === professional.name,
            ),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [professionals, professionalIdsWithLogin, users],
  );

  const availableCollaborators = useMemo(
    () =>
      collaborators.filter(
        (collaborator) => !collaboratorIdsWithLogin.has(collaborator.id),
      ),
    [collaborators, collaboratorIdsWithLogin],
  );

  const selectedProfessional = useMemo(
    () =>
      professionals.find(
        (professional) => professional.id === Number(professionalId),
      ),
    [professionals, professionalId],
  );

  const selectedCollaborator = useMemo(
    () => collaborators.find((item) => item.id === collaboratorId),
    [collaborators, collaboratorId],
  );

  const selectedUnitIds = useMemo(() => {
    if (source === "Profissional" && selectedProfessional) {
      return getProfessionalUnitIds(selectedProfessional.id);
    }

    if (source === "Colaborador" && selectedCollaborator) {
      return getCollaboratorUnitIds(selectedCollaborator.id);
    }

    return [];
  }, [source, selectedProfessional, selectedCollaborator]);

  const selectedUnitNames = useMemo(
    () =>
      units
        .filter((unit) => selectedUnitIds.includes(unit.id))
        .map((unit) => unit.name),
    [units, selectedUnitIds],
  );

  const selectedName =
    source === "Profissional"
      ? selectedProfessional?.name
      : selectedCollaborator?.name;

  const selectedSubtitle =
    source === "Profissional"
      ? selectedProfessional?.specialty
      : selectedCollaborator
        ? `${selectedCollaborator.type} — ${selectedCollaborator.role}`
        : undefined;

  const selectedProfile =
    source === "Profissional"
      ? "Profissional"
      : selectedCollaborator?.type ?? "Recepção";

  function refreshUsers() {
    setUsers(getStoredUsers());
  }

  function clearForm() {
    setProfessionalId("");
    setCollaboratorId("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSourceChange(value: string) {
    setSource(value as LoginSource);
    setProfessionalId("");
    setCollaboratorId("");
  }

  function handleCreate() {
    if (source === "Profissional" && !professionalId) {
      onFeedback("Selecione o profissional que receberá o login.");
      return;
    }

    if (source === "Colaborador" && !collaboratorId) {
      onFeedback("Selecione o colaborador que receberá o login.");
      return;
    }

    if (!email.trim()) {
      onFeedback("Informe o e-mail de acesso.");
      return;
    }

    if (password.length < 6) {
      onFeedback("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      onFeedback("A confirmação da senha não confere.");
      return;
    }

    if (selectedUnitIds.length === 0) {
      onFeedback(
        source === "Profissional"
          ? "Defina ao menos uma unidade de atendimento para este profissional antes de criar o login."
          : "Defina ao menos uma unidade de trabalho para este colaborador antes de criar o login.",
      );
      return;
    }

    try {
      const user =
        source === "Profissional"
          ? createProfessionalLogin({
              professionalId: Number(professionalId),
              email,
              password,
              active: true,
            })
          : createCollaboratorLogin({
              collaboratorId,
              profile: selectedCollaborator!.type as
                | "Recepção"
                | "Administrativo",
              email,
              password,
              active: true,
            });

      setUserUnitAccess(user.id, {
        unitIds: selectedUnitIds,
        allUnits: false,
      });

      refreshUsers();
      clearForm();

      onFeedback(
        source === "Profissional"
          ? "Login do profissional criado com sucesso."
          : "Login do colaborador criado com sucesso.",
      );
    } catch (error) {
      onFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o login.",
      );
    }
  }

  function handleToggleUser(user: StoredUser) {
    setStoredUserActive(user.id, !user.active);
    refreshUsers();
    onFeedback(user.active ? "Login desativado." : "Login ativado.");
  }

  function handleResetPassword(user: StoredUser) {
    if (resetPassword.length < 6) {
      onFeedback("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    try {
      resetStoredUserPassword(user.id, resetPassword);
      setResetPassword("");
      setResetUserId(null);
      refreshUsers();
      onFeedback("Senha redefinida com sucesso.");
    } catch (error) {
      onFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir a senha.",
      );
    }
  }

  const selectableProfiles:
    UserProfile[] = [
      "Gestor",
      "Recepção",
      "Profissional",
      "Administrativo",
    ];

  function handleToggleAdditionalProfile(
    user: StoredUser,
    profile: UserProfile
  ) {
    if (
      profile ===
      user.profile
    ) {
      return;
    }

    if (
      profile ===
        "Profissional" &&
      user.professionalId ===
        undefined
    ) {
      onFeedback(
        "Vincule primeiro este login a um cadastro profissional para liberar a área Profissional."
      );

      return;
    }

    const current =
      user.additionalProfiles ??
      [];

    const enabled =
      current.includes(
        profile
      );

    const next =
      enabled
        ? current.filter(
            (item) =>
              item !==
              profile
          )
        : [
            ...current,
            profile,
          ];

    try {
      setStoredUserAdditionalProfiles(
        user.id,
        next
      );

      refreshUsers();

      onFeedback(
        enabled
          ? `Acesso ${profile} removido deste login.`
          : `Acesso ${profile} liberado para este login.`
      );
    } catch (error) {
      onFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar os perfis de acesso."
      );
    }
  }

  function handleProfessionalLink(
    user: StoredUser,
    value: string
  ) {
    const professionalId =
      value
        ? Number(
            value
          )
        : null;

    try {
      setStoredUserProfessionalLink(
        user.id,
        professionalId
      );

      if (
        professionalId ===
        null &&
        (
          user.additionalProfiles ??
          []
        ).includes(
          "Profissional"
        )
      ) {
        setStoredUserAdditionalProfiles(
          user.id,
          (
            user.additionalProfiles ??
            []
          ).filter(
            (profile) =>
              profile !==
              "Profissional"
          )
        );
      }

      refreshUsers();

      onFeedback(
        professionalId ===
          null
          ? "Vínculo profissional removido."
          : "Cadastro profissional vinculado ao login."
      );
    } catch (error) {
      onFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o vínculo profissional."
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Criar login de usuário"
        description="Vincule o acesso a um profissional ou colaborador já cadastrado no sistema."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Tipo de cadastro">
            <Select
              value={source}
              onChange={(event) => handleSourceChange(event.target.value)}
            >
              <option value="Profissional">Profissional</option>
              <option value="Colaborador">Colaborador</option>
            </Select>
          </FormField>

          {source === "Profissional" ? (
            <FormField label="Profissional">
              <Select
                value={professionalId}
                onChange={(event) => setProfessionalId(event.target.value)}
              >
                <option value="">Selecione o profissional</option>
                {availableProfessionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name} — {professional.specialty}
                  </option>
                ))}
              </Select>
            </FormField>
          ) : (
            <FormField label="Colaborador">
              <Select
                value={collaboratorId}
                onChange={(event) => setCollaboratorId(event.target.value)}
              >
                <option value="">Selecione o colaborador</option>
                {availableCollaborators.map((collaborator) => (
                  <option key={collaborator.id} value={collaborator.id}>
                    {collaborator.name} — {collaborator.type}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Perfil de acesso">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
              <ShieldCheck size={18} className="text-violet-600" />
              {selectedProfile}
            </div>
          </FormField>

          <FormField label="Pessoa selecionada">
            <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <UserRound size={18} className="shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {selectedName ?? "Nenhum cadastro selecionado"}
                </p>
                {selectedSubtitle && (
                  <p className="truncate text-xs text-slate-500">
                    {selectedSubtitle}
                  </p>
                )}
              </div>
            </div>
          </FormField>

          <FormField label="Unidades liberadas">
            <div className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {selectedUnitNames.length > 0
                ? selectedUnitNames.join(" • ")
                : "As unidades vinculadas ao cadastro aparecerão aqui."}
            </div>
          </FormField>

          <FormField label="E-mail de acesso">
            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@entreafetos.com.br"
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Senha">
            <div className="relative">
              <LockKeyhole
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Confirmar senha">
            <div className="relative">
              <KeyRound
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Digite novamente a senha"
                className="pl-10"
              />
            </div>
          </FormField>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            O login será vinculado ao cadastro selecionado e receberá acesso às unidades já definidas para essa pessoa.
          </p>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={
              source === "Profissional" ? !professionalId : !collaboratorId
            }
          >
            <KeyRound size={17} />
            Criar login
          </Button>
        </div>
      </PageCard>

      <PageCard
        title="Logins cadastrados"
        description="Gerencie um único login com múltiplas áreas de acesso. O usuário poderá alternar entre Gestor, Profissional, Administrativo e Recepção conforme as liberações abaixo."
      >
        {managedUsers.length > 0 ? (
          <div className="space-y-3">
            {managedUsers.map((user) => {
              const professional =
                user.professionalId !== undefined
                  ? professionals.find((item) => item.id === user.professionalId)
                  : undefined;
              const collaborator = user.collaboratorId
                ? collaborators.find((item) => item.id === user.collaboratorId)
                : undefined;
              const resetting = resetUserId === user.id;
              const userUnitIds =
                user.profile === "Profissional" && user.professionalId !== undefined
                  ? getProfessionalUnitIds(user.professionalId)
                  : user.collaboratorId
                    ? getCollaboratorUnitIds(user.collaboratorId)
                    : [];
              const userUnitNames = units
                .filter((unit) => userUnitIds.includes(unit.id))
                .map((unit) => unit.name);

              return (
                <div
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <UserRound size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-bold text-slate-900">
                            {professional?.name ?? collaborator?.name ?? user.name}
                          </h3>
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            {user.profile}
                          </span>
                          {(user.additionalProfiles ?? []).map((profile) => (
                            <span
                              key={profile}
                              className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700"
                            >
                              + {profile}
                            </span>
                          ))}
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              user.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {user.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {professional?.specialty ?? collaborator?.role ?? user.profile}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Perfis liberados: {getUserProfiles(user).join(" • ")}
                        </p>
                        {userUnitNames.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            Unidades: {userUnitNames.join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setResetUserId(resetting ? null : user.id);
                          setResetPassword("");
                        }}
                      >
                        <KeyRound size={16} />
                        Redefinir senha
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleToggleUser(user)}
                      >
                        <Power size={16} />
                        {user.active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr]">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                          Perfis / áreas disponíveis
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          O perfil principal permanece fixo. Marque as outras áreas que este mesmo login poderá acessar.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectableProfiles.map(
                            (profile) => {
                              const primary =
                                profile ===
                                user.profile;

                              const enabled =
                                primary ||
                                (
                                  user.additionalProfiles ??
                                  []
                                ).includes(
                                  profile
                                );

                              const needsProfessionalLink =
                                profile ===
                                  "Profissional" &&
                                !primary &&
                                user.professionalId ===
                                  undefined;

                              return (
                                <button
                                  key={profile}
                                  type="button"
                                  disabled={
                                    primary
                                  }
                                  onClick={() =>
                                    handleToggleAdditionalProfile(
                                      user,
                                      profile
                                    )
                                  }
                                  title={
                                    primary
                                      ? "Perfil principal deste login"
                                      : needsProfessionalLink
                                        ? "Vincule um cadastro profissional antes de liberar esta área"
                                        : enabled
                                          ? "Clique para remover este acesso"
                                          : "Clique para liberar este acesso"
                                  }
                                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                                    primary
                                      ? "cursor-default border-violet-200 bg-violet-50 text-violet-700"
                                      : enabled
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      enabled
                                        ? "bg-emerald-500"
                                        : "bg-slate-300"
                                    }`}
                                  />

                                  {profile}

                                  {primary && (
                                    <span className="text-[9px] font-semibold uppercase text-violet-500">
                                      Principal
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                          Vínculo para atendimento profissional
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Necessário quando este login também utiliza a área Profissional.
                        </p>

                        <Select
                          value={
                            user.professionalId !==
                            undefined
                              ? String(
                                  user.professionalId
                                )
                              : ""
                          }
                          onChange={(event) =>
                            handleProfessionalLink(
                              user,
                              event.target.value
                            )
                          }
                          className="mt-3"
                          disabled={
                            user.profile ===
                            "Profissional"
                          }
                        >
                          <option value="">
                            Sem vínculo profissional
                          </option>

                          {professionals
                            .filter(
                              (item) =>
                                item.active &&
                                (
                                  item.id ===
                                    user.professionalId ||
                                  !users.some(
                                    (otherUser) =>
                                      otherUser.id !==
                                        user.id &&
                                      otherUser.professionalId ===
                                        item.id
                                  )
                                )
                            )
                            .sort(
                              (a, b) =>
                                a.name.localeCompare(
                                  b.name,
                                  "pt-BR"
                                )
                            )
                            .map(
                              (item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name} — {item.specialty}
                                </option>
                              )
                            )}
                        </Select>

                        {user.profile ===
                          "Profissional" && (
                          <p className="mt-2 text-[11px] font-medium text-violet-600">
                            O vínculo do perfil Profissional principal é definido pelo próprio cadastro profissional.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {resetting && (
                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <FormField label="Nova senha">
                          <Input
                            type="password"
                            value={resetPassword}
                            onChange={(event) => setResetPassword(event.target.value)}
                            placeholder="Mínimo de 6 caracteres"
                          />
                        </FormField>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleResetPassword(user)}
                      >
                        <CheckCircle2 size={16} />
                        Salvar nova senha
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <KeyRound size={28} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-700">
              Nenhum login cadastrado
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Crie um login de profissional ou colaborador acima para iniciar os acessos.
            </p>
          </div>
        )}
      </PageCard>
    </div>
  );
}
