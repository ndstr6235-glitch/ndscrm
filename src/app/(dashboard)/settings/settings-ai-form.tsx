"use client";

import { useState, useTransition } from "react";
import { Key, Check, Trash2, Loader2 } from "lucide-react";
import { updateSystemSetting, deleteSystemSetting } from "@/app/actions/settings";
import { useToast } from "@/components/ui/toast";

interface Props {
  currentKey: string;
}

export function SettingsAIForm({ currentKey }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const hasKey = !!currentKey;

  const handleSave = () => {
    if (!apiKey.startsWith("sk-")) {
      toast.toast("API klíč musí začínat 'sk-'", "error");
      return;
    }
    startTransition(async () => {
      const result = await updateSystemSetting("openai_api_key", apiKey);
      if (result.error) {
        toast.toast(result.error, "error");
      } else {
        toast.toast("OpenAI API klíč uložen");
        setApiKey("");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSystemSetting("openai_api_key");
      if (result.error) {
        toast.toast(result.error, "error");
      } else {
        toast.toast("API klíč odstraněn");
      }
    });
  };

  return (
    <div className="space-y-3">
      {hasKey ? (
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-emerald-pale border border-emerald-border">
          <Check size={16} className="text-emerald shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald">API klíč nastaven</p>
            <p className="text-xs text-emerald/70 font-mono">{currentKey}</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-ruby/60 hover:text-ruby transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Odstranit klíč"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-[10px] bg-amber-pale border border-gold-border">
          <p className="text-sm text-gold font-medium">AI není aktivní</p>
          <p className="text-xs text-gold/70 mt-0.5">
            Zadejte OpenAI API klíč pro aktivaci AI asistenta v emailech.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || !apiKey}
          className="px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white font-semibold text-sm min-h-[44px] hover:shadow-md transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : "Uložit"}
        </button>
      </div>

      <p className="text-xs text-text-dim">
        Klíč získáte na{" "}
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-sapphire hover:underline">
          platform.openai.com
        </a>
        . Používá se model gpt-4o-mini.
      </p>
    </div>
  );
}
