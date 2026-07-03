"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

type TabIndicatorStyle = {
  left: number;
  width: number;
};

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [indicator, setIndicator] = useState<TabIndicatorStyle>({
    left: 0,
    width: 0,
  });
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;
    const button = activeTab ? tabRefs.current.get(activeTab) : undefined;
    if (!nav || !button) return;

    const navRect = nav.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    setIndicator({
      left: buttonRect.left - navRect.left + nav.scrollLeft,
      width: buttonRect.width,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();

    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateIndicator);
      return () => window.removeEventListener("resize", updateIndicator);
    }

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);
    for (const button of tabRefs.current.values()) {
      observer.observe(button);
    }

    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator, tabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full">
      <div
        ref={navRef}
        className="relative mb-4 flex items-center gap-1 border-b border-[#25252A]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(element) => {
              if (element) tabRefs.current.set(tab.id, element);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={[
              "relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? "text-white"
                : "text-[#C4C4CC] hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 bg-blue-gradient-500 transition-[transform,width] duration-300 ease-out"
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
      </div>

      {activeTabData?.content && (
        <div className="mt-4">{activeTabData.content}</div>
      )}
    </div>
  );
}
