import type { ScheduleBlock } from "./ScheduleBlocksView";
import { getDefaultClinicUnitId } from "@/pages/Configuracoes/clinicUnitStorage";

export type BlockRequestStatus =
  | "Pendente"
  | "Aprovado"
  | "Recusado";

export interface BlockRequest {
  id: number;
  unitId: number;
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

    const parsed = JSON.parse(stored) as Array<
      BlockRequest | Omit<BlockRequest, "unitId">
    >;
    const defaultUnitId = getDefaultClinicUnitId();
    let changed = false;
    const normalized = parsed.map((request) => {
      const savedUnitId = Number((request as Partial<BlockRequest>).unitId);
      if (Number.isFinite(savedUnitId) && savedUnitId > 0) {
        return { ...request, unitId: savedUnitId } as BlockRequest;
      }
      changed = true;
      return { ...request, unitId: defaultUnitId } as BlockRequest;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
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
