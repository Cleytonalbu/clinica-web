import { useNavigate } from "react-router-dom";

import type { ApiAgendamento } from "@/services/agenda";

const AVATAR_STYLES = [
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

interface RecepcaoPacientesRecentesProps {
  agendaHoje: ApiAgendamento[];
  agendaOntem: ApiAgendamento[];
  loading: boolean;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

function formatarQuando(iso: string, hoje: boolean) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${hoje ? "Hoje" : "Ontem"}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RecepcaoPacientesRecentes({
  agendaHoje,
  agendaOntem,
  loading,
}: RecepcaoPacientesRecentesProps) {
  const navigate = useNavigate();

  const combinados = [
    ...agendaHoje.map((a) => ({ agendamento: a, hoje: true })),
    ...agendaOntem.map((a) => ({ agendamento: a, hoje: false })),
  ]
    .filter((item) => item.agendamento.paciente)
    .sort((a, b) => b.agendamento.dataHora.localeCompare(a.agendamento.dataHora));

  const vistos = new Set<string>();
  const recentes = combinados.filter((item) => {
    const id = item.agendamento.paciente!.id;
    if (vistos.has(id)) return false;
    vistos.add(id);
    return true;
  }).slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pacientes recentes
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Agendados hoje e ontem.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="text-xs font-semibold text-violet-600"
        >
          Ver todos
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Carregando…</p>
      ) : recentes.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          Nenhum paciente atendido nos últimos dois dias.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
          {recentes.map(
            (
              item,
              index
            ) => (
              <button
                key={
                  item.agendamento.paciente!.id
                }
                type="button"
                onClick={() => navigate(`/pacientes/${item.agendamento.paciente!.id}`)}
                className="text-center"
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}>
                  {
                    iniciais(item.agendamento.paciente!.nome)
                  }
                </div>

                <p className="mt-3 truncate text-xs font-bold text-slate-800">
                  {
                    item.agendamento.paciente!.nome
                  }
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {
                    formatarQuando(item.agendamento.dataHora, item.hoje)
                  }
                </p>
              </button>
            )
          )}
        </div>
      )}
    </section>
  );
}
