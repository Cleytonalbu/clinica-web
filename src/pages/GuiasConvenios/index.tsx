import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CircleCheckBig,
  CircleDollarSign,
  FileWarning,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  createGuiaConvenio,
  getGuiasConvenios,
  updateGuiaConvenio,
  type GuiaConvenio,
  type GuiaConvenioStatus,
} from "./guideBillingStorage";

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

export default function GuiasConvenios() {
  const [items, setItems] = useState<GuiaConvenio[]>([]);
  const [search, setSearch] = useState("");
  const [competencia, setCompetencia] = useState(currentMonth());
  const [status, setStatus] = useState<"Todos" | GuiaConvenioStatus>("Todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => setItems(getGuiasConvenios());

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("guias-convenios-changed", refresh);
    return () => window.removeEventListener("guias-convenios-changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCompetencia = !competencia || item.competencia === competencia;
      const matchesStatus = status === "Todos" || item.status === status;
      const matchesSearch =
        !q ||
        item.convenio.toLowerCase().includes(q) ||
        item.plano.toLowerCase().includes(q) ||
        item.paciente.toLowerCase().includes(q) ||
        item.numeroGuia.toLowerCase().includes(q);
      return matchesCompetencia && matchesStatus && matchesSearch;
    });
  }, [items, search, competencia, status]);

  const summary = useMemo(() => {
    const base = items.filter(
      (item) => !competencia || item.competencia === competencia
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
  }, [items, competencia]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Guias e faturamento de convênios
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Controle de envio, aprovação, glosas e pagamentos dos convênios.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={18} />
            Nova guia
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card icon={CircleDollarSign} label="Faturado" value={money(summary.faturado)} />
          <Card icon={Send} label="Enviado" value={money(summary.enviado)} />
          <Card icon={FileWarning} label="Glosado" value={money(summary.glosado)} />
          <Card icon={Banknote} label="Pago" value={money(summary.pago)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px]">
            <label className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por convênio, plano, paciente ou guia"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm"
              />
            </label>
            <input
              type="month"
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>Todos</option>
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Paciente", "Convênio / Plano", "Guia", "Atendimento", "Sessões", "Valor", "Situação", "Ação"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.paciente}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-900">{item.convenio}</div>
                      <div className="text-xs text-slate-500">{item.plano || "—"}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.numeroGuia || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{formatDate(item.dataAtendimento)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.quantidadeSessoes}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{money(item.valorTotal)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badge(item.status)}`}>{item.status}</span>
                      {item.status === "Glosado" && item.motivoGlosa && (
                        <div className="mt-1 max-w-[220px] text-xs text-red-600">{item.motivoGlosa}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.status === "Pendente de envio" && (
                          <button onClick={() => enviar(item)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">Enviar</button>
                        )}
                        {item.status === "Enviado" && (
                          <>
                            <button onClick={() => aprovar(item)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Aprovar</button>
                            <button onClick={() => glosar(item)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600">Glosar</button>
                          </>
                        )}
                        {item.status === "Aprovado" && (
                          <button onClick={() => pagar(item)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">Marcar pago</button>
                        )}
                        {item.status === "Glosado" && (
                          <button onClick={() => updateGuiaConvenio(item.id, { status: "Pendente de envio", motivoGlosa: "" })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">Reenviar</button>
                        )}
                        {item.status === "Pago" && <CircleCheckBig size={20} className="text-emerald-600" />}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">Nenhuma guia encontrada.</td></tr>
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
                  <h2 className="text-lg font-semibold text-slate-900">Nova guia</h2>
                  <p className="text-sm text-slate-500">Registre o atendimento que será faturado ao convênio.</p>
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