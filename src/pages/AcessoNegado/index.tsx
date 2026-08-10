import {
  ArrowLeft,
  ShieldX,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export default function AcessoNegado() {
  const navigate =
    useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldX
            size={30}
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Acesso não permitido
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Seu perfil não possui permissão para acessar esta área do sistema.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/"
            )
          }
          className="mx-auto mt-7 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft
            size={17}
          />

          Voltar ao início
        </button>
      </div>
    </div>
  );
}