import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-white transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {/* Barra superior */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <div className="mt-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp size={14} />
              +12%
            </span>

            <span className="text-xs text-slate-500">
              em relação ao mês anterior
            </span>
          </div>
        </div>

        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-blue-600
            to-cyan-500
            text-white
            shadow-lg
            transition-transform
            duration-300
            group-hover:scale-110
            group-hover:rotate-3
          "
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}