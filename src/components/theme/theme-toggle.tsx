"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  variant?: "sidebar" | "header";
  collapsed?: boolean;
}

export default function ThemeToggle({ variant = "sidebar", collapsed }: ThemeToggleProps) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  if (variant === "header") {
    return (
      <button
        onClick={toggle}
        className="w-11 h-11 flex items-center justify-center rounded-[8px] hover:bg-surface-hover transition-colors"
        aria-label={isDark ? "Světlý režim" : "Tmavý režim"}
      >
        {isDark ? (
          <Sun size={18} className="text-gold" />
        ) : (
          <Moon size={18} className="text-text-dim" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all text-sm"
      aria-label={isDark ? "Světlý režim" : "Tmavý režim"}
    >
      {isDark ? (
        <Sun size={16} className="shrink-0" />
      ) : (
        <Moon size={16} className="shrink-0" />
      )}
      {!collapsed && (
        <span className="whitespace-nowrap">{isDark ? "Světlý režim" : "Tmavý režim"}</span>
      )}
    </button>
  );
}
