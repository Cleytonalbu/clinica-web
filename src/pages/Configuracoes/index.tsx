import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  DoorOpen,
  FileBarChart,
  LayoutList,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Target,
  Trash2,
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
  type ConvenioSetting,
  type ProfessionalSetting,
  type RoomSetting,
  type SpecialtySetting,
  type SystemSettings,
} from "./settingsStorage";

import AgendaSettingsSection from "./AgendaSettingsSection";

import ObjectivesSettingsContainer from "./ObjectivesSettingsContainer";

import EvolutionModelsSettingsContainer from "./EvolutionModelsSettingsContainer";

import NotificationsSettingsContainer from "./NotificationsSettingsContainer";

import ResponsibleAppSettingsContainer from "./ResponsibleAppSettingsContainer";

import PermissionsSettingsContainer from "./PermissionsSettingsContainer";

import FinancialSettingsContainer from "./FinancialSettingsContainer";

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
    "(83) 99999-9999",

  address:
    "Rua Exemplo, 123",

  city:
    "Guarabira",

  state:
    "PB",

  zipCode:
    "58200-000",

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
  settings:
    ClinicSettings
) {
  localStorage.setItem(
    CLINIC_STORAGE_KEY,
    JSON.stringify(
      settings
    )
  );
}

const menuItems: {
  id:
    SettingsSection;

  label:
    string;

  icon:
    ReactNode;
}[] = [
  {
    id:
      "clinic",

    label:
      "Dados da Clínica",

    icon:
      <Building2
        size={18}
      />,
  },

  {
    id:
      "specialties",

    label:
      "Especialidades",

    icon:
      <Stethoscope
        size={18}
      />,
  },

  {
    id:
      "professionals",

    label:
      "Profissionais",

    icon:
      <UserCog
        size={18}
      />,
  },

  {
    id:
      "convenios",

    label:
      "Convênios",

    icon:
      <UsersRound
        size={18}
      />,
  },

  {
    id:
      "rooms",

    label:
      "Salas",

    icon:
      <LayoutList
        size={18}
      />,
  },

  {
    id:
      "agenda",

    label:
      "Agenda",

    icon:
      <CalendarDays
        size={18}
      />,
  },

  {
    id:
      "objectives",

    label:
      "Objetivos Terapêuticos",

    icon:
      <Target
        size={18}
      />,
  },

  {
    id:
      "evolution",

    label:
      "Modelos de Evolução",

    icon:
      <ClipboardList
        size={18}
      />,
  },

  {
    id:
      "notifications",

    label:
      "Notificações",

    icon:
      <Bell
        size={18}
      />,
  },

  {
    id:
      "app",

    label:
      "Aplicativo dos Responsáveis",

    icon:
      <Smartphone
        size={18}
      />,
  },

  {
    id:
      "permissions",

    label:
      "Perfis e Permissões",

    icon:
      <ShieldCheck
        size={18}
      />,
  },

  {
    id:
      "finance",

    label:
      "Financeiro",

    icon:
      <CircleDollarSign
        size={18}
      />,
  },

  {
    id:
      "reports",

    label:
      "Relatórios",

    icon:
      <FileBarChart
        size={18}
      />,
  },

  {
    id:
      "general",

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
    specialtyName,
    setSpecialtyName,
  ] =
    useState("");

  const [
    specialtyValue,
    setSpecialtyValue,
  ] =
    useState("");

  const [
    professionalName,
    setProfessionalName,
  ] =
    useState("");

  const [
    professionalSpecialty,
    setProfessionalSpecialty,
  ] =
    useState("");

  const [
    professionalRegistration,
    setProfessionalRegistration,
  ] =
    useState("");

  const [
    professionalValue,
    setProfessionalValue,
  ] =
    useState("");

  const [
    convenioName,
    setConvenioName,
  ] =
    useState("");

  const [
    convenioDiscount,
    setConvenioDiscount,
  ] =
    useState(
      "20"
    );

  const [
    roomName,
    setRoomName,
  ] =
    useState("");

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
    );

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

  const activeSpecialties =
    useMemo(
      () =>
        systemSettings.specialties.filter(
          (
            specialty
          ) =>
            specialty.active
        ),
      [
        systemSettings.specialties,
      ]
    );

  function showFeedback(
    message:
      string
  ) {
    setFeedback(
      message
    );

    window.setTimeout(
      () => {
        setFeedback(
          null
        );
      },
      2000
    );
  }

  function updateClinicField<
    K extends keyof ClinicSettings
  >(
    field:
      K,

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

    showFeedback(
      "Configurações salvas com sucesso."
    );
  }

  function handleAgendaChange(
    agenda:
      SystemSettings["agenda"]
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        agenda,
      })
    );
  }

  function handleAddSpecialty() {
    const name =
      specialtyName.trim();

    const value =
      Number(
        specialtyValue
      );

    if (!name) {
      showFeedback(
        "Informe o nome da especialidade."
      );

      return;
    }

    if (
      !value ||
      value <=
        0
    ) {
      showFeedback(
        "Informe um valor válido."
      );

      return;
    }

    const alreadyExists =
      systemSettings.specialties.some(
        (
          specialty
        ) =>
          specialty.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (
      alreadyExists
    ) {
      showFeedback(
        "Já existe uma especialidade com esse nome."
      );

      return;
    }

    const newSpecialty:
      SpecialtySetting = {
      id:
        Date.now(),

      name,

      value,

      active:
        true,
    };

    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      specialties: [
        ...systemSettings.specialties,
        newSpecialty,
      ],
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    setSpecialtyName(
      ""
    );

    setSpecialtyValue(
      ""
    );

    showFeedback(
      "Especialidade adicionada com sucesso."
    );
  }

  function updateSpecialty(
    id:
      number,

    data:
      Partial<SpecialtySetting>
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        specialties:
          current.specialties.map(
            (
              specialty
            ) =>
              specialty.id ===
              id
                ? {
                    ...specialty,

                    ...data,
                  }
                : specialty
          ),
      })
    );
  }

  function toggleSpecialty(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      specialties:
        systemSettings.specialties.map(
          (
            specialty
          ) =>
            specialty.id ===
            id
              ? {
                  ...specialty,

                  active:
                    !specialty.active,
                }
              : specialty
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );
  }

  function removeSpecialty(
    id:
      number
  ) {
    const specialty =
      systemSettings.specialties.find(
        (
          item
        ) =>
          item.id ===
          id
      );

    if (
      !specialty
    ) {
      return;
    }

    const linkedProfessional =
      systemSettings.professionals.some(
        (
          professional
        ) =>
          professional.specialty ===
          specialty.name
      );

    if (
      linkedProfessional
    ) {
      showFeedback(
        "Essa especialidade está vinculada a um profissional. Altere o profissional ou desative a especialidade."
      );

      return;
    }

    const linkedObjective =
      systemSettings.objectives.some(
        (
          objective
        ) =>
          objective.specialty ===
          specialty.name
      );

    if (
      linkedObjective
    ) {
      showFeedback(
        "Essa especialidade possui objetivos terapêuticos vinculados. Desative a especialidade em vez de excluí-la."
      );

      return;
    }

    const linkedEvolutionModel =
      systemSettings.evolutionModels.some(
        (
          model
        ) =>
          model.specialty ===
          specialty.name
      );

    if (
      linkedEvolutionModel
    ) {
      showFeedback(
        "Essa especialidade possui modelos de evolução vinculados. Desative a especialidade em vez de excluí-la."
      );

      return;
    }

    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      specialties:
        systemSettings.specialties.filter(
          (
            item
          ) =>
            item.id !==
            id
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    showFeedback(
      "Especialidade excluída."
    );
  }

  function handleAddProfessional() {
    const name =
      professionalName.trim();

    const registration =
      professionalRegistration.trim();

    const customValue =
      professionalValue
        ? Number(
            professionalValue
          )
        : undefined;

    if (
      !name
    ) {
      showFeedback(
        "Informe o nome do profissional."
      );

      return;
    }

    if (
      !professionalSpecialty
    ) {
      showFeedback(
        "Selecione a especialidade."
      );

      return;
    }

    if (
      customValue !==
        undefined &&
      (
        Number.isNaN(
          customValue
        ) ||
        customValue <=
          0
      )
    ) {
      showFeedback(
        "Informe um valor próprio válido ou deixe o campo vazio."
      );

      return;
    }

    const alreadyExists =
      systemSettings.professionals.some(
        (
          professional
        ) =>
          professional.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (
      alreadyExists
    ) {
      showFeedback(
        "Já existe um profissional com esse nome."
      );

      return;
    }

    const newProfessional:
      ProfessionalSetting = {
      id:
        Date.now(),

      name,

      specialty:
        professionalSpecialty,

      registration,

      active:
        true,

      customValue,
    };

    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      professionals: [
        ...systemSettings.professionals,
        newProfessional,
      ],
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    setProfessionalName(
      ""
    );

    setProfessionalSpecialty(
      ""
    );

    setProfessionalRegistration(
      ""
    );

    setProfessionalValue(
      ""
    );

    showFeedback(
      "Profissional adicionado com sucesso."
    );
  }

  function updateProfessional(
    id:
      number,

    data:
      Partial<ProfessionalSetting>
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        professionals:
          current.professionals.map(
            (
              professional
            ) =>
              professional.id ===
              id
                ? {
                    ...professional,

                    ...data,
                  }
                : professional
          ),
      })
    );
  }

  function toggleProfessional(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      professionals:
        systemSettings.professionals.map(
          (
            professional
          ) =>
            professional.id ===
            id
              ? {
                  ...professional,

                  active:
                    !professional.active,
                }
              : professional
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );
  }

  function removeProfessional(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      professionals:
        systemSettings.professionals.filter(
          (
            professional
          ) =>
            professional.id !==
            id
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    showFeedback(
      "Profissional excluído."
    );
  }

  function handleAddConvenio() {
    const name =
      convenioName.trim();

    const discount =
      Number(
        convenioDiscount
      );

    if (
      !name
    ) {
      showFeedback(
        "Informe o nome do convênio."
      );

      return;
    }

    if (
      Number.isNaN(
        discount
      ) ||
      discount <
        0 ||
      discount >
        100
    ) {
      showFeedback(
        "Informe um desconto entre 0% e 100%."
      );

      return;
    }

    const alreadyExists =
      systemSettings.convenios.some(
        (
          convenio
        ) =>
          convenio.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (
      alreadyExists
    ) {
      showFeedback(
        "Já existe um convênio com esse nome."
      );

      return;
    }

    const newConvenio:
      ConvenioSetting = {
      id:
        Date.now(),

      name,

      active:
        true,

      discountPercent:
        discount,

      specialtyValues:
        {},
    };

    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      convenios: [
        ...systemSettings.convenios,
        newConvenio,
      ],
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    setConvenioName(
      ""
    );

    setConvenioDiscount(
      "20"
    );

    showFeedback(
      "Convênio adicionado com sucesso."
    );
  }

  function updateConvenio(
    id:
      number,

    data:
      Partial<ConvenioSetting>
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        convenios:
          current.convenios.map(
            (
              convenio
            ) =>
              convenio.id ===
              id
                ? {
                    ...convenio,

                    ...data,
                  }
                : convenio
          ),
      })
    );
  }

  function toggleConvenio(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      convenios:
        systemSettings.convenios.map(
          (
            convenio
          ) =>
            convenio.id ===
            id
              ? {
                  ...convenio,

                  active:
                    !convenio.active,
                }
              : convenio
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );
  }

  function updateConvenioSpecialtyValue(
    convenioId:
      number,

    specialtyName:
      string,

    value:
      string
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        convenios:
          current.convenios.map(
            (
              convenio
            ) => {
              if (
                convenio.id !==
                convenioId
              ) {
                return convenio;
              }

              const nextValues = {
                ...convenio.specialtyValues,
              };

              const numericValue =
                Number(
                  value
                );

              if (
                !value ||
                Number.isNaN(
                  numericValue
                ) ||
                numericValue <=
                  0
              ) {
                delete nextValues[
                  specialtyName
                ];
              } else {
                nextValues[
                  specialtyName
                ] =
                  numericValue;
              }

              return {
                ...convenio,

                specialtyValues:
                  nextValues,
              };
            }
          ),
      })
    );
  }

  function removeConvenio(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      convenios:
        systemSettings.convenios.filter(
          (
            convenio
          ) =>
            convenio.id !==
            id
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    showFeedback(
      "Convênio excluído."
    );
  }

  function handleAddRoom() {
    const name =
      roomName.trim();

    if (
      !name
    ) {
      showFeedback(
        "Informe o nome da sala."
      );

      return;
    }

    const alreadyExists =
      systemSettings.rooms.some(
        (
          room
        ) =>
          room.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (
      alreadyExists
    ) {
      showFeedback(
        "Já existe uma sala com esse nome."
      );

      return;
    }

    const newRoom:
      RoomSetting = {
      id:
        Date.now(),

      name,

      active:
        true,
    };

    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      rooms: [
        ...systemSettings.rooms,
        newRoom,
      ],
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    setRoomName(
      ""
    );

    showFeedback(
      "Sala adicionada com sucesso."
    );
  }

  function updateRoom(
    id:
      number,

    data:
      Partial<RoomSetting>
  ) {
    setSystemSettings(
      (
        current
      ) => ({
        ...current,

        rooms:
          current.rooms.map(
            (
              room
            ) =>
              room.id ===
              id
                ? {
                    ...room,

                    ...data,
                  }
                : room
          ),
      })
    );
  }

  function toggleRoom(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      rooms:
        systemSettings.rooms.map(
          (
            room
          ) =>
            room.id ===
            id
              ? {
                  ...room,

                  active:
                    !room.active,
                }
              : room
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );
  }

  function removeRoom(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...systemSettings,

      rooms:
        systemSettings.rooms.filter(
          (
            room
          ) =>
            room.id !==
            id
        ),
    };

    setSystemSettings(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    showFeedback(
      "Sala excluída."
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
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
            {
              feedback
            }
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
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
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            active
                              ? "bg-white text-indigo-600"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {
                            item.icon
                          }
                        </span>

                        <span>
                          {
                            item.label
                          }
                        </span>
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

                systemSettings={
                  systemSettings
                }

                onChange={
                  updateClinicField
                }
              />
            )}

            {activeSection ===
              "specialties" && (
              <SpecialtiesSettingsSection
                settings={
                  systemSettings
                }

                specialtyName={
                  specialtyName
                }

                specialtyValue={
                  specialtyValue
                }

                onSpecialtyNameChange={
                  setSpecialtyName
                }

                onSpecialtyValueChange={
                  setSpecialtyValue
                }

                onAdd={
                  handleAddSpecialty
                }

                onUpdate={
                  updateSpecialty
                }

                onToggle={
                  toggleSpecialty
                }

                onRemove={
                  removeSpecialty
                }
              />
            )}

            {activeSection ===
              "professionals" && (
              <ProfessionalsSettingsSection
                settings={
                  systemSettings
                }

                activeSpecialties={
                  activeSpecialties
                }

                professionalName={
                  professionalName
                }

                professionalSpecialty={
                  professionalSpecialty
                }

                professionalRegistration={
                  professionalRegistration
                }

                professionalValue={
                  professionalValue
                }

                onNameChange={
                  setProfessionalName
                }

                onSpecialtyChange={
                  setProfessionalSpecialty
                }

                onRegistrationChange={
                  setProfessionalRegistration
                }

                onValueChange={
                  setProfessionalValue
                }

                onAdd={
                  handleAddProfessional
                }

                onUpdate={
                  updateProfessional
                }

                onToggle={
                  toggleProfessional
                }

                onRemove={
                  removeProfessional
                }
              />
            )}

            {activeSection ===
              "convenios" && (
              <ConveniosSettingsSection
                settings={
                  systemSettings
                }

                convenioName={
                  convenioName
                }

                convenioDiscount={
                  convenioDiscount
                }

                onNameChange={
                  setConvenioName
                }

                onDiscountChange={
                  setConvenioDiscount
                }

                onAdd={
                  handleAddConvenio
                }

                onUpdate={
                  updateConvenio
                }

                onToggle={
                  toggleConvenio
                }

                onSpecialtyValueChange={
                  updateConvenioSpecialtyValue
                }

                onRemove={
                  removeConvenio
                }
              />
            )}

            {activeSection ===
              "rooms" && (
              <RoomsSettingsSection
                settings={
                  systemSettings
                }

                roomName={
                  roomName
                }

                onRoomNameChange={
                  setRoomName
                }

                onAdd={
                  handleAddRoom
                }

                onUpdate={
                  updateRoom
                }

                onToggle={
                  toggleRoom
                }

                onRemove={
                  removeRoom
                }
              />
            )}

            {activeSection ===
              "agenda" && (
              <AgendaSettingsSection
                settings={
                  systemSettings.agenda
                }

                onChange={
                  handleAgendaChange
                }
              />
            )}

            {activeSection ===
              "objectives" && (
              <ObjectivesSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "evolution" && (
              <EvolutionModelsSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "notifications" && (
              <NotificationsSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "app" && (
              <ResponsibleAppSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "permissions" && (
              <PermissionsSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "finance" && (
              <FinancialSettingsContainer
                settings={
                  systemSettings
                }

                onSettingsChange={
                  setSystemSettings
                }

                onFeedback={
                  showFeedback
                }
              />
            )}

            {activeSection ===
              "reports" && (
              <PlaceholderSection
                title="Relatórios"
                description="Configure preferências para geração dos relatórios."
              />
            )}

            {activeSection ===
              "general" && (
              <PlaceholderSection
                title="Configurações Gerais"
                description="Defina as preferências gerais de funcionamento da plataforma."
              />
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ClinicSettingsSection({
  settings,
  systemSettings,
  onChange,
}: {
  settings:
    ClinicSettings;

  systemSettings:
    SystemSettings;

  onChange: <
    K extends keyof ClinicSettings
  >(
    field:
      K,

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
            <FormField label="Nome da clínica">
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

            <FormField label="CNPJ">
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

            <FormField label="E-mail">
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

            <FormField label="Telefone">
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

            <FormField label="Endereço">
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

            <FormField label="Cidade">
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

            <FormField label="Estado">
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
                <option value="PB">PB</option>
                <option value="PE">PE</option>
                <option value="RN">RN</option>
                <option value="CE">CE</option>
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                <option value="MG">MG</option>
              </Select>
            </FormField>

            <FormField label="CEP">
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
              <SimpleBooleanSetting
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

              <SimpleBooleanSetting
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

              <SimpleBooleanSetting
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

              <SimpleBooleanSetting
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

              <SimpleBooleanSetting
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
              <FormField label="Fuso horário">
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

              <FormField label="Formato de data">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Especialidades ativas"
          value={String(
            systemSettings.specialties.filter(
              (
                item
              ) =>
                item.active
            ).length
          )}
        />

        <SummaryCard
          title="Profissionais ativos"
          value={String(
            systemSettings.professionals.filter(
              (
                item
              ) =>
                item.active
            ).length
          )}
        />

        <SummaryCard
          title="Salas ativas"
          value={String(
            systemSettings.rooms.filter(
              (
                item
              ) =>
                item.active
            ).length
          )}
        />
      </div>
    </>
  );
}

function SpecialtiesSettingsSection({
  settings,
  specialtyName,
  specialtyValue,
  onSpecialtyNameChange,
  onSpecialtyValueChange,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  settings:
    SystemSettings;

  specialtyName:
    string;

  specialtyValue:
    string;

  onSpecialtyNameChange:
    (
      value:
        string
    ) => void;

  onSpecialtyValueChange:
    (
      value:
        string
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id:
        number,

      data:
        Partial<SpecialtySetting>
    ) => void;

  onToggle:
    (
      id:
        number
    ) => void;

  onRemove:
    (
      id:
        number
    ) => void;
}) {
  const activeCount =
    settings.specialties.filter(
      (
        item
      ) =>
        item.active
    ).length;

  const averageValue =
    settings.specialties.length >
      0
      ? settings.specialties.reduce(
          (
            total,
            specialty
          ) =>
            total +
            specialty.value,
          0
        ) /
        settings.specialties.length
      : 0;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Especialidades"
          value={String(
            settings.specialties.length
          )}
        />

        <SummaryCard
          title="Ativas"
          value={String(
            activeCount
          )}
        />

        <SummaryCard
          title="Valor médio"
          value={
            formatCurrency(
              averageValue
            )
          }
        />
      </div>

      <PageCard
        title="Especialidades"
        description="Gerencie as especialidades disponíveis na clínica."
      >
        <div className="space-y-4">
          {settings.specialties.map(
            (
              specialty
            ) => (
              <div
                key={
                  specialty.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_160px_auto]">
                  <FormField label="Especialidade">
                    <Input
                      value={
                        specialty.name
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          specialty.id,
                          {
                            name:
                              event.target.value,
                          }
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Valor padrão">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        specialty.value
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          specialty.id,
                          {
                            value:
                              Number(
                                event.target.value
                              ) ||
                              0,
                          }
                        )
                      }
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Status
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onToggle(
                          specialty.id
                        )
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        specialty.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {specialty.active
                        ? "Ativa"
                        : "Inativa"}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          specialty.id
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Nova Especialidade"
        description="Cadastre uma nova área de atendimento."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px_auto]">
          <FormField
            label="Nome"
            required
          >
            <Input
              value={
                specialtyName
              }
              onChange={(
                event
              ) =>
                onSpecialtyNameChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Valor padrão"
            required
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={
                specialtyValue
              }
              onChange={(
                event
              ) =>
                onSpecialtyValueChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={
                onAdd
              }
            >
              <Plus
                size={17}
              />

              Adicionar
            </Button>
          </div>
        </div>
      </PageCard>
    </>
  );
}

function ProfessionalsSettingsSection({
  settings,
  activeSpecialties,
  professionalName,
  professionalSpecialty,
  professionalRegistration,
  professionalValue,
  onNameChange,
  onSpecialtyChange,
  onRegistrationChange,
  onValueChange,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  settings:
    SystemSettings;

  activeSpecialties:
    SpecialtySetting[];

  professionalName:
    string;

  professionalSpecialty:
    string;

  professionalRegistration:
    string;

  professionalValue:
    string;

  onNameChange:
    (
      value:
        string
    ) => void;

  onSpecialtyChange:
    (
      value:
        string
    ) => void;

  onRegistrationChange:
    (
      value:
        string
    ) => void;

  onValueChange:
    (
      value:
        string
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id:
        number,

      data:
        Partial<ProfessionalSetting>
    ) => void;

  onToggle:
    (
      id:
        number
    ) => void;

  onRemove:
    (
      id:
        number
    ) => void;
}) {
  return (
    <>
      <PageCard
        title="Profissionais"
        description="Gerencie os profissionais disponíveis para atendimento."
      >
        <div className="space-y-4">
          {settings.professionals.map(
            (
              professional
            ) => (
              <div
                key={
                  professional.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr_180px_140px_auto]">
                  <FormField label="Nome">
                    <Input
                      value={
                        professional.name
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          professional.id,
                          {
                            name:
                              event.target.value,
                          }
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Especialidade">
                    <Select
                      value={
                        professional.specialty
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          professional.id,
                          {
                            specialty:
                              event.target.value,
                          }
                        )
                      }
                    >
                      {settings.specialties.map(
                        (
                          specialty
                        ) => (
                          <option
                            key={
                              specialty.id
                            }
                            value={
                              specialty.name
                            }
                          >
                            {
                              specialty.name
                            }
                          </option>
                        )
                      )}
                    </Select>
                  </FormField>

                  <FormField label="Registro">
                    <Input
                      value={
                        professional.registration
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          professional.id,
                          {
                            registration:
                              event.target.value,
                          }
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Valor próprio">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        professional.customValue ??
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          professional.id,
                          {
                            customValue:
                              event.target.value
                                ? Number(
                                    event.target.value
                                  )
                                : undefined,
                          }
                        )
                      }
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Status
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onToggle(
                          professional.id
                        )
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        professional.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {professional.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          professional.id
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Novo Profissional"
        description="Cadastre um novo profissional."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_180px_auto]">
          <FormField
            label="Nome"
            required
          >
            <Input
              value={
                professionalName
              }
              onChange={(
                event
              ) =>
                onNameChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Especialidade"
            required
          >
            <Select
              value={
                professionalSpecialty
              }
              onChange={(
                event
              ) =>
                onSpecialtyChange(
                  event.target.value
                )
              }
            >
              <option value="">
                Selecione
              </option>

              {activeSpecialties.map(
                (
                  specialty
                ) => (
                  <option
                    key={
                      specialty.id
                    }
                    value={
                      specialty.name
                    }
                  >
                    {
                      specialty.name
                    }
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField label="Registro">
            <Input
              value={
                professionalRegistration
              }
              onChange={(
                event
              ) =>
                onRegistrationChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField label="Valor próprio">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={
                professionalValue
              }
              onChange={(
                event
              ) =>
                onValueChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={
                onAdd
              }
            >
              <Plus
                size={17}
              />

              Adicionar
            </Button>
          </div>
        </div>
      </PageCard>
    </>
  );
}

function ConveniosSettingsSection({
  settings,
  convenioName,
  convenioDiscount,
  onNameChange,
  onDiscountChange,
  onAdd,
  onUpdate,
  onToggle,
  onSpecialtyValueChange,
  onRemove,
}: {
  settings:
    SystemSettings;

  convenioName:
    string;

  convenioDiscount:
    string;

  onNameChange:
    (
      value:
        string
    ) => void;

  onDiscountChange:
    (
      value:
        string
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id:
        number,

      data:
        Partial<ConvenioSetting>
    ) => void;

  onToggle:
    (
      id:
        number
    ) => void;

  onSpecialtyValueChange:
    (
      convenioId:
        number,

      specialtyName:
        string,

      value:
        string
    ) => void;

  onRemove:
    (
      id:
        number
    ) => void;
}) {
  return (
    <>
      <PageCard
        title="Convênios"
        description="Defina os convênios aceitos e suas regras de cobrança."
      >
        <div className="space-y-5">
          {settings.convenios.map(
            (
              convenio
            ) => (
              <div
                key={
                  convenio.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_140px_auto]">
                  <FormField label="Convênio">
                    <Input
                      value={
                        convenio.name
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          convenio.id,
                          {
                            name:
                              event.target.value,
                          }
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Desconto (%)">
                    <Input
                      type="number"
                      value={
                        convenio.discountPercent
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdate(
                          convenio.id,
                          {
                            discountPercent:
                              Number(
                                event.target.value
                              ) ||
                              0,
                          }
                        )
                      }
                    />
                  </FormField>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Status
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onToggle(
                          convenio.id
                        )
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        convenio.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {convenio.active
                        ? "Ativo"
                        : "Inativo"}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          convenio.id
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {settings.specialties.map(
                    (
                      specialty
                    ) => (
                      <FormField
                        key={
                          specialty.id
                        }
                        label={
                          specialty.name
                        }
                      >
                        <Input
                          type="number"
                          value={
                            convenio
                              .specialtyValues[
                              specialty.name
                            ] ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            onSpecialtyValueChange(
                              convenio.id,
                              specialty.name,
                              event.target.value
                            )
                          }
                        />
                      </FormField>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Novo Convênio"
        description="Cadastre um novo convênio."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px_auto]">
          <FormField
            label="Nome"
            required
          >
            <Input
              value={
                convenioName
              }
              onChange={(
                event
              ) =>
                onNameChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField label="Desconto padrão (%)">
            <Input
              type="number"
              value={
                convenioDiscount
              }
              onChange={(
                event
              ) =>
                onDiscountChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={
                onAdd
              }
            >
              <Plus
                size={17}
              />

              Adicionar
            </Button>
          </div>
        </div>
      </PageCard>
    </>
  );
}

function RoomsSettingsSection({
  settings,
  roomName,
  onRoomNameChange,
  onAdd,
  onUpdate,
  onToggle,
  onRemove,
}: {
  settings:
    SystemSettings;

  roomName:
    string;

  onRoomNameChange:
    (
      value:
        string
    ) => void;

  onAdd:
    () => void;

  onUpdate:
    (
      id:
        number,

      data:
        Partial<RoomSetting>
    ) => void;

  onToggle:
    (
      id:
        number
    ) => void;

  onRemove:
    (
      id:
        number
    ) => void;
}) {
  return (
    <>
      <PageCard
        title="Salas de Atendimento"
        description="Gerencie os ambientes disponíveis para os agendamentos."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {settings.rooms.map(
            (
              room
            ) => (
              <div
                key={
                  room.id
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <DoorOpen
                      size={22}
                    />
                  </div>

                  <div className="flex-1">
                    <FormField label="Nome da sala">
                      <Input
                        value={
                          room.name
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdate(
                            room.id,
                            {
                              name:
                                event.target.value,
                            }
                          )
                        }
                      />
                    </FormField>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onToggle(
                            room.id
                          )
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                          room.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {room.active
                          ? "Ativa"
                          : "Inativa"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onRemove(
                            room.id
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </PageCard>

      <PageCard
        title="Nova Sala"
        description="Cadastre um novo ambiente de atendimento."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto]">
          <FormField
            label="Nome da sala"
            required
          >
            <Input
              value={
                roomName
              }
              onChange={(
                event
              ) =>
                onRoomNameChange(
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={
                onAdd
              }
            >
              <Plus
                size={17}
              />

              Adicionar sala
            </Button>
          </div>
        </div>
      </PageCard>
    </>
  );
}

function SimpleBooleanSetting({
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
      value:
        boolean
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

        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          Esta área será implementada nas próximas etapas.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

function formatCurrency(
  value:
    number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    }
  ).format(
    value
  );
}