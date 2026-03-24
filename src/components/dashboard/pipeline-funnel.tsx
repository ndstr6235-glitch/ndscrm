"use client";

import { PIPELINE_STAGES } from "@/lib/constants";

interface Props {
  counts: Record<string, number>;
}

export default function PipelineFunnel({ counts }: Props) {
  const total = Object.values(counts).reduce((s, c) => s + c, 0);
  if (total === 0) return null;

  return (
    <div className="bg-surface rounded-[16px] border border-border p-4 md:p-6 transition-colors duration-200">
      <h3 className="font-display text-sm md:text-base font-bold text-text mb-4">
        Pipeline
      </h3>
      <div className="space-y-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = counts[stage.key] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="text-xs text-text-mid w-24 shrink-0 truncate">
                {stage.label}
              </span>
              <div className="flex-1 h-5 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-text w-6 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
