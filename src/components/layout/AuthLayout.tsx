import type { ReactNode } from "react";

interface AuthLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function AuthLayout({
  left,
  right,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        <section className="hidden lg:flex items-center justify-center p-16">
          {left}
        </section>

        <section className="flex items-center justify-center p-8 lg:p-16">
          {right}
        </section>
      </div>
    </main>
  );
}
