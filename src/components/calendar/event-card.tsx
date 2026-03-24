"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { CalendarEvent } from "@/app/actions/calendar";
import type { EventType } from "@/lib/types";

interface EventCardProps {
  event: CalendarEvent;
  isPast: boolean;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, isPast, onDelete }: EventCardProps) {
  const meta = EVENT_TYPES[event.type as EventType];

  function handleDelete() {
    if (confirm(`Smazat událost "${event.title}"?`)) {
      onDelete(event.id);
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-[12px] bg-surface border transition-colors group",
        isPast ? "opacity-55" : ""
      )}
      style={{ borderLeftColor: meta?.color || "#e4e8f0", borderLeftWidth: 3 }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{
          backgroundColor: meta?.pale || "#f0f2f7",
          color: meta?.color || "#4a5578",
        }}
      >
        {meta?.icon || "?"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text truncate">
            {event.title}
          </span>
          {isPast && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-text-dim/10 text-text-dim shrink-0">
              Proběhlo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium" style={{ color: meta?.color }}>
            {event.time}
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: meta?.pale || "#f0f2f7",
              color: meta?.color || "#4a5578",
            }}
          >
            {meta?.label || event.type}
          </span>
        </div>
        {event.clientName && (
          <p className="text-xs text-text-mid mt-1">{event.clientName}</p>
        )}
        {event.note && (
          <p className="text-xs text-text-dim mt-1">{event.note}</p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-faint hover:text-ruby hover:bg-ruby/10 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Smazat"
      >
        <X size={14} />
      </button>
    </div>
  );
}
