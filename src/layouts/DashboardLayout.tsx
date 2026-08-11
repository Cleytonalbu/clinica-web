import type {
  ReactNode,
} from "react";

import {
  Header,
} from "./Header";

import {
  Sidebar,
} from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7FC]">
      {/* SIDEBAR */}

      <Sidebar />

      {/* ÁREA PRINCIPAL */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <Header />

        {/* CONTEÚDO */}

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F7F7FC]">
          <div className="px-8 py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}