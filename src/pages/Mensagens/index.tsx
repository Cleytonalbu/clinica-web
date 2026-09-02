import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  Check,
  CheckCheck,
  Loader2,
  MessageSquareOff,
  MessagesSquare,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/auth/AuthContext";

import {
  enviarMensagem,
  listarContatos,
  listarMensagens,
  marcarTodasMensagensLidas,
  type ApiMensagem,
  type ApiUsuarioResumo,
} from "@/services/mensagens";

/* =========================================
   HELPERS
========================================= */

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const PAPEL_LABEL: Record<ApiUsuarioResumo["papel"], string> = {
  GESTOR: "Gestor",
  RECEPCIONISTA: "Recepção",
  PROFISSIONAL: "Profissional",
  ADMINISTRATIVO: "Administrativo",
};

function formatarHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

function formatarDataHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso)
  );
}

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatarPreview(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();

  if (mesmoDia(data, hoje)) {
    return formatarHora(iso);
  }

  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (mesmoDia(data, ontem)) return "ontem";

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(data);
}

/* =========================================
   CONVERSA (agrupamento client-side)
========================================= */

interface Conversa {
  contato: ApiUsuarioResumo;
  ultimaMensagem: ApiMensagem;
  naoLidas: number;
}

function montarConversas(mensagens: ApiMensagem[], meuId: string): Conversa[] {
  const mapa = new Map<string, Conversa>();

  for (const mensagem of mensagens) {
    const souRemetente = mensagem.remetente.id === meuId;
    const contato = souRemetente ? mensagem.destinatario : mensagem.remetente;

    const existente = mapa.get(contato.id);

    const naoLidaIncremento = !souRemetente && !mensagem.lida ? 1 : 0;

    if (!existente) {
      mapa.set(contato.id, {
        contato,
        ultimaMensagem: mensagem,
        naoLidas: naoLidaIncremento,
      });
      continue;
    }

    existente.naoLidas += naoLidaIncremento;

    if (new Date(mensagem.criadoEm) > new Date(existente.ultimaMensagem.criadoEm)) {
      existente.ultimaMensagem = mensagem;
    }
  }

  return Array.from(mapa.values()).sort(
    (a, b) =>
      new Date(b.ultimaMensagem.criadoEm).getTime() -
      new Date(a.ultimaMensagem.criadoEm).getTime()
  );
}

/* =========================================
   PÁGINA
========================================= */

