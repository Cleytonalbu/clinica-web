import type { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Content } from "./Content";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <Content>{children}</Content>
      </div>
    </div>
  );
}