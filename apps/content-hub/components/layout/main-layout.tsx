"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0c0c0d]">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0c0c0d]">
        {/* Topbar mobile */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-[#25252a] dark:bg-[#0c0c0d] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 transition-colors hover:bg-gray-100 dark:border-[#25252a] dark:bg-[#101013] dark:text-gray-100 dark:hover:bg-[#1a1a1e]"
            aria-label={mobileSidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Code Legends
          </span>

          {/* placeholder para manter alinhamento */}
          <div className="h-10 w-10" aria-hidden />
        </div>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

