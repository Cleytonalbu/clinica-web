import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarClock, CalendarDays, CalendarRange, DollarSign, Filter, Plus, Search, X } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUnit } from "@/providers/UnitContext";
import { getAdministrativeCollaborators } from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";
import type { AdministrativeCollaborator } from "@/pages/ColaboradoresAdministrativos/collaboratorStorage";
import { createAdministrativePayment, getAdministrativePayments, updateAdministrativePayment } from "@/pages/PagamentosAdministrativos/administrativePaymentStorage";
import type { AdministrativePayment } from "@/pages/PagamentosAdministrativos/administrativePaymentStorage";
import { getFinancialExpenses, saveFinancialExpense, updateFinancialExpense } from "@/pages/Financeiro/expenseStorage";
import { cancelAdministrativeLeave, createAdministrativeLeave, getAdministrativeLeaves, updateAdministrativeLeave } from "./administrativeLeaveStorage";
import type { AdministrativeLeave, AdministrativeLeaveStatus, AdministrativeLeaveType } from "./administrativeLeaveStorage";

const leaveTypes: AdministrativeLeaveType[] = ["Férias", "Atestado", "Licença", "Folga", "Afastamento", "Outro"];
const absenceTypes = leaveTypes.filter((item) => item !== "Férias");
const emptyForm = { collaboratorId: "", type: "Férias" as AdministrativeLeaveType, startDate: "", endDate: "", reason: "", notes: "", vacationAmount: "", vacationCompetence: "", vacationDueDate: "" };
const emptyFilters = { search: "", role: "Todos", type: "Todos", status: "Todos", year: "Todos", month: "Todos", startDate: "", endDate: "", documentation: "Todos", paymentStatus: "Todos", paymentLink: "Todos", expenseLink: "Todos", minAmount: "", maxAmount: "" };

type Tab = "ferias" | "afastamentos";
function dateOnly(value: string) { return new Date(`${value}T12:00:00`); }
function formatDate(value?: string) { return value ? dateOnly(value).toLocaleDateString("pt-BR") : "—"; }
function money(value?: number) { return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function parseMoney(value: string) { return Number(value.replace(/\./g, "").replace(",", ".")); }
function calculateStatus(leave: AdministrativeLeave): AdministrativeLeaveStatus {
  if (leave.status === "Cancelado") return "Cancelado";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = dateOnly(leave.startDate); const end = dateOnly(leave.endDate);
  if (today.getTime() < start.getTime()) return "Programado";
  if (today.getTime() <= end.getTime()) return "Em andamento";
  return "Concluído";
}
function statusClass(status: AdministrativeLeaveStatus) {
  if (status === "Em andamento") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "Programado") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Concluído") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-500";
}
function paymentClass(status?: string) {
  if (status === "Pago") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Cancelado") return "border-slate-200 bg-slate-100 text-slate-500";
  return "border-amber-200 bg-amber-50 text-amber-700";
}
function daysUntil(value: string) { const today = new Date(); today.setHours(0,0,0,0); return Math.ceil((dateOnly(value).getTime() - today.getTime()) / 86400000); }
function durationDays(start: string, end: string) { return Math.max(Math.floor((dateOnly(end).getTime() - dateOnly(start).getTime()) / 86400000) + 1, 1); }

