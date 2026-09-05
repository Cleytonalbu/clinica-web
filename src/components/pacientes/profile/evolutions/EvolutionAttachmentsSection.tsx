import {
  useMemo,
  useState,
} from "react";

import {
  File,
  FolderOpen,
  FolderPlus,
  Image,
  Paperclip,
  Trash2,
  Video,
} from "lucide-react";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  createPatientDocumentFolder,
  getPatientDocumentFolders,
} from "@/pages/Pacientes/patientDocumentFolderStorage";

interface EvolutionAttachmentsSectionProps {
  patientId: number;
  professionalName: string;
  files: File[];
  folderIds: Array<string | null>;
  onChange: (files: File[]) => void;
  onFolderIdsChange:
    (
      folderIds:
        Array<string | null>
    ) => void;
}

export function EvolutionAttachmentsSection({
  patientId,
  professionalName,
  files,
  folderIds,
  onChange,
  onFolderIdsChange,
}: EvolutionAttachmentsSectionProps) {
  const [
    selectedFolderId,
    setSelectedFolderId,
  ] =
    useState(
      ""
    );

  const [
    folderRefreshKey,
    setFolderRefreshKey,
  ] =
    useState(
      0
    );

  const [
    createFolderOpen,
    setCreateFolderOpen,
  ] =
    useState(
      false
    );

  const [
    newFolderName,
    setNewFolderName,
  ] =
    useState(
      ""
    );

  const [
    folderFeedback,
    setFolderFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const folders =
    useMemo(
      () => {
        void folderRefreshKey;

        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <=
            0
        ) {
          return [];
        }

        return getPatientDocumentFolders(
          patientId
        );
      },
      [
        patientId,
        folderRefreshKey,
      ]
    );

  function handleFiles(
    selectedFiles:
      FileList |
      null
  ) {
    if (
      !selectedFiles
    ) {
      return;
    }

    const addedFiles =
      Array.from(
        selectedFiles
      );

    onChange(
      [
        ...files,
        ...addedFiles,
      ]
    );

    onFolderIdsChange(
      [
        ...folderIds,
        ...addedFiles.map(
          () =>
            selectedFolderId ||
            null
        ),
      ]
    );
  }

  function handleDelete(
    index:
      number
  ) {
    onChange(
      files.filter(
        (
          _,
          fileIndex
        ) =>
          fileIndex !==
          index
      )
    );

    onFolderIdsChange(
      folderIds.filter(
        (
          _,
          folderIndex
        ) =>
          folderIndex !==
          index
      )
    );
  }

  function handleChangeFileFolder(
    index:
      number,

    folderId:
      string
  ) {
    const next =
      [...folderIds];

    next[
      index
    ] =
      folderId ||
      null;

    onFolderIdsChange(
      next
    );
  }

  function handleOpenCreateFolder() {
    setNewFolderName(
      ""
    );

    setFolderFeedback(
      null
    );

    setCreateFolderOpen(
      true
    );
  }

  function handleCreateFolder() {
    const name =
      newFolderName.trim();

    if (
      !name
    ) {
      setFolderFeedback(
        "Informe o nome da pasta."
      );

      return;
    }

    try {
      const folder =
        createPatientDocumentFolder(
          patientId,
          name,
          professionalName ||
            "Profissional"
        );

      setSelectedFolderId(
        folder.id
      );

      setFolderRefreshKey(
        (
          current
        ) =>
          current +
          1
      );

      setCreateFolderOpen(
        false
      );

      setNewFolderName(
        ""
      );

      setFolderFeedback(
        null
      );
    } catch (
      error
    ) {
      setFolderFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível criar a pasta."
      );
    }
  }

  return (
    <>
      <PageCard
        title="7. Anexos"
        description="Anexe documentos, fotos ou vídeos relacionados à sessão."
      >
        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="block text-xs font-semibold text-slate-700">
                Pasta para os novos anexos
              </label>

              <div className="relative mt-2">
                <FolderOpen
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
                />

                <Select
                  value={
                    selectedFolderId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedFolderId(
                      event.target.value
                    )
                  }
                  className="pl-9"
                >
                  <option value="">
                    Sem pasta
                  </option>

                  {folders.map(
                    (
                      folder
                    ) => (
                      <option
                        key={
                          folder.id
                        }
                        value={
                          folder.id
                        }
                      >
                        {
                          folder.name
                        }
                      </option>
                    )
                  )}
                </Select>
              </div>

              <p className="mt-1.5 text-[11px] text-slate-500">
                Os arquivos selecionados abaixo serão enviados para esta pasta do prontuário.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={
                handleOpenCreateFolder
              }
              className="shrink-0"
            >
              <FolderPlus
                size={16}
              />

              Nova pasta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center transition hover:bg-indigo-50">
            <Paperclip
              size={30}
              className="text-indigo-500"
            />

            <span className="mt-3 text-sm font-semibold text-slate-700">
              Clique para selecionar arquivos
            </span>

            <span className="mt-1 text-xs text-slate-500">
              JPG, PNG, PDF, MP4 ou MOV
            </span>

            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-indigo-600 shadow-sm">
              <FolderOpen
                size={13}
              />

              {
                folders.find(
                  (
                    folder
                  ) =>
                    folder.id ===
                    selectedFolderId
                )?.name ||
                "Sem pasta"
              }
            </span>

            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.mp4,.mov"
              className="hidden"
              onChange={(
                event
              ) => {
                handleFiles(
                  event.target.files
                );

                event.target.value =
                  "";
              }}
            />
          </label>

          <div className="space-y-3">
            {files.map(
              (
                file,
                index
              ) => (
                <AttachmentItem
                  key={`${file.name}-${file.lastModified}-${index}`}
                  file={
                    file
                  }
                  folderId={
                    folderIds[
                      index
                    ] ||
                    ""
                  }
                  folders={
                    folders
                  }
                  onFolderChange={(
                    folderId
                  ) =>
                    handleChangeFileFolder(
                      index,
                      folderId
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      index
                    )
                  }
                />
              )
            )}

            {files.length ===
              0 && (
              <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                Nenhum anexo adicionado.
              </div>
            )}
          </div>
        </div>
      </PageCard>

      {createFolderOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]"
          onClick={() =>
            setCreateFolderOpen(
              false
            )
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <FolderPlus
                    size={20}
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Criar nova pasta
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    A pasta será criada diretamente nos Documentos deste paciente.
                  </p>
                </div>
              </div>
            </div>

            <form
              className="p-5"
              onSubmit={(
                event
              ) => {
                event.preventDefault();

                handleCreateFolder();
              }}
            >
              <label className="block text-xs font-semibold text-slate-700">
                Nome da pasta
              </label>

              <Input
                autoFocus
                value={
                  newFolderName
                }
                onChange={(
                  event
                ) => {
                  setNewFolderName(
                    event.target.value
                  );

                  setFolderFeedback(
                    null
                  );
                }}
                placeholder="Ex.: Avaliações, Laudos, Exames..."
                className="mt-2"
              />

              {folderFeedback && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {
                    folderFeedback
                  }
                </p>
              )}

              <p className="mt-2 text-[11px] text-slate-400">
                Após criar, a nova pasta já ficará selecionada para os próximos anexos.
              </p>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCreateFolderOpen(
                      false
                    )
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={
                    !newFolderName.trim()
                  }
                >
                  <FolderPlus
                    size={16}
                  />

                  Criar pasta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

interface AttachmentItemProps {
  file: File;
  folderId: string;
  folders: Array<{
    id: string;
    name: string;
  }>;
  onFolderChange:
    (
      folderId:
        string
    ) => void;
  onDelete: () => void;
}

function AttachmentItem({
  file,
  folderId,
  folders,
  onFolderChange,
  onDelete,
}: AttachmentItemProps) {
  const icon =
    getFileIcon(
      file
    );

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          {
            icon
          }
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {
              file.name
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              formatFileSize(
                file.size
              )
            }
          </p>
        </div>

        <button
          type="button"
          onClick={
            onDelete
          }
          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
          title="Remover anexo"
        >
          <Trash2
            size={17}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <FolderOpen
          size={15}
          className="shrink-0 text-indigo-500"
        />

        <Select
          value={
            folderId
          }
          onChange={(
            event
          ) =>
            onFolderChange(
              event.target.value
            )
          }
          className="h-9 text-xs"
        >
          <option value="">
            Sem pasta
          </option>

          {folders.map(
            (
              folder
            ) => (
              <option
                key={
                  folder.id
                }
                value={
                  folder.id
                }
              >
                {
                  folder.name
                }
              </option>
            )
          )}
        </Select>
      </div>
    </div>
  );
}

function getFileIcon(
  file:
    File
) {
  if (
    file.type.startsWith(
      "image/"
    )
  ) {
    return (
      <Image
        size={20}
      />
    );
  }

  if (
    file.type.startsWith(
      "video/"
    )
  ) {
    return (
      <Video
        size={20}
      />
    );
  }

  return (
    <File
      size={20}
    />
  );
}

function formatFileSize(
  size:
    number
) {
  if (
    size <
    1024 *
      1024
  ) {
    return `${(
      size /
      1024
    ).toFixed(
      1
    )} KB`;
  }

  return `${(
    size /
    (
      1024 *
      1024
    )
  ).toFixed(
    1
  )} MB`;
}
