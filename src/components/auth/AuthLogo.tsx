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
        <section className="hidden lg:block lg:w-[58%] xl:w-[60%]">
          {left}
        </section>

        <section className="flex h-full w-full items-center justify-center bg-white lg:w-[42%] xl:w-[40%]">
          {right}
        </section>
      </div>
    </main>
  );
}