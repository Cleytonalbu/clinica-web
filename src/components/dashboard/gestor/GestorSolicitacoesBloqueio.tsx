import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  Lock,
  X,
} from "lucide-react";

import {
  listarSolicitacoesBloqueio,
  aprovarSolicitacaoBloqueio,
  recusarSolicitacaoBloqueio,
  paraBlockRequest,
} from "@/services/solicitacoesBloqueio";

export function GestorSolicitacoesBloqueio() {
  const [requests, setRequests] = useState<ReturnType<typeof paraBlockRequest>[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  function carregar() {
    setLoading(true);
    listarSolicitacoesBloqueio("PENDENTE")
      .then((dados) => setRequests(dados.map(paraBlockRequest)))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleApprove(id: string, professional: string) {
    setProcessandoId(id);
    try {
      await aprovarSolicitacaoBloqueio(id);
      setFeedback(`Bloqueio de ${professional} aprovado com sucesso.`);
      carregar();
    } catch (error: any) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível aprovar a solicitação."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleReject(id: string, professional: string) {
    setProcessandoId(id);
    try {
      await recusarSolicitacaoBloqueio(id);
      setFeedback(`Solicitação de ${professional} recusada.`);
      carregar();
    } catch (error: any) {
      setFeedback(
        error?.response?.data?.mensagem ??
          "Não foi possível recusar a solicitação."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e3e7f2] bg-white shadow-[0_8px_30px_rgba(42,55,105,0.06)]">
      <div className="flex flex-col gap-3 border-b border-[#edf0f7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeaff] text-[#6847f5]">
              <Lock size={18} />
            </span>

            <div>
              <h2 className="text-base font-bold text-[#15255c]">
                Solicitações de bloqueio
              </h2>
              <p className="mt-0.5 text-xs font-medium text-[#8993ad]">
                Aprovação de indisponibilidades solicitadas pelos profissionais.
              </p>
            </div>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-[#f2efff] px-3 py-1 text-xs font-bold text-[#6847f5]">
          {requests.length} pendente{requests.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="p-5">
        {feedback && (
          <div className="mb-4 rounded-xl border border-[#e3defe] bg-[#f8f6ff] px-4 py-3 text-sm font-medium text-[#5d45c7]">
            {feedback}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#9aa3bd]">Carregando…</p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfe4f0] bg-[#fbfcff] px-5 py-8 text-center">
            <Lock
              size={28}
              className="mx-auto text-[#bdc5d8]"
            />
            <p className="mt-3 text-sm font-bold text-[#4e5d82]">
              Nenhuma solicitação pendente
            </p>
            <p className="mt-1 text-xs font-medium text-[#929bb2]">
              Novas solicitações dos profissionais aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-[#e6e9f2] bg-white p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[#1e2f67]">
                        {request.professional}
                      </p>

                      <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[11px] font-bold text-[#b97a11]">
                        Pendente
                      </span>

                      <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-bold text-[#6847f5]">
                        {request.type}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#6f7b9d]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={15} />
                        {formatDate(request.date)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} />
                        {request.startTime} às {request.endTime}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#5d6888]">
                      <strong className="font-bold text-[#39496f]">
                        Motivo:
                      </strong>{" "}
                      {request.reason}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={processandoId === request.id}
                      onClick={() =>
                        handleReject(request.id, request.professional)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#f0cfd5] bg-white px-4 text-sm font-bold text-[#d44e67] transition hover:bg-[#fff7f8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={16} />
                      Recusar
                    </button>

                    <button
                      type="button"
                      disabled={processandoId === request.id}
                      onClick={() =>
                        handleApprove(request.id, request.professional)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(103,66,246,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check size={16} />
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(date);
}
