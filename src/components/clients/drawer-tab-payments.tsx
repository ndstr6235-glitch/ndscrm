"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X, Landmark } from "lucide-react";
import { fmtCZK, fmtDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updatePaymentBankAccount } from "@/app/actions/clients";
import type { ClientDetail } from "@/app/actions/clients";

interface DrawerTabPaymentsProps {
  client: ClientDetail;
  onAddPayment: () => void;
  onRefresh?: () => void;
}

// Extract "[Účet: XXX]" marker from note → { bank, restOfNote }
function parseNote(note: string): { bank: string; rest: string } {
  const match = note.match(/^\[Účet:\s*([^\]]+)\]\s*(.*)$/);
  if (match) return { bank: match[1].trim(), rest: match[2].trim() };
  return { bank: "", rest: note };
}

export default function DrawerTabPayments({
  client,
  onAddPayment,
  onRefresh,
}: DrawerTabPaymentsProps) {
  const { payments, totalDeposit, totalProfit } = client;
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(paymentId: string, currentBank: string) {
    setEditingId(paymentId);
    setEditValue(currentBank);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveEdit(paymentId: string) {
    setSaving(true);
    const result = await updatePaymentBankAccount(paymentId, editValue);
    setSaving(false);
    if (result.success) {
      toast("Účet uložen");
      setEditingId(null);
      setEditValue("");
      onRefresh?.();
    } else {
      toast(result.error || "Nepodařilo se uložit", "error");
    }
  }

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
          {payments.map((p) => {
            const { bank, rest } = parseNote(p.note);
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className="bg-surface-hover rounded-[10px] p-3 space-y-2"
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

                {/* Bank account row — inline edit */}
                <div className="flex items-center gap-2 pt-1.5 border-t border-border">
                  <Landmark size={12} className="text-text-dim shrink-0" />
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="123456789/0300"
                        autoFocus
                        className="flex-1 min-w-0 px-2 py-1 rounded-[6px] border border-border bg-surface text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                      />
                      <button
                        onClick={() => saveEdit(p.id)}
                        disabled={saving}
                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-emerald text-white hover:bg-emerald/90 disabled:opacity-50"
                        title="Uložit"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-surface text-text-dim hover:bg-surface-hover"
                        title="Zrušit"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 text-xs text-text-mid truncate">
                        {bank ? (
                          <>Účet: <span className="font-medium text-text">{bank}</span></>
                        ) : (
                          <span className="text-text-faint italic">Účet nezadán</span>
                        )}
                      </span>
                      <button
                        onClick={() => startEdit(p.id, bank)}
                        className="text-xs text-gold hover:underline flex items-center gap-1"
                      >
                        <Pencil size={11} />
                        {bank ? "Upravit" : "Doplnit"}
                      </button>
                    </>
                  )}
                </div>

                {rest && (
                  <p className="text-xs text-text-dim">{rest}</p>
                )}
              </div>
            );
          })}
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
