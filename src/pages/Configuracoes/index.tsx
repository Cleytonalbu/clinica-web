import {
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  LayoutList,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Target,
  UserCog,
  UsersRound,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  Button,
  FormField,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  getSystemSettings,
  saveSystemSettings,
  type SystemSettings,
} from "./settingsStorage";

type SettingsSection =
  | "clinic"
  | "specialties"
  | "professionals"
  | "convenios"
  | "rooms"
  | "agenda"
  | "objectives"
  | "evolution"
  | "notifications"
  | "app"
  | "permissions"
  | "finance"
  | "reports"
  | "general";

interface ClinicSettings {
  clinicName: string;

  cnpj: string;

  email: string;

  phone: string;

  address: string;

  city: string;

  state: string;

  zipCode: string;

  timezone: string;

  dateFormat: string;

  consultationReminders: boolean;

  allowResponsibleReschedule: boolean;

  requireAbsenceReason: boolean;

  lockMedicalRecordAfterClose: boolean;

  showFinancialDataToProfessionals: boolean;
}

const CLINIC_STORAGE_KEY =
  "entre-afetos-clinic-settings";

const defaultClinicSettings: ClinicSettings = {
  clinicName:
    "Clínica Integrada Entre Afetos",

  cnpj:
    "35.123.456/0001-00",

  email:
    "contato@entreafetos.com.br",

  phone:
    "(11) 98765-4321",

  address:
    "Rua das Flores, 123",

  city:
    "São Paulo",

  state:
    "SP",

  zipCode:
    "05432-010",

  timezone:
    "America/Sao_Paulo",

  dateFormat:
    "DD/MM/AAAA",

  consultationReminders:
    true,

  allowResponsibleReschedule:
    true,

  requireAbsenceReason:
    true,

  lockMedicalRecordAfterClose:
    false,

  showFinancialDataToProfessionals:
    false,
};

function getClinicSettings(): ClinicSettings {
  try {
    const stored =
      localStorage.getItem(
        CLINIC_STORAGE_KEY
      );

    if (!stored) {
      localStorage.setItem(
        CLINIC_STORAGE_KEY,
        JSON.stringify(
          defaultClinicSettings
        )
      );

      return defaultClinicSettings;
    }

    return {
      ...defaultClinicSettings,
      ...JSON.parse(
        stored
      ),
    };
  } catch {
    return defaultClinicSettings;
  }
}

function saveClinicSettings(
  settings: ClinicSettings
) {
  localStorage.setItem(
    CLINIC_STORAGE_KEY,
    JSON.stringify(
      settings
    )
  );
}

const menuItems: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "clinic",
    label:
      "Dados da Clínica",
    icon:
      <Building2
        size={18}
      />,
  },

  {
    id: "specialties",
    label:
      "Especialidades",
    icon:
      <Stethoscope
        size={18}
      />,
  },

  {
    id: "professionals",
    label:
      "Profissionais",
    icon:
      <UserCog
        size={18}
      />,
  },

  {
    id: "convenios",
    label:
      "Convênios",
    icon:
      <UsersRound
        size={18}
      />,
  },

  {
    id: "rooms",
    label:
      "Salas",
    icon:
      <LayoutList
        size={18}
      />,
  },

  {
    id: "agenda",
    label:
      "Agenda",
    icon:
      <CalendarDays
        size={18}
      />,
  },

  {
    id: "objectives",
    label:
      "Objetivos Terapêuticos",
    icon:
      <Target
        size={18}
      />,
  },

  {
    id: "evolution",
    label:
      "Modelos de Evolução",
    icon:
      <ClipboardList
        size={18}
      />,
  },

  {
    id: "notifications",
    label:
      "Notificações",
    icon:
      <Bell
        size={18}
      />,
  },

  {
    id: "app",
    label:
      "Aplicativo dos Responsáveis",
    icon:
      <Smartphone
        size={18}
      />,
  },

  {
    id: "permissions",
    label:
      "Perfis e Permissões",
    icon:
      <ShieldCheck
        size={18}
      />,
  },

  {
    id: "finance",
    label:
      "Financeiro",
    icon:
      <CircleDollarSign
        size={18}
      />,
  },

  {
    id: "reports",
    label:
      "Relatórios",
    icon:
      <FileBarChart
        size={18}
      />,
  },

  {
    id: "general",
    label:
      "Configurações Gerais",
    icon:
      <Settings
        size={18}
      />,
  },
];