export default function Mensagens() {
  const { user } = useAuth();
  const meuId = user?.id ?? "";

  const [mensagens, setMensagens] = useState<ApiMensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [contatoAtivoId, setContatoAtivoId] = useState<string | null>(null);

  const [novaConversaAberta, setNovaConversaAberta] = useState(false);
  const [buscaContato, setBuscaContato] = useState("");
  const [contatos, setContatos] = useState<ApiUsuarioResumo[]>([]);
  const [carregandoContatos, setCarregandoContatos] = useState(false);

  const [textoEnvio, setTextoEnvio] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Contato selecionado via "Nova conversa" que ainda não tem nenhuma
  // mensagem trocada — não aparece em `conversas` (derivada das mensagens),
  // por isso é guardado à parte para exibir o cabeçalho da thread.
  const [contatoProvisorio, setContatoProvisorio] = useState<ApiUsuarioResumo | null>(
    null
  );

  const threadRef = useRef<HTMLDivElement>(null);

  /* =======================================
     CARREGAR MENSAGENS (+ polling)
  ======================================= */

  useEffect(() => {
    if (!meuId) return;
    let cancelado = false;

    function carregar(mostrarLoading: boolean) {
      if (mostrarLoading) setCarregando(true);

      listarMensagens()
        .then((dados) => {
          if (cancelado) return;
          setMensagens(dados);
          setErro(null);
        })
        .catch(() => {
          if (!cancelado) setErro("Não foi possível carregar as mensagens.");
        })
        .finally(() => {
          if (!cancelado) setCarregando(false);
        });
    }

    carregar(true);
    const interval = window.setInterval(() => carregar(false), 15000);

    return () => {
      cancelado = true;
      window.clearInterval(interval);
    };
  }, [meuId]);

  const conversas = useMemo(
    () => montarConversas(mensagens, meuId),
    [mensagens, meuId]
  );

  const conversaAtiva = conversas.find((c) => c.contato.id === contatoAtivoId) ?? null;

  const threadAtiva = useMemo(() => {
    if (!contatoAtivoId) return [];

    return mensagens
      .filter(
        (m) =>
          (m.remetente.id === meuId && m.destinatario.id === contatoAtivoId) ||
          (m.remetente.id === contatoAtivoId && m.destinatario.id === meuId)
      )
      .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
  }, [mensagens, contatoAtivoId, meuId]);

  // Rola para a última mensagem sempre que a conversa muda ou recebe novas.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [threadAtiva]);

  /* =======================================
     ABRIR CONVERSA
  ======================================= */

  function abrirConversa(contatoId: string) {
    setContatoAtivoId(contatoId);
    setNovaConversaAberta(false);
  }

  // Marca como lida qualquer mensagem não lida do contato com a conversa
  // aberta — dispara ao abrir a conversa E também quando o polling traz uma
  // mensagem nova enquanto a conversa já está aberta (sem isso, uma msg que
  // chega com a thread já visível ficava "não lida" para sempre).
  useEffect(() => {
    if (!contatoAtivoId) return;

    const temNaoLidas = mensagens.some(
      (m) => m.remetente.id === contatoAtivoId && m.destinatario.id === meuId && !m.lida
    );

    if (!temNaoLidas) return;

    // Otimista: já marca localmente para o badge sumir na hora.
    setMensagens((atual) =>
      atual.map((m) =>
        m.remetente.id === contatoAtivoId && m.destinatario.id === meuId
          ? { ...m, lida: true }
          : m
      )
    );

    marcarTodasMensagensLidas({ com: contatoAtivoId }).catch(() => {});
  }, [contatoAtivoId, mensagens, meuId]);

  /* =======================================
     NOVA CONVERSA
  ======================================= */

  useEffect(() => {
    if (!novaConversaAberta) return;
    let cancelado = false;
    setCarregandoContatos(true);

    const timeout = window.setTimeout(() => {
      listarContatos({ busca: buscaContato.trim() || undefined })
        .then((dados) => {
          if (!cancelado) setContatos(dados);
        })
        .catch(() => {
          if (!cancelado) setContatos([]);
        })
        .finally(() => {
          if (!cancelado) setCarregandoContatos(false);
        });
    }, 250);

    return () => {
      cancelado = true;
      window.clearTimeout(timeout);
    };
  }, [novaConversaAberta, buscaContato]);

  function selecionarContatoNovo(contato: ApiUsuarioResumo) {
    // Se já existe conversa, só abre; senão, o contato só passará a aparecer
    // na lista (derivada das mensagens) depois da primeira mensagem enviada
    // — por isso guardamos os dados dele à parte para exibir o cabeçalho.
    setContatoProvisorio(contato);
    setContatoAtivoId(contato.id);
    setNovaConversaAberta(false);
    setBuscaContato("");
  }

  const contatoParaExibir =
    conversaAtiva?.contato ??
    (contatoProvisorio?.id === contatoAtivoId ? contatoProvisorio : null);

  /* =======================================
     ENVIAR MENSAGEM
  ======================================= */

  async function handleEnviar(event: FormEvent) {
    event.preventDefault();

    const texto = textoEnvio.trim();
    if (!texto || !contatoAtivoId || enviando) return;

    setEnviando(true);

    try {
      const mensagem = await enviarMensagem({ destinatarioId: contatoAtivoId, texto });
      setMensagens((atual) => [...atual, mensagem]);
      setTextoEnvio("");
      setContatoProvisorio(null);
    } catch {
      setErro("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#10235f]">
          Mensagens
        </h1>
        <p className="mt-1 text-sm font-medium text-[#7180a8]">
          Converse diretamente com a equipe da clínica.
        </p>
      </div>

      {erro && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </div>
      )}

      <div className="mt-6 flex h-[calc(100vh-230px)] min-h-[420px] gap-5">
        {/* ================================= */}
        {/* LISTA DE CONVERSAS */}
        {/* ================================= */}

        <div className="flex w-[340px] shrink-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#edf0f8] px-5 py-4">
            <h2 className="text-base font-bold text-[#10235f]">Conversas</h2>

            <button
              type="button"
              title="Nova conversa"
              onClick={() => setNovaConversaAberta((atual) => !atual)}
              className={`
                flex h-9 w-9 items-center justify-center rounded-xl transition
                ${
                  novaConversaAberta
                    ? "bg-[#5d3df5] text-white"
                    : "bg-[#f6f7ff] text-[#5d3df5] hover:bg-[#eceaff]"
                }
              `}
            >
              {novaConversaAberta ? <X size={17} /> : <Plus size={17} />}
            </button>
          </div>

          {novaConversaAberta ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-[#edf0f8] p-3">
                <div className="flex h-10 items-center rounded-xl border border-[#dfe4f4] bg-white px-3">
                  <Search size={15} className="shrink-0 text-[#8792b3]" />
                  <input
                    type="text"
                    autoFocus
                    value={buscaContato}
                    onChange={(event) => setBuscaContato(event.target.value)}
                    placeholder="Buscar colega..."
                    className="ml-2 min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-[#8792b3]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {carregandoContatos ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-[#5d3df5]" />
                  </div>
                ) : contatos.length > 0 ? (
                  contatos.map((contato) => (
                    <button
                      key={contato.id}
                      type="button"
                      onClick={() => selecionarContatoNovo(contato)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f6b28c] to-[#d77c63] text-xs font-extrabold text-white">
                        {getInitials(contato.nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {contato.nome}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {PAPEL_LABEL[contato.papel]}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-xs text-slate-400">
                    Nenhum colega encontrado.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              {carregando ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-[#5d3df5]" />
                </div>
              ) : conversas.length > 0 ? (
                conversas.map((conversa) => (
                  <button
                    key={conversa.contato.id}
                    type="button"
                    onClick={() => abrirConversa(conversa.contato.id)}
                    className={`
                      flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition
                      ${
                        conversa.contato.id === contatoAtivoId
                          ? "bg-[#f6f7ff]"
                          : "hover:bg-slate-50"
                      }
                    `}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f6b28c] to-[#d77c63] text-xs font-extrabold text-white">
                      {getInitials(conversa.contato.nome)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {conversa.contato.nome}
                        </p>
                        <span className="shrink-0 text-[10px] font-medium text-slate-400">
                          {formatarPreview(conversa.ultimaMensagem.criadoEm)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-slate-500">
                          {conversa.ultimaMensagem.remetente.id === meuId ? "Você: " : ""}
                          {conversa.ultimaMensagem.texto}
                        </p>

                        {conversa.naoLidas > 0 && (
                          <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#5d3df5] px-1 text-[10px] font-extrabold text-white">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <MessagesSquare size={26} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Nenhuma conversa ainda
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Clique em "+" para falar com alguém da equipe.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* THREAD ATIVA */}
        {/* ================================= */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
          {contatoParaExibir ? (
            <>
              <div className="flex items-center gap-3 border-b border-[#edf0f8] px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f6b28c] to-[#d77c63] text-xs font-extrabold text-white">
                  {getInitials(contatoParaExibir.nome)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#10235f]">
                    {contatoParaExibir.nome}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {PAPEL_LABEL[contatoParaExibir.papel]}
                  </p>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                {threadAtiva.length === 0 ? (
                  <p className="mt-10 text-center text-xs text-slate-400">
                    Nenhuma mensagem ainda. Diga olá!
                  </p>
                ) : (
                  threadAtiva.map((mensagem) => {
                    const minha = mensagem.remetente.id === meuId;

                    return (
                      <div
                        key={mensagem.id}
                        className={`flex ${minha ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-5
                            ${
                              minha
                                ? "bg-[#5d3df5] text-white"
                                : "bg-[#f5f6fb] text-slate-700"
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
                          <div
                            className={`
                              mt-1 flex items-center justify-end gap-1 text-[10px]
                              ${minha ? "text-white/70" : "text-slate-400"}
                            `}
                            title={formatarDataHora(mensagem.criadoEm)}
                          >
                            {formatarHora(mensagem.criadoEm)}
                            {minha &&
                              (mensagem.lida ? (
                                <CheckCheck size={12} />
                              ) : (
                                <Check size={12} />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleEnviar}
                className="flex items-center gap-3 border-t border-[#edf0f8] px-5 py-4"
              >
                <input
                  type="text"
                  value={textoEnvio}
                  onChange={(event) => setTextoEnvio(event.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="h-11 min-w-0 flex-1 rounded-xl border border-[#dfe4f4] bg-white px-4 text-sm font-medium text-slate-700 outline-none placeholder:text-[#8792b3]"
                />

                <button
                  type="submit"
                  disabled={!textoEnvio.trim() || enviando}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5d3df5] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enviando ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <MessageSquareOff size={32} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">
                Selecione uma conversa
              </p>
              <p className="max-w-xs text-xs text-slate-400">
                Escolha uma conversa existente à esquerda ou inicie uma nova para falar
                com alguém da equipe.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
