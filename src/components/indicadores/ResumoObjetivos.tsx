import type { ApiIndicadoresGerais } from "@/services/indicadores";

interface ResumoObjetivosProps {
  dados: ApiIndicadoresGerais["resumoObjetivos"];
}

const CORES_STATUS: Record<string, string> = {
  ALCANCADO: "#2daf82",
  EM_ANDAMENTO: "#3b91ed",
  PARCIALMENTE_ALCANCADO: "#eb5771",
  NAO_TRABALHADO: "#94a3b8",
};

const LABELS_STATUS: Record<string, string> = {
  ALCANCADO: "Alcançados",
  EM_ANDAMENTO: "Em evolução",
  PARCIALMENTE_ALCANCADO: "Parcialmente alcançados",
  NAO_TRABALHADO: "Não trabalhados",
};

export function ResumoObjetivos({
  dados,
}: ResumoObjetivosProps) {
  const gradienteStops = (() => {
    let acumulado = 0;

    return dados.porStatus
      .map((item) => {
        const inicio = acumulado * 3.6;
        acumulado += item.percentual;
        const fim = acumulado * 3.6;
        return `${CORES_STATUS[item.status] ?? "#94a3b8"} ${inicio}deg ${fim}deg`;
      })
      .join(", ");
  })();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        Resumo dos objetivos
      </h2>

      {dados.total === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Nenhum objetivo cadastrado.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[160px_1fr] sm:items-center">
          <div
            className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${gradienteStops})`,
            }}
          >
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {dados.total}
                </p>

                <p className="text-xs text-slate-400">
                  Total
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {dados.porStatus.map(
              (
                item
              ) => (
                <div
                  key={
                    item.status
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-600">
                      {LABELS_STATUS[item.status] ?? item.status}
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {item.total} ({item.percentual}%)
                    </span>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentual}%`,
                        backgroundColor: CORES_STATUS[item.status] ?? "#94a3b8",
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
