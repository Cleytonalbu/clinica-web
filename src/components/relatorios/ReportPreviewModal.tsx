import { Download, X } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

interface ReportPreviewModalProps {
  open: boolean;
  title: string;
  printStyles: string;
  children: ReactNode;
  onClose: () => void;
  onDownload: () => void;
}

function escapeTitle(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function ReportPreviewModal({
  open,
  title,
  printStyles,
  children,
  onClose,
  onDownload,
}: ReportPreviewModalProps) {
  const source = useMemo(() => {
    const screenStyles = printStyles.replaceAll(
      "@media print",
      "@media all"
    );

    const applicationStyles =
      typeof document === "undefined"
        ? ""
        : Array.from(
            document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
              'style, link[rel="stylesheet"]'
            )
          )
            .map((node) =>
              node instanceof HTMLLinkElement
                ? `<link rel="stylesheet" href="${node.href.replaceAll('"', "&quot;")}" />`
                : node.outerHTML
            )
            .join("\n");

    return `<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeTitle(title)}</title>
          ${applicationStyles}
          <style>
            ${screenStyles}
            html, body { min-height: 100%; }
            body { margin: 0 !important; padding: 24px !important; background: #eef1f7 !important; }
            .report-preview-root { width: min(100%, 980px); margin: 0 auto; }
            .report-preview-root, .report-preview-root * { visibility: visible !important; }
            .report-preview-root > article {
              display: block !important;
              position: static !important;
              width: 100% !important;
              min-height: 1120px;
              padding: 40px !important;
              background: #fff !important;
              box-shadow: 0 18px 50px rgba(15, 35, 95, .14);
            }
          </style>
        </head>
        <body>
          <div class="report-preview-root">${renderToStaticMarkup(children)}</div>
        </body>
      </html>`;
  }, [children, printStyles, title]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950/65 print:hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Pré-visualização</p>
          <h2 className="mt-1 text-lg font-extrabold text-[#10235f]">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onDownload} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-700">
            <Download size={17} />
            Baixar PDF
          </button>
          <button type="button" onClick={onClose} aria-label="Fechar visualização" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <X size={19} />
          </button>
        </div>
      </div>

      <iframe
        title={`Visualização de ${title}`}
        srcDoc={source}
        className="min-h-0 flex-1 border-0 bg-slate-100"
      />
    </div>
  );
}
