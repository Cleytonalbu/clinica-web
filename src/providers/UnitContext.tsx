import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getActiveClinicUnits, getClinicUnitById, getStoredActiveUnitId, setStoredActiveUnitId, type ClinicUnit } from "@/pages/Configuracoes/clinicUnitStorage";
import { useAuth } from "@/auth/AuthContext";
import { getAllowedUnitIdsForUser } from "@/pages/Configuracoes/userUnitAccessStorage";

interface UnitContextValue {
  activeUnit: ClinicUnit;
  activeUnitId: number;
  availableUnits: ClinicUnit[];
  hasMultipleUnits: boolean;
  setActiveUnit: (unitId: number) => void;
  refreshUnits: () => void;
}

const UnitContext = createContext<UnitContextValue | undefined>(undefined);

function loadUnitState(
  user: ReturnType<typeof useAuth>["user"]
) {
  const allActiveUnits =
    getActiveClinicUnits();

  const allowedIds =
    user
      ? getAllowedUnitIdsForUser(
          user
        )
      : allActiveUnits.map(
          (
            unit
          ) =>
            unit.id
        );

  const availableUnits =
    allActiveUnits.filter(
      (
        unit
      ) =>
        allowedIds.includes(
          unit.id
        )
    );

  if (
    availableUnits.length ===
    0
  ) {
    throw new Error(
      "Este usuário não possui acesso a nenhuma unidade ativa."
    );
  }

  const storedActiveId =
    getStoredActiveUnitId();

  const activeUnit =
    availableUnits.find(
      (
        unit
      ) =>
        unit.id ===
        storedActiveId
    ) ??
    availableUnits[0];

  if (
    activeUnit.id !==
    storedActiveId
  ) {
    setStoredActiveUnitId(
      activeUnit.id
    );
  }

  return {
    availableUnits,
    activeUnit,
  };
}

export function UnitProvider({ children }: { children: ReactNode }) {
  const {
    user,
  } =
    useAuth();

  const [state, setState] =
    useState(
      () =>
        loadUnitState(
          user
        )
    );

  useEffect(
    () => {
      setState(
        loadUnitState(
          user
        )
      );
    },
    [
      user,
    ]
  );

  const setActiveUnit =
    useCallback(
      (
        unitId: number
      ) => {
        const allowed =
          state.availableUnits.some(
            (
              unit
            ) =>
              unit.id ===
              unitId
          );

        if (
          !allowed
        ) {
          throw new Error(
            "Você não possui acesso a esta unidade."
          );
        }

        setStoredActiveUnitId(
          unitId
        );

        setState(
          loadUnitState(
            user
          )
        );
      },
      [
        state.availableUnits,
        user,
      ]
    );

  const refreshUnits =
    useCallback(
      () => {
        setState(
          loadUnitState(
            user
          )
        );
      },
      [
        user,
      ]
    );

  const value = useMemo<UnitContextValue>(() => ({
    activeUnit: state.activeUnit,
    activeUnitId: state.activeUnit.id,
    availableUnits: state.availableUnits,
    hasMultipleUnits: state.availableUnits.length > 1,
    setActiveUnit,
    refreshUnits,
  }), [state, setActiveUnit, refreshUnits]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) throw new Error("useUnit deve ser utilizado dentro de UnitProvider.");
  return context;
}