import {
  useState,
} from "react";

import EvolutionModelsSettingsSection from "./EvolutionModelsSettingsSection";

import {
  defaultEvolutionFields,
  saveSystemSettings,
  type EvolutionModelFields,
  type EvolutionModelSetting,
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

export default function EvolutionModelsSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  const [
    modelName,
    setModelName,
  ] =
    useState("");

  const [
    modelSpecialty,
    setModelSpecialty,
  ] =
    useState("");

  const [
    modelDescription,
    setModelDescription,
  ] =
    useState("");

  const [
    modelFields,
    setModelFields,
  ] =
    useState<EvolutionModelFields>(
      () => ({
        ...defaultEvolutionFields,
      })
    );

  function persist(
    nextSettings:
      SystemSettings
  ) {
    onSettingsChange(
      nextSettings
    );

    saveSystemSettings(
      nextSettings
    );
  }

  function handleAdd() {
    const name =
      modelName.trim();

    const description =
      modelDescription.trim();

    if (
      !name
    ) {
      onFeedback(
        "Informe o nome do modelo."
      );

      return;
    }

    if (
      !modelSpecialty
    ) {
      onFeedback(
        "Selecione a especialidade."
      );

      return;
    }

    const hasSelectedField =
      Object.values(
        modelFields
      ).some(
        (
          value
        ) =>
          value
      );

    if (
      !hasSelectedField
    ) {
      onFeedback(
        "Selecione pelo menos um campo para o modelo."
      );

      return;
    }

    const alreadyExists =
      settings.evolutionModels.some(
        (
          model
        ) =>
          model.name
            .trim()
            .toLowerCase() ===
            name.toLowerCase()
      );

    if (
      alreadyExists
    ) {
      onFeedback(
        "Já existe um modelo com esse nome."
      );

      return;
    }

    const newModel:
      EvolutionModelSetting = {
      id:
        Date.now(),

      name,

      specialty:
        modelSpecialty,

      description,

      active:
        true,

      fields: {
        ...modelFields,
      },
    };

    const nextSettings:
      SystemSettings = {
      ...settings,

      evolutionModels: [
        ...settings.evolutionModels,
        newModel,
      ],
    };

    persist(
      nextSettings
    );

    setModelName(
      ""
    );

    setModelSpecialty(
      ""
    );

    setModelDescription(
      ""
    );

    setModelFields({
      ...defaultEvolutionFields,
    });

    onFeedback(
      "Modelo de evolução adicionado com sucesso."
    );
  }

  function handleUpdate(
    id:
      number,

    data:
      Partial<EvolutionModelSetting>
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      evolutionModels:
        settings.evolutionModels.map(
          (
            model
          ) =>
            model.id ===
            id
              ? {
                  ...model,
                  ...data,
                }
              : model
        ),
    };

    onSettingsChange(
      nextSettings
    );
  }

  function handleToggle(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      evolutionModels:
        settings.evolutionModels.map(
          (
            model
          ) =>
            model.id ===
            id
              ? {
                  ...model,

                  active:
                    !model.active,
                }
              : model
        ),
    };

    persist(
      nextSettings
    );
  }

  function handleRemove(
    id:
      number
  ) {
    const nextSettings:
      SystemSettings = {
      ...settings,

      evolutionModels:
        settings.evolutionModels.filter(
          (
            model
          ) =>
            model.id !==
            id
        ),
    };

    persist(
      nextSettings
    );

    onFeedback(
      "Modelo de evolução excluído."
    );
  }

  return (
    <EvolutionModelsSettingsSection
      models={
        settings.evolutionModels
      }

      specialties={
        settings.specialties
      }

      modelName={
        modelName
      }

      modelSpecialty={
        modelSpecialty
      }

      modelDescription={
        modelDescription
      }

      modelFields={
        modelFields
      }

      onModelNameChange={
        setModelName
      }

      onModelSpecialtyChange={
        setModelSpecialty
      }

      onModelDescriptionChange={
        setModelDescription
      }

      onModelFieldsChange={
        setModelFields
      }

      onAdd={
        handleAdd
      }

      onUpdate={
        handleUpdate
      }

      onToggle={
        handleToggle
      }

      onRemove={
        handleRemove
      }
    />
  );
}