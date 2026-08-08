import {
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import GeneralSettingsSection from "./GeneralSettingsSection";

import {
  saveSystemSettings,
  type GeneralSettings,
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

export default function GeneralSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    general:
      GeneralSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      general,
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
      "Configurações gerais salvas com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <GeneralSettingsSection
        settings={
          settings.general
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

          Salvar configurações gerais
        </Button>
      </div>
    </div>
  );
}