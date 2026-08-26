import { Building2, Mail, Phone, Plus, Search, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUnit } from "@/providers/UnitContext";
import { Button, Input, Select } from "@/components/ui";
import {
  getSuppliers,
  saveSupplier,
  updateSupplierStatus,
  type Supplier,
  type SupplierStatus,
} from "./supplierStorage";

const categories = [
  "Material",
  "Manutenção",
  "Serviços",
  "Tecnologia",
  "Limpeza",
  "Alimentação",
  "Contabilidade",
  "Jurídico",
  "Outros",
];

const emptyForm = {
  name: "",
  document: "",
  contactName: "",
  phone: "",
  email: "",
  category: "Outros",
  status: "Ativo" as SupplierStatus,
};

export default function Fornecedores() {
  const { activeUnitId } = useUnit();

  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    getSuppliers().filter((supplier) => supplier.unitId === activeUnitId)
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [category, setCategory] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setSuppliers(
      getSuppliers().filter((supplier) => supplier.unitId === activeUnitId)
    );
  }, [activeUnitId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesSearch =
        !term ||
        supplier.name.toLowerCase().includes(term) ||
        supplier.document.toLowerCase().includes(term) ||
        supplier.contactName.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term);
      const matchesStatus = status === "Todos" || supplier.status === status;
      const matchesCategory = category === "Todas" || supplier.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [suppliers, search, status, category]);

  const activeCount = suppliers.filter((item) => item.status === "Ativo").length;
  const inactiveCount = suppliers.filter((item) => item.status === "Inativo").length;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    saveSupplier({
      ...form,
      unitId: activeUnitId,
      name: form.name.trim(),
      document: form.document.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
    setSuppliers(
      getSuppliers().filter((supplier) => supplier.unitId === activeUnitId)
    );
    setForm(emptyForm);
    setModalOpen(false);
  }

  function toggleStatus(supplier: Supplier) {
    const next: SupplierStatus = supplier.status === "Ativo" ? "Inativo" : "Ativo";
    setSuppliers(
      updateSupplierStatus(supplier.id, next).filter(
        (item) => item.unitId === activeUnitId
      )
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#6d5dfc]">Administrativo</p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#102a78]">Fornecedores</h1>
            <p className="mt-1 text-sm text-slate-500">Cadastro e acompanhamento dos fornecedores da clínica.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus size={18} /> Novo fornecedor
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Fornecedores cadastrados" value={suppliers.length} icon={<Building2 size={21} />} />
          <SummaryCard label="Fornecedores ativos" value={activeCount} icon={<UserRound size={21} />} />
          <SummaryCard label="Fornecedores inativos" value={inactiveCount} icon={<X size={21} />} />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, documento, contato ou e-mail..." className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Todos</option><option>Ativo</option><option>Inativo</option>
            </Select>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f7f7fc] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Fornecedor</th><th className="px-5 py-4">Documento</th><th className="px-5 py-4">Contato</th><th className="px-5 py-4">Categoria</th><th className="px-5 py-4">Situação</th><th className="px-5 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-bold text-[#102a78]">{supplier.name}</p><div className="mt-1 flex gap-3 text-xs text-slate-500">{supplier.email && <span className="flex items-center gap-1"><Mail size={13}/>{supplier.email}</span>}{supplier.phone && <span className="flex items-center gap-1"><Phone size={13}/>{supplier.phone}</span>}</div></td>
                    <td className="px-5 py-4 text-slate-600">{supplier.document || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{supplier.contactName || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{supplier.category}</td>
                    <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${supplier.status === "Ativo" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{supplier.status}</span></td>
                    <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => toggleStatus(supplier)}>{supplier.status === "Ativo" ? "Inativar" : "Ativar"}</Button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Nenhum fornecedor encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold text-[#102a78]">Novo fornecedor</h2><p className="mt-1 text-sm text-slate-500">Cadastre os dados administrativos do fornecedor.</p></div><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Nome / Razão social" required><Input value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/></Field>
              <Field label="CNPJ / CPF"><Input value={form.document} onChange={(e) => setForm({...form, document:e.target.value})}/></Field>
              <Field label="Pessoa de contato"><Input value={form.contactName} onChange={(e) => setForm({...form, contactName:e.target.value})}/></Field>
              <Field label="Telefone"><Input value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})}/></Field>
              <Field label="E-mail"><Input type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}/></Field>
              <Field label="Categoria"><Select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>{categories.map((item)=><option key={item}>{item}</option>)}</Select></Field>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit">Salvar fornecedor</Button></div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({label, required, children}:{label:string; required?:boolean; children:React.ReactNode}) {
  return <label className="space-y-2"><span className="text-sm font-bold text-slate-700">{label}{required && " *"}</span>{children}</label>;
}

function SummaryCard({label,value,icon}:{label:string;value:number;icon:React.ReactNode}) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold text-[#102a78]">{value}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2efff] text-[#6d5dfc]">{icon}</div></div></div>;
}