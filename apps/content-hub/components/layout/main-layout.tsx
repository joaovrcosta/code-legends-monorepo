"use client";

import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121214]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121214]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

