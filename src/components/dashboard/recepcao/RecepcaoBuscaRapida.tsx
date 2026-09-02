import { useState } from "react";

import {
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export function RecepcaoBuscaRapida() {
  const navigate = useNavigate();

  const [termo, setTermo] = useState("");

  function buscar() {
    const params = new URLSearchParams();
    if (termo.trim()) {
      params.set("busca", termo.trim());
    }
    navigate(`/pacientes${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Search
          size={20}
          className="text-teal-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Busca rápida
        </h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Encontre um paciente pelo nome ou responsável.
      </p>

      <div className="relative mt-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") buscar();
          }}
          placeholder="Buscar paciente ou responsável..."
          className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </div>

      <button
        type="button"
        onClick={buscar}
        className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
      >
        Buscar
      </button>

      <button
        type="button"
        onClick={() => navigate("/pacientes")}
        className="mt-4 text-xs font-semibold text-teal-600"
      >
        Ver todos os pacientes
      </button>
    </section>
  );
}
