import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-3xl bg-white p-12 shadow-xl">
      {children}
    </div>
  );
}
