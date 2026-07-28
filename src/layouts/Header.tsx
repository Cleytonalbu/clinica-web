import {
  Bell,
  ChevronDown,
  Mail,
  Search,
} from "lucide-react";

export function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bom dia 👋
        </h1>

        <p className="text-sm text-slate-500">
          Bem-vindo ao sistema Entre Afetos.
        </p>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-5">
        {/* Pesquisa */}
        <div className="flex h-11 w-80 items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Pesquisar..."
            className="ml-3 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Mensagens */}
        <button className="relative rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200">
          <Mail
            size={20}
            className="text-slate-600"
          />

          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        {/* Notificações */}
        <button className="relative rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200">
          <Bell
            size={20}
            className="text-slate-600"
          />

          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        {/* Usuário */}
        <button className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
            LC
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">
              Luiz Cardoso
            </p>

            <p className="text-xs text-slate-500">
              Gestor
            </p>
          </div>

          <ChevronDown
            size={18}
            className="text-slate-500"
          />
        </button>
      </div>
    </header>
  );
}
