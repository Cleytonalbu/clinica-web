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
    <main className="h-screen overflow-hidden bg-[#F7F8FC]">
      <div className="flex h-full">
        {/* Painel esquerdo */}
        <section className="hidden lg:block lg:w-[55%] xl:w-[56%]">
          {left}
        </section>

        {/* Painel direito */}
        <section className="flex h-full w-full items-center justify-center bg-white lg:w-[45%] xl:w-[44%]">
          {right}
        </section>
      </div>
    </main>
  );
}