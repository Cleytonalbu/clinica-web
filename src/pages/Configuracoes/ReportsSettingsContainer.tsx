import {
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import ReportsSettingsSection from "./ReportsSettingsSection";

import {
  saveSystemSettings,
  type ReportsSettings,
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

export default function ReportsSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    reports:
      ReportsSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      reports,
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
      "Configurações de relatórios salvas com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <ReportsSettingsSection
        settings={
          settings.reports
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

          Salvar relatórios
        </Button>
      </div>
    </div>
  );
}