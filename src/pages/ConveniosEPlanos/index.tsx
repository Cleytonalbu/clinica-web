import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  Plus,
  Search,
  ShieldCheck,
  TicketCheck,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUnit } from "@/providers/UnitContext";
import { getPatients } from "@/pages/Pacientes/patientStorage";
import { getActiveConvenios } from "@/pages/Configuracoes/settingsStorage";
import { convenioWorksAtUnit } from "@/pages/Configuracoes/convenioUnitStorage";
import {
  createConvenioPlano,
  getConveniosPlanos,
  registrarSessao,
  updateConvenioPlano,
  type ConvenioPlano,
  type ConvenioPlanoStatus,
} from "./insurancePlanStorage";

const emptyForm = {
  convenio: "",
  plano: "",
  paciente: "",
  valorSessao: "",
  sessoesAutorizadas: "",
  autorizacao: "",
  inicioAutorizacao: "",
  validadeAutorizacao: "",
  status: "Ativo" as ConvenioPlanoStatus,
  observacoes: "",
};

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function date(value: string) {
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
    : "—";
}

function situacao(item: ConvenioPlano) {
  if (item.status === "Inativo") return "Inativo";
  if (item.sessoesUtilizadas >= item.sessoesAutorizadas)
    return "Sessões esgotadas";

  if (item.validadeAutorizacao) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fim = new Date(`${item.validadeAutorizacao}T12:00:00`);
    const dias = Math.ceil(
      (fim.getTime() - hoje.getTime()) / 86400000
    );
    if (dias < 0) return "Autorização vencida";
    if (dias <= 15) return "Vence em breve";
  }

  return "Regular";
}

function badge(item: ConvenioPlano) {
  const s = situacao(item);
  if (s === "Regular")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "Vence em breve")
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (s === "Autorização vencida" || s === "Sessões esgotadas")
    return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-100 text-slate-500";
}

