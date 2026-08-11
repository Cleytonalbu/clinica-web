import type {
  ComponentType,
} from "react";

import {
  AlertCircle,
  CircleDollarSign,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

interface Pendencia {
  id: number;
  title: string;
  description: string;

  icon: ComponentType<{
    size?: number;
  }>;

  iconStyle: string;
}

const pendencias: Pendencia[] = [
  {
    id: 1,
    title: "Evoluções pendentes",
    description:
      "8 evoluções ainda não foram finalizadas.",
    icon: ClipboardList,
    iconStyle:
      "bg-[#fff5df] text-[#e4a02e]",
  },

  {
    id: 2,
    title: "Pagamentos em aberto",
    description:
      "12 cobranças aguardam pagamento.",
    icon: CircleDollarSign,
    iconStyle:
      "bg-[#fff0f1] text-[#e85d69]",
  },

  {
    id: 3,
    title: "Cadastros incompletos",
    description:
      "5 pacientes possuem dados pendentes.",
    icon: AlertCircle,
    iconStyle:
      "bg-[#eeeaff] text-[#6847f5]",
  },
];

export function GestorPendencias() {
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

      <div className="mt-5 space-y-3">
        {pendencias.map(
          (pendencia) => {
            const Icon =
              pendencia.icon;

            return (
              <div
                key={
                  pendencia.id
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-transparent
                  bg-[#fafafd]
                  p-3.5
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
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}