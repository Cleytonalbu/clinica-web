import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  Box,
  CalendarCheck2,
  CheckCircle2,
  CircleCheckBig,
  CircleDollarSign,
  ClipboardCheck,
  FileWarning,
  Gavel,
  RotateCcw,
  FolderClosed,
  PackageCheck,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUnit } from "@/providers/UnitContext";
import {
  closeLoteConvenio,
  createGuiaConvenio,
  createRecursoGlosa,
  createLoteConvenio,
  getGuiasByLote,
  getGuiasConvenios,
  getLoteConvenioById,
  getLotesConvenios,
  getRecursosGlosa,
  markLoteConvenioInAnalysis,
  registerLoteConvenioRepasse,
  registerLoteConvenioReturn,
  registerRecursoGlosaReturn,
  reopenLoteConvenio,
  resetLoteConvenioReturn,
  sendLoteConvenio,
  updateGuiaConvenio,
  type GuiaConvenio,
  type GuiaConvenioStatus,
  type LoteConvenio,
  type LoteConvenioStatus,
  type RecursoGlosa,
} from "./guideBillingStorage";


import {
  getBankAccounts,
  type BankAccount,
} from "@/pages/ContasBancarias/bankAccountStorage";

import {
  createManualBankTransaction,
} from "@/pages/ImportarExtrato/bankTransactionStorage";

import {
  reconcileBankTransaction,
} from "@/pages/MovimentacoesBancarias/bankReconciliationStorage";

import {
  createPaidFinancialReceipt,
} from "@/pages/Financeiro/financeStorage";

const statuses: GuiaConvenioStatus[] = [
  "Pendente de envio",
  "Enviado",
  "Aprovado",
  "Glosado",
  "Pago",
];

const currentMonth = () => new Date().toISOString().slice(0, 7);

const emptyForm = {
  convenio: "",
  plano: "",
  paciente: "",
  numeroGuia: "",
  competencia: currentMonth(),
  dataAtendimento: "",
  quantidadeSessoes: "1",
  valorUnitario: "",
  observacoes: "",
};

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string) {
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
    : "—";
}

