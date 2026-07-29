import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
  className?: string;
}

const colors = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
};

export function Badge({
  children,
  color = "blue",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}