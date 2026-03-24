"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getClientActivities, type ActivityRow } from "@/app/actions/activity";
import { ACTIVITY_ICONS } from "@/lib/constants";

interface DrawerTabHistoryProps {
  clientId: string;
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "právě teď";
  if (minutes < 60) return `před ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `před ${hours} hod`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `před ${days} dny`;

  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DrawerTabHistory({ clientId }: DrawerTabHistoryProps) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const data = await getClientActivities(clientId, 20, 0);
    setActivities(data.activities);
    setHasMore(data.hasMore);
    setLoading(false);
  }, [clientId]);

  /* eslint-disable react-hooks/set-state-in-effect -- data fetch on mount/clientId change */
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function loadMore() {
    setLoadingMore(true);
    const data = await getClientActivities(clientId, 20, activities.length);
    setActivities((prev) => [...prev, ...data.activities]);
    setHasMore(data.hasMore);
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-gold" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
          <span className="text-lg">📋</span>
        </div>
        <h3 className="font-display text-sm font-semibold text-text mb-1">
          Žádná historie
        </h3>
        <p className="text-xs text-text-dim">
          Zatím nebyly zaznamenány žádné aktivity
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-5">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0">
          {activities.map((activity, i) => {
            const icon =
              ACTIVITY_ICONS[activity.type] || "📌";

            return (
              <div
                key={activity.id}
                className={cn(
                  "relative flex gap-3 py-3",
                  i === 0 ? "stagger-item" : ""
                )}
              >
                {/* Dot */}
                <div className="relative z-10 w-[30px] h-[30px] shrink-0 rounded-full bg-surface border-2 border-border flex items-center justify-center text-xs">
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-text leading-snug">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-text-dim">
                      {activity.userName}
                    </span>
                    <span className="text-[11px] text-text-faint">
                      {relativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[36px] rounded-[8px] text-xs font-medium text-text-mid hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ChevronDown size={14} />
            )}
            Zobrazit starší
          </button>
        </div>
      )}
    </div>
  );
}
