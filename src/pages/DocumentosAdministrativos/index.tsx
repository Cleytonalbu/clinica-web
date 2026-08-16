import {
  Archive,
  CalendarClock,
  Download,
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button, Input, Select } from "@/components/ui";
import {
  getAdministrativeDocumentDisplayStatus,
  getAdministrativeDocuments,
  saveAdministrativeDocument,
  updateAdministrativeDocumentStatus,
  type AdministrativeDocument,
  type AdministrativeDocumentCategory,
} from "./documentStorage";

const categories: AdministrativeDocumentCategory[] = [
  "Contrato de profissional",
  "Contrato de prestador",
  "Contrato de fornecedor",
  "Documento fiscal",
  "Licença / Certificado",
  "Outros",
];

const emptyForm = {
  title: "",
  category: "Contrato de profissional" as AdministrativeDocumentCategory,
  relatedTo: "",
  documentNumber: "",
  startDate: "",
  endDate: "",
  notes: "",
};

export default function DocumentosAdministrativos() {
  const [documents, setDocuments] = useState<AdministrativeDocument[]>(() =>
    getAdministrativeDocuments()
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return documents.filter((document) => {
      const displayStatus = getAdministrativeDocumentDisplayStatus(document);
      const matchesSearch =
        !term ||
        document.title.toLowerCase().includes(term) ||
        document.relatedTo.toLowerCase().includes(term) ||
        document.documentNumber.toLowerCase().includes(term) ||
        document.fileName.toLowerCase().includes(term);
      const matchesCategory = category === "Todas" || document.category === category;
      const matchesStatus = status === "Todos" || displayStatus === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documents, search, category, status]);

  const activeCount = documents.filter(
    (item) => getAdministrativeDocumentDisplayStatus(item) === "Ativo"
  ).length;
  const expiringCount = documents.filter(
    (item) => getAdministrativeDocumentDisplayStatus(item) === "Vencendo"
  ).length;
  const expiredCount = documents.filter(
    (item) => getAdministrativeDocumentDisplayStatus(item) === "Vencido"
  ).length;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    setFileError("");

    let fileName = "";
    let fileType = "";
    let fileDataUrl = "";

    if (selectedFile) {
      if (selectedFile.size > 1_500_000) {
        setFileError("O arquivo deve ter no máximo 1,5 MB nesta versão local do sistema.");
        return;
      }

      fileName = selectedFile.name;
      fileType = selectedFile.type;
      fileDataUrl = await fileToDataUrl(selectedFile);
    }

    saveAdministrativeDocument({
      title: form.title.trim(),
      category: form.category,
      relatedTo: form.relatedTo.trim(),
      documentNumber: form.documentNumber.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: "Ativo",
      notes: form.notes.trim(),
      fileName,
      fileType,
      fileDataUrl,
    });

    setDocuments(getAdministrativeDocuments());
    setForm(emptyForm);
    setSelectedFile(null);
    setModalOpen(false);
  }

  function toggleArchive(document: AdministrativeDocument) {
    const nextStatus = document.status === "Arquivado" ? "Ativo" : "Arquivado";
    updateAdministrativeDocumentStatus(document.id, nextStatus);
    setDocuments(getAdministrativeDocuments());
  }

  function openDocument(document: AdministrativeDocument) {
    if (!document.fileDataUrl) return;
    const link = window.document.createElement("a");
    link.href = document.fileDataUrl;
    link.download = document.fileName || document.title;
    link.click();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#6d5dfc]">Administrativo</p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#102a78]">
              Contratos e documentos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Controle de contratos, documentos fiscais, licenças e arquivos administrativos da clínica.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus size={18} /> Novo documento
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Documentos cadastrados"
            value={documents.length}
            icon={<FileText size={21} />}
          />
          <SummaryCard
            label="Ativos"
            value={activeCount}
            icon={<FileText size={21} />}
          />
          <SummaryCard
            label="Vencendo em até 30 dias"
            value={expiringCount}
            icon={<CalendarClock size={21} />}
          />
          <SummaryCard
            label="Vencidos"
            value={expiredCount}
            icon={<Archive size={21} />}
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_210px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Documento, contratado, número ou arquivo..."
                className="pl-10"
              />
            </div>

            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Todas</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>

            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Todos</option>
              <option>Ativo</option>
              <option>Vencendo</option>
              <option>Vencido</option>
              <option>Arquivado</option>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-[#f7f7fc] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Documento</th>
                  <th className="px-5 py-4">Categoria</th>
                  <th className="px-5 py-4">Relacionado a</th>
                  <th className="px-5 py-4">Início</th>
                  <th className="px-5 py-4">Vencimento</th>
                  <th className="px-5 py-4">Situação</th>
                  <th className="px-5 py-4">Arquivo</th>
                  <th className="px-5 py-4 text-right">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((document) => {
                  const displayStatus = getAdministrativeDocumentDisplayStatus(document);

                  return (
                    <tr key={document.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#102a78]">{document.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {document.documentNumber
                            ? `Nº ${document.documentNumber}`
                            : "Sem número informado"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{document.category}</td>
                      <td className="px-5 py-4 text-slate-600">{document.relatedTo || "-"}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(document.startDate)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(document.endDate)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="px-5 py-4">
                        {document.fileName ? (
                          <button
                            type="button"
                            onClick={() => openDocument(document)}
                            className="flex max-w-[180px] items-center gap-2 font-semibold text-[#6d5dfc] hover:underline"
                            title={document.fileName}
                          >
                            <Download size={15} className="shrink-0" />
                            <span className="truncate">{document.fileName}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">Sem anexo</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleArchive(document)}
                        >
                          {document.status === "Arquivado" ? "Reativar" : "Arquivar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      Nenhum documento administrativo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#102a78]">
                  Novo documento administrativo
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cadastre contratos, licenças, documentos fiscais ou outros arquivos da administração.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Título do documento" required>
                <Input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Ex.: Contrato - Maria Silva"
                />
              </Field>

              <Field label="Categoria">
                <Select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value as AdministrativeDocumentCategory,
                    })
                  }
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Relacionado a">
                <Input
                  value={form.relatedTo}
                  onChange={(event) => setForm({ ...form, relatedTo: event.target.value })}
                  placeholder="Profissional, prestador ou fornecedor"
                />
              </Field>

              <Field label="Número / referência">
                <Input
                  value={form.documentNumber}
                  onChange={(event) =>
                    setForm({ ...form, documentNumber: event.target.value })
                  }
                />
              </Field>

              <Field label="Data de início">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                />
              </Field>

              <Field label="Data de vencimento">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Arquivo">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] ?? null);
                      setFileError("");
                    }}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f2efff] file:px-3 file:py-1.5 file:font-bold file:text-[#6d5dfc]"
                  />
                </Field>
                {fileError && <p className="mt-2 text-xs font-semibold text-red-600">{fileError}</p>}
                <p className="mt-2 text-xs text-slate-400">
                  PDF, Word ou imagem. Nesta versão local, anexos de até 1,5 MB ficam salvos no navegador.
                </p>
              </div>

              <div className="md:col-span-2">
                <Field label="Observações">
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#8b7cf6] focus:ring-2 focus:ring-[#8b7cf6]/10"
                    placeholder="Informações administrativas importantes sobre este documento..."
                  />
                </Field>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar documento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Ativo: "border-emerald-100 bg-emerald-50 text-emerald-700",
    Vencendo: "border-amber-100 bg-amber-50 text-amber-700",
    Vencido: "border-red-100 bg-red-50 text-red-700",
    Arquivado: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        styles[status] ?? styles.Arquivado
      }`}
    >
      {status}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#102a78]">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2efff] text-[#6d5dfc]">
          {icon}
        </div>
      </div>
    </div>
  );
}