function badge(status: GuiaConvenioStatus) {
  switch (status) {
    case "Pago":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Parcialmente pago":
      return "border-teal-200 bg-teal-50 text-teal-700";
    case "Aprovado":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Enviado":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Glosado":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}


function loteBadge(
  status: LoteConvenioStatus
) {
  switch (status) {
    case "Pago":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Aprovado":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Parcialmente aprovado":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "Em análise":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Enviado":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Fechado":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function GuiasConvenios() {
  const { activeUnitId } = useUnit();

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    | "producao"
    | "lotes"
  >(
    "producao"
  );

  const [items, setItems] = useState<GuiaConvenio[]>([]);
  const [lotes, setLotes] = useState<LoteConvenio[]>([]);
  const [search, setSearch] = useState("");
  const [competencia, setCompetencia] = useState(currentMonth());
  const [status, setStatus] = useState<"Todos" | GuiaConvenioStatus>("Todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [
    selectedLote,
    setSelectedLote,
  ] =
    useState<
      LoteConvenio |
      null
    >(
      null
    );


  const [
    retornoLote,
    setRetornoLote,
  ] =
    useState<
      LoteConvenio |
      null
    >(
      null
    );

  const [
    retornoItems,
    setRetornoItems,
  ] =
    useState<
      Array<{
        guiaId: string;
        paciente: string;
        descricao: string;
        valorTotal: number;
        valorAprovado: string;
        valorGlosado: string;
        motivoGlosa: string;
      }>
    >(
      []
    );


  const [
    repasseLote,
    setRepasseLote,
  ] =
    useState<
      LoteConvenio |
      null
    >(
      null
    );

  const [
    repasseAmount,
    setRepasseAmount,
  ] =
    useState(
      ""
    );

  const [
    repasseDate,
    setRepasseDate,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

  const [
    repasseBankAccountId,
    setRepasseBankAccountId,
  ] =
    useState(
      ""
    );

  const [
    repasseObservation,
    setRepasseObservation,
  ] =
    useState(
      ""
    );

  const [
    savingRepasse,
    setSavingRepasse,
  ] =
    useState(
      false
    );


  const [
    recursosGlosa,
    setRecursosGlosa,
  ] =
    useState<
      RecursoGlosa[]
    >(
      []
    );

  const [
    recursoGuia,
    setRecursoGuia,
  ] =
    useState<
      GuiaConvenio |
      null
    >(
      null
    );

  const [
    recursoValor,
    setRecursoValor,
  ] =
    useState(
      ""
    );

  const [
    recursoJustificativa,
    setRecursoJustificativa,
  ] =
    useState(
      ""
    );

  const [
    recursoProtocolo,
    setRecursoProtocolo,
  ] =
    useState(
      ""
    );

  const [
    recursoDataEnvio,
    setRecursoDataEnvio,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

  const [
    retornoRecurso,
    setRetornoRecurso,
  ] =
    useState<
      RecursoGlosa |
      null
    >(
      null
    );

  const [
    retornoRecursoAprovado,
    setRetornoRecursoAprovado,
  ] =
    useState(
      true
    );

  const [
    retornoRecursoValor,
    setRetornoRecursoValor,
  ] =
    useState(
      ""
    );

  const [
    retornoRecursoData,
    setRetornoRecursoData,
  ] =
    useState(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

  const [
    retornoRecursoObservacao,
    setRetornoRecursoObservacao,
  ] =
    useState(
      ""
    );

  const bankAccounts =
    useMemo(
      () =>
        getBankAccounts().filter(
          (
            account
          ) =>
            account.status ===
            "Ativa"
        ),
      []
    );

  const selectedRepasseBankAccount =
    useMemo(
      () =>
        bankAccounts.find(
          (
            account
          ) =>
            account.id ===
            repasseBankAccountId
        ),
      [
        bankAccounts,
        repasseBankAccountId,
      ]
    );

  const load = () => {
    setItems(
      getGuiasConvenios()
    );
    setLotes(
      getLotesConvenios()
    );

    setRecursosGlosa(
      getRecursosGlosa()
    );
  };

  useEffect(() => {
    load();

    const refresh = () => load();

    window.addEventListener(
      "guias-convenios-changed",
      refresh
    );

    window.addEventListener(
      "lotes-convenios-changed",
      refresh
    );

    window.addEventListener(
      "recursos-glosa-changed",
      refresh
    );

    return () => {
      window.removeEventListener(
        "guias-convenios-changed",
        refresh
      );

      window.removeEventListener(
        "lotes-convenios-changed",
        refresh
      );

      window.removeEventListener(
        "recursos-glosa-changed",
        refresh
      );
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesUnit = item.unitId === activeUnitId;
      const matchesCompetencia = !competencia || item.competencia === competencia;
      const matchesStatus = status === "Todos" || item.status === status;
      const matchesSearch =
        !q ||
        item.convenio.toLowerCase().includes(q) ||
        item.plano.toLowerCase().includes(q) ||
        item.paciente.toLowerCase().includes(q) ||
        item.numeroGuia.toLowerCase().includes(q);
      return matchesUnit && matchesCompetencia && matchesStatus && matchesSearch;
    });
  }, [items, search, competencia, status, activeUnitId]);

  const availableGroups =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            {
              convenio:
                string;
              competencia:
                string;
              guides:
                GuiaConvenio[];
              quantidade:
                number;
              valor:
                number;
            }
          >();

        items
          .filter(
            (item) =>
              item.unitId ===
                activeUnitId &&
              item.status ===
                "Pendente de envio" &&
              !item.loteId &&
              (
                !competencia ||
                item.competencia ===
                  competencia
              )
          )
          .forEach(
            (item) => {
              const key =
                `${item.convenio}__${item.competencia}`;

              const current =
                map.get(
                  key
                ) ?? {
                  convenio:
                    item.convenio,
                  competencia:
                    item.competencia,
                  guides:
                    [],
                  quantidade:
                    0,
                  valor:
                    0,
                };

              current.guides.push(
                item
              );

              current.quantidade +=
                item.quantidadeSessoes;

              current.valor +=
                item.valorTotal;

              map.set(
                key,
                current
              );
            }
          );

        return Array.from(
          map.values()
        ).sort(
          (a, b) =>
            a.convenio.localeCompare(
              b.convenio,
              "pt-BR"
            )
        );
      },
      [
        items,
        activeUnitId,
        competencia,
      ]
    );

  const filteredLotes =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();

        return lotes.filter(
          (lote) => {
            const matchesUnit =
              lote.unitId ===
              activeUnitId;

            const matchesCompetencia =
              !competencia ||
              lote.competencia ===
                competencia;

            const matchesSearch =
              !q ||
              lote.convenio
                .toLowerCase()
                .includes(
                  q
                ) ||
              lote.id
                .toLowerCase()
                .includes(
                  q
                ) ||
              (
                lote.protocoloEnvio ??
                ""
              )
                .toLowerCase()
                .includes(
                  q
                );

            return (
              matchesUnit &&
              matchesCompetencia &&
              matchesSearch
            );
          }
        );
      },
      [
        lotes,
        search,
        competencia,
        activeUnitId,
      ]
    );

  const glosasDaUnidade =
    useMemo(
      () =>
        items
          .filter(
            (
              item
            ) =>
              item.unitId ===
                activeUnitId &&
              (
                (
                  item.valorGlosado ??
                  0
                ) >
                  0 ||
                [
                  "Glosado",
                  "Em recurso",
                  "Recurso aprovado",
                  "Recurso negado",
                ].includes(
                  item.status
                )
              ) &&
              (
                !competencia ||
                item.competencia ===
                  competencia
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              b.dataAtendimento.localeCompare(
                a.dataAtendimento
              )
          ),
      [
        items,
        activeUnitId,
        competencia,
      ]
    );

  const recursosDaUnidade =
    useMemo(
      () =>
        recursosGlosa.filter(
          (
            recurso
          ) =>
            recurso.unitId ===
            activeUnitId
        ),
      [
        recursosGlosa,
        activeUnitId,
      ]
    );

  const glosaSummary =
    useMemo(
      () => {
        const totalGlosado =
          glosasDaUnidade.reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                item.valorGlosado ??
                0
              ),
            0
          );

        const emRecurso =
          recursosDaUnidade
            .filter(
              (
                item
              ) =>
                item.status ===
                "Em recurso"
            )
            .reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.valorRecorrido,
              0
            );

        const recuperado =
          recursosDaUnidade
            .filter(
              (
                item
              ) =>
                item.status ===
                "Aprovado"
            )
            .reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.valorRecuperado ??
                  0
                ),
              0
            );

        const perdido =
          recursosDaUnidade
            .filter(
              (
                item
              ) =>
                item.status ===
                "Negado"
            )
            .reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.valorRecorrido,
              0
            );

        return {
          totalGlosado,
          emRecurso,
          recuperado,
          perdido,
        };
      },
      [
        glosasDaUnidade,
        recursosDaUnidade,
      ]
    );

  const loteSummary =
    useMemo(
      () => {
        const base =
          lotes.filter(
            (lote) =>
              lote.unitId ===
                activeUnitId &&
              (
                !competencia ||
                lote.competencia ===
                  competencia
              )
          );

        return {
          abertos:
            base.filter(
              (item) =>
                item.status ===
                "Aberto"
            ).length,

          fechados:
            base.filter(
              (item) =>
                item.status ===
                "Fechado"
            ).length,

          enviados:
            base.filter(
              (item) =>
                ![
                  "Aberto",
                  "Fechado",
                ].includes(
                  item.status
                )
            ).length,

          valor:
            base.reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.valorTotal,
              0
            ),
        };
      },
      [
        lotes,
        activeUnitId,
        competencia,
      ]
    );

  const summary = useMemo(() => {
    const base = items.filter(
      (item) =>
        item.unitId === activeUnitId &&
        (!competencia || item.competencia === competencia)
    );

    return {
      faturado: base.reduce((sum, item) => sum + item.valorTotal, 0),
      enviado: base
        .filter((item) => ["Enviado", "Aprovado", "Pago"].includes(item.status))
        .reduce((sum, item) => sum + item.valorTotal, 0),
      glosado: base
        .filter((item) => item.status === "Glosado")
        .reduce((sum, item) => sum + item.valorTotal, 0),
      pago: base
        .filter((item) => item.status === "Pago")
        .reduce((sum, item) => sum + item.valorTotal, 0),
    };
  }, [items, competencia, activeUnitId]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const qtd = Number(form.quantidadeSessoes);
    const unit = Number(form.valorUnitario.replace(/\./g, "").replace(",", "."));

    if (!form.convenio.trim() || !form.paciente.trim()) {
      alert("Informe o convênio e o paciente.");
      return;
    }

    if (!Number.isInteger(qtd) || qtd <= 0 || !Number.isFinite(unit) || unit < 0) {
      alert("Informe quantidade e valor válidos.");
      return;
    }

    createGuiaConvenio({
      unitId: activeUnitId,
      convenio: form.convenio.trim(),
      plano: form.plano.trim(),
      paciente: form.paciente.trim(),
      numeroGuia: form.numeroGuia.trim(),
      competencia: form.competencia,
      dataAtendimento: form.dataAtendimento,
      quantidadeSessoes: qtd,
      valorUnitario: unit,
      status: "Pendente de envio",
      observacoes: form.observacoes.trim(),
    });

    setForm({ ...emptyForm, competencia });
    setOpen(false);
  }

  function enviar(item: GuiaConvenio) {
    updateGuiaConvenio(item.id, {
      status: "Enviado",
      dataEnvio: new Date().toISOString().slice(0, 10),
    });
  }

  function aprovar(item: GuiaConvenio) {
    updateGuiaConvenio(item.id, { status: "Aprovado" });
  }

  function glosar(item: GuiaConvenio) {
    const motivo = window.prompt("Informe o motivo da glosa:");
    if (!motivo?.trim()) return;
    updateGuiaConvenio(item.id, {
      status: "Glosado",
      motivoGlosa: motivo.trim(),
    });
  }

  function pagar(item: GuiaConvenio) {
    updateGuiaConvenio(item.id, {
      status: "Pago",
      dataPagamento: new Date().toISOString().slice(0, 10),
    });
  }

  function criarLote(
    convenio: string,
    competenciaLote: string
  ) {
    try {
      const lote =
        createLoteConvenio({
          unitId:
            activeUnitId,
          convenio,
          competencia:
            competenciaLote,
        });

      setSelectedLote(
        lote
      );

      setActiveTab(
        "lotes"
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível criar o lote."
      );
    }
  }

  function fecharLote(
    lote: LoteConvenio
  ) {
    if (
      !window.confirm(
        `Fechar o lote de ${lote.convenio} com ${lote.quantidadeAtendimentos} atendimento(s) e total de ${money(
          lote.valorTotal
        )}?`
      )
    ) {
      return;
    }

    try {
      closeLoteConvenio(
        lote.id
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível fechar o lote."
      );
    }
  }

  function enviarLote(
    lote: LoteConvenio
  ) {
    const protocolo =
      window.prompt(
        "Informe o protocolo de envio (opcional):"
      );

    if (
      protocolo ===
      null
    ) {
      return;
    }

    try {
      sendLoteConvenio(
        lote.id,
        protocolo
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível enviar o lote."
      );
    }
  }

  function desfazerLote(
    lote: LoteConvenio
  ) {
    if (
      !window.confirm(
        "Desfazer este lote e devolver os atendimentos para a produção pendente?"
      )
    ) {
      return;
    }

    try {
      reopenLoteConvenio(
        lote.id
      );

      if (
        selectedLote?.id ===
        lote.id
      ) {
        setSelectedLote(
          null
        );
      }
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível desfazer o lote."
      );
    }
  }


  function abrirRetorno(
    lote: LoteConvenio
  ) {
    const guias =
      getGuiasByLote(
        lote.id
      );

    setRetornoLote(
      lote
    );

    setRetornoItems(
      guias.map(
        (
          guia
        ) => ({
          guiaId:
            guia.id,
          paciente:
            guia.paciente,
          descricao:
            [
              guia.specialty,
              formatDate(
                guia.dataAtendimento
              ),
            ]
              .filter(
                Boolean
              )
              .join(
                " • "
              ),
          valorTotal:
            guia.valorTotal,
          valorAprovado:
            String(
              guia.valorAprovado ??
              guia.valorTotal
            ),
          valorGlosado:
            String(
              guia.valorGlosado ??
              0
            ),
          motivoGlosa:
            guia.motivoGlosa ??
            "",
        })
      )
    );
  }

  function atualizarRetornoItem(
    guiaId: string,
    field:
      | "valorAprovado"
      | "valorGlosado"
      | "motivoGlosa",
    value: string
  ) {
    setRetornoItems(
      (
        current
      ) =>
        current.map(
          (
            item
          ) => {
            if (
              item.guiaId !==
              guiaId
            ) {
              return item;
            }

            if (
              field ===
              "valorAprovado"
            ) {
              const aprovado =
                Math.max(
                  Number(
                    value
                  ) ||
                    0,
                  0
                );

              const glosado =
                Math.max(
                  item.valorTotal -
                    aprovado,
                  0
                );

              return {
                ...item,
                valorAprovado:
                  value,
                valorGlosado:
                  String(
                    glosado
                  ),
              };
            }

            if (
              field ===
              "valorGlosado"
            ) {
              const glosado =
                Math.max(
                  Number(
                    value
                  ) ||
                    0,
                  0
                );

              const aprovado =
                Math.max(
                  item.valorTotal -
                    glosado,
                  0
                );

              return {
                ...item,
                valorGlosado:
                  value,
                valorAprovado:
                  String(
                    aprovado
                  ),
              };
            }

            return {
              ...item,
              motivoGlosa:
                value,
            };
          }
        )
    );
  }

  function salvarRetorno() {
    if (
      !retornoLote
    ) {
      return;
    }

    const invalid =
      retornoItems.some(
        (
          item
        ) => {
          const aprovado =
            Math.max(
              Number(
                item.valorAprovado
              ) ||
                0,
              0
            );

          const glosado =
            Math.max(
              Number(
                item.valorGlosado
              ) ||
                0,
              0
            );

          return Math.abs(
            (
              aprovado +
              glosado
            ) -
            item.valorTotal
          ) >
          0.01;
        }
      );

    if (
      invalid
    ) {
      alert(
        "Em cada atendimento, a soma do valor aprovado com o valor glosado precisa ser igual ao valor faturado."
      );

      return;
    }

    const missingReason =
      retornoItems.some(
        (
          item
        ) =>
          (
            Number(
              item.valorGlosado
            ) ||
            0
          ) >
            0 &&
          !item.motivoGlosa.trim()
      );

    if (
      missingReason
    ) {
      alert(
        "Informe o motivo da glosa nos atendimentos que tiveram valor glosado."
      );

      return;
    }

    try {
      registerLoteConvenioReturn({
        loteId:
          retornoLote.id,
        items:
          retornoItems.map(
            (
              item
            ) => ({
              guiaId:
                item.guiaId,
              valorAprovado:
                Math.max(
                  Number(
                    item.valorAprovado
                  ) ||
                    0,
                  0
                ),
              valorGlosado:
                Math.max(
                  Number(
                    item.valorGlosado
                  ) ||
                    0,
                  0
                ),
              motivoGlosa:
                item.motivoGlosa.trim() ||
                undefined,
            })
          ),
      });

      setRetornoLote(
        null
      );

      setRetornoItems(
        []
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível registrar o retorno do convênio."
      );
    }
  }


  function abrirRecurso(
    guia: GuiaConvenio
  ) {
    setRecursoGuia(
      guia
    );

    setRecursoValor(
      String(
        guia.valorGlosado ??
        0
      )
    );

    setRecursoJustificativa(
      ""
    );

    setRecursoProtocolo(
      ""
    );

    setRecursoDataEnvio(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );
  }

  function salvarRecurso() {
    if (
      !recursoGuia
    ) {
      return;
    }

    try {
      createRecursoGlosa({
        guiaId:
          recursoGuia.id,

        valorRecorrido:
          Number(
            recursoValor
          ) ||
          0,

        justificativaRecurso:
          recursoJustificativa,

        protocolo:
          recursoProtocolo,

        dataEnvio:
          recursoDataEnvio,
      });

      setRecursoGuia(
        null
      );

      setRecursoValor(
        ""
      );

      setRecursoJustificativa(
        ""
      );

      setRecursoProtocolo(
        ""
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível registrar o recurso."
      );
    }
  }

  function abrirRetornoRecurso(
    recurso: RecursoGlosa
  ) {
    setRetornoRecurso(
      recurso
    );

    setRetornoRecursoAprovado(
      true
    );

    setRetornoRecursoValor(
      String(
        recurso.valorRecorrido
      )
    );

    setRetornoRecursoData(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

    setRetornoRecursoObservacao(
      ""
    );
  }

  function salvarRetornoRecurso() {
    if (
      !retornoRecurso
    ) {
      return;
    }

    try {
      registerRecursoGlosaReturn({
        recursoId:
          retornoRecurso.id,

        approved:
          retornoRecursoAprovado,

        valorRecuperado:
          retornoRecursoAprovado
            ? Number(
                retornoRecursoValor
              ) ||
              0
            : 0,

        dataRetorno:
          retornoRecursoData,

        observacaoRetorno:
          retornoRecursoObservacao,
      });

      setRetornoRecurso(
        null
      );

      setRetornoRecursoValor(
        ""
      );

      setRetornoRecursoObservacao(
        ""
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível registrar o retorno do recurso."
      );
    }
  }

  function abrirRepasse(
    lote: LoteConvenio
  ) {
    const approved =
      lote.valorAprovado ??
      0;

    const received =
      lote.valorRecebido ??
      (
        lote.repasses ??
        []
      ).reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.amount,
        0
      );

    const balance =
      Math.max(
        approved -
          received,
        0
      );

    setRepasseLote(
      lote
    );

    setRepasseAmount(
      balance
        .toFixed(
          2
        )
    );

    setRepasseDate(
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

    setRepasseBankAccountId(
      ""
    );

    setRepasseObservation(
      ""
    );
  }

  function fecharRepasseModal() {
    if (
      savingRepasse
    ) {
      return;
    }

    setRepasseLote(
      null
    );

    setRepasseAmount(
      ""
    );

    setRepasseBankAccountId(
      ""
    );

    setRepasseObservation(
      ""
    );
  }

  function salvarRepasse() {
    if (
      !repasseLote
    ) {
      return;
    }

    const amount =
      Math.max(
        Number(
          repasseAmount
        ) ||
          0,
        0
      );

    const approved =
      repasseLote.valorAprovado ??
      0;

    const alreadyReceived =
      repasseLote.valorRecebido ??
      (
        repasseLote.repasses ??
        []
      ).reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.amount,
        0
      );

    const balance =
      Math.max(
        approved -
          alreadyReceived,
        0
      );

    if (
      amount <=
      0
    ) {
      alert(
        "Informe o valor recebido."
      );

      return;
    }

    if (
      amount >
      balance +
        0.01
    ) {
      alert(
        `O valor recebido não pode ultrapassar o saldo aprovado de ${money(
          balance
        )}.`
      );

      return;
    }

    if (
      !repasseDate
    ) {
      alert(
        "Informe a data do repasse."
      );

      return;
    }

    if (
      !selectedRepasseBankAccount
    ) {
      alert(
        "Selecione a conta bancária que recebeu o repasse."
      );

      return;
    }

    setSavingRepasse(
      true
    );

    try {
      const sourceReference =
        `convenio-repasse:${repasseLote.id}:${Date.now()}`;

      /*
       * 1. Registra a receita no Financeiro central.
       */
      const financialReceipt =
        createPaidFinancialReceipt({
          unitId:
            repasseLote.unitId,

          patientId:
            0,

          patient:
            `Convênio ${repasseLote.convenio}`,

          description:
            `Repasse de convênio - ${repasseLote.convenio} - competência ${repasseLote.competencia}`,

          date:
            repasseDate,

          paymentMethod:
            "Transferência",

          amount,

          specialty:
            "Receita de convênio",

          professional:
            "Convênio",

          observation:
            repasseObservation.trim() ||
            `Repasse referente ao lote ${repasseLote.id.slice(
              0,
              8
            )}`,

          billingType:
            "Convênio",

          convenio:
            repasseLote.convenio,

          bankAccountId:
            selectedRepasseBankAccount.id,

          bankAccountName:
            `${selectedRepasseBankAccount.accountName} — ${selectedRepasseBankAccount.bankName}`,

          sourceType:
            "convenio-repasse",

          sourceReference,
        });

      /*
       * 2. Cria a entrada real na conta bancária.
       */
      const bankTransaction =
        createManualBankTransaction({
          accountId:
            selectedRepasseBankAccount.id,

          date:
            repasseDate,

          description:
            `REPASSE ${repasseLote.convenio.toUpperCase()} | LOTE ${repasseLote.id.slice(
              0,
              8
            )}`,

          amount,
        });

      /*
       * 3. Concilia automaticamente a entrada bancária
       *    com a receita criada no Financeiro.
       */
      reconcileBankTransaction({
        transactionId:
          bankTransaction.id,

        type:
          "Receita",

        category:
          "Recebimento de convênio",

        notes:
          repasseObservation.trim() ||
          `Repasse automático do lote ${repasseLote.id.slice(
            0,
            8
          )}`,

        reconciledAt:
          new Date().toISOString(),

        linkedType:
          "charge",

        linkedId:
          financialReceipt.id,

        linkedLabel:
          financialReceipt.description,
      });

      /*
       * 4. Salva o repasse dentro do lote.
       */
      registerLoteConvenioRepasse({
        loteId:
          repasseLote.id,

        repasse: {
          id:
            crypto.randomUUID?.() ??
            `${Date.now()}`,

          loteId:
            repasseLote.id,

          unitId:
            repasseLote.unitId,

          convenio:
            repasseLote.convenio,

          date:
            repasseDate,

          amount,

          bankAccountId:
            selectedRepasseBankAccount.id,

          bankAccountName:
            `${selectedRepasseBankAccount.accountName} — ${selectedRepasseBankAccount.bankName}`,

          financeChargeId:
            financialReceipt.id,

          bankTransactionId:
            bankTransaction.id,

          observation:
            repasseObservation.trim() ||
            undefined,

          createdAt:
            new Date().toISOString(),
        },
      });

      const refreshed =
        getLoteConvenioById(
          repasseLote.id
        );

      if (
        refreshed
      ) {
        setSelectedLote(
          refreshed
        );
      }

      setRepasseLote(
        null
      );

      setRepasseAmount(
        ""
      );

      setRepasseBankAccountId(
        ""
      );

      setRepasseObservation(
        ""
      );

      alert(
        "Repasse registrado com sucesso. A entrada já foi lançada no Financeiro e na conta bancária."
      );
    } catch (
      error
    ) {
      alert(
        error instanceof
        Error
          ? error.message
          : "Não foi possível registrar o repasse."
      );
    } finally {
      setSavingRepasse(
        false
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Faturamento de convênios
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Confira a produção, monte lotes por convênio e competência e acompanhe o envio para faturamento.
            </p>
          </div>

          <button
            onClick={() =>
              setOpen(
                true
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus
              size={
                18
              }
            />

            Lançamento manual
          </button>
        </div>

        {/* ABAS */}

        <div className="border-b border-slate-200">
          <div className="flex gap-7">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "producao"
                )
              }
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                activeTab ===
                "producao"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              Produção
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "lotes"
                )
              }
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                activeTab ===
                "lotes"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              Lotes

              {lotes.filter(
                (lote) =>
                  lote.unitId ===
                  activeUnitId
              ).length >
                0 && (
                <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {
                    lotes.filter(
                      (lote) =>
                        lote.unitId ===
                        activeUnitId
                    ).length
                  }
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "glosas"
                )
              }
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                activeTab ===
                "glosas"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              Glosas e recursos

              {glosasDaUnidade.length >
                0 && (
                <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {
                    glosasDaUnidade.length
                  }
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab ===
        "producao" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card
                icon={
                  CircleDollarSign
                }
                label="Produção"
                value={
                  money(
                    summary.faturado
                  )
                }
              />

              <Card
                icon={
                  FolderClosed
                }
                label="Disponível para lote"
                value={
                  String(
                    availableGroups.reduce(
                      (
                        total,
                        group
                      ) =>
                        total +
                        group.quantidade,
                      0
                    )
                  )
                }
              />

              <Card
                icon={
                  Send
                }
                label="Enviado"
                value={
                  money(
                    summary.enviado
                  )
                }
              />

              <Card
                icon={
                  FileWarning
                }
                label="Glosado"
                value={
                  money(
                    summary.glosado
                  )
                }
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px]">
                <label className="relative">
                  <Search
                    size={
                      18
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Buscar por convênio, plano, paciente ou guia"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
                  />
                </label>

                <input
                  type="month"
                  value={
                    competencia
                  }
                  onChange={(
                    e
                  ) =>
                    setCompetencia(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />

                <select
                  value={
                    status
                  }
                  onChange={(
                    e
                  ) =>
                    setStatus(
                      e.target.value as typeof status
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option>
                    Todos
                  </option>

                  {statuses.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* AGRUPAMENTO PARA LOTE */}

            <section className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <Box
                    size={
                      19
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-900">
                    Produção disponível para fechamento
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Os atendimentos pendentes são agrupados automaticamente por convênio e competência.
                  </p>

                  {availableGroups.length >
                  0 ? (
                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                      {availableGroups.map(
                        (
                          group
                        ) => (
                          <div
                            key={`${group.convenio}-${group.competencia}`}
                            className="rounded-xl border border-violet-100 bg-white p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-bold text-slate-900">
                                  {
                                    group.convenio
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Competência{" "}
                                  {
                                    group.competencia
                                  }
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  criarLote(
                                    group.convenio,
                                    group.competencia
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                              >
                                <PackageCheck
                                  size={
                                    15
                                  }
                                />

                                Criar lote
                              </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <MiniInfo
                                label="Atendimentos"
                                value={
                                  String(
                                    group.quantidade
                                  )
                                }
                              />

                              <MiniInfo
                                label="Valor"
                                value={
                                  money(
                                    group.valor
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg bg-white px-4 py-5 text-center text-xs text-slate-500">
                      Nenhuma produção pendente disponível para criar lote nesta competência.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* PRODUÇÃO DETALHADA */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Atendimentos da produção
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Paciente",
                        "Convênio / Plano",
                        "Guia",
                        "Atendimento",
                        "Sessões",
                        "Valor",
                        "Situação",
                        "Lote",
                      ].map(
                        (
                          h
                        ) => (
                          <th
                            key={
                              h
                            }
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {
                              h
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(
                      (
                        item
                      ) => (
                        <tr
                          key={
                            item.id
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">
                              {
                                item.paciente
                              }
                            </div>

                            {(item.specialty ||
                              item.professional) && (
                              <div className="mt-1 text-xs text-slate-500">
                                {[
                                  item.specialty,
                                  item.professional,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    " • "
                                  )}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-sm text-slate-900">
                              {
                                item.convenio
                              }
                            </div>

                            <div className="text-xs text-slate-500">
                              {item.plano ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {item.numeroGuia ||
                              "—"}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {formatDate(
                              item.dataAtendimento
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {
                              item.quantidadeSessoes
                            }
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-900">
                            {money(
                              item.valorTotal
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badge(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {item.loteId ? (
                              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                                Em lote
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}

                    {filtered.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={
                            8
                          }
                          className="px-4 py-12 text-center text-sm text-slate-500"
                        >
                          Nenhuma produção encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab ===
          "lotes" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card
                icon={
                  Box
                }
                label="Lotes abertos"
                value={
                  String(
                    loteSummary.abertos
                  )
                }
              />

              <Card
                icon={
                  FolderClosed
                }
                label="Lotes fechados"
                value={
                  String(
                    loteSummary.fechados
                  )
                }
              />

              <Card
                icon={
                  Send
                }
                label="Lotes enviados"
                value={
                  String(
                    loteSummary.enviados
                  )
                }
              />

              <Card
                icon={
                  CircleDollarSign
                }
                label="Valor em lotes"
                value={
                  money(
                    loteSummary.valor
                  )
                }
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
                <label className="relative">
                  <Search
                    size={
                      18
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Buscar por convênio, protocolo ou lote"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
                  />
                </label>

                <input
                  type="month"
                  value={
                    competencia
                  }
                  onChange={(
                    e
                  ) =>
                    setCompetencia(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.75fr)]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          "Convênio",
                          "Competência",
                          "Atendimentos",
                          "Valor",
                          "Situação",
                          "Ações",
                        ].map(
                          (
                            h
                          ) => (
                            <th
                              key={
                                h
                              }
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              {
                                h
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredLotes.map(
                        (
                          lote
                        ) => (
                          <tr
                            key={
                              lote.id
                            }
                            onClick={() =>
                              setSelectedLote(
                                lote
                              )
                            }
                            className={`cursor-pointer transition hover:bg-slate-50 ${
                              selectedLote?.id ===
                              lote.id
                                ? "bg-violet-50/50"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">
                                {
                                  lote.convenio
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Lote{" "}
                                {lote.id.slice(
                                  0,
                                  8
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-700">
                              {
                                lote.competencia
                              }
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-700">
                              {
                                lote.quantidadeAtendimentos
                              }
                            </td>

                            <td className="px-4 py-4 font-bold text-slate-900">
                              {money(
                                lote.valorTotal
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${loteBadge(
                                  lote.status
                                )}`}
                              >
                                {
                                  lote.status
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                {lote.status ===
                                  "Aberto" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        fecharLote(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                                    >
                                      Fechar lote
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        desfazerLote(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                                    >
                                      Desfazer
                                    </button>
                                  </>
                                )}

                                {lote.status ===
                                  "Fechado" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        enviarLote(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                                    >
                                      Enviar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        desfazerLote(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                                    >
                                      Desfazer
                                    </button>
                                  </>
                                )}

                                {lote.status ===
                                  "Enviado" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        abrirRetorno(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                                    >
                                      Registrar retorno
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();

                                        try {
                                          markLoteConvenioInAnalysis(
                                            lote.id
                                          );
                                        } catch (
                                          error
                                        ) {
                                          alert(
                                            error instanceof
                                            Error
                                              ? error.message
                                              : "Não foi possível atualizar o lote."
                                          );
                                        }
                                      }}
                                      className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700"
                                    >
                                      Em análise
                                    </button>
                                  </>
                                )}

                                {lote.status ===
                                  "Em análise" && (
                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();
                                      abrirRetorno(
                                        lote
                                      );
                                    }}
                                    className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                                  >
                                    Registrar retorno
                                  </button>
                                )}

                                {[
                                  "Aprovado",
                                  "Parcialmente aprovado",
                                  "Parcialmente pago",
                                ].includes(
                                  lote.status
                                ) && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(
                                        event
                                      ) => {
                                        event.stopPropagation();
                                        abrirRepasse(
                                          lote
                                        );
                                      }}
                                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                                    >
                                      Registrar repasse
                                    </button>

                                    {!(
                                      lote.repasses &&
                                      lote.repasses.length >
                                        0
                                    ) && (
                                      <button
                                        type="button"
                                        onClick={(
                                          event
                                        ) => {
                                          event.stopPropagation();

                                          if (
                                            !window.confirm(
                                              "Deseja apagar o retorno registrado e voltar o lote para Enviado?"
                                            )
                                          ) {
                                            return;
                                          }

                                          try {
                                            resetLoteConvenioReturn(
                                              lote.id
                                            );
                                          } catch (
                                            error
                                          ) {
                                            alert(
                                              error instanceof
                                              Error
                                                ? error.message
                                                : "Não foi possível redefinir o retorno."
                                            );
                                          }
                                        }}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                                      >
                                        Refazer retorno
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}

                      {filteredLotes.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={
                              6
                            }
                            className="px-4 py-12 text-center text-sm text-slate-500"
                          >
                            Nenhum lote encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETALHE DO LOTE */}

              <aside className="rounded-xl border border-slate-200 bg-white p-5">
                {selectedLote ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                          Detalhes do lote
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-slate-900">
                          {
                            selectedLote.convenio
                          }
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Competência{" "}
                          {
                            selectedLote.competencia
                          }
                        </p>
                      </div>

                      <CalendarCheck2
                        size={
                          22
                        }
                        className="text-violet-500"
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <MiniInfo
                        label="Atendimentos"
                        value={
                          String(
                            selectedLote.quantidadeAtendimentos
                          )
                        }
                      />

                      <MiniInfo
                        label="Valor"
                        value={
                          money(
                            selectedLote.valorTotal
                          )
                        }
                      />
                    </div>

                    {selectedLote.valorAprovado !==
                      undefined && (
                      <>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <MiniInfo
                            label="Aprovado"
                            value={
                              money(
                                selectedLote.valorAprovado
                              )
                            }
                          />

                          <MiniInfo
                            label="Glosado"
                            value={
                              money(
                                selectedLote.valorGlosado ??
                                0
                              )
                            }
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <MiniInfo
                            label="Recebido"
                            value={
                              money(
                                selectedLote.valorRecebido ??
                                0
                              )
                            }
                          />

                          <MiniInfo
                            label="Saldo a receber"
                            value={
                              money(
                                selectedLote.saldoAReceber ??
                                Math.max(
                                  (
                                    selectedLote.valorAprovado ??
                                    0
                                  ) -
                                  (
                                    selectedLote.valorRecebido ??
                                    0
                                  ),
                                  0
                                )
                              )
                            }
                          />
                        </div>
                      </>
                    )}

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      <InfoLine
                        label="Status"
                        value={
                          selectedLote.status
                        }
                      />

                      <InfoLine
                        label="Fechado em"
                        value={
                          selectedLote.dataFechamento
                            ? formatDate(
                                selectedLote.dataFechamento
                              )
                            : "—"
                        }
                      />

                      <InfoLine
                        label="Enviado em"
                        value={
                          selectedLote.dataEnvio
                            ? formatDate(
                                selectedLote.dataEnvio
                              )
                            : "—"
                        }
                      />

                      <InfoLine
                        label="Protocolo"
                        value={
                          selectedLote.protocoloEnvio ||
                          "—"
                        }
                      />
                    </div>

                    {selectedLote.repasses &&
                      selectedLote.repasses.length >
                        0 && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Repasses recebidos
                        </h3>

                        <div className="mt-3 space-y-2">
                          {selectedLote.repasses.map(
                            (
                              repasse
                            ) => (
                              <div
                                key={
                                  repasse.id
                                }
                                className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-bold text-emerald-800">
                                      {money(
                                        repasse.amount
                                      )}
                                    </p>

                                    <p className="mt-1 text-[9px] text-emerald-700">
                                      {formatDate(
                                        repasse.date
                                      )}{" "}
                                      •{" "}
                                      {
                                        repasse.bankAccountName
                                      }
                                    </p>
                                  </div>

                                  <CheckCircle2
                                    size={
                                      15
                                    }
                                    className="text-emerald-600"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Atendimentos do lote
                      </h3>

                      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto">
                        {getGuiasByLote(
                          selectedLote.id
                        ).map(
                          (
                            guia
                          ) => (
                            <div
                              key={
                                guia.id
                              }
                              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-800">
                                    {
                                      guia.paciente
                                    }
                                  </p>

                                  <p className="mt-1 truncate text-[10px] text-slate-500">
                                    {
                                      guia.specialty
                                    }{" "}
                                    •{" "}
                                    {formatDate(
                                      guia.dataAtendimento
                                    )}
                                  </p>
                                </div>

                                <span className="shrink-0 text-xs font-bold text-slate-700">
                                  {money(
                                    guia.valorTotal
                                  )}
                                </span>
                              </div>

                              {guia.valorAprovado !==
                                undefined && (
                                <div className="mt-2 flex flex-wrap gap-2 text-[9px]">
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                                    Aprovado:{" "}
                                    {money(
                                      guia.valorAprovado
                                    )}
                                  </span>

                                  {(guia.valorGlosado ??
                                    0) >
                                    0 && (
                                    <span className="rounded-full bg-red-50 px-2 py-1 font-bold text-red-700">
                                      Glosa:{" "}
                                      {money(
                                        guia.valorGlosado ??
                                        0
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}

                              {guia.motivoGlosa && (
                                <p className="mt-2 text-[9px] leading-relaxed text-red-600">
                                  {
                                    guia.motivoGlosa
                                  }
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                    <Box
                      size={
                        34
                      }
                      className="text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      Selecione um lote
                    </p>

                    <p className="mt-1 max-w-[260px] text-xs text-slate-500">
                      Clique em um lote para conferir os atendimentos, valores e informações de envio.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card
                icon={
                  FileWarning
                }
                label="Total glosado"
                value={
                  money(
                    glosaSummary.totalGlosado
                  )
                }
              />

              <Card
                icon={
                  Gavel
                }
                label="Em recurso"
                value={
                  money(
                    glosaSummary.emRecurso
                  )
                }
              />

              <Card
                icon={
                  CheckCircle2
                }
                label="Recuperado"
                value={
                  money(
                    glosaSummary.recuperado
                  )
                }
              />

              <Card
                icon={
                  RotateCcw
                }
                label="Recurso negado"
                value={
                  money(
                    glosaSummary.perdido
                  )
                }
              />
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Atendimentos com glosa
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Acompanhe a glosa e registre recurso quando a clínica decidir contestar o valor.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Paciente",
                        "Convênio",
                        "Atendimento",
                        "Faturado",
                        "Glosado",
                        "Motivo",
                        "Situação",
                        "Ação",
                      ].map(
                        (
                          title
                        ) => (
                          <th
                            key={
                              title
                            }
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {
                              title
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {glosasDaUnidade.map(
                      (
                        guia
                      ) => {
                        const recurso =
                          recursosDaUnidade.find(
                            (
                              item
                            ) =>
                              item.guiaId ===
                              guia.id
                          );

                        return (
                          <tr
                            key={
                              guia.id
                            }
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">
                                {
                                  guia.paciente
                                }
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-700">
                              {
                                guia.convenio
                              }
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-sm text-slate-700">
                                {
                                  guia.specialty
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-500">
                                {formatDate(
                                  guia.dataAtendimento
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm font-bold text-slate-700">
                              {money(
                                guia.valorTotal
                              )}
                            </td>

                            <td className="px-4 py-4 text-sm font-extrabold text-red-600">
                              {money(
                                guia.valorGlosado ??
                                0
                              )}
                            </td>

                            <td className="max-w-[250px] px-4 py-4 text-xs text-red-600">
                              {guia.motivoGlosa ||
                                "—"}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  guia.status ===
                                    "Em recurso"
                                    ? "border-violet-200 bg-violet-50 text-violet-700"
                                    : guia.status ===
                                        "Recurso aprovado"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : guia.status ===
                                          "Recurso negado"
                                        ? "border-slate-200 bg-slate-100 text-slate-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {
                                  guia.status
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              {guia.status ===
                                "Glosado" &&
                                !recurso && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirRecurso(
                                      guia
                                    )
                                  }
                                  className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                                >
                                  Recorrer
                                </button>
                              )}

                              {recurso?.status ===
                                "Em recurso" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirRetornoRecurso(
                                      recurso
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                                >
                                  Registrar retorno
                                </button>
                              )}

                              {recurso &&
                                recurso.status !==
                                  "Em recurso" && (
                                <div className="text-xs">
                                  <p className="font-bold text-slate-700">
                                    {recurso.status}
                                  </p>

                                  {recurso.valorRecuperado !==
                                    undefined && (
                                    <p className="mt-1 text-[10px] text-emerald-600">
                                      Recuperado:{" "}
                                      {money(
                                        recurso.valorRecuperado
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}

                    {glosasDaUnidade.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={
                            8
                          }
                          className="px-4 py-12 text-center text-sm text-slate-500"
                        >
                          Nenhuma glosa registrada nesta competência.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {recursosDaUnidade.length >
              0 && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Histórico de recursos
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {recursosDaUnidade.map(
                    (
                      recurso
                    ) => {
                      const guia =
                        items.find(
                          (
                            item
                          ) =>
                            item.id ===
                            recurso.guiaId
                        );

                      return (
                        <div
                          key={
                            recurso.id
                          }
                          className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr]"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {guia?.paciente ||
                                "Atendimento"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                recurso.convenio
                              }{" "}
                              • enviado em{" "}
                              {formatDate(
                                recurso.dataEnvio
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Valor recorrido
                            </p>

                            <p className="mt-1 text-sm font-bold text-violet-700">
                              {money(
                                recurso.valorRecorrido
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Resultado
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {
                                recurso.status
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              Recuperado
                            </p>

                            <p className="mt-1 text-sm font-bold text-emerald-700">
                              {recurso.valorRecuperado !==
                                undefined
                                ? money(
                                    recurso.valorRecuperado
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {recursoGuia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Gavel
                      size={20}
                      className="text-violet-600"
                    />

                    <h2 className="text-lg font-bold text-slate-900">
                      Recurso de glosa
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {recursoGuia.paciente} • {recursoGuia.convenio}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRecursoGuia(
                      null
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <MiniInfo
                    label="Valor glosado"
                    value={
                      money(
                        recursoGuia.valorGlosado ??
                        0
                      )
                    }
                  />

                  <MiniInfo
                    label="Valor aprovado"
                    value={
                      money(
                        recursoGuia.valorAprovado ??
                        0
                      )
                    }
                  />
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                    Motivo informado pelo convênio
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-red-700">
                    {recursoGuia.motivoGlosa ||
                      "Não informado"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Valor recorrido *
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={
                        recursoGuia.valorGlosado ??
                        0
                      }
                      value={
                        recursoValor
                      }
                      onChange={(
                        event
                      ) =>
                        setRecursoValor(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Data de envio *
                    </span>

                    <input
                      type="date"
                      value={
                        recursoDataEnvio
                      }
                      onChange={(
                        event
                      ) =>
                        setRecursoDataEnvio(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                    />
                  </label>
                </div>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Protocolo do recurso
                  </span>

                  <input
                    value={
                      recursoProtocolo
                    }
                    onChange={(
                      event
                    ) =>
                      setRecursoProtocolo(
                        event.target.value
                      )
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Justificativa do recurso *
                  </span>

                  <textarea
                    rows={5}
                    value={
                      recursoJustificativa
                    }
                    onChange={(
                      event
                    ) =>
                      setRecursoJustificativa(
                        event.target.value
                      )
                    }
                    placeholder="Explique por que a clínica está contestando a glosa..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setRecursoGuia(
                      null
                    )
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    salvarRecurso
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Gavel
                    size={16}
                  />

                  Enviar recurso
                </button>
              </div>
            </div>
          </div>
        )}

        {retornoRecurso && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Retorno do recurso
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      retornoRecurso.convenio
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRetornoRecurso(
                      null
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <MiniInfo
                    label="Valor recorrido"
                    value={
                      money(
                        retornoRecurso.valorRecorrido
                      )
                    }
                  />

                  <MiniInfo
                    label="Glosa original"
                    value={
                      money(
                        retornoRecurso.valorGlosadoOriginal
                      )
                    }
                  />
                </div>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Resultado *
                  </span>

                  <select
                    value={
                      retornoRecursoAprovado
                        ? "aprovado"
                        : "negado"
                    }
                    onChange={(
                      event
                    ) =>
                      setRetornoRecursoAprovado(
                        event.target.value ===
                          "aprovado"
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="aprovado">
                      Recurso aprovado
                    </option>

                    <option value="negado">
                      Recurso negado
                    </option>
                  </select>
                </label>

                {retornoRecursoAprovado && (
                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Valor recuperado *
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={
                        retornoRecurso.valorRecorrido
                      }
                      value={
                        retornoRecursoValor
                      }
                      onChange={(
                        event
                      ) =>
                        setRetornoRecursoValor(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 outline-none"
                    />
                  </label>
                )}

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Data do retorno *
                  </span>

                  <input
                    type="date"
                    value={
                      retornoRecursoData
                    }
                    onChange={(
                      event
                    ) =>
                      setRetornoRecursoData(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Observação
                  </span>

                  <textarea
                    rows={3}
                    value={
                      retornoRecursoObservacao
                    }
                    onChange={(
                      event
                    ) =>
                      setRetornoRecursoObservacao(
                        event.target.value
                      )
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
                  />
                </label>

                {retornoRecursoAprovado && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
                    O valor recuperado será acrescentado ao valor aprovado do lote e passará a compor o saldo a receber do convênio.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setRetornoRecurso(
                      null
                    )
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    salvarRetornoRecurso
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <CheckCircle2
                    size={16}
                  />

                  Salvar retorno
                </button>
              </div>
            </div>
          </div>
        )}

        {repasseLote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote
                      size={20}
                      className="text-emerald-600"
                    />

                    <h2 className="text-lg font-bold text-slate-900">
                      Registrar repasse
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {repasseLote.convenio} • Competência{" "}
                    {repasseLote.competencia}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    fecharRepasseModal
                  }
                  disabled={
                    savingRepasse
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-3 gap-3">
                  <MiniInfo
                    label="Aprovado"
                    value={
                      money(
                        repasseLote.valorAprovado ??
                        0
                      )
                    }
                  />

                  <MiniInfo
                    label="Já recebido"
                    value={
                      money(
                        repasseLote.valorRecebido ??
                        0
                      )
                    }
                  />

                  <MiniInfo
                    label="Saldo"
                    value={
                      money(
                        Math.max(
                          (
                            repasseLote.valorAprovado ??
                            0
                          ) -
                          (
                            repasseLote.valorRecebido ??
                            0
                          ),
                          0
                        )
                      )
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Valor recebido *
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        repasseAmount
                      }
                      onChange={(
                        event
                      ) =>
                        setRepasseAmount(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Data do repasse *
                    </span>

                    <input
                      type="date"
                      value={
                        repasseDate
                      }
                      onChange={(
                        event
                      ) =>
                        setRepasseDate(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Conta bancária que recebeu *
                  </span>

                  <select
                    value={
                      repasseBankAccountId
                    }
                    onChange={(
                      event
                    ) =>
                      setRepasseBankAccountId(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Selecione a conta...
                    </option>

                    {bankAccounts.map(
                      (
                        account
                      ) => (
                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          {account.accountName} — {account.bankName}
                        </option>
                      )
                    )}
                  </select>

                  {bankAccounts.length ===
                    0 && (
                    <p className="mt-2 text-xs font-semibold text-amber-600">
                      Nenhuma conta bancária ativa cadastrada.
                    </p>
                  )}
                </label>

                {selectedRepasseBankAccount && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <Building2
                      size={18}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        {
                          selectedRepasseBankAccount.accountName
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-emerald-700">
                        {
                          selectedRepasseBankAccount.bankName
                        }{" "}
                        • saldo atual{" "}
                        {money(
                          selectedRepasseBankAccount.currentBalance
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <label>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">
                    Observação
                  </span>

                  <textarea
                    rows={3}
                    value={
                      repasseObservation
                    }
                    onChange={(
                      event
                    ) =>
                      setRepasseObservation(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: crédito identificado no extrato do convênio."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </label>

                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
                  Ao confirmar, o valor será lançado automaticamente como receita no Financeiro, como entrada na conta bancária escolhida e ficará conciliado com este lote.
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={
                    fecharRepasseModal
                  }
                  disabled={
                    savingRepasse
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    salvarRepasse
                  }
                  disabled={
                    savingRepasse
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  <CheckCircle2
                    size={17}
                  />

                  {savingRepasse
                    ? "Registrando..."
                    : "Confirmar repasse"}
                </button>
              </div>
            </div>
          </div>
        )}

        {retornoLote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardCheck
                      size={20}
                      className="text-violet-600"
                    />

                    <h2 className="text-lg font-bold text-slate-900">
                      Retorno do convênio
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {retornoLote.convenio} • Competência{" "}
                    {retornoLote.competencia}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRetornoLote(
                      null
                    );
                    setRetornoItems(
                      []
                    );
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniInfo
                    label="Faturado"
                    value={
                      money(
                        retornoLote.valorTotal
                      )
                    }
                  />

                  <MiniInfo
                    label="Aprovado"
                    value={
                      money(
                        retornoItems.reduce(
                          (
                            sum,
                            item
                          ) =>
                            sum +
                            (
                              Number(
                                item.valorAprovado
                              ) ||
                              0
                            ),
                          0
                        )
                      )
                    }
                  />

                  <MiniInfo
                    label="Glosado"
                    value={
                      money(
                        retornoItems.reduce(
                          (
                            sum,
                            item
                          ) =>
                            sum +
                            (
                              Number(
                                item.valorGlosado
                              ) ||
                              0
                            ),
                          0
                        )
                      )
                    }
                  />
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[900px] w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          "Paciente",
                          "Faturado",
                          "Aprovado",
                          "Glosado",
                          "Motivo da glosa",
                        ].map(
                          (
                            title
                          ) => (
                            <th
                              key={
                                title
                              }
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              {
                                title
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {retornoItems.map(
                        (
                          item
                        ) => (
                          <tr
                            key={
                              item.guiaId
                            }
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  item.paciente
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-500">
                                {
                                  item.descricao
                                }
                              </p>
                            </td>

                            <td className="px-4 py-3 text-sm font-bold text-slate-700">
                              {money(
                                item.valorTotal
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={
                                  item.valorTotal
                                }
                                step="0.01"
                                value={
                                  item.valorAprovado
                                }
                                onChange={(
                                  event
                                ) =>
                                  atualizarRetornoItem(
                                    item.guiaId,
                                    "valorAprovado",
                                    event.target.value
                                  )
                                }
                                className="w-28 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 outline-none"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={
                                  item.valorTotal
                                }
                                step="0.01"
                                value={
                                  item.valorGlosado
                                }
                                onChange={(
                                  event
                                ) =>
                                  atualizarRetornoItem(
                                    item.guiaId,
                                    "valorGlosado",
                                    event.target.value
                                  )
                                }
                                className="w-28 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 outline-none"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                value={
                                  item.motivoGlosa
                                }
                                disabled={
                                  (
                                    Number(
                                      item.valorGlosado
                                    ) ||
                                    0
                                  ) <=
                                  0
                                }
                                onChange={(
                                  event
                                ) =>
                                  atualizarRetornoItem(
                                    item.guiaId,
                                    "motivoGlosa",
                                    event.target.value
                                  )
                                }
                                placeholder={
                                  (
                                    Number(
                                      item.valorGlosado
                                    ) ||
                                    0
                                  ) >
                                  0
                                    ? "Informe o motivo..."
                                    : "Sem glosa"
                                }
                                className="w-full min-w-[230px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                  Informe o valor efetivamente aprovado em cada atendimento. Quando houver diferença, o sistema calculará a glosa e exigirá o motivo.
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setRetornoLote(
                      null
                    );
                    setRetornoItems(
                      []
                    );
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    salvarRetorno
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <CheckCircle2
                    size={17}
                  />

                  Salvar retorno
                </button>
              </div>
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Lançamento manual de produção</h2>
                  <p className="text-sm text-slate-500">Use somente para ajustes ou produções que não vieram automaticamente da agenda.</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500"><X size={20} /></button>
              </div>
              <form onSubmit={submit} className="space-y-5 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Convênio *"><input required value={form.convenio} onChange={(e) => setForm({...form, convenio:e.target.value})} className="input-guide" /></Field>
                  <Field label="Plano"><input value={form.plano} onChange={(e) => setForm({...form, plano:e.target.value})} className="input-guide" /></Field>
                  <Field label="Paciente *"><input required value={form.paciente} onChange={(e) => setForm({...form, paciente:e.target.value})} className="input-guide" /></Field>
                  <Field label="Número da guia"><input value={form.numeroGuia} onChange={(e) => setForm({...form, numeroGuia:e.target.value})} className="input-guide" /></Field>
                  <Field label="Competência *"><input required type="month" value={form.competencia} onChange={(e) => setForm({...form, competencia:e.target.value})} className="input-guide" /></Field>
                  <Field label="Data do atendimento"><input type="date" value={form.dataAtendimento} onChange={(e) => setForm({...form, dataAtendimento:e.target.value})} className="input-guide" /></Field>
                  <Field label="Quantidade de sessões *"><input required type="number" min="1" value={form.quantidadeSessoes} onChange={(e) => setForm({...form, quantidadeSessoes:e.target.value})} className="input-guide" /></Field>
                  <Field label="Valor por sessão *"><input required inputMode="decimal" placeholder="0,00" value={form.valorUnitario} onChange={(e) => setForm({...form, valorUnitario:e.target.value})} className="input-guide" /></Field>
                </div>
                <Field label="Observações"><textarea rows={4} value={form.observacoes} onChange={(e) => setForm({...form, observacoes:e.target.value})} className="input-guide resize-none" /></Field>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Cancelar</button>
                  <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Salvar guia</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-guide {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: .5rem;
            padding: .625rem .75rem;
            font-size: .875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }
          .input-guide:focus { border-color: rgb(148 163 184); }
        `}</style>
      </div>
    </DashboardLayout>
  );
}


function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function Card({ icon: Icon, label, value }: { icon: typeof CircleDollarSign; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{value}</p></div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon size={22} /></div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}