import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

import type { ScheduleBlock } from "./ScheduleBlocksView";

const STORAGE_KEY =
  "entre-afetos-schedule-blocks";

export const SCHEDULE_BLOCKS_CHANGED_EVENT =
  "entre-afetos:schedule-blocks-changed";

function notifyScheduleBlocksChanged() {
  window.dispatchEvent(
    new CustomEvent(
      SCHEDULE_BLOCKS_CHANGED_EVENT
    )
  );
}

export function getSavedBlocks(): ScheduleBlock[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(
        stored
      ) as Array<
        ScheduleBlock |
        Omit<
          ScheduleBlock,
          "unitId"
        >
      >;

    const defaultUnitId =
      getDefaultClinicUnitId();

    let changed =
      false;

    const normalized =
      parsed.map(
        (
          block
        ) => {
          const savedUnitId =
            Number(
              (
                block as
                  Partial<
                    ScheduleBlock
                  >
              ).unitId
            );

          if (
            Number.isFinite(
              savedUnitId
            ) &&
            savedUnitId > 0
          ) {
            return {
              ...block,
              unitId:
                savedUnitId,
            } as ScheduleBlock;
          }

          changed =
            true;

          return {
            ...block,
            unitId:
              defaultUnitId,
          } as ScheduleBlock;
        }
      );

    if (
      changed
    ) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );
    }

    return normalized;
  } catch {
    return [];
  }
}

export function saveBlock(
  block: ScheduleBlock
) {
  const current =
    getSavedBlocks();

  const next = [
    ...current,
    block,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  notifyScheduleBlocksChanged();
}

export function removeSavedBlock(
  blockId: number
) {
  const current =
    getSavedBlocks();

  const next =
    current.filter(
      (block) =>
        block.id !== blockId
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  notifyScheduleBlocksChanged();
}