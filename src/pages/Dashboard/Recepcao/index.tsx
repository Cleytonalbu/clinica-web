import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DashboardLayout,
} from "../../../layouts/DashboardLayout";

import {
  RecepcaoMetricCards,
} from "../../../components/dashboard/recepcao/RecepcaoMetricCards";

import {
  RecepcaoAgendaHoje,
} from "../../../components/dashboard/recepcao/RecepcaoAgendaHoje";

import {
  RecepcaoFilaAtendimento,
} from "../../../components/dashboard/recepcao/RecepcaoFilaAtendimento";

import {
  RecepcaoBuscaRapida,
} from "../../../components/dashboard/recepcao/RecepcaoBuscaRapida";

import {
  RecepcaoPacientesRecentes,
} from "../../../components/dashboard/recepcao/RecepcaoPacientesRecentes";

import {
  RecepcaoResumoAgenda,
} from "../../../components/dashboard/recepcao/RecepcaoResumoAgenda";

import {
  listarAgendamentos,
  type ApiAgendamento,
} from "@/services/agenda";

function paraISO(data: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export default function DashboardRecepcao() {
  const [agendaHoje, setAgendaHoje] = useState<ApiAgendamento[]>([]);
  const [agendaOntem, setAgendaOntem] = useState<ApiAgendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);

    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    Promise.all([
      listarAgendamentos({ data: paraISO(hoje), porPagina: 100 }),
      listarAgendamentos({ data: paraISO(ontem), porPagina: 100 }),
    ])
      .then(([respostaHoje, respostaOntem]) => {
        setAgendaHoje(respostaHoje.dados.filter((a) => a.tipo === "ATENDIMENTO"));
        setAgendaOntem(respostaOntem.dados.filter((a) => a.tipo === "ATENDIMENTO"));
      })
      .catch(() => {
        setErro("Não foi possível carregar a agenda de hoje.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {erro && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        <RecepcaoMetricCards agendamentos={agendaHoje} loading={loading} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
          <RecepcaoAgendaHoje
            agendamentos={agendaHoje}
            loading={loading}
            onAtualizar={carregar}
          />

          <RecepcaoFilaAtendimento agendamentos={agendaHoje} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.7fr_1.25fr_1fr]">
          <RecepcaoBuscaRapida />

          <RecepcaoPacientesRecentes
            agendaHoje={agendaHoje}
            agendaOntem={agendaOntem}
            loading={loading}
          />

          <RecepcaoResumoAgenda agendamentos={agendaHoje} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
