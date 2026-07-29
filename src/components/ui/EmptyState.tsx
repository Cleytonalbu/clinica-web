export interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({
  message,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 ${className}`}
    >
      <p className="text-slate-500">{message}</p>
    </div>
  );
}