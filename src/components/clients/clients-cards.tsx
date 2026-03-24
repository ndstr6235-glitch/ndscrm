"use client";

import { useRef, useCallback } from "react";
import { Phone, Mail, ChevronRight, Check } from "lucide-react";
import { fmtCZK, cn } from "@/lib/utils";
import { SCORE_META } from "@/lib/constants";
import ClientStatusBadge from "./client-status-badge";
import type { ClientRow } from "./clients-page-client";

interface ClientsCardsProps {
  clients: ClientRow[];
  isBroker: boolean;
  onClientClick: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  selectMode?: boolean;
  onEnterSelectMode?: (id: string) => void;
  showCheckboxes?: boolean;
}

export default function ClientsCards({
  clients,
  isBroker,
  onClientClick,
  selectedIds,
  onToggleSelect,
  selectMode = false,
  onEnterSelectMode,
  showCheckboxes = false,
}: ClientsCardsProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handleTouchStart = useCallback(
    (id: string) => {
      if (!showCheckboxes || selectMode) return;
      longPressTriggered.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onEnterSelectMode?.(id);
      }, 500);
    },
    [showCheckboxes, selectMode, onEnterSelectMode]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  function handleCardClick(id: string) {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    if (selectMode) {
      onToggleSelect?.(id);
    } else {
      onClientClick(id);
    }
  }

  return (
    <div className="md:hidden space-y-3">
      {clients.map((client) => {
        const initials = `${client.firstName[0]}${client.lastName[0]}`;
        const isSelected = selectedIds?.has(client.id) ?? false;
        return (
          <div
            key={client.id}
            onClick={() => handleCardClick(client.id)}
            onTouchStart={() => handleTouchStart(client.id)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={cn(
              "bg-surface rounded-[16px] border border-border shadow-card p-4 active:bg-surface-hover transition-colors cursor-pointer relative",
              isSelected && "border-gold bg-gold-pale/20"
            )}
          >
            {/* Selection indicator */}
            {selectMode && (
              <div
                className={cn(
                  "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-gold border-gold"
                    : "border-border bg-surface"
                )}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </div>
            )}

            {/* Top row: Avatar + Name + Status */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text truncate">
                    {client.firstName} {client.lastName}
                  </span>
                  {SCORE_META[client.score as keyof typeof SCORE_META] && (
                    <span
                      className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: SCORE_META[client.score as keyof typeof SCORE_META].pale,
                        color: SCORE_META[client.score as keyof typeof SCORE_META].color,
                      }}
                    >
                      {client.score}
                    </span>
                  )}
                  <ClientStatusBadge isInvestor={client.isInvestor} />
                </div>
                {!isBroker && (
                  <p className="text-xs text-text-dim mt-0.5">
                    {client.brokerName}
                  </p>
                )}
              </div>
              {!selectMode && (
                <ChevronRight size={16} className="text-text-faint shrink-0" />
              )}
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-1.5 mb-3 text-sm text-text-mid">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-text-dim shrink-0" />
                <span className="truncate">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-text-dim shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
            </div>

            {/* Financial info */}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-text-dim">
                  Vklad
                </p>
                <p className="text-sm font-semibold text-text">
                  {fmtCZK(client.totalDeposit)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-text-dim">
                  Výdělek
                </p>
                <p className="text-sm font-semibold text-emerald">
                  {fmtCZK(client.totalProfit)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