export default function ConveniosEPlanos() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [items, setItems] = useState<ConvenioPlano[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Todos" | ConvenioPlanoStatus>("Todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const patients = useMemo(
    () =>
      getPatients()
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    []
  );

  const convenios = useMemo(
    () =>
      getActiveConvenios()
        .filter((convenio) =>
          convenioWorksAtUnit(convenio.id, activeUnitId)
        )
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [activeUnitId]
  );

  function handleConvenioChange(convenioName: string) {
    const selected = convenios.find(
      (convenio) => convenio.name === convenioName
    );

    const configuredValues = selected
      ? Object.values(selected.specialtyValues || {}).filter(
          (value) => Number.isFinite(value) && value > 0
        )
      : [];

    const singleConfiguredValue =
      configuredValues.length === 1 ? configuredValues[0] : null;

    setForm((current) => ({
      ...current,
      convenio: convenioName,
      valorSessao:
        singleConfiguredValue !== null
          ? singleConfiguredValue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : current.valorSessao,
    }));
  }

  function load() {
    setItems(
      getConveniosPlanos().filter(
        (item) =>
          item.unitId ===
          activeUnitId
      )
    );
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("convenios-planos-changed", refresh);
    return () =>
      window.removeEventListener("convenios-planos-changed", refresh);
  }, [
    activeUnitId,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const okStatus = status === "Todos" || item.status === status;
      const okSearch =
        !q ||
        item.convenio.toLowerCase().includes(q) ||
        item.plano.toLowerCase().includes(q) ||
        item.paciente.toLowerCase().includes(q) ||
        item.autorizacao.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [items, search, status]);

  const summary = useMemo(() => {
    const active = items.filter((x) => x.status === "Ativo");
    const disponiveis = active.reduce(
      (sum, x) =>
        sum + Math.max(x.sessoesAutorizadas - x.sessoesUtilizadas, 0),
      0
    );
    const atencao = active.filter((x) =>
      ["Vence em breve", "Autorização vencida", "Sessões esgotadas"].includes(
        situacao(x)
      )
    ).length;
    const previsto = active.reduce(
      (sum, x) =>
        sum +
        Math.max(x.sessoesAutorizadas - x.sessoesUtilizadas, 0) *
          x.valorSessao,
      0
    );
    return { ativos: active.length, disponiveis, atencao, previsto };
  }, [items]);

  function submit(e: FormEvent) {
    e.preventDefault();

    const valorSessao = Number(
      form.valorSessao.replace(/\./g, "").replace(",", ".")
    );
    const autorizadas = Number(form.sessoesAutorizadas);
    const utilizadas = 0;

    if (!form.convenio.trim() || !form.plano.trim() || !form.paciente.trim()) {
      alert("Selecione o convênio e o paciente e informe o plano.");
      return;
    }
    if (!Number.isFinite(valorSessao) || valorSessao < 0) {
      alert("Informe um valor por sessão válido.");
      return;
    }
    if (!Number.isInteger(autorizadas) || autorizadas <= 0) {
      alert("Informe as sessões autorizadas.");
      return;
    }
    createConvenioPlano({
      unitId:
        activeUnitId,

      convenio: form.convenio.trim(),
      plano: form.plano.trim(),
      paciente: form.paciente.trim(),
      valorSessao,
      sessoesAutorizadas: autorizadas,
      sessoesUtilizadas: utilizadas,
      autorizacao: form.autorizacao.trim(),
      inicioAutorizacao: form.inicioAutorizacao,
      validadeAutorizacao: form.validadeAutorizacao,
      status: form.status,
      observacoes: form.observacoes.trim(),
    });

    setForm(emptyForm);
    setOpen(false);
  }

  function usarSessao(item: ConvenioPlano) {
    try {
      registrarSessao(item.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao registrar sessão.");
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Autorizações de convênios
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Controle as autorizações de convênio vinculadas aos pacientes, sessões e validade.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={18} />
            Nova autorização
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card icon={ShieldCheck} label="Autorizações ativas" value={`${summary.ativos}`} />
          <Card icon={TicketCheck} label="Sessões disponíveis" value={`${summary.disponiveis}`} />
          <Card icon={CalendarClock} label="Precisam de atenção" value={`${summary.atencao}`} />
          <Card icon={CircleDollarSign} label="Valor previsto" value={money(summary.previsto)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por convênio, plano, paciente ou autorização"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none"
              />
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Convênio / Plano",
                    "Paciente",
                    "Guia / Autorização",
                    "Sessões",
                    "Valor",
                    "Validade",
                    "Situação",
                    "Ação",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const restantes = Math.max(
                    item.sessoesAutorizadas - item.sessoesUtilizadas,
                    0
                  );
                  const s = situacao(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{item.convenio}</div>
                        <div className="text-xs text-slate-500">{item.plano}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.paciente || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.autorizacao || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {restantes} disponíveis
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.sessoesUtilizadas} de {item.sessoesAutorizadas} utilizadas
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {money(item.valorSessao)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {date(item.validadeAutorizacao)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badge(item)}`}>
                          {s}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {(s === "Regular" || s === "Vence em breve") && (
                            <button
                              onClick={() => usarSessao(item)}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                            >
                              Usar sessão
                            </button>
                          )}
                          <button
                            onClick={() =>
                              updateConvenioPlano(item.id, {
                                status: item.status === "Ativo" ? "Inativo" : "Ativo",
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                          >
                            {item.status === "Ativo" ? "Inativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                      Nenhuma autorização encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Nova autorização / autorização
                  </h2>
                  <p className="text-sm text-slate-500">
                    Vincule o paciente ao convênio e registre os dados da autorização.
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-5 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Convênio *">
                    <select
                      required
                      value={form.convenio}
                      onChange={(e) => handleConvenioChange(e.target.value)}
                      className="input-convenio"
                    >
                      <option value="">Selecione o convênio</option>
                      {convenios.map((convenio) => (
                        <option key={convenio.id} value={convenio.name}>
                          {convenio.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Paciente *">
                    <select
                      required
                      value={form.paciente}
                      onChange={(e) =>
                        setForm({ ...form, paciente: e.target.value })
                      }
                      className="input-convenio"
                    >
                      <option value="">Selecione o paciente</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.nome}>
                          {patient.nome}
                          {patient.status === "Inativo" ? " — Inativo" : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Plano *">
                    <input
                      required
                      value={form.plano}
                      onChange={(e) =>
                        setForm({ ...form, plano: e.target.value })
                      }
                      placeholder="Informe o nome do plano"
                      className="input-convenio"
                    />
                  </Field>

                  <Field label="Valor por sessão *">
                    <input
                      required
                      inputMode="decimal"
                      placeholder="0,00"
                      value={form.valorSessao}
                      onChange={(e) =>
                        setForm({ ...form, valorSessao: e.target.value })
                      }
                      className="input-convenio"
                    />
                  </Field>

                  <Field label="Sessões autorizadas *">
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.sessoesAutorizadas}
                      onChange={(e) =>
                        setForm({ ...form, sessoesAutorizadas: e.target.value })
                      }
                      className="input-convenio"
                    />
                  </Field>

                  <Field label="Sessões já utilizadas">
                    <div className="input-convenio bg-slate-50 text-slate-500">
                      0 — calculado automaticamente pelo sistema
                    </div>
                  </Field>
                  <Field label="Guia / Senha / Autorização">
                    <input value={form.autorizacao} onChange={(e) => setForm({...form, autorizacao:e.target.value})} className="input-convenio" />
                  </Field>
                  <Field label="Início da autorização">
                    <input type="date" value={form.inicioAutorizacao} onChange={(e) => setForm({...form, inicioAutorizacao:e.target.value})} className="input-convenio" />
                  </Field>
                  <Field label="Validade da autorização">
                    <input type="date" value={form.validadeAutorizacao} onChange={(e) => setForm({...form, validadeAutorizacao:e.target.value})} className="input-convenio" />
                  </Field>
                  <Field label="Situação">
                    <select value={form.status} onChange={(e) => setForm({...form, status:e.target.value as ConvenioPlanoStatus})} className="input-convenio">
                      <option>Ativo</option>
                      <option>Inativo</option>
                    </select>
                  </Field>
                </div>

                <Field label="Observações">
                  <textarea rows={4} value={form.observacoes} onChange={(e) => setForm({...form, observacoes:e.target.value})} className="input-convenio resize-none" />
                </Field>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
                    Cancelar
                  </button>
                  <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                    Salvar autorização
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .input-convenio {
            width: 100%;
            border: 1px solid rgb(226 232 240);
            border-radius: .5rem;
            padding: .625rem .75rem;
            font-size: .875rem;
            outline: none;
            color: rgb(30 41 59);
            background: white;
          }
          .input-convenio:focus { border-color: rgb(148 163 184); }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}