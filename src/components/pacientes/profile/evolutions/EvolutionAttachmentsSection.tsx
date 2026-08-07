import {
  File,
  Image,
  Paperclip,
  Trash2,
  Video,
} from "lucide-react";

import { PageCard } from "@/components/ui";

interface EvolutionAttachmentsSectionProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function EvolutionAttachmentsSection({
  files,
  onChange,
}: EvolutionAttachmentsSectionProps) {
  function handleFiles(
    selectedFiles: FileList | null
  ) {
    if (!selectedFiles) {
      return;
    }

    onChange([
      ...files,
      ...Array.from(selectedFiles),
    ]);
  }

  function handleDelete(index: number) {
    onChange(
      files.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  }

  return (
    <PageCard
      title="7. Anexos"
      description="Anexe documentos, fotos ou vídeos relacionados à sessão."
    >
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

          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.mp4,.mov"
            className="hidden"
            onChange={(event) =>
              handleFiles(
                event.target.files
              )
            }
          />
        </label>

        <div className="space-y-3">
          {files.map((file, index) => (
            <AttachmentItem
              key={`${file.name}-${index}`}
              file={file}
              onDelete={() =>
                handleDelete(index)
              }
            />
          ))}

          {files.length === 0 && (
            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
              Nenhum anexo adicionado.
            </div>
          )}
        </div>
      </div>
    </PageCard>
  );
}

interface AttachmentItemProps {
  file: File;
  onDelete: () => void;
}

function AttachmentItem({
  file,
  onDelete,
}: AttachmentItemProps) {
  const icon = getFileIcon(file);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {file.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatFileSize(file.size)}
        </p>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) {
    return <Image size={20} />;
  }

  if (file.type.startsWith("video/")) {
    return <Video size={20} />;
  }

  return <File size={20} />;
}

function formatFileSize(
  size: number
) {
  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}