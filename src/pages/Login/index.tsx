import {
  useState,
  type FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import loginBackground from "@/assets/login-presentation-bg-v2.png";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [remember, setRemember] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Informe o e-mail e a senha.",
      );

      return;
    }

    setLoading(true);

    try {
      const result = await login(
        email.trim(),
        password,
      );

      if (!result.success) {
        setError(
          result.message ||
            "E-mail ou senha inválidos.",
        );

        return;
      }

      if (remember) {
        localStorage.setItem(
          "entreafetos_remember_email",
          email.trim(),
        );
      } else {
        localStorage.removeItem(
          "entreafetos_remember_email",
        );
      }

      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f4ff]">
      {/* ========================================= */}
      {/* FUNDO DA TELA */}
      {/* ========================================= */}

      <div className="absolute inset-0">
        <img
          src={loginBackground}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-white/[0.015]" />
      </div>

      {/* ========================================= */}
      {/* CARD FLUTUANTE DE LOGIN */}
      {/* ========================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-end px-5 py-8 sm:px-8 lg:px-12 xl:px-[6vw]">
        <section
          className="
            w-full
            max-w-[480px]
            rounded-[30px]
            border
            border-white/80
            bg-white/88
            px-8
            py-9
            shadow-[0_28px_80px_rgba(79,70,160,0.18)]
            backdrop-blur-xl
            sm:px-10
            sm:py-10
            lg:max-w-[500px]
          "
        >
          {/* ========================================= */}
          {/* CABEÇALHO */}
          {/* ========================================= */}

          <div className="text-center">
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#0f2458] sm:text-[34px]">
              Bem-vindo de volta!{" "}
              <span
                role="img"
                aria-label="olá"
              >
                👋
              </span>
            </h1>

            <p className="mt-2 text-[15px] font-medium text-[#687394]">
              Faça login para continuar
            </p>
          </div>

          {/* ========================================= */}
          {/* FORMULÁRIO */}
          {/* ========================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-9"
          >
            {/* E-MAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-[#17264e]"
              >
                E-mail
              </label>

              <div
                className="
                  flex
                  h-[64px]
                  items-center
                  rounded-xl
                  border
                  border-[#d8dbea]
                  bg-white
                  px-4
                  transition
                  focus-within:border-[#7555f5]
                  focus-within:ring-4
                  focus-within:ring-[#7555f5]/10
                "
              >
                <Mail
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#7883a6]"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="seu@email.com"
                  className="
                    h-full
                    min-w-0
                    flex-1
                    border-0
                    bg-white
                    px-3
                    text-[16px]
                    font-medium
                    text-[#23345f]
                    outline-none
                    placeholder:text-[#8d96b1]
                  "
                />
              </div>
            </div>

            {/* ========================================= */}
            {/* SENHA */}
            {/* ========================================= */}

            <div className="mt-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-[#17264e]"
              >
                Senha
              </label>

              <div
                className="
                  flex
                  h-[64px]
                  items-center
                  rounded-xl
                  border
                  border-[#d8dbea]
                  bg-white
                  px-4
                  transition
                  focus-within:border-[#7555f5]
                  focus-within:ring-4
                  focus-within:ring-[#7555f5]/10
                "
              >
                <LockKeyhole
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#7883a6]"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Sua senha"
                  className="
                    h-full
                    min-w-0
                    flex-1
                    border-0
                    bg-white
                    px-3
                    text-[16px]
                    font-medium
                    text-[#23345f]
                    outline-none
                    placeholder:text-[#8d96b1]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-[#7883a6]
                    transition
                    hover:bg-[#f4f1ff]
                    hover:text-[#6744ef]
                  "
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* ========================================= */}
              {/* OPÇÕES */}
              {/* ========================================= */}

              <div className="mt-3 flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#6c7695]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(
                        event.target.checked,
                      )
                    }
                    className="
                      h-4
                      w-4
                      rounded
                      border-[#cfd4e4]
                      accent-[#6744ef]
                    "
                  />

                  Lembrar-me
                </label>

                <button
                  type="button"
                  className="
                    text-xs
                    font-bold
                    text-[#6945ee]
                    transition
                    hover:text-[#5736d8]
                  "
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* ========================================= */}
            {/* MENSAGEM DE ERRO */}
            {/* ========================================= */}

            {error && (
              <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            {/* ========================================= */}
            {/* BOTÃO ENTRAR */}
            {/* ========================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-7
                flex
                h-[64px]
                w-full
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-[#5f2ff0]
                via-[#6c33f2]
                to-[#7436f4]
                px-5
                text-[17px]
                font-extrabold
                text-white
                shadow-[0_12px_28px_rgba(103,61,235,0.24)]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_16px_34px_rgba(103,61,235,0.30)]
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
              "
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>

            {/* ========================================= */}
            {/* DESENVOLVIDO POR */}
            {/* ========================================= */}

            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium tracking-[0.02em] text-[#8b94ad]">
                Desenvolvido por{" "}
                <span className="font-bold text-[#687394]">
                  AC SOFTWARE
                </span>
              </p>
            </div>
          </form>
        </section>
      </div>

      {/* ========================================= */}
      {/* RESPONSIVIDADE */}
      {/* ========================================= */}

      <style>{`
        html,
        body,
        #root {
          width: 100%;
          min-width: 100%;
          height: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          overflow: hidden;
          background: #f4efff;
        }

        main {
          width: 100vw;
          height: 100vh;
          min-width: 100vw;
          min-height: 100vh;
        }

        main > div:first-child {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        main > div:first-child img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow:
            0 0 0 1000px #ffffff inset !important;

          -webkit-text-fill-color:
            #23345f !important;

          caret-color:
            #23345f !important;

          transition:
            background-color 9999s
            ease-in-out 0s !important;
        }

        input {
          background-color: #ffffff !important;
        }

        @media (min-aspect-ratio: 16/9) {
          main > div:first-child img {
            object-position: center center;
          }
        }

        @media (max-width: 1100px) {
          main > div:nth-child(2) {
            padding-left: 28px;
            padding-right: 28px;
          }

          main section {
            max-width: 460px !important;
          }
        }

        @media (max-width: 820px) {
          body {
            overflow: auto;
          }

          main {
            min-height: 100svh;
            height: 100svh;
          }

          main > div:first-child {
            position: fixed;
          }

          main > div:first-child::after {
            content: "";
            position: absolute;
            inset: 0;

            background:
              linear-gradient(
                180deg,
                rgba(247, 244, 255, 0.03) 0%,
                rgba(247, 244, 255, 0.15) 45%,
                rgba(247, 244, 255, 0.72) 76%,
                rgba(247, 244, 255, 0.94) 100%
              );
          }

          main > div:nth-child(2) {
            min-height: 100svh;
            align-items: flex-end;
            justify-content: center;

            padding:
              20px
              16px
              max(
                20px,
                env(safe-area-inset-bottom)
              );
          }

          main section {
            width: 100%;
            max-width: 520px !important;
            border-radius: 26px !important;
            padding: 28px 24px !important;
          }
        }

        @media (max-width: 520px) {
          main section {
            max-width: 100% !important;
            padding: 24px 18px !important;
          }

          main section h1 {
            font-size: 27px !important;
          }
        }

        @media (
          max-height: 760px
        ) and (
          min-width: 821px
        ) {
          main > div:nth-child(2) {
            align-items: center;
            padding-top: 14px;
            padding-bottom: 14px;
          }

          main section {
            transform: scale(0.9);
            transform-origin: center right;
          }
        }
      `}</style>
    </main>
  );
}