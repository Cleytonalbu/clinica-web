import { LoginForm } from "../../components/auth/LoginForm";

export function Login() {
  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="grid min-h-screen grid-cols-2">

        {/* LADO ESQUERDO */}

        <section className="flex items-center justify-center p-16">

          <div className="max-w-2xl">

            <div className="mb-12 h-20 w-64 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              LOGO
            </div>

            <h1 className="text-6xl font-bold leading-tight text-[#1A2468]">
              Cuidado que acolhe,
              <br />
              gestão que
              <span className="text-violet-600">
                {" "}transforma.
              </span>
            </h1>

            <p className="mt-8 text-xl leading-9 text-slate-600">
              Uma plataforma completa para acompanhar a evolução
              terapêutica, integrar equipes e transformar vidas.
            </p>

            <div className="mt-16 h-80 rounded-3xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center">
              ILUSTRAÇÃO
            </div>

            <div className="mt-16 grid grid-cols-3 gap-10">

              <div>
                <h3 className="font-bold text-[#1A2468]">
                  Segurança
                </h3>

                <p className="text-slate-500 text-sm">
                  Dados protegidos.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#1A2468]">
                  Integração
                </h3>

                <p className="text-slate-500 text-sm">
                  Informações conectadas.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#1A2468]">
                  Resultados
                </h3>

                <p className="text-slate-500 text-sm">
                  Indicadores inteligentes.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* LADO DIREITO */}

        <section className="flex items-center justify-center p-16">

          <LoginForm />

        </section>

      </div>
    </main>
  );
}