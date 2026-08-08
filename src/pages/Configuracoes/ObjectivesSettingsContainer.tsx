import {
  useState,
} from "react";

import ObjectivesSettingsSection from "./ObjectivesSettingsSection";

import {
  saveSystemSettings,
  type SystemSettings,
  type TherapeuticObjectiveSetting,
} from "./settingsStorage";

interface Props {
  settings:
    SystemSettings;

  onSettingsChange:
    (
      settings: SystemSettings
    ) => void;

  onFeedback:
    (
      message: string
    ) => void;
}

export default function ObjectivesSettingsContainer({
  settings,
  onSettingsChange,
  onFeedback,
}: Props) {
  const [
    objectiveName,
    setObjectiveName,
  ] =
    useState("");

  const [
    objectiveCategory,
    setObjectiveCategory,
  ] =
    useState("");

  const [
    objectiveSpecialty,
    setObjectiveSpecialty,
  ] =
    useState("");

  const [
    objectiveDescription,
    setObjectiveDescription,
  ] =
    useState("");

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
      objectiveName.trim();

    const category =
      objectiveCategory.trim();

    const description =
      objectiveDescription.trim();

    if (!name) {
      onFeedback(
        "Informe o nome do objetivo."
      );

      return;
    }

    if (!category) {
      onFeedback(
        "Informe a categoria do objetivo."
      );

      return;
    }

    if (
      !objectiveSpecialty
    ) {
      onFeedback(
        "Selecione a especialidade."
      );

      return;
    }

    const alreadyExists =
      settings.objectives.some(
        (
          objective
        ) =>
          objective.name
            .trim()
            .toLowerCase() ===
            name.toLowerCase() &&
          objective.specialty ===
            objectiveSpecialty
      );

    if (
      alreadyExists
    ) {
      onFeedback(
        "Já existe um objetivo com esse nome para esta especialidade."
      );

      return;
    }

    const newObjective:
      TherapeuticObjectiveSetting = {
      id:
        Date.now(),

      name,

      category,

      specialty:
        objectiveSpecialty,

      description,

      active:
        true,
    };

    const nextSettings: SystemSettings = {
      ...settings,

      objectives: [
        ...settings.objectives,
        newObjective,
      ],
    };

    persist(
      nextSettings
    );

    setObjectiveName(
      ""
    );

    setObjectiveCategory(
      ""
    );

    setObjectiveSpecialty(
      ""
    );

    setObjectiveDescription(
      ""
    );

    onFeedback(
      "Objetivo terapêutico adicionado com sucesso."
    );
  }

  function handleUpdate(
    id: number,
    data:
      Partial<TherapeuticObjectiveSetting>
  ) {
    const nextSettings: SystemSettings = {
      ...settings,

      objectives:
        settings.objectives.map(
          (
            objective
          ) =>
            objective.id ===
            id
              ? {
                  ...objective,
                  ...data,
                }
              : objective
        ),
    };

    onSettingsChange(
      nextSettings
    );
  }

  function handleToggle(
    id: number
  ) {
    const nextSettings: SystemSettings = {
      ...settings,

      objectives:
        settings.objectives.map(
          (
            objective
          ) =>
            objective.id ===
            id
              ? {
                  ...objective,

                  active:
                    !objective.active,
                }
              : objective
        ),
    };

    persist(
      nextSettings
    );
  }

  function handleRemove(
    id: number
  ) {
    const nextSettings: SystemSettings = {
      ...settings,

      objectives:
        settings.objectives.filter(
          (
            objective
          ) =>
            objective.id !==
            id
        ),
    };

    persist(
      nextSettings
    );

    onFeedback(
      "Objetivo terapêutico excluído."
    );
  }

  return (
    <ObjectivesSettingsSection
      objectives={
        settings.objectives
      }

      specialties={
        settings.specialties
      }

      objectiveName={
        objectiveName
      }

      objectiveCategory={
        objectiveCategory
      }

      objectiveSpecialty={
        objectiveSpecialty
      }

      objectiveDescription={
        objectiveDescription
      }

      onObjectiveNameChange={
        setObjectiveName
      }

      onObjectiveCategoryChange={
        setObjectiveCategory
      }

      onObjectiveSpecialtyChange={
        setObjectiveSpecialty
      }

      onObjectiveDescriptionChange={
        setObjectiveDescription
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