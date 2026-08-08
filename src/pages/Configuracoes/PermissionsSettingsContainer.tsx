import {
  Plus,
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import PermissionsSettingsSection from "./PermissionsSettingsSection";

import {
  saveSystemSettings,
  type ModulePermission,
  type PermissionModuleKey,
  type PermissionsSettings,
  type SystemSettings,
} from "./settingsStorage";

interface Props {
  settings:
    SystemSettings;

  onSettingsChange:
    (
      settings:
        SystemSettings
    ) => void;

  onFeedback:
    (
      message:
        string
    ) => void;
}

const emptyPermission: ModulePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  manage: false,
};

const moduleKeys: PermissionModuleKey[] = [
  "dashboard",
  "patients",
  "agenda",
  "professionals",
  "financial",
  "evolutions",
  "documents",
  "reports",
  "settings",
];

export default function PermissionsSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    permissions:
      PermissionsSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      permissions,
    };

    onSettingsChange(
      nextSettings
    );
  }

  function handleAddProfile() {
    const modules =
      moduleKeys.reduce(
        (
          accumulator,
          module
        ) => {
          accumulator[
            module
          ] = {
            ...emptyPermission,
          };

          return accumulator;
        },
        {} as Record<
          PermissionModuleKey,
          ModulePermission
        >
      );

    const nextSettings:
      SystemSettings = {
      ...settings,

      permissions: {
        ...settings.permissions,

        profiles: [
          ...settings.permissions.profiles,

          {
            id:
              Date.now(),

            name:
              `Novo Perfil ${
                settings.permissions.profiles.length +
                1
              }`,

            description:
              "Perfil personalizado.",

            active:
              true,

            systemProfile:
              false,

            modules,
          },
        ],
      },
    };

    onSettingsChange(
      nextSettings
    );

    onFeedback(
      "Novo perfil criado. Configure as permissões abaixo."
    );
  }

  function handleRemoveProfile(
    id:
      number
  ) {
    const profile =
      settings.permissions.profiles.find(
        (
          item
        ) =>
          item.id ===
          id
      );

    if (
      !profile
    ) {
      return;
    }

    if (
      profile.systemProfile
    ) {
      onFeedback(
        "Perfis padrão do sistema não podem ser excluídos."
      );

      return;
    }

    const nextSettings:
      SystemSettings = {
      ...settings,

      permissions: {
        ...settings.permissions,

        profiles:
          settings.permissions.profiles.filter(
            (
              item
            ) =>
              item.id !==
              id
          ),
      },
    };

    onSettingsChange(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );

    onFeedback(
      "Perfil excluído com sucesso."
    );
  }

  function handleSave() {
    saveSystemSettings(
      settings
    );

    onFeedback(
      "Perfis e permissões salvos com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={
            handleAddProfile
          }
        >
          <Plus
            size={17}
          />

          Novo perfil
        </Button>

        <Button
          type="button"
          onClick={
            handleSave
          }
        >
          <Save
            size={17}
          />

          Salvar permissões
        </Button>
      </div>

      <PermissionsSettingsSection
        settings={
          settings.permissions
        }

        onChange={
          handleChange
        }

        onRemoveProfile={
          handleRemoveProfile
        }
      />
    </div>
  );
}