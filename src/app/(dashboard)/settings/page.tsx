import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Settings } from "lucide-react";

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

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
          <Settings size={24} className="text-gold" />
        </div>
        <h3 className="font-display text-base font-semibold text-text mb-1">
          Nastavení systému
        </h3>
        <p className="text-sm text-text-dim max-w-xs">
          Tato stránka bude obsahovat nastavení systému, notifikací a
          integracích. Připravujeme pro další verzi.
        </p>
      </div>
    </div>
  );
}
