import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({
  title,
  children,
}: SectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>

      {children}
    </div>
  );
}