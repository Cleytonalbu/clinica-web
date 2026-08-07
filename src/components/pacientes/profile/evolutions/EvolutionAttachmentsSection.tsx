import { useState } from "react";
import {
  File,
  Image,
  Paperclip,
  Trash2,
  Video,
} from "lucide-react";

import { PageCard } from "@/components/ui";

interface Attachment {
  id: number;
  name: string;
  type: "image" | "video" | "file";
  size: string;
}

const initialAttachments: Attachment[] = [
  {
    id: 1,
    name: "Atividade - Comunicação.jpg",
    type: "image",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Exercício em grupo.mp4",
    type: "video",
    size: "15.6 MB",
  },
];

export function EvolutionAttachmentsSection() {
  const [attachments, setAttachments] =
    useState(initialAttachments);

  function handleDelete(id: number) {
    setAttachments((current) =>
      current.filter((item) => item.id !== id)
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
            Arraste arquivos aqui ou clique para selecionar
          </span>

          <span className="mt-1 text-xs text-slate-500">
            JPG, PNG, PDF, MP4, MOV
          </span>

          <input
            type="file"
            multiple
            className="hidden"
          />
        </label>

        <div className="space-y-3">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDelete={() =>
                handleDelete(attachment.id)
              }
            />
          ))}

          {attachments.length === 0 && (
            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              Nenhum anexo adicionado.
            </div>
          )}
        </div>
      </div>
    </PageCard>
  );
}

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete: () => void;
}

function AttachmentItem({
  attachment,
  onDelete,
}: AttachmentItemProps) {
  const icon =
    attachment.type === "image" ? (
      <Image size={20} />
    ) : attachment.type === "video" ? (
      <Video size={20} />
    ) : (
      <File size={20} />
    );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {attachment.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {attachment.size}
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