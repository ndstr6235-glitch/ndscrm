"use client";

import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { fmtCZK } from "@/lib/utils";
import { createPayment } from "@/app/actions/clients";

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
}

export default function PaymentForm({
  open,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: PaymentFormProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState("");
  const [duration, setDuration] = useState("12");
  const [payoutFrequency, setPayoutFrequency] = useState("monthly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankAccount, setBankAccount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const percentNum = parseFloat(percent) || 0;
  const profit = (amountNum * percentNum) / 100;
  const monthlyPayout =
    amountNum > 0 && percentNum > 0
      ? payoutFrequency === "monthly"
        ? (amountNum * (percentNum / 100)) / 12
        : (amountNum * (percentNum / 100)) / 4
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (amountNum <= 0) {
      setError("Částka musí být větší než 0");
      return;
    }
    if (percentNum < 0 || percentNum > 100) {
      setError("Procento musí být 0–100");
      return;
    }

    setSubmitting(true);

    const result = await createPayment({
      clientId,
      amount: amountNum,
      percent: percentNum,
      duration: parseInt(duration),
      payoutFrequency,
      date,
      note,
      bankAccount,
    });

    setSubmitting(false);

    if (result.success) {
      toast("Platba přidána");
      setAmount("");
      setPercent("");
      setDuration("12");
      setPayoutFrequency("monthly");
      setNote("");
      setBankAccount("");
      onSuccess();
      onClose();
    } else {
      toast(result.error || "Nepodařilo se uložit", "error");
      setError(result.error || "Nastala chyba");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Platba — ${clientName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Částka (Kč) *
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500000"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Percent */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Procento výdělku (%) *
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step="any"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="10"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Doba trvání smlouvy
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          >
            <option value="6">6 měsíců</option>
            <option value="12">12 měsíců</option>
            <option value="24">24 měsíců</option>
            <option value="36">36 měsíců</option>
          </select>
        </div>

        {/* Payout Frequency */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Frekvence výplaty
          </label>
          <select
            value={payoutFrequency}
            onChange={(e) => setPayoutFrequency(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          >
            <option value="monthly">Měsíčně</option>
            <option value="quarterly">Čtvrtletně</option>
          </select>
        </div>

        {/* Monthly Payout (auto-calculated, read-only) */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            {payoutFrequency === "monthly" ? "Měsíční výplata" : "Čtvrtletní výplata"}
          </label>
          <input
            type="text"
            value={monthlyPayout > 0 ? fmtCZK(monthlyPayout) : "—"}
            readOnly
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface/50 text-sm text-text-mid font-medium cursor-default focus:outline-none"
          />
        </div>

        {/* Live profit preview */}
        {amountNum > 0 && percentNum > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-[10px] bg-emerald-pale border border-emerald-border">
            <TrendingUp size={18} className="text-emerald shrink-0" />
            <div>
              <span className="text-xs text-emerald/70">Váš výdělek:</span>
              <p className="text-base font-bold text-emerald">
                {fmtCZK(profit)}
              </p>
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Datum vkladu (kdy klient zaplatil)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>

        {/* Bank account */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Číslo účtu klienta (kam posílat úroky)
          </label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="např. 123456789/0300"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Poznámka
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-ruby bg-ruby-pale border border-ruby-border rounded-[8px] px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-emerald text-white text-sm font-semibold hover:bg-emerald/90 transition-colors disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Přidat platbu
        </button>
      </form>
    </Modal>
  );
}
