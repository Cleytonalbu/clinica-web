import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/auth/AuthContext";
import {
  PROFESSIONAL_BOARD_CHANGED_EVENT,
  addProfessionalBoardDocument,
  downloadProfessionalBoardDocument,
  getProfessionalBoardDocuments,
  removeProfessionalBoardDocument,
  type ProfessionalBoardDocument,
} from "@/components/dashboard/profissional/professionalBoardStorage";

export function ProfissionalAcessoRapido() {
  const { user } = useAuth();
  const professionalName =
    user?.professionalName ??
    user?.name ??
    "Profissional";

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [version, setVersion] = useState(0);
  const [selectedDocument, setSelectedDocument] =
    useState<ProfessionalBoardDocument | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener(
      PROFESSIONAL_BOARD_CHANGED_EVENT,
      refresh
    );
    return () =>
      window.removeEventListener(
        PROFESSIONAL_BOARD_CHANGED_EVENT,
        refresh
      );
  }, []);

  const documents = useMemo(
    () => getProfessionalBoardDocuments(professionalName),
    [professionalName, version]
  );

  const visibleDocuments = showAll
    ? documents
    : documents.slice(0, 4);

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setFeedback("");
      await addProfessionalBoardDocument({
        professionalName,
        file,
      });
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o documento."
      );
    }
  }

  function handleRemove(documentId: string) {
    const confirmed = window.confirm(
      "Remover este documento do seu mural digital?"
    );
    if (!confirmed) return;

    removeProfessionalBoardDocument(
      professionalName,
      documentId
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Paperclip
                  size={17}
                  className="text-violet-600"
                />
                <h2 className="text-base font-extrabold text-[#10235f]">
                  Mural digital
                </h2>
              </div>
              <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500">
                Protocolos e documentos para consulta rápida.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 text-[11px] font-bold text-white transition hover:bg-violet-700"
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/*,text/plain,text/html,text/csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={handleFileSelected}
          />

          {feedback && (
            <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
              {feedback}
            </div>
          )}
        </div>

        <div className="p-4">
          {documents.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-violet-200 bg-violet-50/40 px-4 py-7 text-center transition hover:bg-violet-50"
            >
              <FileText
                size={24}
                className="text-violet-300"
              />
              <p className="mt-2 text-xs font-bold text-slate-600">
                Nenhum documento no mural
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Adicione protocolos, orientações ou arquivos de uso frequente.
              </p>
            </button>
          ) : (
            <div className="space-y-2.5">
              {visibleDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  onPreview={() => setSelectedDocument(document)}
                  onDownload={() =>
                    downloadProfessionalBoardDocument(document)
                  }
                  onRemove={() => handleRemove(document.id)}
                />
              ))}

              {documents.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                  className="w-full rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-[10px] font-bold text-violet-700 transition hover:bg-violet-50"
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Ver todos (${documents.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}

function DocumentRow({
  document,
  onPreview,
  onDownload,
  onRemove,
}: {
  document: ProfessionalBoardDocument;
  onPreview: () => void;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const Icon =
    document.fileType === "image"
      ? ImageIcon
      : FileText;

  const canPreview =
    document.fileType === "pdf" ||
    document.fileType === "image" ||
    document.fileType === "text";

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 transition hover:border-violet-100 hover:bg-violet-50/20">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-slate-700">
            {document.name}
          </p>
          <p className="mt-1 truncate text-[9px] font-medium text-slate-400">
            {document.fileName} • {formatFileSize(document.size)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canPreview}
          onClick={onPreview}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-violet-100 bg-violet-50 px-2 py-1.5 text-[9px] font-bold text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          title={
            canPreview
              ? "Visualização rápida"
              : "Prévia não disponível para este formato"
          }
        >
          <Eye size={12} />
          Visualizar
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] font-bold text-slate-600 hover:bg-slate-50"
        >
          <Download size={12} />
          Baixar
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100"
          title="Remover do mural"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function DocumentPreviewModal({
  document,
  onClose,
}: {
  document: ProfessionalBoardDocument;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-[#10235f]">
              {document.name}
            </h3>
            <p className="mt-1 truncate text-[10px] text-slate-400">
              Visualização rápida • {document.fileName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadProfessionalBoardDocument(document)
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <Download size={15} />
              Baixar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
          {document.fileType === "image" ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <img
                src={document.dataUrl}
                alt={document.name}
                className="max-h-[75vh] max-w-full rounded-xl bg-white object-contain shadow-sm"
              />
            </div>
          ) : document.fileType === "pdf" ? (
            <iframe
              title={document.name}
              src={document.dataUrl}
              className="h-[72vh] w-full rounded-xl bg-white"
            />
          ) : document.fileType === "text" ? (
            <iframe
              title={document.name}
              src={document.dataUrl}
              className="h-[72vh] w-full rounded-xl bg-white"
            />
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-xl bg-white p-8 text-center">
              <FileText size={34} className="text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                Visualização rápida não disponível
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Use o botão Baixar para abrir este formato no aplicativo apropriado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024)
    return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
