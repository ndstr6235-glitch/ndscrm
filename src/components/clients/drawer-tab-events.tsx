"use client";

import { Plus, X } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import type { ClientDetail } from "@/app/actions/clients";
import type { EventType } from "@/lib/types";

interface DrawerTabEventsProps {
  client: ClientDetail;
}

export default function DrawerTabEvents({ client }: DrawerTabEventsProps) {
  const { events } = client;
  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- will use eventId in TASK-008 server action
  function handleDelete(eventId: string) {
    if (confirm("Opravdu chcete smazat tuto událost?")) {
      // Delete will be implemented with server actions in TASK-008
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-dim">Žádné události</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => {
            const eventMeta = EVENT_TYPES[e.type as EventType];
            const isPast = e.date < today;

            return (
              <div
                key={e.id}
                className={cn(
                  "flex items-start gap-3 bg-surface-hover rounded-[10px] p-3 relative group",
                  isPast && "opacity-55"
                )}
              >
                {/* Event type indicator */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{
                    backgroundColor: eventMeta?.pale || "#f0f2f7",
                    color: eventMeta?.color || "#4a5578",
                  }}
                >
                  {eventMeta?.icon || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      {e.title}
                    </span>
                    <span className="text-xs text-text-dim shrink-0">
                      {e.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-dim">
                      {fmtDate(e.date)}
                    </span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: eventMeta?.pale || "#f0f2f7",
                        color: eventMeta?.color || "#4a5578",
                      }}
                    >
                      {eventMeta?.label || e.type}
                    </span>
                    {isPast && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-text-dim/10 text-text-dim">
                        Proběhlo
                      </span>
                    )}
                  </div>
                  {e.note && (
                    <p className="text-xs text-text-dim mt-1">{e.note}</p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(e.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-text-faint hover:text-ruby hover:bg-ruby/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Smazat událost"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add event button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover transition-colors">
        <Plus size={16} />
        Přidat událost
      </button>
    </div>
  );
}
