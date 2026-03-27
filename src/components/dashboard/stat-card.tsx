import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ACCENT = {
  sapphire: { border: "border-sapphire", bg: "bg-sapphire-pale", text: "text-sapphire" },
  emerald: { border: "border-emerald", bg: "bg-emerald-pale", text: "text-emerald" },
  gold: { border: "border-gold", bg: "bg-gold-pale", text: "text-gold" },
  amber: { border: "border-amber", bg: "bg-amber-pale", text: "text-amber" },
} as const;

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accentColor: keyof typeof ACCENT;
  icon: ReactNode;
}

export default function StatCard({
  label,
  value,
  subtitle,
  accentColor,
  icon,
}: StatCardProps) {
  const accent = ACCENT[accentColor];

  return (
    <div
      className={cn(
        "bg-surface rounded-[12px] sm:rounded-[16px] shadow-card border-l-4 p-3 sm:p-3.5 md:p-4 lg:p-5",
        accent.border
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs md:text-sm font-medium text-text-mid">
          {label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-[8px] flex items-center justify-center",
            accent.bg
          )}
        >
          <span className={accent.text}>{icon}</span>
        </div>
      </div>
      <p className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-text truncate">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] md:text-xs text-text-dim mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