export default function FeriasEAfastamentos() {
  const { activeUnitId } = useUnit();
  const [tab, setTab] = useState<Tab>("ferias");
  const [leaves, setLeaves] = useState<AdministrativeLeave[]>([]);
  const [payments, setPayments] = useState<AdministrativePayment[]>([]);
  const [collaborators, setCollaborators] = useState<AdministrativeCollaborator[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLeaves(getAdministrativeLeaves().filter((leave) => leave.unitId === activeUnitId));
    setPayments(getAdministrativePayments().filter((payment) => payment.unitId === activeUnitId));
    setCollaborators(getAdministrativeCollaborators().filter((item) => item.status === "Ativo" && item.unitId === activeUnitId));
  }
  useEffect(() => {
    load();
    const refresh = () => load();
    ["administrative-leaves-changed", "administrative-collaborators-changed", "administrative-payments-changed"].forEach((name) => window.addEventListener(name, refresh));
    return () => ["administrative-leaves-changed", "administrative-collaborators-changed", "administrative-payments-changed"].forEach((name) => window.removeEventListener(name, refresh));
  }, [activeUnitId]);

  const paymentByLeave = useMemo(() => {
    const map = new Map<string, AdministrativePayment>();
    payments.forEach((payment) => { if (payment.sourceLeaveId) map.set(payment.sourceLeaveId, payment); });
    leaves.forEach((leave) => { if (leave.administrativePaymentId) { const p = payments.find((item) => item.id === leave.administrativePaymentId); if (p) map.set(leave.id, p); } });
    return map;
  }, [payments, leaves]);

  const roles = useMemo(() => Array.from(new Set(leaves.map((item) => item.collaboratorRole).filter(Boolean))).sort(), [leaves]);
  const years = useMemo(() => Array.from(new Set(leaves.flatMap((item) => [item.startDate.slice(0,4), item.endDate.slice(0,4)]).filter(Boolean))).sort().reverse(), [leaves]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return leaves.filter((leave) => {
      if (tab === "ferias" ? leave.type !== "Férias" : leave.type === "Férias") return false;
      const currentStatus = calculateStatus(leave);
      const payment = paymentByLeave.get(leave.id);
      const amount = leave.vacationAmount ?? payment?.amount ?? 0;
      const start = dateOnly(leave.startDate).getTime(); const end = dateOnly(leave.endDate).getTime();
      const matchesSearch = !term || [leave.collaboratorName, leave.collaboratorRole, leave.type, leave.reason, leave.notes].some((v) => v?.toLowerCase().includes(term));
      const matchesRole = filters.role === "Todos" || leave.collaboratorRole === filters.role;
      const matchesType = tab === "ferias" || filters.type === "Todos" || leave.type === filters.type;
      const matchesStatus = filters.status === "Todos" || currentStatus === filters.status;
      const matchesYear = filters.year === "Todos" || leave.startDate.startsWith(filters.year) || leave.endDate.startsWith(filters.year);
      const matchesMonth = filters.month === "Todos" || leave.startDate.slice(5,7) === filters.month || leave.endDate.slice(5,7) === filters.month;
      const matchesStart = !filters.startDate || end >= dateOnly(filters.startDate).getTime();
      const matchesEnd = !filters.endDate || start <= dateOnly(filters.endDate).getTime();
      const hasDocumentation = Boolean(leave.reason?.trim() || leave.notes?.trim());
      const matchesDocumentation = filters.documentation === "Todos" || (filters.documentation === "Com informação" ? hasDocumentation : !hasDocumentation);
      const matchesPayment = tab !== "ferias" || filters.paymentStatus === "Todos" || (filters.paymentStatus === "Sem pagamento" ? !payment : payment?.status === filters.paymentStatus);
      const matchesPaymentLink = tab !== "ferias" || filters.paymentLink === "Todos" || (filters.paymentLink === "Gerado" ? Boolean(payment || leave.administrativePaymentId) : !payment && !leave.administrativePaymentId);
      const matchesExpenseLink = tab !== "ferias" || filters.expenseLink === "Todos" || (filters.expenseLink === "Vinculada" ? Boolean(leave.financialExpenseId || payment?.financialExpenseId) : !leave.financialExpenseId && !payment?.financialExpenseId);
      const min = parseMoney(filters.minAmount); const max = parseMoney(filters.maxAmount);
      const matchesMin = tab !== "ferias" || !filters.minAmount || amount >= min;
      const matchesMax = tab !== "ferias" || !filters.maxAmount || amount <= max;
      return matchesSearch && matchesRole && matchesType && matchesStatus && matchesYear && matchesMonth && matchesStart && matchesEnd && matchesDocumentation && matchesPayment && matchesPaymentLink && matchesExpenseLink && matchesMin && matchesMax;
    });
  }, [leaves, tab, filters, paymentByLeave]);

  const summary = useMemo(() => {
    const vacation = leaves.filter((l) => l.type === "Férias" && calculateStatus(l) !== "Cancelado");
    const absence = leaves.filter((l) => l.type !== "Férias" && calculateStatus(l) !== "Cancelado");
    const pendingVacation = vacation.filter((l) => paymentByLeave.get(l.id)?.status === "Pendente");
    return {
      vacationScheduled: vacation.filter((l) => calculateStatus(l) === "Programado").length,
      vacationActive: vacation.filter((l) => calculateStatus(l) === "Em andamento").length,
      vacationPending: pendingVacation.length,
      vacationPendingValue: pendingVacation.reduce((sum,l) => sum + (paymentByLeave.get(l.id)?.amount ?? l.vacationAmount ?? 0), 0),
      absenceActive: absence.filter((l) => calculateStatus(l) === "Em andamento").length,
      absenceScheduled: absence.filter((l) => calculateStatus(l) === "Programado").length,
      returningSoon: absence.filter((l) => calculateStatus(l) === "Em andamento" && daysUntil(l.endDate) >= 0 && daysUntil(l.endDate) <= 7).length,
      certificates: absence.filter((l) => l.type === "Atestado").length,
    };
  }, [leaves, paymentByLeave]);

  function openNew() {
    setEditingLeaveId(null);
    setForm({ ...emptyForm, type: tab === "ferias" ? "Férias" : "Atestado" });
    setShowForm(true);
  }

  function openEdit(leave: AdministrativeLeave) {
    const payment = paymentByLeave.get(leave.id);

    // Férias já pagas ficam bloqueadas para edição.
    if (leave.type === "Férias" && payment?.status === "Pago") {
      window.alert("Estas férias já foram pagas e não podem mais ser editadas.");
      return;
    }

    setEditingLeaveId(leave.id);
    setForm({
      collaboratorId: leave.collaboratorId,
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason || "",
      notes: leave.notes || "",
      vacationAmount: leave.type === "Férias"
        ? String(leave.vacationAmount ?? payment?.amount ?? "").replace(".", ",")
        : "",
      vacationCompetence: leave.vacationCompetence || payment?.competence || "",
      vacationDueDate: leave.vacationDueDate || payment?.dueDate || "",
    });
    setShowForm(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const collaborator = collaborators.find((item) => item.id === form.collaboratorId);
    if (!collaborator) return window.alert("Selecione um colaborador ativo.");
    if (!form.startDate || !form.endDate) return window.alert("Informe a data inicial e a data final.");
    if (dateOnly(form.endDate).getTime() < dateOnly(form.startDate).getTime()) return window.alert("A data final não pode ser anterior à data inicial.");
    const isVacation = form.type === "Férias";
    const amount = parseMoney(form.vacationAmount);
    if (isVacation && (!Number.isFinite(amount) || amount <= 0)) return window.alert("Informe o valor das férias.");
    if (isVacation && (!form.vacationCompetence || !form.vacationDueDate)) return window.alert("Informe a competência e a data prevista de pagamento das férias.");

    if (editingLeaveId) {
      const currentLeave = leaves.find((item) => item.id === editingLeaveId);
      if (!currentLeave) return window.alert("Registro não encontrado.");

      const linkedPayment = paymentByLeave.get(editingLeaveId);

      if (currentLeave.type === "Férias" && linkedPayment?.status === "Pago") {
        window.alert("Estas férias já foram pagas e não podem mais ser editadas.");
        setShowForm(false);
        setEditingLeaveId(null);
        return;
      }

      updateAdministrativeLeave(editingLeaveId, {
        collaboratorId: collaborator.id,
        collaboratorName: collaborator.name,
        collaboratorRole: collaborator.role,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        notes: form.notes.trim(),
        vacationAmount: isVacation ? amount : undefined,
        vacationCompetence: isVacation ? form.vacationCompetence : undefined,
        vacationDueDate: isVacation ? form.vacationDueDate : undefined,
      });

      if (isVacation && linkedPayment) {
        updateAdministrativePayment(linkedPayment.id, {
          collaboratorId: collaborator.id,
          collaboratorName: collaborator.name,
          collaboratorRole: collaborator.role,
          competence: form.vacationCompetence,
          description: `Férias - ${collaborator.name}`,
          amount,
          dueDate: form.vacationDueDate,
          notes: `Atualizado pelo registro de férias (${formatDate(form.startDate)} a ${formatDate(form.endDate)}).`,
        });

        const expenseId = currentLeave.financialExpenseId || linkedPayment.financialExpenseId;
        if (expenseId) {
          updateFinancialExpense(expenseId, {
            description: `Férias - ${collaborator.name}`,
            supplier: collaborator.name,
            competenceDate: form.vacationCompetence,
            dueDate: form.vacationDueDate,
            amount,
            originalAmount: amount,
            observation: `Despesa vinculada às férias de ${formatDate(form.startDate)} a ${formatDate(form.endDate)}.`,
          });
        }
      }

      setForm({ ...emptyForm, type: tab === "ferias" ? "Férias" : "Atestado" });
      setEditingLeaveId(null);
      setShowForm(false);
      load();
      return;
    }

    const leave = createAdministrativeLeave({
      unitId: activeUnitId, collaboratorId: collaborator.id, collaboratorName: collaborator.name, collaboratorRole: collaborator.role,
      type: form.type, startDate: form.startDate, endDate: form.endDate, reason: form.reason.trim(), notes: form.notes.trim(), status: "Programado",
      vacationAmount: isVacation ? amount : undefined, vacationCompetence: isVacation ? form.vacationCompetence : undefined, vacationDueDate: isVacation ? form.vacationDueDate : undefined,
    });

    if (isVacation) {
      const payment = createAdministrativePayment({
        unitId: activeUnitId, collaboratorId: collaborator.id, collaboratorName: collaborator.name, collaboratorRole: collaborator.role,
        competence: form.vacationCompetence, type: "Férias", description: `Férias - ${collaborator.name}`, amount, dueDate: form.vacationDueDate,
        status: "Pendente", notes: `Gerado automaticamente pelo registro de férias (${formatDate(form.startDate)} a ${formatDate(form.endDate)}).`, sourceLeaveId: leave.id,
      });
      const currentExpenses = getFinancialExpenses();
      const expenseId = Math.max(0, ...currentExpenses.map((item) => Number(item.id) || 0), Date.now()) + 1;
      saveFinancialExpense({
        id: expenseId, unitId: activeUnitId, description: `Férias - ${collaborator.name}`, category: "Funcionários", supplier: collaborator.name,
        competenceDate: form.vacationCompetence, dueDate: form.vacationDueDate, amount, originalAmount: amount, discount: 0, surcharge: 0, status: "Pendente",
        observation: `Despesa gerada automaticamente pelo registro de férias de ${formatDate(form.startDate)} a ${formatDate(form.endDate)}.`,
        sourceAdministrativePaymentId: payment.id, sourceLeaveId: leave.id, createdAt: new Date().toISOString(),
      });
      // Acrescenta somente os vínculos; os três registros continuam nas suas bases existentes.
      updateAdministrativeLeave(leave.id, { administrativePaymentId: payment.id, financialExpenseId: expenseId });
      const storedPayments = getAdministrativePayments();
      const linked = storedPayments.map((item) => item.id === payment.id ? { ...item, financialExpenseId: expenseId, updatedAt: new Date().toISOString() } : item);
      window.localStorage.setItem("entreafetos_administrative_payments", JSON.stringify(linked));
      window.dispatchEvent(new Event("administrative-payments-changed"));
    }
    setForm({ ...emptyForm, type: tab === "ferias" ? "Férias" : "Atestado" }); setEditingLeaveId(null); setShowForm(false); load();
  }

  return <DashboardLayout><div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold text-slate-900">Férias e afastamentos</h1><p className="mt-1 text-sm text-slate-500">Controle administrativo separado de férias e demais afastamentos dos colaboradores.</p></div><button type="button" onClick={openNew} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><Plus size={18}/>{tab === "ferias" ? "Novas férias" : "Novo afastamento"}</button></div>

    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1"><TabButton active={tab === "ferias"} onClick={() => { setTab("ferias"); setFilters(emptyFilters); }}>Férias</TabButton><TabButton active={tab === "afastamentos"} onClick={() => { setTab("afastamentos"); setFilters(emptyFilters); }}>Afastamentos</TabButton></div>

    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={filters.search} onChange={(e)=>setFilters({...filters,search:e.target.value})} placeholder="Buscar por colaborador, função, motivo ou observação" className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"/></label><button type="button" onClick={()=>setShowAdvanced(!showAdvanced)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Filter size={17}/>Filtros avançados</button><button type="button" onClick={()=>setFilters(emptyFilters)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Limpar filtros</button></div>
      {showAdvanced && <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <FilterSelect label="Função" value={filters.role} onChange={(v)=>setFilters({...filters,role:v})} options={["Todos",...roles]}/>
        {tab === "afastamentos" && <FilterSelect label="Tipo" value={filters.type} onChange={(v)=>setFilters({...filters,type:v})} options={["Todos",...absenceTypes]}/>} 
        <FilterSelect label="Situação" value={filters.status} onChange={(v)=>setFilters({...filters,status:v})} options={["Todos","Programado","Em andamento","Concluído","Cancelado"]}/>
        <FilterSelect label="Ano" value={filters.year} onChange={(v)=>setFilters({...filters,year:v})} options={["Todos",...years]}/>
        <FilterSelect label="Mês" value={filters.month} onChange={(v)=>setFilters({...filters,month:v})} options={["Todos","01","02","03","04","05","06","07","08","09","10","11","12"]}/>
        <FilterInput label="Período inicial" type="date" value={filters.startDate} onChange={(v)=>setFilters({...filters,startDate:v})}/><FilterInput label="Período final" type="date" value={filters.endDate} onChange={(v)=>setFilters({...filters,endDate:v})}/>
        <FilterSelect label="Informações" value={filters.documentation} onChange={(v)=>setFilters({...filters,documentation:v})} options={["Todos","Com informação","Sem informação"]}/>
        {tab === "ferias" && <><FilterSelect label="Status pagamento" value={filters.paymentStatus} onChange={(v)=>setFilters({...filters,paymentStatus:v})} options={["Todos","Pendente","Pago","Cancelado","Sem pagamento"]}/><FilterSelect label="Pagamento gerado" value={filters.paymentLink} onChange={(v)=>setFilters({...filters,paymentLink:v})} options={["Todos","Gerado","Não gerado"]}/><FilterSelect label="Despesa" value={filters.expenseLink} onChange={(v)=>setFilters({...filters,expenseLink:v})} options={["Todos","Vinculada","Não vinculada"]}/><FilterInput label="Valor mínimo" value={filters.minAmount} onChange={(v)=>setFilters({...filters,minAmount:v})} placeholder="R$ 0,00"/><FilterInput label="Valor máximo" value={filters.maxAmount} onChange={(v)=>setFilters({...filters,maxAmount:v})} placeholder="R$ 0,00"/></>}
      </div>}
      <div className="text-xs text-slate-500">{filtered.length} registro(s) encontrado(s)</div>
    </div>

    {tab === "ferias" ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Férias programadas" value={summary.vacationScheduled} icon={CalendarDays}/><SummaryCard label="Em férias agora" value={summary.vacationActive} icon={CalendarRange}/><SummaryCard label="Pagamentos pendentes" value={summary.vacationPending} icon={CalendarClock}/><SummaryMoneyCard label="Total pendente" value={summary.vacationPendingValue}/></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Afastados agora" value={summary.absenceActive} icon={CalendarClock}/><SummaryCard label="Programados" value={summary.absenceScheduled} icon={CalendarDays}/><SummaryCard label="Retorno em até 7 dias" value={summary.returningSoon} icon={CalendarCheck2}/><SummaryCard label="Atestados" value={summary.certificates} icon={CalendarRange}/></div>}

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{(tab === "ferias" ? ["Colaborador","Período","Dias","Motivo","Situação","Valor","Competência","Vencimento","Pagamento","Ação"] : ["Colaborador","Tipo","Período","Dias","Motivo","Situação","Ação"]).map((h)=><th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
      {filtered.map((leave)=>{ const currentStatus=calculateStatus(leave); const payment=paymentByLeave.get(leave.id); const amount=leave.vacationAmount ?? payment?.amount; return <tr key={leave.id} className="hover:bg-slate-50"><td className="px-4 py-4"><div className="font-medium text-slate-900">{leave.collaboratorName}</div><div className="text-xs text-slate-500">{leave.collaboratorRole}</div></td>{tab === "afastamentos" && <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{leave.type}</td>}<td className="whitespace-nowrap px-4 py-4"><div className="text-sm text-slate-700">{formatDate(leave.startDate)}</div><div className="text-xs text-slate-500">até {formatDate(leave.endDate)}</div></td><td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{durationDays(leave.startDate,leave.endDate)}</td><td className="px-4 py-4"><div className="max-w-[240px] text-sm text-slate-700">{leave.reason || "—"}</div></td><td className="whitespace-nowrap px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(currentStatus)}`}>{currentStatus}</span></td>{tab === "ferias" && <><td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-800">{amount ? money(amount) : "—"}</td><td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{leave.vacationCompetence || payment?.competence || "—"}</td><td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{formatDate(leave.vacationDueDate || payment?.dueDate)}</td><td className="whitespace-nowrap px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentClass(payment?.status)}`}>{payment?.status || "Não gerado"}</span></td></>}<td className="whitespace-nowrap px-4 py-4"><div className="flex items-center gap-2">{tab === "ferias" && payment?.status !== "Pago" && <button type="button" onClick={()=>openEdit(leave)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Editar</button>}{currentStatus === "Programado" ? <button type="button" onClick={()=>window.confirm("Deseja cancelar este registro?") && cancelAdministrativeLeave(leave.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancelar</button> : (tab !== "ferias" || payment?.status === "Pago") && <span className="text-xs text-slate-400">—</span>}</div></td></tr>})}
      {filtered.length===0 && <tr><td colSpan={tab === "ferias" ? 10 : 7} className="px-4 py-12 text-center text-sm text-slate-500">Nenhum registro encontrado.</td></tr>}
    </tbody></table></div></div>

    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-lg font-semibold text-slate-900">{editingLeaveId ? (tab === "ferias" ? "Editar férias" : "Editar afastamento") : (tab === "ferias" ? "Novas férias" : "Novo afastamento")}</h2><p className="text-sm text-slate-500">{editingLeaveId ? (tab === "ferias" ? "Corrija as informações das férias antes do pagamento." : "Corrija as informações do afastamento.") : (tab === "ferias" ? "Registre o período e as informações de pagamento das férias." : "Registre atestado, licença, folga ou outro afastamento.")}</p></div><button type="button" onClick={()=>{ setShowForm(false); setEditingLeaveId(null); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></div><form onSubmit={submit} className="space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2"><Field label="Colaborador *"><select required value={form.collaboratorId} onChange={(e)=>setForm({...form,collaboratorId:e.target.value})} className="input-leave"><option value="">Selecione</option>{collaborators.map((c)=><option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}</select></Field>{tab === "afastamentos" && <Field label="Tipo *"><select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as AdministrativeLeaveType})} className="input-leave">{absenceTypes.map((item)=><option key={item}>{item}</option>)}</select></Field>}<Field label="Data inicial *"><input required type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} className="input-leave"/></Field><Field label="Data final *"><input required type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} className="input-leave"/></Field></div>
      {tab === "ferias" && <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4"><div className="mb-4"><h3 className="text-sm font-semibold text-slate-900">Pagamento das férias</h3><p className="mt-1 text-xs text-slate-500">{editingLeaveId ? "As alterações serão sincronizadas com o pagamento administrativo e a despesa vinculada." : "Ao salvar, o pagamento administrativo e a despesa correspondente serão gerados como pendentes."}</p></div><div className="grid gap-4 md:grid-cols-3"><Field label="Valor das férias *"><input required value={form.vacationAmount} onChange={(e)=>setForm({...form,vacationAmount:e.target.value})} placeholder="0,00" className="input-leave"/></Field><Field label="Competência *"><input required type="month" value={form.vacationCompetence} onChange={(e)=>setForm({...form,vacationCompetence:e.target.value})} className="input-leave"/></Field><Field label="Data prevista de pagamento *"><input required type="date" value={form.vacationDueDate} onChange={(e)=>setForm({...form,vacationDueDate:e.target.value})} className="input-leave"/></Field></div></div>}
      <Field label="Motivo"><input value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})} placeholder={tab === "ferias" ? "Ex.: férias anuais" : "Ex.: atestado médico"} className="input-leave"/></Field><Field label="Observações"><textarea rows={4} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className="input-leave resize-none"/></Field><div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={()=>{ setShowForm(false); setEditingLeaveId(null); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">{editingLeaveId ? "Salvar alterações" : "Salvar registro"}</button></div>
    </form></div></div>}
    <style>{`.input-leave{width:100%;border:1px solid rgb(226 232 240);border-radius:.5rem;padding:.625rem .75rem;font-size:.875rem;outline:none;color:rgb(30 41 59);background:white}.input-leave:focus{border-color:rgb(148 163 184)}`}</style>
  </div></DashboardLayout>;
}

function TabButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}) { return <button type="button" onClick={onClick} className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>{children}</button>; }
function SummaryCard({label,value,icon:Icon}:{label:string;value:number;icon:typeof CalendarDays}) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p></div><div className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon size={22}/></div></div></div>; }
function SummaryMoneyCard({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{money(value)}</p></div><div className="rounded-xl bg-slate-100 p-3 text-slate-600"><DollarSign size={22}/></div></div></div>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>; }
function FilterSelect({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) { return <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">{options.map((o)=><option key={o} value={o}>{o === "01" ? "Janeiro" : o === "02" ? "Fevereiro" : o === "03" ? "Março" : o === "04" ? "Abril" : o === "05" ? "Maio" : o === "06" ? "Junho" : o === "07" ? "Julho" : o === "08" ? "Agosto" : o === "09" ? "Setembro" : o === "10" ? "Outubro" : o === "11" ? "Novembro" : o === "12" ? "Dezembro" : o}</option>)}</select></label>; }
function FilterInput({label,value,onChange,type="text",placeholder}:{label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string}) { return <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span><input type={type} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"/></label>; }
