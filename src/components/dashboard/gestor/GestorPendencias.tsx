import {
  AlertCircle,
  CircleDollarSign,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { ApiDashboardGestor } from "@/services/dashboardGestor";

interface GestorPendenciasProps {
  dados: ApiDashboardGestor["pendencias"];
}

export function GestorPendencias({
  dados,
}: GestorPendenciasProps) {
  const navigate = useNavigate();

  const pendencias = [
    {
      id: "evolucoes",
      title: "Evoluções pendentes",
      description: `${dados.evolucoesPendentes} evolução${dados.evolucoesPendentes === 1 ? "" : "ões"} ainda não ${dados.evolucoesPendentes === 1 ? "foi finalizada" : "foram finalizadas"}.`,
      icon: ClipboardList,
      iconStyle: "bg-[#fff5df] text-[#e4a02e]",
      onClick: () => navigate("/pacientes"),
    },
    {
      id: "pagamentos",
      title: "Pagamentos em aberto",
      description: `${dados.pagamentosEmAberto} cobrança${dados.pagamentosEmAberto === 1 ? "" : "s"} aguarda${dados.pagamentosEmAberto === 1 ? "" : "m"} pagamento.`,
      icon: CircleDollarSign,
      iconStyle: "bg-[#fff0f1] text-[#e85d69]",
      onClick: () => navigate("/financeiro"),
    },
    {
      id: "cadastros",
      title: "Cadastros incompletos",
      description: `${dados.cadastrosIncompletos} paciente${dados.cadastrosIncompletos === 1 ? "" : "s"} ${dados.cadastrosIncompletos === 1 ? "possui" : "possuem"} dados pendentes.`,
      icon: AlertCircle,
      iconStyle: "bg-[#eeeaff] text-[#6847f5]",
      onClick: () => navigate("/pacientes"),
    },
  ].filter((item) => {
    const total = item.id === "evolucoes" ? dados.evolucoesPendentes
      : item.id === "pagamentos" ? dados.pagamentosEmAberto
      : dados.cadastrosIncompletos;
    return total > 0;
  });

  return (
    <section
      className="
        rounded-2xl
        border
        border-[#eceef6]
        bg-white
        p-6
        shadow-[0_4px_16px_rgba(51,65,120,0.04)]
      "
    >
      <h2 className="text-[17px] font-extrabold text-[#10235f]">
        Pendências
      </h2>

      <p className="mt-1 text-xs font-medium text-[#8a95b4]">
        Itens que precisam de atenção.
      </p>

      {pendencias.length === 0 ? (
        <p className="mt-5 text-sm text-[#9aa3bd]">
          Nenhuma pendência no momento.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {pendencias.map(
            (pendencia) => {
              const Icon =
                pendencia.icon;

              return (
                <button
                  key={
                    pendencia.id
                  }
                  type="button"
                  onClick={pendencia.onClick}
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-transparent
                    bg-[#fafafd]
                    p-3.5
                    text-left
                    transition
                    hover:border-[#e7e4fa]
                    hover:bg-[#fbfaff]
                  "
                >
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${pendencia.iconStyle}
                    `}
                  >
                    <Icon
                      size={17}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#263765]">
                      {
                        pendencia.title
                      }
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[#8791ad]">
                      {
                        pendencia.description
                      }
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="shrink-0 text-[#bbc1d1] transition group-hover:translate-x-0.5 group-hover:text-[#6847f5]"
                  />
                </button>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
