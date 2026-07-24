import { ShieldCheck, Users, BarChart3 } from "lucide-react";

export function LeftPanel() {
  return (
    <div className="flex h-full w-full max-w-2xl flex-col justify-between">

      {/* Logo */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-[#1A2468]">
          Clínica Integrada
        </h2>

        <p className="text-xl font-semibold text-violet-600">
          Entre Afetos
        </p>
      </div>

      {/* Texto */}
      <div>
        <h1 className="text-6xl font-bold leading-tight text-[#1A2468]">
          Cuidado que acolhe,
          <br />
          gestão que
          <span className="text-violet-600"> transforma.</span>
        </h1>

        <p className="mt-8 max-w-xl text-xl leading-9 text-slate-600">
          Uma plataforma completa para acompanhar a evolução terapêutica,
          integrar equipes e transformar vidas.
        </p>
      </div>

      {/* Ilustração */}
      <div className="my-12 flex h-72 items-center justify-center rounded-3xl bg-violet-100">
        <span className="text-slate-500">
          Ilustração será adicionada aqui
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-8">

        <div>
          <ShieldCheck
            className="mb-3 text-violet-600"
            size={32}
          />

          <h3 className="font-bold text-[#1A2468]">
            Segurança
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Seus dados protegidos com tecnologia avançada.
          </p>
        </div>

        <div>
          <Users
            className="mb-3 text-violet-600"
            size={32}
          />

          <h3 className="font-bold text-[#1A2468]">
            Integração
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Informações conectadas na prática clínica.
          </p>
        </div>

        <div>
          <BarChart3
            className="mb-3 text-violet-600"
            size={32}
          />

          <h3 className="font-bold text-[#1A2468]">
            Resultados
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Indicadores inteligentes para melhores decisões.
          </p>
        </div>

      </div>

    </div>
  );
}
