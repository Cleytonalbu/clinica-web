import { Mail, Lock, Eye, Shield } from "lucide-react";

import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export function LoginForm() {
  return (
    <div className="w-full max-w-xl space-y-6">
      <Card>
        <h2 className="text-5xl font-bold text-[#1A2468]">
          Bem-vindo de volta!
        </h2>

        <p className="mt-4 text-lg text-slate-500">
          Acesse sua conta para continuar
        </p>

        <div className="mt-10 space-y-6">
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-13 text-slate-400"
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
            />
          </div>

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-4 top-13 text-slate-400"
            />

            <Eye
              size={20}
              className="absolute right-4 top-13 cursor-pointer text-slate-400"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
            />
          </div>

          <div className="flex items-center justify-between">
            <Checkbox label="Lembrar-me" />

            <button
              type="button"
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button>
            Entrar
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200"></div>

            <span className="text-slate-400">
              ou
            </span>

            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <button
            type="button"
            className="
              flex
              h-14
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-slate-300
              bg-white
              font-medium
              transition
              hover:bg-slate-50
            "
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />

            Entrar com Google
          </button>
        </div>
      </Card>

      <div className="flex items-center gap-4 rounded-2xl bg-violet-50 p-6">
        <Shield
          size={24}
          className="text-violet-600"
        />

        <div>
          <h4 className="font-semibold text-[#1A2468]">
            Ambiente seguro
          </h4>

          <p className="text-sm text-slate-500">
            Acesso restrito para profissionais e gestores.
          </p>
        </div>
      </div>
    </div>
  );
}