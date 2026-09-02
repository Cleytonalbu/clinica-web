import type { ApiDashboardGestor } from "@/services/dashboardGestor";

const CORES = ["#6847f5", "#36a9e1", "#35bd92", "#f2b347", "#ef6975"];

interface GestorDesempenhoProps {
  dados: ApiDashboardGestor["desempenhoPorEspecialidade"];
}

export function GestorDesempenho({
  dados,
}: GestorDesempenhoProps) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-[#eceef6]
        bg-white
        p-6
        shadow-[0_4px_16px_rgba(51,65,120,0.04)]
      "
    >
      <h2 className="text-[17px] font-extrabold text-[#10235f]">
        Desempenho por especialidade
      </h2>

      <p className="mt-1 text-xs font-medium text-[#8a95b4]">
        % de atendimentos concluídos no mês.
      </p>

      {dados.length === 0 ? (
        <p className="mt-7 text-sm text-[#9aa3bd]">
          Nenhum atendimento com especialidade registrada neste mês.
        </p>
      ) : (
        <div className="mt-7 space-y-6">
          {dados.map(
            (especialidade, index) => (
              <div
                key={
                  especialidade.especialidadeId
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-[#667397]">
                    {
                      especialidade.nome
                    }
                  </span>

                  <span
                    className="text-xs font-extrabold"
                    style={{ color: CORES[index % CORES.length] }}
                  >
                    {
                      especialidade.percentual
                    }
                    %
                  </span>
                </div>

                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#f0f1f7]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${especialidade.percentual}%`,
                      backgroundColor: CORES[index % CORES.length],
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
