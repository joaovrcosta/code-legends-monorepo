"use client";

import { useState } from "react";

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

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-[#25252A] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-[#C4C4CC] hover:text-white"
              }
            `}
          >
            {tab.label}
            {/* Active Indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-gradient-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabData?.content && (
        <div className="mt-4">{activeTabData.content}</div>
      )}
    </div>
  );
}
