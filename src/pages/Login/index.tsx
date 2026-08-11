import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import loginBanner from "../../assets/images/login-banner.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível entrar. Verifique seu e-mail e senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ============================= */}
        {/* LADO ESQUERDO - SOMENTE IMAGEM */}
        {/* ============================= */}

        <section className="hidden min-h-screen overflow-hidden bg-white lg:block">
          <img
            src={loginBanner}
            alt="Clínica Integrada Entre Afetos"
            className="h-full w-full object-cover"
          />
        </section>

        {/* ============================= */}
        {/* LADO DIREITO - LOGIN */}
        {/* ============================= */}

        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                Clínica Integrada
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Bem-vindo de volta!
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Entre com seus dados para acessar o sistema.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* E-MAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Digite seu e-mail"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              {/* SENHA */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Senha
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                    aria-label={
                      showPassword
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* ERRO */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Entrando..."
                  : "Entrar"}
              </button>
            </form>

            {/* RODAPÉ */}

            <div className="mt-10 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs text-slate-400">
                Acesso restrito aos usuários autorizados.
              </p>

              <p className="mt-2 text-xs font-semibold text-slate-500">
                AC SOFTWARE
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}