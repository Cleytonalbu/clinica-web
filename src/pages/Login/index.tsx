import {
  useState,
  type FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/AuthContext";

export default function Login() {
  const {
    login,
    isAuthenticated,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  if (
    isAuthenticated
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (
      !email.trim()
    ) {
      setError(
        "Informe seu e-mail."
      );

      return;
    }

    if (
      !password
    ) {
      setError(
        "Informe sua senha."
      );

      return;
    }

    setLoading(true);

    const result =
      login(
        email,
        password
      );

    setLoading(false);

    if (
      !result.success
    ) {
      setError(
        result.message ??
          "Não foi possível realizar o login."
      );

      return;
    }

    const state =
      location.state as
        | {
            from?: string;
          }
        | null;

    navigate(
      state?.from ??
        "/dashboard",
      {
        replace: true,
      }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        {/* LADO ESQUERDO */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              <span className="text-sm font-semibold">
                Clínica Integrada Entre Afetos
              </span>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-100">
                Sistema de Gestão
              </p>

              <h1 className="mt-5 text-5xl font-bold leading-tight">
                Cuidado integrado,
                gestão simples.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-indigo-100">
                Organize pacientes, atendimentos, profissionais,
                evoluções e toda a rotina administrativa da clínica
                em um único lugar.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="max-w-lg rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-lg font-semibold">
                Entre Afetos
              </p>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Uma plataforma desenvolvida para clínicas
                multiprofissionais.
              </p>
            </div>

            <p className="mt-6 text-xs text-indigo-100">
              Desenvolvido por AC Software
            </p>
          </div>
        </section>

        {/* LOGIN */}

        <section className="flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <div className="lg:hidden">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Entre Afetos
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Clínica Integrada
                </p>
              </div>

              <h2 className="mt-8 text-3xl font-bold text-slate-900 lg:mt-0">
                Bem-vindo
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entre com suas credenciais para acessar o sistema.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* SENHA */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* ERRO */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {
                    error
                  }
                </div>
              )}

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn
                  size={18}
                />

                {loading
                  ? "Entrando..."
                  : "Entrar"}
              </button>
            </form>

            {/* USUÁRIOS DE TESTE */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-700">
                Usuários para teste
              </p>

              <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                <p>
                  <strong className="text-slate-600">
                    Gestor:
                  </strong>{" "}
                  gestor@entreafetos.com.br
                </p>

                <p>
                  <strong className="text-slate-600">
                    Recepção:
                  </strong>{" "}
                  recepcao@entreafetos.com.br
                </p>

                <p>
                  <strong className="text-slate-600">
                    Profissional:
                  </strong>{" "}
                  ana@entreafetos.com.br
                </p>

                <p className="border-t border-slate-200 pt-2">
                  <strong className="text-slate-600">
                    Senha:
                  </strong>{" "}
                  123456
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Entre Afetos • AC Software
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}