import { useMemo, useState } from "react";

import {
  Download,
  FileImage,
  FileText,
  FolderOpen,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

type DocumentCategory =
  | "Laudo"
  | "Relatório"
  | "Termo"
  | "Documento pessoal"
  | "Evolução"
  | "Outros";

interface PatientDocument {
  id: number;
  name: string;
  category: DocumentCategory;
  type: "PDF" | "Imagem";
  date: string;
  professional: string;
  size: string;
}

const initialDocuments: PatientDocument[] = [
  {
    id: 1,
    name: "Laudo Neurológico.pdf",
    category: "Laudo",
    type: "PDF",
    date: "02/08/2026",
    professional: "Dr. Rafael Costa",
    size: "1.8 MB",
  },
  {
    id: 2,
    name: "Relatório Psicológico.pdf",
    category: "Relatório",
    type: "PDF",
    date: "28/07/2026",
    professional: "Dra. Ana Paula",
    size: "850 KB",
  },
  {
    id: 3,
    name: "Termo de Consentimento.pdf",
    category: "Termo",
    type: "PDF",
    date: "15/07/2026",
    professional: "Recepção",
    size: "420 KB",
  },
  {
    id: 4,
    name: "Atividade Comunicação.jpg",
    category: "Evolução",
    type: "Imagem",
    date: "10/07/2026",
    professional: "Dra. Camila Soares",
    size: "2.4 MB",
  },
];

export function PatientDocuments() {
  const [documents, setDocuments] =
    useState<PatientDocument[]>(initialDocuments);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<string>("Todos");

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch =
        document.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        document.professional
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "Todos" ||
        document.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [documents, search, category]);

  function handleDelete(id: number) {
    setDocuments((current) =>
      current.filter(
        (document) => document.id !== id
      )
    );
  }

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const newDocuments: PatientDocument[] =
      Array.from(files).map((file, index) => ({
        id: Date.now() + index,

        name: file.name,

        category: "Outros",

        type: file.type.startsWith("image/")
          ? "Imagem"
          : "PDF",

        date: new Date().toLocaleDateString(
          "pt-BR"
        ),

        professional: "Usuário atual",

        size: formatFileSize(file.size),
      }));

    setDocuments((current) => [
      ...newDocuments,
      ...current,
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Documentos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Arquivos, laudos, relatórios e documentos
            vinculados ao paciente.
          </p>
        </div>

        <label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(event) =>
              handleFiles(event.target.files)
            }
          />

          <span className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus size={18} />
            Novo documento
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Documentos"
          value={String(documents.length)}
          description="Arquivos cadastrados"
          icon={<FolderOpen size={22} />}
          className="bg-indigo-100 text-indigo-600"
        />

        <SummaryCard
          title="Relatórios"
          value={String(
            documents.filter(
              (document) =>
                document.category === "Relatório"
            ).length
          )}
          description="Relatórios disponíveis"
          icon={<FileText size={22} />}
          className="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Anexos clínicos"
          value={String(
            documents.filter(
              (document) =>
                document.category === "Evolução"
            ).length
          )}
          description="Anexos das evoluções"
          icon={<FileImage size={22} />}
          className="bg-violet-100 text-violet-600"
        />
      </div>

      <PageCard
        title="Arquivos do paciente"
        description="Consulte e gerencie os documentos armazenados."
      >
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar documento..."
              className="pl-11"
            />
          </div>

          <Select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="lg:w-56"
          >
            <option value="Todos">
              Todas as categorias
            </option>

            <option value="Laudo">
              Laudos
            </option>

            <option value="Relatório">
              Relatórios
            </option>

            <option value="Termo">
              Termos
            </option>

            <option value="Documento pessoal">
              Documentos pessoais
            </option>

            <option value="Evolução">
              Evoluções
            </option>

            <option value="Outros">
              Outros
            </option>
          </Select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <FolderOpen
              size={36}
              className="text-slate-300"
            />

            <p className="mt-4 font-semibold text-slate-700">
              Nenhum documento encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Altere os filtros ou envie um novo arquivo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <TableHeader>
                    Documento
                  </TableHeader>

                  <TableHeader>
                    Categoria
                  </TableHeader>

                  <TableHeader>
                    Data
                  </TableHeader>

                  <TableHeader>
                    Responsável
                  </TableHeader>

                  <TableHeader>
                    Tamanho
                  </TableHeader>

                  <TableHeader align="right">
                    Ações
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map(
                  (document) => (
                    <tr
                      key={document.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              document.type ===
                              "Imagem"
                                ? "bg-violet-100 text-violet-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {document.type ===
                            "Imagem" ? (
                              <FileImage
                                size={20}
                              />
                            ) : (
                              <FileText
                                size={20}
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {document.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {document.type}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {document.category}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {document.date}
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {document.professional}
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-500">
                        {document.size}
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title="Baixar documento"
                          >
                            <Download
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                document.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Excluir documento"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Enviar documentos
            </p>

            <p className="mt-1 text-xs text-slate-500">
              PDF, JPG e PNG.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <UploadCloud size={17} />

            Selecionar arquivos

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(event) =>
                handleFiles(
                  event.target.files
                )
              }
            />
          </label>
        </div>
      </PageCard>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  className,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  align?: "left" | "right";
}

function TableHeader({
  children,
  align = "left",
}: TableHeaderProps) {
  return (
    <th
      className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(
      1
    )} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}