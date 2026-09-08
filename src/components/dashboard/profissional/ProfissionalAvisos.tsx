import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  X,
} from "lucide-react";
import {
  useState,
} from "react";

type ProfessionalNoticeType =
  | "evolucao"
  | "objetivo"
  | "reuniao";

interface ProfessionalNotice {
  id: number;
  type: ProfessionalNoticeType;
  title: string;
  description: string;
  details: string[];
  actionLabel?: string;
  icon: typeof ClipboardCheck;
  iconClassName: string;
}

const notices: ProfessionalNotice[] = [
  {
    id: 1,
    type: "evolucao",
    title: "3 evoluções precisam ser finalizadas",
    description:
      "Existem evoluções de atendimentos realizados que ainda precisam ser concluídas.",
    details: [
      "Revise os atendimentos realizados que ainda estão com evolução pendente.",
      "Finalize a evolução após conferir as informações clínicas da sessão.",
      "Evoluções pendentes continuam aparecendo nos indicadores do seu dashboard.",
    ],
    actionLabel: "Acessar pacientes",
    icon: ClipboardCheck,
    iconClassName:
      "bg-orange-50 text-orange-500",
  },
  {
    id: 2,
    type: "objetivo",
    title: "2 pacientes possuem objetivos para revisão",
    description:
      "Há objetivos terapêuticos que precisam ser revisados para manter o acompanhamento atualizado.",
    details: [
      "Confira os objetivos atualmente em acompanhamento.",
      "Atualize progresso, status ou observações quando necessário.",
      "A revisão ajuda a manter os indicadores clínicos coerentes com a evolução do paciente.",
    ],
    actionLabel: "Acessar pacientes",
    icon: AlertTriangle,
    iconClassName:
      "bg-orange-50 text-orange-500",
  },
  {
    id: 3,
    type: "reuniao",
    title: "Reunião de equipe hoje às 17:00",
    description:
      "Lembrete de compromisso da equipe clínica programado para hoje.",
    details: [
      "Horário: 17:00.",
      "Tipo: reunião de equipe.",
      "Consulte a agenda para conferir bloqueios, duração e demais informações cadastradas.",
    ],
    actionLabel: "Ver agenda",
    icon: CalendarClock,
    iconClassName:
      "bg-orange-50 text-orange-500",
  },
];

export function ProfissionalAvisos() {
  const [selectedNotice, setSelectedNotice] =
    useState<ProfessionalNotice | null>(null);

  function handleAction(
    notice: ProfessionalNotice
  ) {
    if (
      notice.type ===
      "reuniao"
    ) {
      window.location.href =
        "/agenda";

      return;
    }

    window.location.href =
      "/pacientes";
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-base font-extrabold text-slate-900">
            Avisos importantes
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {notices.map(
            (notice) => {
              const Icon =
                notice.icon;

              return (
                <button
                  key={
                    notice.id
                  }
                  type="button"
                  onClick={() =>
                    setSelectedNotice(
                      notice
                    )
                  }
                  className="group flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400"
                  title="Clique para visualizar o aviso"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notice.iconClassName}`}
                  >
                    <Icon
                      size={17}
                    />
                  </span>

                  <span className="min-w-0 flex-1 text-xs font-medium leading-5 text-slate-600 transition group-hover:text-slate-800">
                    {
                      notice.title
                    }
                  </span>
                </button>
              );
            }
          )}
        </div>
      </section>

      {selectedNotice && (
        <NoticeDetailsModal
          notice={
            selectedNotice
          }
          onClose={() =>
            setSelectedNotice(
              null
            )
          }
          onAction={() =>
            handleAction(
              selectedNotice
            )
          }
        />
      )}
    </>
  );
}

function NoticeDetailsModal({
  notice,
  onClose,
  onAction,
}: {
  notice: ProfessionalNotice;
  onClose: () => void;
  onAction: () => void;
}) {
  const Icon =
    notice.icon;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4"
      onClick={
        onClose
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`professional-notice-${notice.id}`}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notice.iconClassName}`}
            >
              <Icon
                size={19}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-violet-500">
                Aviso importante
              </p>

              <h3
                id={`professional-notice-${notice.id}`}
                className="mt-1 text-base font-extrabold leading-6 text-[#10235f]"
              >
                {
                  notice.title
                }
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            title="Fechar"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-slate-600">
            {
              notice.description
            }
          </p>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-xs font-extrabold text-slate-700">
              Informações do aviso
            </p>

            <ul className="mt-3 space-y-2.5">
              {notice.details.map(
                (
                  detail,
                  index
                ) => (
                  <li
                    key={`${notice.id}-${index}`}
                    className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    <span>
                      {
                        detail
                      }
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={
              onClose
            }
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>

          {notice.actionLabel && (
            <button
              type="button"
              onClick={
                onAction
              }
              className="inline-flex h-10 items-center justify-center rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              {
                notice.actionLabel
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
