import { Save } from "lucide-react";

import {
  Button,
} from "@/components/ui";

import PermissionsSettingsSection from "./PermissionsSettingsSection";

import {
  saveSystemSettings,
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
      />
    </div>
  );
}
