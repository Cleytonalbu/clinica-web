import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function StatsCard({
  title,
  value,
  icon,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h2>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}