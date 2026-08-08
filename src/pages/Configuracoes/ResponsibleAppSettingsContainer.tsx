import {
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import ResponsibleAppSettingsSection from "./ResponsibleAppSettingsSection";

import {
  saveSystemSettings,
  type ResponsibleAppSettings,
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

export default function ResponsibleAppSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    responsibleApp:
      ResponsibleAppSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      responsibleApp,
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
      "Configurações do aplicativo salvas com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <ResponsibleAppSettingsSection
        settings={
          settings.responsibleApp
        }

        onChange={
          handleChange
        }
      />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={
            handleSave
          }
        >
          <Save
            size={17}
          />

          Salvar aplicativo
        </Button>
      </div>
    </div>
  );
}