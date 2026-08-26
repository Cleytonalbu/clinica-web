import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  FileSpreadsheet,
  Landmark,
  Upload,
  XCircle,
} from "lucide-react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getBankAccounts,
} from "@/pages/ContasBancarias/bankAccountStorage";

import type {
  BankAccount,
} from "@/pages/ContasBancarias/bankAccountStorage";

import {
  createTransactionFingerprint,
  getBankTransactions,
  importBankTransactions,
} from "./bankTransactionStorage";

import type {
  BankTransactionSource,
} from "./bankTransactionStorage";

interface PreviewTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  source: BankTransactionSource;
  fitId?: string;
  duplicate: boolean;
  selected: boolean;
}

function currency(value: number) {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T12:00:00`,
  ).toLocaleDateString(
    "pt-BR",
  );
}

function normalizeDate(
  value: string,
) {
  const text =
    value.trim();

  const iso =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const br =
    text.match(
      /^(\d{2})[\/.-](\d{2})[\/.-](\d{4})/,
    );

  if (br) {
    return `${br[3]}-${br[2]}-${br[1]}`;
  }

  const compact =
    text.match(
      /^(\d{4})(\d{2})(\d{2})/,
    );

  if (compact) {
    return `${compact[1]}-${compact[2]}-${compact[3]}`;
  }

  return "";
}

function parseNumber(
  value: string,
) {
  let text =
    value
      .trim()
      .replace(/[R$\s]/g, "");

  if (!text) {
    return 0;
  }

  const negative =
    text.startsWith("(") &&
    text.endsWith(")");

  text =
    text
      .replace(/[()]/g, "");

  if (
    text.includes(",") &&
    text.includes(".")
  ) {
    if (
      text.lastIndexOf(",") >
      text.lastIndexOf(".")
    ) {
      text =
        text
          .replace(/\./g, "")
          .replace(",", ".");
    } else {
      text =
        text.replace(/,/g, "");
    }
  } else if (
    text.includes(",")
  ) {
    text =
      text.replace(",", ".");
  }

  const parsed =
    Number(text);

  if (
    !Number.isFinite(parsed)
  ) {
    return 0;
  }

  return negative
    ? -Math.abs(parsed)
    : parsed;
}

function splitCsvLine(
  line: string,
  separator: string,
) {
  const result: string[] =
    [];

  let current = "";
  let quoted = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character =
      line[index];

    if (
      character === '"'
    ) {
      if (
        quoted &&
        line[index + 1] === '"'
      ) {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (
      character === separator &&
      !quoted
    ) {
      result.push(
        current.trim(),
      );

      current = "";
      continue;
    }

    current += character;
  }

  result.push(
    current.trim(),
  );

  return result;
}

function normalizeHeader(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-z0-9]/g,
      "",
    );
}

function findHeaderIndex(
  headers: string[],
  candidates: string[],
) {
  const normalized =
    headers.map(
      normalizeHeader,
    );

  for (
    const candidate of candidates
  ) {
    const index =
      normalized.indexOf(
        normalizeHeader(
          candidate,
        ),
      );

    if (index >= 0) {
      return index;
    }
  }

  return -1;
}

function parseCsv(
  content: string,
) {
  const lines =
    content
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(
        (line) =>
          line.trim().length > 0,
      );

  if (lines.length < 2) {
    return [];
  }

  const firstLine =
    lines[0];

  const separator =
    (firstLine.match(/;/g) ?? [])
      .length >=
    (firstLine.match(/,/g) ?? [])
      .length
      ? ";"
      : ",";

  const headers =
    splitCsvLine(
      firstLine,
      separator,
    );

  const dateIndex =
    findHeaderIndex(
      headers,
      [
        "data",
        "date",
        "datamovimento",
        "datatransacao",
        "dataoperacao",
        "data lancamento",
      ],
    );

  const descriptionIndex =
    findHeaderIndex(
      headers,
      [
        "descricao",
        "descrição",
        "historico",
        "histórico",
        "memo",
        "lancamento",
        "lançamento",
        "detalhes",
        "description",
      ],
    );

  const amountIndex =
    findHeaderIndex(
      headers,
      [
        "valor",
        "amount",
        "valortransacao",
        "valorlancamento",
      ],
    );

  const creditIndex =
    findHeaderIndex(
      headers,
      [
        "credito",
        "crédito",
        "credit",
        "entrada",
      ],
    );

  const debitIndex =
    findHeaderIndex(
      headers,
      [
        "debito",
        "débito",
        "debit",
        "saida",
        "saída",
      ],
    );

  const typeIndex =
    findHeaderIndex(
      headers,
      [
        "tipo",
        "type",
        "natureza",
      ],
    );

  if (
    dateIndex < 0 ||
    descriptionIndex < 0 ||
    (
      amountIndex < 0 &&
      creditIndex < 0 &&
      debitIndex < 0
    )
  ) {
    throw new Error(
      "Não consegui identificar as colunas de Data, Descrição e Valor no CSV.",
    );
  }

  return lines
    .slice(1)
    .map((line) => {
      const columns =
        splitCsvLine(
          line,
          separator,
        );

      const date =
        normalizeDate(
          columns[
            dateIndex
          ] ?? "",
        );

      const description =
        (
          columns[
            descriptionIndex
          ] ?? ""
        ).trim();

      let amount = 0;

      if (
        amountIndex >= 0
      ) {
        amount =
          parseNumber(
            columns[
              amountIndex
            ] ?? "0",
          );

        if (
          typeIndex >= 0
        ) {
          const type =
            (
              columns[
                typeIndex
              ] ?? ""
            )
              .toLowerCase()
              .normalize("NFD")
              .replace(
                /[\u0300-\u036f]/g,
                "",
              );

          if (
            [
              "debito",
              "saida",
              "d",
            ].some(
              (word) =>
                type.includes(
                  word,
                ),
            )
          ) {
            amount =
              -Math.abs(
                amount,
              );
          }

          if (
            [
              "credito",
              "entrada",
              "c",
            ].some(
              (word) =>
                type ===
                word,
            )
          ) {
            amount =
              Math.abs(
                amount,
              );
          }
        }
      } else {
        const credit =
          creditIndex >= 0
            ? parseNumber(
                columns[
                  creditIndex
                ] ?? "0",
              )
            : 0;

        const debit =
          debitIndex >= 0
            ? parseNumber(
                columns[
                  debitIndex
                ] ?? "0",
              )
            : 0;

        amount =
          Math.abs(credit) -
          Math.abs(debit);
      }

      return {
        date,
        description,
        amount,
        source:
          "CSV" as const,
      };
    })
    .filter(
      (item) =>
        item.date &&
        item.description &&
        Number.isFinite(
          item.amount,
        ) &&
        item.amount !== 0,
    );
}

function getOfxTag(
  block: string,
  tag: string,
) {
  const xml =
    block.match(
      new RegExp(
        `<${tag}>([\\s\\S]*?)<\\/${tag}>`,
        "i",
      ),
    );

  if (xml) {
    return xml[1].trim();
  }

  const sgml =
    block.match(
      new RegExp(
        `<${tag}>([^<\\r\\n]+)`,
        "i",
      ),
    );

  return sgml?.[1]
    ?.trim() ?? "";
}

function parseOfx(
  content: string,
) {
  const blocks =
    content.match(
      /<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi,
    ) ?? [];

  if (
    blocks.length === 0
  ) {
    throw new Error(
      "Nenhuma movimentação foi encontrada no arquivo OFX.",
    );
  }

  return blocks
    .map((block) => {
      const rawDate =
        getOfxTag(
          block,
          "DTPOSTED",
        );

      const amount =
        parseNumber(
          getOfxTag(
            block,
            "TRNAMT",
          ),
        );

      const memo =
        getOfxTag(
          block,
          "MEMO",
        );

      const name =
        getOfxTag(
          block,
          "NAME",
        );

      const checkNumber =
        getOfxTag(
          block,
          "CHECKNUM",
        );

      const description =
        (
          memo ||
          name ||
          checkNumber ||
          "Movimentação bancária"
        ).trim();

      return {
        date:
          normalizeDate(
            rawDate,
          ),
        description,
        amount,
        fitId:
          getOfxTag(
            block,
            "FITID",
          ) || undefined,
        source:
          "OFX" as const,
      };
    })
    .filter(
      (item) =>
        item.date &&
        Number.isFinite(
          item.amount,
        ) &&
        item.amount !== 0,
    );
}

export default function ImportarExtrato() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [
    accounts,
    setAccounts,
  ] =
    useState<
      BankAccount[]
    >([]);

  const [
    accountId,
    setAccountId,
  ] =
    useState("");

  const [
    fileName,
    setFileName,
  ] =
    useState("");

  const [
    preview,
    setPreview,
  ] =
    useState<
      PreviewTransaction[]
    >([]);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    processing,
    setProcessing,
  ] =
    useState(false);

  useEffect(() => {
    const active =
      getBankAccounts().filter(
        (account) =>
          account.status ===
            "Ativa" &&
          account.unitId ===
            activeUnitId,
      );

    setAccounts(active);

    if (
      active.length === 1
    ) {
      setAccountId(
        active[0].id,
      );
    }
    if (
      active.length !== 1
    ) {
      setAccountId("");
    }
  }, [
    activeUnitId,
  ]);

  const selectedAccount =
    accounts.find(
      (account) =>
        account.id ===
        accountId,
    );

  const totals =
    useMemo(() => {
      const selected =
        preview.filter(
          (item) =>
            item.selected &&
            !item.duplicate,
        );

      return {
        entries: selected
          .filter(
            (item) =>
              item.amount > 0,
          )
          .reduce(
            (sum, item) =>
              sum +
              item.amount,
            0,
          ),
        exits: selected
          .filter(
            (item) =>
              item.amount < 0,
          )
          .reduce(
            (sum, item) =>
              sum +
              Math.abs(
                item.amount,
              ),
            0,
          ),
        selected:
          selected.length,
        duplicates:
          preview.filter(
            (item) =>
              item.duplicate,
          ).length,
      };
    }, [preview]);

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!accountId) {
      window.alert(
        "Selecione uma conta bancária antes de importar o arquivo.",
      );
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extension !== "ofx" &&
      extension !== "csv"
    ) {
      window.alert(
        "Selecione um arquivo OFX ou CSV.",
      );
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const content =
        await file.text();

      const parsed =
        extension === "ofx"
          ? parseOfx(
              content,
            )
          : parseCsv(
              content,
            );

      const existing =
        new Set(
          getBankTransactions()
            .filter(
              (transaction) =>
                transaction.accountId ===
                accountId,
            )
            .map(
              (transaction) =>
                transaction.fingerprint,
            ),
        );

      const mapped:
        PreviewTransaction[] =
        parsed.map(
          (item, index) => {
            const fingerprint =
              createTransactionFingerprint(
                accountId,
                item.date,
                item.amount,
                item.description,
                "fitId" in item
                  ? item.fitId
                  : undefined,
              );

            const duplicate =
              existing.has(
                fingerprint,
              );

            return {
              id: `${index}-${fingerprint}`,
              date:
                item.date,
              description:
                item.description,
              amount:
                item.amount,
              source:
                item.source,
              fitId:
                "fitId" in item
                  ? item.fitId
                  : undefined,
              duplicate,
              selected:
                !duplicate,
            };
          },
        );

      if (
        mapped.length === 0
      ) {
        throw new Error(
          "O arquivo não possui movimentações válidas para importar.",
        );
      }

      setPreview(mapped);
      setFileName(
        file.name,
      );
    } catch (error) {
      setPreview([]);
      setFileName("");

      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível ler o arquivo.",
      );
    } finally {
      setProcessing(false);
    }
  }

  function toggle(
    id: string,
  ) {
    setPreview(
      (current) =>
        current.map(
          (item) =>
            item.id === id &&
            !item.duplicate
              ? {
                  ...item,
                  selected:
                    !item.selected,
                }
              : item,
        ),
    );
  }

  function confirmImport() {
    if (!accountId) {
      return;
    }

    const selected =
      preview.filter(
        (item) =>
          item.selected &&
          !item.duplicate,
      );

    if (
      selected.length === 0
    ) {
      window.alert(
        "Selecione pelo menos uma movimentação para importar.",
      );
      return;
    }

    const result =
      importBankTransactions(
        accountId,
        selected.map(
          (item) => ({
            date:
              item.date,
            description:
              item.description,
            amount:
              item.amount,
            source:
              item.source,
            fitId:
              item.fitId,
            originalFileName:
              fileName,
          }),
        ),
      );

    setMessage(
      `${result.imported.length} movimentação(ões) importada(s) com sucesso.`,
    );

    setPreview([]);
    setFileName("");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Importar extrato
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Importe um arquivo OFX ou CSV do banco,
            confira as movimentações e confirme antes de lançar.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2
              size={20}
            />

            {message}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Conta bancária
              </span>

              <select
                value={
                  accountId
                }
                onChange={(event) => {
                  setAccountId(
                    event.target.value,
                  );

                  setPreview([]);
                  setFileName("");
                  setMessage("");
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                <option value="">
                  Selecione uma conta
                </option>

                {accounts.map(
                  (account) => (
                    <option
                      key={
                        account.id
                      }
                      value={
                        account.id
                      }
                    >
                      {
                        account.accountName
                      }{" "}
                      —{" "}
                      {
                        account.bankName
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Arquivo do banco
              </span>

              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm font-medium transition ${
                  accountId
                    ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Upload
                  size={18}
                />

                {processing
                  ? "Lendo arquivo..."
                  : "Selecionar OFX ou CSV"}

                <input
                  type="file"
                  accept=".ofx,.csv,text/csv"
                  disabled={
                    !accountId ||
                    processing
                  }
                  onChange={
                    handleFile
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {selectedAccount && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Landmark
                size={18}
              />

              Conta selecionada:
              <strong className="text-slate-800">
                {
                  selectedAccount.accountName
                }
              </strong>

              <span>
                • Saldo atual{" "}
                {currency(
                  selectedAccount.currentBalance,
                )}
              </span>
            </div>
          )}
        </div>

        {preview.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Movimentações"
                value={String(
                  totals.selected,
                )}
                icon={
                  FileSpreadsheet
                }
              />

              <SummaryCard
                title="Entradas"
                value={currency(
                  totals.entries,
                )}
                icon={
                  ArrowUpCircle
                }
              />

              <SummaryCard
                title="Saídas"
                value={currency(
                  totals.exits,
                )}
                icon={
                  ArrowDownCircle
                }
              />

              <SummaryCard
                title="Duplicadas"
                value={String(
                  totals.duplicates,
                )}
                icon={
                  XCircle
                }
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Prévia do extrato
                  </h2>

                  <p className="text-sm text-slate-500">
                    {fileName}
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  Itens duplicados são ignorados automaticamente.
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Importar
                      </th>

                      {[
                        "Data",
                        "Descrição",
                        "Tipo",
                        "Valor",
                        "Situação",
                      ].map(
                        (heading) => (
                          <th
                            key={
                              heading
                            }
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {
                              heading
                            }
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {preview.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className={
                            item.duplicate
                              ? "bg-slate-50 opacity-60"
                              : "hover:bg-slate-50"
                          }
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={
                                item.selected
                              }
                              disabled={
                                item.duplicate
                              }
                              onChange={() =>
                                toggle(
                                  item.id,
                                )
                              }
                              className="h-4 w-4"
                            />
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                            {formatDate(
                              item.date,
                            )}
                          </td>

                          <td className="min-w-[280px] px-4 py-4 text-sm text-slate-700">
                            {
                              item.description
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                item.amount >
                                0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {item.amount >
                              0
                                ? "Entrada"
                                : "Saída"}
                            </span>
                          </td>

                          <td
                            className={`whitespace-nowrap px-4 py-4 font-medium ${
                              item.amount >
                              0
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {item.amount >
                            0
                              ? "+"
                              : "-"}
                            {currency(
                              Math.abs(
                                item.amount,
                              ),
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {item.duplicate ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                Já importada
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Nova
                              </span>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Serão importadas{" "}
                  <strong className="text-slate-800">
                    {
                      totals.selected
                    }
                  </strong>{" "}
                  movimentações.
                </p>

                <button
                  type="button"
                  onClick={
                    confirmImport
                  }
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Confirmar importação
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Landmark;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon
            size={22}
          />
        </div>
      </div>
    </div>
  );
}