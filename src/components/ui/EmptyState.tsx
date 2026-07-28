interface EmptyStateProps {
  message: string;
}

export function EmptyState({
  message,
}: EmptyStateProps) {
  return (
    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300">
      <p className="text-slate-500">
        {message}
      </p>
    </div>
  );
}