import type {
  ReactNode,
} from "react";

import {
  Header,
} from "./Header";

import {
  Sidebar,
} from "./Sidebar";

import {
  BirthdayReminderPopup,
} from "@/components/common/BirthdayReminderPopup";

interface DashboardLayoutProps {
  children:
    ReactNode;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <BirthdayReminderPopup />

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {
              children
            }
          </div>
        </main>
      </div>
    </div>
  );
}