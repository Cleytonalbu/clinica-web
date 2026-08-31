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
  createProfessionalLogin,
  getStoredUsers,
  resetStoredUserPassword,
  setStoredUserActive,
  type StoredUser,
} from "@/auth/authStorage";

import type {
  ProfessionalSetting,
} from "./settingsStorage";

interface UserLoginsSettingsSectionProps {
  professionals:
    ProfessionalSetting[];

  onFeedback:
    (
      message:
        string
    ) => void;
}

export default function UserLoginsSettingsSection({
  professionals,
  onFeedback,
}: UserLoginsSettingsSectionProps) {
  const [
    users,
    setUsers,
  ] =
    useState<StoredUser[]>(
      () =>
        getStoredUsers()
    );

  const [
    professionalId,
    setProfessionalId,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    resetUserId,
    setResetUserId,
  ] =
    useState<
      number |
      null
    >(
      null
    );

  const [
    resetPassword,
    setResetPassword,
  ] =
    useState("");

  const professionalUsers =
    useMemo(
      () =>
        users
          .filter(
            (user) =>
              user.profile ===
              "Profissional"
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        users,
      ]
    );

  const professionalIdsWithLogin =
    useMemo(
      () =>
        new Set(
          professionalUsers
            .map(
              (user) =>
                user.professionalId
            )
            .filter(
              (
                value
              ): value is number =>
                value !==
                undefined
            )
        ),
      [
        professionalUsers,
      ]
    );

  const availableProfessionals =
    useMemo(
      () =>
        professionals
          .filter(
            (
              professional
            ) =>
              professional.active &&
              !professionalIdsWithLogin.has(
                professional.id
              ) &&
              !professionalUsers.some(
                (
                  user
                ) =>
                  user.professionalId ===
                    undefined &&
                  user.professionalName ===
                    professional.name
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        professionals,
        professionalIdsWithLogin,
        professionalUsers,
      ]
    );

  const selectedProfessional =
    useMemo(
      () =>
        professionals.find(
          (
            professional
          ) =>
            professional.id ===
            Number(
              professionalId
            )
        ),
      [
        professionals,
        professionalId,
      ]
    );

  function refreshUsers() {
    setUsers(
      getStoredUsers()
    );
  }

  function clearForm() {
    setProfessionalId(
      ""
    );

    setEmail(
      ""
    );

    setPassword(
      ""
    );

    setConfirmPassword(
      ""
    );
  }

  function handleCreate() {
    if (
      !professionalId
    ) {
      onFeedback(
        "Selecione o profissional que receberá o login."
      );

      return;
    }

    if (
      !email.trim()
    ) {
      onFeedback(
        "Informe o e-mail de acesso."
      );

      return;
    }

    if (
      password.length <
      6
    ) {
      onFeedback(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      onFeedback(
        "A confirmação da senha não confere."
      );

      return;
    }

    try {
      createProfessionalLogin(
        {
          professionalId:
            Number(
              professionalId
            ),

          email,

          password,

          active:
            true,
        }
      );

      refreshUsers();

      clearForm();

      onFeedback(
        "Login do profissional criado com sucesso."
      );
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível criar o login."
      );
    }
  }

  function handleToggleUser(
    user:
      StoredUser
  ) {
    setStoredUserActive(
      user.id,
      !user.active
    );

    refreshUsers();

    onFeedback(
      user.active
        ? "Login desativado."
        : "Login ativado."
    );
  }

  function handleResetPassword(
    user:
      StoredUser
  ) {
    if (
      resetPassword.length <
      6
    ) {
      onFeedback(
        "A nova senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    try {
      resetStoredUserPassword(
        user.id,
        resetPassword
      );

      setResetPassword(
        ""
      );

      setResetUserId(
        null
      );

      refreshUsers();

      onFeedback(
        "Senha redefinida com sucesso."
      );
    } catch (
      error
    ) {
      onFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível redefinir a senha."
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Criar login de profissional"
        description="Selecione um profissional já cadastrado no sistema e defina as credenciais de acesso."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Profissional">
            <Select
              value={
                professionalId
              }
              onChange={(
                event
              ) =>
                setProfessionalId(
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione o profissional
              </option>

              {availableProfessionals.map(
                (
                  professional
                ) => (
                  <option
                    key={
                      professional.id
                    }
                    value={
                      professional.id
                    }
                  >
                    {professional.name} — {professional.specialty}
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField label="Perfil de acesso">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
              <ShieldCheck
                size={18}
                className="text-violet-600"
              />

              Profissional
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
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="profissional@entreafetos.com.br"
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Profissional selecionado">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <UserRound
                size={18}
                className="text-slate-400"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {
                    selectedProfessional?.name ??
                    "Nenhum profissional selecionado"
                  }
                </p>

                {selectedProfessional && (
                  <p className="truncate text-xs text-slate-500">
                    {
                      selectedProfessional.specialty
                    }
                  </p>
                )}
              </div>
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
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
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
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Digite novamente a senha"
                className="pl-10"
              />
            </div>
          </FormField>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            O login ficará automaticamente vinculado ao cadastro do profissional selecionado.
          </p>

          <Button
            type="button"
            onClick={
              handleCreate
            }
            disabled={
              !professionalId
            }
          >
            <KeyRound
              size={17}
            />

            Criar login
          </Button>
        </div>
      </PageCard>

      <PageCard
        title="Logins dos profissionais"
        description="Acompanhe os profissionais que já possuem acesso ao sistema."
      >
        {professionalUsers.length >
        0 ? (
          <div className="space-y-3">
            {professionalUsers.map(
              (
                user
              ) => {
                const professional =
                  user.professionalId !==
                    undefined
                    ? professionals.find(
                        (
                          item
                        ) =>
                          item.id ===
                          user.professionalId
                      )
                    : professionals.find(
                        (
                          item
                        ) =>
                          item.name ===
                          user.professionalName
                      );

                const resetting =
                  resetUserId ===
                  user.id;

                return (
                  <div
                    key={
                      user.id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <UserRound
                            size={20}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-slate-900">
                              {
                                professional?.name ??
                                user.name
                              }
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                user.active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {
                                user.active
                                  ? "Ativo"
                                  : "Inativo"
                              }
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {
                              professional?.specialty ??
                              "Profissional"
                            }
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {
                              user.email
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setResetUserId(
                              resetting
                                ? null
                                : user.id
                            );

                            setResetPassword(
                              ""
                            );
                          }}
                        >
                          <KeyRound
                            size={16}
                          />

                          Redefinir senha
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleToggleUser(
                              user
                            )
                          }
                        >
                          <Power
                            size={16}
                          />

                          {
                            user.active
                              ? "Desativar"
                              : "Ativar"
                          }
                        </Button>
                      </div>
                    </div>

                    {resetting && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <FormField label="Nova senha">
                            <Input
                              type="password"
                              value={
                                resetPassword
                              }
                              onChange={(
                                event
                              ) =>
                                setResetPassword(
                                  event.target.value
                                )
                              }
                              placeholder="Mínimo de 6 caracteres"
                            />
                          </FormField>
                        </div>

                        <Button
                          type="button"
                          onClick={() =>
                            handleResetPassword(
                              user
                            )
                          }
                        >
                          <CheckCircle2
                            size={16}
                          />

                          Salvar nova senha
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <KeyRound
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-bold text-slate-700">
              Nenhum login profissional cadastrado
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Selecione um profissional acima para criar o primeiro acesso.
            </p>
          </div>
        )}
      </PageCard>

      {availableProfessionals.length ===
        0 &&
        professionals.some(
          (
            professional
          ) =>
            professional.active
        ) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Todos os profissionais ativos já possuem login cadastrado.
        </div>
      )}
    </div>
  );
}
