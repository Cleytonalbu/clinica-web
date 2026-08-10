import {
  AlertCircle,
  CircleDollarSign,
  ClipboardList,
} from "lucide-react";

const pendencias = [
  {
    id: 1,
    title: "Evoluções pendentes",
    description:
      "8 evoluções ainda não foram finalizadas.",
    icon: (
      <ClipboardList
        size={18}
      />
    ),
  },

  {
    id: 2,
    title: "Pagamentos em aberto",
    description:
      "12 cobranças aguardam pagamento.",
    icon: (
      <CircleDollarSign
        size={18}
      />
    ),
  },

  {
    id: 3,
    title: "Cadastros incompletos",
    description:
      "5 pacientes possuem dados pendentes.",
    icon: (
      <AlertCircle
        size={18}
      />
    ),
  },
];

export function GestorPendencias() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Pendências
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Itens que precisam de atenção.
      </p>

      <div className="mt-5 space-y-3">
        {pendencias.map(
          (
            pendencia
          ) => (
            <div
              key={
                pendencia.id
              }
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
                {
                  pendencia.icon
                }
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {
                    pendencia.title
                  }
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {
                    pendencia.description
                  }
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}