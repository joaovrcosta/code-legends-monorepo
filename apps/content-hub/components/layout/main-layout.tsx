"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { WorkspaceTabsBar } from "./workspace-tabs-bar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-ch-canvas">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex flex-1 flex-col overflow-y-auto bg-ch-canvas">
          <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-ch-border bg-ch-canvas px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-ch border border-ch-border bg-ch-surface text-ch transition-colors hover:bg-ch-surface-raised"
              )}
              aria-label={mobileSidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <span className="text-sm font-semibold text-ch">Code Legends</span>

            <div className="h-10 w-10" aria-hidden />
          </div>

          <WorkspaceTabsBar />

          <div className={cn("flex-1 p-6 lg:p-8", ch.page)}>
            {children}
          </div>
        </main>
      </div>
  );
}
