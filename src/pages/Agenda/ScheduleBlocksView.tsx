import {
  Coffee,
  Lock,
  Palmtree,
  Users,
} from "lucide-react";

type BlockType =
  | "Almoço"
  | "Reunião"
  | "Férias"
  | "Indisponível";

export interface ScheduleBlock {
  id: number;
  professional: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BlockType;
  reason: string;
}

interface ScheduleBlocksViewProps {
  blocks: ScheduleBlock[];
  selectedDate: string;
}

export function ScheduleBlocksView({
  blocks,
  selectedDate,
}: ScheduleBlocksViewProps) {
  const dayBlocks = blocks.filter(
    (block) =>
      block.date === selectedDate
  );

  if (dayBlocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <Lock
          size={30}
          className="mx-auto text-slate-300"
        />

        <p className="mt-3 font-semibold text-slate-700">
          Nenhum bloqueio para esta data
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Todos os períodos cadastrados estão disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dayBlocks.map((block) => {
        const config =
          getBlockConfig(
            block.type
          );

        const Icon = config.icon;

        return (
          <div
            key={block.id}
            className={`rounded-2xl border p-4 ${config.className}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                  <Icon size={19} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {block.type}
                    </p>

                    <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold">
                      {block.startTime} às{" "}
                      {block.endTime}
                    </span>
                  </div>

                  <p className="mt-1 text-sm opacity-80">
                    {block.professional}
                  </p>

                  <p className="mt-2 text-sm">
                    {block.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getBlockConfig(
  type: BlockType
) {
  switch (type) {
    case "Almoço":
      return {
        icon: Coffee,
        className:
          "border-amber-200 bg-amber-50 text-amber-800",
      };

    case "Reunião":
      return {
        icon: Users,
        className:
          "border-blue-200 bg-blue-50 text-blue-800",
      };

    case "Férias":
      return {
        icon: Palmtree,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
      };

    default:
      return {
        icon: Lock,
        className:
          "border-slate-200 bg-slate-100 text-slate-700",
      };
  }
}