import {
  getDefaultClinicUnitId,
} from "./clinicUnitStorage";

const STORAGE_KEY =
  "entre-afetos-room-units";

interface RoomUnitLink {
  roomId: number;
  unitId: number;
}

function getLinks(): RoomUnitLink[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ) =>
          item &&
          Number.isFinite(
            Number(
              item.roomId
            )
          ) &&
          Number.isFinite(
            Number(
              item.unitId
            )
          )
      )
      .map(
        (
          item
        ) => ({
          roomId:
            Number(
              item.roomId
            ),

          unitId:
            Number(
              item.unitId
            ),
        })
      );
  } catch {
    return [];
  }
}

function saveLinks(
  links: RoomUnitLink[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      links
    )
  );
}

export function getRoomUnitIds(
  roomId: number
) {
  const links =
    getLinks().filter(
      (
        item
      ) =>
        item.roomId ===
        roomId
    );

  if (
    links.length ===
    0
  ) {
    return [
      getDefaultClinicUnitId(),
    ];
  }

  return Array.from(
    new Set(
      links.map(
        (
          item
        ) =>
          item.unitId
      )
    )
  );
}

export function roomWorksAtUnit(
  roomId: number,
  unitId: number
) {
  return getRoomUnitIds(
    roomId
  ).includes(
    unitId
  );
}

export function setRoomUnits(
  roomId: number,
  unitIds: number[]
) {
  const normalizedIds =
    Array.from(
      new Set(
        unitIds
          .map(
            Number
          )
          .filter(
            (
              unitId
            ) =>
              Number.isFinite(
                unitId
              ) &&
              unitId >
                0
          )
      )
    );

  const otherLinks =
    getLinks().filter(
      (
        item
      ) =>
        item.roomId !==
        roomId
    );

  const nextLinks = [
    ...otherLinks,

    ...normalizedIds.map(
      (
        unitId
      ) => ({
        roomId,
        unitId,
      })
    ),
  ];

  saveLinks(
    nextLinks
  );
}

export function setRoomUnit(
  roomId: number,
  unitId: number
) {
  setRoomUnits(
    roomId,
    [
      unitId,
    ]
  );
}

export function removeRoomUnitLinks(
  roomId: number
) {
  saveLinks(
    getLinks().filter(
      (
        item
      ) =>
        item.roomId !==
        roomId
    )
  );
}