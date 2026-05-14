"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabId = "conteudo" | "informacoes";

const TABS: { id: TabId; label: string }[] = [
  { id: "conteudo", label: "Conteúdo" },
  { id: "informacoes", label: "Informações" },
];

export function CareerDetailTabs({
  conteudo,
  informacoes,
}: {
  conteudo: ReactNode;
  informacoes: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("conteudo");

  return (
    <div className="w-full min-w-0">
      <div
        role="tablist"
        aria-label="Seções da carreira"
        className="flex items-center gap-1 border-b border-[#25252A]"
      >
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`career-tab-${t.id}`}
              aria-selected={isActive}
              aria-controls={`career-panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative px-4 py-3 text-sm transition-colors",
                isActive
                  ? "font-semibold text-white"
                  : "font-medium text-[#C4C4CC] hover:text-white/90",
              )}
            >
              {t.label}
              {isActive ? (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-gradient-500"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="career-panel-conteudo"
        aria-labelledby="career-tab-conteudo"
        hidden={active !== "conteudo"}
        className="mt-4 min-w-0"
      >
        {conteudo}
      </div>
      <div
        role="tabpanel"
        id="career-panel-informacoes"
        aria-labelledby="career-tab-informacoes"
        hidden={active !== "informacoes"}
        className="mt-4 min-w-0"
      >
        {informacoes}
      </div>
    </div>
  );
}
