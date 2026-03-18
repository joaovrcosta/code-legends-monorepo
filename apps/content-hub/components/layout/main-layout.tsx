"use client";

import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0c0c0d]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0c0c0d]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

