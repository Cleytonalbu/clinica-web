import {
  useMemo,
  useState,
} from "react";

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
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  Button,
  Input,
  PageCard,
  Select,
} from "@/components/ui";

import {
  createPatientDocumentFromFile,
  deletePatientDocument,
  getDocumentsByPatientId,
  renamePatientDocument,
  updatePatientDocumentCategory,
  type DocumentCategory,
  type StoredPatientDocument,
} from "@/pages/Pacientes/documentStorage";

import {
  getEvolutionsByPatientId,
} from "@/pages/Pacientes/evolutionStorage";

/* =========================================
   TIPOS DE EXIBIÇÃO
========================================= */

type DisplayDocument = {
  key: string;

  id:
    number |
    null;

  patientId:
    number;

  name:
    string;

  category:
    DocumentCategory;

  type:
    "PDF" |
    "Imagem";

  date:
    string;

  professional:
    string;

  size:
    number;

  source:
    "DOCUMENTO" |
    "EVOLUCAO";

  evolutionId?:
    number;

  attachmentId?:
    string;
};

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export function PatientDocuments() {
  const {
    user,
  } =
    useAuth();

  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     ESTADOS
  ======================================= */

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(
      0
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      ""
    );

  const [
    category,
    setCategory,
  ] =
    useState<string>(
      "Todos"
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<
      "success" |
      "error" |
      null
    >(
      null
    );

  /* =======================================
     PERFIL
  ======================================= */

  const isGestor =
    user?.profile ===
    "Gestor";

  const isRecepcao =
    user?.profile ===
    "Recepção";

  const isProfissional =
    user?.profile ===
    "Profissional";

  const canUpload =
    isGestor ||
    isRecepcao ||
    isProfissional;

  const canDelete =
    isGestor;

  /* =======================================
     TEXTO DE UPLOAD
  ======================================= */

  const uploadDescription =
    useMemo(
      () => {
        if (
          isProfissional
        ) {
          return "Envie laudos, relatórios e documentos relacionados ao acompanhamento clínico.";
        }

        if (
          isRecepcao
        ) {
          return "Envie documentos cadastrais, termos e arquivos administrativos do paciente.";
        }

        return "Envie documentos administrativos ou clínicos vinculados ao paciente.";
      },
      [
        isProfissional,
        isRecepcao,
      ]
    );

  /* =======================================
     DOCUMENTOS MANUAIS
  ======================================= */

  const storedDocuments =
    useMemo(
      () => {
        void refreshKey;

        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        return getDocumentsByPatientId(
          patientId
        );
      },
      [
        patientId,
        refreshKey,
      ]
    );

  /* =======================================
     ANEXOS DAS EVOLUÇÕES
  ======================================= */

  const evolutionDocuments =
    useMemo(
      () => {
        void refreshKey;

        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        return getEvolutionsByPatientId(
          patientId
        ).flatMap(
          (
            evolution
          ) =>
            evolution.attachments.map(
              (
                attachment
              ) => ({
                key:
                  `evolution-${evolution.id}-${attachment.id}`,

                id:
                  null,

                patientId,

                name:
                  attachment.name,

                category:
                  "Evolução" as DocumentCategory,

                type:
                  attachment.type.startsWith(
                    "image/"
                  )
                    ? "Imagem" as const
                    : "PDF" as const,

                date:
                  evolution.sessionDate,

                professional:
                  evolution.professional ||
                  "Profissional",

                size:
                  attachment.size,

                source:
                  "EVOLUCAO" as const,

                evolutionId:
                  evolution.id,

                attachmentId:
                  attachment.id,
              })
            )
        );
      },
      [
        patientId,
        refreshKey,
      ]
    );

  /* =======================================
     TODOS OS DOCUMENTOS
  ======================================= */

  const documents =
    useMemo(
      () => {
        const manual:
          DisplayDocument[] =
          storedDocuments.map(
            (
              document
            ) =>
              toDisplayDocument(
                document
              )
          );

        return [
          ...evolutionDocuments,
          ...manual,
        ].sort(
          (
            a,
            b
          ) =>
            parseDisplayDate(
              b.date
            ) -
            parseDisplayDate(
              a.date
            )
        );
      },
      [
        storedDocuments,
        evolutionDocuments,
      ]
    );

  /* =======================================
     FILTROS
  ======================================= */

  const filteredDocuments =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        return documents.filter(
          (
            document
          ) => {
            const matchesSearch =
              !normalizedSearch ||
              document.name
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                ) ||
              document.professional
                .toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  normalizedSearch
                );

            const matchesCategory =
              category ===
                "Todos" ||
              document.category ===
                category;

            return (
              matchesSearch &&
              matchesCategory
            );
          }
        );
      },
      [
        documents,
        search,
        category,
      ]
    );

  /* =======================================
     FEEDBACK
  ======================================= */

  function showFeedback(
    message:
      string,

    type:
      "success" |
      "error"
  ) {
    setFeedback(
      message
    );

    setFeedbackType(
      type
    );
  }

  function refreshDocuments() {
    setRefreshKey(
      (
        current
      ) =>
        current + 1
    );
  }

  /* =======================================
     EXCLUIR
  ======================================= */

  function handleDelete(
    document:
      DisplayDocument
  ) {
    if (
      !canDelete
    ) {
      return;
    }

    if (
      document.source ===
      "EVOLUCAO"
    ) {
      showFeedback(
        "Anexos clínicos devem ser removidos pela própria evolução.",
        "error"
      );

      return;
    }

    if (
      document.id ===
      null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir o documento "${document.name}"?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    const deleted =
      deletePatientDocument(
        patientId,
        document.id
      );

    if (
      !deleted
    ) {
      showFeedback(
        "Não foi possível excluir o documento.",
        "error"
      );

      return;
    }

    refreshDocuments();

    showFeedback(
      "Documento excluído com sucesso.",
      "success"
    );
  }

  /* =======================================
     UPLOAD
  ======================================= */

  function handleFiles(
    files:
      FileList |
      null
  ) {
    if (
      !canUpload ||
      !files ||
      !Number.isFinite(
        patientId
      ) ||
      patientId <= 0
    ) {
      return;
    }

    const defaultCategory:
      DocumentCategory =
      isProfissional
        ? "Outros"
        : isRecepcao
          ? "Documento pessoal"
          : "Outros";

    const selectedFiles =
      Array.from(
        files
      );

    try {
      selectedFiles.forEach(
        (
          file
        ) => {
          createPatientDocumentFromFile(
            patientId,
            file,
            {
              category:
                defaultCategory,

              professional:
                user?.name ||
                (
                  isRecepcao
                    ? "Recepção"
                    : "Usuário"
                ),
            }
          );
        }
      );

      refreshDocuments();

      showFeedback(
        selectedFiles.length ===
          1
          ? "Documento adicionado com sucesso."
          : `${selectedFiles.length} documentos adicionados com sucesso.`,
        "success"
      );
    } catch (
      error
    ) {
      showFeedback(
        error instanceof
          Error
          ? error.message
          : "Não foi possível adicionar os documentos.",
        "error"
      );
    }
  }

  /* =======================================
     DOWNLOAD
  ======================================= */

  function handleDownload(
    document:
      DisplayDocument
  ) {
    /*
     * O localStorage guarda apenas os
     * metadados dos arquivos, e não os
     * bytes do documento.
     *
     * O download real será implementado
     * quando o upload estiver conectado
     * ao backend/API.
     */

    showFeedback(
      `O arquivo "${document.name}" está registrado, mas o download real dependerá da integração com a API.`,
      "error"
    );
  }

  /* =======================================
     MAIS OPÇÕES
  ======================================= */

  function handleMoreOptions(
    document:
      DisplayDocument
  ) {
    if (
      document.source ===
      "EVOLUCAO"
    ) {
      showFeedback(
        "Este arquivo pertence a uma evolução clínica e deve ser gerenciado por ela.",
        "error"
      );

      return;
    }

    if (
      document.id ===
      null
    ) {
      return;
    }

    const action =
      window.prompt(
        [
          "Digite a opção desejada:",
          "",
          "1 - Renomear",
          "2 - Alterar categoria",
        ].join(
          "\n"
        )
      );

    if (
      action ===
      "1"
    ) {
      const newName =
        window.prompt(
          "Novo nome do documento:",
          document.name
        );

      if (
        !newName
      ) {
        return;
      }

      try {
        renamePatientDocument(
          patientId,
          document.id,
          newName
        );

        refreshDocuments();

        showFeedback(
          "Documento renomeado com sucesso.",
          "success"
        );
      } catch (
        error
      ) {
        showFeedback(
          error instanceof
            Error
            ? error.message
            : "Não foi possível renomear o documento.",
          "error"
        );
      }

      return;
    }

    if (
      action ===
      "2"
    ) {
      const newCategory =
        window.prompt(
          [
            "Informe a nova categoria:",
            "",
            "Laudo",
            "Relatório",
            "Termo",
            "Documento pessoal",
            "Evolução",
            "Outros",
          ].join(
            "\n"
          ),
          document.category
        );

      if (
        !newCategory ||
        !isDocumentCategory(
          newCategory
        )
      ) {
        if (
          newCategory
        ) {
          showFeedback(
            "Categoria inválida.",
            "error"
          );
        }

        return;
      }

      try {
        updatePatientDocumentCategory(
          patientId,
          document.id,
          newCategory
        );

        refreshDocuments();

        showFeedback(
          "Categoria atualizada com sucesso.",
          "success"
        );
      } catch (
        error
      ) {
        showFeedback(
          error instanceof
            Error
            ? error.message
            : "Não foi possível atualizar a categoria.",
          "error"
        );
      }
    }
  }

  /* =======================================
     RESUMOS
  ======================================= */

  const reportsCount =
    documents.filter(
      (
        document
      ) =>
        document.category ===
        "Relatório"
    ).length;

  const clinicalAttachmentsCount =
    documents.filter(
      (
        document
      ) =>
        document.source ===
        "EVOLUCAO"
    ).length;

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* CABEÇALHO */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Documentos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Arquivos, laudos, relatórios e documentos vinculados ao paciente.
          </p>
        </div>

        {canUpload && (
          <label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(
                event
              ) => {
                handleFiles(
                  event
                    .target
                    .files
                );

                event.target.value =
                  "";
              }}
            />

            <span className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700">
              <Plus
                size={18}
              />

              Novo documento
            </span>
          </label>
        )}
      </div>

      {/* ================================= */}
      {/* FEEDBACK */}
      {/* ================================= */}

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedbackType ===
            "error"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {
            feedback
          }
        </div>
      )}

      {/* ================================= */}
      {/* RESUMO */}
      {/* ================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="Documentos"
          value={String(
            documents.length
          )}
          description="Arquivos cadastrados"
          icon={
            <FolderOpen
              size={22}
            />
          }
          className="bg-indigo-100 text-indigo-600"
        />

        <SummaryCard
          title="Relatórios"
          value={String(
            reportsCount
          )}
          description="Relatórios disponíveis"
          icon={
            <FileText
              size={22}
            />
          }
          className="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Anexos clínicos"
          value={String(
            clinicalAttachmentsCount
          )}
          description="Anexos das evoluções"
          icon={
            <FileImage
              size={22}
            />
          }
          className="bg-violet-100 text-violet-600"
        />
      </div>

      {/* ================================= */}
      {/* ARQUIVOS */}
      {/* ================================= */}

      <PageCard
        title="Arquivos do paciente"
        description="Consulte e gerencie os documentos armazenados."
      >
        {/* ================================= */}
        {/* FILTROS */}
        {/* ================================= */}

        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Pesquisar documento..."
              className="pl-11"
            />
          </div>

          <Select
            value={
              category
            }
            onChange={(
              event
            ) =>
              setCategory(
                event
                  .target
                  .value
              )
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

        {/* ================================= */}
        {/* LISTA */}
        {/* ================================= */}

        {filteredDocuments.length ===
        0 ? (
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
                  (
                    document
                  ) => (
                    <tr
                      key={
                        document.key
                      }
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

                          <div className="min-w-0">
                            <p className="max-w-80 truncate font-semibold text-slate-800">
                              {
                                document.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                document.source ===
                                "EVOLUCAO"
                                  ? "Anexo clínico"
                                  : document.type
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {
                            document.category
                          }
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {
                          formatDisplayDate(
                            document.date
                          )
                        }
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-600">
                        {
                          document.professional
                        }
                      </td>

                      <td className="py-4 pr-4 text-sm text-slate-500">
                        {
                          formatFileSize(
                            document.size
                          )
                        }
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                document
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                            title="Baixar documento"
                          >
                            <Download
                              size={17}
                            />
                          </button>

                          {canDelete &&
                            document.source ===
                              "DOCUMENTO" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  document
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Excluir documento"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleMoreOptions(
                                document
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Mais opções"
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

        {/* ================================= */}
        {/* ÁREA DE UPLOAD */}
        {/* ================================= */}

        {canUpload && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Enviar documentos
              </p>

              <p className="mt-1 max-w-2xl text-xs text-slate-500">
                {
                  uploadDescription
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Formatos aceitos: PDF, JPG e PNG.
              </p>

              <p className="mt-1 text-xs text-amber-600">
                Nesta etapa local são persistidos os dados do arquivo. O conteúdo físico será armazenado quando a API de upload estiver integrada.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              <UploadCloud
                size={17}
              />

              Selecionar arquivos

              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(
                  event
                ) => {
                  handleFiles(
                    event
                      .target
                      .files
                  );

                  event.target.value =
                    "";
                }}
              />
            </label>
          </div>
        )}
      </PageCard>
    </div>
  );
}

/* =========================================
   CONVERTER DOCUMENTO SALVO
========================================= */

function toDisplayDocument(
  document:
    StoredPatientDocument
):
  DisplayDocument {
  return {
    key:
      `document-${document.id}`,

    id:
      document.id,

    patientId:
      document.patientId,

    name:
      document.name,

    category:
      document.category,

    type:
      document.type,

    date:
      document.createdAt,

    professional:
      document.professional,

    size:
      document.size,

    source:
      document.source,

    evolutionId:
      document.evolutionId,

    attachmentId:
      document.attachmentId,
  };
}

/* =========================================
   CARD DE RESUMO
========================================= */

interface SummaryCardProps {
  title:
    string;

  value:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  className:
    string;
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
            {
              title
            }
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              value
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              description
            }
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

/* =========================================
   CABEÇALHO DA TABELA
========================================= */

interface TableHeaderProps {
  children:
    React.ReactNode;

  align?:
    "left" |
    "right";
}

function TableHeader({
  children,
  align =
    "left",
}: TableHeaderProps) {
  return (
    <th
      className={`pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
        align ===
        "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {
        children
      }
    </th>
  );
}

/* =========================================
   VALIDAR CATEGORIA
========================================= */

function isDocumentCategory(
  value:
    string
): value is DocumentCategory {
  return [
    "Laudo",
    "Relatório",
    "Termo",
    "Documento pessoal",
    "Evolução",
    "Outros",
  ].includes(
    value
  );
}

/* =========================================
   FORMATAR DATA
========================================= */

function formatDisplayDate(
  value:
    string
) {
  if (
    !value
  ) {
    return "-";
  }

  /*
   * Data de sessão YYYY-MM-DD.
   */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const [
      year,
      month,
      day,
    ] =
      value.split(
        "-"
      );

    return `${day}/${month}/${year}`;
  }

  /*
   * Timestamp ISO.
   */

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    date
  );
}

/* =========================================
   ORDENAR POR DATA
========================================= */

function parseDisplayDate(
  value:
    string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const date =
      new Date(
        `${value}T12:00:00`
      );

    return date.getTime();
  }

  const date =
    new Date(
      value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();
}

/* =========================================
   TAMANHO DO ARQUIVO
========================================= */

function formatFileSize(
  size:
    number
) {
  if (
    !Number.isFinite(
      size
    ) ||
    size <= 0
  ) {
    return "0 KB";
  }

  if (
    size <
    1024 * 1024
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