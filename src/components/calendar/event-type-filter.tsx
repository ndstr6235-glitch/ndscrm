"use client";

import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { EventType } from "@/lib/types";
import type { CalendarEvent } from "@/app/actions/calendar";

interface EventTypeFilterProps {
  events: CalendarEvent[];
  activeTypes: Set<string>;
  onToggle: (type: string) => void;
}

const ALL_TYPES: EventType[] = ["call", "payment", "reminder", "interest", "meeting"];

export default function EventTypeFilter({
  events,
  activeTypes,
  onToggle,
}: EventTypeFilterProps) {
  // Count events per type
  const counts = new Map<string, number>();
  for (const e of events) {
    counts.set(e.type, (counts.get(e.type) || 0) + 1);
  }

  return (
    <>
      {/* Desktop: vertical list */}
      <div className="hidden lg:block space-y-1">
        {ALL_TYPES.map((type) => {
          const meta = EVENT_TYPES[type];
          const count = counts.get(type) || 0;
          const isActive = activeTypes.has(type);

          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm transition-colors text-left",
                isActive
                  ? "bg-surface-hover font-medium text-text"
                  : "text-text-dim hover:text-text-mid hover:bg-surface-hover/50"
              )}
            >
              <span className="text-base">{meta.icon}</span>
              <span className="flex-1">{meta.label}</span>
              <span className="text-xs text-text-dim">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: horizontal pill bar */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {ALL_TYPES.map((type) => {
          const meta = EVENT_TYPES[type];
          const count = counts.get(type) || 0;
          const isActive = activeTypes.has(type);

          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                isActive
                  ? "text-white"
                  : "bg-surface-hover text-text-mid"
              )}
              style={
                isActive
                  ? { backgroundColor: meta.color }
                  : undefined
              }
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className={cn(
                "text-[10px]",
                isActive ? "text-white/70" : "text-text-dim"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
