export interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({
  className = "",
}: LoadingCardProps) {
  return (
    <div
      className={`h-36 animate-pulse rounded-2xl bg-slate-200 ${className}`}
    />
  );
}
