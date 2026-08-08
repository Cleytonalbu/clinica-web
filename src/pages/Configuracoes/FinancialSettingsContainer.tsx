import {
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import FinancialSettingsSection from "./FinancialSettingsSection";

import {
  saveSystemSettings,
  type FinancialSettings,
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

export default function FinancialSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    financial:
      FinancialSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      financial,
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
      "Configurações financeiras salvas com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <FinancialSettingsSection
        settings={
          settings.financial
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

          Salvar financeiro
        </Button>
      </div>
    </div>
  );
}