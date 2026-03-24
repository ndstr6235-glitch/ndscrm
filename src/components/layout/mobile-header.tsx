"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

interface MobileHeaderProps {
  firstName: string;
  lastName: string;
}

export default function MobileHeader({ firstName, lastName }: MobileHeaderProps) {
  const { toggleMobileOpen } = useSidebar();
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-surface border-b border-border shadow-card">
      <button
        onClick={toggleMobileOpen}
        className="w-11 h-11 flex items-center justify-center rounded-[8px] hover:bg-surface-hover transition-colors"
        aria-label="Menu"
      >
        <Menu size={20} className="text-text" />
      </button>

      <span className="font-display text-sm font-bold text-text">
        Build Fund CRM
      </span>

      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
        {initials}
      </div>
    </header>
  );
}
