"use client";

import { Plus } from "lucide-react";
import { fmtCZK, fmtDate } from "@/lib/utils";
import type { ClientDetail } from "@/app/actions/clients";

interface DrawerTabPaymentsProps {
  client: ClientDetail;
  onAddPayment: () => void;
}

export default function DrawerTabPayments({
  client,
  onAddPayment,
}: DrawerTabPaymentsProps) {
  const { payments, totalDeposit, totalProfit } = client;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Totals */}
      <div className="flex gap-3">
        <div className="flex-1 bg-emerald-pale rounded-[10px] p-3 border border-emerald-border">
          <span className="text-[10px] uppercase tracking-wider text-emerald/70">
            Celkový vklad
          </span>
          <p className="text-sm font-semibold text-emerald mt-0.5">
            {fmtCZK(totalDeposit)}
          </p>
        </div>
        <div className="flex-1 bg-gold-pale rounded-[10px] p-3 border border-gold-border">
          <span className="text-[10px] uppercase tracking-wider text-gold/70">
            Celkový výdělek
          </span>
          <p className="text-sm font-semibold text-gold mt-0.5">
            {fmtCZK(totalProfit)}
          </p>
        </div>
      </div>

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-dim">Žádné platby</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-surface-hover rounded-[10px] p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">
                  {fmtDate(p.date)}
                </span>
                <span className="text-xs font-medium text-gold">
                  {p.percent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text">
                  {fmtCZK(p.amount)}
                </span>
                <span className="text-sm font-medium text-emerald">
                  +{fmtCZK(p.profit)}
                </span>
              </div>
              {p.note && (
                <p className="text-xs text-text-dim">{p.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add payment button */}
      <button
        onClick={onAddPayment}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-emerald/10 text-emerald text-sm font-medium hover:bg-emerald/20 transition-colors"
      >
        <Plus size={16} />
        Přidat platbu
      </button>
    </div>
  );
}
