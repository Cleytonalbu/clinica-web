import { Mail, Lock, Eye } from "lucide-react";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export function LoginForm() {
  return (
    <div className="w-full max-w-xl">
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
        </div>
      </Card>
    </div>
  );
}