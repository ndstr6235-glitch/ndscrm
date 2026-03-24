import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Settings, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function SettingsRoute() {
  const session = await getSession();
  if (!session) return null;

  // Admin only
  if (session.role !== "administrator") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">
          Nastavení
        </h1>
        <p className="mt-0.5 text-sm text-text-mid">
          Nastavení systému Build Fund CRM
        </p>
      </div>

      <div className="grid gap-3">
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
              Kompletni log vsech akci v systemu
            </p>
          </div>
          <ChevronRight size={16} className="text-text-faint group-hover:text-text-mid transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}
