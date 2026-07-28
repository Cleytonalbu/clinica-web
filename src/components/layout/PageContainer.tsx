import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <section className="w-full rounded-3xl bg-white p-8 shadow-sm">
      {children}
    </section>
  );
}