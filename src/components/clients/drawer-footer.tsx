"use client";

import { Mail, CreditCard, CalendarPlus } from "lucide-react";

type Tab = "overview" | "payments" | "events" | "email";

interface DrawerFooterProps {
  onSwitchTab: (tab: Tab) => void;
}

export default function DrawerFooter({ onSwitchTab }: DrawerFooterProps) {
  return (
    <div className="border-t border-border px-4 py-3 shrink-0 bg-surface">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          onClick={() => onSwitchTab("email")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Mail size={16} />
          Email
        </button>
        <button
          onClick={() => onSwitchTab("payments")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] bg-emerald text-white text-sm font-semibold hover:bg-emerald/90 transition-colors"
        >
          <CreditCard size={16} />
          Platba
        </button>
        <button
          onClick={() => onSwitchTab("events")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          <CalendarPlus size={16} />
          Událost
        </button>
      </div>
    </div>
  );
}
