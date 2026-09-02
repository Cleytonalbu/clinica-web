import {
  useEffect,
  useState,
} from "react";

import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  ProfissionalMetricCards,
} from "../../../components/dashboard/profissional/ProfissionalMetricCards";

import {
  ProfissionalOcupacao,
} from "../../../components/dashboard/profissional/ProfissionalOcupacao";

import {
  ProfissionalProximasConsultas,
} from "../../../components/dashboard/profissional/ProfissionalProximasConsultas";

import {
  ProfissionalAvisos,
} from "../../../components/dashboard/profissional/ProfissionalAvisos";

import {
  ProfissionalEvolucoesStatus,
} from "../../../components/dashboard/profissional/ProfissionalEvolucoesStatus";

import {
  ProfissionalObjetivos,
} from "../../../components/dashboard/profissional/ProfissionalObjetivos";

import {
  ProfissionalAcessoRapido,
} from "../../../components/dashboard/profissional/ProfissionalAcessoRapido";

import {
  ProfissionalAgendaHoje,
} from "../../../components/dashboard/profissional/ProfissionalAgendaHoje";

import {
  ProfissionalValoresReceber,
} from "../../../components/dashboard/profissional/ProfissionalValoresReceber";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  listarProfissionais,
} from "@/services/referencias";

import {
  listarMeusAgendamentos,
  listarMeusObjetivos,
  listarMinhasEvolucoes,
  buscarMeusRepasses,
  type ApiObjetivoMeu,
  type ApiEvolucaoMinha,
  type ApiMeusRepasses,
} from "@/services/dashboardProfissional";

import type { ApiAgendamento } from "@/services/agenda";

function paraISO(data: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export default function DashboardProfissional() {
  const { user } = useAuth();

  const [agendaHoje, setAgendaHoje] = useState<ApiAgendamento[]>([]);
  const [agendaMes, setAgendaMes] = useState<ApiAgendamento[]>([]);
  const [objetivos, setObjetivos] = useState<ApiObjetivoMeu[]>([]);
  const [evolucoes, setEvolucoes] = useState<ApiEvolucaoMinha[]>([]);
  const [repasses, setRepasses] = useState<ApiMeusRepasses | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelado = false;
    setLoading(true);
    setErro(null);

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    listarProfissionais()
      .then((profissionais) => {
        if (cancelado) return Promise.reject(new Error("cancelado"));

        const meuProfissional = profissionais.find((p) => p.usuarioId === user.id);
        if (!meuProfissional) {
          throw new Error("Usuário logado não é um profissional cadastrado.");
        }

        return Promise.all([
          listarMeusAgendamentos({ profissionalId: meuProfissional.id, data: paraISO(hoje), porPagina: 100 }),
          listarMeusAgendamentos({
            profissionalId: meuProfissional.id,
            dataInicio: paraISO(inicioMes),
            dataFim: paraISO(fimMes),
            porPagina: 300,
          }),
          listarMeusObjetivos("EM_ANDAMENTO"),
          listarMinhasEvolucoes(),
          buscarMeusRepasses(),
        ] as const).then(([hojeResp, mesResp, objs, evos, rep]) => {
          if (cancelado) return;

          setAgendaHoje(hojeResp.dados.filter((a) => a.tipo === "ATENDIMENTO"));
          setAgendaMes(mesResp.dados.filter((a) => a.tipo === "ATENDIMENTO"));
          setObjetivos(objs);
          setEvolucoes(evos);
          setRepasses(rep);
        });
      })
      .catch((error) => {
        if (cancelado || error?.message === "cancelado") return;
        setErro("Não foi possível carregar os dados do painel.");
      })
      .finally(() => {
        if (cancelado) return;
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        {erro && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        {/* ================================= */}
        {/* MÉTRICAS */}
        {/* ================================= */}

        <ProfissionalMetricCards
          agendaHoje={agendaHoje}
          evolucoes={evolucoes}
          loading={loading}
        />

        {/* ================================= */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          {/* COLUNA PRINCIPAL */}

          <div className="space-y-5">
            {/* AGENDA DE HOJE */}

            <ProfissionalAgendaHoje agendamentos={agendaHoje} loading={loading} />

            {/* OCUPAÇÃO + PRÓXIMAS CONSULTAS */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <ProfissionalOcupacao agendaMes={agendaMes} loading={loading} />

              <ProfissionalProximasConsultas agendaHoje={agendaHoje} loading={loading} />
            </div>

            {/* EVOLUÇÕES + AVISOS */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <ProfissionalEvolucoesStatus evolucoes={evolucoes} loading={loading} />

              <ProfissionalAvisos evolucoes={evolucoes} objetivos={objetivos} loading={loading} />
            </div>

            {/* OBJETIVOS */}

            <ProfissionalObjetivos objetivos={objetivos} loading={loading} />
          </div>

          {/* COLUNA LATERAL */}

          <div className="space-y-5">
            <ProfissionalAcessoRapido />

            <ProfissionalValoresReceber repasses={repasses} loading={loading} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
