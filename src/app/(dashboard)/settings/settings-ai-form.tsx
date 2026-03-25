"use client";

import { Check, AlertTriangle } from "lucide-react";

interface Props {
  hasKey: boolean;
}

export function SettingsAIForm({ hasKey }: Props) {
  return (
    <div className="space-y-3">
      {hasKey ? (
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-emerald-pale border border-emerald-border">
          <Check size={16} className="text-emerald shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald">Google Gemini je aktivní</p>
            <p className="text-xs text-emerald/70">Model: gemini-2.0-flash</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-amber-pale border border-gold-border">
          <AlertTriangle size={16} className="text-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gold">AI není aktivní</p>
            <p className="text-xs text-gold/70 mt-0.5">
              Chybí GEMINI_API_KEY v environment variables.
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-text-dim">
        AI klíč se nastavuje jako environment variable <code className="text-sapphire">GEMINI_API_KEY</code> na serveru (Vercel).
        Klíč získáte na{" "}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-sapphire hover:underline">
          aistudio.google.com/apikey
        </a>
        . Používá se model gemini-2.0-flash.
      </p>
    </div>
  );
}
