import type { ScheduleBlock } from "./ScheduleBlocksView";

export type BlockRequestStatus =
  | "Pendente"
  | "Aprovado"
  | "Recusado";

export interface BlockRequest {
  id: number;
  professional: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ScheduleBlock["type"];
  reason: string;
  status: BlockRequestStatus;
  createdAt: string;
  reviewedAt?: string;
}

const STORAGE_KEY =
  "entre-afetos-schedule-block-requests";

export function getBlockRequests(): BlockRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as BlockRequest[];
  } catch {
    return [];
  }
}

export function saveBlockRequest(
  request: BlockRequest
) {
  const current = getBlockRequests();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      ...current,
      request,
    ])
  );
}

export function updateBlockRequestStatus(
  requestId: number,
  status: BlockRequestStatus
) {
  const current = getBlockRequests();

  const next = current.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status,
          reviewedAt: new Date().toISOString(),
        }
      : request
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );
}