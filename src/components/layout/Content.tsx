import type { ReactNode } from "react";

interface ContentProps {
  children: ReactNode;
}

export function Content({
  children,
}: ContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-100">
      <div className="mx-auto h-full w-full max-w-[1600px] p-6">
        {children}
      </div>
    </main>
  );
}