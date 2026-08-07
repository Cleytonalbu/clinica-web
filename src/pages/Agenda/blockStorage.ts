import type { ScheduleBlock } from "./ScheduleBlocksView";

const STORAGE_KEY =
  "entre-afetos-schedule-blocks";

export function getSavedBlocks(): ScheduleBlock[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    return JSON.parse(
      stored
    ) as ScheduleBlock[];
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
}