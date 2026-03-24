"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Potvrdit",
  destructive = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative z-10 bg-surface rounded-[16px] shadow-lg max-w-sm w-full p-6"
        style={{ animation: "fade-in 0.15s ease-out" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-ruby/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-ruby" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-text">
              {title}
            </h3>
            <p className="text-sm text-text-mid mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[44px] rounded-[10px] border border-border text-sm font-medium text-text-mid hover:bg-surface-hover transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 min-h-[44px] rounded-[10px] text-sm font-semibold text-white transition-colors ${
              destructive
                ? "bg-ruby hover:bg-ruby/90"
                : "bg-gold hover:bg-gold/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
