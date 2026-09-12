import { Download, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DocumentPreviewModalProps {
  open: boolean;
  title: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
  file?: File | null;
  onClose: () => void;
  onDownload?: () => void;
}

type PreviewKind = "image" | "pdf" | "video" | "audio" | "text" | "unsupported";

function getPreviewKind(mimeType: string, fileName: string): PreviewKind {
  const normalizedType = mimeType.toLowerCase();
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (normalizedType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) return "image";
  if (normalizedType === "application/pdf" || extension === "pdf") return "pdf";
  if (normalizedType.startsWith("video/") || ["mp4", "mov", "webm"].includes(extension)) return "video";
  if (normalizedType.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(extension)) return "audio";
  if (normalizedType.startsWith("text/") || ["txt", "csv", "html", "htm"].includes(extension)) return "text";
  return "unsupported";
}

export function DocumentPreviewModal({
  open,
  title,
  fileName = "documento",
  mimeType = "",
  dataUrl = "",
  file = null,
  onClose,
  onDownload,
}: DocumentPreviewModalProps) {
  const [objectUrl] = useState(() =>
    file ? URL.createObjectURL(file) : ""
  );

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  const source = dataUrl || objectUrl;
  const resolvedMimeType = mimeType || file?.type || "";
  const kind = useMemo(
    () => getPreviewKind(resolvedMimeType, fileName),
    [fileName, resolvedMimeType]
  );

  if (!open) return null;

  function download() {
    if (onDownload) {
      onDownload();
      return;
    }

    if (!source) return;
    const link = document.createElement("a");
    link.href = source;
    link.download = fileName;
    link.click();
  }

  const canDownload = Boolean(source);

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Visualização do documento</p>
            <h2 className="mt-1 truncate text-lg font-extrabold text-[#10235f]">{title}</h2>
            <p className="mt-1 truncate text-xs text-slate-400">{fileName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canDownload && (
              <button type="button" onClick={download} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white hover:bg-violet-700">
                <Download size={17} />
                Baixar
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Fechar visualização" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
          {!source ? (
            <UnavailablePreview message="Este registro antigo contém apenas os dados do arquivo. A visualização ficará disponível quando o conteúdo for enviado novamente ou carregado pela futura API." />
          ) : kind === "image" ? (
            <div className="flex min-h-[65vh] items-center justify-center">
              <img src={source} alt={title} className="max-h-[78vh] max-w-full rounded-xl bg-white object-contain shadow-sm" />
            </div>
          ) : kind === "pdf" || kind === "text" ? (
            <iframe title={title} src={source} className="h-[76vh] w-full rounded-xl border-0 bg-white" />
          ) : kind === "video" ? (
            <div className="flex min-h-[65vh] items-center justify-center">
              <video src={source} controls className="max-h-[76vh] max-w-full rounded-xl bg-black" />
            </div>
          ) : kind === "audio" ? (
            <div className="flex min-h-[45vh] items-center justify-center rounded-xl bg-white p-8">
              <audio src={source} controls className="w-full max-w-xl" />
            </div>
          ) : (
            <UnavailablePreview message="Este formato não possui visualização nativa no navegador. O arquivo pode ser baixado e aberto no aplicativo correspondente." />
          )}
        </div>
      </div>
    </div>
  );
}

function UnavailablePreview({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl bg-white p-8 text-center">
      <FileText size={38} className="text-slate-300" />
      <p className="mt-4 text-sm font-bold text-slate-700">Pré-visualização indisponível</p>
      <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">{message}</p>
    </div>
  );
}
