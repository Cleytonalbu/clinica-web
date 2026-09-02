import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface FaltasPorMotivoProps {
  dados: ApiIndicadoresGerais["faltasPorMotivo"];
}

const LABELS_MOTIVO: Record<string, string> = {
  PROBLEMAS_SAUDE: "Problemas de saúde",
  COMPROMISSOS_PESSOAIS: "Compromissos pessoais",
  ESQUECIMENTO: "Esquecimento",
  OUTROS: "Outros",
  NAO_INFORMADO: "Não informado",
};

const CORES_MOTIVO: Record<string, string> = {
  PROBLEMAS_SAUDE: "bg-[#eb5771]",
  COMPROMISSOS_PESSOAIS: "bg-[#ed982f]",
  ESQUECIMENTO: "bg-[#6847f5]",
  OUTROS: "bg-[#3b91ed]",
  NAO_INFORMADO: "bg-slate-300",
};

export function FaltasPorMotivo({
  dados,
}: FaltasPorMotivoProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Faltas por motivo
      </h2>

      {dados.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhuma falta registrada no período.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {dados.map(
            (
              item
            ) => (
              <div
                key={
                  item.motivo
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    {LABELS_MOTIVO[item.motivo] ?? item.motivo}
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {item.total} ({item.percentual}%)
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${CORES_MOTIVO[item.motivo] ?? "bg-slate-300"}`}
                    style={{
                      width: `${item.percentual}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
