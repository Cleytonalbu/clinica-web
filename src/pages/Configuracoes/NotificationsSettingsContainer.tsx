import {
  Save,
} from "lucide-react";

import {
  Button,
} from "@/components/ui";

import NotificationsSettingsSection from "./NotificationsSettingsSection";

import {
  saveSystemSettings,
  type NotificationSettings,
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

export default function NotificationsSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  function handleChange(
    notifications:
      NotificationSettings
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      notifications,
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
      "Configurações de notificações salvas com sucesso."
    );
  }

  return (
    <div className="space-y-6">
      <NotificationsSettingsSection
        settings={
          settings.notifications
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

          Salvar notificações
        </Button>
      </div>
    </div>
  );
}