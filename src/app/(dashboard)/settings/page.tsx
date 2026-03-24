import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Settings, Shield, ChevronRight, Bot, Key } from "lucide-react";
import Link from "next/link";
import { getSystemSettings } from "@/app/actions/settings";
import { SettingsAIForm } from "./settings-ai-form";

export default async function SettingsRoute() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "administrator") {
    redirect("/dashboard");
  }

  const settings = await getSystemSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">
          Nastavení
        </h1>
        <p className="mt-0.5 text-sm text-text-mid">
          Nastavení systému Build Fund CRM
        </p>
      </div>

      {/* AI konfigurace */}
      <div className="bg-surface rounded-[16px] border border-border shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-sapphire/10 flex items-center justify-center">
            <Bot size={20} className="text-sapphire" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text">AI Asistent</h2>
            <p className="text-xs text-text-dim">
              Generování emailů, oslovení a návrhů pomocí ChatGPT
            </p>
          </div>
        </div>
        <SettingsAIForm currentKey={settings.openai_api_key || ""} />
      </div>

      {/* Systém info */}
      <div className="bg-surface rounded-[16px] border border-border shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-gold/10 flex items-center justify-center">
            <Settings size={20} className="text-gold" />
          </div>
          <h2 className="text-base font-semibold text-text">Systém</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-text-mid">Verze</span>
            <span className="font-medium">Build Fund CRM v3</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-text-mid">Prostředí</span>
            <span className="font-medium">
              {process.env.TURSO_DATABASE_URL ? "Produkce (Turso)" : "Vývoj (SQLite)"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-mid">Admin</span>
            <span className="font-medium">{session.firstName} {session.lastName}</span>
          </div>
        </div>
      </div>

      {/* Audit Log link */}
      <Link
        href="/settings/audit"
        className="flex items-center gap-4 p-4 bg-surface rounded-[16px] border border-border shadow-card hover:bg-surface-hover transition-colors group"
      >
        <div className="w-11 h-11 rounded-[12px] bg-gold/10 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">Audit Log</p>
          <p className="text-xs text-text-dim mt-0.5">
            Kompletní log všech akcí v systému
          </p>
        </div>
        <ChevronRight size={16} className="text-text-faint group-hover:text-text-mid transition-colors shrink-0" />
      </Link>
    </div>
  );
}
