"use client";

import { cn } from "@/lib/utils";

type Tab = "overview" | "payments" | "events" | "email" | "history" | "documents";

interface DrawerTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  paymentCount: number;
  eventCount: number;
  showDocuments?: boolean;
}

const TABS: { key: Tab; label: string; countKey?: "paymentCount" | "eventCount"; requireDocuments?: boolean }[] = [
  { key: "overview", label: "Přehled" },
  { key: "payments", label: "Platby", countKey: "paymentCount" },
  { key: "events", label: "Události", countKey: "eventCount" },
  { key: "email", label: "Email" },
  { key: "documents", label: "Dokumenty", requireDocuments: true },
  { key: "history", label: "Historie" },
];

export default function DrawerTabs({
  activeTab,
  onTabChange,
  paymentCount,
  eventCount,
  showDocuments = false,
}: DrawerTabsProps) {
  const counts = { paymentCount, eventCount };
  const visibleTabs = TABS.filter((tab) => !tab.requireDocuments || showDocuments);

  return (
    <div className="border-b border-border overflow-x-auto shrink-0 snap-x snap-mandatory scrollbar-none">
      <div className="flex min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.countKey ? counts[tab.countKey] : null;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "px-4 py-3 min-h-[44px] text-sm font-medium whitespace-nowrap transition-colors relative snap-start",
                isActive
                  ? "text-gold font-semibold"
                  : "text-text-mid hover:text-text"
              )}
            >
              {tab.label}
              {count !== null && (
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    isActive ? "text-gold/70" : "text-text-dim"
                  )}
                >
                  ({count})
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
