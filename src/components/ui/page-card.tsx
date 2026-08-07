import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  actions?: ReactNode;
}

export function PageCard({
  title,
  description,
  children,
  className,
  contentClassName,
  actions,
}: PageCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </header>

      <div
        className={cn(
          "p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}