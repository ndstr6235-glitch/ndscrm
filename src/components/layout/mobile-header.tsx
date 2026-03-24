"use client";

import { Menu, Search } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useCommandPalette } from "@/components/ui/command-palette-provider";
import ThemeToggle from "@/components/theme/theme-toggle";
import NotificationBell from "@/components/layout/notification-bell";

interface MobileHeaderProps {
  firstName: string;
  lastName: string;
}

export default function MobileHeader({ firstName, lastName }: MobileHeaderProps) {
  const { toggleMobileOpen } = useSidebar();
  const { open: openSearch } = useCommandPalette();
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

      <div className="flex items-center gap-1">
        <button
          onClick={openSearch}
          className="w-11 h-11 flex items-center justify-center rounded-[8px] hover:bg-surface-hover transition-colors"
          aria-label="Hledat"
        >
          <Search size={18} className="text-text-dim" />
        </button>
        <NotificationBell variant="mobile" />
        <ThemeToggle variant="header" />
        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
          {initials}
        </div>
      </div>
    </header>
  );
}
