import {
  CalendarDays,
  Clock3,
  Stethoscope,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  ProfessionalHeader,
} from "@/components/profissionais/header/ProfessionalHeader";

import {
  ProfessionalFilters,
} from "@/components/profissionais/filters/ProfessionalFilters";

import {
  ProfessionalTable,
  type ProfessionalFilterState,
} from "@/components/profissionais/table/ProfessionalTable";

import {
  listarEspecialidades,
  listarProfissionais,
  type ApiEspecialidade,
  type ApiProfissional,
} from "@/services/referencias";

/* =========================================
   PÁGINA PROFISSIONAIS
========================================= */

export default function Profissionais() {
  const [
    filters,
    setFilters,
  ] =
    useState<ProfessionalFilterState>({
      search: "",
      specialty: "todas",
      status: "todos",
    });

  const [profissionais, setProfissionais] = useState<ApiProfissional[]>([]);
  const [especialidades, setEspecialidades] = useState<ApiEspecialidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      // ativo: null pede todos (ativos + inativos) — a tela administrativa
      // precisa ver os três status, diferente dos seletores de agenda.
      listarProfissionais({ ativo: null }),
      listarEspecialidades(),
    ])
      .then(([listaProfissionais, listaEspecialidades]) => {
        if (cancelado) return;
        setProfissionais(listaProfissionais);
        setEspecialidades(listaEspecialidades);
      })
      .catch(() => {})
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const totalAtendimentosHoje = profissionais.reduce(
    (total, p) => total + (p.atendimentosHoje ?? 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfessionalHeader />

        <ProfessionalSummaryCards
          cards={[
            {
              title: "Total de profissionais",
              value: profissionais.length,
              description: "Vinculados à clínica",
              icon: Users,
              iconStyle: "bg-[#eeeaff] text-[#6847f5]",
              valueStyle: "text-[#6847f5]",
            },
            {
              title: "Ativos",
              value: profissionais.filter((p) => p.status === "ATIVO").length,
              description: "Em atendimento",
              icon: UserCheck,
              iconStyle: "bg-[#e8faf4] text-[#2daf82]",
              valueStyle: "text-[#269d75]",
            },
            {
              title: "Em férias",
              value: profissionais.filter((p) => p.status === "FERIAS").length,
              description: "Temporariamente indisponíveis",
              icon: Clock3,
              iconStyle: "bg-[#fff4e7] text-[#ed982f]",
              valueStyle: "text-[#dc8a27]",
            },
            {
              title: "Inativos",
              value: profissionais.filter((p) => p.status === "INATIVO").length,
              description: "Sem agenda ativa",
              icon: UserX,
              iconStyle: "bg-[#fff0f3] text-[#eb5771]",
              valueStyle: "text-[#df4e67]",
            },
            {
              title: "Atendimentos hoje",
              value: totalAtendimentosHoje,
              description: "Somando toda a equipe",
              icon: CalendarDays,
              iconStyle: "bg-[#eaf4ff] text-[#3988e8]",
              valueStyle: "text-[#357fd6]",
            },
          ]}
        />

        <ProfessionalFilters
          filters={
            filters
          }
          onChange={
            setFilters
          }
          especialidades={especialidades}
        />

        <ProfessionalTable
          profissionais={profissionais}
          loading={loading}
          filters={
            filters
          }
        />

        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e2ff] bg-gradient-to-r from-[#f3efff] via-[#f7f4ff] to-[#fbf9ff] px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6847f5] shadow-sm">
            <Stethoscope
              size={18}
            />
          </span>

          <p className="text-sm font-medium text-[#657196]">
            <strong className="text-[#6543ef]">
              Dica:
            </strong>{" "}
            use os filtros para localizar profissionais por nome, especialidade ou status e acesse o perfil completo pela ação de visualizar.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================================
   CARDS DE RESUMO
========================================= */

interface SummaryCardConfig {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
  iconStyle: string;
  valueStyle: string;
}

function ProfessionalSummaryCards({
  cards,
}: {
  cards: SummaryCardConfig[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#69769d]">
                  {card.title}
                </p>

                <p
                  className={`mt-3 text-[26px] font-extrabold tracking-[-0.02em] ${card.valueStyle}`}
                >
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
              >
                <Icon size={21} />
              </div>
            </div>

            <p className="mt-4 text-[11px] font-semibold text-[#9aa3bd]">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