export default function Configuracoes() {
  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SettingsSection>(
      "clinic"
    );

  const [
    systemSettings,
    setSystemSettings,
  ] =
    useState<SystemSettings>(
      () =>
        getSystemSettings()
    );

  const [
    clinicSettings,
    setClinicSettings,
  ] =
    useState<ClinicSettings>(
      () =>
        getClinicSettings()
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string | null
    >(null);

  const selectedMenu =
    useMemo(
      () =>
        menuItems.find(
          (
            item
          ) =>
            item.id ===
            activeSection
        ),
      [
        activeSection,
      ]
    );

  function updateClinicField<
    K extends keyof ClinicSettings
  >(
    field: K,
    value:
      ClinicSettings[K]
  ) {
    setClinicSettings(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }

  function handleSave() {
    saveClinicSettings(
      clinicSettings
    );

    saveSystemSettings(
      systemSettings
    );

    setFeedback(
      "Configurações salvas com sucesso."
    );

    setTimeout(
      () => {
        setFeedback(
          null
        );
      },
      1800
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Configurações
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Personalize e configure o sistema de acordo com as necessidades da clínica.
            </p>
          </div>

          <Button
            type="button"
            onClick={
              handleSave
            }
          >
            <Save
              size={17}
            />

            Salvar alterações
          </Button>
        </div>

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {
              feedback
            }
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-sm font-bold text-slate-900">
              Configurações
            </p>

            <div className="space-y-1">
              {menuItems.map(
                (
                  item
                ) => {
                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        setActiveSection(
                          item.id
                        )
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            active
                              ? "bg-white text-indigo-600"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {
                            item.icon
                          }
                        </span>

                        {
                          item.label
                        }
                      </span>

                      <ChevronRight
                        size={16}
                        className={
                          active
                            ? "text-indigo-500"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  );
                }
              )}
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-slate-400">
                Configurações
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  selectedMenu?.label
                }
              </h2>
            </div>

            {activeSection ===
              "clinic" && (
              <ClinicSettingsSection
                settings={
                  clinicSettings
                }
                onChange={
                  updateClinicField
                }
              />
            )}

            {activeSection ===
              "specialties" && (
              <PlaceholderSection
                title="Especialidades"
                description="Gerenciamento de especialidades e valores padrão."
              />
            )}

            {activeSection ===
              "professionals" && (
              <PlaceholderSection
                title="Profissionais"
                description="Cadastro, especialidade, registro, valores e status dos profissionais."
              />
            )}

            {activeSection ===
              "convenios" && (
              <PlaceholderSection
                title="Convênios"
                description="Convênios aceitos, regras e valores por especialidade."
              />
            )}

            {activeSection ===
              "rooms" && (
              <PlaceholderSection
                title="Salas"
                description="Gerenciamento dos ambientes disponíveis para atendimento."
              />
            )}

            {activeSection ===
              "agenda" && (
              <PlaceholderSection
                title="Agenda"
                description="Horários padrão, duração dos atendimentos e regras de agendamento."
              />
            )}

            {activeSection ===
              "objectives" && (
              <PlaceholderSection
                title="Objetivos Terapêuticos"
                description="Configuração dos modelos e categorias de objetivos terapêuticos."
              />
            )}

            {activeSection ===
              "evolution" && (
              <PlaceholderSection
                title="Modelos de Evolução"
                description="Modelos utilizados para os registros de evolução clínica."
              />
            )}

            {activeSection ===
              "notifications" && (
              <PlaceholderSection
                title="Notificações"
                description="Regras de lembretes, confirmações e avisos."
              />
            )}

            {activeSection ===
              "app" && (
              <PlaceholderSection
                title="Aplicativo dos Responsáveis"
                description="Defina quais informações serão exibidas no aplicativo."
              />
            )}

            {activeSection ===
              "permissions" && (
              <PlaceholderSection
                title="Perfis e Permissões"
                description="Controle de acesso dos diferentes perfis do sistema."
              />
            )}

            {activeSection ===
              "finance" && (
              <PlaceholderSection
                title="Financeiro"
                description="Regras financeiras, recebimentos, descontos e vencimentos."
              />
            )}

            {activeSection ===
              "reports" && (
              <PlaceholderSection
                title="Relatórios"
                description="Preferências e configurações de relatórios."
              />
            )}

            {activeSection ===
              "general" && (
              <PlaceholderSection
                title="Configurações Gerais"
                description="Preferências gerais da plataforma."
              />
            )}
          </main>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              As configurações são aplicadas após salvar.
            </p>

            <p>
              Última atualização armazenada localmente.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ClinicSettingsSection({
  settings,
  onChange,
}: {
  settings:
    ClinicSettings;

  onChange: <
    K extends keyof ClinicSettings
  >(
    field: K,
    value:
      ClinicSettings[K]
  ) => void;
}) {
  return (
    <>
      <PageCard
        title="Dados da Clínica"
        description="Informações institucionais utilizadas no sistema."
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Nome da clínica"
            >
              <Input
                value={
                  settings.clinicName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "clinicName",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="CNPJ"
            >
              <Input
                value={
                  settings.cnpj
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "cnpj",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="E-mail"
            >
              <Input
                type="email"
                value={
                  settings.email
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "email",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Telefone"
            >
              <Input
                value={
                  settings.phone
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "phone",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Endereço"
            >
              <Input
                value={
                  settings.address
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "address",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Cidade"
            >
              <Input
                value={
                  settings.city
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "city",
                    event.target.value
                  )
                }
              />
            </FormField>

            <FormField
              label="Estado"
            >
              <Select
                value={
                  settings.state
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "state",
                    event.target.value
                  )
                }
              >
                <option value="PB">
                  PB
                </option>

                <option value="PE">
                  PE
                </option>

                <option value="RN">
                  RN
                </option>

                <option value="SP">
                  SP
                </option>

                <option value="RJ">
                  RJ
                </option>

                <option value="MG">
                  MG
                </option>
              </Select>
            </FormField>

            <FormField
              label="CEP"
            >
              <Input
                value={
                  settings.zipCode
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "zipCode",
                    event.target.value
                  )
                }
              />
            </FormField>
          </div>

          <div className="border-t border-slate-100 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <h3 className="font-bold text-slate-900">
              Configurações gerais
            </h3>

            <div className="mt-5 space-y-4">
              <BooleanSetting
                label="Ativar lembretes de consulta"
                checked={
                  settings.consultationReminders
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "consultationReminders",
                    value
                  )
                }
              />

              <BooleanSetting
                label="Permitir reagendamento pelo responsável"
                checked={
                  settings.allowResponsibleReschedule
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "allowResponsibleReschedule",
                    value
                  )
                }
              />

              <BooleanSetting
                label="Exigir justificativa para faltas"
                checked={
                  settings.requireAbsenceReason
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "requireAbsenceReason",
                    value
                  )
                }
              />

              <BooleanSetting
                label="Bloquear prontuário após encerramento"
                checked={
                  settings.lockMedicalRecordAfterClose
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "lockMedicalRecordAfterClose",
                    value
                  )
                }
              />

              <BooleanSetting
                label="Exibir dados financeiros para profissionais"
                checked={
                  settings.showFinancialDataToProfessionals
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    "showFinancialDataToProfessionals",
                    value
                  )
                }
              />
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Fuso horário"
              >
                <Select
                  value={
                    settings.timezone
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "timezone",
                      event.target.value
                    )
                  }
                >
                  <option value="America/Sao_Paulo">
                    (UTC-03:00) Brasília
                  </option>

                  <option value="America/Manaus">
                    (UTC-04:00) Manaus
                  </option>

                  <option value="America/Rio_Branco">
                    (UTC-05:00) Acre
                  </option>
                </Select>
              </FormField>

              <FormField
                label="Formato de data"
              >
                <Select
                  value={
                    settings.dateFormat
                  }
                  onChange={(
                    event
                  ) =>
                    onChange(
                      "dateFormat",
                      event.target.value
                    )
                  }
                >
                  <option value="DD/MM/AAAA">
                    DD/MM/AAAA
                  </option>

                  <option value="MM/DD/AAAA">
                    MM/DD/AAAA
                  </option>

                  <option value="AAAA-MM-DD">
                    AAAA-MM-DD
                  </option>
                </Select>
              </FormField>
            </div>
          </div>
        </div>
      </PageCard>

      <PageCard
        title="Resumo da Clínica"
        description="Visão rápida das configurações institucionais."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Especialidades ativas"
            value={String(
              getSystemSettings()
                .specialties
                .filter(
                  (
                    item
                  ) =>
                    item.active
                )
                .length
            )}
          />

          <SummaryCard
            title="Profissionais ativos"
            value={String(
              getSystemSettings()
                .professionals
                .filter(
                  (
                    item
                  ) =>
                    item.active
                )
                .length
            )}
          />

          <SummaryCard
            title="Salas ativas"
            value={String(
              getSystemSettings()
                .rooms
                .filter(
                  (
                    item
                  ) =>
                    item.active
                )
                .length
            )}
          />
        </div>
      </PageCard>
    </>
  );
}

function BooleanSetting({
  label,
  checked,
  onChange,
}: {
  label:
    string;

  checked:
    boolean;

  onChange:
    (
      value: boolean
    ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />

      <span className="text-sm font-medium text-slate-700">
        {
          label
        }
      </span>
    </label>
  );
}

function PlaceholderSection({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {
  return (
    <PageCard
      title={
        title
      }
      description={
        description
      }
    >
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-10 text-center">
        <Settings
          size={34}
          className="mx-auto text-indigo-400"
        />

        <p className="mt-4 font-bold text-slate-800">
          {
            title
          }
        </p>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Esta área já está preparada dentro da nova Central de Configurações. Vamos implementar os controles desta seção na próxima etapa.
        </p>
      </div>
    </PageCard>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">
        {
          title
        }
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {
          value
        }
      </p>
    </div>
  );
}