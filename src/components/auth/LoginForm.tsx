import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/loginSchema";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    console.log(data);

    // Aqui entraremos com a API futuramente
  }

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-5xl font-bold text-[#172B6A]">
        Bem-vindo de volta!
      </h1>

      <p className="mt-3 text-lg text-slate-500">
        Acesse sua conta para continuar
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 space-y-6"
      >
        <div>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            leftIcon={<Mail size={20} />}
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-2 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 transition hover:text-violet-600"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            }
            {...register("password")}
          />

          {errors.password && (
            <p className="mt-2 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-violet-600"
            />

            Lembrar-me
          </label>

          <button
            type="button"
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Esqueci minha senha
          </button>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <p className="pt-4 text-center text-sm text-slate-500">
          Desenvolvido por{" "}
          <span className="font-semibold text-[#172B6A]">
            AC SOFTWARE
          </span>
        </p>
      </form>

      <div className="mt-8 flex items-center gap-4 rounded-2xl bg-violet-50 p-5">
        <ShieldCheck
          size={24}
          className="text-violet-600"
        />

        <div>
          <h3 className="font-semibold text-[#172B6A]">
            Acesso restrito para profissionais e gestores.
          </h3>

          <p className="text-sm text-slate-500">
            Ambiente seguro e confidencial.
          </p>
        </div>
      </div>
    </div>
  );
}
