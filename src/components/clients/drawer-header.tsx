"use client";

import { X, Landmark, TrendingUp, Percent } from "lucide-react";
import { fmtCZK } from "@/lib/utils";
import { SCORE_META } from "@/lib/constants";
import ClientStatusBadge from "./client-status-badge";
import type { ClientDetail } from "@/app/actions/clients";

interface DrawerHeaderProps {
  client: ClientDetail;
  onClose: () => void;
}

export default function DrawerHeader({ client, onClose }: DrawerHeaderProps) {
  const initials = `${client.firstName[0]}${client.lastName[0]}`;

  return (
    <div className="bg-gradient-to-br from-sidebar to-[#1a1d28] px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-6 shrink-0">
      {/* Top row: avatar + info + close */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-bold text-white truncate">
            {client.firstName} {client.lastName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {SCORE_META[client.score] && (
              <span
                className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: SCORE_META[client.score].pale,
                  color: SCORE_META[client.score].color,
                }}
              >
                {client.score}
              </span>
            )}
            <ClientStatusBadge isInvestor={client.isInvestor} />
            <span className="text-xs text-white/50">{client.brokerName}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Zavřít"
        >
          <X size={18} />
        </button>
      </div>

      {/* KPI row */}
      <div className="flex gap-3 mt-4 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex-1 min-w-[100px] bg-white/[0.06] rounded-[10px] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Landmark size={12} className="text-emerald" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Vklad
            </span>
          </div>
          <p className="text-sm font-semibold text-emerald">
            {fmtCZK(client.totalDeposit)}
          </p>
        </div>
        <div className="flex-1 min-w-[100px] bg-white/[0.06] rounded-[10px] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-gold" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Výdělek
            </span>
          </div>
          <p className="text-sm font-semibold text-gold">
            {fmtCZK(client.totalProfit)}
          </p>
        </div>
        <div className="flex-1 min-w-[100px] bg-white/[0.06] rounded-[10px] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Percent size={12} className="text-sapphire" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Průměr %
            </span>
          </div>
          <p className="text-sm font-semibold text-sapphire">
            {client.avgPercent}%
          </p>
        </div>
      </div>
    </div>
  );
}
