export interface PatientDocumentFolder {
  id: string;
  patientId: number;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientDocumentFolderState {
  folders: PatientDocumentFolder[];
  assignments: Record<string, string>;
}

const STORAGE_KEY =
  "entre-afetos-patient-document-folders";

function readState(): PatientDocumentFolderState {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return {
        folders: [],
        assignments: {},
      };
    }

    const parsed =
      JSON.parse(
        raw
      );

    return {
      folders:
        Array.isArray(
          parsed?.folders
        )
          ? parsed.folders
          : [],

      assignments:
        parsed?.assignments &&
        typeof parsed.assignments ===
          "object"
          ? parsed.assignments
          : {},
    };
  } catch {
    return {
      folders: [],
      assignments: {},
    };
  }
}

function writeState(
  state:
    PatientDocumentFolderState
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      state
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      "entre-afetos:patient-document-folders-changed"
    )
  );
}

export function getPatientDocumentFolders(
  patientId:
    number
) {
  return readState()
    .folders
    .filter(
      (
        folder
      ) =>
        folder.patientId ===
        patientId
    )
    .sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name,
          "pt-BR"
        )
    );
}

export function createPatientDocumentFolder(
  patientId:
    number,

  name:
    string,

  createdBy:
    string
) {
  const normalizedName =
    name.trim();

  if (
    !normalizedName
  ) {
    throw new Error(
      "Informe o nome da pasta."
    );
  }

  const state =
    readState();

  const duplicated =
    state.folders.some(
      (
        folder
      ) =>
        folder.patientId ===
          patientId &&
        folder.name
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          ) ===
          normalizedName
            .toLocaleLowerCase(
              "pt-BR"
            )
    );

  if (
    duplicated
  ) {
    throw new Error(
      "Já existe uma pasta com este nome para o paciente."
    );
  }

  const now =
    new Date()
      .toISOString();

  const folder:
    PatientDocumentFolder = {
      id:
        crypto.randomUUID?.() ??
        `folder-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      patientId,

      name:
        normalizedName,

      createdBy,

      createdAt:
        now,

      updatedAt:
        now,
    };

  writeState(
    {
      ...state,

      folders: [
        ...state.folders,
        folder,
      ],
    }
  );

  return folder;
}

export function renamePatientDocumentFolder(
  folderId:
    string,

  name:
    string
) {
  const normalizedName =
    name.trim();

  if (
    !normalizedName
  ) {
    throw new Error(
      "Informe o novo nome da pasta."
    );
  }

  const state =
    readState();

  const currentFolder =
    state.folders.find(
      (
        folder
      ) =>
        folder.id ===
        folderId
    );

  if (
    !currentFolder
  ) {
    throw new Error(
      "Pasta não encontrada."
    );
  }

  const duplicated =
    state.folders.some(
      (
        folder
      ) =>
        folder.id !==
          folderId &&
        folder.patientId ===
          currentFolder.patientId &&
        folder.name
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          ) ===
          normalizedName
            .toLocaleLowerCase(
              "pt-BR"
            )
    );

  if (
    duplicated
  ) {
    throw new Error(
      "Já existe outra pasta com este nome."
    );
  }

  writeState(
    {
      ...state,

      folders:
        state.folders.map(
          (
            folder
          ) =>
            folder.id ===
              folderId
              ? {
                  ...folder,

                  name:
                    normalizedName,

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : folder
        ),
    }
  );
}

export function getPatientDocumentFolderId(
  patientId:
    number,

  documentKey:
    string
) {
  const state =
    readState();

  const folderId =
    state.assignments[
      `${patientId}:${documentKey}`
    ];

  return folderId ||
    null;
}

export function movePatientDocumentToFolder(
  patientId:
    number,

  documentKey:
    string,

  folderId:
    string |
    null
) {
  const state =
    readState();

  const assignmentKey =
    `${patientId}:${documentKey}`;

  const nextAssignments = {
    ...state.assignments,
  };

  if (
    folderId
  ) {
    const folderExists =
      state.folders.some(
        (
          folder
        ) =>
          folder.id ===
            folderId &&
          folder.patientId ===
            patientId
      );

    if (
      !folderExists
    ) {
      throw new Error(
        "A pasta selecionada não existe."
      );
    }

    nextAssignments[
      assignmentKey
    ] =
      folderId;
  } else {
    delete nextAssignments[
      assignmentKey
    ];
  }

  writeState(
    {
      ...state,

      assignments:
        nextAssignments,
    }
  );
}

export function countDocumentsInPatientFolder(
  patientId:
    number,

  folderId:
    string,

  documentKeys:
    string[]
) {
  return documentKeys.filter(
    (
      documentKey
    ) =>
      getPatientDocumentFolderId(
        patientId,
        documentKey
      ) ===
        folderId
  ).length;
}

export function deletePatientDocumentFolder(
  patientId:
    number,

  folderId:
    string
) {
  const state =
    readState();

  const nextAssignments = {
    ...state.assignments,
  };

  Object.keys(
    nextAssignments
  ).forEach(
    (
      key
    ) => {
      if (
        key.startsWith(
          `${patientId}:`
        ) &&
        nextAssignments[
          key
        ] ===
          folderId
      ) {
        delete nextAssignments[
          key
        ];
      }
    }
  );

  writeState(
    {
      folders:
        state.folders.filter(
          (
            folder
          ) =>
            !(
              folder.patientId ===
                patientId &&
              folder.id ===
                folderId
            )
        ),

      assignments:
        nextAssignments,
    }
  );
}
